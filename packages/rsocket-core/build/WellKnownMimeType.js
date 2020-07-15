'use strict';
Object.defineProperty(exports, '__esModule', {value: true});

class WellKnownMimeType {
  constructor(str, identifier) {
    this._string = str;
    this._identifier = identifier;
  }

  /**
     * Find the {@link WellKnownMimeType} for the given identifier (as an {@code int}). Valid
     * identifiers are defined to be integers between 0 and 127, inclusive. Identifiers outside of
     * this range will produce the {@link #UNPARSEABLE_MIME_TYPE}. Additionally, some identifiers in
     * that range are still only reserved and don't have a type associated yet: this method returns
     * the {@link #UNKNOWN_RESERVED_MIME_TYPE} when passing such an identifier, which lets call sites
     * potentially detect this and keep the original representation when transmitting the associated
     * metadata buffer.
     *
     * @param id the looked up identifier
     * @return the {@link WellKnownMimeType}, or {@link #UNKNOWN_RESERVED_MIME_TYPE} if the id is out
     *     of the specification's range, or {@link #UNKNOWN_RESERVED_MIME_TYPE} if the id is one that
     *     is merely reserved but unknown to this implementation.
     */
  static fromIdentifier(id) {
    if (id < 0x00 || id > 0x7f) {
      return UNPARSEABLE_MIME_TYPE;
    }
    return TYPES_BY_MIME_ID[id];
  }

  /**
     * Find the {@link WellKnownMimeType} for the given {@link String} representation. If the
     * representation is {@code null} or doesn't match a {@link WellKnownMimeType}, the {@link
     * #UNPARSEABLE_MIME_TYPE} is returned.
     *
     * @param mimeType the looked up mime type
     * @return the matching {@link WellKnownMimeType}, or {@link #UNPARSEABLE_MIME_TYPE} if none
     *     matches
     */
  static fromString(mimeType) {
    if (!mimeType) throw new Error('type must be non-null');

    // force UNPARSEABLE if by chance UNKNOWN_RESERVED_MIME_TYPE's text has been used
    if (mimeType === UNKNOWN_RESERVED_MIME_TYPE.string) {
      return UNPARSEABLE_MIME_TYPE;
    }

    return TYPES_BY_MIME_STRING.get(mimeType) || UNPARSEABLE_MIME_TYPE;
  }

  /** @return the byte identifier of the mime type, guaranteed to be positive or zero. */
  get identifier() {
    return this._identifier;
  }

  /**
     * @return the mime type represented as a {@link String}, which is made of US_ASCII compatible
     *     characters only
     */
  get string() {
    return this._string;
  }

  /** @see #getString() */
  toString() {
    return this._string;
  }
}
exports.default = WellKnownMimeType;

const UNPARSEABLE_MIME_TYPE = (exports.UNPARSEABLE_MIME_TYPE = new WellKnownMimeType(
  'UNPARSEABLE_MIME_TYPE_DO_NOT_USE',
  -2
));

const UNKNOWN_RESERVED_MIME_TYPE = (exports.UNKNOWN_RESERVED_MIME_TYPE = new WellKnownMimeType(
  'UNKNOWN_YET_RESERVED_DO_NOT_USE',
  -1
));

const APPLICATION_AVRO = (exports.APPLICATION_AVRO = new WellKnownMimeType(
  'application/avro',
  0x00
));
const APPLICATION_CBOR = (exports.APPLICATION_CBOR = new WellKnownMimeType(
  'application/cbor',
  0x01
));
const APPLICATION_GRAPHQL = (exports.APPLICATION_GRAPHQL = new WellKnownMimeType(
  'application/graphql',
  0x02
));

const APPLICATION_GZIP = (exports.APPLICATION_GZIP = new WellKnownMimeType(
  'application/gzip',
  0x03
));
const APPLICATION_JAVASCRIPT = (exports.APPLICATION_JAVASCRIPT = new WellKnownMimeType(
  'application/javascript',
  0x04
));

const APPLICATION_JSON = (exports.APPLICATION_JSON = new WellKnownMimeType(
  'application/json',
  0x05
));
const APPLICATION_OCTET_STREAM = (exports.APPLICATION_OCTET_STREAM = new WellKnownMimeType(
  'application/octet-stream',
  0x06
));

