import type { Route } from "./+types/group-settings";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";
import type { Group, BookmarksResponse } from "../lib/types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `グループ設定 - WishMap` },
    { name: "description", content: "グループの設定と統計情報" },
  ];
}

export default function GroupSettings() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<BookmarksResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    if (!groupId) return;
    
    setLoading(true);
    setError("");

    try {
      const [groupData, bookmarksData] = await Promise.all([
        api.getGroup(groupId),
        api.getGroupBookmarks(groupId),
      ]);

      setGroup(groupData);
      setStats(bookmarksData.stats);
      setName(groupData.name);
      setDescription(groupData.description || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setUpdateError("グループ名は必須です");
      return;
    }

    if (!groupId) return;

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      const updatedGroup = await api.updateGroup(groupId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      setGroup(updatedGroup);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/group/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("URLをコピーしました");
    }).catch(() => {
      alert("URLのコピーに失敗しました");
    });
  };

  const showQRCode = () => {
    const url = `${window.location.origin}/group/${groupId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">グループが見つかりません</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
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
              ← グループ設定
            </Link>
          </div>

          {/* Group Info */}
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              グループ情報
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Group Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ名
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
              </div>

              {/* Messages */}
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{updateError}</p>
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">設定を更新しました</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isUpdating ? "更新中..." : "設定を更新"}
              </button>
            </form>
          </div>

          {/* Sharing */}
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              共有
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                グループURL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/group/${groupId}`}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={copyUrl}
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                >
                  URLをコピー
                </button>
                <button
                  onClick={showQRCode}
                  className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                >
                  QRコード表示
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                統計情報
              </h2>

              <ul className="space-y-2 text-gray-700">
                <li>• 総ブックマーク数: {stats.total_count}件</li>
                <li>• 訪問済み: {stats.visited_count}件</li>
                <li>• 未訪問: {stats.unvisited_count}件</li>
                <li>• 平均興味度: {stats.avg_priority.toFixed(1)}/5</li>
                <li>• 作成日: {formatDate(group.createdAt)}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}