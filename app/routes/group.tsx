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
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded-3xl mb-2 w-3/4"></div>
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-3xl w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-stone-200 dark:bg-stone-700 rounded-3xl"></div>
            </div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-3xl w-full mb-2"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-3xl w-2/3"></div>
          </CardBody>
        </Card>
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
  filteredBookmarks 
}: { 
  filteredBookmarks: any[];
}) {
  const stats = calculateStats(filteredBookmarks);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="text-center bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {stats.total_count}
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400">ブックマーク数</div>
        </CardBody>
      </Card>
      <Card className="text-center bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {stats.avg_priority.toFixed(1)}
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400">平均興味度</div>
        </CardBody>
      </Card>
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
    return (
      <Card className="text-center bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
        <CardBody className="py-16">
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || categoryFilter !== "all" || visitedFilter !== "all"
              ? "条件に一致するブックマークがありません"
              : "まだブックマークがありません"}
          </h3>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            {searchQuery || categoryFilter !== "all" || visitedFilter !== "all"
              ? "フィルターを変更するか、新しいブックマークを追加してみましょう"
              : "最初の行きたい場所を追加して、みんなで共有しましょう"}
          </p>
          <Button
            as={Link}
            to={`/group/${group.id}/add`}
            color="primary"
            startContent={<Sparkles size={20} />}
          >
            ブックマークを追加
          </Button>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
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
      <Card className="text-center bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
        <CardBody className="py-16">
          <h3 className="text-xl font-semibold mb-2">
            テーマがありません
          </h3>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            最初のテーマを作成して、ブックマークを整理しましょう
          </p>
          <Button
            onPress={onCreateOpen}
            color="primary"
            startContent={<Plus size={20} />}
          >
            テーマを作成
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {themes.map((theme: any) => (
        <Card key={theme.id} className="animate-fadeIn group hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
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
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2 mb-2">
                        <span className="text-xl flex-shrink-0">{theme.icon || '🗺️'}</span>
                        <span className="truncate">{theme.name}</span>
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Chip 
                          variant="flat" 
                          color="primary"
                          size="sm"
                        >
                          {theme.bookmarkCount}件のブックマーク
                        </Chip>
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
                      <div className="text-stone-500 dark:text-stone-400">読み込み中...</div>
                    </div>
                  ) : themeBookmarks[theme.id]?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-stone-500 dark:text-stone-400">
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
                      <div className="text-stone-500 dark:text-stone-400">
                        クリックでブックマークを表示
                      </div>
                    </div>
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </Card>
      ))}
    </>
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
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2 tracking-tight">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                  {group.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                as={Link}
                to={`/group/${group.id}/settings`}
                variant="ghost"
                size="sm"
                startContent={<Settings size={16} />}
              >
                設定
              </Button>
            </div>
          </div>

          {/* Add bookmark button */}
          <div className="mb-6">
            <Button
              as={Link}
              to={`/group/${group.id}/add`}
              color="primary"
              className="shadow-md hover:shadow-lg transition-all duration-200"
              startContent={<Sparkles size={20} />}
            >
              ブックマーク追加
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="text-center bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm animate-pulse">
                  <CardBody className="py-4">
                    <div className="w-12 h-8 bg-stone-200 dark:bg-stone-700 rounded-3xl mx-auto mb-1"></div>
                    <div className="w-16 h-4 bg-stone-200 dark:bg-stone-700 rounded-3xl mx-auto"></div>
                  </CardBody>
                </Card>
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
          <Card className="mb-8 bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
            <CardBody>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Category filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400 min-w-fit">カテゴリ:</label>
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
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400 min-w-fit">状態:</label>
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
                    startContent={<Search size={16} className={`text-stone-500 dark:text-stone-400 ${isSearching ? 'animate-pulse' : ''}`} />}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
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
          <Card className="mb-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
            <CardBody className="p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
            </CardBody>
          </Card>
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
            <Suspense fallback={
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded-3xl mb-2 w-1/2"></div>
                          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-3xl w-1/3"></div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            }>
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
            <Suspense fallback={
              <Card className="bg-white/80 dark:bg-stone-900/80 shadow-orange-900/5 shadow-xl rounded-3xl border border-orange-100 dark:border-stone-800 backdrop-blur-sm animate-pulse">
                <CardBody className="p-6">
                  <div className="w-full h-96 bg-stone-200 dark:bg-stone-700 rounded-3xl"></div>
                </CardBody>
              </Card>
            }>
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
                    <Card className="bg-stone-50/50 dark:bg-stone-800/50">
                      <CardBody className="p-4">
                        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
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
  );
}