import { createGroup, updateGroupInfo, type Group } from '../../entities/group/group';
import { DuplicateGroupIdError } from '../../entities/group/group-errors';
import { createGroupRepository } from './repository';
import { cache, generateCacheKey, getOrSet } from '../../lib/cache.server';

// リポジトリインスタンス（シングルトン）
const groupRepo = createGroupRepository();

// ID生成関数（冪等）
export const generateGroupId = (): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 一意ID生成（副作用あり）
export const generateUniqueGroupId = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const candidateId = generateGroupId();
    const exists = await groupRepo.exists(candidateId);
    if (!exists) {
      return candidateId;
    }
    attempts++;
  }

  throw new DuplicateGroupIdError('Failed to generate unique ID');
};

// グループ作成ワークフロー
export const createGroupWorkflow = async (input: {
  name: string;
  description?: string;
}): Promise<Group> => {
  const groupId = await generateUniqueGroupId();
  const group = createGroup({
    id: groupId,
    name: input.name,
    description: input.description
  });
  
  return await groupRepo.save(group);
};

// グループ取得（キャッシュ付き）
export const getGroupById = async (groupId: string): Promise<Group | null> => {
  const cacheKey = generateCacheKey('group', groupId);
  return await getOrSet(cacheKey, async () => {
    return await groupRepo.findById(groupId);
  }, 300000); // 5分キャッシュ（グループ情報はあまり変更されない）
};

// グループ更新ワークフロー
export const updateGroupWorkflow = async (
  groupId: string,
  updates: { name: string; description?: string }
): Promise<Group> => {
  const group = await groupRepo.getById(groupId);
  const updated = updateGroupInfo(group, updates);
  return await groupRepo.save(updated);
};