const APPLICATION_PDF = (exports.APPLICATION_PDF = new WellKnownMimeType(
  'application/pdf',
  0x07
));
const APPLICATION_THRIFT = (exports.APPLICATION_THRIFT = new WellKnownMimeType(
  'application/vnd.apache.thrift.binary',
  0x08
));

const APPLICATION_PROTOBUF = (exports.APPLICATION_PROTOBUF = new WellKnownMimeType(
  'application/vnd.google.protobuf',
  0x09
));

const APPLICATION_XML = (exports.APPLICATION_XML = new WellKnownMimeType(
  'application/xml',
  0x0a
));
const APPLICATION_ZIP = (exports.APPLICATION_ZIP = new WellKnownMimeType(
  'application/zip',
  0x0b
));
const AUDIO_AAC = (exports.AUDIO_AAC = new WellKnownMimeType(
  'audio/aac',
  0x0c
));
const AUDIO_MP3 = (exports.AUDIO_MP3 = new WellKnownMimeType(
  'audio/mp3',
  0x0d
));
const AUDIO_MP4 = (exports.AUDIO_MP4 = new WellKnownMimeType(
  'audio/mp4',
  0x0e
));
const AUDIO_MPEG3 = (exports.AUDIO_MPEG3 = new WellKnownMimeType(
  'audio/mpeg3',
  0x0f
));
const AUDIO_MPEG = (exports.AUDIO_MPEG = new WellKnownMimeType(
  'audio/mpeg',
  0x10
));
const AUDIO_OGG = (exports.AUDIO_OGG = new WellKnownMimeType(
  'audio/ogg',
  0x11
));
const AUDIO_OPUS = (exports.AUDIO_OPUS = new WellKnownMimeType(
  'audio/opus',
  0x12
));
const AUDIO_VORBIS = (exports.AUDIO_VORBIS = new WellKnownMimeType(
  'audio/vorbis',
  0x13
));
const IMAGE_BMP = (exports.IMAGE_BMP = new WellKnownMimeType(
  'image/bmp',
  0x14
));
const IMAGE_GIG = (exports.IMAGE_GIG = new WellKnownMimeType(
  'image/gif',
  0x15
));
const IMAGE_HEIC_SEQUENCE = (exports.IMAGE_HEIC_SEQUENCE = new WellKnownMimeType(
  'image/heic-sequence',
  0x16
));

const IMAGE_HEIC = (exports.IMAGE_HEIC = new WellKnownMimeType(
  'image/heic',
  0x17
));
const IMAGE_HEIF_SEQUENCE = (exports.IMAGE_HEIF_SEQUENCE = new WellKnownMimeType(
  'image/heif-sequence',
  0x18
));

const IMAGE_HEIF = (exports.IMAGE_HEIF = new WellKnownMimeType(
  'image/heif',
  0x19
));
const IMAGE_JPEG = (exports.IMAGE_JPEG = new WellKnownMimeType(
  'image/jpeg',
  0x1a
));
const IMAGE_PNG = (exports.IMAGE_PNG = new WellKnownMimeType(
  'image/png',
  0x1b
));
const IMAGE_TIFF = (exports.IMAGE_TIFF = new WellKnownMimeType(
  'image/tiff',
  0x1c
));
const MULTIPART_MIXED = (exports.MULTIPART_MIXED = new WellKnownMimeType(
  'multipart/mixed',
  0x1d
));
const TEXT_CSS = (exports.TEXT_CSS = new WellKnownMimeType('text/css', 0x1e));
const TEXT_CSV = (exports.TEXT_CSV = new WellKnownMimeType('text/csv', 0x1f));
const TEXT_HTML = (exports.TEXT_HTML = new WellKnownMimeType(
  'text/html',
  0x20
));
const TEXT_PLAIN = (exports.TEXT_PLAIN = new WellKnownMimeType(
  'text/plain',
  0x21
));
const TEXT_XML = (exports.TEXT_XML = new WellKnownMimeType('text/xml', 0x22));
const VIDEO_H264 = (exports.VIDEO_H264 = new WellKnownMimeType(
  'video/H264',
  0x23
));
const VIDEO_H265 = (exports.VIDEO_H265 = new WellKnownMimeType(
  'video/H265',
  0x24
));
const VIDEO_VP8 = (exports.VIDEO_VP8 = new WellKnownMimeType(
  'video/VP8',
  0x25
));
const APPLICATION_HESSIAN = (exports.APPLICATION_HESSIAN = new WellKnownMimeType(
  'application/x-hessian',
  0x26
));

