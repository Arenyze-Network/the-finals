const Resource = require('./Resource');
const { requireDay } = require('../utils/validate');

/** @typedef {import('../../types/result-interfaces').MoversResponse} MoversResponse */
/** @typedef {import('../../types/result-interfaces').MoversDays} MoversDays */

/** Biggest climbers and fallers of the live Ranked board. */
class Movers {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Biggest climbers and fallers of the live Ranked board in the last 24 hours,
   * with entrants and dropouts.
   * @returns {Promise<MoversResponse>}
   */
  async getMovers() {
    return this._r._get('/movers');
  }

  /**
   * The days with movers data and their totals.
   * @returns {Promise<MoversDays>}
   */
  async getMoversDays() {
    return this._r._get('/movers/days');
  }

  /**
   * Movers of a past day.
   * @param {string} day Day in `YYYY-MM-DD` (UTC).
   * @returns {Promise<MoversResponse>}
   */
  async getMoversDay(day) {
    return this._r._get(`/movers/${requireDay(day, 'day')}`);
  }
}

module.exports = Movers;
