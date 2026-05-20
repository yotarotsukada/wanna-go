import type { Route } from "./+types/create";
import { useState } from "react";
import { Link, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { createGroup } from "../services/group.server";
import { Button, Input, Textarea } from "@heroui/react";
import { ArrowLeft, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import { AppHeader } from "../components/app-header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "新しいグループを作成 - wanna-go" },
    { name: "description", content: "新しいグループを作成して家族や恋人と行きたい場所を共有しよう" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();

  if (!name?.trim()) {
    return { error: "グループ名を入力してください" };
  }

  try {
    const group = await createGroup({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return redirect(`/group/${group.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "グループの作成に失敗しました" };
  }
}

export default function Create() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              as={Link}
              to="/"
              variant="ghost"
              size="sm"
              className="mb-6 hover:translate-x-[-2px] transition-transform"
              startContent={<ArrowLeft size={16} />}
            >
              ホームに戻る
            </Button>
            <div className="text-center mb-6">
              <h1 className="font-display text-4xl text-deep-sea dark:text-parchment mb-3">
                新しいグループを作成
              </h1>
              <p className="text-deep-sea-ink/70 dark:text-parchment/70 font-serif-jp">
                みんなで共有する行きたい場所リストを始めましょう
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="paper-card p-6 space-y-6">
            {/* Info Banner */}
            <div className="flex items-start gap-3 px-4 py-3 bg-gold/12 dark:bg-gold/8 border border-gold/40 rounded-md">
              <Lightbulb size={20} className="text-gold-soft dark:text-gold-soft flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-deep-sea-ink dark:text-parchment mb-0.5 font-serif-jp">
                  自動でグループIDを生成
                </h3>
                <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70">
                  作成後に表示されるURLを家族や友人に共有して、一緒に行きたい場所を管理できます
                </p>
              </div>
            </div>

            <Form method="post" className="space-y-6">
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="グループ名"
                placeholder="我が家の行きたいところ"
                variant="bordered"
                maxLength={100}
                isRequired
                classNames={{
                  label: "text-sm font-medium font-serif-jp",
                  input: "text-base",
                  inputWrapper: "bg-parchment dark:bg-night-sea-2",
                }}
                description={`最大100文字まで入力できます (${name.length}/100)`}
              />

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="説明"
                placeholder="家族で行きたい場所ややりたいことをまとめています"
                variant="bordered"
                maxLength={500}
                minRows={4}
                classNames={{
                  label: "text-sm font-medium font-serif-jp",
                  inputWrapper: "bg-parchment dark:bg-night-sea-2",
                }}
                description={`グループの目的や説明を追加できます (${description.length}/500)`}
              />

              {actionData?.error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rust/10 border border-rust/40 rounded-md">
                  <AlertTriangle size={18} className="text-rust" />
                  <p className="text-rust font-medium text-sm">{actionData.error}</p>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full shadow-paper hover:shadow-paper-hover transition-all duration-300"
                isDisabled={isSubmitting || !name.trim()}
                isLoading={isSubmitting}
                startContent={!isSubmitting ? <Sparkles size={18} /> : undefined}
              >
                {isSubmitting ? "作成中..." : "グループを作成する"}
              </Button>
            </Form>
          </div>

          {/* Preview Card */}
          {name.trim() && (
            <div className="mt-6 paper-card p-5 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg text-deep-sea dark:text-parchment">
                  プレビュー
                </h3>
                <span className="text-xs uppercase tracking-[0.18em] text-deep-sea-ink/55 dark:text-parchment/55 font-serif-jp">
                  作成されるグループ
                </span>
              </div>
              <div className="border border-dashed border-deep-sea/30 dark:border-parchment/30 rounded-lg p-5 bg-parchment dark:bg-night-sea-2">
                <h4 className="font-display text-2xl text-deep-sea dark:text-parchment mb-2">
                  {name}
                </h4>
                {description && (
                  <p className="text-sm text-deep-sea-ink/75 dark:text-parchment/75 leading-relaxed mb-3">
                    {description}
                  </p>
                )}
                <div className="text-xs font-serif-jp text-deep-sea-ink/60 dark:text-parchment/60">
                  グループID: <span className="font-mono tracking-wider">xxxxxxxx</span>（自動生成）
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
