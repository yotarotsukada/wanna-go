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
import { Button, Card, CardBody, Input, Textarea, Select, SelectItem, Slider, Chip, Checkbox } from "@heroui/react";

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

    return Response.json({ bookmark, group, themes, bookmarkThemes });
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
    return Response.json({ error: "Bookmark ID is required" }, { status: 400 });
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
      const priority = Number(formData.get("priority")) || 3;
      const visited = formData.get("visited") === "on";
      const themeIds = formData.getAll("themeIds").map(id => id.toString()).filter(Boolean);

      if (!title?.trim() || !url?.trim() || !category) {
        return Response.json({ error: "タイトル、URL、カテゴリは必須です" });
      }

      if (!isValidURL(url)) {
        return Response.json({ error: "有効なURLを入力してください" });
      }

      await updateBookmark(bookmarkId, {
        title: title.trim(),
        url: url.trim(),
        category,
        memo: memo?.trim() || undefined,
        address: address?.trim() || undefined,
        priority,
        visited,
      });

      // テーマとの関連付けを更新
      await themeService.updateBookmarkThemes(bookmarkId, themeIds);

      return redirect(`/group/${groupId}`);
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "操作に失敗しました" });
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
  const [priority, setPriority] = useState(bookmark.priority);
  const [memo, setMemo] = useState(bookmark.memo || "");
  const [visited, setVisited] = useState(bookmark.visited);
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<string>>(
    new Set(bookmarkThemes.map(theme => theme.id))
  );
  
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={`/group/${groupId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              ← ブックマークを編集
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <Form method="post" className="space-y-6">
              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={200}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  カテゴリ *
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  住所・場所（任意）
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={200}
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  興味度
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id="priority"
                    name="priority"
                    min="1"
                    max="5"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg">{'⭐'.repeat(priority)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-16">({priority}/5)</span>
                </div>
              </div>

              {/* Themes */}
              {themes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    テーマ（任意）
                  </label>
                  <div className="space-y-2">
                    {themes.map((theme) => (
                      <div key={theme.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`theme-${theme.id}`}
                          checked={selectedThemeIds.has(theme.id)}
                          onChange={(e) => {
                            const newSelectedThemeIds = new Set(selectedThemeIds);
                            if (e.target.checked) {
                              newSelectedThemeIds.add(theme.id);
                            } else {
                              newSelectedThemeIds.delete(theme.id);
                            }
                            setSelectedThemeIds(newSelectedThemeIds);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`theme-${theme.id}`} className="text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                          {theme.icon && <span className="mr-1">{theme.icon}</span>}
                          {theme.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Hidden inputs for selected theme IDs */}
                  {Array.from(selectedThemeIds).map((themeId) => (
                    <input key={themeId} type="hidden" name="themeIds" value={themeId} />
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ※ 複数選択可能
                  </p>
                </div>
              )}

              {/* Memo */}
              <div>
                <label htmlFor="memo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  メモ
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={1000}
                />
              </div>

              {/* Visited */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="visited"
                    checked={visited}
                    onChange={(e) => setVisited(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ☑️ 訪問しました
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {actionData?.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {isSubmitting ? "更新中..." : "更新"}
                </button>
                
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  onClick={(e) => {
                    if (!confirm("このブックマークを削除しますか？")) {
                      e.preventDefault();
                    }
                  }}
                >
                  削除
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}