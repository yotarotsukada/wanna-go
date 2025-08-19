import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Card, CardBody } from '@heroui/react';
import { CATEGORY_PIN_EMOJIS } from '../lib/constants';
import type { BookmarkWithThemes } from '../entities/bookmark/bookmark';

interface MapViewProps {
  bookmarks: BookmarkWithThemes[];
  className?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export function MapView({ bookmarks, className }: MapViewProps) {
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

  // 地図の中心点を計算（全ブックマークの座標の平均）
  const centerLat = bookmarksWithCoordinates.reduce((sum, b) => sum + b.latitude!, 0) / bookmarksWithCoordinates.length;
  const centerLng = bookmarksWithCoordinates.reduce((sum, b) => sum + b.longitude!, 0) / bookmarksWithCoordinates.length;

  // デフォルトの中心点（日本の中心付近）
  const defaultCenter = { lat: 36.2048, lng: 138.2529 };
  const mapCenter = bookmarksWithCoordinates.length > 0 
    ? { lat: centerLat, lng: centerLng }
    : defaultCenter;

  if (!GOOGLE_MAPS_API_KEY) {
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
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <div className="w-full h-96 md:h-[500px] lg:h-[600px] relative">
            <Map
              defaultCenter={mapCenter}
              defaultZoom={10}
              className="w-full h-full rounded-lg"
              mapId="bookmark-map"
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
                    // マーカークリック時の処理（将来的に詳細表示等を追加可能）
                    console.log('Clicked bookmark:', bookmark.title);
                  }}
                >
                  <div className="text-2xl bg-white rounded-full p-1 shadow-lg border-2 border-gray-300">
                    {CATEGORY_PIN_EMOJIS[bookmark.category]}
                  </div>
                </AdvancedMarker>
              ))}
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

// マーカー情報表示用のコンポーネント（将来的に使用予定）
interface MarkerInfoProps {
  bookmark: BookmarkWithThemes;
  onClose: () => void;
}

export function MarkerInfo({ bookmark, onClose }: MarkerInfoProps) {
  return (
    <Card className="max-w-sm">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold">{bookmark.title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <span>{CATEGORY_PIN_EMOJIS[bookmark.category]}</span>
            <span className="text-slate-600 dark:text-slate-400">{bookmark.category}</span>
          </p>
          
          {bookmark.address && (
            <p className="text-slate-600 dark:text-slate-400">
              📍 {bookmark.address}
            </p>
          )}
          
          {bookmark.memo && (
            <p className="text-slate-600 dark:text-slate-400">
              📝 {bookmark.memo}
            </p>
          )}
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            興味度: {bookmark.priority}/5 | 
            {bookmark.visited ? ' 訪問済み ✅' : ' 未訪問 ⏳'}
          </p>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            詳細を見る →
          </a>
        </div>
      </CardBody>
    </Card>
  );
}