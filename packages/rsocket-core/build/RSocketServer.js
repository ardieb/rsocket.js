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

var _rsocketFlowable = require('rsocket-flowable');
var _invariant = require('fbjs/lib/invariant');
var _invariant2 = _interopRequireDefault(_invariant);
var _RSocketFrame = require('./RSocketFrame');

var _RSocketSerialization = require('./RSocketSerialization');
var _RSocketMachine = require('./RSocketMachine');
var _RSocketLease = require('./RSocketLease');
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
                                                                                                                                             * RSocketServer: A server in an RSocket connection that accepts connections
                                                                                                                                             * from peers via the given transport server.
                                                                                                                                             */
class RSocketServer {
  constructor(config) {
    this._handleTransportComplete = () => {
      this._handleTransportError(
        new Error('RSocketServer: Connection closed unexpectedly.')
      );
    };
    this._handleTransportError = error => {
      this._connections.forEach(connection => {
        // TODO: Allow passing in error
        connection.close();
      });
    };
    this._handleTransportConnection = connection => {
      const swapper = new SubscriberSwapper();
      let subscription;
      connection.receive().subscribe(
        swapper.swap({
          onError: error => console.error(error),
          onNext: frame => {
            switch (frame.type) {
              case _RSocketFrame.FRAME_TYPES.RESUME:
                connection.sendOne({
                  code: _RSocketFrame.ERROR_CODES.REJECTED_RESUME,
                  flags: 0,
                  message: 'RSocketServer: RESUME not supported.',
                  streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                  type: _RSocketFrame.FRAME_TYPES.ERROR,
                });

                connection.close();
                break;
              case _RSocketFrame.FRAME_TYPES.SETUP:
                if (this._setupLeaseError(frame)) {
                  connection.sendOne({
                    code: _RSocketFrame.ERROR_CODES.INVALID_SETUP,
                    flags: 0,
                    message: 'RSocketServer: LEASE not supported.',
                    streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                    type: _RSocketFrame.FRAME_TYPES.ERROR,
                  });

                  connection.close();
                  break;
                }
                const serializers = this._getSerializers();

                let requesterLeaseHandler;
                let responderLeaseHandler;

                const leasesSupplier = this._config.leases;
                if (leasesSupplier) {
                  const lease = leasesSupplier();
                  requesterLeaseHandler = new _RSocketLease.RequesterLeaseHandler(
                    lease._receiver
                  );

                  responderLeaseHandler = new _RSocketLease.ResponderLeaseHandler(
                    lease._sender,
                    lease._stats
                  );
                }
                const serverMachine = (0, _RSocketMachine.createServerMachine)(
                  connection,
                  subscriber => {
                    swapper.swap(subscriber);
                  },
                  frame.lifetime,
                  serializers,
                  this._config.errorHandler,
                  requesterLeaseHandler,
                  responderLeaseHandler
                );

                try {
                  const requestHandler = this._config.getRequestHandler(
                    serverMachine,
                    deserializePayload(serializers, frame)
                  );

                  serverMachine.setRequestHandler(requestHandler);
                  this._connections.add(serverMachine);
                } catch (error) {
                  connection.sendOne({
                    code: _RSocketFrame.ERROR_CODES.REJECTED_SETUP,
                    flags: 0,
                    message: 'Application rejected setup, reason: ' +
                      error.message,
                    streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                    type: _RSocketFrame.FRAME_TYPES.ERROR,
                  });

                  connection.close();
                }

                // TODO(blom): We should subscribe to connection status
                // so we can remove the connection when it goes away
                break;
              default:
                (0, _invariant2.default)(
                  false,
                  'RSocketServer: Expected first frame to be SETUP or RESUME, ' +
                    'got `%s`.',
                  (0, _RSocketFrame.getFrameTypeName)(frame.type)
                );
            }
          },
          onSubscribe: _subscription => {
            subscription = _subscription;
            subscription.request(1);
          },
        })
      );
    };
    this._config = config;
    this._connections = new Set();
    this._started = false;
    this._subscription = null;
  }
  start() {
    (0, _invariant2.default)(
      !this._started,
      'RSocketServer: Unexpected call to start(), already started.'
    );
    this._started = true;
    this._config.transport.start().subscribe({
      onComplete: this._handleTransportComplete,
      onError: this._handleTransportError,
      onNext: this._handleTransportConnection,
      onSubscribe: subscription => {
        this._subscription = subscription;
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }
  stop() {
    if (this._subscription) {
      this._subscription.cancel();
    }
    this._config.transport.stop();
    this._handleTransportError(
      new Error('RSocketServer: Connection terminated via stop().')
    );
  }

  _getSerializers() {
    return this._config.serializers ||
      _RSocketSerialization.IdentitySerializers;
  }

  _setupLeaseError(frame) {
    const clientLeaseEnabled = (frame.flags & _RSocketFrame.FLAGS.LEASE) ===
      _RSocketFrame.FLAGS.LEASE;
    const serverLeaseEnabled = this._config.leases;
    return clientLeaseEnabled && !serverLeaseEnabled;
  }
}
exports.default = RSocketServer;

class SubscriberSwapper {
  constructor(target) {
    this._target = target;
  }

  swap(next) {
    this._target = next;
    if (this._subscription) {
      this._target.onSubscribe && this._target.onSubscribe(this._subscription);
    }
    return this;
  }

  onComplete() {
    (0, _invariant2.default)(this._target, 'must have target');
    this._target.onComplete && this._target.onComplete();
  }
  onError(error) {
    (0, _invariant2.default)(this._target, 'must have target');
    this._target.onError && this._target.onError(error);
  }
  onNext(value) {
    (0, _invariant2.default)(this._target, 'must have target');
    this._target.onNext && this._target.onNext(value);
  }
  onSubscribe(subscription) {
    (0, _invariant2.default)(this._target, 'must have target');
    this._subscription = subscription;
    this._target.onSubscribe && this._target.onSubscribe(subscription);
  }
}

function deserializePayload(serializers, frame) {
  return {
    data: serializers.data.deserialize(frame.data),
    metadata: serializers.metadata.deserialize(frame.metadata),
  };
}
