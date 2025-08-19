import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { CATEGORY_PIN_EMOJIS } from '../lib/constants';
import { ExternalLink, MapPin, Star, Clock } from 'lucide-react';
import type { BookmarkWithThemes } from '../entities/bookmark/bookmark';
import { useState, useEffect } from 'react';

interface MapViewProps {
  bookmarks: BookmarkWithThemes[];
  googleMapsApiKey: string;
  className?: string;
}

export function MapView({ bookmarks, googleMapsApiKey, className }: MapViewProps) {
  // 選択されたブックマーク（InfoWindow表示用）
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithThemes | null>(null);

  // InfoWindowの閉じるボタンのmask-image用背景色設定
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .gm-style .gm-style-iw button span {
        background-color: #666 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 座標を持つブックマークのみフィルタ
  const bookmarksWithCoordinates = bookmarks.filter(
    (bookmark) => bookmark.latitude !== null && bookmark.longitude !== null
  );

  if (bookmarksWithCoordinates.length === 0) {
    return (
      <Card className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${className || ''}`}>
        <CardBody className="p-16 text-center">
          <h3 className="text-xl font-semibold mb-2">
            座標情報のあるブックマークがありません
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            ブックマークに住所や座標情報を追加すると地図に表示されます
          </p>
        </CardBody>
      </Card>
    );
  }

  // 地図の境界を計算（全ピンが見えるように、マージンを考慮）
  const calculateMapBounds = () => {
    if (bookmarksWithCoordinates.length === 0) return null;
    
    if (bookmarksWithCoordinates.length === 1) {
      // 1つのピンの場合は中心にして適度なズーム
      return {
        center: { 
          lat: bookmarksWithCoordinates[0].latitude!, 
          lng: bookmarksWithCoordinates[0].longitude! 
        },
        zoom: 15
      };
    }

    // 複数のピンがある場合は境界を計算
    const lats = bookmarksWithCoordinates.map(b => b.latitude!);
    const lngs = bookmarksWithCoordinates.map(b => b.longitude!);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // マージンを追加（境界の10%の余白）
    const latMargin = Math.max((maxLat - minLat) * 0.1, 0.001); // 最小マージン設定
    const lngMargin = Math.max((maxLng - minLng) * 0.1, 0.001);
    
    const bounds = {
      north: maxLat + latMargin,
      south: minLat - latMargin,
      east: maxLng + lngMargin,
      west: minLng - lngMargin
    };
    
    // 中心点を計算
    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    };
    
    // 地図サイズに基づいてズームレベルを計算
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    // より正確なズーム計算（Google Mapsの仕様に基づく）
    // 1度 ≈ 111km、地図の幅を基準にズームを計算
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15;
    if (maxDiff >= 10) zoom = 6;      // 国レベル
    else if (maxDiff >= 5) zoom = 7;   // 地方レベル
    else if (maxDiff >= 2) zoom = 8;   // 県レベル
    else if (maxDiff >= 1) zoom = 9;   // 広域市レベル
    else if (maxDiff >= 0.5) zoom = 10; // 市レベル
    else if (maxDiff >= 0.2) zoom = 11; // 区レベル
    else if (maxDiff >= 0.1) zoom = 12; // 地区レベル
    else if (maxDiff >= 0.05) zoom = 13; // 町レベル
    else if (maxDiff >= 0.02) zoom = 14; // 詳細レベル
    else zoom = 15; // 最詳細レベル
    
    return { center, zoom, bounds };
  };

  const mapConfig = calculateMapBounds();
  
  // デフォルトの中心点（日本の中心付近）
  const defaultCenter = { lat: 36.2048, lng: 138.2529 };
  const mapCenter = mapConfig?.center || defaultCenter;
  const mapZoom = mapConfig?.zoom || 6;

  if (!googleMapsApiKey) {
    return (
      <Card className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${className || ''}`}>
        <CardBody className="p-16 text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
            Google Maps APIキーが設定されていません
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            地図を表示するにはGOOGLE_MAPS_API_KEY環境変数を設定してください
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${className || ''}`}>
      <CardBody className="p-0">
        <APIProvider apiKey={googleMapsApiKey}>
          <div className="w-full h-96 md:h-[500px] lg:h-[600px] relative">
            <Map
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              className="w-full h-full rounded-lg"
              mapId="bookmark-map"
              onClick={() => setSelectedBookmark(null)}
            >
              {bookmarksWithCoordinates.map((bookmark) => (
                <AdvancedMarker
                  key={bookmark.id}
                  position={{ 
                    lat: bookmark.latitude!, 
                    lng: bookmark.longitude! 
                  }}
                  title={bookmark.title}
                  onClick={() => {
                    setSelectedBookmark(bookmark);
                  }}
                >
                  <Pin
                    background={bookmark.visited ? "#16a34a" : "#dc2626"}
                    borderColor={bookmark.visited ? "#15803d" : "#b91c1c"}
                    glyphColor="white"
                  />
                </AdvancedMarker>
              ))}

              {/* InfoWindow for selected bookmark */}
              {selectedBookmark && (
                <InfoWindow
                  position={{
                    lat: selectedBookmark.latitude!,
                    lng: selectedBookmark.longitude!
                  }}
                  onCloseClick={() => setSelectedBookmark(null)}
                  maxWidth={300}
                  pixelOffset={[0, -40]}
                  headerContent={
                    <div className="font-semibold text-base text-slate-900 truncate">
                      {selectedBookmark.title}
                    </div>
                  }
                >
                  <BookmarkInfoContent bookmark={selectedBookmark} />
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>
        
        {/* マップの下に統計情報を表示 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            📍 {bookmarksWithCoordinates.length}件のブックマークが地図に表示されています
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

// InfoWindow内のブックマーク情報表示コンテンツ
interface BookmarkInfoContentProps {
  bookmark: BookmarkWithThemes;
}

function BookmarkInfoContent({ bookmark }: BookmarkInfoContentProps) {
  return (
    <div className="min-w-0 max-w-xs">
      <div className="space-y-3">
        {/* 自動取得されたタイトル（メインタイトルと異なる場合のみ表示） */}
        {bookmark.autoTitle && bookmark.autoTitle !== bookmark.title && (
          <div>
            <p className="text-xs text-slate-600 truncate">
              {bookmark.autoTitle}
            </p>
          </div>
        )}

        {/* カテゴリと訪問状況 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            variant="flat"
            color="primary"
            size="sm"
            startContent={<span>{CATEGORY_PIN_EMOJIS[bookmark.category]}</span>}
          >
            {bookmark.category}
          </Chip>
          <Chip
            variant="flat"
            color={bookmark.visited ? "success" : "warning"}
            size="sm"
            startContent={bookmark.visited ? <Clock size={12} /> : <Clock size={12} />}
          >
            {bookmark.visited ? "訪問済み" : "未訪問"}
          </Chip>
        </div>

        {/* 興味度 */}
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500" />
          <span className="text-sm text-slate-700">{bookmark.priority}/5</span>
        </div>

        {/* 住所 */}
        {bookmark.address && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700 break-words">
              {bookmark.address}
            </p>
          </div>
        )}

        {/* メモ */}
        {bookmark.memo && (
          <div className="border-t border-slate-200 pt-2">
            <p className="text-sm text-slate-600 break-words">
              {bookmark.memo}
            </p>
          </div>
        )}

        {/* 自動取得された説明 */}
        {bookmark.autoDescription && (
          <div className="border-t border-slate-200 pt-2">
            <p className="text-xs text-slate-500 break-words line-clamp-3">
              {bookmark.autoDescription}
            </p>
          </div>
        )}

        {/* テーマ情報 */}
        {bookmark.themes && bookmark.themes.length > 0 && (
          <div className="border-t border-slate-200 pt-2">
            <div className="flex flex-wrap gap-1">
              {bookmark.themes.map((theme) => (
                <Chip
                  key={theme.id}
                  variant="flat"
                  color="secondary"
                  size="sm"
                  className="text-xs"
                >
                  {theme.icon} {theme.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <Button
            as="a"
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            color="primary"
            variant="flat"
            startContent={<ExternalLink size={14} />}
            className="flex-1 text-xs"
          >
            詳細を見る
          </Button>
        </div>
      </div>
    </div>
  );
}