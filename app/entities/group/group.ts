import { 
  InvalidGroupIdError, 
  GroupValidationError,
  type GroupError 
} from './group-errors';

// エンティティ型定義
export interface Group {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// バリデーション関数（冪等）
export const validateGroupId = (groupId: string): string => {
  if (!/^[0-9a-z]{8}$/.test(groupId)) {
    throw new InvalidGroupIdError(groupId);
  }
  return groupId;
};

export const validateGroupName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new GroupValidationError('Group name is required', 'name');
  }
  if (trimmed.length > 100) {
    throw new GroupValidationError('Group name too long (max 100 characters)', 'name');
  }
  return trimmed;
};

export const validateGroupDescription = (description?: string): string | null => {
  if (!description) return null;
  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// ファクトリ関数
export const createGroup = (input: {
  id: string;
  name: string;
  description?: string;
}): Group => {
  const now = new Date().toISOString();
  
  return {
    id: validateGroupId(input.id),
    name: validateGroupName(input.name),
    description: validateGroupDescription(input.description),
    createdAt: now,
    updatedAt: now
  };
};

// 更新関数（冪等）
export const updateGroupInfo = (
  group: Group,
  updates: {
    name: string;
    description?: string;
  }
): Group => ({
  ...group,
  name: validateGroupName(updates.name),
  description: validateGroupDescription(updates.description),
  updatedAt: new Date().toISOString()
});

// 変換関数
export const groupToJson = (group: Group) => ({
  id: group.id,
  name: group.name,
  description: group.description,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt
});

export const groupFromJson = (data: any): Group => ({
  id: validateGroupId(data.id),
  name: validateGroupName(data.name),
  description: validateGroupDescription(data.description),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

// パイプライン用のヘルパー
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);