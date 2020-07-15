/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * 
 */

'use strict';
Object.defineProperty(exports, '__esModule', {value: true});

var _events = require('events');
var _events2 = _interopRequireDefault(_events);
var _ws = require('ws');
var _ws2 = _interopRequireDefault(_ws);
var _invariant = require('fbjs/lib/invariant');
var _invariant2 = _interopRequireDefault(_invariant);
var _rsocketFlowable = require('rsocket-flowable');
var _Deferred = require('fbjs/lib/Deferred');
var _Deferred2 = _interopRequireDefault(_Deferred);
var _rsocketCore = require('rsocket-core');
var _rsocketTypes = require('rsocket-types');
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
                                                                                                                                            * A WebSocket transport server.
                                                                                                                                            */
class RSocketWebSocketServer {
  constructor(options, encoders, factory) {
    _initialiseProps.call(this);
    this._emitter = new _events2.default();
    this._encoders = encoders;
    this._options = options;
    if (factory) this._factory = factory;
  }

  start() {
    return new _rsocketFlowable.Flowable(subscriber => {
      let server;
      const onClose = () => {
        if (server) {
          server.stop();
        }
        subscriber.onComplete();
      };
      const onError = error => subscriber.onError(error);
      const onConnection = socket => {
        subscriber.onNext(new WSDuplexConnection(socket, this._encoders));
      };
      subscriber.onSubscribe({
        cancel: () => {
          if (!server) {
            return;
          }
          server.removeListener('connection', onConnection);
          server.removeListener('error', onError);
          this._emitter.removeListener('close', onClose);
          server.close();
          server = null;
        },
        request: n => {
          if (!server) {
            server = this._factory(this._options);
            server.on('connection', onConnection);
            server.on('error', onError);
            this._emitter.on('close', onClose);
          }
        },
      });
    });
  }

  stop() {
    this._emitter.emit('close');
  }
}
exports.default = RSocketWebSocketServer;

/**
                                               * @private
                                               */ var _initialiseProps = function() {
  this._factory = options => new _ws2.default.Server(options);
};
class WSDuplexConnection {
  constructor(socket, encoders) {
    this._active = true;
    this._close = new _Deferred2.default();
    this._encoders = encoders;
    this._socket = socket;
    this._statusSubscribers = new Set();

    if (socket) {
      this._status = _rsocketTypes.CONNECTION_STATUS.CONNECTED;
    } else {
      this._status = _rsocketTypes.CONNECTION_STATUS.NOT_CONNECTED;
    }

    // If _receiver has been `subscribe()`-ed already
    let isSubscribed = false;
    this._receiver = new _rsocketFlowable.Flowable(subscriber => {
      (0, _invariant2.default)(
        !isSubscribed,
        'RSocketWebSocketServer: Multicast receive() is not supported. Be sure ' +
          'to receive/subscribe only once.'
      );

      isSubscribed = true;

      // Whether `request()` has been called.
      let initialized = false;
      const closeSocket = () => {
        if (!initialized) {
          return;
        }
        this._socket.removeListener('close', onSocketClosed);
        this._socket.removeListener('error', onSocketError);
        this._socket.removeListener('message', onMessage);
        this._socket.close();
      };
      const onSocketClosed = () => {
        closeSocket();
        subscriber.onError(
          new Error('RSocketWebSocketServer: Socket closed unexpectedly.')
        );

        this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CLOSED);
      };
      const onSocketError = error => {
        closeSocket();
        subscriber.onError(error);
        const status = error
          ? {error, kind: 'ERROR'}
          : _rsocketTypes.CONNECTION_STATUS.CLOSED;
        this._setConnectionStatus(status);
      };
      const onMessage = data => {
        try {
          const frame = this._readFrame(data);
          subscriber.onNext(frame);
        } catch (error) {
          closeSocket();
          subscriber.onError(error);
        }
      };

      subscriber.onSubscribe({
        cancel: closeSocket,
        request: () => {
          if (initialized) {
            return;
          }
          initialized = true;
          this._socket.on('close', onSocketClosed);
          this._socket.on('error', onSocketError);
          this._socket.on('message', onMessage);
        },
      });
    });
  }

  connect() {
    throw new Error('not supported');
  }

  connectionStatus() {
    return new _rsocketFlowable.Flowable(subscriber => {
      subscriber.onSubscribe({
        cancel: () => {
          this._statusSubscribers.delete(subscriber);
        },
        request: () => {
          this._statusSubscribers.add(subscriber);
          subscriber.onNext(this._status);
        },
      });
    });
  }

  receive() {
    return this._receiver;
  }

  sendOne(frame) {
    this._writeFrame(frame);
  }

  send(frames) {
    frames.subscribe({
      onError: error => this._handleError(error),
      onNext: frame => this._writeFrame(frame),
      onSubscribe(subscription) {
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }

  close() {
    this._socket.emit('close');
    this._socket.close();
  }

  _readFrame(buffer) {
    return (0, _rsocketCore.deserializeFrame)(buffer, this._encoders);
  }

  _writeFrame(frame) {
    try {
      const buffer = (0, _rsocketCore.serializeFrame)(frame, this._encoders);
      this._socket.send(buffer);
    } catch (error) {
      this._handleError(error);
    }
  }

  _handleError(error) {
    this._socket.emit('error', error);
  }

  _setConnectionStatus(status) {
    this._status = status;
    this._statusSubscribers.forEach(subscriber => subscriber.onNext(status));
  }
}
