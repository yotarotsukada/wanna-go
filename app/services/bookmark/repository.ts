import { db } from '../db.server';
import { bookmarkFromJson, bookmarkToJson, type Bookmark, type BookmarkWithThemes } from '../../entities/bookmark/bookmark';
import { BookmarkNotFoundError } from '../../entities/bookmark/bookmark-errors';

// リポジトリインターface
interface BookmarkRepository {
  findById(bookmarkId: string): Promise<Bookmark | null>;
  getById(bookmarkId: string): Promise<Bookmark>;
  findByGroupId(
    groupId: string,
    filters?: {
      category?: string;
      visited?: string;
      search?: string;
    }
  ): Promise<BookmarkWithThemes[]>;
  findByIdWithThemes(bookmarkId: string): Promise<BookmarkWithThemes | null>;
  save(bookmark: Bookmark): Promise<Bookmark>;
  delete(bookmarkId: string): Promise<void>;
  count(groupId: string): Promise<{
    total: number;
    visited: number;
    unvisited: number;
  }>;
  getAveragePriority(groupId: string): Promise<number>;
}

// 具象実装（関数で作成）
export const createBookmarkRepository = (): BookmarkRepository => ({
  async findById(bookmarkId: string): Promise<Bookmark | null> {
    const model = await db.bookmark.findUnique({
      where: { id: bookmarkId }
    });
    
    return model ? bookmarkFromJson(model) : null;
  },

  async getById(bookmarkId: string): Promise<Bookmark> {
    const bookmark = await this.findById(bookmarkId);
    if (!bookmark) {
      throw new BookmarkNotFoundError(bookmarkId);
    }
    return bookmark;
  },

  async findByIdWithThemes(bookmarkId: string): Promise<BookmarkWithThemes | null> {
    const model = await db.bookmark.findUnique({
      where: { id: bookmarkId },
      include: {
        bookmarkThemes: {
          include: {
            theme: true
          },
          orderBy: {
            theme: {
              createdAt: 'asc'
            }
          }
        }
      }
    });
    
    if (!model) return null;

    const bookmark = bookmarkFromJson(model);
    const themes = model.bookmarkThemes.map(bt => ({
      id: bt.theme.id,
      groupId: bt.theme.groupId,
      name: bt.theme.name,
      icon: bt.theme.icon,
      createdAt: bt.theme.createdAt,
      updatedAt: bt.theme.updatedAt
    }));

    return { ...bookmark, themes };
  },

  async findByGroupId(
    groupId: string,
    filters?: {
      category?: string;
      visited?: string;
      search?: string;
    }
  ): Promise<BookmarkWithThemes[]> {
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

    const models = await db.bookmark.findMany({
      where,
      include: {
        bookmarkThemes: {
          include: {
            theme: true
          },
          orderBy: {
            theme: {
              createdAt: 'asc'
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return models.map(model => {
      const bookmark = bookmarkFromJson(model);
      const themes = model.bookmarkThemes.map(bt => ({
        id: bt.theme.id,
        groupId: bt.theme.groupId,
        name: bt.theme.name,
        icon: bt.theme.icon,
        createdAt: bt.theme.createdAt,
        updatedAt: bt.theme.updatedAt
      }));
      return { ...bookmark, themes };
    });
  },

  async save(bookmark: Bookmark): Promise<Bookmark> {
    const data = bookmarkToJson(bookmark);
    const saved = await db.bookmark.upsert({
      where: { id: data.id },
      create: data,
      update: {
        title: data.title,
        url: data.url,
        category: data.category,
        memo: data.memo,
        address: data.address,
        priority: data.priority,
        visited: data.visited,
        visitedAt: data.visitedAt,
        autoTitle: data.autoTitle,
        autoDescription: data.autoDescription,
        autoImageUrl: data.autoImageUrl,
        autoSiteName: data.autoSiteName,
        updatedAt: data.updatedAt
      }
    });
    
    return bookmarkFromJson(saved);
  },

  async delete(bookmarkId: string): Promise<void> {
    await db.bookmark.delete({
      where: { id: bookmarkId }
    });
  },

  async count(groupId: string): Promise<{
    total: number;
    visited: number;
    unvisited: number;
  }> {
    const total = await db.bookmark.count({
      where: { groupId }
    });

    const visited = await db.bookmark.count({
      where: { groupId, visited: true }
    });

    return {
      total,
      visited,
      unvisited: total - visited
    };
  },

  async getAveragePriority(groupId: string): Promise<number> {
    const result = await db.bookmark.aggregate({
      where: { groupId },
      _avg: { priority: true }
    });

    return Number(result._avg.priority?.toFixed(1)) || 0;
  }
});