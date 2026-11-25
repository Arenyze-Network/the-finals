/**
 * Error thrown for every failed API call: HTTP errors returned by the API,
 * timeouts and network failures.
 *
 * `status`, `code` and `response` follow the shape used across the Arenyze
 * packages, so retry helpers that read `error.status` or
 * `error.response.status` work unchanged.
 */
class ArenyzeApiError extends Error {
  /**
   * @param {string} message
   * @param {{
   *   status?: number,
   *   code?: string,
   *   body?: any,
   *   headers?: Record<string, string>,
   *   url?: string,
   *   cause?: unknown
   * }} [details]
   */
  constructor(message, details = {}) {
    super(message);
    this.name = 'ArenyzeApiError';

    /** HTTP status, or 0 when the request never got an answer (timeout, network). */
    this.status = details.status ?? 0;

    /** Stable error code from the API (e.g. `PLAYER_NOT_FOUND`), or `TIMEOUT` / `NETWORK_ERROR`. */
    this.code = details.code ?? 'UNKNOWN_ERROR';

    /** The parsed response body, when there was one. */
    this.body = details.body ?? null;

    /** The URL that was requested. */
    this.url = details.url;

    const headers = details.headers || {};
    const retryAfter = Number(headers['retry-after']);

    /** Seconds to wait before retrying, sent with `429` answers. */
    this.retryAfter = Number.isFinite(retryAfter) && headers['retry-after'] !== undefined ? retryAfter : null;

    this.response = {
      status: this.status,
      data: this.body,
      headers,
    };

    if (details.cause !== undefined) {
      this.cause = details.cause;
    }
  }
}

/**
 * Thrown by `webhooks.constructEvent()` when a delivery's signature does not
 * match or is too old.
 */
class ArenyzeWebhookSignatureError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'ArenyzeWebhookSignatureError';
  }
}

module.exports = {
  ArenyzeApiError,
  ArenyzeWebhookSignatureError,
};
