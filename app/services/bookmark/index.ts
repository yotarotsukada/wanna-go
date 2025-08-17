// 公開API（既存のサービスAPIと互換性維持）
export {
  createBookmarkWorkflow as createBookmark,
  getBookmarkById as getBookmark,
  getBookmarkByIdStrict,
  getGroupBookmarksWorkflow as getGroupBookmarks,
  updateBookmarkWorkflow as updateBookmark,
  toggleBookmarkVisitedWorkflow as toggleBookmarkVisited,
  updateBookmarkMetadataWorkflow as updateBookmarkMetadata,
  deleteBookmarkWorkflow as deleteBookmark
} from './service';

// 型定義の再エクスポート
export type { 
  BookmarkStats, 
  BookmarksResponse 
} from './service';

// エンティティとエラーも再エクスポート（フロントエンド用）
export type { Bookmark, BookmarkWithThemes } from '../../entities/bookmark/bookmark';
export type { BookmarkError } from '../../entities/bookmark/bookmark-errors';
export {
  BookmarkNotFoundError,
  InvalidBookmarkUrlError,
  BookmarkValidationError,
  InvalidPriorityError
} from '../../entities/bookmark/bookmark-errors';

// エンティティの操作関数もエクスポート（フロントエンド用）
export {
  createBookmark as createBookmarkEntity,
  updateBookmark as updateBookmarkEntity,
  markAsVisited,
  markAsUnvisited,
  updateAutoMetadata,
  validateBookmarkUrl,
  validateBookmarkTitle,
  validatePriority,
  normalizeMemo,
  normalizeAddress,
  normalizeAutoData,
  generateBookmarkId,
  bookmarkToJson,
  bookmarkFromJson,
  pipe
} from '../../entities/bookmark/bookmark';