const Resource = require('./Resource');

/** @typedef {import('../../types/params-interfaces').EventsParams} EventsParams */
/** @typedef {import('../../types/result-interfaces').EventsFeed} EventsFeed */

/** The live feed of detected renames. */
class Events {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Detected renames across all boards, newest first. To receive them as they
   * happen, subscribe to the `thefinals.renamed` webhook instead of polling.
   * @param {EventsParams} [params]
   * @returns {Promise<EventsFeed>}
   */
  async getEvents(params = {}) {
    return this._r._get('/events', {
      limit: params.limit,
      kind: params.kind,
      q: params.q,
      offset: params.offset,
    });
  }
}

module.exports = Events;
