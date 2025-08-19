import { useState, useCallback, useEffect } from 'react';
import { Input, Button, Select, SelectItem, Chip } from '@heroui/react';
import { MapPin, Search, X } from 'lucide-react';

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LocationSearchProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string; placeName: string }) => void;
  defaultLocation?: { latitude: number; longitude: number; address?: string; placeName?: string } | null;
  className?: string;
}

export function LocationSearch({ onLocationSelect, defaultLocation, className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    defaultLocation ? `default-${defaultLocation.latitude}-${defaultLocation.longitude}` : ''
  );

  // デフォルトの場所がある場合は結果に追加
  const [allResults, setAllResults] = useState<PlaceResult[]>(() => {
    if (defaultLocation) {
      return [{
        place_id: `default-${defaultLocation.latitude}-${defaultLocation.longitude}`,
        name: defaultLocation.placeName || '現在の場所',
        formatted_address: defaultLocation.address || '',
        geometry: {
          location: {
            lat: defaultLocation.latitude,
            lng: defaultLocation.longitude,
          }
        }
      }];
    }
    return [];
  });

  // Google Places APIを使用した場所検索
  const searchPlaces = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const formData = new FormData();
      formData.set('query', query);
      
      const response = await fetch('/api/places-search', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }
      
      const data = await response.json();
      
      if (data.success && data.results) {
        // 既存の結果のIDセットを事前に作成
        const existingIds = new Set(allResults.map(r => r.place_id));
        
        // 新しい検索結果を既存の結果に追加（重複除去）
        setAllResults(prev => {
          const newResults = data.results.filter((r: any) => {
            // place_idでの重複チェック
            if (existingIds.has(r.place_id)) return false;
            
            // 座標の近さでの重複チェック（100m以内は重複とみなす）
            const isDuplicate = prev.some(existing => {
              const distance = Math.sqrt(
                Math.pow(existing.geometry.location.lat - r.geometry.location.lat, 2) +
                Math.pow(existing.geometry.location.lng - r.geometry.location.lng, 2)
              ) * 111000; // 度から概算メートルに変換
              return distance < 100;
            });
            
            return !isDuplicate;
          });
          return [...prev, ...newResults];
        });
        
        // フィルタリング済みの結果をsetResultsに設定
        const filteredResults = data.results.filter((r: any) => {
          // place_idでの重複チェック
          if (existingIds.has(r.place_id)) return false;
          
          // 座標の近さでの重複チェック（100m以内は重複とみなす）
          const isDuplicate = allResults.some(existing => {
            const distance = Math.sqrt(
              Math.pow(existing.geometry.location.lat - r.geometry.location.lat, 2) +
              Math.pow(existing.geometry.location.lng - r.geometry.location.lng, 2)
            ) * 111000; // 度から概算メートルに変換
            return distance < 100;
          });
          
          return !isDuplicate;
        });
        
        setResults(filteredResults);
        
        // フィルタリング済みの検索結果の先頭アイテムを自動選択
        if (filteredResults.length > 0) {
          const firstPlace = filteredResults[0];
          setSelectedPlaceId(firstPlace.place_id);
          
          onLocationSelect({
            latitude: firstPlace.geometry.location.lat,
            longitude: firstPlace.geometry.location.lng,
            address: firstPlace.formatted_address,
            placeName: firstPlace.name
          });
        }
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('場所の検索に失敗しました:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handlePlaceSelect = (placeId: string) => {
    const place = allResults.find(p => p.place_id === placeId);
    if (!place) return;

    setSelectedPlaceId(placeId);
    
    onLocationSelect({
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.formatted_address,
      placeName: place.name
    });
  };

  const clearSelection = () => {
    setSelectedPlaceId('');
    onLocationSelect({
      latitude: 0,
      longitude: 0,
      address: '',
      placeName: ''
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 検索入力 */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
          placeholder="場所を検索..."
          startContent={<Search size={16} />}
          endContent={
            query && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setQuery('')}
              >
                <X size={14} />
              </Button>
            )
          }
          className="flex-1"
        />
        <Button
          onPress={searchPlaces}
          isLoading={isSearching}
          color="primary"
          startContent={!isSearching ? <Search size={16} /> : null}
          isDisabled={!query.trim()}
        >
          検索
        </Button>
      </div>

      {/* 場所選択 */}
      {allResults.length > 0 && (
        <Select
          label="場所を選択"
          placeholder="場所を選択してください"
          selectedKeys={selectedPlaceId ? [selectedPlaceId] : []}
          onSelectionChange={(keys) => {
            const placeId = Array.from(keys)[0] as string;
            if (placeId) {
              handlePlaceSelect(placeId);
            }
            // 選択解除は許可しない（placeIdが空の場合は何もしない）
          }}
          variant="bordered"
          startContent={<MapPin size={16} />}
        >
          {allResults.map((place) => (
            <SelectItem
              key={place.place_id}
              textValue={place.name}
              startContent={<MapPin size={16} className="text-gray-500" />}
            >
              <div className="flex flex-col">
                <span className="font-medium">{place.name}</span>
                <span className="text-sm text-gray-500">{place.formatted_address}</span>
              </div>
            </SelectItem>
          ))}
        </Select>
      )}
    </div>
  );
}