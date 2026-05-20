import type { Route } from "./+types/group-settings";
import { useState } from "react";
import { Link, Form, useLoaderData, useActionData, useNavigation } from "react-router";
import { getGroup, updateGroup } from "../services/group.server";
import { getGroupBookmarks } from "../services/bookmark.server";
import { formatDate } from "../lib/utils";
import type { Group } from "../entities/group/group";
import type { BookmarksResponse } from "../services/bookmark";
import { redirect } from "react-router";
import { Button, Input, Textarea } from "@heroui/react";
import { ArrowLeft, Copy, Check, Link as LinkIcon, Share2 } from "lucide-react";
import { AppHeader } from "../components/app-header";
import { ProgressGauge } from "../components/progress-gauge";

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
  const [copiedField, setCopiedField] = useState<"url" | "id" | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/group/${group.id}`
      : `/group/${group.id}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&bgcolor=fbf8ee&color=142840&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = (text: string, field: "url" | "id") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1800);
      })
      .catch(() => alert("コピーに失敗しました"));
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${group.name} - wanna-go`,
          text: "行きたい場所のグループに参加してください",
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy(shareUrl, "url");
    }
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button
            as={Link}
            to={`/group/${group.id}`}
            variant="light"
            size="sm"
            className="-ml-2"
            startContent={<ArrowLeft size={16} />}
          >
            グループに戻る
          </Button>

          <div>
            <h1 className="font-display text-3xl text-deep-sea dark:text-parchment mb-1">
              グループ設定
            </h1>
            <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65">
              {group.name}
            </p>
          </div>

          {/* Sharing */}
          <section className="surface p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-lg text-deep-sea dark:text-parchment leading-none">
                  グループを共有
                </h2>
                <p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mt-1">
                  IDを知っている人なら誰でも参加・編集できます
                </p>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Share2 size={14} />}
                onPress={handleNativeShare}
              >
                共有
              </Button>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-start">
              <div className="space-y-3 order-2 sm:order-1">
                {/* Group ID */}
                <div>
                  <label className="text-eyebrow block mb-1.5">グループID</label>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-lg tracking-wider text-deep-sea dark:text-parchment bg-content2 border border-line rounded-md px-3 py-2 flex-1">
                      {group.id}
                    </code>
                    <Button
                      size="md"
                      variant="bordered"
                      isIconOnly
                      onPress={() => handleCopy(group.id, "id")}
                      aria-label="IDをコピー"
                    >
                      {copiedField === "id" ? <Check size={16} className="text-moss" /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="text-eyebrow block mb-1.5">共有URL</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={shareUrl}
                      variant="bordered"
                      isReadOnly
                      size="md"
                      startContent={<LinkIcon size={14} className="text-deep-sea-ink/40 dark:text-parchment/40" />}
                      classNames={{
                        inputWrapper: "bg-content2",
                        input: "text-sm",
                      }}
                    />
                    <Button
                      size="md"
                      variant="bordered"
                      isIconOnly
                      onPress={() => handleCopy(shareUrl, "url")}
                      aria-label="URLをコピー"
                    >
                      {copiedField === "url" ? <Check size={16} className="text-moss" /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR */}
              <div className="order-1 sm:order-2 flex sm:block justify-center">
                <div className="inline-block bg-content1 border border-line rounded-lg p-2">
                  <img
                    src={qrUrl}
                    alt={`グループ ${group.id} の QRコード`}
                    width={120}
                    height={120}
                    className="block"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <h2 className="font-display text-lg text-deep-sea dark:text-parchment mb-3">
              統計
            </h2>
            <ProgressGauge
              visited={stats.visited_count}
              total={stats.total_count}
              avgPriority={stats.avg_priority}
              label="訪問の進捗"
              className="mb-3"
            />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "総ブックマーク", value: `${stats.total_count}件`, tone: "text-deep-sea dark:text-parchment" },
                { label: "未訪問", value: `${stats.unvisited_count}件`, tone: "text-rust" },
                { label: "作成日", value: formatDate(group.createdAt), tone: "text-deep-sea-ink/80 dark:text-parchment/80 text-base" },
              ].map((item) => (
                <div key={item.label} className="surface p-4">
                  <div className="text-eyebrow mb-1">{item.label}</div>
                  <div className={`font-display text-xl ${item.tone}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Group Info */}
          <section className="surface p-6">
            <h2 className="font-display text-lg text-deep-sea dark:text-parchment mb-4">
              グループ情報
            </h2>
            <Form method="post" className="space-y-4">
              <Input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="グループ名"
                variant="bordered"
                maxLength={100}
                isRequired
                classNames={{ inputWrapper: "bg-content2" }}
              />

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="説明"
                variant="bordered"
                minRows={3}
                maxLength={500}
                classNames={{ inputWrapper: "bg-content2" }}
              />

              {actionData?.error && (
                <div className="px-3 py-2 bg-rust/10 border border-rust/30 rounded-lg">
                  <p className="text-rust text-sm">{actionData.error}</p>
                </div>
              )}

              {actionData?.success && (
                <div className="px-3 py-2 bg-moss/10 border border-moss/30 rounded-lg">
                  <p className="text-moss dark:text-moss-soft text-sm">設定を更新しました</p>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                className="w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "更新中..." : "設定を更新"}
              </Button>
            </Form>
          </section>
        </div>
      </div>
    </>
  );
}
