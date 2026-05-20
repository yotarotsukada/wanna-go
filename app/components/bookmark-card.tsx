import { Link } from "react-router";
import { Button } from "@heroui/react";
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
} from "lucide-react";
import type { BookmarkWithThemes } from "../entities/bookmark/bookmark";
import { formatDate } from "../lib/utils";
import { CategoryPin } from "./category-pin";
import { StampChip } from "./stamp-chip";

interface BookmarkCardProps {
  bookmark: BookmarkWithThemes;
  onToggleVisited: (bookmarkId: string, visited: boolean) => void;
  onDelete: (bookmarkId: string) => void;
}

function PriorityPins({ priority }: { priority: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`興味度 ${priority} / 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={i < priority ? "" : "opacity-30"}
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            fill={i < priority ? "#D4A24C" : "transparent"}
            stroke="#D4A24C"
            strokeWidth="1.2"
          />
          {i < priority && (
            <circle cx="8" cy="8" r="2" fill="#142840" opacity="0.55" />
          )}
        </svg>
      ))}
    </div>
  );
}

function InkCheck({ size = 22 }: { size?: number }) {
  return (
    <span
      className="animate-ink-check inline-flex items-center justify-center rounded-full bg-moss/15 dark:bg-moss-soft/20"
      style={{ width: size + 10, height: size + 10 }}
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

  const handleOpenInMaps = () => {
    const mapsUrl = generateGoogleMapsUrl();
    if (mapsUrl) {
      window.open(mapsUrl, "_blank");
    }
  };

  const visitedTone = bookmark.visited ? "opacity-90" : "";

  return (
    <motion.article
      whileHover={{ y: -2, rotate: -0.3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`paper-card animate-pin-drop relative ${visitedTone} ${
        bookmark.visited ? "bg-moss/[0.06] dark:bg-moss-soft/[0.08]" : ""
      }`}
    >
      {/* 左上の category-pin（紙にピン留め） */}
      <div className="absolute -top-3 -left-3 z-10 drop-shadow-pin pointer-events-none">
        <CategoryPin category={bookmark.category} size={36} />
      </div>

      {/* 訪問済みの羽ペン風チェック */}
      {bookmark.visited && (
        <div className="absolute top-3 right-3 z-10">
          <InkCheck />
        </div>
      )}

      {/* OG画像（メディア帯） */}
      {bookmark.autoImageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-t-[14px] bg-parchment-3/40 border-b border-deep-sea/10">
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

      <div className="p-5 pt-6 space-y-3">
        <header className="pl-8 pr-12 space-y-2">
          <h3
            className={`font-display text-xl leading-snug text-deep-sea dark:text-parchment ${
              bookmark.visited ? "line-through decoration-moss/60 decoration-[1.5px]" : ""
            }`}
          >
            {bookmark.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <PriorityPins priority={bookmark.priority} />
            <span className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp tracking-wide">
              {bookmark.category}
            </span>
            {bookmark.themes?.map((theme) => (
              <StampChip key={theme.id} tone="rust">
                {theme.icon && <span aria-hidden="true">{theme.icon}</span>}
                {theme.name}
              </StampChip>
            ))}
          </div>
        </header>

        {bookmark.address && (
          <div className="flex items-start gap-2 text-sm text-deep-sea-ink/75 dark:text-parchment/75">
            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{bookmark.address}</span>
          </div>
        )}

        {bookmark.memo && (
          <div className="flex items-start gap-2 text-sm">
            <MessageCircle
              size={16}
              className="flex-shrink-0 mt-0.5 text-deep-sea-ink/60 dark:text-parchment/60"
            />
            <p className="text-deep-sea-ink dark:text-parchment leading-relaxed flex-1">
              {bookmark.memo}
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <ExternalLink
            size={16}
            className="flex-shrink-0 mt-0.5 text-deep-sea-ink/60 dark:text-parchment/60"
          />
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-deep-sea dark:text-gold-soft hover:underline break-all transition-colors flex-1"
          >
            {bookmark.url}
          </a>
        </div>

        {bookmark.visited && bookmark.visitedAt && (
          <div className="text-xs font-serif-jp text-moss dark:text-moss-soft inline-flex items-center gap-1.5">
            <Check size={14} />
            {formatDate(bookmark.visitedAt)} に訪問済み
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-deep-sea/10">
          <Button
            onPress={handleToggleVisited}
            color={bookmark.visited ? "default" : "success"}
            variant={bookmark.visited ? "ghost" : "flat"}
            size="sm"
            className="flex-1"
            startContent={
              bookmark.visited ? <RotateCcw size={14} /> : <Check size={14} />
            }
          >
            {bookmark.visited ? "未訪問に戻す" : "訪問済みにする"}
          </Button>

          {(bookmark.placeId || (bookmark.latitude && bookmark.longitude)) && (
            <Button
              onPress={handleOpenInMaps}
              variant="ghost"
              size="sm"
              isIconOnly
              color="primary"
              aria-label="Google マップで開く"
            >
              <Navigation size={16} />
            </Button>
          )}

          <Button
            as={Link}
            to={`/group/${bookmark.groupId}/edit/${bookmark.id}`}
            variant="ghost"
            size="sm"
            startContent={<Edit size={14} />}
          >
            編集
          </Button>

          <Button
            onPress={handleDelete}
            color="danger"
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="削除"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
