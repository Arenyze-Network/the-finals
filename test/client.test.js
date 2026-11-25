const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { TheFinalsClient, ArenyzeApiError, ArenyzeWebhookSignatureError, verifyWebhookSignature } = require('../src');

/**
 * A fetch stand-in that records every call and answers from `reply`.
 * @param {(url: string, init: any) => { status?: number, body?: any, headers?: Record<string, string> }} [reply]
 */
function mockFetch(reply = () => ({ body: { ok: true } })) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const r = reply(url, init);
    const status = r.status ?? 200;
    return new Response(r.body === undefined ? null : JSON.stringify(r.body), {
      status,
      headers: { 'content-type': 'application/json', ...(r.headers || {}) },
    });
  };
  fn.calls = calls;
  return fn;
}

function client(fetch) {
  return new TheFinalsClient({ apiKey: 'test-key', fetch });
}

const BASE = 'https://public-api.arenyze.com/thefinals/api';

test('requires an apiKey', () => {
  assert.throws(() => new TheFinalsClient({}), /apiKey/);
});

test('sends the api-key header and encodes the Embark name', async () => {
  const fetch = mockFetch(() => ({ body: { embarkName: 'Balise#2431' } }));
  const data = await client(fetch).players.getProfile('Balise#2431');
  assert.equal(data.embarkName, 'Balise#2431');
  assert.equal(fetch.calls[0].url, `${BASE}/player/Balise%232431`);
  assert.equal(fetch.calls[0].init.headers['api-key'], 'test-key');
  assert.match(fetch.calls[0].init.headers['User-Agent'], /^arenyze-the-finals\//);
});

test('every documented endpoint maps to the right path', async () => {
  const fetch = mockFetch();
  const f = client(fetch);
  const cases = [
    [() => f.players.getHistory('A#1', { days: 7, board: 's12' }), '/player/A%231/history?days=7&board=s12'],
    [() => f.players.getInsights('A#1'), '/player/A%231/insights'],
    [() => f.players.getNameChanges('A#1'), '/player/A%231/events'],
    [() => f.players.getClubActivity('A#1'), '/player/A%231/club-events'],
    [() => f.players.getBanStatus('A#1'), '/player/A%231/ban'],
    [() => f.players.comparePlayers('A#1', 'B#2'), '/compare?a=A%231&b=B%232'],
    [() => f.players.searchPlayers('bal'), '/search?q=bal'],
    [() => f.players.resolveName('Balise'), '/resolve?name=Balise'],
    [() => f.players.getDirectory({ q: 'bal', active: true, perPage: 3 }), '/players/search?q=bal&active=true&perPage=3'],
    [() => f.matches.getPlayerMatches('MAZ#2421', { limit: 2, cursor: 'abc' }), '/player/MAZ%232421/matches?limit=2&cursor=abc'],
    [() => f.matches.getMatch('a96d875a'), '/matches/a96d875a'],
    [() => f.leaderboards.getCatalog(), '/catalog'],
    [() => f.leaderboards.getLeaderboard('s12', { perPage: 3 }), '/leaderboard/s12/crossplay?perPage=3'],
    [() => f.leaderboards.getLeaderboard('s3', { platform: 'steam', name: 'bal', count: true }), '/leaderboard/s3/steam?name=bal&count=true'],
    [() => f.leaderboards.getLeaderboardStats('s12'), '/leaderboard-stats/s12/crossplay'],
    [() => f.leaderboards.getRanks({ board: 's12' }), '/ranks?board=s12'],
    [() => f.leaderboards.getCommunityEvent('ev1', { platform: 'psn' }), '/community-event/ev1/psn'],
    [() => f.seasons.getSeasons(), '/seasons'],
    [() => f.seasons.getSeason('s11', { top: 3 }), '/seasons/s11?top=3'],
    [() => f.seasons.getWrappedSeasons(), '/wrapped/seasons'],
    [() => f.seasons.getWrapped('A#1', { season: 's11', tz: 'Europe/Rome' }), '/wrapped/A%231?season=s11&tz=Europe%2FRome'],
    [() => f.movers.getMovers(), '/movers'],
    [() => f.movers.getMoversDays(), '/movers/days'],
    [() => f.movers.getMoversDay('2026-11-20'), '/movers/2026-11-20'],
    [() => f.events.getEvents({ limit: 3, q: 'bal' }), '/events?limit=3&q=bal'],
    [() => f.bans.getBans({ status: 'confirmed', sort: 'rank', perPage: 2 }), '/bans?status=confirmed&sort=rank&perPage=2'],
    [() => f.bans.getBan('A#1'), '/bans/A%231'],
    [() => f.clubs.getClubs({ perPage: 3 }), '/clubs?perPage=3'],
    [() => f.clubs.getClubRanking({ q: 'RA' }), '/clubs/ranking?q=RA'],
    [() => f.clubs.getClub('RAGER'), '/clubs/RAGER'],
    [() => f.hallOfFame.getHallOfFame(), '/hall-of-fame'],
    [() => f.hallOfFame.getBadges(), '/badges'],
    [() => f.items.getSections(), '/items'],
    [() => f.items.getSection('weapons'), '/items/weapons'],
    [() => f.items.getItem('weapons', 'akm'), '/items/weapons/akm'],
    [() => f.items.searchItems({ q: 'ak', limit: 3 }), '/items/search?q=ak&limit=3'],
    [() => f.items.getCosmeticFacets(), '/items/cosmetics/facets'],
    [() => f.items.getLoadouts(), '/loadouts'],
    [() => f.items.getMetaLoadouts(), '/loadouts/meta'],
    [() => f.population.getPlayerCount(), '/player-count'],
    [() => f.population.getLivePlayerCount(), '/player-count/now'],
    [() => f.search.searchAll({ q: 'bal', type: 'players', minRank: 1 }), '/search/global?q=bal&type=players&minRank=1'],
  ];
  for (const [call, path] of cases) {
    await call();
    assert.equal(fetch.calls.at(-1).url, BASE + path);
  }
});

test('validates parameters before calling the API (as rejected promises)', async () => {
  const fetch = mockFetch();
  const f = client(fetch);
  await assert.rejects(f.players.getProfile(''), /name/);
  await assert.rejects(f.players.searchPlayers('b'), /2 characters/);
  await assert.rejects(f.movers.getMoversDay('20/11/2026'), /YYYY-MM-DD/);
  await assert.rejects(f.items.getSection('guns'), /section/);
  await assert.rejects(f.items.searchItems(), /q/);
  await assert.rejects(f.leaderboards.getLeaderboard('s12', { platform: 'pc' }), /platform/);
  await assert.rejects(f.bans.getBans({ status: 'maybe' }), /status/);
  assert.equal(fetch.calls.length, 0);
});

test('API errors become ArenyzeApiError with code, status and Retry-After', async () => {
  const fetch = mockFetch(() => ({
    status: 429,
    body: { error: 'RATE_LIMITED', message: 'Per-minute limit reached.' },
    headers: { 'retry-after': '12', 'x-ratelimit-limit': '30', 'x-ratelimit-remaining': '0' },
  }));
  const f = client(fetch);
  await assert.rejects(f.leaderboards.getRanks(), (err) => {
    assert.ok(err instanceof ArenyzeApiError);
    assert.equal(err.status, 429);
    assert.equal(err.code, 'RATE_LIMITED');
    assert.equal(err.retryAfter, 12);
    assert.equal(err.response.status, 429);
    assert.equal(err.message, 'Per-minute limit reached.');
    return true;
  });
  assert.deepEqual(f.rateLimit, { limit: 30, remaining: 0, quotaLimit: null, quotaUsed: null });
});

test('a timeout becomes a TIMEOUT error', async () => {
  const fetch = (url, init) => new Promise((_, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const f = new TheFinalsClient({ apiKey: 'k', fetch, timeout: 20 });
  await assert.rejects(f.leaderboards.getRanks(), (err) => err instanceof ArenyzeApiError && err.code === 'TIMEOUT' && err.status === 0);
});

test('iteratePlayerMatches follows nextCursor and stops at max', async () => {
  const pages = {
    '': { matches: [{ id: 1 }, { id: 2 }], nextCursor: 'p2' },
    p2: { matches: [{ id: 3 }, { id: 4 }], nextCursor: 'p3' },
    p3: { matches: [{ id: 5 }], nextCursor: null },
  };
  const fetch = mockFetch((url) => ({ body: pages[new URL(url).searchParams.get('cursor') || ''] }));
  const ids = [];
  for await (const m of client(fetch).matches.iteratePlayerMatches('MAZ#2421')) ids.push(m.id);
  assert.deepEqual(ids, [1, 2, 3, 4, 5]);

  const some = [];
  for await (const m of client(fetch).matches.iteratePlayerMatches('MAZ#2421', { max: 3 })) some.push(m.id);
  assert.deepEqual(some, [1, 2, 3]);
});

test('webhook signatures are verified as documented', () => {
  const secret = 'whsec_test';
  const body = JSON.stringify({ id: 'evt_1', type: 'thefinals.league_changed', data: { from: 'Diamond 2', to: 'Diamond 1' } });
  const t = Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  const header = `t=${t},v1=${v1}`;

  const f = client(mockFetch());
  assert.equal(verifyWebhookSignature(body, header, secret), true);
  assert.equal(f.webhooks.verifySignature(Buffer.from(body), header, secret), true);
  assert.equal(f.webhooks.verifySignature(body, header, 'whsec_other'), false);
  assert.equal(f.webhooks.verifySignature(body + ' ', header, secret), false);
  assert.equal(f.webhooks.verifySignature(body, header, secret, { now: t + 301 }), false);
  assert.equal(f.webhooks.constructEvent(body, header, secret).type, 'thefinals.league_changed');
  assert.throws(() => f.webhooks.constructEvent(body, 't=1,v1=00', secret), ArenyzeWebhookSignatureError);
});

test('Discord player card goes to Discord without the API key', async () => {
  const fetch = mockFetch(() => ({ status: 204 }));
  const url = 'https://discord.com/api/webhooks/123/abc_DEF-1';
  const res = await client(fetch).webhooks.createDiscordPlayerWebhook(url, {
    embarkName: 'Balise#2431', displayName: 'Balise#2431', currentRank: 47, currentLeague: 'Diamond 1', currentScore: 54011, bestRank: 3, clubTag: 'VGG', appearances: [],
  }, { message: 'hi' });
  assert.equal(res.success, true);
  const call = fetch.calls[0];
  assert.equal(call.url, url);
  assert.equal(call.init.headers['api-key'], undefined);
  const payload = JSON.parse(call.init.body);
  assert.equal(payload.content, 'hi');
  assert.match(payload.embeds[0].fields[0].value, /#47/);
  assert.equal(payload.embeds[0].url, 'https://thefinals.arenyze.com/player/Balise%232431');
  await assert.rejects(client(fetch).webhooks.createDiscordPlayerWebhook('https://example.com/x', {}), /Discord webhook URL/);
});
