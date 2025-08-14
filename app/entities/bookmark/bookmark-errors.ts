// ブックマーク関連エラーをエンティティとして定義
export class BookmarkNotFoundError extends Error {
  readonly code = 'BOOKMARK_NOT_FOUND' as const;
  
  constructor(public readonly bookmarkId: string) {
    super(`Bookmark not found: ${bookmarkId}`);
    this.name = 'BookmarkNotFoundError';
  }
}

export class InvalidBookmarkUrlError extends Error {
  readonly code = 'INVALID_BOOKMARK_URL' as const;
  
  constructor(public readonly url: string) {
    super(`Invalid URL format: ${url}`);
    this.name = 'InvalidBookmarkUrlError';
  }
}

export class BookmarkValidationError extends Error {
  readonly code = 'BOOKMARK_VALIDATION_ERROR' as const;
  
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'BookmarkValidationError';
  }
}

export class InvalidPriorityError extends Error {
  readonly code = 'INVALID_PRIORITY' as const;
  
  constructor(public readonly priority: number) {
    super(`Priority must be an integer between 1 and 5, got: ${priority}`);
    this.name = 'InvalidPriorityError';
  }
}

// エラー型のユニオン
export type BookmarkError = 
  | BookmarkNotFoundError 
  | InvalidBookmarkUrlError 
  | BookmarkValidationError 
  | InvalidPriorityError;