import type { Route } from "./+types/theme-create";
import { useLoaderData, Link, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { themeService } from "../services/theme";
import { getGroup } from "../services/group.server";
import type { Group } from "../entities/group/group";
import { ThemeValidationError } from "../entities/theme/theme-errors";
import { Button, Card, CardBody, Input } from "@heroui/react";

interface LoaderData {
  group: Group;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    name?: string;
    icon?: string;
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  try {
    const group = await getGroup(groupId);
    if (!group) {
      throw new Response("Group not found", { status: 404 });
    }
    return Response.json({ group });
  } catch (error) {
    console.error("Error loading group:", error);
    throw new Response("Failed to load group", { status: 500 });
  }
};

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    return Response.json({ error: "Group ID is required" }, { status: 400 });
  }

  const formData = await request.formData();
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
    return Response.json({ fieldErrors }, { status: 400 });
  }

  try {
    await themeService.createTheme({
      groupId,
      name: name.trim(),
      icon: icon?.trim() || undefined,
    });

    return redirect(`/group/${groupId}/themes`);
  } catch (error) {
    console.error("Error creating theme:", error);
    
    if (error instanceof ThemeValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    
    return Response.json({ error: "テーマの作成に失敗しました" }, { status: 500 });
  }
};

export default function CreateThemePage() {
  const { group } = useLoaderData() as { group: Group };
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
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
              startContent={<span>←</span>}
            >
              テーマを作成
            </Button>
            
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
              テーマを作成
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              新しいテーマを作成して、ブックマークを整理しましょう
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
                    placeholder="例: 花火を見たい"
                    variant="bordered"
                    isRequired
                    maxLength={50}
                    isInvalid={!!actionData?.fieldErrors?.name}
                    errorMessage={actionData?.fieldErrors?.name}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    name="icon"
                    label="アイコン（絵文字、任意）"
                    placeholder="🎆"
                    variant="bordered"
                    maxLength={10}
                    isInvalid={!!actionData?.fieldErrors?.icon}
                    errorMessage={actionData?.fieldErrors?.icon}
                    description="花火、ハート、料理などの絵文字を入力できます"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="flex-1"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "作成中..." : "作成"}
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
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}