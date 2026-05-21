import type { Route } from "./+types/edit-bookmark";
import { useState } from "react";
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
import { redirect } from "react-router";
import { Button, Input, Textarea, Select, SelectItem, Slider, Chip } from "@heroui/react";
import { ArrowLeft, MapPin, Globe, Check, X, Pencil } from "lucide-react";
import { LocationSearch } from "../components/location-search";
import { AppHeader } from "../components/app-header";

export function meta() {
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
  const { bookmark, themes, bookmarkThemes } = useLoaderData() as { 
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
              ブックマークを編集
            </h1>
          </div>

          <Form method="post" className="space-y-5">
            {/* === 始め方ブロック === */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* URL */}
              <div className="surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-deep-sea/10 text-deep-sea dark:text-gold-soft">
                    <Globe size={14} />
                  </span>
                  <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">
                    URL
                  </h2>
                </div>
                <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-3">
                  リンク先のページ
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
                />
                {(url.includes("www.google.com/maps") || url.includes("maps.google.com") || url.includes("goo.gl/maps")) && (
                  <div className="mt-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={<MapPin size={14} />}
                    >
                      場所のURL
                    </Chip>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="surface p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-rust/10 text-rust dark:text-rust-soft">
                      <MapPin size={14} />
                    </span>
                    <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">
                      場所
                    </h2>
                  </div>
                  {placeName && (
                    <span className="inline-flex items-center gap-1 text-xs text-moss dark:text-moss-soft">
                      <Check size={12} /> 設定済み
                    </span>
                  )}
                </div>
                <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-3">
                  Googleマップから検索して紐づけ
                </p>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  defaultLocation={latitude && longitude ? {
                    latitude,
                    longitude,
                    address: bookmark.address || "",
                    placeName: bookmark.placeName || bookmark.title,
                    placeId: bookmark.placeId || undefined,
                  } : null}
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
                  詳細
                </h2>
              </div>
              <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-4">
                タイトルや興味度・テーマを編集できます
              </p>

              <div className="space-y-4">
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

            {actionData?.error && (
              <div className="px-4 py-3 bg-rust/10 border border-rust/40 rounded-md">
                <p className="text-rust text-sm">{actionData.error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="flex-1"
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
                variant="flat"
                size="lg"
                onPress={() => {
                  return confirm("このブックマークを削除しますか？");
                }}
              >
                削除
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}