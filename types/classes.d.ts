import {
  PlayerHistoryParams,
  PlayerDirectoryParams,
  PlayerMatchesParams,
  IterateMatchesParams,
  LeaderboardParams,
  BoardPlatformParams,
  RanksParams,
  SeasonParams,
  WrappedParams,
  EventsParams,
  BansParams,
  ClubsParams,
  ItemSearchParams,
  GlobalSearchParams,
  DiscordWebhookOptions,
} from './params-interfaces';

import { ItemSection } from './base-types';

import {
  PlayerProfile,
  PlayerHistory,
  PlayerInsights,
  PlayerNameChanges,
  PlayerClubActivity,
  PlayerBanStatus,
  PlayerComparison,
  PlayerSearchResult,
  ResolvedName,
  PlayerDirectory,
  PlayerMatches,
  PlayerMatch,
  MatchDetails,
  LeaderboardCatalog,
  Leaderboard,
  LeaderboardStats,
  RanksResponse,
  SeasonsResponse,
  SeasonDetail,
  WrappedSeasons,
  Wrapped,
  MoversResponse,
  MoversDays,
  EventsFeed,
  BanList,
  BanRecordResponse,
  ClubList,
  ClubRanking,
  Club,
  HallOfFame as HallOfFameResponse,
  BadgeCatalog,
  ItemSections,
  ItemSectionList,
  ItemDetail,
  ItemSearchResult,
  CosmeticFacets,
  MetaLoadouts,
  GlobalSearchResult,
  PlayerCount,
  WebhookEvent,
  DiscordWebhookResult,
  RateLimitInfo,
} from './result-interfaces';

export interface VerifyOptions {
  /** Reject deliveries older (or newer) than this many seconds (default 300, 0 = off). */
  toleranceSeconds?: number;
  /** Current time in seconds, for tests. */
  now?: number;
}

export type RawBody = string | Uint8Array;

export class Players {
  getProfile(name: string): Promise<PlayerProfile>;
  getHistory(name: string, params?: PlayerHistoryParams): Promise<PlayerHistory>;
  getInsights(name: string): Promise<PlayerInsights>;
  getNameChanges(name: string): Promise<PlayerNameChanges>;
  getClubActivity(name: string): Promise<PlayerClubActivity>;
  getBanStatus(name: string): Promise<PlayerBanStatus>;
  comparePlayers(a: string, b: string): Promise<PlayerComparison>;
  searchPlayers(query: string): Promise<PlayerSearchResult>;
  resolveName(name: string): Promise<ResolvedName>;
  getDirectory(params?: PlayerDirectoryParams): Promise<PlayerDirectory>;
}

export class Matches {
  getPlayerMatches(name: string, params?: PlayerMatchesParams): Promise<PlayerMatches>;
  iteratePlayerMatches(name: string, params?: IterateMatchesParams): AsyncGenerator<PlayerMatch, void, undefined>;
  getMatch(matchId: string): Promise<MatchDetails>;
}

export class Leaderboards {
  getCatalog(): Promise<LeaderboardCatalog>;
  getLeaderboard(leaderboardId: string, params?: LeaderboardParams): Promise<Leaderboard>;
  getLeaderboardStats(leaderboardId: string, params?: BoardPlatformParams): Promise<LeaderboardStats>;
  getRanks(params?: RanksParams): Promise<RanksResponse>;
  getCommunityEvent(eventId: string, params?: BoardPlatformParams): Promise<Leaderboard>;
}

export class Seasons {
  getSeasons(): Promise<SeasonsResponse>;
  getSeason(season: string, params?: SeasonParams): Promise<SeasonDetail>;
  getWrappedSeasons(): Promise<WrappedSeasons>;
  getWrapped(name: string, params?: WrappedParams): Promise<Wrapped>;
}

export class Movers {
  getMovers(): Promise<MoversResponse>;
  getMoversDays(): Promise<MoversDays>;
  /** @param day `YYYY-MM-DD` (UTC). */
  getMoversDay(day: string): Promise<MoversResponse>;
}

export class Events {
  getEvents(params?: EventsParams): Promise<EventsFeed>;
}

export class Bans {
  getBans(params?: BansParams): Promise<BanList>;
  getBan(name: string): Promise<BanRecordResponse>;
}

export class Clubs {
  getClubs(params?: ClubsParams): Promise<ClubList>;
  getClubRanking(params?: ClubsParams): Promise<ClubRanking>;
  getClub(tag: string): Promise<Club>;
}

export class HallOfFame {
  getHallOfFame(): Promise<HallOfFameResponse>;
  getBadges(): Promise<BadgeCatalog>;
}

export class Items {
  getSections(): Promise<ItemSections>;
  getSection(section: ItemSection): Promise<ItemSectionList>;
  getItem(section: ItemSection, slug: string): Promise<ItemDetail>;
  searchItems(params: ItemSearchParams): Promise<ItemSearchResult>;
  getCosmeticFacets(): Promise<CosmeticFacets>;
  getLoadouts(): Promise<any>;
  getMetaLoadouts(): Promise<MetaLoadouts>;
}

export class Population {
  getPlayerCount(): Promise<PlayerCount>;
  getLivePlayerCount(): Promise<any>;
}

export class Search {
  searchAll(params: GlobalSearchParams): Promise<GlobalSearchResult>;
}

export class Webhooks {
  verifySignature(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): boolean;
  constructEvent<T = Record<string, unknown>>(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): WebhookEvent<T>;
  createDiscordPlayerWebhook(webhookUrl: string, profile: PlayerProfile, options?: DiscordWebhookOptions): Promise<DiscordWebhookResult>;
}

export interface TheFinalsClientConfig {
  /** Your Arenyze API key (Workbench → API keys). */
  apiKey: string;
  /** Override the API host (default `https://public-api.arenyze.com/thefinals/api`). */
  baseUrl?: string;
  /** Milliseconds before a request is aborted (default 15000, 0 = never). */
  timeout?: number;
  /** Custom fetch implementation (defaults to the global one, Node.js 18+). */
  fetch?: typeof fetch;
}

export class TheFinalsClient {
  constructor(config: TheFinalsClientConfig);
  static readonly DEFAULT_BASE_URL: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  /** Rate-limit and quota headers of the last API answer, or `null` before the first call. */
  rateLimit: RateLimitInfo | null;
  players: Players;
  matches: Matches;
  leaderboards: Leaderboards;
  seasons: Seasons;
  movers: Movers;
  events: Events;
  bans: Bans;
  clubs: Clubs;
  hallOfFame: HallOfFame;
  items: Items;
  population: Population;
  search: Search;
  webhooks: Webhooks;
}

export class ArenyzeApiError extends Error {
  /** HTTP status, or 0 when no answer arrived (timeout, network). */
  status: number;
  /** API error code (`PLAYER_NOT_FOUND`, `RATE_LIMITED`, …) or `TIMEOUT` / `NETWORK_ERROR`. */
  code: string;
  /** Parsed response body. */
  body: any;
  url?: string;
  /** Seconds to wait, sent with `429` answers. */
  retryAfter: number | null;
  response: { status: number; data: any; headers: Record<string, string> };
}

export class ArenyzeWebhookSignatureError extends Error {}

export function verifyWebhookSignature(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): boolean;
