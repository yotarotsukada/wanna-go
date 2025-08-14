// 公開API（既存のサービスAPIと互換性維持）
export {
  createGroupWorkflow as createGroup,
  getGroupById as getGroup,
  updateGroupWorkflow as updateGroup,
  generateGroupId
} from './service';

// エンティティとエラーも再エクスポート（フロントエンド用）
export type { Group } from '../../entities/group/group';
export type { GroupError } from '../../entities/group/group-errors';
export {
  GroupNotFoundError,
  InvalidGroupIdError,
  DuplicateGroupIdError,
  GroupValidationError
} from '../../entities/group/group-errors';

// エンティティの操作関数もエクスポート（フロントエンド用）
export {
  createGroup as createGroupEntity,
  updateGroupInfo,
  validateGroupId,
  validateGroupName,
  validateGroupDescription,
  groupToJson,
  groupFromJson,
  pipe
} from '../../entities/group/group';