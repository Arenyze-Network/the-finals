const Resource = require('./Resource');

/** @typedef {import('../../types/result-interfaces').HallOfFame} HallOfFameResponse */
/** @typedef {import('../../types/result-interfaces').BadgeCatalog} BadgeCatalog */

/** Champions, veterans, records and badges across every season. */
class HallOfFame {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Champions, veterans and records across every season since the closed betas.
   * @returns {Promise<HallOfFameResponse>}
   */
  async getHallOfFame() {
    return this._r._get('/hall-of-fame');
  }

  /**
   * The badge catalogue: ranked finishes, leagues, modes and veteran badges,
   * with how many players hold each.
   * @returns {Promise<BadgeCatalog>}
   */
  async getBadges() {
    return this._r._get('/badges');
  }
}

module.exports = HallOfFame;
