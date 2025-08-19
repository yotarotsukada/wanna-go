export const CATEGORIES = [
  'レストラン',
  '観光地', 
  'ショッピング',
  'アクティビティ',
  'その他'
] as const;

export type Category = typeof CATEGORIES[number];

// カテゴリに対応するピン絵文字
export const CATEGORY_PIN_EMOJIS: Record<Category, string> = {
  'レストラン': '🍽️',
  '観光地': '🏛️',
  'ショッピング': '🛍️',
  'アクティビティ': '🎯',
  'その他': '📍'
} as const;

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';