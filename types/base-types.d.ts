// Base types for @arenyze/the-finals

/** `crossplay` for current seasons; `steam`, `psn` or `xbox` on older boards split by platform. */
export type LeaderboardPlatform = 'crossplay' | 'steam' | 'psn' | 'xbox';

export type HandlePlatform = 'steam' | 'psn' | 'xbox';

export type ItemSection = 'weapons' | 'gadgets' | 'specializations' | 'maps' | 'modes' | 'sponsors' | 'cosmetics';

export type BanStatus = 'suspected' | 'confirmed' | 'returned';

export type BanSort = 'recent' | 'rank' | 'score';

export type GlobalSearchType = 'all' | 'players' | 'clubs' | 'items';

export type MatchResult = 'win' | 'loss';

/** An image served by thefinals.arenyze.com (paths are relative to that site). */
export interface ImageAsset {
  url: string;
  width?: number;
  height?: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
