'use strict';

var _rsocketCore = require('rsocket-core');

var _rsocketWebsocketClient = require('rsocket-websocket-client');
var _rsocketWebsocketClient2 = _interopRequireDefault(_rsocketWebsocketClient);
var _ws = require('ws');
var _ws2 = _interopRequireDefault(_ws);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const maxRSocketRequestN = 2147483647;
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
                                        */ /* eslint-disable sort-keys */ const host = '127.0.0.1';
const port = 7000;
const keepAlive = 60000;
const lifetime = 180000;
const dataMimeType = 'application/octet-stream';
const metadataMimeType = _rsocketCore.MESSAGE_RSOCKET_COMPOSITE_METADATA.string;
const route = 'test.service';
const client = new _rsocketCore.RSocketClient({
  setup: {keepAlive, lifetime, dataMimeType, metadataMimeType},
  transport: new _rsocketWebsocketClient2.default(
    {wsCreator: () => new _ws2.default('ws://localhost:7000'), debug: true},
    _rsocketCore.BufferEncoders
  ),
});

// Open the connection
client.connect().then(socket => {
  socket
    .requestStream({
      data: new Buffer('request-stream'),
      metadata: (0, _rsocketCore.encodeAndAddWellKnownMetadata)(
        (0, _rsocketCore.encodeAndAddCustomMetadata)(
          Buffer.alloc(0),
          _rsocketCore.TEXT_PLAIN.string,
          Buffer.from('Hello World')
        ),
        _rsocketCore.MESSAGE_RSOCKET_ROUTING,
        Buffer.from(String.fromCharCode(route.length) + route)
      ),
    })
    .subscribe({
      onComplete: () => console.log('Request-stream completed'),
      onError: error => console.error(`Request-stream error:${error.message}`),
      onNext: value => console.log('%s', value.data),
      onSubscribe: sub => sub.request(maxRSocketRequestN),
    });
});
setTimeout(() => {}, 30000000);
