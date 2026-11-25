const { buildUrlAndParams } = require('../utils/buildUrl');

/**
 * @typedef {{ httpClient: { get: (url: string) => Promise<{ data: any }> } }} ClientLike
 */

/** Base class of every resource: holds the client and performs GET calls. */
class Resource {
  /**
   * @param {ClientLike} client - The main client instance
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {string} path
   * @param {Record<string, string | number | boolean | undefined | null>} [query]
   * @returns {Promise<any>}
   */
  async _get(path, query) {
    const response = await this.client.httpClient.get(buildUrlAndParams(path, query));
    return response.data;
  }
}

module.exports = Resource;
