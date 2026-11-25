const crypto = require('node:crypto');

const DEFAULT_TOLERANCE_SECONDS = 300;

/**
 * @typedef {Object} VerifyOptions
 * @property {number} [toleranceSeconds=300] Reject deliveries older (or newer) than this. 0 disables the check.
 * @property {number} [now] Current time in seconds, for tests.
 */

/**
 * @param {string | Buffer | Uint8Array} rawBody
 * @returns {Buffer}
 */
function toBuffer(rawBody) {
  if (typeof rawBody === 'string') {
    return Buffer.from(rawBody, 'utf8');
  }
  if (rawBody instanceof Uint8Array) {
    return Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
  }
  throw new TypeError('rawBody must be the raw request body (string, Buffer or Uint8Array), not parsed JSON');
}

/**
 * Parse an `Arenyze-Signature` header (`t=<unix seconds>,v1=<hex>`).
 *
 * @param {string | null | undefined} header
 * @returns {{ t: number | null, v1: string[] }}
 */
function parseSignatureHeader(header) {
  /** @type {{ t: number | null, v1: string[] }} */
  const out = { t: null, v1: [] };
  for (const part of String(header || '').split(',')) {
    const i = part.indexOf('=');
    if (i <= 0) {
      continue;
    }
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key === 't') {
      const t = Number(value);
      out.t = Number.isFinite(t) ? t : null;
    } else if (key === 'v1' && value) {
      out.v1.push(value);
    }
  }
  return out;
}

/**
 * Compute the `v1` signature of a delivery: HMAC-SHA256 of `<t>.<raw body>`.
 *
 * @param {string | Buffer | Uint8Array} rawBody
 * @param {number | string} timestamp
 * @param {string} secret
 * @returns {string}
 */
function computeSignature(rawBody, timestamp, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.`)
    .update(toBuffer(rawBody))
    .digest('hex');
}

/**
 * Check an Arenyze webhook delivery. Pass the body exactly as received
 * (e.g. `express.raw({ type: 'application/json' })`), not the parsed object.
 *
 * @param {string | Buffer | Uint8Array} rawBody
 * @param {string | null | undefined} signatureHeader Value of the `Arenyze-Signature` header.
 * @param {string} secret The endpoint secret (`whsec_…`).
 * @param {VerifyOptions} [options]
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signatureHeader, secret, options = {}) {
  if (!secret) {
    throw new TypeError('Missing required parameter: secret');
  }
  const { t, v1 } = parseSignatureHeader(signatureHeader);
  if (t === null || v1.length === 0) {
    return false;
  }

  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (tolerance > 0) {
    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (Math.abs(now - t) > tolerance) {
      return false;
    }
  }

  const expected = Buffer.from(computeSignature(rawBody, t, secret), 'utf8');
  return v1.some((candidate) => {
    const given = Buffer.from(candidate, 'utf8');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

module.exports = {
  verifyWebhookSignature,
  computeSignature,
  parseSignatureHeader,
  toBuffer,
};
