// Result interfaces for @arenyze/the-finals
// Shapes follow the live API (docs.arenyze.com/thefinals). Large nested blocks
// are typed loosely so new fields never break your build.

import { ImageAsset, MatchResult, Pagination } from './base-types';

type Loose = Record<string, unknown>;

// ── Players ──────────────────────────────────────────────────────────────

export interface FormerName {
  name: string;
  handle: string | null;
  platform: string | null;
  since: string | null;
}

export interface BoardAppearance {
  leaderboardId: string;
  platform: string;
  season: string;
  mode: string;
  label: string;
  live: boolean;
  active: boolean;
  rank: number;
  change: number | null;
  score: number | null;
  scoreLabel: string;
  league: string | null;
  leagueNumber: number | null;
  clubTag: string | null;
  underName: string | null;
}

export interface PlayerBadge {
  id: string;
  cat: string;
  tier: string;
  name: string;
  label: string;
  count: number;
  desc: string;
  how: string;
  image: string;
  pct: number;
  rarity: string;
}

export interface PlayerProfile {
  embarkName: string;
  displayName: string;
  slug: string;
  formerNames: FormerName[];
  steamName: string | null;
  psnName: string | null;
  xboxName: string | null;
  clubTag: string | null;
  currentRank: number | null;
  currentScore: number | null;
  currentLeague: string | null;
  currentRankFormer: boolean;
  bestRank: number | null;
  appearances: BoardAppearance[];
  currentSeason: { id: string; label: string };
  fetchedAt: string;
  searchCount: number;
  badges: PlayerBadge[];
}

export interface BoardRef {
  id: string;
  label: string;
  mode?: string;
  live?: boolean;
  scoreLabel?: string;
  platform?: string;
}

export interface PlayerHistory {
  embarkName: string;
  days: number;
  retentionDays: number;
  board: BoardRef;
  total: number;
  since: string;
  history: { recorded_at: string; rank: number; score: number; league: string | null }[];
}

export interface PlayerStanding {
  leaderboardId: string;
  platform: string;
  label: string;
  mode: string;
  live: boolean;
  active: boolean;
  rank: number;
  score: number;
  scoreLabel: string;
  league: string | null;
  totalPlayers: number;
  playersAhead: number;
  playersBehind: number;
  percentile: number;
  medianScore: number;
  leagueFloor: number | null;
  nextLeague: Loose | null;
  top500: Loose | null;
  top1000: Loose | null;
}

export interface PlayerInsights {
  embarkName: string;
  primaryBoard: { leaderboardId: string; platform: string; label: string; mode: string; scoreLabel: string };
  standings: PlayerStanding[];
  rivals: { above: Loose[]; below: Loose[]; overtakes: Loose };
  club: Loose | null;
  activity: Loose | null;
  peaks: Loose | null;
  bestRankAllTime: number | null;
}

export interface NameChangeEvent {
  kind: string;
  occurredAt: string;
  embarkName: string;
  prevName: string;
  handle: string | null;
  platform: string | null;
}

export interface PlayerNameChanges {
  embarkName: string;
  formerNames: FormerName[];
  events: NameChangeEvent[];
}

export interface ClubActivityEvent {
  day: string;
  type: string;
  embarkName: string;
  displayName: string;
  slug: string;
  rank: number | null;
  prevRank: number | null;
  rankDelta: number | null;
  score: number | null;
  scoreDelta: number | null;
  league: string | null;
  prevLeague: string | null;
}

export interface PlayerClubActivity {
  clubTag: string | null;
  embarkName: string;
  events: ClubActivityEvent[];
}

export interface PlayerBanStatus {
  ban: BanRecord | null;
}

export interface ComparedPlayer {
  embarkName: string;
  name: string;
  slug: string;
  clubTag: string | null;
  steamName: string | null;
  psnName: string | null;
  xboxName: string | null;
  metrics: Loose;
}

export interface PlayerComparison {
  a: ComparedPlayer;
  b: ComparedPlayer;
  /** For each metric, `"a"`, `"b"` or `"tie"`. */
  winner: Record<string, string>;
}

