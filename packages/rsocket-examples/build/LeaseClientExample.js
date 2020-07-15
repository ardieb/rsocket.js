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

/* eslint-disable sort-keys */

'use strict';

var _rsocketCore = require('rsocket-core');
var _rsocketFlowable = require('rsocket-flowable');
var _rsocketTcpClient = require('rsocket-tcp-client');
var _rsocketTcpClient2 = _interopRequireDefault(_rsocketTcpClient);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const address = {host: 'localhost', port: 7000};

function make(data) {
  return {
    data,
    metadata: '',
  };
}

function logRequest(type, payload) {
  console.log(`Responder response to ${type}, data: ${payload.data || 'null'}`);
}

class EchoResponder {
  metadataPush(payload) {
    return _rsocketFlowable.Single.error(new Error('not implemented'));
  }

  fireAndForget(payload) {
    logRequest('fire-and-forget', payload);
  }

  requestResponse(payload) {
    logRequest('request-response', payload);
    return _rsocketFlowable.Single.of(make('client response'));
  }

  requestStream(payload) {
    logRequest('request-stream', payload);
    return _rsocketFlowable.Flowable.just(make('client stream response'));
  }

  requestChannel(payloads) {
    return _rsocketFlowable.Flowable.just(make('client channel response'));
  }
}

function getClientTransport(host, port) {
  return new _rsocketTcpClient2.default({
    host,
    port,
  });
}

const receivedLeasesLogger = lease =>
  lease.subscribe({
    onSubscribe: s => s.request(Number.MAX_SAFE_INTEGER),
    onNext: lease =>
      console.log(
        `Received lease - ttl: ${lease.timeToLiveMillis}, requests: ${lease.allowedRequests}`
      ),
  });

function periodicLeaseSender(intervalMillis, ttl, allowedRequests) {
  return (0, _rsocketFlowable.every)(intervalMillis).map(v => {
    console.log(`Sent lease - ttl: ${ttl}, requests: ${allowedRequests}`);
    return new _rsocketCore.Lease(ttl, allowedRequests);
  });
}

const client = new _rsocketCore.RSocketClient({
  setup: {
    dataMimeType: 'text/plain',
    keepAlive: 1000000,
    lifetime: 100000,
    metadataMimeType: 'text/plain',
  },

  responder: new EchoResponder(),
  leases: () =>
    new _rsocketCore.Leases()
      .receiver(receivedLeasesLogger)
      .sender(stats => periodicLeaseSender(10000, 7000, 10)),
  transport: getClientTransport(address.host, address.port),
});

client.connect().subscribe({
  onComplete: rSocket => {
    (0, _rsocketFlowable.every)(1000).subscribe({
      onNext: time => {
        console.log(`Requester availability: ${rSocket.availability()}`);
        rSocket
          .requestResponse({
            data: time.toString(),
            metadata: '',
          })
          .subscribe({
            onComplete: response => {
              const data = response.data;
              if (data) {
                console.log(`Requester response: ${data}`);
              }
            },
            onError: error => console.log(`Requester error: ${error.message}`),
          });
      },
      onSubscribe: subscription =>
        subscription.request(Number.MAX_SAFE_INTEGER),
    });

    console.log('RSocket completed');

    rSocket.connectionStatus().subscribe(status => {
      console.log('Connection status:', status);
    });
  },
  onError: error => console.log(`RSocket error: ${error.message}`),
});

setTimeout(() => {}, 360000);
