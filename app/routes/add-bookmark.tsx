import type { Route } from "./+types/add-bookmark";
import { useState, useCallback } from "react";
import { Link, useParams, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { createBookmark } from "../services/bookmark.server";
import { CATEGORIES } from "../lib/constants";
import { isValidURL, debounce } from "../lib/utils";
import type { Category } from "../lib/constants";
import type { UrlMetadata } from "../lib/types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `ブックマーク追加 - wanna-go` },
    { name: "description", content: "新しいブックマークを追加" },
  ];
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
  const priority = Number(formData.get("priority")) || 3;
  const autoTitle = formData.get("autoTitle")?.toString();
  const autoDescription = formData.get("autoDescription")?.toString();
  const autoImageUrl = formData.get("autoImageUrl")?.toString();
  const autoSiteName = formData.get("autoSiteName")?.toString();

  if (!title?.trim() || !url?.trim() || !category) {
    return { error: "タイトル、URL、カテゴリは必須です" };
  }

  if (!isValidURL(url)) {
    return { error: "有効なURLを入力してください" };
  }

  try {
    await createBookmark(groupId, {
      title: title.trim(),
      url: url.trim(),
      category,
      memo: memo?.trim() || undefined,
      address: address?.trim() || undefined,
      priority,
      autoTitle: autoTitle || undefined,
      autoDescription: autoDescription || undefined,
      autoImageUrl: autoImageUrl || undefined,
      autoSiteName: autoSiteName || undefined,
    });

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
  
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("レストラン");
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState(3);
  const [memo, setMemo] = useState("");
  
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
              ← ブックマークを追加
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
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
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => url && fetchMetadata(url)}
                    disabled={!url || !isValidURL(url) || isLoadingMetadata}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                  >
                    URLから情報を取得
                  </button>
                  {isLoadingMetadata && <span className="text-sm text-gray-500 dark:text-gray-400">🔄取得中...</span>}
                </div>
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
                  placeholder="美味しいラーメン店"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={200}
                  required
                />
                {metadata?.success && metadata.title && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">(自動取得: {metadata.title})</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明 (自動取得)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="説明文..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={500}
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
                  placeholder="東京都渋谷区上原1-2-3"
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
                  placeholder="友人おすすめ！"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={1000}
                />
              </div>

              {/* Error Message */}
              {actionData?.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}