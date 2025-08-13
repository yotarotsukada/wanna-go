import type { Route } from "./+types/edit-bookmark";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { api } from "../lib/api";
import { CATEGORIES } from "../lib/constants";
import { isValidURL } from "../lib/utils";
import type { Category, Bookmark } from "../lib/types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `ブックマーク編集 - WishMap` },
    { name: "description", content: "ブックマークを編集" },
  ];
}

export default function EditBookmark() {
  const { groupId, bookmarkId } = useParams();
  const navigate = useNavigate();
  
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("レストラン");
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState(3);
  const [memo, setMemo] = useState("");
  const [visited, setVisited] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookmarkId) {
      loadBookmark();
    }
  }, [bookmarkId]);

  const loadBookmark = async () => {
    if (!bookmarkId) return;
    
    setLoading(true);
    try {
      const data = await api.getBookmark(bookmarkId);
      setBookmark(data);
      setUrl(data.url);
      setTitle(data.title);
      setCategory(data.category);
      setAddress(data.address || "");
      setPriority(data.priority);
      setMemo(data.memo || "");
      setVisited(data.visited);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ブックマークの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim() || !category) {
      setError("タイトル、URL、カテゴリは必須です");
      return;
    }

    if (!isValidURL(url)) {
      setError("有効なURLを入力してください");
      return;
    }

    if (!bookmarkId) return;

    setIsSubmitting(true);
    setError("");

    try {
      await api.updateBookmark(bookmarkId, {
        title: title.trim(),
        url: url.trim(),
        category,
        memo: memo.trim() || undefined,
        address: address.trim() || undefined,
        priority,
        visited,
        visitedAt: visited ? new Date().toISOString() : undefined,
      });

      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ブックマークの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このブックマークを削除しますか？")) return;
    if (!bookmarkId) return;

    try {
      await api.deleteBookmark(bookmarkId);
      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ブックマークの削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !bookmark) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to={`/group/${groupId}`} className="text-blue-600 hover:text-blue-800">
            グループに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={`/group/${groupId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← ブックマークを編集
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所・場所（任意）
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  興味度
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id="priority"
                    min="1"
                    max="5"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg">{'⭐'.repeat(priority)}</span>
                  <span className="text-sm text-gray-500 w-16">({priority}/5)</span>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
                  メモ
                </label>
                <textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={1000}
                />
              </div>

              {/* Visited */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={visited}
                    onChange={(e) => setVisited(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ☑️ 訪問しました
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
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
                  type="button"
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  削除
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}