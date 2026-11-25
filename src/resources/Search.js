const Resource = require('./Resource');
const { requireString, optionalOneOf } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').GlobalSearchParams} GlobalSearchParams */
/** @typedef {import('../../types/result-interfaces').GlobalSearchResult} GlobalSearchResult */

const TYPES = /** @type {const} */ (['all', 'players', 'clubs', 'items']);
const PLATFORMS = /** @type {const} */ (['steam', 'psn', 'xbox']);

/** Search players, clubs and items in one query. */
class Search {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Players, clubs and items in one query, with leaderboard filters.
   * For a quick player lookup use `players.searchPlayers()`.
   * @param {GlobalSearchParams} params
   * @returns {Promise<GlobalSearchResult>}
   */
  async searchAll(params) {
    return this._r._get('/search/global', {
      q: requireString(params?.q, 'q'),
      type: optionalOneOf(params.type, 'type', TYPES),
      board: params.board,
      league: params.league,
      club: params.club,
      platform: optionalOneOf(params.platform, 'platform', PLATFORMS),
      minRank: params.minRank,
      maxRank: params.maxRank,
      page: params.page,
    });
  }
}

module.exports = Search;