const APPLICATION_JAVA_OBJECT = (exports.APPLICATION_JAVA_OBJECT = new WellKnownMimeType(
  'application/x-java-object',
  0x27
));

const APPLICATION_CLOUDEVENTS_JSON = (exports.APPLICATION_CLOUDEVENTS_JSON = new WellKnownMimeType(
  'application/cloudevents+json',
  0x28
));

// ... reserved for future use ...
const MESSAGE_RSOCKET_MIMETYPE = (exports.MESSAGE_RSOCKET_MIMETYPE = new WellKnownMimeType(
  'message/x.rsocket.mime-type.v0',
  0x7a
));

const MESSAGE_RSOCKET_ACCEPT_MIMETYPES = (exports.MESSAGE_RSOCKET_ACCEPT_MIMETYPES = new WellKnownMimeType(
  'message/x.rsocket.accept-mime-types.v0',
  0x7b
));

const MESSAGE_RSOCKET_AUTHENTICATION = (exports.MESSAGE_RSOCKET_AUTHENTICATION = new WellKnownMimeType(
  'message/x.rsocket.authentication.v0',
  0x7c
));

const MESSAGE_RSOCKET_TRACING_ZIPKIN = (exports.MESSAGE_RSOCKET_TRACING_ZIPKIN = new WellKnownMimeType(
  'message/x.rsocket.tracing-zipkin.v0',
  0x7d
));

const MESSAGE_RSOCKET_ROUTING = (exports.MESSAGE_RSOCKET_ROUTING = new WellKnownMimeType(
  'message/x.rsocket.routing.v0',
  0x7e
));

const MESSAGE_RSOCKET_COMPOSITE_METADATA = (exports.MESSAGE_RSOCKET_COMPOSITE_METADATA = new WellKnownMimeType(
  'message/x.rsocket.composite-metadata.v0',
  0x7f
));

const TYPES_BY_MIME_ID = (exports.TYPES_BY_MIME_ID = new Array(128));
const TYPES_BY_MIME_STRING = (exports.TYPES_BY_MIME_STRING = new Map());

const ALL_MIME_TYPES = [
  UNPARSEABLE_MIME_TYPE,
  UNKNOWN_RESERVED_MIME_TYPE,
  APPLICATION_AVRO,
  APPLICATION_CBOR,
  APPLICATION_GRAPHQL,
  APPLICATION_GZIP,
  APPLICATION_JAVASCRIPT,
  APPLICATION_JSON,
  APPLICATION_OCTET_STREAM,
  APPLICATION_PDF,
  APPLICATION_THRIFT,
  APPLICATION_PROTOBUF,
  APPLICATION_XML,
  APPLICATION_ZIP,
  AUDIO_AAC,
  AUDIO_MP3,
  AUDIO_MP4,
  AUDIO_MPEG3,
  AUDIO_MPEG,
  AUDIO_OGG,
  AUDIO_OPUS,
  AUDIO_VORBIS,
  IMAGE_BMP,
  IMAGE_GIG,
  IMAGE_HEIC_SEQUENCE,
  IMAGE_HEIC,
  IMAGE_HEIF_SEQUENCE,
  IMAGE_HEIF,
  IMAGE_JPEG,
  IMAGE_PNG,
  IMAGE_TIFF,
  MULTIPART_MIXED,
  TEXT_CSS,
  TEXT_CSV,
  TEXT_HTML,
  TEXT_PLAIN,
  TEXT_XML,
  VIDEO_H264,
  VIDEO_H265,
  VIDEO_VP8,
  APPLICATION_HESSIAN,
  APPLICATION_JAVA_OBJECT,
  APPLICATION_CLOUDEVENTS_JSON,
  MESSAGE_RSOCKET_MIMETYPE,
  MESSAGE_RSOCKET_ACCEPT_MIMETYPES,
  MESSAGE_RSOCKET_AUTHENTICATION,
  MESSAGE_RSOCKET_TRACING_ZIPKIN,
  MESSAGE_RSOCKET_ROUTING,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
];

TYPES_BY_MIME_ID.fill(UNKNOWN_RESERVED_MIME_TYPE);

for (let value of ALL_MIME_TYPES) {
  if (value.identifier >= 0) {
    TYPES_BY_MIME_ID[value.identifier] = value;
    TYPES_BY_MIME_STRING.set(value.string, value);
  }
}

if (Object.seal) {
  Object.seal(TYPES_BY_MIME_ID);
}