export interface PlayerSearchHit {
  embarkName: string;
  displayName: string;
  slug: string;
  rank: number | null;
  score: number | null;
  scoreLabel: string;
  league: string | null;
  clubTag: string | null;
  steamName: string | null;
  psnName: string | null;
  xboxName: string | null;
}

export interface PlayerSearchResult {
  query: string;
  players: PlayerSearchHit[];
}

export interface ResolvedName {
  found: boolean;
  id?: string;
  name?: string;
  slug?: string;
  url?: string;
  handles?: { steam: string[]; psn: string[]; xbox: string[] };
}

export interface PlayerDirectory {
  page: number;
  perPage: number;
  hasMore: boolean;
  filtered: boolean;
  players: {
    embarkName: string;
    slug: string;
    displayName: string;
    bestRank: number | null;
    currentRank: number | null;
    boardCount: number;
    active: boolean;
  }[];
  directoryTotal: number;
}

// ── Matches ──────────────────────────────────────────────────────────────

export interface PlayerMatch {
  id: string;
  mode: Loose;
  map: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  rounds: number;
  url: string;
  /** Set when `recordedByPlayer` is `true`, otherwise `null`. */
  result: MatchResult | null;
  placement: number | null;
  team: Loose;
  class: string;
  stats: Loose;
  players: number;
  recordedByPlayer: boolean;
}

export interface PlayerMatches {
  embarkName: string;
  /** First page only. */
  total?: number;
  /** First page only. */
  lastPlayed?: string;
  matches: PlayerMatch[];
  nextCursor: string | null;
}

export interface MatchTeam {
  name: string;
  placement: number;
  cash: number;
  totals: Loose;
  players: Loose[];
}

export interface MatchDetails {
  match: {
    id: string;
    mode: Loose;
    map: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    rounds: number;
    url: string;
    result: MatchResult | null;
    placement: number | null;
    recordedBy: Loose | null;
  };
  teams: MatchTeam[];
}

// ── Leaderboards ─────────────────────────────────────────────────────────

export interface CatalogBoard {
  id: string;
  label: string;
  [key: string]: unknown;
}

export interface LeaderboardCatalog {
  currentSeason: string;
  total: number;
  groups: { season: string; seasonLabel: string; live: boolean; boards: CatalogBoard[] }[];
}

export interface LeaderboardRow {
  name: string;
  rank: number;
  extra: Loose;
  score: number;
  change: number;
  league: string | null;
  clubTag: string | null;
  psnName: string | null;
  xboxName: string | null;
  steamName: string | null;
  scoreLabel: string;
  leagueNumber: number | null;
}

export interface Leaderboard {
  meta: {
    leaderboardId: string;
    platform: string;
    season: string;
    mode: string;
    label: string;
    live: boolean;
    updatedAt: string;
    count: number;
    nameFilter: string | null;
    returnCountOnly: boolean;
  };
  pagination: Pagination;
  count: number;
  data: LeaderboardRow[];
}

export interface LeaderboardStats {
  meta: { leaderboardId: string; platform: string; season: string; mode: string; label: string; updatedAt: string; scoreLabel: string };
  totalProfiles: number;
  scored: number;
  score: { min: number; max: number; avg: number; median: number; top1pct: number };
  leagues: { league: string; count: number; minScore: number; maxScore: number; rank: number; pct: number }[];
  histogram: { binSize: number; bins: Loose[] };
}

export interface RankTier {
  league: string;
  tier: string;
  division: number;
  slug: string;
  icon: string;
  minScore: number;
  maxScore: number | null;
  scoreBased: boolean;
  note: string | null;
  players: number;
  pct: number;
  observedMin: number | null;
  observedMax: number | null;
}

export interface RanksResponse {
  meta: {
    leaderboardId: string;
    label: string;
    updatedAt: string;
    boardCutoff: number;
    totalProfiles: number;
    rsPerDivision: number;
    rubyTop: number;
  };
  ranks: RankTier[];
}

// ── Seasons ──────────────────────────────────────────────────────────────

export interface SeasonPlayer {
  embarkName: string;
  displayName: string;
  slug: string;
  rank: number;
  score: number;
  league: string | null;
  clubTag: string | null;
}

