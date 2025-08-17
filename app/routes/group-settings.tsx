import type { Route } from "./+types/group-settings";
import { useState } from "react";
import { Link, Form, useLoaderData, useActionData, useNavigation } from "react-router";
import { getGroup, updateGroup } from "../services/group.server";
import { getGroupBookmarks } from "../services/bookmark.server";
import { formatDate } from "../lib/utils";
import type { Group } from "../entities/group/group";
import type { BookmarksResponse } from "../services/bookmark";
import { redirect } from "react-router";
import { Button, Card, CardBody, CardHeader, Input, Textarea, Chip } from "@heroui/react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `グループ設定 - wanna-go` },
    { name: "description", content: "グループの設定と統計情報" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw redirect("/");
  }

  try {
    const [group, bookmarksData] = await Promise.all([
      getGroup(groupId),
      getGroupBookmarks(groupId, {}),
    ]);

    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    return Response.json({ group, stats: bookmarksData.stats });
  } catch (error) {
    console.error("Error loading group data:", error);
    throw new Response("Failed to load group data", { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  const formData = await request.formData();

  if (!groupId) {
    return Response.json({ error: "Group ID is required" }, { status: 400 });
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();

  if (!name?.trim()) {
    return Response.json({ error: "グループ名は必須です" });
  }

  try {
    await updateGroup(groupId, {
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "更新に失敗しました" });
  }
}

export default function GroupSettings() {
  const { group, stats } = useLoaderData() as { group: Group; stats: BookmarksResponse['stats'] };
  const actionData = useActionData() as { error?: string; success?: boolean } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");

  const copyUrl = () => {
    const url = `${window.location.origin}/group/${group.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("URLをコピーしました");
    }).catch(() => {
      alert("URLのコピーに失敗しました");
    });
  };

  const showQRCode = () => {
    const url = `${window.location.origin}/group/${group.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={`/group/${group.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← グループ設定
            </Link>
          </div>

          {/* Group Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              グループ情報
            </h2>
            
            <Form method="post" className="space-y-4">
              {/* Group Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  グループ名
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
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
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
              </div>

              {/* Messages */}
              {actionData?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{actionData.error}</p>
                </div>
              )}

              {actionData?.success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">設定を更新しました</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? "更新中..." : "設定を更新"}
              </button>
            </Form>
          </div>

          {/* Sharing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              共有
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                グループURL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? `${window.location.origin}/group/${group.id}` : `/group/${group.id}`}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              統計情報
            </h2>

            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• 総ブックマーク数: {stats.total_count}件</li>
              <li>• 訪問済み: {stats.visited_count}件</li>
              <li>• 未訪問: {stats.unvisited_count}件</li>
              <li>• 平均興味度: {stats.avg_priority.toFixed(1)}/5</li>
              <li>• 作成日: {formatDate(group.createdAt)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}