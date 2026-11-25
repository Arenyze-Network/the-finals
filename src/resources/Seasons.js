const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').SeasonParams} SeasonParams */
/** @typedef {import('../../types/params-interfaces').WrappedParams} WrappedParams */
/** @typedef {import('../../types/result-interfaces').SeasonsResponse} SeasonsResponse */
/** @typedef {import('../../types/result-interfaces').SeasonDetail} SeasonDetail */
/** @typedef {import('../../types/result-interfaces').WrappedSeasons} WrappedSeasons */
/** @typedef {import('../../types/result-interfaces').Wrapped} Wrapped */

/** Seasons, their champions and the season Wrapped recaps. */
class Seasons {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Every season with its boards, entries and champion.
   * @returns {Promise<SeasonsResponse>}
   */
  async getSeasons() {
    return this._r._get('/seasons');
  }

  /**
   * One season: its boards, the top of each and the league split.
   * @param {string} season Season id, e.g. `s12`, `s11`, `ob`.
   * @param {SeasonParams} [params]
   * @returns {Promise<SeasonDetail>}
   */
  async getSeason(season, params = {}) {
    return this._r._get(`/seasons/${segment(requireString(season, 'season'))}`, { top: params.top });
  }

  /**
   * Seasons that have a Wrapped recap.
   * @returns {Promise<WrappedSeasons>}
   */
  async getWrappedSeasons() {
    return this._r._get('/wrapped/seasons');
  }

  /**
   * The season recap of a player: final rank, best day, climb, league path and highlights.
   * @param {string} name Embark name.
   * @param {WrappedParams} [params]
   * @returns {Promise<Wrapped>}
   */
  async getWrapped(name, params = {}) {
    return this._r._get(`/wrapped/${segment(requireString(name, 'name'))}`, {
      season: params.season,
      tz: params.tz,
    });
  }
}

module.exports = Seasons;
