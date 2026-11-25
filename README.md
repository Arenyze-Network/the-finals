# @arenyze/the-finals — THE FINALS API Wrapper

**THE FINALS API sdk** for Node.js — player profiles, rank history, match history, leaderboards of every season and mode, daily movers, bans, clubs, the Hall of Fame, the item database and the live player count. Full TypeScript support included.

<div align="center">
  <p>
    <a href="https://github.com/Arenyze-Network/the-finals/releases/latest">
      <img src="https://img.shields.io/github/v/release/Arenyze-Network/the-finals?style=for-the-badge" alt="GitHub release (latest SemVer)" />
    </a>
    <a href="https://www.npmjs.com/package/@arenyze/the-finals">
      <img src="https://img.shields.io/npm/v/@arenyze/the-finals.svg?logo=npm&style=for-the-badge" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/@arenyze/the-finals">
      <img src="https://img.shields.io/npm/dt/@arenyze/the-finals.svg?style=for-the-badge" alt="NPM downloads" />
    </a>
  </p>
</div>

## Installation

```sh
npm i @arenyze/the-finals
```

Node.js 18 or newer (the package uses the built-in `fetch`). No runtime dependencies.

## Getting Started

> **You need an Arenyze API key.** Create it in [Workbench → API keys](https://workbench.arenyze.com/#/live/keys). One key works on THE FINALS, Rainbow Six Siege and Arknights: Endfield.

The same data powers **[thefinals.arenyze.com](https://thefinals.arenyze.com/)**. The full endpoint reference is on **[docs.arenyze.com/thefinals](https://docs.arenyze.com/thefinals)**.

### 1. Initialization

```javascript
const { TheFinalsClient } = require('@arenyze/the-finals');

const finals = new TheFinalsClient({
  apiKey: process.env.ARENYZE_API_KEY, // Required
});

const player = await finals.players.getProfile('Balise#2431');
console.log(player.currentRank, player.currentLeague, player.currentScore);
```

ES modules work too:

```javascript
import { TheFinalsClient } from '@arenyze/the-finals';
```

Keep the key on your server: anyone with it spends your quota. Don't ship it in a web page or a mobile app.

### 2. TypeScript

Every method and response is typed.

```typescript
import { TheFinalsClient, PlayerProfile, Leaderboard } from '@arenyze/the-finals';

const finals = new TheFinalsClient({ apiKey: process.env.ARENYZE_API_KEY! });

const profile: PlayerProfile = await finals.players.getProfile('Balise#2431');
const top: Leaderboard = await finals.leaderboards.getLeaderboard('s12', { perPage: 10 });
```

### 3. Options

| Option | Default | |
|---|---|---|
| `apiKey` | — | Required. |
| `baseUrl` | `https://public-api.arenyze.com/thefinals/api` | Point the client at another deployment. |
| `timeout` | `15000` | Milliseconds before a request is aborted. `0` = never. |
| `fetch` | global `fetch` | Your own fetch implementation (proxies, tests). |

## Players

Embark names keep their tag (`Balise#2431`); the package encodes them for you. Former names and platform handles resolve too.

| Method | Endpoint | Returns |
|---|---|---|
| `players.getProfile(name)` | `/player/{name}` | Current rank, score and league, best placements of every season and mode, platform handles, club, former names, badges. |
| `players.getHistory(name, { days, board })` | `/player/{name}/history` | Rank, score and league snapshots (one every 20 minutes). `days` default 30, max 90. |
| `players.getInsights(name)` | `/player/{name}/insights` | Standings on every live board with percentile, players ahead and behind, distance to the next league. |
| `players.getNameChanges(name)` | `/player/{name}/events` | Detected renames. |
| `players.getClubActivity(name)` | `/player/{name}/club-events` | Joins, departures and big moves in the player's club. |
| `players.getBanStatus(name)` | `/player/{name}/ban` | `{ ban: null }` for a clean player, otherwise the ban record. |
| `players.comparePlayers(a, b)` | `/compare` | Side-by-side metrics and the winner of each. |
| `players.searchPlayers(query)` | `/search` | Prefix search (at least 2 characters). |
| `players.resolveName(name)` | `/resolve` | Any known name → the current Embark name. |
| `players.getDirectory({ q, active, minBest, maxBest, minBoards, page, perPage })` | `/players/search` | The A–Z directory of every player ever seen on a board. |

```javascript
const history = await finals.players.getHistory('Balise#2431', { days: 7 });
const { a, b, winner } = await finals.players.comparePlayers('Balise#2431', 'FitShotgun#6148');
const { name } = await finals.players.resolveName('Balise'); // → 'Balise#2431'
```

## Matches

| Method | Endpoint | Returns |
|---|---|---|
| `matches.getPlayerMatches(name, { limit, cursor })` | `/player/{name}/matches` | Matches newest first; pass `nextCursor` as `cursor` for the next page. |
| `matches.iteratePlayerMatches(name, { limit, max })` | same | Async iterator over the whole history (one API call per page). |
| `matches.getMatch(matchId)` | `/matches/{id}` | Every team and player of one match. |

```javascript
for await (const match of finals.matches.iteratePlayerMatches('MAZ#2421', { max: 50 })) {
  console.log(match.map, match.result ?? `#${match.placement}`, match.stats);
}
```

`result` (`win` / `loss`) is set when `recordedByPlayer` is `true`; otherwise it is `null` and `placement` is the team's place.

## Leaderboards

`platform` is `crossplay` (default) for current seasons; `steam`, `psn` or `xbox` on older boards split by platform.

| Method | Endpoint | Returns |
|---|---|---|
| `leaderboards.getCatalog()` | `/catalog` | Every leaderboard id, grouped by season. |
| `leaderboards.getLeaderboard(id, { platform, name, count, page, perPage })` | `/leaderboard/{id}/{platform}` | A board page by page (`perPage` max 200). |
| `leaderboards.getLeaderboardStats(id, { platform })` | `/leaderboard-stats/{id}/{platform}` | Score distribution and players per league. |
| `leaderboards.getRanks({ board })` | `/ranks` | Every league with its score range, icon and share of players. |
| `leaderboards.getCommunityEvent(id, { platform })` | `/community-event/{id}/{platform}` | Community event boards. |

```javascript
const { groups } = await finals.leaderboards.getCatalog();
const board = await finals.leaderboards.getLeaderboard('s12', { name: 'bal', perPage: 20 });
```

## Seasons & Wrapped

| Method | Endpoint | Returns |
|---|---|---|
| `seasons.getSeasons()` | `/seasons` | Every season with its boards and champion. |
| `seasons.getSeason(season, { top })` | `/seasons/{season}` | One season (`s12`, `s11`, `ob`…): boards, top players, league split. |
| `seasons.getWrappedSeasons()` | `/wrapped/seasons` | Seasons with a Wrapped recap. |
| `seasons.getWrapped(name, { season, tz })` | `/wrapped/{name}` | A player's season recap. `tz` is an IANA zone, e.g. `Europe/Rome`. |

## Movers & events

| Method | Endpoint | Returns |
|---|---|---|
| `movers.getMovers()` | `/movers` | Biggest climbers and fallers of the last 24 hours, entrants and dropouts. |
| `movers.getMoversDays()` | `/movers/days` | Days with movers data. |
| `movers.getMoversDay(day)` | `/movers/{day}` | Movers of a past day (`YYYY-MM-DD`, UTC). |
| `events.getEvents({ limit, kind, q, offset })` | `/events` | Live feed of renames across all boards. |

## Bans

| Method | Endpoint | Returns |
|---|---|---|
| `bans.getBans({ season, q, status, type, sort, page, perPage })` | `/bans` | Players removed from the leaderboards. `status`: `suspected`, `confirmed`, `returned`. `sort`: `recent`, `rank`, `score`. |
| `bans.getBan(name)` | `/bans/{name}` | The ban history of one player. |

## Clubs

| Method | Endpoint | Returns |
|---|---|---|
| `clubs.getClubs({ q, page, perPage })` | `/clubs` | Every club tag with member count and best rank. |
| `clubs.getClubRanking({ q, page, perPage })` | `/clubs/ranking` | Clubs ranked by the power of their best five players. |
| `clubs.getClub(tag)` | `/clubs/{tag}` | Members and boards of a club. |

## Hall of Fame

| Method | Endpoint | Returns |
|---|---|---|
| `hallOfFame.getHallOfFame()` | `/hall-of-fame` | Champions, veterans and records since the closed betas. |
| `hallOfFame.getBadges()` | `/badges` | The badge catalogue with how many players hold each. |

## Items

`section` is one of `weapons`, `gadgets`, `specializations`, `maps`, `modes`, `sponsors`, `cosmetics`.

| Method | Endpoint | Returns |
|---|---|---|
| `items.getSections()` | `/items` | Every section with counts and previews. |
| `items.getSection(section)` | `/items/{section}` | Every item of a section with stats and images. |
| `items.getItem(section, slug)` | `/items/{section}/{slug}` | One item in full: damage, fire rate, magazine, skins. |
| `items.searchItems({ q, kind, limit })` | `/items/search` | Search the whole database. |
| `items.getCosmeticFacets()` | `/items/cosmetics/facets` | Rarities, slots and sources to filter cosmetics. |
| `items.getLoadouts()` | `/loadouts` | Community loadouts with votes. |
| `items.getMetaLoadouts()` | `/loadouts/meta` | The most used builds per class. |

```javascript
const akm = await finals.items.getItem('weapons', 'akm');
console.log(akm.stats.bodyDamage, akm.stats.rpm, akm.stats.magSize);
```

Image paths in responses are relative to `https://thefinals.arenyze.com`.

## Search & population

| Method | Endpoint | Returns |
|---|---|---|
| `search.searchAll({ q, type, board, league, club, platform, minRank, maxRank, page })` | `/search/global` | Players, clubs and items in one query. |
| `population.getPlayerCount()` | `/player-count` | Live players, the cross-platform estimate, today's peak, the weekly pattern. |
| `population.getLivePlayerCount()` | `/player-count/now` | Just the live number. |

## Errors

Every failed call rejects with an `ArenyzeApiError`. Invalid arguments reject with a `TypeError` before any request is sent.

```javascript
const { ArenyzeApiError } = require('@arenyze/the-finals');

try {
  await finals.players.getProfile('Nobody#0000');
} catch (err) {
  if (err instanceof ArenyzeApiError) {
    console.log(err.status, err.code, err.message);
    if (err.code === 'RATE_LIMITED') {
      await new Promise((r) => setTimeout(r, (err.retryAfter ?? 5) * 1000));
    }
  }
}
```

| Property | |
|---|---|
| `status` | HTTP status, or `0` when no answer arrived. |
| `code` | `MISSING_API_KEY`, `INVALID_API_KEY`, `API_KEY_EXPIRED`, `BAD_REQUEST`, `PLAYER_NOT_FOUND`, `NOT_FOUND`, `RATE_LIMITED`, `MONTHLY_QUOTA_EXCEEDED`, `FREE_GAME_QUOTA_EXCEEDED`, `UPSTREAM_UNAVAILABLE`… plus `TIMEOUT` and `NETWORK_ERROR`. |
| `retryAfter` | Seconds to wait, on a `429`. |
| `body` | The parsed error body (e.g. `plan`, `limit`, `used`, `reset_at` on quota errors). |

The full list is on [docs.arenyze.com/errors](https://docs.arenyze.com/errors).

## Rate limits

One monthly quota per key, shared by every Arenyze game, plus a per-minute limit on THE FINALS. After each call `finals.rateLimit` holds the latest headers:

```javascript
await finals.leaderboards.getRanks();
console.log(finals.rateLimit);
// { limit: 120, remaining: 119, quotaLimit: 50000, quotaUsed: 1234 }
```

Plans and limits: [docs.arenyze.com/limits](https://docs.arenyze.com/limits). Cache what you can — boards refresh every few minutes, item data far less often.

## Webhooks

Instead of polling, let Arenyze call you: add an endpoint in [Workbench → Webhooks](https://workbench.arenyze.com/#/live/webhooks), pick the players and the events (`thefinals.rank_changed`, `thefinals.league_changed`, `thefinals.club_changed`, `thefinals.renamed`, `thefinals.ban_detected`), and verify each delivery with your endpoint secret.

```javascript
const express = require('express');
const { TheFinalsClient, ArenyzeWebhookSignatureError } = require('@arenyze/the-finals');

const finals = new TheFinalsClient({ apiKey: process.env.ARENYZE_API_KEY });
const app = express();

// The body must stay raw: the signature covers the exact bytes.
app.post('/arenyze', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = finals.webhooks.constructEvent(
      req.body,
      req.get('Arenyze-Signature'),
      process.env.ARENYZE_WEBHOOK_SECRET,
    );
    console.log(event.type, event.text);
    res.sendStatus(204); // answer fast, do the work async
  } catch (err) {
    if (err instanceof ArenyzeWebhookSignatureError) return res.status(400).send('bad signature');
    throw err;
  }
});
```

Deliveries older than 5 minutes are rejected (`{ toleranceSeconds }` changes it). `verifyWebhookSignature(rawBody, header, secret)` is also exported on its own if you only receive webhooks.

### Discord player card

Post a player's card to a Discord channel webhook. The API key is never sent to Discord.

```javascript
const profile = await finals.players.getProfile('Balise#2431');
await finals.webhooks.createDiscordPlayerWebhook(process.env.DISCORD_WEBHOOK_URL, profile, {
  message: 'Daily update',
});
```

Options: `title`, `description`, `message`, `color`, `avatarUrl`.

## License

MIT
