const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString, optionalOneOf } = require('../utils/validate');

/** @typedef {import('../../types/base-types').LeaderboardPlatform} LeaderboardPlatform */
/** @typedef {import('../../types/params-interfaces').LeaderboardParams} LeaderboardParams */
/** @typedef {import('../../types/params-interfaces').BoardPlatformParams} BoardPlatformParams */
/** @typedef {import('../../types/params-interfaces').RanksParams} RanksParams */
/** @typedef {import('../../types/result-interfaces').LeaderboardCatalog} LeaderboardCatalog */
/** @typedef {import('../../types/result-interfaces').Leaderboard} Leaderboard */
/** @typedef {import('../../types/result-interfaces').LeaderboardStats} LeaderboardStats */
/** @typedef {import('../../types/result-interfaces').RanksResponse} RanksResponse */

/** @type {readonly LeaderboardPlatform[]} */
const PLATFORMS = ['crossplay', 'steam', 'psn', 'xbox'];

/**
 * @param {LeaderboardPlatform | undefined} platform
 * @returns {LeaderboardPlatform}
 */
function platformOf(platform) {
  return optionalOneOf(platform, 'platform', PLATFORMS) || 'crossplay';
}

/** Leaderboards of every season and mode. */
class Leaderboards {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Every leaderboard id, grouped by season (Ranked, World Tour, Sponsor,
   * Power Shift, Quick Cash, Team Deathmatch, Point Break, Solo Showdown and events).
   * @returns {Promise<LeaderboardCatalog>}
   */
  async getCatalog() {
    return this._r._get('/catalog');
  }

  /**
   * A full leaderboard page by page: rank, score, league, change, club and platform handles.
   * @param {string} leaderboardId Leaderboard id from `getCatalog()`, e.g. `s12`, `s12worldtour`.
   * @param {LeaderboardParams} [params]
   * @returns {Promise<Leaderboard>}
   */
  async getLeaderboard(leaderboardId, params = {}) {
    const id = segment(requireString(leaderboardId, 'leaderboardId'));
    return this._r._get(`/leaderboard/${id}/${platformOf(params.platform)}`, {
      name: params.name,
      count: params.count,
      page: params.page,
      perPage: params.perPage,
    });
  }

  /**
   * Score distribution of a board: min, max, average, median, top 1 % and the players per league.
   * @param {string} leaderboardId
   * @param {BoardPlatformParams} [params]
   * @returns {Promise<LeaderboardStats>}
   */
  async getLeaderboardStats(leaderboardId, params = {}) {
    const id = segment(requireString(leaderboardId, 'leaderboardId'));
    return this._r._get(`/leaderboard-stats/${id}/${platformOf(params.platform)}`);
  }

  /**
   * Every league with its score range, icon, the share of players in it and
   * the score cut-off of the board.
   * @param {RanksParams} [params]
   * @returns {Promise<RanksResponse>}
   */
  async getRanks(params = {}) {
    return this._r._get('/ranks', { board: params.board });
  }

  /**
   * Boards of community events (e.g. seasonal challenges) in the same format as a leaderboard.
   * @param {string} eventId
   * @param {BoardPlatformParams} [params]
   * @returns {Promise<Leaderboard>}
   */
  async getCommunityEvent(eventId, params = {}) {
    const id = segment(requireString(eventId, 'eventId'));
    return this._r._get(`/community-event/${id}/${platformOf(params.platform)}`);
  }
}

module.exports = Leaderboards;
