import type { Route } from "./+types/add-bookmark";
import { useState, useCallback } from "react";
import { Link, useParams, Form, useActionData, useNavigation, useLoaderData } from "react-router";
import { redirect } from "react-router";
import { createBookmark } from "../services/bookmark.server";
import { themeService } from "../services/theme";
import { CATEGORIES } from "../lib/constants";
import { isValidURL, debounce } from "../lib/utils";
import type { Category } from "../lib/constants";
import type { UrlMetadata } from "../lib/types";
import type { ThemeWithBookmarkCount } from "../entities/theme/theme";
import { Button, Card, CardBody, Input, Textarea, Select, SelectItem, Slider, Chip, Divider } from "@heroui/react";
import { ArrowLeft, RotateCw, MapPin } from "lucide-react";
import { LocationSearch } from "../components/location-search";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `ブックマーク追加 - wanna-go` },
    { name: "description", content: "新しいブックマークを追加" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw redirect("/");
  }

  try {
    const themes = await themeService.getThemesByGroupId(groupId);
    return { themes };
  } catch (error) {
    console.error("Error loading themes:", error);
    return { themes: [] };
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  const formData = await request.formData();

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const title = formData.get("title")?.toString();
  const url = formData.get("url")?.toString();
  const category = formData.get("category")?.toString() as Category;
  const memo = formData.get("memo")?.toString();
  const address = formData.get("address")?.toString();
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : undefined;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : undefined;
  const placeName = formData.get("placeName")?.toString();
  const priority = Number(formData.get("priority")) || 3;
  const autoTitle = formData.get("autoTitle")?.toString();
  const autoDescription = formData.get("autoDescription")?.toString();
  const autoImageUrl = formData.get("autoImageUrl")?.toString();
  const autoSiteName = formData.get("autoSiteName")?.toString();
  const themeIds = formData.getAll("themeIds").map(id => id.toString()).filter(Boolean);

  if (!title?.trim() || !url?.trim() || !category) {
    return { error: "タイトル、URL、カテゴリは必須です" };
  }

  if (!isValidURL(url)) {
    return { error: "有効なURLを入力してください" };
  }

  try {
    const bookmark = await createBookmark(groupId, {
      title: title.trim(),
      url: url.trim(),
      category,
      memo: memo?.trim() || undefined,
      address: address?.trim() || undefined,
      latitude,
      longitude,
      placeName: placeName?.trim() || undefined,
      priority,
      autoTitle: autoTitle || undefined,
      autoDescription: autoDescription || undefined,
      autoImageUrl: autoImageUrl || undefined,
      autoSiteName: autoSiteName || undefined,
    });

    // テーマとの関連付け
    if (themeIds.length > 0) {
      await themeService.updateBookmarkThemes(bookmark.id, themeIds);
    }

    return redirect(`/group/${groupId}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "ブックマークの追加に失敗しました" };
  }
}

export default function AddBookmark() {
  const { groupId } = useParams();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { themes } = useLoaderData() as { themes: ThemeWithBookmarkCount[] };
  
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("レストラン");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [priority, setPriority] = useState(3);
  const [memo, setMemo] = useState("");
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<string>>(new Set());
  
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);

  const fetchMetadata = useCallback(
    debounce(async (urlToFetch: string) => {
      if (!isValidURL(urlToFetch)) return;
      
      setIsLoadingMetadata(true);
      try {
        const formData = new FormData();
        formData.set("url", urlToFetch);
        
        const response = await fetch("/api/url-metadata", {
          method: "POST",
          body: formData,
        });
        
        const data = await response.json();
        setMetadata(data);
        
        if (data.success) {
          if (data.title && !title) {
            setTitle(data.title);
          }
          if (data.description && !description) {
            setDescription(data.description);
          }
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }, 1000),
    [title, description]
  );

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && isValidURL(value)) {
      fetchMetadata(value);
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string; placeName: string }) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setPlaceName(location.placeName);
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
              ブックマークを追加
            </Button>
          </div>

          {/* Form */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardBody className="p-6">
            <Form method="post" className="space-y-6">
              {/* Hidden metadata fields */}
              {metadata && (
                <>
                  <input type="hidden" name="autoTitle" value={metadata.title || ""} />
                  <input type="hidden" name="autoDescription" value={metadata.description || ""} />
                  <input type="hidden" name="autoImageUrl" value={metadata.image || ""} />
                  <input type="hidden" name="autoSiteName" value={metadata.site_name || ""} />
                </>
              )}
              {/* URL */}
              <div className="space-y-2">
                <Input
                  type="url"
                  name="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  label="URL"
                  placeholder="https://example.com"
                  variant="bordered"
                  isRequired
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onPress={() => url && fetchMetadata(url)}
                    isDisabled={!url || !isValidURL(url) || isLoadingMetadata}
                    size="sm"
                    variant="flat"
                    color="primary"
                  >
                    URLから情報を取得
                  </Button>
                  {isLoadingMetadata && (
                    <Chip size="sm" variant="flat">
                      <RotateCw size={16} className="animate-spin" /> 取得中...
                    </Chip>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  label="タイトル"
                  placeholder="美味しいラーメン店"
                  variant="bordered"
                  maxLength={200}
                  isRequired
                  description={
                    metadata?.success && metadata.title 
                      ? `自動取得: ${metadata.title}`
                      : undefined
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  label="説明 (自動取得)"
                  placeholder="説明文..."
                  variant="bordered"
                  minRows={3}
                  maxLength={500}
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

              {/* Location Search */}
              <div className="space-y-2">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  defaultLocation={latitude && longitude ? { latitude, longitude } : null}
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

              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </Form>
            </CardBody>
          </Card>
        </div>
    </div>
  );
}