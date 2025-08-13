import { db } from './db.server';
import type { Group } from '../lib/types';

export function generateGroupId(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateUniqueGroupId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateGroupId();
    const existingGroup = await db.group.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return id;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate unique group ID after maximum attempts');
}

export async function checkGroupIdAvailability(groupId: string): Promise<boolean> {
  try {
    const existingGroup = await db.group.findUnique({
      where: { id: groupId }
    });
    return !existingGroup;
  } catch (error) {
    console.error('Error checking group ID availability:', error);
    return false;
  }
}

export async function getGroup(groupId: string): Promise<Group | null> {
  return await db.group.findUnique({
    where: { id: groupId }
  });
}

export async function createGroup(data: {
  name: string;
  description?: string;
  id?: string;
}): Promise<Group> {
  let groupId;
  if (data.id) {
    const isAvailable = await checkGroupIdAvailability(data.id);
    if (!isAvailable) {
      throw new Error('Group ID already exists');
    }
    groupId = data.id;
  } else {
    groupId = await generateUniqueGroupId();
  }

  return await db.group.create({
    data: {
      id: groupId,
      name: data.name,
      description: data.description || null
    }
  });
}

export async function updateGroup(
  groupId: string,
  data: { name: string; description?: string }
): Promise<Group> {
  return await db.group.update({
    where: { id: groupId },
    data: {
      name: data.name,
      description: data.description || null
    }
  });
}