export interface SeasonsResponse {
  seasons: { season: string; label: string; live: boolean; boardCount: number; modes: number; entries: number; rankedId: string; champion: Loose | null }[];
  currentSeason: string;
}

export interface SeasonDetail {
  season: string;
  label: string;
  live: boolean;
  rankedId: string;
  rankedLabel: string;
  scoreLabel: string;
  champion: SeasonPlayer | null;
  top: SeasonPlayer[];
  modes: Loose[];
  boardCount: number;
  totalEntries: number;
  newer: { season: string; label: string } | null;
  older: { season: string; label: string } | null;
}

export interface WrappedSeasons {
  seasons: { id: string; label: string; live: boolean; players: number }[];
}

export interface Wrapped {
  available: boolean;
  embarkName: string;
  season: { id: string; label: string; live: boolean };
  [key: string]: unknown;
}

// ── Movers & events ──────────────────────────────────────────────────────

export interface Mover {
  rank: number | null;
  slug: string;
  score: number;
  league: string | null;
  clubTag: string | null;
  prevRank: number | null;
  rankDelta: number | null;
  embarkName: string;
  prevLeague: string | null;
  scoreDelta: number | null;
  displayName: string;
}

export interface MoversResponse {
  day: string;
  leaderboardId: string;
  platform: string;
  label: string;
  computedAt: string;
  baselineAt: string;
  gainers: Mover[];
  losers: Mover[];
  entrants: Mover[];
  dropouts: Mover[];
  clubMoves: Loose[];
  stats: Loose;
  days: { day: string; stats: Loose }[];
}

export interface MoversDays {
  days: { day: string; stats: Loose }[];
}

export interface EventsFeed {
  events: (NameChangeEvent & { clubTag: string | null; rank: number | null; score: number | null; league: string | null })[];
}

// ── Bans ─────────────────────────────────────────────────────────────────

export interface BanRecord {
  embarkName: string;
  displayName: string;
  slug: string;
  season: string;
  seasonLabel: string;
  leaderboardId: string;
  status: string;
  banType: string;
  banTypeLabel: string;
  banReason: string | null;
  banDuration: string | null;
  detection: string;
  lastSeenAt: string;
  detectedAt: string;
  confirmedAt: string | null;
  returnedAt: string | null;
  lastRank: number;
  lastScore: number;
  lastLeague: string | null;
  peakRank: number | null;
  clubTag: string | null;
  platforms: Loose;
  cutoffScore: number | null;
  margin: number | null;
  [key: string]: unknown;
}

export interface BanList extends Pagination {
  bans: BanRecord[];
  stats: Loose;
  seasons: { season: string; label: string; suspected: number; confirmed: number; returned: number; dismissed: number }[];
  disclaimer: string;
}

export interface BanRecordResponse {
  [key: string]: unknown;
}

// ── Clubs ────────────────────────────────────────────────────────────────

export interface ClubList extends Pagination {
  fetchedAt: string;
  clubs: { clubTag: string; memberCount: number; boardCount: number; bestRank: number }[];
}

export interface ClubRankingRow {
  clubTag: string;
  clubRank: number;
  power: number;
  members: number;
  bestRank: number;
  bestPlayer: string;
  avgScore: number;
  totalScore: number;
  topLeague: string | null;
  updatedAt: string;
}

export interface ClubRanking extends Pagination {
  board: { id: string; platform: string; label: string };
  coreSize: number;
  minMembers: number;
  clubs: ClubRankingRow[];
}

export interface Club {
  clubTag: string;
  fetchedAt: string;
  members: { name: string; bestRank: number }[];
  boards: { leaderboardId: string; label: string; season: string; rank: number; totalValue: number }[];
  memberCount: number;
  boardCount: number;
  bestRank: number;
  stats: Loose | null;
  roster: { embarkName: string; rank: number; score: number; league: string | null }[];
}

// ── Hall of Fame ─────────────────────────────────────────────────────────

export interface HallOfFame {
  generatedAt: string;
  currentSeason: string;
  stats: { players: number; boards: number; entries: number; seasons: number; veterans: number };
  seasons: { id: string; label: string; short: string }[];
  method: Loose;
  lists: { alltime: string[]; peak: string[]; consistency: string[]; versatility: string[]; veterans: string[] };
  /** Keyed by Embark name. */
  players: Record<string, Loose>;
}

