import type { Route } from "./+types/group";
import { Link, useLoaderData, useSearchParams, useSubmit, Form, useActionData, useNavigation } from "react-router";
import { getGroup } from "../services/group.server";
import { getGroupBookmarks, toggleBookmarkVisited, deleteBookmark } from "../services/bookmark.server";
import { themeService } from "../services/theme";
import { CATEGORIES } from "../lib/constants";
import { BookmarkCard } from "../components/bookmark-card";
import { EmojiPicker } from "../components/emoji-picker";
import { redirect } from "react-router";
import { Button, Card, CardBody, Input, Select, SelectItem, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Accordion, AccordionItem, Chip } from "@heroui/react";
import { Settings, Sparkles, Search, Edit, Plus } from "lucide-react";
import { formatDate } from "../lib/utils";
import { useState, Suspense, use } from "react";
import { ThemeValidationError, ThemeNotFoundError } from "../entities/theme/theme-errors";

export function meta({ params, data }: Route.MetaArgs) {
  const group = data?.group;
  
  return [
    { title: `${group?.name || `グループ ${params.groupId}`} - wanna-go` },
    { name: "description", content: group?.description || "行きたい場所のブックマーク一覧" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw redirect("/");
  }

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const visited = url.searchParams.get("visited") || "all";
  const search = url.searchParams.get("search") || "";
  const tab = url.searchParams.get("tab") || "bookmarks";

  try {
    // 重い処理（ブックマーク取得）をPromiseとして開始するが、awaitしない
    const bookmarksDataPromise = getGroupBookmarks(groupId, {
      category: category !== "all" ? category : undefined,
      visited: visited !== "all" ? visited : undefined,
      search: search || undefined,
    });

    // 軽い処理（グループ情報とテーマ）は即座に取得
    const [group, themes] = await Promise.all([
      getGroup(groupId),
      themeService.getThemesByGroupId(groupId),
    ]);

    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    // React Router v7では、Promiseを直接返す
    return {
      group,
      themes,
      tab,
      bookmarksDataPromise,
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
        <Card key={i} className="animate-pulse bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ブックマーク統計情報コンポーネント
function BookmarksStats({ bookmarksDataPromise }: { bookmarksDataPromise: Promise<any> }) {
  const bookmarksData = use(bookmarksDataPromise);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {bookmarksData.stats.total_count}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">総数</div>
        </CardBody>
      </Card>
      <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {bookmarksData.stats.visited_count}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">訪問済み</div>
        </CardBody>
      </Card>
      <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {bookmarksData.stats.unvisited_count}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">未訪問</div>
        </CardBody>
      </Card>
      <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardBody className="py-4">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {bookmarksData.stats.avg_priority.toFixed(1)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">平均興味度</div>
        </CardBody>
      </Card>
    </div>
  );
}

// ブックマーク一覧コンポーネント
function BookmarksList({ 
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
  
  if (bookmarksData.bookmarks.length === 0) {
    return (
      <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardBody className="py-16">
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || categoryFilter !== "all" || visitedFilter !== "all"
              ? "条件に一致するブックマークがありません"
              : "まだブックマークがありません"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
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
      {bookmarksData.bookmarks.map((bookmark: any) => (
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

export default function GroupPage() {
  const data = useLoaderData<typeof loader>();
  const { group, themes, tab, bookmarksDataPromise } = data;
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // Filters from URL params
  const categoryFilter = searchParams.get("category") || "all";
  const visitedFilter = searchParams.get("visited") || "all";
  const searchQuery = searchParams.get("search") || "";
  const currentTab = tab as string;

  const updateFilters = (newFilters: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  const handleTabChange = (key: string | number) => {
    const tabKey = String(key);
    const newSearchParams = new URLSearchParams(searchParams);
    if (tabKey === "bookmarks") {
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", tabKey);
    }
    setSearchParams(newSearchParams);
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
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

        {/* Stats Cards - only show for bookmarks tab */}
        {currentTab === "bookmarks" && (
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-pulse">
                    <CardBody className="py-4">
                      <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-1"></div>
                      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            }
          >
            <BookmarksStats bookmarksDataPromise={bookmarksDataPromise} />
          </Suspense>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <Tabs
            selectedKey={currentTab}
            onSelectionChange={handleTabChange}
          >
            <Tab key="bookmarks" title="ブックマーク一覧" />
            <Tab key="themes" title="テーマ一覧" />
          </Tabs>
        </div>

        {/* Filters - Only show for bookmarks tab */}
        {currentTab === "bookmarks" && (
          <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardBody>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Category filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 min-w-fit">カテゴリ:</label>
                  <Select
                    selectedKeys={[categoryFilter]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      updateFilters({ category: value });
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
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 min-w-fit">状態:</label>
                  <Select
                    selectedKeys={[visitedFilter]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      updateFilters({ visited: value });
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
                    value={searchQuery}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    placeholder="場所やメモで検索..."
                    variant="bordered"
                    size="sm"
                    startContent={<Search size={16} className="text-slate-500 dark:text-slate-400" />}
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
              <BookmarksList
                bookmarksDataPromise={bookmarksDataPromise}
                group={group}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                visitedFilter={visitedFilter}
                handleToggleVisited={handleToggleVisited}
                handleDelete={handleDelete}
              />
            </Suspense>
          ) : (
            // Themes content
            <>
              {themes.length === 0 ? (
                <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardBody className="py-16">
                    <h3 className="text-xl font-semibold mb-2">
                      テーマがありません
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
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
              ) : (
                themes.map(theme => (
                  <Card key={theme.id} className="animate-fadeIn group hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-2">
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
                                  <span className="text-sm text-slate-500 dark:text-slate-400">
                                    作成日: {formatDate(typeof theme.createdAt === 'string' ? theme.createdAt : theme.createdAt.toISOString())}
                                  </span>
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
                  </Card>
                ))
              )}
            </>
          )}
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
  );
}