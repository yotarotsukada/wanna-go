import type { Category } from '../../lib/constants';
import { 
  InvalidBookmarkUrlError, 
  BookmarkValidationError, 
  InvalidPriorityError,
  type BookmarkError 
} from './bookmark-errors';

// エンティティ型定義
export interface Bookmark {
  readonly id: string;
  readonly groupId: string;
  readonly title: string;
  readonly url: string;
  readonly category: Category;
  readonly memo: string | null;
  readonly address: string | null;
  readonly priority: number;
  readonly visited: boolean;
  readonly visitedAt: string | null;
  readonly autoTitle: string | null;
  readonly autoDescription: string | null;
  readonly autoImageUrl: string | null;
  readonly autoSiteName: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// バリデーション関数（冪等）
export const validateBookmarkUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    throw new InvalidBookmarkUrlError(url);
  }
};

export const validateBookmarkTitle = (title: string): string => {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new BookmarkValidationError('Bookmark title is required', 'title');
  }
  if (trimmed.length > 200) {
    throw new BookmarkValidationError('Bookmark title too long (max 200 characters)', 'title');
  }
  return trimmed;
};

export const validatePriority = (priority: number): number => {
  if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
    throw new InvalidPriorityError(priority);
  }
  return priority;
};

export const normalizeMemo = (memo?: string): string | null => {
  if (!memo) return null;
  const trimmed = memo.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeAddress = (address?: string): string | null => {
  if (!address) return null;
  const trimmed = address.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeAutoData = (data?: string): string | null => {
  if (!data) return null;
  const trimmed = data.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// ID生成関数（冪等）
export const generateBookmarkId = (): string => 
  'bm' + Date.now().toString(36) + Math.random().toString(36).substr(2);

// ファクトリ関数
export const createBookmark = (input: {
  groupId: string;
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
}): Bookmark => {
  const now = new Date().toISOString();
  
  return {
    id: generateBookmarkId(),
    groupId: input.groupId,
    title: validateBookmarkTitle(input.title),
    url: validateBookmarkUrl(input.url),
    category: input.category,
    memo: normalizeMemo(input.memo),
    address: normalizeAddress(input.address),
    priority: validatePriority(input.priority ?? 3),
    visited: false,
    visitedAt: null,
    autoTitle: normalizeAutoData(input.autoTitle),
    autoDescription: normalizeAutoData(input.autoDescription),
    autoImageUrl: normalizeAutoData(input.autoImageUrl),
    autoSiteName: normalizeAutoData(input.autoSiteName),
    createdAt: now,
    updatedAt: now
  };
};

// 更新関数（冪等）
export const updateBookmark = (
  bookmark: Bookmark,
  updates: {
    title: string;
    url: string;
    category: Category;
    memo?: string;
    address?: string;
    priority?: number;
  }
): Bookmark => ({
  ...bookmark,
  title: validateBookmarkTitle(updates.title),
  url: validateBookmarkUrl(updates.url),
  category: updates.category,
  memo: normalizeMemo(updates.memo),
  address: normalizeAddress(updates.address),
  priority: validatePriority(updates.priority ?? bookmark.priority),
  updatedAt: new Date().toISOString()
});

// 訪問状態変更関数（冪等）
export const markAsVisited = (bookmark: Bookmark): Bookmark => ({
  ...bookmark,
  visited: true,
  visitedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const markAsUnvisited = (bookmark: Bookmark): Bookmark => ({
  ...bookmark,
  visited: false,
  visitedAt: null,
  updatedAt: new Date().toISOString()
});

// 自動取得データの更新（冪等）
export const updateAutoMetadata = (
  bookmark: Bookmark,
  metadata: {
    autoTitle?: string;
    autoDescription?: string;
    autoImageUrl?: string;
    autoSiteName?: string;
  }
): Bookmark => ({
  ...bookmark,
  autoTitle: normalizeAutoData(metadata.autoTitle),
  autoDescription: normalizeAutoData(metadata.autoDescription),
  autoImageUrl: normalizeAutoData(metadata.autoImageUrl),
  autoSiteName: normalizeAutoData(metadata.autoSiteName),
  updatedAt: new Date().toISOString()
});

// 変換関数
export const bookmarkToJson = (bookmark: Bookmark) => ({
  id: bookmark.id,
  groupId: bookmark.groupId,
  title: bookmark.title,
  url: bookmark.url,
  category: bookmark.category,
  memo: bookmark.memo,
  address: bookmark.address,
  priority: bookmark.priority,
  visited: bookmark.visited,
  visitedAt: bookmark.visitedAt,
  autoTitle: bookmark.autoTitle,
  autoDescription: bookmark.autoDescription,
  autoImageUrl: bookmark.autoImageUrl,
  autoSiteName: bookmark.autoSiteName,
  createdAt: bookmark.createdAt,
  updatedAt: bookmark.updatedAt
});

export const bookmarkFromJson = (data: any): Bookmark => ({
  id: data.id,
  groupId: data.groupId,
  title: validateBookmarkTitle(data.title),
  url: validateBookmarkUrl(data.url),
  category: data.category,
  memo: normalizeMemo(data.memo),
  address: normalizeAddress(data.address),
  priority: validatePriority(data.priority),
  visited: Boolean(data.visited),
  visitedAt: data.visitedAt,
  autoTitle: normalizeAutoData(data.autoTitle),
  autoDescription: normalizeAutoData(data.autoDescription),
  autoImageUrl: normalizeAutoData(data.autoImageUrl),
  autoSiteName: normalizeAutoData(data.autoSiteName),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

// パイプライン用のヘルパー
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);