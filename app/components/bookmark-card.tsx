import { Link } from "react-router";
import { Button, Card, Chip } from "@heroui/react";
import type { BookmarkWithThemes } from "../entities/bookmark/bookmark";
import { formatDate } from "../lib/utils";
import { MapPin, MessageCircle, ExternalLink, Check, Edit, Trash2, Navigation } from "lucide-react";

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

const categoryColors: Record<string, 'warning' | 'primary' | 'secondary' | 'success' | 'default'> = {
  'レストラン': 'warning',
  '観光地': 'primary',
  'ショッピング': 'secondary',
  'アクティビティ': 'success',
  'その他': 'default',
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

  const generateGoogleMapsUrl = () => {
    if (bookmark.latitude && bookmark.longitude && bookmark.placeId) {
      // 座標とplace_idの両方がある場合
      return `https://www.google.com/maps/search/?api=1&query=${bookmark.latitude}%2C${bookmark.longitude}&query_place_id=${bookmark.placeId}`;
    }
    if (bookmark.placeId) {
      // place_idのみの場合
      return `https://www.google.com/maps/search/?api=1&query_place_id=${bookmark.placeId}`;
    }
    if (bookmark.latitude && bookmark.longitude) {
      // 座標のみの場合（古いデータ用フォールバック）
      return `https://www.google.com/maps?q=${bookmark.latitude},${bookmark.longitude}`;
    }
    return null;
  };

  const handleOpenInMaps = () => {
    const mapsUrl = generateGoogleMapsUrl();
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Card className="animate-fadeIn group hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between w-full gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2 mb-2">
              <span className="text-xl flex-shrink-0">{emoji}</span>
              <span className="truncate">{bookmark.title}</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5">
                {stars}
              </div>
              <Chip color={categoryColor} variant="flat" size="sm">
                {bookmark.category}
              </Chip>
              {bookmark.themes && bookmark.themes.map((theme) => (
                <Chip
                  key={theme.id}
                  color="secondary"
                  variant="bordered"
                  size="sm"
                  startContent={theme.icon && <span>{theme.icon}</span>}
                  className="hidden sm:inline-flex"
                >
                  {theme.name}
                </Chip>
              ))}
            </div>
            {bookmark.themes && bookmark.themes.length > 0 && (
              <div className="mt-2 sm:hidden">
                <div className="flex gap-2 flex-wrap">
                  {bookmark.themes.map((theme) => (
                    <Chip
                      key={theme.id}
                      color="secondary"
                      variant="bordered"
                      size="sm"
                      startContent={theme.icon && <span>{theme.icon}</span>}
                    >
                      {theme.name}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
          {bookmark.visited && (
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        {bookmark.address && (
          <div className="flex items-start gap-2 text-sm text-stone-500 dark:text-stone-400">
            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{bookmark.address}</span>
          </div>
        )}

        {bookmark.memo && (
          <div className="flex items-start gap-2 text-sm">
            <MessageCircle size={16} className="flex-shrink-0 mt-0.5 text-stone-500 dark:text-stone-400" />
            <div className="text-stone-900 dark:text-stone-50 leading-relaxed flex-1">
              {bookmark.memo}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <ExternalLink size={16} className="flex-shrink-0 mt-0.5 text-stone-500 dark:text-stone-400" />
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all transition-colors flex-1"
          >
            {bookmark.url}
          </a>
        </div>

        {bookmark.visited && bookmark.visitedAt && (
          <Chip
            color="success"
            variant="flat"
            size="sm"
            startContent={<Check size={16} />}
            className="w-fit"
          >
            {formatDate(bookmark.visitedAt)}に訪問済み
          </Chip>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onPress={handleToggleVisited}
            color={bookmark.visited ? "default" : "success"}
            variant={bookmark.visited ? "ghost" : "flat"}
            size="sm"
            className="flex-1"
          >
            {bookmark.visited ? '未訪問に戻す' : '訪問済みにする'}
          </Button>
          
          {(bookmark.placeId || (bookmark.latitude && bookmark.longitude)) && (
            <Button
              onPress={handleOpenInMaps}
              variant="ghost"
              size="sm"
              isIconOnly
              color="primary"
            >
              <Navigation size={16} />
            </Button>
          )}
          
          <Button
            as={Link}
            to={`/group/${bookmark.groupId}/edit/${bookmark.id}`}
            variant="ghost"
            size="sm"
            startContent={<Edit size={16} />}
          >
            編集
          </Button>
          
          <Button
            onPress={handleDelete}
            color="danger"
            variant="ghost"
            size="sm"
            isIconOnly
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>

  );
}