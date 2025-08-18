import { useState } from "react";
import { Link } from "react-router";
import { Card, Chip, Accordion, AccordionItem, Button } from "@heroui/react";
import { BookmarkCard } from "./bookmark-card";
import type { ThemeWithBookmarkCount } from "../entities/theme/theme";
import { formatDate } from "../lib/utils";
import { Edit } from "lucide-react";

interface ThemeCardProps {
  theme: ThemeWithBookmarkCount;
  onToggleVisited: (bookmarkId: string, visited: boolean) => void;
  onDelete: (bookmarkId: string) => void;
}

export function ThemeCard({ theme, onToggleVisited, onDelete }: ThemeCardProps) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const themeIcon = theme.icon || '🗺️';

  const fetchBookmarks = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/theme/${theme.id}/bookmarks`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error fetching theme bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="animate-fadeIn group hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="p-4">
        <Accordion
          onSelectionChange={(keys) => {
            const isOpen = Array.from(keys).includes(theme.id);
            if (isOpen && bookmarks.length === 0) {
              fetchBookmarks();
            }
          }}
        >
          <AccordionItem
            key={theme.id}
            aria-label={theme.name}
            classNames={{
              title: "px-0 py-0",
              content: "px-0 pb-0 pt-3",
              trigger: "p-0",
            }}
            title={
              <div className="flex items-start justify-between w-full gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-2">
                    <span className="text-xl flex-shrink-0">{themeIcon}</span>
                    <span className="truncate">{theme.name}</span>
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Chip 
                      variant="flat" 
                      color="primary"
                      size="sm"
                    >
                      {theme.bookmarkCount}件のブックマーク
                    </Chip>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      作成日: {formatDate(typeof theme.createdAt === 'string' ? theme.createdAt : theme.createdAt.toISOString())}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    as={Link}
                    to={`/group/${theme.groupId}/themes/edit/${theme.id}`}
                    variant="ghost"
                    size="sm"
                    startContent={<Edit size={16} />}
                  >
                    編集
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-slate-500 dark:text-slate-400">読み込み中...</div>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-500 dark:text-slate-400">
                    このテーマに紐づくブックマークはありません
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map(bookmark => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onToggleVisited={onToggleVisited}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
}