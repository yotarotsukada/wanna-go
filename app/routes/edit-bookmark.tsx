import type { Route } from "./+types/edit-bookmark";
import { useState, useEffect } from "react";
import { Link, useParams, Form, useLoaderData, useActionData, useNavigation } from "react-router";
import { getBookmark, updateBookmark, deleteBookmark } from "../services/bookmark.server";
import { getGroup } from "../services/group.server";
import { themeService } from "../services/theme";
import { CATEGORIES } from "../lib/constants";
import { isValidURL } from "../lib/utils";
import type { Category } from "../lib/constants";
import type { BookmarkWithThemes } from "../entities/bookmark/bookmark";
import type { Group } from "../entities/group/group";
import type { ThemeWithBookmarkCount } from "../entities/theme/theme";
import { validateBookmarkUrl, validateBookmarkTitle, validatePriority } from "../entities/bookmark/bookmark";
import { redirect } from "react-router";
import { Button, Card, CardBody, Input, Textarea, Select, SelectItem, Slider, Chip, Divider } from "@heroui/react";
import { ArrowLeft, MapPin } from "lucide-react";
import { LocationSearch } from "../components/location-search";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `ブックマーク編集 - wanna-go` },
    { name: "description", content: "ブックマークを編集" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { bookmarkId } = params;
  
  if (!bookmarkId) {
    throw new Response("Bookmark ID is required", { status: 400 });
  }

  try {
    const bookmark = await getBookmark(bookmarkId);
    
    if (!bookmark) {
      throw new Response("Bookmark not found", { status: 404 });
    }

    const group = await getGroup(bookmark.groupId);
    
    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    const [themes, bookmarkThemes] = await Promise.all([
      themeService.getThemesByGroupId(bookmark.groupId),
      themeService.getThemesByBookmarkId(bookmarkId),
    ]);

    return { bookmark, group, themes, bookmarkThemes };
  } catch (error) {
    console.error("Error loading bookmark:", error);
    throw new Response("Failed to load bookmark", { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { bookmarkId, groupId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!bookmarkId) {
    throw new Response("Bookmark ID is required", { status: 400 });
  }

  try {
    if (intent === "delete") {
      await deleteBookmark(bookmarkId);
      return redirect(`/group/${groupId}`);
    } else {
      // Update bookmark
      const title = formData.get("title")?.toString();
      const url = formData.get("url")?.toString();
      const category = formData.get("category")?.toString() as Category;
      const memo = formData.get("memo")?.toString();
      const address = formData.get("address")?.toString();
      const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : undefined;
      const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : undefined;
      const placeName = formData.get("placeName")?.toString();
      const placeId = formData.get("placeId")?.toString();
      const priority = Number(formData.get("priority")) || 3;
      const themeIds = formData.getAll("themeIds").map(id => id.toString()).filter(Boolean);

      if (!title?.trim() || !url?.trim() || !category) {
        return { error: "タイトル、URL、カテゴリは必須です" };
      }

      if (!isValidURL(url)) {
        return { error: "有効なURLを入力してください" };
      }

      await updateBookmark(bookmarkId, {
        title: title.trim(),
        url: url.trim(),
        category,
        memo: memo?.trim() || undefined,
        address: address?.trim() || undefined,
        latitude,
        longitude,
        placeName: placeName?.trim() || undefined,
        placeId: placeId?.trim() || undefined,
        priority,
      });

      // テーマとの関連付けを更新
      await themeService.updateBookmarkThemes(bookmarkId, themeIds);

      return redirect(`/group/${groupId}`);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "操作に失敗しました" };
  }
}

export default function EditBookmark() {
  const { groupId } = useParams();
  const { bookmark, group, themes, bookmarkThemes } = useLoaderData() as { 
    bookmark: BookmarkWithThemes; 
    group: Group; 
    themes: ThemeWithBookmarkCount[];
    bookmarkThemes: any[];
  };
  const actionData = useActionData() as { error?: string; success?: boolean } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [url, setUrl] = useState(bookmark.url);
  const [title, setTitle] = useState(bookmark.title);
  const [category, setCategory] = useState<Category>(bookmark.category);
  const [address, setAddress] = useState(bookmark.address || "");
  const [latitude, setLatitude] = useState<number | null>(bookmark.latitude);
  const [longitude, setLongitude] = useState<number | null>(bookmark.longitude);
  const [placeName, setPlaceName] = useState(bookmark.placeName || "");
  const [placeId, setPlaceId] = useState(bookmark.placeId || "");
  const [priority, setPriority] = useState(bookmark.priority);
  const [memo, setMemo] = useState(bookmark.memo || "");
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<string>>(
    new Set(bookmarkThemes.map(theme => theme.id))
  );

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };
  
  // フロントエンドバリデーション状態（エンティティ関数を活用）
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // リアルタイムバリデーション関数
  const validateField = (field: string, value: any) => {
    try {
      switch (field) {
        case 'url':
          validateBookmarkUrl(value);
          break;
        case 'title':
          validateBookmarkTitle(value);
          break;
        case 'priority':
          validatePriority(value);
          break;
      }
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [field]: error instanceof Error ? error.message : '入力エラー' 
      }));
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string; placeName: string; placeId?: string; url?: string }) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setPlaceName(location.placeName);
    setPlaceId(location.placeId || "");
    
    // タイトルが空欄の場合、地点名を自動入力
    if (!title.trim() && location.placeName) {
      setTitle(location.placeName);
    }
    
    // Google MapのURLが提供された場合、URLフィールドが空なら自動入力
    if (location.url && !url.trim()) {
      setUrl(location.url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              as={Link}
              to={`/group/${groupId}`}
              variant="ghost"
              size="sm"
              className="mb-4"
              startContent={<ArrowLeft size={16} />}
            >
              ブックマークを編集
            </Button>
          </div>

          {/* Form */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardBody className="p-6">
            <Form method="post" className="space-y-6">
              {/* Location Search - moved to top */}
              <div className="space-y-2">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  defaultLocation={latitude && longitude ? { 
                    latitude, 
                    longitude,
                    address: bookmark.address || '',
                    placeName: bookmark.placeName || bookmark.title,
                    placeId: bookmark.placeId || undefined
                  } : null}
                />
                {latitude && longitude && (
                  <>
                    <input type="hidden" name="latitude" value={latitude} />
                    <input type="hidden" name="longitude" value={longitude} />
                  </>
                )}
                {address && (
                  <input type="hidden" name="address" value={address} />
                )}
                {placeName && (
                  <input type="hidden" name="placeName" value={placeName} />
                )}
                {placeId && (
                  <input type="hidden" name="placeId" value={placeId} />
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Input
                  type="url"
                  name="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onClear={() => setUrl('')}
                  label="URL"
                  placeholder="https://example.com"
                  variant="bordered"
                  isRequired
                  isClearable
                />
                {(url.includes('www.google.com/maps') || url.includes('maps.google.com') || url.includes('goo.gl/maps')) && (
                  <div className="flex items-center gap-2">
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color="secondary"
                      startContent={<MapPin size={16} />}
                    >
                      場所のURL
                    </Chip>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onClear={() => setTitle('')}
                  label="タイトル"
                  placeholder="美味しいラーメン店"
                  variant="bordered"
                  maxLength={200}
                  isRequired
                  isClearable
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Select
                  name="category"
                  selectedKeys={[category]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as Category;
                    setCategory(value);
                  }}
                  label="カテゴリ"
                  variant="bordered"
                  isRequired
                >
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat}>{cat}</SelectItem>
                  ))}
                </Select>
              </div>


              {/* Priority */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-50">
                  興味度
                </label>
                <div className="flex items-center gap-4">
                  <Slider
                    size="sm"
                    step={1}
                    minValue={1}
                    maxValue={5}
                    value={priority}
                    onChange={(value) => setPriority(Array.isArray(value) ? value[0] : value)}
                    className="flex-1"
                    color="primary"
                  />
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < priority ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <input type="hidden" name="priority" value={priority} />
              </div>

              {/* Themes */}
              {themes.length > 0 && (
                <div className="space-y-2">
                  <Select
                    label="テーマ（任意）"
                    placeholder="テーマを選択..."
                    selectionMode="multiple"
                    selectedKeys={selectedThemeIds}
                    onSelectionChange={(keys) => {
                      setSelectedThemeIds(new Set(Array.from(keys).map(String)));
                    }}
                    variant="bordered"
                    classNames={{
                      trigger: "min-h-12",
                      value: "flex flex-wrap gap-1",
                    }}
                    renderValue={(items) => (
                      <div className="flex flex-wrap gap-1">
                        {items.map((item) => {
                          const theme = themes.find(t => t.id === item.key);
                          return (
                            <Chip
                              key={item.key}
                              color="secondary"
                              variant="flat"
                              size="sm"
                              startContent={theme?.icon && <span>{theme.icon}</span>}
                            >
                              {theme?.name}
                            </Chip>
                          );
                        })}
                      </div>
                    )}
                  >
                    {themes.map((theme) => (
                      <SelectItem 
                        key={theme.id} 
                        textValue={theme.name}
                        startContent={theme.icon && <span>{theme.icon}</span>}
                      >
                        {theme.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {/* Hidden inputs for selected theme IDs */}
                  {Array.from(selectedThemeIds).map((themeId) => (
                    <input key={themeId} type="hidden" name="themeIds" value={themeId} />
                  ))}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ※ 複数選択可能
                  </p>
                </div>
              )}

              {/* Memo */}
              <div className="space-y-2">
                <Textarea
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  label="メモ"
                  placeholder="友人おすすめ！"
                  variant="bordered"
                  minRows={3}
                  maxLength={1000}
                />
              </div>


              {/* Error Message */}
              {actionData?.error && (
                <Card className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                  <CardBody className="p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                  </CardBody>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "更新中..." : "更新"}
                </Button>
                
                <Button
                  type="submit"
                  name="intent"
                  value="delete"
                  color="danger"
                  size="lg"
                  className="w-full"
                  onPress={() => {
                    return confirm("このブックマークを削除しますか？");
                  }}
                >
                  削除
                </Button>
              </div>
            </Form>
            </CardBody>
          </Card>
        </div>
    </div>
  );
}