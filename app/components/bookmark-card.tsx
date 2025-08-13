import { Link } from "react-router";
import type { Bookmark } from "../lib/types";
import { formatDate } from "../lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
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

export function BookmarkCard({ bookmark, onToggleVisited, onDelete }: BookmarkCardProps) {
  const emoji = categoryEmojis[bookmark.category] || '📍';
  const stars = '⭐'.repeat(bookmark.priority);

  const handleToggleVisited = () => {
    onToggleVisited(bookmark.id, !bookmark.visited);
  };

  const handleDelete = () => {
    if (confirm('このブックマークを削除しますか？')) {
      onDelete(bookmark.id);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border">
      {/* Title and Category */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {emoji} {bookmark.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>カテゴリ: {bookmark.category}</span>
          <span>{stars}</span>
        </div>
      </div>

      {/* Address */}
      {bookmark.address && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            📍 {bookmark.address}
          </p>
        </div>
      )}

      {/* Memo */}
      {bookmark.memo && (
        <div className="mb-3">
          <p className="text-sm text-gray-700">
            📝 {bookmark.memo}
          </p>
        </div>
      )}

      {/* URL */}
      <div className="mb-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm break-all"
        >
          🔗 {bookmark.url}
        </a>
      </div>

      {/* Visited info */}
      {bookmark.visited && bookmark.visitedAt && (
        <div className="mb-3">
          <p className="text-sm text-green-600">
            ✅ {formatDate(bookmark.visitedAt)}に訪問済み
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={handleToggleVisited}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            bookmark.visited
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {bookmark.visited ? '未訪問に戻す' : '✓訪問済み'}
        </button>
        
        <Link
          to={`/group/${bookmark.groupId}/edit/${bookmark.id}`}
          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium transition-colors"
        >
          ✏️編集
        </Link>
        
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors"
        >
          🗑️削除
        </button>
      </div>
    </div>
  );
}