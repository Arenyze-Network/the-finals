const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').PlayerMatchesParams} PlayerMatchesParams */
/** @typedef {import('../../types/params-interfaces').IterateMatchesParams} IterateMatchesParams */
/** @typedef {import('../../types/result-interfaces').PlayerMatches} PlayerMatches */
/** @typedef {import('../../types/result-interfaces').PlayerMatch} PlayerMatch */
/** @typedef {import('../../types/result-interfaces').MatchDetails} MatchDetails */

/** Match history and match scoreboards. */
class Matches {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * The player's matches, newest first. Pass the `nextCursor` of a page as
   * `cursor` to get the next one; `total` and `lastPlayed` come with the
   * first page only.
   * @param {string} name Embark name.
   * @param {PlayerMatchesParams} [params]
   * @returns {Promise<PlayerMatches>}
   */
  async getPlayerMatches(name, params = {}) {
    return this._r._get(`/player/${segment(requireString(name, 'name'))}/matches`, {
      limit: params.limit,
      cursor: params.cursor,
    });
  }

  /**
   * Walk the whole match history page by page, newest first.
   *
   * ```js
   * for await (const match of finals.matches.iteratePlayerMatches('MAZ#2421', { max: 100 })) {
   *   console.log(match.mode, match.result);
   * }
   * ```
   * Every page is one API call.
   * @param {string} name
   * @param {IterateMatchesParams} [params]
   * @returns {AsyncGenerator<PlayerMatch, void, undefined>}
   */
  async *iteratePlayerMatches(name, params = {}) {
    const max = params.max ?? Infinity;
    /** @type {string | undefined} */
    let cursor = params.cursor;
    let yielded = 0;

    while (yielded < max) {
      const page = await this.getPlayerMatches(name, { limit: params.limit, cursor });
      const matches = Array.isArray(page?.matches) ? page.matches : [];
      for (const match of matches) {
        if (yielded >= max) {
          return;
        }
        yielded += 1;
        yield match;
      }
      if (!page?.nextCursor || matches.length === 0) {
        return;
      }
      cursor = page.nextCursor;
    }
  }

  /**
   * One match in full: every team in scoreboard order with placement, cash
   * and totals, and every player with their numbers.
   * @param {string} matchId Match id (a UUID) from `getPlayerMatches`.
   * @returns {Promise<MatchDetails>}
   */
  async getMatch(matchId) {
    return this._r._get(`/matches/${segment(requireString(matchId, 'matchId'))}`);
  }
}

module.exports = Matches;
