import { db } from '../db.server';
import { groupFromJson, groupToJson, type Group } from '../../entities/group/group';
import { GroupNotFoundError } from '../../entities/group/group-errors';

// リポジトリインターface
interface GroupRepository {
  findById(groupId: string): Promise<Group | null>;
  getById(groupId: string): Promise<Group>;
  exists(groupId: string): Promise<boolean>;
  save(group: Group): Promise<Group>;
}

// 具象実装（関数で作成）
export const createGroupRepository = (): GroupRepository => ({
  async findById(groupId: string): Promise<Group | null> {
    const model = await db.group.findUnique({
      where: { id: groupId }
    });
    
    return model ? groupFromJson(model) : null;
  },

  async getById(groupId: string): Promise<Group> {
    const group = await this.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(groupId);
    }
    return group;
  },

  async exists(groupId: string): Promise<boolean> {
    const count = await db.group.count({
      where: { id: groupId }
    });
    return count > 0;
  },

  async save(group: Group): Promise<Group> {
    const data = groupToJson(group);
    const saved = await db.group.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        updatedAt: data.updatedAt
      }
    });
    
    return groupFromJson(saved);
  }
});