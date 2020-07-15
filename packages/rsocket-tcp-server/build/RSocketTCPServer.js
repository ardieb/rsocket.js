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

var _rsocketTcpClient = require('rsocket-tcp-client');

var _events = require('events');
var _events2 = _interopRequireDefault(_events);
var _net = require('net');
var _net2 = _interopRequireDefault(_net);
var _rsocketFlowable = require('rsocket-flowable');
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
                                                                                                                                                  * A TCP transport server.
                                                                                                                                                  */
class RSocketTCPServer {
  constructor(options, encoders) {
    this._emitter = new _events2.default();
    this._encoders = encoders;
    this._options = options;
  }

  start() {
    return new _rsocketFlowable.Flowable(subscriber => {
      let server;
      const onClose = () => {
        if (server) {
          server.close();
        }
        subscriber.onComplete();
      };
      const onError = error => subscriber.onError(error);
      const onConnection = socket => {
        subscriber.onNext(
          new _rsocketTcpClient.RSocketTcpConnection(socket, this._encoders)
        );
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
            const factory = this._options.serverFactory ||
              _net2.default.createServer;
            server = factory(onConnection);
            server.listen(this._options.port, this._options.host);
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
exports.default = RSocketTCPServer;
