/**
 * @param {unknown} value
 * @param {string} name
 * @returns {string}
 */
function requireString(value, name) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new TypeError(`Missing required parameter: ${name}`);
  }
  const text = String(value).trim();
  if (!text) {
    throw new TypeError(`Missing required parameter: ${name}`);
  }
  return text;
}

/**
 * @template {string} T
 * @param {T | undefined} value
 * @param {string} name
 * @param {readonly T[]} allowed
 * @returns {T | undefined}
 */
function optionalOneOf(value, name, allowed) {
  if (value === undefined || value === null || /** @type {string} */ (value) === '') {
    return undefined;
  }
  if (!allowed.includes(value)) {
    throw new TypeError(`Invalid ${name}. Must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {string}
 */
function requireDay(value, name) {
  const day = requireString(value, name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new TypeError(`Invalid ${name}. Use the YYYY-MM-DD format (UTC)`);
  }
  return day;
}

module.exports = {
  requireString,
  optionalOneOf,
  requireDay,
};
