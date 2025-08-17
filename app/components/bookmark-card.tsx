import { Link } from "react-router";
import type { BookmarkWithThemes } from "../entities/bookmark/bookmark";
import { formatDate } from "../lib/utils";

interface BookmarkCardProps {
  bookmark: BookmarkWithThemes;
  onToggleVisited: (bookmarkId: string, visited: boolean) => void;
  onDelete: (bookmarkId: string) => void;
}

const categoryEmojis: Record<string, string> = {
  'レストラン': '🍜',
  '観光地': '🏛️',
  'ショッピング': '🛍️',
  'アクティビティ': '🎯',
  'その他': '📍',
};

const categoryColors: Record<string, string> = {
  'レストラン': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  '観光地': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  'ショッピング': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
  'アクティビティ': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  'その他': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
};

export function BookmarkCard({ bookmark, onToggleVisited, onDelete }: BookmarkCardProps) {
  const emoji = categoryEmojis[bookmark.category] || '📍';
  const categoryColor = categoryColors[bookmark.category] || categoryColors['その他'];
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < bookmark.priority ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
      ★
    </span>
  ));

  const handleToggleVisited = () => {
    onToggleVisited(bookmark.id, !bookmark.visited);
  };

  const handleDelete = () => {
    if (confirm('このブックマークを削除しますか？')) {
      onDelete(bookmark.id);
    }
  };

  return (
    <div className="card animate-fadeIn group hover:shadow-md transition-all duration-300">
      <div className="card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <span className="truncate">{bookmark.title}</span>
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge border ${categoryColor}`}>
                {bookmark.category}
              </span>
              <div className="flex items-center gap-0.5">
                {stars}
              </div>
            </div>
            {bookmark.themes && bookmark.themes.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500 dark:text-slate-400">テーマ:</span>
                {bookmark.themes.map((theme) => (
                  <span
                    key={theme.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 rounded-full dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                  >
                    {theme.icon && <span>{theme.icon}</span>}
                    <span>{theme.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {bookmark.visited && (
            <div className="ml-3 flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          {bookmark.address && (
            <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="text-base">📍</span>
              <span className="leading-relaxed">{bookmark.address}</span>
            </div>
          )}

          {bookmark.memo && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-base text-slate-500 dark:text-slate-400">💭</span>
              <p className="text-slate-900 dark:text-slate-50 leading-relaxed bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-md">
                {bookmark.memo}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <span className="text-base text-slate-500 dark:text-slate-400">🔗</span>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all transition-colors"
            >
              {bookmark.url}
            </a>
          </div>

          {bookmark.visited && bookmark.visitedAt && (
            <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/50 p-2 rounded-md border border-green-200 dark:border-green-800">
              <span className="text-green-600 dark:text-green-400">✅</span>
              <span className="text-green-700 dark:text-green-300 font-medium">
                {formatDate(bookmark.visitedAt)}に訪問済み
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={handleToggleVisited}
            className={`btn btn-sm ${
              bookmark.visited
                ? 'btn-outline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
            } flex-1`}
          >
            {bookmark.visited ? '未訪問に戻す' : '✓ 訪問済みにする'}
          </button>
          
          <Link
            to={`/group/${bookmark.groupId}/edit/${bookmark.id}`}
            className="btn btn-outline btn-sm"
          >
            ✏️ 編集
          </Link>
          
          <button
            onClick={handleDelete}
            className="btn btn-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}