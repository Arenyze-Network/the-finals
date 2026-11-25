const pkg = require('../package.json');
const createHttpClient = require('./utils/httpClient');
const Players = require('./resources/Players');
const Matches = require('./resources/Matches');
const Leaderboards = require('./resources/Leaderboards');
const Seasons = require('./resources/Seasons');
const Movers = require('./resources/Movers');
const Events = require('./resources/Events');
const Bans = require('./resources/Bans');
const Clubs = require('./resources/Clubs');
const HallOfFame = require('./resources/HallOfFame');
const Items = require('./resources/Items');
const Population = require('./resources/Population');
const Search = require('./resources/Search');
const Webhooks = require('./resources/Webhooks');

const DEFAULT_BASE_URL = 'https://public-api.arenyze.com/thefinals/api';

/** @typedef {import('./utils/httpClient').RateLimitInfo} RateLimitInfo */

/**
 * @typedef {Object} TheFinalsClientConfig
 * @property {string} apiKey Your Arenyze API key (Workbench → API keys).
 * @property {string} [baseUrl] Override the API host, e.g. for a staging deployment.
 * @property {number} [timeout=15000] Milliseconds before a request is aborted (0 = never).
 * @property {typeof fetch} [fetch] Custom fetch implementation (defaults to the global one).
 */

class TheFinalsClient {
  /**
   * @param {TheFinalsClientConfig} config - Configuration options
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('Missing required config parameter: apiKey');
    }

    /** @type {string} */
    this.apiKey = config.apiKey;

    /** @type {string} */
    this.baseUrl = String(config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');

    /**
     * Rate-limit and quota headers of the last API answer, or `null` before the first call.
     * @type {RateLimitInfo | null}
     */
    this.rateLimit = null;

    this.httpClient = createHttpClient({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      defaultBaseUrl: DEFAULT_BASE_URL,
      userAgent: `arenyze-the-finals/${pkg.version}`,
      timeout: config.timeout,
      fetch: config.fetch,
      onRateLimit: (info) => {
        this.rateLimit = info;
      },
    });

    this.players = new Players(this);
    this.matches = new Matches(this);
    this.leaderboards = new Leaderboards(this);
    this.seasons = new Seasons(this);
    this.movers = new Movers(this);
    this.events = new Events(this);
    this.bans = new Bans(this);
    this.clubs = new Clubs(this);
    this.hallOfFame = new HallOfFame(this);
    this.items = new Items(this);
    this.population = new Population(this);
    this.search = new Search(this);
    this.webhooks = new Webhooks(this);
  }
}

TheFinalsClient.DEFAULT_BASE_URL = DEFAULT_BASE_URL;

module.exports = TheFinalsClient;
