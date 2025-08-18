import type { Route } from "./+types/themes";
import { useLoaderData, Link, useNavigate } from "react-router";
import { redirect } from "react-router";
import { themeService } from "../services/theme";
import { getGroup } from "../services/group.server";
import type { ThemeWithBookmarkCount } from "../entities/theme/theme";
import type { Group } from "../entities/group/group";
import { formatDate } from "../lib/utils";
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { ArrowLeft, Sparkles, Edit, Trash2 } from "lucide-react";

interface LoaderData {
  group: Group;
  themes: ThemeWithBookmarkCount[];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  try {
    const [group, themes] = await Promise.all([
      getGroup(groupId),
      themeService.getThemesByGroupId(groupId),
    ]);

    return { group, themes };
  } catch (error) {
    console.error("Error loading themes:", error);
    throw new Response("Failed to load themes", { status: 500 });
  }
};

export async function action({ request, params }: Route.ActionArgs) {
  const { groupId } = params;
  
  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const themeId = formData.get("themeId") as string;

    if (!themeId) {
      return { error: "Theme ID is required" };
    }

    try {
      await themeService.deleteTheme(themeId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting theme:", error);
      return { error: "Failed to delete theme" };
    }
  }

  throw new Response("Method not allowed", { status: 405 });
};

export default function ThemesPage() {
  const { group, themes } = useLoaderData() as { group: Group; themes: ThemeWithBookmarkCount[] };
  const navigate = useNavigate();

  const handleDelete = async (themeId: string, themeName: string) => {
    if (!confirm(`「${themeName}」を削除しますか？`)) {
      return;
    }

    const formData = new FormData();
    formData.append("themeId", themeId);

    try {
      const response = await fetch(`/group/${group.id}/themes`, {
        method: "DELETE",
        body: formData,
      });

      if (response.ok) {
        // ページをリロードして最新の状態を取得
        window.location.reload();
      } else {
        alert("テーマの削除に失敗しました");
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
      alert("テーマの削除に失敗しました");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
              テーマ管理
            </Button>
            
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
              テーマ管理
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
              「{group.name}」のテーマを管理します
            </p>

            <Button
              as={Link}
              to={`/group/${group.id}/themes/create`}
              color="primary"
              className="shadow-md hover:shadow-lg transition-all duration-200"
              startContent={<Sparkles size={20} />}
            >
              新しいテーマを作成
            </Button>
          </div>

          {/* Themes List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              テーマ一覧
            </h2>

            {themes.length === 0 ? (
              <Card className="text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardBody className="py-16">
                  <h3 className="text-xl font-semibold mb-2">
                    テーマがありません
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    最初のテーマを作成して、ブックマークを整理しましょう
                  </p>
                  <Button
                    as={Link}
                    to={`/group/${group.id}/themes/create`}
                    color="primary"
                    startContent={<Sparkles size={20} />}
                  >
                    テーマを作成
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-4">
                {themes.map((theme) => (
                  <Card key={theme.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {theme.icon && (
                              <span className="text-2xl">{theme.icon}</span>
                            )}
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                              {theme.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Chip 
                              variant="flat" 
                              color="primary"
                              size="sm"
                            >
                              {theme.bookmarkCount}件のブックマーク
                            </Chip>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              作成日: {formatDate(typeof theme.createdAt === 'string' ? theme.createdAt : theme.createdAt.toISOString())}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            as={Link}
                            to={`/group/${group.id}/themes/edit/${theme.id}`}
                            variant="flat"
                            size="sm"
                            startContent={<Edit size={16} />}
                          >
                            編集
                          </Button>
                          <Button
                            onPress={() => handleDelete(theme.id, theme.name)}
                            variant="flat"
                            color="danger"
                            size="sm"
                            isDisabled={theme.bookmarkCount > 0}
                            title={theme.bookmarkCount > 0 ? "関連するブックマークがあるため削除できません" : "テーマを削除"}
                            startContent={<Trash2 size={16} />}
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}