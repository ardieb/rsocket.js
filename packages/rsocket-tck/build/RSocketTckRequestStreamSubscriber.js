'use strict';
Object.defineProperty(exports, '__esModule', {value: true});

var _Deferred = require('fbjs/lib/Deferred');
var _Deferred2 = _interopRequireDefault(_Deferred);

var _nullthrows = require('fbjs/lib/nullthrows');
var _nullthrows2 = _interopRequireDefault(_nullthrows);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
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
                                                                                                                                                                                                       */ class RSocketTckRequestStreamSubscriber {
  constructor(log) {
    this._cancelled = false;
    this._completeDefer = new _Deferred2.default();
    this._completed = false;
    this._errorDefer = new _Deferred2.default();
    this._errored = false;
    this._log = log;
    this._payloadCount = null;
    this._payloadDefer = null;
    this._payloads = [];
    this._subscription = null;
  }

  awaitN(n) {
    this._payloadCount = n;
    this._payloadDefer = new _Deferred2.default();
    return this._payloadDefer.getPromise();
  }

  awaitTerminal() {
    return Promise.race([
      this._completeDefer.getPromise(),
      this._errorDefer.getPromise(),
    ]);
  }

  getPayloads() {
    return this._payloads;
  }

  isCanceled() {
    return this._cancelled;
  }

  isCompleted() {
    return this._completed;
  }

  hasError() {
    return this._errored;
  }

  isSubscribed() {
    return this._subscription != null;
  }

  cancel() {
    this._cancelled = true;
    (0, _nullthrows2.default)(this._subscription).cancel();
  }

  request(n) {
    (0, _nullthrows2.default)(this._subscription).request(n);
  }

  onComplete() {
    this._log('onComplete');
    this._completed = true;
    this._completeDefer.resolve();
    this._errorDefer.reject(new Error('onComplete was called unexpectedly.'));
  }

  onError(error) {
    this._log('onError: %s', error.message);
    this._errored = true;
    this._errorDefer.resolve();
    this._completeDefer.reject(new Error('onError was called unexpectedly.'));
  }

  onNext(payload) {
    this._log('onNext: %s', JSON.stringify(payload));
    this._payloads.push(payload);
    if (this._payloadCount != null && this._payloadDefer != null) {
      this._payloadCount--;
      if (this._payloadCount === 0) {
        this._payloadDefer.resolve();
      }
    }
  }

  onSubscribe(subscription) {
    this._log('onSubscribe');
    this._subscription = subscription;
  }
}
exports.default = RSocketTckRequestStreamSubscriber;
