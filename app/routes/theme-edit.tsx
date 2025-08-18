import type { Route } from "./+types/theme-edit";
import { useLoaderData, Link, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { themeService } from "../services/theme";
import { getGroup } from "../services/group.server";
import type { Group } from "../entities/group/group";
import type { ThemeWithBookmarkCount } from "../entities/theme/theme";
import { ThemeValidationError, ThemeNotFoundError } from "../entities/theme/theme-errors";
import { formatDate } from "../lib/utils";
import { Button, Card, CardBody, Input, Chip } from "@heroui/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { EmojiPicker } from "../components/emoji-picker";
import { useState } from "react";

interface LoaderData {
  group: Group;
  theme: ThemeWithBookmarkCount;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    name?: string;
    icon?: string;
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId, themeId } = params;
  
  if (!groupId || !themeId) {
    throw new Response("Group ID and Theme ID are required", { status: 400 });
  }

  try {
    const [group, theme] = await Promise.all([
      getGroup(groupId),
      themeService.getThemeById(themeId),
    ]);

    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }

    if (theme.groupId !== groupId) {
      throw new Response("Theme does not belong to this group", { status: 404 });
    }

    return { group, theme };
  } catch (error) {
    console.error("Error loading theme:", error);
    
    if (error instanceof ThemeNotFoundError) {
      throw new Response("Theme not found", { status: 404 });
    }
    
    throw new Response("Failed to load theme", { status: 500 });
  }
};

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId, themeId } = params;
  
  if (!groupId || !themeId) {
    throw new Response("Group ID and Theme ID are required", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    try {
      await themeService.deleteTheme(themeId);
      return redirect(`/group/${groupId}/themes`);
    } catch (error) {
      console.error("Error deleting theme:", error);
      throw new Response("テーマの削除に失敗しました", { status: 500 });
    }
  }

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;

  // バリデーション
  const fieldErrors: ActionData["fieldErrors"] = {};
  
  if (!name || name.trim().length === 0) {
    fieldErrors.name = "テーマ名は必須です";
  } else if (name.trim().length > 50) {
    fieldErrors.name = "テーマ名は50文字以内で入力してください";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await themeService.updateTheme(themeId, {
      name: name.trim(),
      icon: icon?.trim() || undefined,
    });

    return redirect(`/group/${groupId}/themes`);
  } catch (error) {
    console.error("Error updating theme:", error);
    
    if (error instanceof ThemeValidationError) {
      return { error: error.message };
    }
    
    if (error instanceof ThemeNotFoundError) {
      throw new Response("テーマが見つかりません", { status: 404 });
    }
    
    return { error: "テーマの更新に失敗しました" };
  }
};

export default function EditThemePage() {
  const { group, theme } = useLoaderData() as { group: Group; theme: ThemeWithBookmarkCount };
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedEmoji, setSelectedEmoji] = useState(theme.icon || "");

  const handleDelete = () => {
    if (!confirm(`「${theme.name}」を削除しますか？`)) {
      return;
    }

    const form = document.createElement("form");
    form.method = "post";
    form.style.display = "none";
    
    const intentInput = document.createElement("input");
    intentInput.type = "hidden";
    intentInput.name = "intent";
    intentInput.value = "delete";
    
    form.appendChild(intentInput);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              as={Link}
              to={`/group/${group.id}/themes`}
              variant="ghost"
              size="sm"
              className="mb-4"
              startContent={<ArrowLeft size={16} />}
            >
              テーマを編集
            </Button>
            
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
              テーマを編集
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              「{theme.name}」を編集します
            </p>
          </div>

          {/* Form */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardBody className="p-6">
              {actionData?.error && (
                <Card className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 mb-6">
                  <CardBody className="p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                  </CardBody>
                </Card>
              )}

              <Form method="post" className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    name="name"
                    label="テーマ名"
                    variant="bordered"
                    isRequired
                    maxLength={50}
                    defaultValue={theme.name}
                    isInvalid={!!actionData?.fieldErrors?.name}
                    errorMessage={actionData?.fieldErrors?.name}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">
                    アイコン（絵文字、任意）
                  </label>
                  <EmojiPicker
                    value={selectedEmoji}
                    onChange={setSelectedEmoji}
                    placeholder="絵文字を選択してください"
                  />
                  <input type="hidden" name="icon" value={selectedEmoji} />
                  {actionData?.fieldErrors?.icon && (
                    <p className="text-red-500 text-sm">{actionData.fieldErrors.icon}</p>
                  )}
                </div>

                {/* 統計情報 */}
                <Card className="bg-slate-50/50 dark:bg-slate-800/50">
                  <CardBody className="p-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      統計情報
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Chip variant="flat" color="primary" size="sm">
                        {theme.bookmarkCount}件のブックマーク
                      </Chip>
                      <Chip variant="flat" size="sm">
                        作成日: {formatDate(typeof theme.createdAt === 'string' ? theme.createdAt : theme.createdAt.toISOString())}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="flex-1"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "更新中..." : "更新"}
                  </Button>
                  <Button
                    as={Link}
                    to={`/group/${group.id}/themes`}
                    variant="bordered"
                    size="lg"
                  >
                    キャンセル
                  </Button>
                </div>
              </Form>

              {/* Delete Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  危険な操作
                </h3>
                <Button
                  onClick={handleDelete}
                  variant="flat"
                  color="danger"
                  isDisabled={theme.bookmarkCount > 0}
                  title={theme.bookmarkCount > 0 ? "関連するブックマークがあるため削除できません" : "テーマを削除"}
                  startContent={<Trash2 size={16} />}
                >
                  テーマを削除
                </Button>
                {theme.bookmarkCount > 0 && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    関連するブックマークがあるため、このテーマは削除できません
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
    </div>
  );
}