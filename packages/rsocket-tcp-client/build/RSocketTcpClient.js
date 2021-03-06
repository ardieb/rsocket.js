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
exports.RSocketTlsClient = (exports.RSocketTcpClient = (exports.RSocketTcpConnection = undefined));

var _net = require('net');
var _net2 = _interopRequireDefault(_net);
var _tls = require('tls');
var _tls2 = _interopRequireDefault(_tls);
var _rsocketFlowable = require('rsocket-flowable');
var _invariant = require('fbjs/lib/invariant');
var _invariant2 = _interopRequireDefault(_invariant);
var _rsocketCore = require('rsocket-core');

var _rsocketTypes = require('rsocket-types');
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
                                                                                                                                            * A TCP transport client for use in node environments.
                                                                                                                                            */
class RSocketTcpConnection {
  constructor(socket, encoders) {
    this._handleError = error => {
      error = error ||
        new Error('RSocketTcpClient: Socket closed unexpectedly.');
      this._close(error);
    };
    this._handleData = chunk => {
      try {
        const frames = this._readFrames(chunk);
        frames.forEach(frame => {
          this._receivers.forEach(subscriber => subscriber.onNext(frame));
        });
      } catch (error) {
        this._handleError(error);
      }
    };
    this._buffer = (0, _rsocketCore.createBuffer)(0);
    this._encoders = encoders;
    this._receivers = new Set();
    this._senders = new Set();
    this._statusSubscribers = new Set();
    if (socket) {
      this.setupSocket(socket);
      this._status = _rsocketTypes.CONNECTION_STATUS.CONNECTED;
    } else {
      this._socket = null;
      this._status = _rsocketTypes.CONNECTION_STATUS.NOT_CONNECTED;
    }
  }
  close() {
    this._close();
  }
  connect() {
    throw new Error('not supported');
  }
  setupSocket(socket) {
    this._socket = socket;
    socket.on('close', this._handleError);
    socket.on('end', this._handleError);
    socket.on('error', this._handleError);
    socket.on('data', this._handleData);
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
    return new _rsocketFlowable.Flowable(subject => {
      subject.onSubscribe({
        cancel: () => {
          this._receivers.delete(subject);
        },
        request: () => {
          this._receivers.add(subject);
        },
      });
    });
  }
  sendOne(frame) {
    this._writeFrame(frame);
  }
  send(frames) {
    let subscription;
    frames.subscribe({
      onComplete: () => {
        subscription && this._senders.delete(subscription);
      },
      onError: error => {
        subscription && this._senders.delete(subscription);
        this._handleError(error);
      },
      onNext: frame => this._writeFrame(frame),
      onSubscribe: _subscription => {
        subscription = _subscription;
        this._senders.add(subscription);
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }
  getConnectionState() {
    return this._status;
  }
  setConnectionStatus(status) {
    this._status = status;
    this._statusSubscribers.forEach(subscriber => subscriber.onNext(status));
  }
  _close(error) {
    if (this._status.kind === 'CLOSED' || this._status.kind === 'ERROR') {
      // already closed
      return;
    }
    const status = error
      ? {error, kind: 'ERROR'}
      : _rsocketTypes.CONNECTION_STATUS.CLOSED;
    this.setConnectionStatus(status);
    this._receivers.forEach(subscriber => {
      if (error) {
        subscriber.onError(error);
      } else {
        subscriber.onComplete();
      }
    });
    this._receivers.clear();
    this._senders.forEach(subscription => subscription.cancel());
    this._senders.clear();
    const socket = this._socket;
    if (socket) {
      socket.removeAllListeners();
      socket.end();
      this._socket = null;
    }
  }
  _readFrames(chunk) {
    // Combine partial frame data from previous chunks with the next chunk,
    // then extract any complete frames plus any remaining data.
    const buffer = Buffer.concat([this._buffer, chunk]);
    const [frames, remaining] = (0, _rsocketCore.deserializeFrames)(
      buffer,
      this._encoders
    );
    this._buffer = remaining;
    return frames;
  }

  _writeFrame(frame) {
    try {
      const buffer = (0, _rsocketCore.serializeFrameWithLength)(
        frame,
        this._encoders
      );
      (0, _invariant2.default)(
        this._socket,
        'RSocketTcpClient: Cannot send frame, not connected.'
      );

      this._socket.write(buffer);
    } catch (error) {
      this._handleError(error);
    }
  }
}
exports.RSocketTcpConnection = RSocketTcpConnection;

/**
                                                          * A TCP transport client for use in node environments.
                                                          */
class RSocketTcpClient extends RSocketTcpConnection {
  constructor(options, encoders) {
    super(null, encoders);
    this._handleOpened = () => {
      this.setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTED);
    };
    this._options = options;
  }
  connect() {
    (0, _invariant2.default)(
      this.getConnectionState().kind === 'NOT_CONNECTED',
      'RSocketTcpClient: Cannot connect(), a connection is already ' +
        'established.'
    );
    this.setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTING);
    const socket = _net2.default.connect(this._options);
    this.setupSocket(socket);
    socket.on('connect', this._handleOpened);
  }
}
exports.RSocketTcpClient = RSocketTcpClient;

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                   * A TLS transport client for use in node environments.
                                                                                                                                                                                                                                                                                                                                                                                                                                                   */
class RSocketTlsClient extends RSocketTcpConnection {
  constructor(options, encoders) {
    super(null, encoders);
    this._handleOpened = () => {
      this.setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTED);
    };
    this._options = options;
  }
  connect() {
    (0, _invariant2.default)(
      this.getConnectionState().kind === 'NOT_CONNECTED',
      'RSocketTlsClient: Cannot connect(), a connection is already ' +
        'established.'
    );
    this.setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTING);
    const socket = _tls2.default.connect(this._options);
    this.setupSocket(socket);
    socket.on('connect', this._handleOpened);
  }
}
exports.RSocketTlsClient = RSocketTlsClient;
