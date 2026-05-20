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
import { ArrowLeft, Copy, QrCode, Link as LinkIcon } from "lucide-react";
import { AppHeader } from "../components/app-header";
import { CompassRose } from "../components/compass-rose";
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

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/group/${group.id}`
      : `/group/${group.id}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(shareUrl)}`;

  const copyUrl = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => alert("URLをコピーしました"))
      .catch(() => alert("URLのコピーに失敗しました"));
  };

  const copyGroupId = () => {
    navigator.clipboard
      .writeText(group.id)
      .then(() => alert("グループIDをコピーしました"))
      .catch(() => alert("コピーに失敗しました"));
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back link */}
          <Button
            as={Link}
            to={`/group/${group.id}`}
            variant="ghost"
            size="sm"
            className="hover:translate-x-[-2px] transition-transform"
            startContent={<ArrowLeft size={16} />}
          >
            グループに戻る
          </Button>

          <div>
            <h1 className="font-display text-3xl text-deep-sea dark:text-parchment mb-2">
              グループ設定
            </h1>
            <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 font-serif-jp">
              共有・統計・基本情報を確認できます
            </p>
          </div>

          {/* Sharing card (Vintage paper) */}
          <section
            aria-labelledby="share-heading"
            className="paper-card p-7 relative overflow-hidden"
          >
            {/* 透かしコンパス */}
            <div
              className="absolute -top-4 -left-4 opacity-25 pointer-events-none"
              aria-hidden="true"
            >
              <CompassRose size={100} tone="deep-sea" />
            </div>
            {/* 上下点線 */}
            <div
              className="absolute top-3 left-6 right-6 border-t border-dashed border-deep-sea/30 dark:border-parchment/30"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-3 left-6 right-6 border-t border-dashed border-deep-sea/30 dark:border-parchment/30"
              aria-hidden="true"
            />

            <div className="relative pt-3 pb-3">
              <p
                id="share-heading"
                className="text-center text-xs uppercase tracking-[0.3em] text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp mb-2"
              >
                共有
              </p>
              <h2 className="text-center font-display text-xl text-deep-sea dark:text-parchment mb-4">
                グループID
              </h2>

              <div className="text-center mb-5">
                <div className="font-display text-4xl tracking-[0.18em] text-deep-sea dark:text-parchment font-mono">
                  {group.id}
                </div>
                <button
                  type="button"
                  onClick={copyGroupId}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-deep-sea-ink/60 dark:text-parchment/60 hover:text-deep-sea dark:hover:text-parchment transition-colors"
                >
                  <Copy size={12} /> IDをコピー
                </button>
              </div>

              <div className="flex justify-center mb-5">
                <div className="bg-parchment p-3 rounded-md border border-deep-sea/20">
                  <img
                    src={qrUrl}
                    alt={`グループ ${group.id} の QRコード`}
                    width={180}
                    height={180}
                    className="block"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  type="text"
                  value={shareUrl}
                  label="グループURL"
                  variant="bordered"
                  isReadOnly
                  startContent={
                    <LinkIcon size={16} className="text-deep-sea-ink/50 dark:text-parchment/50" />
                  }
                  classNames={{
                    inputWrapper: "bg-parchment dark:bg-night-sea-2",
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onPress={copyUrl}
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="flex-1"
                    startContent={<Copy size={14} />}
                  >
                    URLをコピー
                  </Button>
                  <Button
                    onPress={() => window.open(qrUrl, "_blank")}
                    color="default"
                    variant="flat"
                    size="sm"
                    className="flex-1"
                    startContent={<QrCode size={14} />}
                  >
                    QRを別タブで開く
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Group Info */}
          <section
            aria-labelledby="info-heading"
            className="paper-card p-6"
          >
            <h2
              id="info-heading"
              className="font-display text-xl text-deep-sea dark:text-parchment mb-4"
            >
              グループ情報
            </h2>
            <Form method="post" className="space-y-5">
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
                classNames={{
                  label: "font-serif-jp",
                  inputWrapper: "bg-parchment dark:bg-night-sea-2",
                }}
              />

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="説明"
                placeholder="家族で行きたい場所ややりたいことをまとめています"
                variant="bordered"
                minRows={3}
                maxLength={500}
                classNames={{
                  label: "font-serif-jp",
                  inputWrapper: "bg-parchment dark:bg-night-sea-2",
                }}
              />

              {actionData?.error && (
                <div className="px-4 py-3 bg-rust/10 border border-rust/40 rounded-md">
                  <p className="text-rust text-sm">{actionData.error}</p>
                </div>
              )}

              {actionData?.success && (
                <div className="px-4 py-3 bg-moss/10 border border-moss/40 rounded-md">
                  <p className="text-moss dark:text-moss-soft text-sm">設定を更新しました</p>
                </div>
              )}

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
          </section>

          {/* Statistics */}
          <section
            aria-labelledby="stats-heading"
            className="space-y-4"
          >
            <h2
              id="stats-heading"
              className="font-display text-xl text-deep-sea dark:text-parchment"
            >
              統計情報
            </h2>
            <ProgressGauge
              visited={stats.visited_count}
              total={stats.total_count}
              label="訪問済み"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="paper-card p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp mb-1">
                  総ブックマーク
                </div>
                <div className="font-display text-2xl text-deep-sea dark:text-parchment">
                  {stats.total_count}件
                </div>
              </div>
              <div className="paper-card p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp mb-1">
                  平均興味度
                </div>
                <div className="font-display text-2xl text-gold-soft">
                  {stats.avg_priority.toFixed(1)}
                  <span className="text-base text-deep-sea-ink/55 dark:text-parchment/55"> / 5</span>
                </div>
              </div>
              <div className="paper-card p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp mb-1">
                  未訪問
                </div>
                <div className="font-display text-2xl text-rust">
                  {stats.unvisited_count}件
                </div>
              </div>
              <div className="paper-card p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/60 dark:text-parchment/60 font-serif-jp mb-1">
                  作成日
                </div>
                <div className="font-display text-lg text-deep-sea dark:text-parchment">
                  {formatDate(group.createdAt)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
