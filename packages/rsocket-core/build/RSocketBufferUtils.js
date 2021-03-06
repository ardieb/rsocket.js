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

/* eslint-disable no-bitwise */ Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.createBuffer = undefined;
exports.readUInt24BE = readUInt24BE;
exports.writeUInt24BE = writeUInt24BE;
exports.readUInt64BE = readUInt64BE;
exports.writeUInt64BE = writeUInt64BE;
exports.byteLength = byteLength;
exports.toBuffer = toBuffer;
exports.concat = concat;
var _LiteBuffer = require('./LiteBuffer');
var _invariant = require('fbjs/lib/invariant');
var _invariant2 = _interopRequireDefault(_invariant);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
/**
                                                                                                                                                                                                                                                             * Mimimum value that would overflow bitwise operators (2^32).
                                                                                                                                                                                                                                                             */ const BITWISE_OVERFLOW = 0x100000000;
/**
                                                                                                                                                                                                                                                                                                      * Read a uint24 from a buffer starting at the given offset.
                                                                                                                                                                                                                                                                                                      */ function readUInt24BE(
  buffer,
  offset
) {
  const val1 = buffer.readUInt8(offset) << 16;
  const val2 = buffer.readUInt8(offset + 1) << 8;
  const val3 = buffer.readUInt8(offset + 2);
  return val1 | val2 | val3;
}
/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Writes a uint24 to a buffer starting at the given offset, returning the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * offset of the next byte.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */ function writeUInt24BE(
  buffer,
  value,
  offset
) {
  offset = buffer.writeUInt8(value >>> 16, offset); // 3rd byte
  offset = buffer.writeUInt8(value >>> 8 & 0xff, offset); // 2nd byte
  return buffer.writeUInt8(value & 0xff, offset); // 1st byte
}
/**
   * Read a uint64 (technically supports up to 53 bits per JS number
   * representation).
   */ function readUInt64BE(
  buffer,
  offset
) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);
  return high * BITWISE_OVERFLOW + low;
}
/**
                                                                                                                                                                         * Write a uint64 (technically supports up to 53 bits per JS number
                                                                                                                                                                         * representation).
                                                                                                                                                                         */ function writeUInt64BE(
  buffer,
  value,
  offset
) {
  const high = value / BITWISE_OVERFLOW | 0;
  const low = value % BITWISE_OVERFLOW;
  offset = buffer.writeUInt32BE(high, offset); // first half of uint64
  return buffer.writeUInt32BE(low, offset); // second half of uint64
}
/**
   * Determine the number of bytes it would take to encode the given data with the
   * given encoding.
   */ function byteLength(
  data,
  encoding
) {
  if (data == null) {
    return 0;
  }
  return _LiteBuffer.LiteBuffer.byteLength(data, encoding);
}
/**
                                                                                                                                   * Attempts to construct a buffer from the input, throws if invalid.
                                                                                                                                   */ function toBuffer(
  data
) {
  // Buffer.from(buffer) copies which we don't want here
  if (data instanceof _LiteBuffer.LiteBuffer) {
    return data;
  }
  (0, _invariant2.default)(
    data instanceof ArrayBuffer,
    'RSocketBufferUtils: Cannot construct buffer. Expected data to be an ' +
      'arraybuffer, got `%s`.',
    data
  );
  return _LiteBuffer.LiteBuffer.from(data);
}
function concat(queued) {
  if (typeof queued[0] === 'string') {
    return queued.join('');
  } else {
    return _LiteBuffer.LiteBuffer.concat(queued);
  }
}
/**
                                                                                                                                                                                                                                                                                                                                                                                                                  * Function to create a buffer of a given sized filled with zeros.
                                                                                                                                                                                                                                                                                                                                                                                                                  */ const createBuffer = (exports.createBuffer = typeof _LiteBuffer.LiteBuffer.alloc ===
  'function'
  ? length => _LiteBuffer.LiteBuffer.alloc(length) // $FlowFixMe
  : length => new _LiteBuffer.LiteBuffer(length).fill(0));
