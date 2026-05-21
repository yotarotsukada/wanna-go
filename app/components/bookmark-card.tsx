import { useNavigate } from "react-router";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  MapPin,
  MessageCircle,
  ExternalLink,
  Edit,
  Trash2,
  Navigation,
  RotateCcw,
  Check,
  MoreHorizontal,
} from "lucide-react";
import type { BookmarkWithThemes } from "../entities/bookmark/bookmark";
import type { Category } from "../lib/constants";
import { formatDate } from "../lib/utils";
import { StampChip } from "./stamp-chip";

interface BookmarkCardProps {
  bookmark: BookmarkWithThemes;
  onToggleVisited: (bookmarkId: string, visited: boolean) => void;
  onDelete: (bookmarkId: string) => void;
}

// 左サイドの細い色帯と小さな絵文字でカテゴリを示す（ピン突き出しを廃止）
const CATEGORY_ACCENT: Record<
  Category,
  { color: string; emoji: string; darkColor: string }
> = {
  レストラン: { color: "#A4503A", darkColor: "#C87355", emoji: "🍽️" },
  観光地: { color: "#1F3A5F", darkColor: "#E0BF85", emoji: "🏛️" },
  ショッピング: { color: "#C69544", darkColor: "#E0BF85", emoji: "🛍️" },
  アクティビティ: { color: "#3D5A3D", darkColor: "#5B7D5B", emoji: "🎯" },
  その他: { color: "#5A6C83", darkColor: "#7A8DA3", emoji: "📍" },
};

function PriorityPins({ priority }: { priority: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`興味度 ${priority} / 5`}
      title={`興味度 ${priority} / 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < priority
              ? "bg-gold"
              : "bg-deep-sea/15 dark:bg-parchment/15"
          }`}
        />
      ))}
    </div>
  );
}

function InkCheck({ size = 18 }: { size?: number }) {
  return (
    <span
      className="animate-ink-check inline-flex items-center justify-center rounded-full bg-moss/15 dark:bg-moss-soft/20"
      style={{ width: size + 8, height: size + 8 }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3D5A3D"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:[&_path]:stroke-[#5B7D5B]"
      >
        <path d="M4 12 L10 18 L20 6" />
      </svg>
    </span>
  );
}

export function BookmarkCard({
  bookmark,
  onToggleVisited,
  onDelete,
}: BookmarkCardProps) {
  const navigate = useNavigate();
  const accent = CATEGORY_ACCENT[bookmark.category as Category] ?? CATEGORY_ACCENT["その他"];

  const handleToggleVisited = () => {
    onToggleVisited(bookmark.id, !bookmark.visited);
  };

  const handleDelete = () => {
    if (confirm("このブックマークを削除しますか？")) {
      onDelete(bookmark.id);
    }
  };

  const generateGoogleMapsUrl = () => {
    if (bookmark.latitude && bookmark.longitude && bookmark.placeId) {
      return `https://www.google.com/maps/search/?api=1&query=${bookmark.latitude}%2C${bookmark.longitude}&query_place_id=${bookmark.placeId}`;
    }
    if (bookmark.placeId) {
      return `https://www.google.com/maps/search/?api=1&query_place_id=${bookmark.placeId}`;
    }
    if (bookmark.latitude && bookmark.longitude) {
      return `https://www.google.com/maps?q=${bookmark.latitude},${bookmark.longitude}`;
    }
    return null;
  };

  const mapsUrl = generateGoogleMapsUrl();

  const handleOpenInMaps = () => {
    if (mapsUrl) {
      window.open(mapsUrl, "_blank");
    }
  };

  return (
    <motion.article
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className={`surface animate-pin-drop relative overflow-hidden ${
        bookmark.visited ? "opacity-95" : ""
      }`}
    >
      {/* 左サイドの色帯 */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accent.color }}
        aria-hidden="true"
      />

      {/* OG画像 */}
      {bookmark.autoImageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-surface-2 dark:bg-night-paper-2 border-b border-line">
          <img
            src={bookmark.autoImageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-4 pl-5 space-y-3">
        {/* ヘッダー行: カテゴリ・興味度・メニュー */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-sm shrink-0"
              style={{ backgroundColor: `${accent.color}1a` }}
              aria-hidden="true"
              title={bookmark.category}
            >
              {accent.emoji}
            </span>
            <span className="text-xs font-medium text-deep-sea-ink/70 dark:text-parchment/70 truncate">
              {bookmark.category}
            </span>
            <span className="text-deep-sea-ink/25 dark:text-parchment/25">·</span>
            <PriorityPins priority={bookmark.priority} />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {bookmark.visited && <InkCheck size={16} />}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="メニュー"
                  className="text-deep-sea-ink/60 dark:text-parchment/60 hover:bg-default"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="ブックマーク操作">
                <DropdownItem
                  key="edit"
                  startContent={<Edit size={14} />}
                  onPress={() =>
                    navigate(`/group/${bookmark.groupId}/edit/${bookmark.id}`)
                  }
                >
                  編集
                </DropdownItem>
                {mapsUrl ? (
                  <DropdownItem
                    key="maps"
                    startContent={<Navigation size={14} />}
                    onPress={handleOpenInMaps}
                  >
                    Google マップで開く
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 size={14} />}
                  onPress={handleDelete}
                >
                  削除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* タイトル */}
        <h3
          className={`font-display text-lg leading-snug text-deep-sea dark:text-parchment ${
            bookmark.visited
              ? "line-through decoration-moss/60 decoration-[1.5px]"
              : ""
          }`}
        >
          {bookmark.title}
        </h3>

        {/* メモ・住所 */}
        {bookmark.memo && (
          <p className="text-sm text-deep-sea-ink/80 dark:text-parchment/80 leading-relaxed flex items-start gap-2">
            <MessageCircle
              size={14}
              className="shrink-0 mt-0.5 text-deep-sea-ink/40 dark:text-parchment/40"
            />
            <span>{bookmark.memo}</span>
          </p>
        )}

        {bookmark.address && (
          <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65 leading-relaxed flex items-start gap-2">
            <MapPin
              size={14}
              className="shrink-0 mt-0.5 text-deep-sea-ink/40 dark:text-parchment/40"
            />
            <span>{bookmark.address}</span>
          </p>
        )}

        {/* テーマ */}
        {bookmark.themes && bookmark.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bookmark.themes.map((theme) => (
              <StampChip key={theme.id} tone="deep-sea">
                {theme.icon && <span aria-hidden="true">{theme.icon}</span>}
                {theme.name}
              </StampChip>
            ))}
          </div>
        )}

        {/* URL（小さく） */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-deep-sea-ink/55 dark:text-parchment/55 hover:text-deep-sea dark:hover:text-gold-soft transition-colors max-w-full"
          title={bookmark.url}
        >
          <ExternalLink size={12} className="shrink-0" />
          <span className="truncate">{bookmark.url}</span>
        </a>

        {bookmark.visited && bookmark.visitedAt && (
          <div className="text-xs text-moss dark:text-moss-soft inline-flex items-center gap-1.5">
            <Check size={12} />
            {formatDate(bookmark.visitedAt)} に訪問
          </div>
        )}

        {/* 主アクション: 訪問トグル */}
        <div className="pt-2 border-t border-line">
          <Button
            onPress={handleToggleVisited}
            color={bookmark.visited ? "default" : "success"}
            variant={bookmark.visited ? "flat" : "solid"}
            size="sm"
            className="w-full"
            startContent={
              bookmark.visited ? <RotateCcw size={14} /> : <Check size={14} />
            }
          >
            {bookmark.visited ? "未訪問に戻す" : "訪問済みにする"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
