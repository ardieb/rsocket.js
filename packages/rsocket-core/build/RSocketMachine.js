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
exports.createServerMachine = createServerMachine;
exports.createClientMachine = createClientMachine;
var _rsocketFlowable = require('rsocket-flowable');
var _emptyFunction = require('fbjs/lib/emptyFunction');
var _emptyFunction2 = _interopRequireDefault(_emptyFunction);
var _invariant = require('fbjs/lib/invariant');
var _invariant2 = _interopRequireDefault(_invariant);
var _warning = require('fbjs/lib/warning');
var _warning2 = _interopRequireDefault(_warning);
var _RSocketFrame = require('./RSocketFrame');
var _RSocketSerialization = require('./RSocketSerialization');
var _RSocketLease = require('./RSocketLease');
var _RSocketBufferUtils = require('./RSocketBufferUtils');
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
const kMAX_FRAME_LENGTH = 0x7ffffff;
class ResponderWrapper {
  constructor(responder) {
    this._responder = responder || {};
  }
  setResponder(responder) {
    this._responder = responder || {};
  }
  fireAndForget(payload) {
    if (this._responder.fireAndForget) {
      try {
        this._responder.fireAndForget(payload);
      } catch (error) {
        console.error('fireAndForget threw an exception', error);
      }
    }
  }
  requestResponse(payload) {
    let error;
    if (this._responder.requestResponse) {
      try {
        return this._responder.requestResponse(payload);
      } catch (_error) {
        console.error('requestResponse threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Single.error(error || new Error('not implemented'));
  }
  requestStream(payload) {
    let error;
    if (this._responder.requestStream) {
      try {
        return this._responder.requestStream(payload);
      } catch (_error) {
        console.error('requestStream threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Flowable.error(
      error || new Error('not implemented')
    );
  }
  requestChannel(payloads) {
    let error;
    if (this._responder.requestChannel) {
      try {
        return this._responder.requestChannel(payloads);
      } catch (_error) {
        console.error('requestChannel threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Flowable.error(
      error || new Error('not implemented')
    );
  }
  metadataPush(payload) {
    let error;
    if (this._responder.metadataPush) {
      try {
        return this._responder.metadataPush(payload);
      } catch (_error) {
        console.error('metadataPush threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Single.error(error || new Error('not implemented'));
  }
}
function createServerMachine(
  connection,
  connectionPublisher,
  keepAliveTimeout,
  serializers,
  errorHandler,
  requesterLeaseHandler,
  responderLeaseHandler
) {
  return new RSocketMachineImpl(
    'SERVER',
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    undefined,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  );
}
function createClientMachine(
  connection,
  connectionPublisher,
  keepAliveTimeout,
  serializers,
  requestHandler,
  errorHandler,
  requesterLeaseHandler,
  responderLeaseHandler
) {
  return new RSocketMachineImpl(
    'CLIENT',
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    requestHandler,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  );
}

class RSocketMachineImpl {
  constructor(
    role,
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    requestHandler,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  ) {
    this._connectionAvailability = 1.0;
    this._handleTransportClose = () => {
      this._handleError(new Error('RSocket: The connection was closed.'));
    };
    this._handleError = error => {
      // Error any open request streams
      this._receivers.forEach(receiver => {
        receiver.onError(error);
      });
      this._receivers.clear();
      // Cancel any active subscriptions
      this._subscriptions.forEach(subscription => {
        subscription.cancel();
      });
      this._subscriptions.clear();
      this._receiverBuffers.clear();
      this._connectionAvailability = 0.0;
      this._dispose(
        this._requesterLeaseHandler,
        this._responderLeaseSenderDisposable
      );

      const handle = this._keepAliveTimerHandle;
      if (handle) {
        clearTimeout(handle);
        this._keepAliveTimerHandle = null;
      }
    };
    this._handleFrame = frame => {
      const {streamId} = frame;
      if (streamId === _RSocketFrame.CONNECTION_STREAM_ID) {
        this._handleConnectionFrame(frame);
      } else {
        this._handleStreamFrame(streamId, frame);
      }
    };
    this._connection = connection;
    this._requesterLeaseHandler = requesterLeaseHandler;
    this._responderLeaseHandler = responderLeaseHandler;
    this._nextStreamId = role === 'CLIENT' ? 1 : 2;
    this._receivers = new Map();
    this._subscriptions = new Map();
    this._receiverBuffers = new Map();
    this._serializers = serializers ||
      _RSocketSerialization.IdentitySerializers;
    this._requestHandler = new ResponderWrapper(requestHandler);
    this._errorHandler = errorHandler; // Subscribe to completion/errors before sending anything
    connectionPublisher({
      onComplete: this._handleTransportClose,
      onError: this._handleError,
      onNext: this._handleFrame,
      onSubscribe: subscription =>
        subscription.request(Number.MAX_SAFE_INTEGER),
    });
    const responderHandler = this._responderLeaseHandler;
    if (responderHandler) {
      this._responderLeaseSenderDisposable = responderHandler.send(
        this._leaseFrameSender()
      );
    } // Cleanup when the connection closes
    this._connection.connectionStatus().subscribe({
      onNext: status => {
        if (status.kind === 'CLOSED') {
          this._handleTransportClose();
        } else if (status.kind === 'ERROR') {
          this._handleError(status.error);
        }
      },
      onSubscribe: subscription =>
        subscription.request(Number.MAX_SAFE_INTEGER),
    });
    const MIN_TICK_DURATION = 100;
    this._keepAliveLastReceivedMillis = Date.now();
    const keepAliveHandler = () => {
      const now = Date.now();
      const noKeepAliveDuration = now - this._keepAliveLastReceivedMillis;
      if (noKeepAliveDuration >= keepAliveTimeout) {
        this._handleConnectionError(
          new Error(`No keep-alive acks for ${keepAliveTimeout} millis`)
        );
      } else {
        this._keepAliveTimerHandle = setTimeout(
          keepAliveHandler,
          Math.max(MIN_TICK_DURATION, keepAliveTimeout - noKeepAliveDuration)
        );
      }
    };
    this._keepAliveTimerHandle = setTimeout(keepAliveHandler, keepAliveTimeout);
  }
  setRequestHandler(requestHandler) {
    this._requestHandler.setResponder(requestHandler);
  }
  close() {
    this._connection.close();
  }
  connectionStatus() {
    return this._connection.connectionStatus();
  }
  availability() {
    const r = this._requesterLeaseHandler;
    const requesterAvailability = r ? r.availability() : 1.0;
    return Math.min(this._connectionAvailability, requesterAvailability);
  }
  fireAndForget(payload) {
    if (this._useLeaseOrError(this._requesterLeaseHandler)) {
      return;
    }
    const streamId = this._getNextStreamId(this._receivers);
    const data = this._serializers.data.serialize(payload.data);
    const metadata = this._serializers.metadata.serialize(payload.metadata);
    const frame = {
      data,
      flags: payload.metadata !== undefined ? _RSocketFrame.FLAGS.METADATA : 0,
      metadata,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.REQUEST_FNF,
    };
    this._connection.sendOne(frame);
  }
  requestResponse(payload) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Single.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    return new _rsocketFlowable.Single(subscriber => {
      this._receivers.set(streamId, {
        onComplete: _emptyFunction2.default,
        onError: error => subscriber.onError(error),
        onNext: data => subscriber.onComplete(data),
      });
      const data = this._serializers.data.serialize(payload.data);
      const metadata = this._serializers.metadata.serialize(payload.metadata);
      const frame = {
        data,
        flags: payload.metadata !== undefined
          ? _RSocketFrame.FLAGS.METADATA
          : 0,
        metadata,
        streamId,
        type: _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE,
      };
      this._connection.sendOne(frame);
      subscriber.onSubscribe(() => {
        this._receivers.delete(streamId);
        const cancelFrame = {
          flags: 0,
          streamId,
          type: _RSocketFrame.FRAME_TYPES.CANCEL,
        };
        this._connection.sendOne(cancelFrame);
      });
    });
  }
  requestStream(payload) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Flowable.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    return new _rsocketFlowable.Flowable(
      subscriber => {
        this._receivers.set(streamId, subscriber);
        let initialized = false;
        subscriber.onSubscribe({
          cancel: () => {
            this._receivers.delete(streamId);
            if (!initialized) {
              return;
            }
            const cancelFrame = {
              flags: 0,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.CANCEL,
            };
            this._connection.sendOne(cancelFrame);
          },
          request: n => {
            if (n > _RSocketFrame.MAX_REQUEST_N) {
              n = _RSocketFrame.MAX_REQUEST_N;
            }
            if (initialized) {
              const requestNFrame = {
                flags: 0,
                requestN: n,
                streamId,
                type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
              };
              this._connection.sendOne(requestNFrame);
            } else {
              initialized = true;
              const data = this._serializers.data.serialize(payload.data);
              const metadata = this._serializers.metadata.serialize(
                payload.metadata
              );
              const requestStreamFrame = {
                data,
                flags: payload.metadata !== undefined
                  ? _RSocketFrame.FLAGS.METADATA
                  : 0,
                metadata,
                requestN: n,
                streamId,
                type: _RSocketFrame.FRAME_TYPES.REQUEST_STREAM,
              };
              this._connection.sendOne(requestStreamFrame);
            }
          },
        });
      },
      _RSocketFrame.MAX_REQUEST_N
    );
  }
  requestChannel(payloads) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Flowable.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    let payloadsSubscribed = false;
    return new _rsocketFlowable.Flowable(
      subscriber => {
        try {
          this._receivers.set(streamId, subscriber);
          let initialized = false;
          subscriber.onSubscribe({
            cancel: () => {
              this._receivers.delete(streamId);
              if (!initialized) {
                return;
              }
              const cancelFrame = {
                flags: 0,
                streamId,
                type: _RSocketFrame.FRAME_TYPES.CANCEL,
              };
              this._connection.sendOne(cancelFrame);
            },
            request: n => {
              if (n > _RSocketFrame.MAX_REQUEST_N) {
                n = _RSocketFrame.MAX_REQUEST_N;
              }
              if (initialized) {
                const requestNFrame = {
                  flags: 0,
                  requestN: n,
                  streamId,
                  type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
                };
                this._connection.sendOne(requestNFrame);
              } else {
                if (!payloadsSubscribed) {
                  payloadsSubscribed = true;
                  payloads.subscribe({
                    onComplete: () => {
                      this._sendStreamComplete(streamId);
                    },
                    onError: error => {
                      this._sendStreamError(streamId, error.message);
                    }, //Subscriber methods
                    onNext: payload => {
                      const data = this._serializers.data.serialize(
                        payload.data
                      );
                      const metadata = this._serializers.metadata.serialize(
                        payload.metadata
                      );
                      if (!initialized) {
                        initialized = true;
                        const requestChannelFrame = {
                          data,
                          flags: payload.metadata !== undefined
                            ? _RSocketFrame.FLAGS.METADATA
                            : 0,
                          metadata,
                          requestN: n,
                          streamId,
                          type: _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL,
                        };
                        this._connection.sendOne(requestChannelFrame);
                      } else {
                        const payloadFrame = {
                          data,
                          flags: _RSocketFrame.FLAGS.NEXT |
                            (payload.metadata !== undefined
                              ? _RSocketFrame.FLAGS.METADATA
                              : 0),
                          metadata,
                          streamId,
                          type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
                        };
                        this._connection.sendOne(payloadFrame);
                      }
                    },
                    onSubscribe: subscription => {
                      this._subscriptions.set(streamId, subscription);
                      subscription.request(1);
                    },
                  });
                } else {
                  (0, _warning2.default)(
                    false,
                    'RSocketClient: re-entrant call to request n before initial' +
                      ' channel established.'
                  );
                }
              }
            },
          });
        } catch (err) {
          console.warn(
            'Exception while subscribing to channel flowable:' + err
          );
        }
      },
      _RSocketFrame.MAX_REQUEST_N
    );
  }
  metadataPush(payload) {
    // TODO #18065331: implement metadataPush
    throw new Error('metadataPush() is not implemented');
  }
  _getNextStreamId(streamIds) {
    const streamId = this._nextStreamId;
    do {
      this._nextStreamId = this._nextStreamId + 2 & _RSocketFrame.MAX_STREAM_ID;
    } while (this._nextStreamId === 0 || streamIds.has(streamId));
    return streamId;
  }
  _useLeaseOrError(leaseHandler) {
    if (leaseHandler) {
      if (!leaseHandler.use()) {
        return leaseHandler.errorMessage();
      }
    }
  }
  _leaseFrameSender() {
    return lease =>
      this._connection.sendOne({
        flags: 0,
        metadata: lease.metadata,
        requestCount: lease.allowedRequests,
        streamId: _RSocketFrame.CONNECTION_STREAM_ID,
        ttl: lease.timeToLiveMillis,
        type: _RSocketFrame.FRAME_TYPES.LEASE,
      });
  }
  _dispose(...disposables) {
    disposables.forEach(d => {
      if (d) {
        d.dispose();
      }
    });
  }
  _isRequest(frameType) {
    switch (frameType) {
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
        return true;
      default:
        return false;
    }
  }
  /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Handle the connection closing normally: this is an error for any open streams.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Handle the transport connection closing abnormally or a connection-level protocol error.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */ _handleConnectionError(
    error
  ) {
    this._handleError(error);
    this._connection.close();
    const errorHandler = this._errorHandler;
    if (errorHandler) {
      errorHandler(error);
    }
  }
  /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Handle a frame received from the transport client.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Handle connection frames (stream id === 0).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */ _handleConnectionFrame(
    frame
  ) {
    switch (frame.type) {
      case _RSocketFrame.FRAME_TYPES.ERROR:
        const error = (0, _RSocketFrame.createErrorFromFrame)(frame);
        this._handleConnectionError(error);
        break;
      case _RSocketFrame.FRAME_TYPES.EXT: // Extensions are not supported
        break;
      case _RSocketFrame.FRAME_TYPES.KEEPALIVE:
        this._keepAliveLastReceivedMillis = Date.now();
        if ((0, _RSocketFrame.isRespond)(frame.flags)) {
          this._connection.sendOne(
            Object.assign({}, frame, {
              flags: frame.flags ^ _RSocketFrame.FLAGS.RESPOND, // eslint-disable-line no-bitwise
              lastReceivedPosition: 0,
            })
          );
        }
        break;
      case _RSocketFrame.FRAME_TYPES.LEASE:
        const r = this._requesterLeaseHandler;
        if (r) {
          r.receive(frame);
        }
        break;
      case _RSocketFrame.FRAME_TYPES.METADATA_PUSH:
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
        // TODO #18064706: handle requests from server
        break;
      case _RSocketFrame.FRAME_TYPES.RESERVED:
        // No-op
        break;
      case _RSocketFrame.FRAME_TYPES.RESUME:
      case _RSocketFrame.FRAME_TYPES.RESUME_OK:
        // TODO #18065016: support resumption
        break;
      default:
        if (false) {
          console.log(
            'RSocketClient: Unsupported frame type `%s` on stream `%s`.',
            (0, _RSocketFrame.getFrameTypeName)(frame.type),
            _RSocketFrame.CONNECTION_STREAM_ID
          );
        }
        break;
    }
  }

  /**
     * Handle stream-specific frames (stream id !== 0).
     */
  _handleStreamFrame(streamId, frame) {
    if (this._isRequest(frame.type)) {
      const leaseError = this._useLeaseOrError(this._responderLeaseHandler);
      if (leaseError) {
        this._sendStreamError(streamId, leaseError);
        return;
      }
    }

    switch (frame.type) {
      case _RSocketFrame.FRAME_TYPES.CANCEL:
        this._handleCancel(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_N:
        this._handleRequestN(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
        frame = this._bufferOrOutput(streamId, frame);
        this._handleFireAndForget(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
        this._handleRequestResponse(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
        this._handleRequestStream(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
        this._handleRequestChannel(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.ERROR:
        const error = (0, _RSocketFrame.createErrorFromFrame)(frame);
        this._handleStreamError(streamId, error);
        break;
      case _RSocketFrame.FRAME_TYPES.PAYLOAD:
        this._handlePayload(streamId, frame);
        break;
      default:
        if (false) {
          console.log(
            'RSocketClient: Unsupported frame type `%s` on stream `%s`.',
            (0, _RSocketFrame.getFrameTypeName)(frame.type),
            streamId
          );
        }
        break;
    }
  }

  _handleCancel(streamId, frame) {
    const subscription = this._subscriptions.get(streamId);
    if (subscription) {
      subscription.cancel();
      this._subscriptions.delete(streamId);
    }
    const buf = this._receiverBuffers.get(streamId);
    if (buf) {
      this._receiverBuffers.delete(streamId);
    }
  }

  _handleRequestN(streamId, frame) {
    const subscription = this._subscriptions.get(streamId);
    if (subscription) {
      subscription.request(frame.requestN);
    }
  }

  _handlePayload(streamId, frame) {
    let buf = this._receiverBuffers.get(streamId);

    if ((0, _RSocketFrame.isFollows)(frame.flags) && !check(buf)) {
      this._receiverBuffers.set(streamId, {
        frame: frame,
        data: check(frame.data) ? [frame.data.slice(0)] : [],
        metadata: check(frame.metadata) ? [frame.metadata.slice(0)] : [],
      });

      return;
    }

    if (check(buf)) {
      if (check(frame.data)) {
        buf.data.push(frame.data.slice(0));
      }
      if (check(frame.metadata)) {
        buf.metadata.push(frame.metadata.slice(0));
      }
      if ((0, _RSocketFrame.isFollows)(frame.flags)) {
        return; // Early return if more fragments are to come
      }
      let newFrame = (0, _RSocketFrame.isMetadata)(buf.frame.flags)
        ? Object.assign({}, buf.frame, {
            data: (0, _RSocketBufferUtils.concat)(buf.data),
            metadata: (0, _RSocketBufferUtils.concat)(buf.metadata),
          })
        : Object.assign({}, buf.frame, {
            data: (0, _RSocketBufferUtils.concat)(buf.data),
          });
      newFrame.flags ^= _RSocketFrame.FLAGS.FOLLOWS;
      this._receiverBuffers.delete(streamId);
      this._handleStreamFrame(streamId, newFrame);
      return;
    }

    const receiver = this._receivers.get(streamId);
    if (receiver != null) {
      if ((0, _RSocketFrame.isNext)(frame.flags)) {
        const payload = {
          data: this._serializers.data.deserialize(frame.data),
          metadata: this._serializers.metadata.deserialize(frame.metadata),
        };

        receiver.onNext(payload);
      }
      if ((0, _RSocketFrame.isComplete)(frame.flags)) {
        this._receivers.delete(streamId);
        receiver.onComplete();
      }
    }
  }

  _handleFireAndForget(streamId, frame) {
    if ((0, _RSocketFrame.isFollows)(frame.flags)) {
      this._receiverBuffers.set(streamId, {
        frame: frame,
        data: check(frame.data) ? [frame.data.slice(0)] : [],
        metadata: check(frame.metadata) ? [frame.metadata.slice(0)] : [],
      });

      return;
    }
    const payload = this._deserializePayload(frame);
    this._requestHandler.fireAndForget(payload);
  }

  _handleRequestResponse(streamId, frame) {
    if ((0, _RSocketFrame.isFollows)(frame.flags)) {
      this._receiverBuffers.set(streamId, {
        frame: frame,
        data: check(frame.data) ? [frame.data.slice(0)] : [],
        metadata: check(frame.metadata) ? [frame.metadata.slice(0)] : [],
      });

      return;
    }
    const payload = this._deserializePayload(frame);
    this._requestHandler.requestResponse(payload).subscribe({
      onComplete: payload => {
        this._sendStreamPayload(streamId, payload, true);
      },
      onError: error => this._sendStreamError(streamId, error.message),
      onSubscribe: cancel => {
        const subscription = {
          cancel,
          request: _emptyFunction2.default,
        };

        this._subscriptions.set(streamId, subscription);
      },
    });
  }

  _handleRequestStream(streamId, frame) {
    if ((0, _RSocketFrame.isFollows)(frame.flags)) {
      this._receiverBuffers.set(streamId, {
        frame: frame,
        data: check(frame.data) ? [frame.data.slice(0)] : [],
        metadata: check(frame.metadata) ? [frame.metadata.slice(0)] : [],
      });

      return;
    }
    const payload = this._deserializePayload(frame);
    this._requestHandler.requestStream(payload).subscribe({
      onComplete: () => this._sendStreamComplete(streamId),
      onError: error => this._sendStreamError(streamId, error.message),
      onNext: payload => this._sendStreamPayload(streamId, payload),
      onSubscribe: subscription => {
        this._subscriptions.set(streamId, subscription);
        subscription.request(frame.requestN);
      },
    });
  }

  _handleRequestChannel(streamId, frame) {
    if ((0, _RSocketFrame.isFollows)(frame.flags)) {
      this._receiverBuffers.set(streamId, {
        frame: frame,
        data: check(frame.data) ? [frame.data.slice(0)] : [],
        metadata: check(frame.metadata) ? [frame.metadata.slice(0)] : [],
      });

      return;
    }
    const existingSubscription = this._subscriptions.get(streamId);
    if (existingSubscription) {
      //Likely a duplicate REQUEST_CHANNEL frame, ignore per spec
      return;
    }

    const payloads = new _rsocketFlowable.Flowable(
      subscriber => {
        let firstRequest = true;

        subscriber.onSubscribe({
          cancel: () => {
            this._receivers.delete(streamId);
            const cancelFrame = {
              flags: 0,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.CANCEL,
            };

            this._connection.sendOne(cancelFrame);
          },
          request: n => {
            if (n > _RSocketFrame.MAX_REQUEST_N) {
              n = _RSocketFrame.MAX_REQUEST_N;
            }
            if (firstRequest) {
              n--;
            }

            if (n > 0) {
              const requestNFrame = {
                flags: 0,
                requestN: n,
                streamId,
                type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
              };

              this._connection.sendOne(requestNFrame);
            }
            //critically, if n is 0 now, that's okay because we eagerly decremented it
            if (firstRequest && n >= 0) {
              firstRequest = false;
              //release the initial frame we received in frame form due to map operator
              subscriber.onNext(frame);
            }
          },
        });
      },
      _RSocketFrame.MAX_REQUEST_N
    );

    const framesToPayloads = new _rsocketFlowable.FlowableProcessor(
      payloads,
      frame => this._deserializePayload(frame)
    );
    this._receivers.set(streamId, framesToPayloads);

    this._requestHandler.requestChannel(framesToPayloads).subscribe({
      onComplete: () => this._sendStreamComplete(streamId),
      onError: error => this._sendStreamError(streamId, error.message),
      onNext: payload => this._sendStreamPayload(streamId, payload),
      onSubscribe: subscription => {
        this._subscriptions.set(streamId, subscription);
        subscription.request(frame.requestN);
      },
    });
  }

  _sendStreamComplete(streamId) {
    this._subscriptions.delete(streamId);
    this._connection.sendOne({
      data: null,
      flags: _RSocketFrame.FLAGS.COMPLETE,
      metadata: null,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
    });
  }

  _sendStreamError(streamId, errorMessage) {
    this._subscriptions.delete(streamId);
    this._connection.sendOne({
      code: _RSocketFrame.ERROR_CODES.APPLICATION_ERROR,
      flags: 0,
      message: errorMessage,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.ERROR,
    });
  }

  _sendStreamPayload(streamId, payload, complete = false) {
    let flags = _RSocketFrame.FLAGS.NEXT;
    if (complete) {
      // eslint-disable-next-line no-bitwise
      flags |= _RSocketFrame.FLAGS.COMPLETE;
      this._subscriptions.delete(streamId);
    }
    const data = this._serializers.data.serialize(payload.data);
    const metadata = this._serializers.metadata.serialize(payload.metadata);
    this._connection.sendOne({
      data,
      flags,
      metadata,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
    });
  }

  _deserializePayload(frame) {
    return deserializePayload(this._serializers, frame);
  }

  /**
     * Handle an error specific to a stream.
     */
  _handleStreamError(streamId, error) {
    const receiver = this._receivers.get(streamId);
    if (receiver != null) {
      this._receivers.delete(streamId);
      receiver.onError(error);
    }
  }
}

function deserializePayload(serializers, frame) {
  return {
    data: serializers.data.deserialize(frame.data),
    metadata: serializers.metadata.deserialize(frame.metadata),
  };
}

function check(arg) {
  return typeof arg !== 'undefined' && arg !== null;
}
