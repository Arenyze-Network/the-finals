const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').ClubsParams} ClubsParams */
/** @typedef {import('../../types/result-interfaces').ClubList} ClubList */
/** @typedef {import('../../types/result-interfaces').ClubRanking} ClubRanking */
/** @typedef {import('../../types/result-interfaces').Club} Club */

/** Club tags, their members and the club ranking. */
class Clubs {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Every club tag with member count, boards and best rank.
   * @param {ClubsParams} [params]
   * @returns {Promise<ClubList>}
   */
  async getClubs(params = {}) {
    return this._r._get('/clubs', { q: params.q, page: params.page, perPage: params.perPage });
  }

  /**
   * Clubs ranked by the power of their best five players on the live board.
   * @param {ClubsParams} [params]
   * @returns {Promise<ClubRanking>}
   */
  async getClubRanking(params = {}) {
    return this._r._get('/clubs/ranking', { q: params.q, page: params.page, perPage: params.perPage });
  }

  /**
   * Members of a club with their best rank.
   * @param {string} tag Club tag, e.g. `RAGER`.
   * @returns {Promise<Club>}
   */
  async getClub(tag) {
    return this._r._get(`/clubs/${segment(requireString(tag, 'tag'))}`);
  }
}

module.exports = Clubs;
