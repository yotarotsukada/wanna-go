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
import { ArrowLeft } from "lucide-react";

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

    return { group, stats: bookmarksData.stats };
  } catch (error) {
    console.error("Error loading group data:", error);
    throw new Response("Failed to load group data", { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  const formData = await request.formData();

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();

  if (!name?.trim()) {
    return { error: "グループ名は必須です" };
  }

  try {
    await updateGroup(groupId, {
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "更新に失敗しました" };
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
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              as={Link}
              to={`/group/${group.id}`}
              variant="ghost"
              size="sm"
              className="mb-4"
              startContent={<ArrowLeft size={16} />}
            >
              グループ設定
            </Button>
          </div>

          {/* Group Info */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                グループ情報
              </h2>
            </CardHeader>
            <CardBody className="pt-0">
            <Form method="post" className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  label="グループ名"
                  placeholder="我が家の行きたいところ"
                  variant="bordered"
                  maxLength={100}
                  isRequired
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  label="説明"
                  placeholder="家族で行きたい場所ややりたいことをまとめています"
                  variant="bordered"
                  minRows={3}
                  maxLength={500}
                />
              </div>

              {/* Messages */}
              {actionData?.error && (
                <Card className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                  <CardBody className="p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                  </CardBody>
                </Card>
              )}

              {actionData?.success && (
                <Card className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                  <CardBody className="p-3">
                    <p className="text-green-600 dark:text-green-400 text-sm">設定を更新しました</p>
                  </CardBody>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "更新中..." : "設定を更新"}
              </Button>
            </Form>
            </CardBody>
          </Card>

          {/* Sharing */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                共有
              </h2>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  value={typeof window !== 'undefined' ? `${window.location.origin}/group/${group.id}` : `/group/${group.id}`}
                  label="グループURL"
                  variant="bordered"
                  isReadOnly
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    onPress={copyUrl}
                    color="primary"
                    variant="flat"
                    size="sm"
                  >
                    URLをコピー
                  </Button>
                  <Button
                    onPress={showQRCode}
                    color="success"
                    variant="flat"
                    size="sm"
                  >
                    QRコード表示
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Statistics */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                統計情報
              </h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Chip color="default" variant="flat" size="sm">
                    総ブックマーク数: {stats.total_count}件
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Chip color="success" variant="flat" size="sm">
                    訪問済み: {stats.visited_count}件
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Chip color="warning" variant="flat" size="sm">
                    未訪問: {stats.unvisited_count}件
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    平均興味度: {stats.avg_priority.toFixed(1)}/5
                  </Chip>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Chip color="secondary" variant="flat" size="sm">
                    作成日: {formatDate(group.createdAt)}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
    </div>
  );
}