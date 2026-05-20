import type { Route } from "./+types/group";
import { Link, useLoaderData, useSubmit, Form, useActionData, useNavigation } from "react-router";
import { useQueryState, parseAsString } from "nuqs";
import { getGroup } from "../services/group.server";
import { getGroupBookmarks, toggleBookmarkVisited, deleteBookmark } from "../services/bookmark.server";
import { themeService } from "../services/theme";
import { CATEGORIES } from "../lib/constants";
import { BookmarkCard } from "../components/bookmark-card";
import { EmojiPicker } from "../components/emoji-picker";
import { MapView } from "../components/map-view";
import { redirect } from "react-router";
import { Button, Card, CardBody, Input, Select, SelectItem, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Accordion, AccordionItem, Chip } from "@heroui/react";
import { Settings, Sparkles, Search, Edit, Plus, MapPin, Bookmark, Palette } from "lucide-react";
import { formatDate } from "../lib/utils";
import { useState, Suspense, use, useMemo, useEffect, useRef, useCallback } from "react";
import { ThemeValidationError, ThemeNotFoundError } from "../entities/theme/theme-errors";
import { AppHeader } from "../components/app-header";
import { ProgressGauge } from "../components/progress-gauge";
import { EmptyAtlas } from "../components/empty-atlas";
import { LoadingCompass } from "../components/loading-compass";
import { StampChip } from "../components/stamp-chip";

