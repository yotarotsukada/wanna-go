// 新しいfeature-based serviceへの薄いファサード
export {
  getGroupBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  toggleBookmarkVisited
} from './bookmark';

// 型定義の再エクスポート（後方互換性）
export type { 
  BookmarksResponse 
} from './bookmark';