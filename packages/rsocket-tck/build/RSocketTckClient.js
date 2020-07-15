'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
let run = (() => {
  var _ref = _asyncToGenerator(function*(options) {
    const testfilePath = _path2.default.resolve(
      process.cwd(),
      options.testfile
    );
    if (!_fs2.default.existsSync(testfilePath)) {
      throw new Error(
        `--testfile ${options.testfile}: file does does not exist (${testfilePath}).`
      );
    }
    process.stdout.write(_chalk2.default.inverse('Running TCK tests') + '\n');
    process.stdout.write(
      (0, _sprintf2.default)('Using testfile %s', testfilePath) + '\n'
    );
    process.stdout.write(
      (0, _sprintf2.default)(
        'Connecting to server at %s:%s',
        options.host,
        options.port
      ) + '\n'
    );

    const testSource = _fs2.default.readFileSync(testfilePath, 'utf8');
    const testCases = testSource.split('!').filter(function(item) {
      return item.trim().length > 0;
    });

    const socket = yield connect(options);

    function assert(cond, msg, ...rest) {
      if (!cond) {
        throw new Error((0, _sprintf2.default)(msg, ...rest));
      }
    }
    function log(msg, ...rest) {
      if (options.verbose) {
        process.stdout.write(
          _chalk2.default.dim((0, _sprintf2.default)(msg, ...rest)) + '\n'
        );
      }
    }

    try {
      while (testCases.length) {
        const testCase = testCases.shift();
        if (!testCase.length) {
          continue;
        }
        let subscriber;

        const lines = testCase.split('\n');
        while (lines.length) {
          const line = lines.shift().trim();
          if (!line.length) {
            continue;
          }
          const [command, ...args] = line.split('%%');
          log(command + ' ' + JSON.stringify(args));
          switch (command) {
            case 'name': {
              break;
            }
            case 'subscribe': {
              const [type, _, data, metadata] = args; // eslint-disable-line no-unused-vars
              if (type === 'rr') {
                subscriber = new _RSocketTckRequestResponseSubscriber2.default(
                  log
                );
                socket.requestResponse({data, metadata}).subscribe(subscriber);
              } else if (type === 'rs') {
                subscriber = new _RSocketTckRequestStreamSubscriber2.default(
                  log
                );
                socket.requestStream({data, metadata}).subscribe(subscriber);
              } else {
                assert(false, 'Invalid `subscribe` type %s.', type);
              }
              break;
            }
            case 'request': {
              const [n] = args;
              (0, _nullthrows2.default)(subscriber).request(parseInt(n, 10));
              break;
            }
            case 'cancel': {
              (0, _nullthrows2.default)(subscriber).cancel();
              break;
            }
            case 'await': {
              const [type, _, nOrTime] = args; // eslint-disable-line no-unused-vars
              if (type === 'terminal') {
                yield (0, _nullthrows2.default)(subscriber).awaitTerminal();
              } else if (type === 'atLeast') {
                yield (0, _nullthrows2.default)(subscriber).awaitN(
                  parseInt(nOrTime, 10)
                );
              } else if (type === 'no_events') {
                yield delay(parseInt(nOrTime, 10));
              } else {
                assert(false, 'Invalid `await` type %s.', type);
              }
              break;
            }
            case 'take': {
              const [n] = args;
              yield (0, _nullthrows2.default)(subscriber).awaitN(
                parseInt(n, 10)
              );
              (0, _nullthrows2.default)(subscriber).cancel();
              break;
            }
            case 'assert': {
              const [type, _, other] = args; // eslint-disable-line no-unused-vars
              if (type === 'no_error') {
                assert(
                  !(0, _nullthrows2.default)(subscriber).hasError(),
                  'Expected onError not to be called.'
                );
              } else if (type === 'error') {
                assert(
                  (0, _nullthrows2.default)(subscriber).hasError(),
                  'Expected onError to be called.'
                );
              } else if (type === 'received') {
                const expected = parsePayloads(other);
                const actual = (0, _nullthrows2.default)(
                  subscriber
                ).getPayloads();
                if (!(0, _areEqual2.default)(actual, expected)) {
                  log('expected: %s', _util2.default.inspect(expected));
                  log('actual: %s', _util2.default.inspect(actual));
                  assert(false, 'Actual/expected payloads differed.');
                }
              } else if (type === 'received_n') {
                const expected = parseInt(other, 10);
                const actual = (0, _nullthrows2.default)(
                  subscriber
                ).getPayloads().length;
                assert(
                  actual === expected,
                  'Expected exactly %s payloads, got %s.',
                  expected,
                  actual
                );
              } else if (type === 'received_at_least') {
                const expected = parseInt(other, 10);
                const actual = (0, _nullthrows2.default)(
                  subscriber
                ).getPayloads().length;
                assert(
                  actual >= expected,
                  'Expected at least %s payloads, got %s.',
                  expected,
                  actual
                );
              } else if (type === 'completed') {
                assert(
                  (0, _nullthrows2.default)(subscriber).isCompleted(),
                  'Expected onComplete to be called.'
                );
              } else if (type === 'no_completed') {
                assert(
                  !(0, _nullthrows2.default)(subscriber).isCompleted(),
                  'Expected onComplete not to be called.'
                );
              } else if (type === 'canceled') {
                assert(
                  (0, _nullthrows2.default)(subscriber).isCanceled(),
                  'Expected request to be canceled.'
                );
              }
              break;
            }
            case 'EOF':
              return;
            default:
              assert(false, 'Unsupported command %s', command);
          }
        }
      }
    } catch (error) {
      log(error.stack || error.message);
      throw error;
    }
  });
  return function run(_x) {
    return _ref.apply(this, arguments);
  };
})();
let connect = (() => {
  var _ref2 = _asyncToGenerator(function*(options) {
    const client = new _rsocketCore.RSocketClient({
      setup: {
        dataMimeType: 'text/plain',
        keepAlive: 1000000, // avoid sending during test
        lifetime: 100000,
        metadataMimeType: 'text/plain',
      },

      transport: new _rsocketTcpClient2.default({
        host: options.host,
        port: options.port,
      }),
    });

    return new Promise(function(resolve, reject) {
      client.connect().subscribe({
        onComplete: resolve,
        onError: reject,
      });
    });
  });
  return function connect(_x2) {
    return _ref2.apply(this, arguments);
  };
})();
let delay = (() => {
  var _ref3 = _asyncToGenerator(function*(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  });
  return function delay(_x3) {
    return _ref3.apply(this, arguments);
  };
})();
exports.default = main;
var _rsocketCore = require('rsocket-core');
var _rsocketTcpClient = require('rsocket-tcp-client');
var _rsocketTcpClient2 = _interopRequireDefault(_rsocketTcpClient);
var _RSocketTckRequestResponseSubscriber = require('./RSocketTckRequestResponseSubscriber');
var _RSocketTckRequestResponseSubscriber2 = _interopRequireDefault(
  _RSocketTckRequestResponseSubscriber
);
var _RSocketTckRequestStreamSubscriber = require('./RSocketTckRequestStreamSubscriber');
var _RSocketTckRequestStreamSubscriber2 = _interopRequireDefault(
  _RSocketTckRequestStreamSubscriber
);
var _areEqual = require('fbjs/lib/areEqual');
var _areEqual2 = _interopRequireDefault(_areEqual);
var _chalk = require('chalk');
var _chalk2 = _interopRequireDefault(_chalk);
var _fs = require('fs');
var _fs2 = _interopRequireDefault(_fs);
var _nullthrows = require('fbjs/lib/nullthrows');
var _nullthrows2 = _interopRequireDefault(_nullthrows);
var _path = require('path');
var _path2 = _interopRequireDefault(_path);
var _sprintf = require('fbjs/lib/sprintf');
var _sprintf2 = _interopRequireDefault(_sprintf);
var _util = require('util');
var _util2 = _interopRequireDefault(_util);
var _yargs = require('yargs');
var _yargs2 = _interopRequireDefault(_yargs);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */ function main() {
  const argv = _yargs2.default
    .usage('$0 --testfile <path> --host <host> --port <port> [--verbose]')
    .options({
      host: {
        default: '127.0.0.1',
        describe: 'TCK server hostname.',
        type: 'string',
      },
      port: {default: 9898, describe: 'TCK server port.', type: 'string'},
      testfile: {
        default: _path2.default.join(__dirname, './clienttest.txt'),
        describe: 'Path to client test file.',
        type: 'string',
      },
      verbose: {
        default: false,
        describe: 'Log each action as it is performed instead of just logging success/failure.',
        type: 'boolean',
      },
    })
    .help().argv;
  Promise.resolve(run(argv)).then(
    () => {
      process.stdout.write(_chalk2.default.green('All tests pass.') + '\n');
      process.exit(0);
    },
    error => {
      process.stderr.write(
        _chalk2.default.red('Test failed: ' + error.message) + '\n'
      );
      process.exit(1);
    }
  );
}
function parsePayloads(data) {
  const payloads = [];
  data.split('&&').forEach(item => {
    const [data, metadata] = item.split(',');
    if (data != null && metadata != null) {
      payloads.push({data, metadata});
    }
  });
  return payloads;
}
