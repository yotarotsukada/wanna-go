import type { Route } from "./+types/group";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams, useSubmit } from "react-router";
import { getGroup, getGroupBookmarks } from "../services/group.server";
import { updateBookmark, deleteBookmark } from "../services/bookmark.server";
import { CATEGORIES } from "../lib/constants";
import type { Group, Bookmark, BookmarksResponse } from "../lib/types";
import { BookmarkCard } from "../components/bookmark-card";
import { json, redirect } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `グループ ${params.groupId} - WishMap` },
    { name: "description", content: "行きたい場所のブックマーク一覧" },
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

  try {
    const [group, bookmarksData] = await Promise.all([
      getGroup(groupId),
      getGroupBookmarks(groupId, {
        category: category !== "all" ? category : undefined,
        visited: visited !== "all" ? visited : undefined,
        search: search || undefined,
      }),
    ]);

    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    return json({ group, bookmarksData });
  } catch (error) {
    console.error("Error loading group data:", error);
    throw new Response("Failed to load group data", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const bookmarkId = formData.get("bookmarkId")?.toString();

  if (!bookmarkId) {
    return json({ error: "Bookmark ID is required" }, { status: 400 });
  }

  try {
    if (intent === "toggle-visited") {
      const visited = formData.get("visited") === "true";
      await updateBookmark(bookmarkId, {
        visited,
        visitedAt: visited ? new Date().toISOString() : undefined,
      } as any);
    } else if (intent === "delete") {
      await deleteBookmark(bookmarkId);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}

export default function GroupPage() {
  const { group, bookmarksData } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  
  // Filters from URL params
  const categoryFilter = searchParams.get("category") || "all";
  const visitedFilter = searchParams.get("visited") || "all";
  const searchQuery = searchParams.get("search") || "";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {group.name}
            </h1>
            <div className="flex gap-2">
              <Link
                to={`/group/${group.id}/settings`}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="グループ設定"
              >
                ⚙️
              </Link>
            </div>
          </div>
        </div>

        {/* Add bookmark button */}
        <div className="mb-6">
          <Link
            to={`/group/${group.id}/add`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            + ブックマーク追加
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Visited filter */}
            <div>
              <select
                value={visitedFilter}
                onChange={(e) => updateFilters({ visited: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="false">未訪問</option>
                <option value="true">訪問済み</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="🔍検索..."
                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{bookmarksData.stats.total_count}</div>
              <div className="text-sm text-gray-600">総数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{bookmarksData.stats.visited_count}</div>
              <div className="text-sm text-gray-600">訪問済み</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{bookmarksData.stats.unvisited_count}</div>
              <div className="text-sm text-gray-600">未訪問</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{bookmarksData.stats.avg_priority.toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均興味度</div>
            </div>
          </div>
        </div>

        {/* Bookmarks */}
        <div className="space-y-4">
          {bookmarksData.bookmarks.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== "all" || visitedFilter !== "all"
                  ? "条件に一致するブックマークがありません"
                  : "まだブックマークがありません"}
              </p>
              <Link
                to={`/group/${group.id}/add`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                最初のブックマークを追加
              </Link>
            </div>
          ) : (
            bookmarksData.bookmarks.map(bookmark => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onToggleVisited={handleToggleVisited}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}