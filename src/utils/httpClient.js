const { ArenyzeApiError } = require('../errors');

/**
 * @typedef {Object} HttpResponse
 * @property {any} data
 * @property {number} status
 * @property {Record<string, string>} headers
 */

/**
 * @typedef {Object} RateLimitInfo
 * @property {number | null} limit      Requests allowed per minute on this game.
 * @property {number | null} remaining  Requests left in the current minute.
 * @property {number | null} quotaLimit Monthly calls of the plan (all games).
 * @property {number | null} quotaUsed  Calls used this month (all games).
 */

/**
 * @typedef {Object} HttpClientOptions
 * @property {string} apiKey
 * @property {string} defaultBaseUrl
 * @property {string} userAgent
 * @property {string} [baseUrl]
 * @property {number} [timeout]  Milliseconds before a request is aborted (0 = never).
 * @property {typeof fetch} [fetch]
 * @property {(info: RateLimitInfo) => void} [onRateLimit]
 */

/**
 * @param {string} url
 * @returns {boolean}
 */
function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url);
}

/**
 * @param {string} baseURL
 * @param {string} path
 * @returns {string}
 */
function joinUrl(baseURL, path) {
  const base = String(baseURL || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${base}/${p}`;
}

/**
 * @param {string | undefined} value
 * @returns {number | null}
 */
function toNumber(value) {
  if (value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {Record<string, string>} headers
 * @returns {RateLimitInfo | null}
 */
function readRateLimit(headers) {
  const info = {
    limit: toNumber(headers['x-ratelimit-limit']),
    remaining: toNumber(headers['x-ratelimit-remaining']),
    quotaLimit: toNumber(headers['x-quota-limit']),
    quotaUsed: toNumber(headers['x-quota-used']),
  };
  return Object.values(info).some((v) => v !== null) ? info : null;
}

/**
 * @param {HttpClientOptions} options
 */
function createHttpClient(options) {
  const BASE_URL = String(options.baseUrl || options.defaultBaseUrl).replace(/\/+$/, '');
  const timeout = options.timeout ?? 15000;
  const fetchImpl = options.fetch || globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new Error('No fetch implementation available. Use Node.js 18+ or pass `fetch` in the client config.');
  }

  /** @type {Record<string, string>} */
  const baseHeaders = {
    Accept: 'application/json',
    'User-Agent': options.userAgent,
  };

  /**
   * @param {string} method
   * @param {string} url
   * @param {any} [data]
   * @returns {Promise<HttpResponse>}
   */
  async function request(method, url, data) {
    const absolute = isAbsoluteUrl(url);
    const fullUrl = absolute ? url : joinUrl(BASE_URL, url);

    /** @type {Record<string, string>} */
    const headers = { ...baseHeaders };

    // The key only ever goes to the Arenyze API, never to third-party URLs
    // such as a Discord webhook.
    if (!absolute) {
      headers['api-key'] = options.apiKey;
    }

    /** @type {string | undefined} */
    let body;
    if (data !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const controller = timeout > 0 ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

    /** @type {Response} */
    let response;
    try {
      response = await fetchImpl(fullUrl, {
        method,
        headers,
        body,
        signal: controller ? controller.signal : undefined,
      });
    } catch (error) {
      const aborted = controller?.signal.aborted;
      throw new ArenyzeApiError(
        aborted ? `Request timed out after ${timeout} ms` : `Network error: ${/** @type {Error} */ (error)?.message || error}`,
        { code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR', url: fullUrl, cause: error },
      );
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }

    /** @type {Record<string, string>} */
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    const text = await response.text();

    /** @type {any} */
    let responseData = null;
    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!absolute && options.onRateLimit) {
      const info = readRateLimit(responseHeaders);
      if (info) {
        options.onRateLimit(info);
      }
    }

    if (!response.ok) {
      const apiCode = responseData && typeof responseData === 'object' ? responseData.error : undefined;
      const apiMessage = responseData && typeof responseData === 'object' ? responseData.message : undefined;
      throw new ArenyzeApiError(
        apiMessage || (typeof apiCode === 'string' ? apiCode : `Request failed with status code ${response.status}`),
        {
          status: response.status,
          code: typeof apiCode === 'string' ? apiCode : `HTTP_${response.status}`,
          body: responseData,
          headers: responseHeaders,
          url: fullUrl,
        },
      );
    }

    return {
      data: responseData,
      status: response.status,
      headers: responseHeaders,
    };
  }

  return {
    /**
     * @param {string} url
     * @returns {Promise<HttpResponse>}
     */
    get(url) {
      return request('GET', url);
    },

    /**
     * @param {string} url
     * @param {any} [data]
     * @returns {Promise<HttpResponse>}
     */
    post(url, data) {
      return request('POST', url, data);
    },
  };
}

module.exports = createHttpClient;
