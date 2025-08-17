import { ThemeValidationError } from './theme-errors';

// エンティティ型定義
export interface Theme {
  readonly id: string;
  readonly groupId: string;
  readonly name: string;
  readonly icon: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateTheme {
  readonly groupId: string;
  readonly name: string;
  readonly icon?: string;
}

export interface UpdateTheme {
  readonly name: string;
  readonly icon?: string;
}

export interface ThemeWithBookmarkCount extends Theme {
  readonly bookmarkCount: number;
}

// バリデーション関数
export const validateThemeName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new ThemeValidationError('Theme name is required');
  }
  if (trimmed.length > 50) {
    throw new ThemeValidationError('Theme name must be 50 characters or less');
  }
  return trimmed;
};

export const validateThemeIcon = (icon: string | undefined): string | undefined => {
  if (!icon) return undefined;
  const trimmed = icon.trim();
  if (trimmed.length > 10) {
    throw new ThemeValidationError('Theme icon must be 10 characters or less');
  }
  return trimmed || undefined;
};