// Parameter interfaces for @arenyze/the-finals

import { BanSort, BanStatus, GlobalSearchType, HandlePlatform, ItemSection, LeaderboardPlatform } from './base-types';

export interface PlayerHistoryParams {
  /** Window in days (default 30, max 90). */
  days?: number;
  /** Leaderboard id (default: the live Ranked board). */
  board?: string;
}

export interface PlayerDirectoryParams {
  /** Name prefix. */
  q?: string;
  /** `true` = only players on a live board. */
  active?: boolean;
  /** Best rank at least… */
  minBest?: number;
  /** …and at most. */
  maxBest?: number;
  /** Present on at least N boards. */
  minBoards?: number;
  page?: number;
  /** Default 50, max 100. */
  perPage?: number;
}

export interface PlayerMatchesParams {
  /** Matches per page (default 20, max 50). */
  limit?: number;
  /** `nextCursor` of the previous page; omit it for the newest matches. */
  cursor?: string;
}

export interface IterateMatchesParams extends PlayerMatchesParams {
  /** Stop after this many matches (default: the whole history). */
  max?: number;
}

export interface BoardPlatformParams {
  /** Default `crossplay`. */
  platform?: LeaderboardPlatform;
}

export interface LeaderboardParams extends BoardPlatformParams {
  /** Filter rows by name (case-insensitive substring). */
  name?: string;
  /** `true` returns only the totals. */
  count?: boolean;
  page?: number;
  /** Default 50, max 200. */
  perPage?: number;
}

export interface RanksParams {
  /** Leaderboard id (default: live Ranked). */
  board?: string;
}

export interface SeasonParams {
  /** How many top players per board (default 10). */
  top?: number;
}

export interface WrappedParams {
  /** Season id (default: latest finished season). */
  season?: string;
  /** IANA time zone for "best day" stats, e.g. `Europe/Rome`. */
  tz?: string;
}

export interface EventsParams {
  /** How many (default 60, max 200). */
  limit?: number;
  /** `name-change` (only kind today). */
  kind?: 'name-change' | string;
  /** Filter by name. */
  q?: string;
  /** Skip N events. */
  offset?: number;
}

export interface BansParams {
  season?: string;
  /** Filter by name. */
  q?: string;
  status?: BanStatus;
  /** Ban type, e.g. `removed`. */
  type?: string;
  /** Default `recent`. */
  sort?: BanSort;
  page?: number;
  /** Default 50, max 100. */
  perPage?: number;
}

export interface ClubsParams {
  /** Tag prefix. */
  q?: string;
  page?: number;
  perPage?: number;
}

export interface ItemSearchParams {
  q: string;
  /** Restrict to a section. */
  kind?: ItemSection;
  /** Max results. */
  limit?: number;
}

export interface GlobalSearchParams {
  q: string;
  /** Default `all`. */
  type?: GlobalSearchType;
  /** Restrict players to a leaderboard id. */
  board?: string;
  /** Filter by league, e.g. `Diamond 1`. */
  league?: string;
  /** Filter by club tag. */
  club?: string;
  platform?: HandlePlatform;
  minRank?: number;
  maxRank?: number;
  page?: number;
}

export interface DiscordWebhookOptions {
  /** Embed title (default: the player's name). */
  title?: string;
  /** Embed description. */
  description?: string;
  /** Plain message sent above the embed. */
  message?: string;
  /** Embed colour as a number, e.g. `0xd31f3c`. */
  color?: number;
  /** Thumbnail image URL. */
  avatarUrl?: string;
}
