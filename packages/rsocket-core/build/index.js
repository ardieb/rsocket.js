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
exports.encodeAndAddWellKnownMetadata = (exports.encodeAndAddCustomMetadata = (exports.ExplicitMimeTimeEntry = undefined));
exports.WellKnownMimeTypeEntry = (exports.ReservedMimeTypeEntry = (exports.CompositeMetadata = (exports.MESSAGE_RSOCKET_COMPOSITE_METADATA = (exports.MESSAGE_RSOCKET_ROUTING = (exports.MESSAGE_RSOCKET_TRACING_ZIPKIN = (exports.MESSAGE_RSOCKET_AUTHENTICATION = (exports.MESSAGE_RSOCKET_ACCEPT_MIMETYPES = (exports.MESSAGE_RSOCKET_MIMETYPE = (exports.APPLICATION_CLOUDEVENTS_JSON = (exports.APPLICATION_JAVA_OBJECT = (exports.APPLICATION_HESSIAN = (exports.VIDEO_VP8 = (exports.VIDEO_H265 = (exports.VIDEO_H264 = (exports.TEXT_XML = (exports.TEXT_PLAIN = (exports.TEXT_HTML = (exports.TEXT_CSV = (exports.TEXT_CSS = (exports.MULTIPART_MIXED = (exports.IMAGE_TIFF = (exports.IMAGE_PNG = (exports.IMAGE_JPEG = (exports.IMAGE_HEIF = (exports.IMAGE_HEIF_SEQUENCE = (exports.IMAGE_HEIC = (exports.IMAGE_HEIC_SEQUENCE = (exports.IMAGE_GIG = (exports.IMAGE_BMP = (exports.AUDIO_VORBIS = (exports.AUDIO_OPUS = (exports.AUDIO_OGG = (exports.AUDIO_MPEG = (exports.AUDIO_MPEG3 = (exports.AUDIO_MP4 = (exports.AUDIO_MP3 = (exports.AUDIO_AAC = (exports.APPLICATION_ZIP = (exports.APPLICATION_XML = (exports.APPLICATION_PROTOBUF = (exports.APPLICATION_THRIFT = (exports.APPLICATION_PDF = (exports.APPLICATION_OCTET_STREAM = (exports.APPLICATION_JSON = (exports.APPLICATION_JAVASCRIPT = (exports.APPLICATION_GZIP = (exports.APPLICATION_GRAPHQL = (exports.APPLICATION_CBOR = (exports.APPLICATION_AVRO = (exports.UNKNOWN_RESERVED_MIME_TYPE = (exports.UNPARSEABLE_MIME_TYPE = (exports.Lease = (exports.Leases = (exports.JsonSerializers = (exports.JsonSerializer = (exports.IdentitySerializers = (exports.IdentitySerializer = (exports.UTF8Encoder = (exports.Utf8Encoders = (exports.BufferEncoder = (exports.BufferEncoders = (exports.writeUInt24BE = (exports.toBuffer = (exports.readUInt24BE = (exports.createBuffer = (exports.byteLength = (exports.serializeFrameWithLength = (exports.serializeFrame = (exports.deserializeFrames = (exports.deserializeFrameWithLength = (exports.deserializeFrame = (exports.printFrame = (exports.isResumeEnable = (exports.isRespond = (exports.isNext = (exports.isMetadata = (exports.isLease = (exports.isIgnore = (exports.isComplete = (exports.getErrorCodeExplanation = (exports.createErrorFromFrame = (exports.MAX_VERSION = (exports.MAX_STREAM_ID = (exports.MAX_RESUME_LENGTH = (exports.MAX_MIME_LENGTH = (exports.MAX_LIFETIME = (exports.MAX_KEEPALIVE = (exports.MAX_CODE = (exports.FRAME_TYPES = (exports.FRAME_TYPE_OFFFSET = (exports.FLAGS = (exports.FLAGS_MASK = (exports.ERROR_EXPLANATIONS = (exports.ERROR_CODES = (exports.CONNECTION_STREAM_ID = (exports.WellKnownMimeType = (exports.RSocketResumableTransport = (exports.RSocketServer = (exports.RSocketClient = undefined)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))));
var _RSocketFrame = require('./RSocketFrame');
Object.defineProperty(exports, 'CONNECTION_STREAM_ID', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.CONNECTION_STREAM_ID;
  },
});
Object.defineProperty(exports, 'ERROR_CODES', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.ERROR_CODES;
  },
});
Object.defineProperty(exports, 'ERROR_EXPLANATIONS', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.ERROR_EXPLANATIONS;
  },
});
Object.defineProperty(exports, 'FLAGS_MASK', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.FLAGS_MASK;
  },
});
Object.defineProperty(exports, 'FLAGS', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.FLAGS;
  },
});
Object.defineProperty(exports, 'FRAME_TYPE_OFFFSET', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.FRAME_TYPE_OFFFSET;
  },
});
Object.defineProperty(exports, 'FRAME_TYPES', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.FRAME_TYPES;
  },
});
Object.defineProperty(exports, 'MAX_CODE', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_CODE;
  },
});
Object.defineProperty(exports, 'MAX_KEEPALIVE', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_KEEPALIVE;
  },
});
Object.defineProperty(exports, 'MAX_LIFETIME', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_LIFETIME;
  },
});
Object.defineProperty(exports, 'MAX_MIME_LENGTH', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_MIME_LENGTH;
  },
});
Object.defineProperty(exports, 'MAX_RESUME_LENGTH', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_RESUME_LENGTH;
  },
});
Object.defineProperty(exports, 'MAX_STREAM_ID', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_STREAM_ID;
  },
});
Object.defineProperty(exports, 'MAX_VERSION', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.MAX_VERSION;
  },
});
Object.defineProperty(exports, 'createErrorFromFrame', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.createErrorFromFrame;
  },
});
Object.defineProperty(exports, 'getErrorCodeExplanation', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.getErrorCodeExplanation;
  },
});
Object.defineProperty(exports, 'isComplete', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isComplete;
  },
});
Object.defineProperty(exports, 'isIgnore', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isIgnore;
  },
});
Object.defineProperty(exports, 'isLease', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isLease;
  },
});
Object.defineProperty(exports, 'isMetadata', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isMetadata;
  },
});
Object.defineProperty(exports, 'isNext', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isNext;
  },
});
Object.defineProperty(exports, 'isRespond', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isRespond;
  },
});
Object.defineProperty(exports, 'isResumeEnable', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.isResumeEnable;
  },
});
Object.defineProperty(exports, 'printFrame', {
  enumerable: true,
  get: function() {
    return _RSocketFrame.printFrame;
  },
});
var _RSocketBinaryFraming = require('./RSocketBinaryFraming');
Object.defineProperty(exports, 'deserializeFrame', {
  enumerable: true,
  get: function() {
    return _RSocketBinaryFraming.deserializeFrame;
  },
});
Object.defineProperty(exports, 'deserializeFrameWithLength', {
  enumerable: true,
  get: function() {
    return _RSocketBinaryFraming.deserializeFrameWithLength;
  },
});
Object.defineProperty(exports, 'deserializeFrames', {
  enumerable: true,
  get: function() {
    return _RSocketBinaryFraming.deserializeFrames;
  },
});
Object.defineProperty(exports, 'serializeFrame', {
  enumerable: true,
  get: function() {
    return _RSocketBinaryFraming.serializeFrame;
  },
});
Object.defineProperty(exports, 'serializeFrameWithLength', {
  enumerable: true,
  get: function() {
    return _RSocketBinaryFraming.serializeFrameWithLength;
  },
});
var _RSocketBufferUtils = require('./RSocketBufferUtils');
Object.defineProperty(exports, 'byteLength', {
  enumerable: true,
  get: function() {
    return _RSocketBufferUtils.byteLength;
  },
});
Object.defineProperty(exports, 'createBuffer', {
  enumerable: true,
  get: function() {
    return _RSocketBufferUtils.createBuffer;
  },
});
Object.defineProperty(exports, 'readUInt24BE', {
  enumerable: true,
  get: function() {
    return _RSocketBufferUtils.readUInt24BE;
  },
});
Object.defineProperty(exports, 'toBuffer', {
  enumerable: true,
  get: function() {
    return _RSocketBufferUtils.toBuffer;
  },
});
Object.defineProperty(exports, 'writeUInt24BE', {
  enumerable: true,
  get: function() {
    return _RSocketBufferUtils.writeUInt24BE;
  },
});
var _RSocketEncoding = require('./RSocketEncoding');
Object.defineProperty(exports, 'BufferEncoders', {
  enumerable: true,
  get: function() {
    return _RSocketEncoding.BufferEncoders;
  },
});
Object.defineProperty(exports, 'BufferEncoder', {
  enumerable: true,
  get: function() {
    return _RSocketEncoding.BufferEncoder;
  },
});
Object.defineProperty(exports, 'Utf8Encoders', {
  enumerable: true,
  get: function() {
    return _RSocketEncoding.Utf8Encoders;
  },
});
Object.defineProperty(exports, 'UTF8Encoder', {
  enumerable: true,
  get: function() {
    return _RSocketEncoding.UTF8Encoder;
  },
});
var _RSocketSerialization = require('./RSocketSerialization');
Object.defineProperty(exports, 'IdentitySerializer', {
  enumerable: true,
  get: function() {
    return _RSocketSerialization.IdentitySerializer;
  },
});
Object.defineProperty(exports, 'IdentitySerializers', {
  enumerable: true,
  get: function() {
    return _RSocketSerialization.IdentitySerializers;
  },
});
Object.defineProperty(exports, 'JsonSerializer', {
  enumerable: true,
  get: function() {
    return _RSocketSerialization.JsonSerializer;
  },
});
Object.defineProperty(exports, 'JsonSerializers', {
  enumerable: true,
  get: function() {
    return _RSocketSerialization.JsonSerializers;
  },
});
var _RSocketLease = require('./RSocketLease');
Object.defineProperty(exports, 'Leases', {
  enumerable: true,
  get: function() {
    return _RSocketLease.Leases;
  },
});
Object.defineProperty(exports, 'Lease', {
  enumerable: true,
  get: function() {
    return _RSocketLease.Lease;
  },
});
var _WellKnownMimeType = require('./WellKnownMimeType');
Object.defineProperty(exports, 'UNPARSEABLE_MIME_TYPE', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.UNPARSEABLE_MIME_TYPE;
  },
});
Object.defineProperty(exports, 'UNKNOWN_RESERVED_MIME_TYPE', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.UNKNOWN_RESERVED_MIME_TYPE;
  },
});
Object.defineProperty(exports, 'APPLICATION_AVRO', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_AVRO;
  },
});
Object.defineProperty(exports, 'APPLICATION_CBOR', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_CBOR;
  },
});
Object.defineProperty(exports, 'APPLICATION_GRAPHQL', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_GRAPHQL;
  },
});
Object.defineProperty(exports, 'APPLICATION_GZIP', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_GZIP;
  },
});
Object.defineProperty(exports, 'APPLICATION_JAVASCRIPT', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_JAVASCRIPT;
  },
});
Object.defineProperty(exports, 'APPLICATION_JSON', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_JSON;
  },
});
Object.defineProperty(exports, 'APPLICATION_OCTET_STREAM', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_OCTET_STREAM;
  },
});
Object.defineProperty(exports, 'APPLICATION_PDF', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_PDF;
  },
});
Object.defineProperty(exports, 'APPLICATION_THRIFT', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_THRIFT;
  },
});
Object.defineProperty(exports, 'APPLICATION_PROTOBUF', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_PROTOBUF;
  },
});
Object.defineProperty(exports, 'APPLICATION_XML', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_XML;
  },
});
Object.defineProperty(exports, 'APPLICATION_ZIP', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_ZIP;
  },
});
Object.defineProperty(exports, 'AUDIO_AAC', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_AAC;
  },
});
Object.defineProperty(exports, 'AUDIO_MP3', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_MP3;
  },
});
Object.defineProperty(exports, 'AUDIO_MP4', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_MP4;
  },
});
Object.defineProperty(exports, 'AUDIO_MPEG3', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_MPEG3;
  },
});
Object.defineProperty(exports, 'AUDIO_MPEG', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_MPEG;
  },
});
Object.defineProperty(exports, 'AUDIO_OGG', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_OGG;
  },
});
Object.defineProperty(exports, 'AUDIO_OPUS', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_OPUS;
  },
});
Object.defineProperty(exports, 'AUDIO_VORBIS', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.AUDIO_VORBIS;
  },
});
Object.defineProperty(exports, 'IMAGE_BMP', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_BMP;
  },
});
Object.defineProperty(exports, 'IMAGE_GIG', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_GIG;
  },
});
Object.defineProperty(exports, 'IMAGE_HEIC_SEQUENCE', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_HEIC_SEQUENCE;
  },
});
Object.defineProperty(exports, 'IMAGE_HEIC', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_HEIC;
  },
});
Object.defineProperty(exports, 'IMAGE_HEIF_SEQUENCE', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_HEIF_SEQUENCE;
  },
});
Object.defineProperty(exports, 'IMAGE_HEIF', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_HEIF;
  },
});
Object.defineProperty(exports, 'IMAGE_JPEG', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_JPEG;
  },
});
Object.defineProperty(exports, 'IMAGE_PNG', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_PNG;
  },
});
Object.defineProperty(exports, 'IMAGE_TIFF', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.IMAGE_TIFF;
  },
});
Object.defineProperty(exports, 'MULTIPART_MIXED', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MULTIPART_MIXED;
  },
});
Object.defineProperty(exports, 'TEXT_CSS', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.TEXT_CSS;
  },
});
Object.defineProperty(exports, 'TEXT_CSV', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.TEXT_CSV;
  },
});
Object.defineProperty(exports, 'TEXT_HTML', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.TEXT_HTML;
  },
});
Object.defineProperty(exports, 'TEXT_PLAIN', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.TEXT_PLAIN;
  },
});
Object.defineProperty(exports, 'TEXT_XML', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.TEXT_XML;
  },
});
Object.defineProperty(exports, 'VIDEO_H264', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.VIDEO_H264;
  },
});
Object.defineProperty(exports, 'VIDEO_H265', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.VIDEO_H265;
  },
});
Object.defineProperty(exports, 'VIDEO_VP8', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.VIDEO_VP8;
  },
});
Object.defineProperty(exports, 'APPLICATION_HESSIAN', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_HESSIAN;
  },
});
Object.defineProperty(exports, 'APPLICATION_JAVA_OBJECT', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_JAVA_OBJECT;
  },
});
Object.defineProperty(exports, 'APPLICATION_CLOUDEVENTS_JSON', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.APPLICATION_CLOUDEVENTS_JSON;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_MIMETYPE', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_MIMETYPE;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_ACCEPT_MIMETYPES', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_ACCEPT_MIMETYPES;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_AUTHENTICATION', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_TRACING_ZIPKIN', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_TRACING_ZIPKIN;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_ROUTING', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_ROUTING;
  },
});
Object.defineProperty(exports, 'MESSAGE_RSOCKET_COMPOSITE_METADATA', {
  enumerable: true,
  get: function() {
    return _WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA;
  },
});
var _CompositeMetadata = require('./CompositeMetadata');
Object.defineProperty(exports, 'CompositeMetadata', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.CompositeMetadata;
  },
});
Object.defineProperty(exports, 'ReservedMimeTypeEntry', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.ReservedMimeTypeEntry;
  },
});
Object.defineProperty(exports, 'WellKnownMimeTypeEntry', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.WellKnownMimeTypeEntry;
  },
});
Object.defineProperty(exports, 'ExplicitMimeTimeEntry', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.ExplicitMimeTimeEntry;
  },
});
Object.defineProperty(exports, 'encodeAndAddCustomMetadata', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.encodeAndAddCustomMetadata;
  },
});
Object.defineProperty(exports, 'encodeAndAddWellKnownMetadata', {
  enumerable: true,
  get: function() {
    return _CompositeMetadata.encodeAndAddWellKnownMetadata;
  },
});
var _RSocketClient = require('./RSocketClient');
var _RSocketClient2 = _interopRequireDefault(_RSocketClient);
var _RSocketServer = require('./RSocketServer');
var _RSocketServer2 = _interopRequireDefault(_RSocketServer);
var _RSocketResumableTransport = require('./RSocketResumableTransport');
var _RSocketResumableTransport2 = _interopRequireDefault(
  _RSocketResumableTransport
);
var _WellKnownMimeType2 = _interopRequireDefault(_WellKnownMimeType);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
exports.RSocketClient = _RSocketClient2.default;
exports.RSocketServer = _RSocketServer2.default;
exports.RSocketResumableTransport = _RSocketResumableTransport2.default;
exports.WellKnownMimeType = _WellKnownMimeType2.default;
