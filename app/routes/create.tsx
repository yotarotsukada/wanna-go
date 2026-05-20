import type { Route } from "./+types/create";
import { useState } from "react";
import { Link, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { createGroup } from "../services/group.server";
import { Button, Input, Textarea } from "@heroui/react";
import { ArrowLeft, AlertTriangle, ArrowRight } from "lucide-react";
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
        <div className="max-w-xl mx-auto">
          <Button
            as={Link}
            to="/"
            variant="light"
            size="sm"
            className="mb-5 -ml-2"
            startContent={<ArrowLeft size={16} />}
          >
            ホームに戻る
          </Button>

          <div className="mb-7">
            <h1 className="font-display text-3xl text-deep-sea dark:text-parchment mb-2">
              新しいグループを作成
            </h1>
            <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65">
              名前を入力するだけ。作成後、共有用の URL が発行されます。
            </p>
          </div>

          <div className="surface p-6 space-y-5">
            <Form method="post" className="space-y-5">
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="グループ名"
                placeholder="我が家の行きたいところ"
                variant="bordered"
                maxLength={100}
                isRequired
                description={`${name.length}/100`}
                classNames={{
                  inputWrapper: "bg-content2",
                }}
              />

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="説明（任意）"
                placeholder="家族で行きたい場所をまとめます"
                variant="bordered"
                maxLength={500}
                minRows={3}
                description={`${description.length}/500`}
                classNames={{
                  inputWrapper: "bg-content2",
                }}
              />

              {actionData?.error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-rust/10 border border-rust/30 rounded-lg">
                  <AlertTriangle size={16} className="text-rust shrink-0" />
                  <p className="text-rust text-sm">{actionData.error}</p>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={isSubmitting || !name.trim()}
                isLoading={isSubmitting}
                endContent={!isSubmitting ? <ArrowRight size={18} /> : undefined}
              >
                {isSubmitting ? "作成中..." : "グループを作成"}
              </Button>
            </Form>
          </div>

          <p className="text-xs text-deep-sea-ink/50 dark:text-parchment/50 text-center mt-4">
            グループIDは作成時に自動で発行されます
          </p>
        </div>
      </div>
    </>
  );
}