export interface BadgeCatalog {
  generatedAt: string;
  players: number;
  categories: { id: string; label: string; blurb: string }[];
  badges: { id: string; cat: string; tier: string; name: string; how: string; image: string; holders: number; pct: number; rarity: string }[];
}

// ── Items ────────────────────────────────────────────────────────────────

export interface ItemSections {
  sections: { key: string; label: string; icon: string; count: number; preview: Loose[] }[];
  builds: { patch: string; list: Loose[] };
  cosmeticTypes: { type: string; count: number }[];
  featured: { name: string; type: string; rarity: string; url: string; image: ImageAsset }[];
}

export interface ItemSummary {
  kind: string;
  slug: string;
  name: string;
  url: string;
  build: string;
  builds: string[];
  category: string;
  unlock: string;
  tagline: string;
  image: ImageAsset | null;
  stats: Loose;
  skinCount: number;
}

export interface ItemSectionList {
  kind: string;
  section: string;
  items: ItemSummary[];
  builds: string[];
  categories: string[];
}

export interface ItemDetail extends ItemSummary {
  summary: string;
  raw: Record<string, string>;
  statMax: Record<string, number>;
  skins: { name: string; rarity: string; season: number; url: string; image: ImageAsset | null }[];
  related: { name: string; url: string; image: ImageAsset | null; category: string }[];
}

export interface ItemSearchResult {
  query: string;
  results: { kind: string; section: string; slug: string; name: string; subtitle: string; rarity: string | null; url: string; image: ImageAsset | null }[];
}

export interface CosmeticFacets {
  types: { value: string; count: number }[];
  rarities: string[];
  seasons: { value: number; count: number }[];
  builds: string[];
  equipment: { value: string; label: string; kind: string; count: number }[];
  sponsors: { value: string; label: string; count: number }[];
  sources: { value: string; label: string }[];
}

export interface ClassLoadouts {
  builds: number;
  specs: Loose[];
  weapons: Loose[];
  gadgets: Loose[];
}

export interface MetaLoadouts {
  light: ClassLoadouts;
  medium: ClassLoadouts;
  heavy: ClassLoadouts;
}

// ── Search ───────────────────────────────────────────────────────────────

export interface GlobalSearchResult {
  type: string;
  players?: Pagination & { board: Loose; players: Loose[] };
  clubs?: Pagination & { fetchedAt: string; clubs: Loose[] };
  items?: Loose;
  events?: Pagination & { events: Loose[] };
}

// ── Population ───────────────────────────────────────────────────────────

export interface PlayerCount {
  appId: number;
  now: { steam: number; at: string; measured: boolean };
  estimate: Loose;
  day: { peak: number; peakHourUtc: number; low: number; lowHourUtc: number; avg: number; position: number };
  week: Loose;
  vsUsual: number;
  players: Loose;
  allTime: { peak: number; month: string };
  rhythm: { hourFactorUtc: number[]; weekdayFactorUtc: number[] };
  model: Loose;
  milestones: { at: string; label: string; value: number; text: string }[];
}

// ── Webhooks ─────────────────────────────────────────────────────────────

export type TheFinalsEventType =
  | 'thefinals.rank_changed'
  | 'thefinals.league_changed'
  | 'thefinals.club_changed'
  | 'thefinals.renamed'
  | 'thefinals.ban_detected'
  | 'arenyze.test';

/** A signed delivery from Arenyze webhooks (docs.arenyze.com/webhooks). */
export interface WebhookEvent<T = Loose> {
  id: string;
  type: TheFinalsEventType | string;
  game: string;
  player: string | null;
  occurred_at: string;
  data: T;
  text: string;
}

export interface DiscordWebhookResult {
  success: true;
  messageId?: string;
  sentAt: string;
}

export interface RateLimitInfo {
  /** Requests allowed per minute on this game. */
  limit: number | null;
  /** Requests left in the current minute. */
  remaining: number | null;
  /** Monthly calls of the plan (all games). */
  quotaLimit: number | null;
  /** Calls used this month (all games). */
  quotaUsed: number | null;
}
