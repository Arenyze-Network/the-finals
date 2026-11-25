/**
 * Build a URL path with query-string parameters. Empty values are left out.
 *
 * @param {string} basePath
 * @param {Record<string, string | number | boolean | undefined | null>} [paramsObj={}]
 * @returns {string}
 */
function buildUrlAndParams(basePath, paramsObj = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(paramsObj)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }

  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ''}`;
}

/**
 * Encode one path segment (`Balise#2431` → `Balise%232431`).
 *
 * @param {string | number} value
 * @returns {string}
 */
function segment(value) {
  return encodeURIComponent(String(value));
}

module.exports = {
  buildUrlAndParams,
  segment,
};
