// グループ関連エラーをエンティティとして定義
export class GroupNotFoundError extends Error {
  readonly code = 'GROUP_NOT_FOUND' as const;
  
  constructor(public readonly groupId: string) {
    super(`Group not found: ${groupId}`);
    this.name = 'GroupNotFoundError';
  }
}

export class InvalidGroupIdError extends Error {
  readonly code = 'INVALID_GROUP_ID' as const;
  
  constructor(public readonly groupId: string) {
    super(`Invalid group ID format: ${groupId}`);
    this.name = 'InvalidGroupIdError';
  }
}

export class DuplicateGroupIdError extends Error {
  readonly code = 'DUPLICATE_GROUP_ID' as const;
  
  constructor(public readonly groupId: string) {
    super(`Group ID already exists: ${groupId}`);
    this.name = 'DuplicateGroupIdError';
  }
}

export class GroupValidationError extends Error {
  readonly code = 'GROUP_VALIDATION_ERROR' as const;
  
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'GroupValidationError';
  }
}

// エラー型のユニオン
export type GroupError = 
  | GroupNotFoundError 
  | InvalidGroupIdError 
  | DuplicateGroupIdError 
  | GroupValidationError;