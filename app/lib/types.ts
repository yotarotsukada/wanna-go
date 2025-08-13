import type { Category } from './constants';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  groupId: string;
  title: string;
  url: string;
  category: Category;
  memo: string | null;
  address: string | null;
  priority: number;
  visited: boolean;
  visitedAt: string | null;
  autoTitle: string | null;
  autoDescription: string | null;
  autoImageUrl: string | null;
  autoSiteName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkStats {
  total_count: number;
  visited_count: number;
  unvisited_count: number;
  avg_priority: number;
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  stats: BookmarkStats;
}

export interface UrlMetadata {
  url: string;
  title: string;
  description: string;
  image: string;
  site_name: string;
  favicon: string;
  success: boolean;
  error: string | null;
}