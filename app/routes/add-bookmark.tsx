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
import { Button, Input, Textarea, Select, SelectItem, Slider, Chip } from "@heroui/react";
import { ArrowLeft, RotateCw, MapPin, Globe, Check, X, Pencil } from "lucide-react";
import { LocationSearch } from "../components/location-search";
import { AppHeader } from "../components/app-header";

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
  const placeId = formData.get("placeId")?.toString();
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
      placeId: placeId?.trim() || undefined,
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
  const [placeId, setPlaceId] = useState("");
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
    // 場所から自動入力されたGoogle MapのURLの場合はメタデータ取得をスキップ
    const isGoogleMapsUrl = value.includes('www.google.com/maps') || value.includes('maps.google.com') || value.includes('goo.gl/maps');
    if (value && isValidURL(value) && !isGoogleMapsUrl) {
      fetchMetadata(value);
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
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            as={Link}
            to={`/group/${groupId}`}
            variant="light"
            size="sm"
            className="mb-5 -ml-2"
            startContent={<ArrowLeft size={16} />}
          >
            グループに戻る
          </Button>

          <div className="mb-6">
            <h1 className="font-display text-3xl text-deep-sea dark:text-parchment mb-2">
              ブックマークを追加
            </h1>
            <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65">
              URLを貼る・場所を検索する、どちらか片方でも両方でもOKです
            </p>
          </div>

          <Form method="post" className="space-y-5">
            {/* Hidden metadata fields */}
            {metadata && (
              <>
                <input type="hidden" name="autoTitle" value={metadata.title || ""} />
                <input type="hidden" name="autoDescription" value={metadata.description || ""} />
                <input type="hidden" name="autoImageUrl" value={metadata.image || ""} />
                <input type="hidden" name="autoSiteName" value={metadata.site_name || ""} />
              </>
            )}

            {/* === 始め方ブロック === */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* URLから取得 */}
              <div className="surface p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-deep-sea/10 text-deep-sea dark:text-gold-soft">
                      <Globe size={14} />
                    </span>
                    <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">
                      URLから取得
                    </h2>
                  </div>
                  {url && metadata?.success && (
                    <span className="inline-flex items-center gap-1 text-xs text-moss dark:text-moss-soft">
                      <Check size={12} /> 取得済み
                    </span>
                  )}
                </div>
                <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-3">
                  食べログ・公式サイト等。タイトルと画像を自動取得
                </p>
                <Input
                  type="url"
                  name="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onClear={() => setUrl("")}
                  placeholder="https://..."
                  variant="bordered"
                  size="sm"
                  isClearable
                  classNames={{ inputWrapper: "bg-content2" }}
                  endContent={
                    isLoadingMetadata ? (
                      <RotateCw
                        size={14}
                        className="animate-spin text-deep-sea-ink/40 dark:text-parchment/40"
                      />
                    ) : null
                  }
                />
                {metadata?.success && (metadata.title || metadata.image) && (
                  <div className="mt-3 flex gap-3 items-center surface-inset rounded-md p-2 border border-line">
                    {metadata.image && (
                      <img
                        src={metadata.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-deep-sea-ink dark:text-parchment truncate">
                        {metadata.title}
                      </div>
                      {metadata.site_name && (
                        <div className="text-[10px] text-deep-sea-ink/55 dark:text-parchment/55 truncate">
                          {metadata.site_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 場所を選ぶ */}
              <div className="surface p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-rust/10 text-rust dark:text-rust-soft">
                      <MapPin size={14} />
                    </span>
                    <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">
                      場所を選ぶ
                    </h2>
                  </div>
                  {placeName && (
                    <span className="inline-flex items-center gap-1 text-xs text-moss dark:text-moss-soft">
                      <Check size={12} /> 選択済み
                    </span>
                  )}
                </div>
                <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-3">
                  Googleマップから検索。住所と座標を自動入力
                </p>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  defaultLocation={latitude && longitude ? { latitude, longitude } : null}
                />
                {placeName && (
                  <div className="mt-3 surface-inset rounded-md p-2 border border-line text-xs">
                    <div className="font-medium text-deep-sea-ink dark:text-parchment truncate">
                      {placeName}
                    </div>
                    {address && (
                      <div className="text-deep-sea-ink/60 dark:text-parchment/60 truncate mt-0.5">
                        {address}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setLatitude(null);
                        setLongitude(null);
                        setAddress("");
                        setPlaceName("");
                        setPlaceId("");
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-rust hover:underline"
                    >
                      <X size={10} /> 場所をクリア
                    </button>
                  </div>
                )}
                {latitude && longitude && (
                  <>
                    <input type="hidden" name="latitude" value={latitude} />
                    <input type="hidden" name="longitude" value={longitude} />
                  </>
                )}
                {address && <input type="hidden" name="address" value={address} />}
                {placeName && <input type="hidden" name="placeName" value={placeName} />}
                {placeId && <input type="hidden" name="placeId" value={placeId} />}
              </div>
            </div>

            {/* === 詳細 === */}
            <div className="surface p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-default text-deep-sea-ink/70 dark:text-parchment/70">
                  <Pencil size={14} />
                </span>
                <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">
                  詳細を入力
                </h2>
              </div>
              <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-4">
                自動取得された情報は、必要に応じて編集できます
              </p>

              <div className="space-y-4">
                {/* Title */}
                <Input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onClear={() => setTitle("")}
                  label="タイトル"
                  labelPlacement="outside"
                  placeholder="美味しいラーメン店"
                  variant="bordered"
                  maxLength={200}
                  isRequired
                  isClearable
                  classNames={{
                    inputWrapper: "bg-content2",
                    label: "text-xs font-medium",
                  }}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <Select
                    name="category"
                    selectedKeys={[category]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as Category;
                      setCategory(value);
                    }}
                    label="カテゴリ"
                    labelPlacement="outside"
                    variant="bordered"
                    isRequired
                    classNames={{
                      trigger: "bg-content2",
                      label: "text-xs font-medium",
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat}>{cat}</SelectItem>
                    ))}
                  </Select>

                  {/* Priority */}
                  <Slider
                    label="興味度"
                    size="sm"
                    step={1}
                    minValue={1}
                    maxValue={5}
                    value={priority}
                    onChange={(value) => setPriority(Array.isArray(value) ? value[0] : value)}
                    color="warning"
                    showSteps
                    getValue={(val) => `${val} / 5`}
                    classNames={{
                      base: "gap-2",
                      label: "text-xs font-medium text-deep-sea-ink dark:text-parchment",
                      value: "text-xs text-deep-sea-ink/65 dark:text-parchment/65",
                      track: "bg-content3",
                    }}
                  />
                  <input type="hidden" name="priority" value={priority} />
                </div>

                {/* Themes */}
                {themes.length > 0 && (
                  <Select
                    label="テーマ（複数可・任意）"
                    labelPlacement="outside"
                    placeholder="テーマを選択..."
                    selectionMode="multiple"
                    selectedKeys={selectedThemeIds}
                    onSelectionChange={(keys) => {
                      setSelectedThemeIds(new Set(Array.from(keys).map(String)));
                    }}
                    variant="bordered"
                    classNames={{
                      trigger: "min-h-12 bg-content2",
                      value: "flex flex-wrap gap-1",
                      label: "text-xs font-medium",
                    }}
                    renderValue={(items) => (
                      <div className="flex flex-wrap gap-1">
                        {items.map((item) => {
                          const theme = themes.find((t) => t.id === item.key);
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
                )}
                {Array.from(selectedThemeIds).map((themeId) => (
                  <input key={themeId} type="hidden" name="themeIds" value={themeId} />
                ))}

                {/* Description */}
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  label="説明（補足）"
                  labelPlacement="outside"
                  placeholder="メニュー、営業時間、ひとこと感想など"
                  variant="bordered"
                  minRows={3}
                  maxLength={500}
                  classNames={{
                    inputWrapper: "bg-content2",
                    label: "text-xs font-medium",
                  }}
                />

                {/* Memo */}
                <Textarea
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  label="メモ"
                  labelPlacement="outside"
                  placeholder="友人おすすめ！"
                  variant="bordered"
                  minRows={2}
                  maxLength={1000}
                  classNames={{
                    inputWrapper: "bg-content2",
                    label: "text-xs font-medium",
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {actionData?.error && (
              <div className="px-4 py-3 bg-rust/10 border border-rust/40 rounded-md">
                <p className="text-rust text-sm">{actionData.error}</p>
              </div>
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
        </div>
      </div>
    </>
  );
}