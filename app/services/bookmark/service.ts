import { 
  createBookmark, 
  updateBookmark, 
  markAsVisited, 
  markAsUnvisited,
  updateAutoMetadata,
  type Bookmark,
  type BookmarkWithThemes 
} from '../../entities/bookmark/bookmark';
import type { Category } from '../../lib/constants';
import { createBookmarkRepository } from './repository';
import { cache, generateCacheKey, getOrSet } from '../../lib/cache.server';

// リポジトリインスタンス（シングルトン）
const bookmarkRepo = createBookmarkRepository();

// ブックマーク統計型
export interface BookmarkStats {
  total_count: number;
  visited_count: number;
  unvisited_count: number;
  avg_priority: number;
}

// ブックマーク一覧レスポンス型
export interface BookmarksResponse {
  bookmarks: BookmarkWithThemes[];
  total: number;
  stats: BookmarkStats;
}

// ブックマーク作成ワークフロー
export const createBookmarkWorkflow = async (
  groupId: string,
  input: {
    title: string;
    url: string;
    category: Category;
    memo?: string;
    address?: string;
    priority?: number;
    autoTitle?: string;
    autoDescription?: string;
    autoImageUrl?: string;
    autoSiteName?: string;
  }
): Promise<Bookmark> => {
  const bookmark = createBookmark({
    groupId,
    ...input
  });
  
  const result = await bookmarkRepo.save(bookmark);
  
  // キャッシュ無効化
  const cacheKey = generateCacheKey('bookmarks', groupId);
  cache.delete(cacheKey);
  
  return result;
};

// ブックマーク取得
export const getBookmarkById = async (bookmarkId: string): Promise<Bookmark | null> => {
  return await bookmarkRepo.findById(bookmarkId);
};

// ブックマーク詳細取得（エラーありバージョン）
export const getBookmarkByIdStrict = async (bookmarkId: string): Promise<Bookmark> => {
  return await bookmarkRepo.getById(bookmarkId);
};

// グループのブックマーク一覧取得（効率化版+キャッシュ）
export const getGroupBookmarksWorkflow = async (
  groupId: string,
  filters?: {
    category?: string;
    visited?: string;
    search?: string;
  }
): Promise<BookmarksResponse> => {
  // フィルターが適用されていない場合のみキャッシュを使用
  const useCache = !filters?.category && !filters?.visited && !filters?.search;
  
  if (useCache) {
    const cacheKey = generateCacheKey('bookmarks', groupId);
    return await getOrSet(cacheKey, async () => {
      const result = await bookmarkRepo.findByGroupIdWithStats(groupId, filters);
      return {
        bookmarks: result.bookmarks,
        total: result.bookmarks.length,
        stats: {
          total_count: result.stats.total,
          visited_count: result.stats.visited,
          unvisited_count: result.stats.unvisited,
          avg_priority: result.stats.avgPriority
        }
      };
    }, 60000); // 1分キャッシュ
  }

  // フィルターが適用されている場合は毎回取得
  const result = await bookmarkRepo.findByGroupIdWithStats(groupId, filters);
  return {
    bookmarks: result.bookmarks,
    total: result.bookmarks.length,
    stats: {
      total_count: result.stats.total,
      visited_count: result.stats.visited,
      unvisited_count: result.stats.unvisited,
      avg_priority: result.stats.avgPriority
    }
  };
};

// ブックマーク更新ワークフロー
export const updateBookmarkWorkflow = async (
  bookmarkId: string,
  updates: {
    title: string;
    url: string;
    category: Category;
    memo?: string;
    address?: string;
    priority?: number;
    visited?: boolean;
  }
): Promise<Bookmark> => {
  const bookmark = await bookmarkRepo.getById(bookmarkId);
  let updated = updateBookmark(bookmark, {
    title: updates.title,
    url: updates.url,
    category: updates.category,
    memo: updates.memo,
    address: updates.address,
    priority: updates.priority
  });

  // 訪問状態の変更
  if (updates.visited !== undefined) {
    updated = updates.visited ? markAsVisited(updated) : markAsUnvisited(updated);
  }

  const result = await bookmarkRepo.save(updated);
  
  // キャッシュ無効化
  const cacheKey = generateCacheKey('bookmarks', bookmark.groupId);
  cache.delete(cacheKey);
  
  return result;
};

// ブックマーク訪問状態変更ワークフロー
export const toggleBookmarkVisitedWorkflow = async (
  bookmarkId: string,
  visited: boolean
): Promise<Bookmark> => {
  const bookmark = await bookmarkRepo.getById(bookmarkId);
  const updated = visited ? markAsVisited(bookmark) : markAsUnvisited(bookmark);
  const result = await bookmarkRepo.save(updated);
  
  // キャッシュ無効化
  const cacheKey = generateCacheKey('bookmarks', bookmark.groupId);
  cache.delete(cacheKey);
  
  return result;
};

// ブックマーク自動メタデータ更新ワークフロー
export const updateBookmarkMetadataWorkflow = async (
  bookmarkId: string,
  metadata: {
    autoTitle?: string;
    autoDescription?: string;
    autoImageUrl?: string;
    autoSiteName?: string;
  }
): Promise<Bookmark> => {
  const bookmark = await bookmarkRepo.getById(bookmarkId);
  const updated = updateAutoMetadata(bookmark, metadata);
  return await bookmarkRepo.save(updated);
};

// ブックマーク削除ワークフロー
export const deleteBookmarkWorkflow = async (bookmarkId: string): Promise<void> => {
  // 削除前にグループIDを取得
  const bookmark = await bookmarkRepo.getById(bookmarkId);
  
  await bookmarkRepo.delete(bookmarkId);
  
  // キャッシュ無効化
  const cacheKey = generateCacheKey('bookmarks', bookmark.groupId);
  cache.delete(cacheKey);
};