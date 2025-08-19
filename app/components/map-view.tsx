import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Card, CardBody } from '@heroui/react';
import { CATEGORY_PIN_EMOJIS } from '../lib/constants';
import type { BookmarkWithThemes } from '../entities/bookmark/bookmark';

interface MapViewProps {
  bookmarks: BookmarkWithThemes[];
  googleMapsApiKey: string;
  className?: string;
}

export function MapView({ bookmarks, googleMapsApiKey, className }: MapViewProps) {
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
                  <Pin
                    background="#dc2626"
                    borderColor="#b91c1c"
                    glyphColor="white"
                  />
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