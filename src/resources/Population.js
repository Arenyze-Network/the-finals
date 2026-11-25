const Resource = require('./Resource');

/** @typedef {import('../../types/result-interfaces').PlayerCount} PlayerCount */

/** How many people are playing THE FINALS. */
class Population {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Live players and the estimate across platforms, today's peak and the weekly pattern.
   * @returns {Promise<PlayerCount>}
   */
  async getPlayerCount() {
    return this._r._get('/player-count');
  }

  /**
   * Just the live number.
   * @returns {Promise<any>}
   */
  async getLivePlayerCount() {
    return this._r._get('/player-count/now');
  }
}

module.exports = Population;