// デバウンスカスタムフック
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function meta({ params, data }: Route.MetaArgs) {
  const group = data?.group;
  
  return [
    { title: `${group?.name || `グループ ${params.groupId}`} - wanna-go` },
    { name: "description", content: group?.description || "行きたい場所のブックマーク一覧" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw redirect("/");
  }

  try {
    // 最重要：グループ情報は即座に取得（404チェックのため）
    const group = await getGroup(groupId);
    
    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    // 全ブックマークを取得（フィルタなし）
    const bookmarksDataPromise = getGroupBookmarks(groupId);
    
    // テーマもPromiseとして開始（ブックマークより軽いが分離）
    const themesPromise = themeService.getThemesByGroupId(groupId);

    // Google Maps APIキーをサーバー側で取得（セキュア）
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

    // React Router v7では、Promiseを直接返す
    return {
      group,
      bookmarksDataPromise,
      themesPromise,
      googleMapsApiKey,
    };
  } catch (error) {
    console.error("Error loading group data:", error);
    throw new Response("Failed to load group data", { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "toggle-visited") {
      const bookmarkId = formData.get("bookmarkId")?.toString();
      if (!bookmarkId) {
        throw new Response("Bookmark ID is required", { status: 400 });
      }
      const visited = formData.get("visited") === "true";
      await toggleBookmarkVisited(bookmarkId, visited);
    } else if (intent === "delete") {
      const bookmarkId = formData.get("bookmarkId")?.toString();
      if (!bookmarkId) {
        throw new Response("Bookmark ID is required", { status: 400 });
      }
      await deleteBookmark(bookmarkId);
    } else if (intent === "delete-theme") {
      const themeId = formData.get("themeId")?.toString();
      if (!themeId) {
        throw new Response("Theme ID is required", { status: 400 });
      }
      await themeService.deleteTheme(themeId);
    } else if (intent === "create-theme") {
      const name = formData.get("name") as string;
      const icon = formData.get("icon") as string;

      // バリデーション
      if (!name || name.trim().length === 0) {
        return { error: "テーマ名は必須です" };
      } else if (name.trim().length > 20) {
        return { error: "テーマ名は20文字以内で入力してください" };
      }

      await themeService.createTheme({
        groupId: groupId!,
        name: name.trim(),
        icon: icon?.trim() || undefined,
      });
      
      // テーマ作成後はテーマタブにリダイレクト
      return redirect(`/group/${groupId}?tab=themes`);
    } else if (intent === "edit-theme") {
      const themeId = formData.get("themeId")?.toString();
      const name = formData.get("name") as string;
      const icon = formData.get("icon") as string;

      if (!themeId) {
        throw new Response("Theme ID is required", { status: 400 });
      }

      // バリデーション
      if (!name || name.trim().length === 0) {
        return { error: "テーマ名は必須です" };
      } else if (name.trim().length > 20) {
        return { error: "テーマ名は20文字以内で入力してください" };
      }

      await themeService.updateTheme(themeId, {
        name: name.trim(),
        icon: icon?.trim() || undefined,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating:", error);
    
    if (error instanceof ThemeValidationError) {
      return { error: error.message };
    }
    
    if (error instanceof ThemeNotFoundError) {
      return { error: "テーマが見つかりません" };
    }
    
    throw new Response("Failed to update", { status: 500 });
  }
}

// ブックマークスケルトンコンポーネント
function BookmarksSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="paper-card animate-pulse p-5">
          <div className="h-6 bg-deep-sea/15 dark:bg-parchment/15 rounded mb-3 w-3/4"></div>
          <div className="h-4 bg-deep-sea/10 dark:bg-parchment/10 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-deep-sea/10 dark:bg-parchment/10 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

// フィルタリング関数
function filterBookmarks(bookmarks: any[], searchQuery: string, categoryFilter: string, visitedFilter: string) {
  return bookmarks.filter((bookmark) => {
    // 検索クエリフィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = bookmark.title.toLowerCase().includes(query);
      const memoMatch = bookmark.memo?.toLowerCase().includes(query) || false;
      const addressMatch = bookmark.address?.toLowerCase().includes(query) || false;
      const autoTitleMatch = bookmark.autoTitle?.toLowerCase().includes(query) || false;
      const autoDescriptionMatch = bookmark.autoDescription?.toLowerCase().includes(query) || false;
      
      if (!titleMatch && !memoMatch && !addressMatch && !autoTitleMatch && !autoDescriptionMatch) {
        return false;
      }
    }
    
    // カテゴリフィルタ
    if (categoryFilter !== "all" && bookmark.category !== categoryFilter) {
      return false;
    }
    
    // 訪問状態フィルタ
    if (visitedFilter !== "all") {
      const isVisited = bookmark.visited;
      if (visitedFilter === "true" && !isVisited) return false;
      if (visitedFilter === "false" && isVisited) return false;
    }
    
    return true;
  });
}

// 統計計算関数
function calculateStats(bookmarks: any[]) {
  const totalCount = bookmarks.length;
  const visitedCount = bookmarks.filter(b => b.visited).length;
  const unvisitedCount = totalCount - visitedCount;
  const avgPriority = totalCount > 0 ? bookmarks.reduce((sum, b) => sum + b.priority, 0) / totalCount : 0;
  
  return {
    total_count: totalCount,
    visited_count: visitedCount,
    unvisited_count: unvisitedCount,
    avg_priority: avgPriority
  };
}

// ブックマーク統計コンテナ（Suspense内で使用）
function BookmarksStatsContainer({
  bookmarksDataPromise,
  searchQuery,
  categoryFilter,
  visitedFilter
}: {
  bookmarksDataPromise: Promise<any>;
  searchQuery: string;
  categoryFilter: string;
  visitedFilter: string;
}) {
  const bookmarksData = use(bookmarksDataPromise);
  
  const filteredBookmarks = useMemo(() => {
    return filterBookmarks(
      bookmarksData.bookmarks,
      searchQuery,
      categoryFilter,
      visitedFilter
    );
  }, [bookmarksData.bookmarks, searchQuery, categoryFilter, visitedFilter]);
  
  return <BookmarksStats filteredBookmarks={filteredBookmarks} />;
}

// ブックマーク統計情報コンポーネント
function BookmarksStats({
  filteredBookmarks,
}: {
  filteredBookmarks: any[];
}) {
  const stats = calculateStats(filteredBookmarks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <ProgressGauge
        visited={stats.visited_count}
        total={stats.total_count}
        label="訪問済み"
        className="md:col-span-2"
      />
      <div className="paper-card px-5 py-4 flex flex-col justify-center">
        <div className="text-xs uppercase tracking-[0.18em] text-deep-sea/70 dark:text-parchment/60 mb-1 font-serif-jp">
          ブックマーク数
        </div>
        <div className="font-display text-3xl text-deep-sea dark:text-parchment mb-3">
          {stats.total_count}
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-deep-sea/70 dark:text-parchment/60 mb-1 font-serif-jp">
          平均興味度
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl text-gold-soft dark:text-gold-soft">
            {stats.avg_priority.toFixed(1)}
          </span>
          <span className="text-deep-sea-ink/55 dark:text-parchment/55 text-sm">/ 5</span>
        </div>
      </div>
    </div>
  );
}

// ブックマークコンテンツコンポーネント（Suspense内で使用）
function BookmarksContent({
  bookmarksDataPromise,
  group,
  searchQuery,
  categoryFilter,
  visitedFilter,
  handleToggleVisited,
  handleDelete
}: {
  bookmarksDataPromise: Promise<any>;
  group: any;
  searchQuery: string;
  categoryFilter: string;
  visitedFilter: string;
  handleToggleVisited: (bookmarkId: string, visited: boolean) => void;
  handleDelete: (bookmarkId: string) => void;
}) {
  const bookmarksData = use(bookmarksDataPromise);
  
  const filteredBookmarks = useMemo(() => {
    return filterBookmarks(
      bookmarksData.bookmarks,
      searchQuery,
      categoryFilter,
      visitedFilter
    );
  }, [bookmarksData.bookmarks, searchQuery, categoryFilter, visitedFilter]);
  
  return (
    <BookmarksList
      filteredBookmarks={filteredBookmarks}
      group={group}
      searchQuery={searchQuery}
      categoryFilter={categoryFilter}
      visitedFilter={visitedFilter}
      handleToggleVisited={handleToggleVisited}
      handleDelete={handleDelete}
    />
  );
}

// ブックマーク一覧コンポーネント
function BookmarksList({ 
  filteredBookmarks,
  group, 
  searchQuery, 
  categoryFilter, 
  visitedFilter,
  handleToggleVisited,
  handleDelete 
}: { 
  filteredBookmarks: any[];
  group: any;
  searchQuery: string;
  categoryFilter: string;
  visitedFilter: string;
  handleToggleVisited: (bookmarkId: string, visited: boolean) => void;
  handleDelete: (bookmarkId: string) => void;
}) {
  if (filteredBookmarks.length === 0) {
    const isFiltered =
      searchQuery || categoryFilter !== "all" || visitedFilter !== "all";
    return (
      <EmptyAtlas
        title={
          isFiltered
            ? "条件に一致するブックマークがありません"
            : "まだブックマークがありません"
        }
        description={
          isFiltered
            ? "フィルターを変更するか、新しいブックマークを追加してみましょう"
            : "最初の行きたい場所を追加して、みんなで共有しましょう"
        }
        action={
          <Button
            as={Link}
            to={`/group/${group.id}/add`}
            color="primary"
            startContent={<Sparkles size={18} />}
          >
            ブックマークを追加
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {filteredBookmarks.map((bookmark: any) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onToggleVisited={handleToggleVisited}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// テーマ一覧コンポーネント
function ThemesList({ 
  themesPromise,
  themeBookmarks,
  loadingThemes,
  fetchThemeBookmarks,
  handleThemeEdit,
  handleToggleVisited,
  handleDelete,
  onCreateOpen
}: { 
  themesPromise: Promise<any>;
  themeBookmarks: Record<string, any[]>;
  loadingThemes: Record<string, boolean>;
  fetchThemeBookmarks: (themeId: string) => void;
  handleThemeEdit: (theme: any) => void;
  handleToggleVisited: (bookmarkId: string, visited: boolean) => void;
  handleDelete: (bookmarkId: string) => void;
  onCreateOpen: () => void;
}) {
  const themes = use(themesPromise);
  
  if (themes.length === 0) {
    return (
      <EmptyAtlas
        title="テーマがありません"
        description="最初のテーマを作成して、ブックマークを整理しましょう"
        action={
          <Button
            onPress={onCreateOpen}
            color="primary"
            startContent={<Plus size={18} />}
          >
            テーマを作成
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {themes.map((theme: any) => (
        <div key={theme.id} className="paper-card animate-fadeIn">
          <div className="p-4">
            <Accordion
              onSelectionChange={(keys) => {
                const isOpen = Array.from(keys).includes(theme.id);
                if (isOpen) {
                  fetchThemeBookmarks(theme.id);
                }
              }}
            >
              <AccordionItem
                key={theme.id}
                aria-label={theme.name}
                classNames={{
                  title: "px-0 py-0",
                  content: "px-0 pb-0 pt-3",
                  trigger: "p-0",
                  indicator: "hidden",
                }}
                title={
                  <div className="flex items-start justify-between w-full gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-deep-sea dark:text-parchment flex items-center gap-2 mb-2">
                        <span className="text-xl flex-shrink-0">{theme.icon || '🗺️'}</span>
                        <span className="truncate">{theme.name}</span>
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StampChip tone="deep-sea">
                          {theme.bookmarkCount}件のブックマーク
                        </StampChip>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onPress={() => handleThemeEdit(theme)}
                        variant="ghost"
                        size="sm"
                        startContent={<Edit size={16} />}
                      >
                        編集
                      </Button>
                    </div>
                  </div>
                }
              >
                <div className="space-y-3">
                  {loadingThemes[theme.id] ? (
                    <div className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">読み込み中...</div>
                    </div>
                  ) : themeBookmarks[theme.id]?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        このテーマに紐づくブックマークはありません
                      </div>
                    </div>
                  ) : themeBookmarks[theme.id] ? (
                    <div className="space-y-4">
                      {themeBookmarks[theme.id].map(bookmark => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          onToggleVisited={handleToggleVisited}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        クリックでブックマークを表示
                      </div>
                    </div>
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ))}
    </div>
  );
}

// 地図表示コンテナコンポーネント（Suspense内で使用）
function MapViewContainer({
  bookmarksDataPromise,
  googleMapsApiKey
}: {
  bookmarksDataPromise: Promise<any>;
  googleMapsApiKey: string;
}) {
  const bookmarksData = use(bookmarksDataPromise);
  
  return (
    <MapView 
      bookmarks={bookmarksData.bookmarks}
      googleMapsApiKey={googleMapsApiKey}
      className="w-full"
    />
  );
}

export default function GroupPage() {
  const data = useLoaderData<typeof loader>();
  const { group, bookmarksDataPromise, themesPromise, googleMapsApiKey } = data;
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // Theme management state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [createEmoji, setCreateEmoji] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  
  // Theme bookmarks state
  const [themeBookmarks, setThemeBookmarks] = useState<Record<string, any[]>>({});
  const [loadingThemes, setLoadingThemes] = useState<Record<string, boolean>>({});
  
  // nuqsを使ったURL状態管理（ページ再読み込みなし）
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsString.withDefault("all")
  );
  const [visitedFilter, setVisitedFilter] = useQueryState(
    "visited",
    parseAsString.withDefault("all")
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [currentTab, setCurrentTab] = useQueryState(
    "tab",
    parseAsString.withDefault("bookmarks")
  );
  
  // ローカル検索入力状態とデバウンス
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500); // 500msデバウンス
  
  // 検索中かどうかの状態
  const isSearching = localSearchQuery !== searchQuery;
  
  
  // URLパラメータが変わったらローカル状態を更新
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // デバウンスされた検索クエリでURLパラメータを更新（nuqs使用）
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery || null);
    }
  }, [debouncedSearchQuery, searchQuery, setSearchQuery]);

  const handleTabChange = (key: string | number) => {
    const tabKey = String(key);
    if (tabKey === "bookmarks") {
      setCurrentTab(null);
    } else {
      setCurrentTab(tabKey);
    }
  };

  const handleToggleVisited = (bookmarkId: string, visited: boolean) => {
    submit(
      {
        intent: "toggle-visited",
        bookmarkId,
        visited: visited.toString(),
      },
      { method: "post" }
    );
  };

  const handleDelete = (bookmarkId: string) => {
    if (confirm("このブックマークを削除しますか？")) {
      submit(
        {
          intent: "delete",
          bookmarkId,
        },
        { method: "post" }
      );
    }
  };

  const handleThemeDelete = () => {
    if (selectedTheme && confirm(`「${selectedTheme.name}」を削除しますか？`)) {
      submit(
        {
          intent: "delete-theme",
          themeId: selectedTheme.id,
        },
        { method: "post" }
      );
      onEditClose();
      setSelectedTheme(null);
    }
  };

  const handleThemeEdit = (theme: any) => {
    setSelectedTheme(theme);
    setEditEmoji(theme.icon || "");
    onEditOpen();
  };

  const handleCreateTheme = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("icon", createEmoji);
    
    submit(formData, { method: "post" });
    setCreateEmoji("");
    onCreateClose();
  };

  const handleEditTheme = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("themeId", selectedTheme.id);
    formData.set("icon", editEmoji);
    submit(formData, { method: "post" });
    setEditEmoji("");
    onEditClose();
    setSelectedTheme(null);
  };

  const fetchThemeBookmarks = async (themeId: string) => {
    if (loadingThemes[themeId] || themeBookmarks[themeId]) return;
    
    setLoadingThemes(prev => ({ ...prev, [themeId]: true }));
    try {
      const response = await fetch(`/api/theme/${themeId}/bookmarks`);
      if (response.ok) {
        const data = await response.json();
        setThemeBookmarks(prev => ({ ...prev, [themeId]: data.bookmarks || [] }));
      }
    } catch (error) {
      console.error("Error fetching theme bookmarks:", error);
    } finally {
      setLoadingThemes(prev => ({ ...prev, [themeId]: false }));
    }
  };

  return (
    <>
      <AppHeader
        rightSlot={
          <Button
            as={Link}
            to={`/group/${group.id}/settings`}
            variant="ghost"
            size="sm"
            startContent={<Settings size={16} />}
          >
            設定
          </Button>
        }
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/55 dark:text-parchment/55 font-serif-jp mb-2">
              グループID: <span className="font-mono">{group.id}</span>
            </p>
            <h1 className="font-display text-4xl text-deep-sea dark:text-parchment mb-3">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-deep-sea-ink/75 dark:text-parchment/75 max-w-2xl leading-relaxed">
                {group.description}
              </p>
            )}
          </div>

          {/* Add bookmark button */}
          <div className="mb-2">
            <Button
              as={Link}
              to={`/group/${group.id}/add`}
              color="primary"
              className="shadow-paper hover:shadow-paper-hover transition-all duration-200"
              startContent={<Sparkles size={18} />}
            >
              ブックマーク追加
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="paper-card animate-pulse h-24 md:col-span-1 first:md:col-span-2" />
              ))}
            </div>
          }
        >
          <BookmarksStatsContainer 
            bookmarksDataPromise={bookmarksDataPromise}
            searchQuery=""
            categoryFilter="all"
            visitedFilter="all"
          />
        </Suspense>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs
            selectedKey={currentTab}
            onSelectionChange={handleTabChange}
          >
            <Tab key="bookmarks" title={<span className="flex items-center gap-2"><Bookmark size={16} />ブックマーク</span>} />
            <Tab key="themes" title={<span className="flex items-center gap-2"><Palette size={16} />テーマ</span>} />
            <Tab key="map" title={<span className="flex items-center gap-2"><MapPin size={16} />地図</span>} />
          </Tabs>
        </div>

        {/* Filters - Only show for bookmarks tab */}
        {currentTab === "bookmarks" && (
          <div className="paper-card mb-8 p-4">
            <div className="flex flex-wrap gap-4 items-center">
                {/* Category filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-deep-sea-ink/70 dark:text-parchment/70 min-w-fit font-serif-jp">カテゴリ:</label>
                  <Select
                    selectedKeys={[categoryFilter]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setCategoryFilter(value === "all" ? null : value);
                    }}
                    className="min-w-[120px]"
                    size="sm"
                    variant="bordered"
                  >
                    <SelectItem key="all">全て</SelectItem>
                    <>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category}>{category}</SelectItem>
                      ))}
                    </>
                  </Select>
                </div>

                {/* Visited filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-deep-sea-ink/70 dark:text-parchment/70 min-w-fit font-serif-jp">状態:</label>
                  <Select
                    selectedKeys={[visitedFilter]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setVisitedFilter(value === "all" ? null : value);
                    }}
                    className="min-w-[120px]"
                    size="sm"
                    variant="bordered"
                  >
                    <SelectItem key="all">全て</SelectItem>
                    <SelectItem key="false">未訪問</SelectItem>
                    <SelectItem key="true">訪問済み</SelectItem>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex-1 min-w-0 max-w-md">
                  <Input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="場所やメモで検索..."
                    variant="bordered"
                    size="sm"
                    startContent={<Search size={16} className={`text-deep-sea-ink/60 dark:text-parchment/60 ${isSearching ? 'animate-pulse' : ''}`} />}
                  />
                </div>
              </div>
          </div>
        )}

        {/* Add Theme button for themes tab */}
        {currentTab === "themes" && (
          <div className="mb-6">
            <Button
              onPress={onCreateOpen}
              color="primary"
              className="shadow-md hover:shadow-lg transition-all duration-200"
              startContent={<Plus size={20} />}
            >
              テーマを作成
            </Button>
          </div>
        )}
        
        {/* Error message */}
        {actionData?.error && (
          <div className="mb-6 px-4 py-3 bg-rust/10 border border-rust/40 rounded-md">
            <p className="text-rust text-sm">{actionData.error}</p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {currentTab === "bookmarks" ? (
            // Bookmarks content with Suspense
            <Suspense fallback={<BookmarksSkeleton />}>
              <BookmarksContent
                bookmarksDataPromise={bookmarksDataPromise}
                group={group}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                visitedFilter={visitedFilter}
                handleToggleVisited={handleToggleVisited}
                handleDelete={handleDelete}
              />
            </Suspense>
          ) : currentTab === "themes" ? (
            // Themes content with Suspense
            <Suspense fallback={<LoadingCompass label="テーマを開いています…" />}>
              <ThemesList
                themesPromise={themesPromise}
                themeBookmarks={themeBookmarks}
                loadingThemes={loadingThemes}
                fetchThemeBookmarks={fetchThemeBookmarks}
                handleThemeEdit={handleThemeEdit}
                handleToggleVisited={handleToggleVisited}
                handleDelete={handleDelete}
                onCreateOpen={onCreateOpen}
              />
            </Suspense>
          ) : currentTab === "map" ? (
            // Map content with Suspense
            <Suspense fallback={<LoadingCompass label="地図を広げています…" />}>
              <MapViewContainer 
                bookmarksDataPromise={bookmarksDataPromise} 
                googleMapsApiKey={googleMapsApiKey}
              />
            </Suspense>
          ) : null}
        </div>
        
        {/* Create Theme Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg" placement="center">
          <ModalContent>
            <Form onSubmit={handleCreateTheme}>
              <ModalHeader className="flex flex-col gap-1">
                テーマを作成
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    autoFocus
                    name="name"
                    label="テーマ名"
                    placeholder="例: 花火を見たい"
                    variant="bordered"
                    isRequired
                    maxLength={20}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700">
                      アイコン（絵文字、任意）
                    </label>
                    <EmojiPicker
                      value={createEmoji}
                      onChange={setCreateEmoji}
                      placeholder="絵文字を選択してください"
                    />
                    <p className="text-xs text-default-500">
                      花火、ハート、料理などの絵文字でテーマを表現できます
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onCreateClose}>
                  キャンセル
                </Button>
                <Button 
                  color="primary" 
                  type="submit"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  作成
                </Button>
                <input type="hidden" name="intent" value="create-theme" />
              </ModalFooter>
            </Form>
          </ModalContent>
        </Modal>

        {/* Edit Theme Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" placement="center">
          <ModalContent>
            <Form onSubmit={handleEditTheme}>
              <ModalHeader className="flex flex-col gap-1">
                テーマを編集
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    autoFocus
                    name="name"
                    label="テーマ名"
                    variant="bordered"
                    isRequired
                    maxLength={20}
                    defaultValue={selectedTheme?.name || ""}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700">
                      アイコン（絵文字、任意）
                    </label>
                    <EmojiPicker
                      value={editEmoji}
                      onChange={setEditEmoji}
                      placeholder="絵文字を選択してください"
                    />
                  </div>
                  {selectedTheme && (
                    <Card className="bg-slate-50/50 dark:bg-slate-800/50">
                      <CardBody className="p-4">
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          統計情報
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Chip variant="flat" color="primary" size="sm">
                            {selectedTheme.bookmarkCount}件のブックマーク
                          </Chip>
                          <Chip variant="flat" size="sm">
                            作成日: {formatDate(typeof selectedTheme.createdAt === 'string' ? selectedTheme.createdAt : selectedTheme.createdAt.toISOString())}
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex justify-between w-full">
                  <Button
                    color="danger"
                    variant="solid"
                    onPress={handleThemeDelete}
                    isDisabled={selectedTheme?.bookmarkCount > 0}
                    title={selectedTheme?.bookmarkCount > 0 ? "関連するブックマークがあるため削除できません" : "テーマを削除"}
                  >
                    削除
                  </Button>
                  <div className="flex gap-2">
                    <Button color="default" variant="flat" onPress={onEditClose}>
                      キャンセル
                    </Button>
                    <Button 
                      color="primary" 
                      type="submit"
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      更新
                    </Button>
                  </div>
                </div>
                <input type="hidden" name="intent" value="edit-theme" />
              </ModalFooter>
            </Form>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}