const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString, optionalOneOf } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').BansParams} BansParams */
/** @typedef {import('../../types/result-interfaces').BanList} BanList */
/** @typedef {import('../../types/result-interfaces').BanRecordResponse} BanRecordResponse */

const STATUSES = /** @type {const} */ (['suspected', 'confirmed', 'returned']);
const SORTS = /** @type {const} */ (['recent', 'rank', 'score']);

/** Players removed from the leaderboards. */
class Bans {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Players removed from the leaderboards, with detection time, last rank and status.
   * @param {BansParams} [params]
   * @returns {Promise<BanList>}
   */
  async getBans(params = {}) {
    return this._r._get('/bans', {
      season: params.season,
      q: params.q,
      status: optionalOneOf(params.status, 'status', STATUSES),
      type: params.type,
      sort: optionalOneOf(params.sort, 'sort', SORTS),
      page: params.page,
      perPage: params.perPage,
    });
  }

  /**
   * The ban history of one player.
   * @param {string} name Embark name.
   * @returns {Promise<BanRecordResponse>}
   */
  async getBan(name) {
    return this._r._get(`/bans/${segment(requireString(name, 'name'))}`);
  }
}

module.exports = Bans;
