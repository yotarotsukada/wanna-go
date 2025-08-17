import type { Route } from "./+types/group";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams, useSubmit } from "react-router";
import { getGroup } from "../services/group.server";
import { getGroupBookmarks } from "../services/bookmark.server";
import { updateBookmark, deleteBookmark } from "../services/bookmark.server";
import { CATEGORIES } from "../lib/constants";
import type { Group } from "../entities/group/group";
import type { Bookmark } from "../entities/bookmark/bookmark";
import type { BookmarksResponse } from "../services/bookmark";
import { BookmarkCard } from "../components/bookmark-card";
import { redirect } from "react-router";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@heroui/react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `グループ ${params.groupId} - wanna-go` },
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

    return Response.json({ group, bookmarksData });
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
    return Response.json({ error: "Bookmark ID is required" }, { status: 400 });
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

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return Response.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}

export default function GroupPage() {
  const { group, bookmarksData } = useLoaderData() as { group: Group; bookmarksData: BookmarksResponse };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
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
                to={`/group/${group.id}/themes`}
                variant="ghost"
                size="sm"
                startContent={<span>🎯</span>}
              >
                テーマ管理
              </Button>
              <Button
                as={Link}
                to={`/group/${group.id}/settings`}
                variant="ghost"
                size="sm"
                startContent={<span>⚙️</span>}
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
              startContent={<span>✨</span>}
            >
              ブックマーク追加
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filters */}
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
                  {CATEGORIES.map(category => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
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
                  startContent={<span className="text-slate-500 dark:text-slate-400">🔍</span>}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Bookmarks */}
        <div className="space-y-6">
          {bookmarksData.bookmarks.length === 0 ? (
            <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardBody className="py-16">
                <div className="text-6xl mb-4">📍</div>
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
                  startContent={<span>✨</span>}
                >
                  ブックマークを追加
                </Button>
              </CardBody>
            </Card>
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