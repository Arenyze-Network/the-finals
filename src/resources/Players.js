const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').PlayerHistoryParams} PlayerHistoryParams */
/** @typedef {import('../../types/params-interfaces').PlayerDirectoryParams} PlayerDirectoryParams */
/** @typedef {import('../../types/result-interfaces').PlayerProfile} PlayerProfile */
/** @typedef {import('../../types/result-interfaces').PlayerHistory} PlayerHistory */
/** @typedef {import('../../types/result-interfaces').PlayerInsights} PlayerInsights */
/** @typedef {import('../../types/result-interfaces').PlayerNameChanges} PlayerNameChanges */
/** @typedef {import('../../types/result-interfaces').PlayerClubActivity} PlayerClubActivity */
/** @typedef {import('../../types/result-interfaces').PlayerBanStatus} PlayerBanStatus */
/** @typedef {import('../../types/result-interfaces').PlayerComparison} PlayerComparison */
/** @typedef {import('../../types/result-interfaces').PlayerSearchResult} PlayerSearchResult */
/** @typedef {import('../../types/result-interfaces').ResolvedName} ResolvedName */
/** @typedef {import('../../types/result-interfaces').PlayerDirectory} PlayerDirectory */

/**
 * Player endpoints. A player is addressed by Embark name with its tag
 * (`Balise#2431`); former names and platform handles resolve too.
 */
class Players {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Current rank, score and league on the live Ranked board, best placements of
   * every season and mode, platform handles, club and former names.
   * @param {string} name Embark name, e.g. `Balise#2431`.
   * @returns {Promise<PlayerProfile>}
   */
  async getProfile(name) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}`);
  }

  /**
   * Rank, score and league snapshots over time (one point every 20 minutes
   * while the player is on the board).
   * @param {string} name
   * @param {PlayerHistoryParams} [params]
   * @returns {Promise<PlayerHistory>}
   */
  async getHistory(name, params = {}) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/history`, {
      days: params.days,
      board: params.board,
    });
  }

  /**
   * Standings on every live board with percentile, players ahead and behind,
   * distance to the next league and the median score.
   * @param {string} name
   * @returns {Promise<PlayerInsights>}
   */
  async getInsights(name) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/insights`);
  }

  /**
   * The renames detected for a player, with the platform handle that linked the two names.
   * @param {string} name
   * @returns {Promise<PlayerNameChanges>}
   */
  async getNameChanges(name) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/events`);
  }

  /**
   * Joins, departures and big moves of the members of the player's club over the last days.
   * @param {string} name
   * @returns {Promise<PlayerClubActivity>}
   */
  async getClubActivity(name) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/club-events`);
  }

  /**
   * `{ ban: null }` for a clean player, otherwise the ban record.
   * @param {string} name
   * @returns {Promise<PlayerBanStatus>}
   */
  async getBanStatus(name) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/ban`);
  }

  /**
   * Side-by-side metrics of two players: current and best rank, peak score,
   * leagues, seasons played.
   * @param {string} a First Embark name.
   * @param {string} b Second Embark name.
   * @returns {Promise<PlayerComparison>}
   */
  async comparePlayers(a, b) {
    return this._r._get('/compare', { a: requireString(a, 'a'), b: requireString(b, 'b') });
  }

  /**
   * Prefix search over every tracked player, best matches first.
   * @param {string} query At least 2 characters of an Embark name or platform handle.
   * @returns {Promise<PlayerSearchResult>}
   */
  async searchPlayers(query) {
    const q = requireString(query, 'query');
    if (q.length < 2) {
      throw new TypeError('query must be at least 2 characters long');
    }
    return this._r._get('/search', { q });
  }

  /**
   * Turns any known name (Embark name, former name or platform handle) into
   * the current canonical Embark name.
   * @param {string} name
   * @returns {Promise<ResolvedName>}
   */
  async resolveName(name) {
    return this._r._get('/resolve', { name: requireString(name, 'name') });
  }

  /**
   * The A–Z directory of every player ever seen on a leaderboard, with filters.
   * @param {PlayerDirectoryParams} [params]
   * @returns {Promise<PlayerDirectory>}
   */
  async getDirectory(params = {}) {
    return this._r._get('/players/search', {
      q: params.q,
      active: params.active,
      minBest: params.minBest,
      maxBest: params.maxBest,
      minBoards: params.minBoards,
      page: params.page,
      perPage: params.perPage,
    });
  }
}

module.exports = Players;
