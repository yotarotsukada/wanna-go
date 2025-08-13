import type { Route } from "./+types/create";
import { useState, useEffect } from "react";
import { Link, Form, useActionData, useNavigation, redirect } from "react-router";
import { createGroup, checkGroupIdAvailability } from "../services/group.server";
import { generateGroupId } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "新しいグループを作成 - WishMap" },
    { name: "description", content: "新しいグループを作成して家族や恋人と行きたい場所を共有しよう" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const groupId = formData.get("groupId")?.toString();

  if (!name?.trim()) {
    return { error: "グループ名を入力してください" };
  }

  if (!groupId) {
    return { error: "グループIDが必要です" };
  }

  try {
    const isAvailable = await checkGroupIdAvailability(groupId);
    if (!isAvailable) {
      return { error: "このIDは既に使用されています" };
    }

    const group = await createGroup({
      name: name.trim(),
      description: description?.trim() || undefined,
      id: groupId,
    });
    
    return redirect(`/group/${group.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "グループの作成に失敗しました" };
  }
}

export default function Create() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    setGroupId(generateGroupId());
  }, []);

  const regenerateId = () => {
    setGroupId(generateGroupId());
    setIsIdChecked(false);
  };

  const checkId = async () => {
    try {
      const response = await fetch(`/api/check-group-id?groupId=${groupId}`);
      const result = await response.json();
      setIsIdChecked(result.available);
    } catch (err) {
      setIsIdChecked(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      checkId();
    }
  }, [groupId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← WishMap
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              新しいグループを作成
            </h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Form method="post" className="space-y-6">
              <input type="hidden" name="groupId" value={groupId} />
              
              {/* Group Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  グループ名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="我が家の行きたいところ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  required
                />
              </div>

              {/* Group ID */}
              <div>
                <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-2">
                  グループID (自動生成)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="groupId"
                    value={groupId}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={regenerateId}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded-lg transition-colors"
                  >
                    🔄再生成
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ※ このIDでグループを共有します
                </p>
                {isIdChecked && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <span className="mr-1">✅</span>
                    ID重複チェック済み
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明 (任意)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="家族で行きたい場所やりたいことをまとめています"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
              </div>

              {/* Error Message */}
              {actionData?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{actionData.error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isIdChecked}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? "作成中..." : "グループを作成"}
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}