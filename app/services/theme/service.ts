import { type Theme, type CreateTheme, type UpdateTheme, type ThemeWithBookmarkCount, validateThemeName, validateThemeIcon } from "../../entities/theme/theme";
import { ThemeNotFoundError, ThemeValidationError } from "../../entities/theme/theme-errors";
import { type ThemeRepository } from "./repository";

export class ThemeService {
  constructor(private themeRepository: ThemeRepository) {}

  async getThemesByGroupId(groupId: string): Promise<ThemeWithBookmarkCount[]> {
    return this.themeRepository.findByGroupId(groupId);
  }

  async getThemeById(id: string): Promise<ThemeWithBookmarkCount> {
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new ThemeNotFoundError(id);
    }
    return theme;
  }

  async createTheme(data: CreateTheme): Promise<Theme> {
    const validatedName = validateThemeName(data.name);
    const validatedIcon = validateThemeIcon(data.icon);
    
    const validatedData: CreateTheme = {
      groupId: data.groupId,
      name: validatedName,
      icon: validatedIcon,
    };

    return this.themeRepository.create(validatedData);
  }

  async updateTheme(id: string, data: UpdateTheme): Promise<Theme> {
    const validatedName = validateThemeName(data.name);
    const validatedIcon = validateThemeIcon(data.icon);
    
    const validatedData: UpdateTheme = {
      name: validatedName,
      icon: validatedIcon,
    };

    const theme = await this.themeRepository.update(id, validatedData);
    if (!theme) {
      throw new ThemeNotFoundError(id);
    }
    return theme;
  }

  async deleteTheme(id: string): Promise<void> {
    const success = await this.themeRepository.delete(id);
    if (!success) {
      throw new ThemeNotFoundError(id);
    }
  }

  async getThemesByBookmarkId(bookmarkId: string): Promise<Theme[]> {
    return this.themeRepository.findByBookmarkId(bookmarkId);
  }

  async updateBookmarkThemes(bookmarkId: string, themeIds: string[]): Promise<void> {
    return this.themeRepository.updateBookmarkThemes(bookmarkId, themeIds);
  }

  async getBookmarksByThemeId(themeId: string): Promise<any[]> {
    return this.themeRepository.findBookmarksByThemeId(themeId);
  }
}