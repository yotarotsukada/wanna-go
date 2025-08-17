import type { Route } from "./+types/create";
import { useState } from "react";
import { Link, Form, useActionData, useNavigation } from "react-router";
import { redirect } from "react-router";
import { createGroup } from "../services/group.server";

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
    // groupIDは自動生成される
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="btn btn-ghost btn-sm mb-6 hover:translate-x-1 transition-transform"
            >
              ← wanna-goに戻る
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
                新しいグループを作成
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                みんなで共有する行きたい場所リストを始めましょう
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="card">
            <div className="card-content space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 text-xl mt-0.5">💡</div>
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      自動でグループIDを生成
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      作成後に表示されるURLを家族や友人に共有して、一緒に行きたい場所を管理できます
                    </p>
                  </div>
                </div>
              </div>
              
              <Form method="post" className="space-y-6">
                {/* Group Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-slate-50">
                    グループ名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="我が家の行きたいところ"
                    className="input text-base"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    最大100文字まで入力できます ({name.length}/100)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-900 dark:text-slate-50">
                    説明 <span className="text-slate-500 dark:text-slate-400 text-xs">(任意)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="家族で行きたい場所ややりたいことをまとめています"
                    rows={4}
                    className="textarea"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    グループの目的や説明を追加できます ({description.length}/500)
                  </p>
                </div>

                {/* Error Message */}
                {actionData?.error && (
                  <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                      <p className="text-red-700 dark:text-red-300 font-medium">{actionData.error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="btn btn-primary w-full btn-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      作成中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✨ グループを作成する
                    </span>
                  )}
                </button>
              </Form>
            </div>
          </div>

          {/* Preview Card */}
          {name.trim() && (
            <div className="card mt-6 animate-fadeIn">
              <div className="card-header">
                <h3 className="card-title text-lg">プレビュー</h3>
                <p className="card-description">作成されるグループの見た目</p>
              </div>
              <div className="card-content">
                <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-100/20 dark:bg-slate-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-xl mb-2">{name}</h4>
                  {description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      グループID: xxxxxxxx (自動生成)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}