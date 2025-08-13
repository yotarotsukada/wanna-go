import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WishMap - 行きたい場所を家族・恋人と共有しよう" },
    { name: "description", content: "アカウント不要でURLで簡単共有。地図で場所を確認できる行きたい場所管理アプリ" },
  ];
}

export default function Home() {
  const [groupId, setGroupId] = useState("");
  const navigate = useNavigate();

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId.trim()) {
      navigate(`/group/${groupId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WishMap 🗺️
          </h1>
          
          {/* Main message */}
          <div className="mb-12">
            <h2 className="text-2xl text-gray-700 mb-2">
              行きたい場所を
            </h2>
            <h2 className="text-2xl text-gray-700 mb-8">
              家族・恋人と共有しよう
            </h2>
          </div>

          {/* Create group button */}
          <div className="mb-8">
            <Link
              to="/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              新しいグループを作成
            </Link>
          </div>

          {/* Join group form */}
          <div className="bg-white rounded-lg p-6 shadow-md mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              グループIDを入力
            </h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <input
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="例: xy7k9m2p"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={8}
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                参加する
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="text-left bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">特徴:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                アカウント不要
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                URLで簡単共有
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                地図で場所を確認
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
