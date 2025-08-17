import { type PrismaClient } from "@prisma/client";
import { type Theme, type CreateTheme, type UpdateTheme, type ThemeWithBookmarkCount } from "~/entities/theme/theme";

export class ThemeRepository {
  constructor(private db: PrismaClient) {}

  async findByGroupId(groupId: string): Promise<ThemeWithBookmarkCount[]> {
    const themes = await this.db.theme.findMany({
      where: { groupId },
      include: {
        _count: {
          select: {
            bookmarkThemes: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return themes.map((theme) => ({
      id: theme.id,
      groupId: theme.groupId,
      name: theme.name,
      icon: theme.icon,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      bookmarkCount: theme._count.bookmarkThemes,
    }));
  }

  async findById(id: string): Promise<ThemeWithBookmarkCount | null> {
    const theme = await this.db.theme.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookmarkThemes: true,
          },
        },
      },
    });

    if (!theme) return null;

    return {
      id: theme.id,
      groupId: theme.groupId,
      name: theme.name,
      icon: theme.icon,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      bookmarkCount: theme._count.bookmarkThemes,
    };
  }

  async create(data: CreateTheme): Promise<Theme> {
    const theme = await this.db.theme.create({
      data: {
        id: `th${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
        ...data,
      },
    });

    return {
      id: theme.id,
      groupId: theme.groupId,
      name: theme.name,
      icon: theme.icon,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }

  async update(id: string, data: UpdateTheme): Promise<Theme | null> {
    try {
      const theme = await this.db.theme.update({
        where: { id },
        data,
      });

      return {
        id: theme.id,
        groupId: theme.groupId,
        name: theme.name,
        icon: theme.icon,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.theme.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByBookmarkId(bookmarkId: string): Promise<Theme[]> {
    const bookmarkThemes = await this.db.bookmarkTheme.findMany({
      where: { bookmarkId },
      include: {
        theme: true,
      },
      orderBy: {
        theme: {
          createdAt: "asc",
        },
      },
    });

    return bookmarkThemes.map((bt) => ({
      id: bt.theme.id,
      groupId: bt.theme.groupId,
      name: bt.theme.name,
      icon: bt.theme.icon,
      createdAt: bt.theme.createdAt,
      updatedAt: bt.theme.updatedAt,
    }));
  }

  async addBookmarkTheme(bookmarkId: string, themeId: string): Promise<void> {
    await this.db.bookmarkTheme.create({
      data: {
        bookmarkId,
        themeId,
      },
    });
  }

  async removeBookmarkTheme(bookmarkId: string, themeId: string): Promise<void> {
    await this.db.bookmarkTheme.delete({
      where: {
        bookmarkId_themeId: {
          bookmarkId,
          themeId,
        },
      },
    });
  }

  async updateBookmarkThemes(bookmarkId: string, themeIds: string[]): Promise<void> {
    // トランザクション内で既存の関連を削除し、新しい関連を作成
    await this.db.$transaction(async (tx) => {
      // 既存の関連を削除
      await tx.bookmarkTheme.deleteMany({
        where: { bookmarkId },
      });

      // 新しい関連を作成
      if (themeIds.length > 0) {
        await tx.bookmarkTheme.createMany({
          data: themeIds.map((themeId) => ({
            bookmarkId,
            themeId,
          })),
        });
      }
    });
  }
}