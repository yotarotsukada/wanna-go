import { db } from './db.server';
import type { Bookmark, BookmarksResponse, Category } from '../lib/types';

export async function getGroupBookmarks(
  groupId: string,
  filters?: {
    category?: string;
    visited?: string;
    search?: string;
  }
): Promise<BookmarksResponse> {
  let where: any = { groupId };

  if (filters?.category && filters.category !== 'all') {
    where.category = filters.category;
  }

  if (filters?.visited && filters.visited !== 'all') {
    where.visited = filters.visited === 'true';
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { memo: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const bookmarks = await db.bookmark.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // Get stats
  const stats = await db.bookmark.aggregate({
    where: { groupId },
    _count: { id: true },
    _avg: { priority: true }
  });

  const visitedCount = await db.bookmark.count({
    where: { groupId, visited: true }
  });

  return {
    bookmarks: bookmarks as Bookmark[],
    total: bookmarks.length,
    stats: {
      total_count: stats._count.id || 0,
      visited_count: visitedCount,
      unvisited_count: (stats._count.id || 0) - visitedCount,
      avg_priority: Number(stats._avg.priority?.toFixed(1)) || 0
    }
  };
}

export async function getBookmark(bookmarkId: string): Promise<(Bookmark & { group: any }) | null> {
  return await db.bookmark.findUnique({
    where: { id: bookmarkId },
    include: { group: true }
  }) as (Bookmark & { group: any }) | null;
}

export async function createBookmark(groupId: string, data: {
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
}): Promise<Bookmark> {
  const bookmarkId = 'bm' + Date.now().toString(36) + Math.random().toString(36).substr(2);

  return await db.bookmark.create({
    data: {
      id: bookmarkId,
      groupId,
      title: data.title,
      url: data.url,
      category: data.category,
      memo: data.memo || null,
      address: data.address || null,
      priority: data.priority || 3,
      autoTitle: data.autoTitle || null,
      autoDescription: data.autoDescription || null,
      autoImageUrl: data.autoImageUrl || null,
      autoSiteName: data.autoSiteName || null
    }
  }) as Bookmark;
}

export async function updateBookmark(bookmarkId: string, data: {
  title: string;
  url: string;
  category: Category;
  memo?: string;
  address?: string;
  priority?: number;
  visited?: boolean;
  visitedAt?: string;
}): Promise<Bookmark> {
  const updateData: any = {
    title: data.title,
    url: data.url,
    category: data.category,
    memo: data.memo || null,
    address: data.address || null,
    priority: data.priority || 3,
    visited: data.visited || false
  };

  if (data.visited && !data.visitedAt) {
    updateData.visitedAt = new Date();
  } else if (!data.visited) {
    updateData.visitedAt = null;
  } else if (data.visitedAt) {
    updateData.visitedAt = new Date(data.visitedAt);
  }

  return await db.bookmark.update({
    where: { id: bookmarkId },
    data: updateData
  }) as Bookmark;
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  await db.bookmark.delete({
    where: { id: bookmarkId }
  });
}