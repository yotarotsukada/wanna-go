import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "wanna-go - 行きたい場所を家族・恋人と共有しよう" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
                wanna-go
              </h1>
              <div className="text-4xl mb-6">🗺️</div>
            </div>
            
            <div className="mb-12 space-y-2">
              <h2 className="text-3xl font-medium text-slate-500 dark:text-slate-400">
                行きたい場所を
              </h2>
              <h2 className="text-3xl font-medium text-slate-900 dark:text-slate-50">
                家族・恋人と共有しよう
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
                アカウント不要でURLを共有するだけ。お気に入りの場所をみんなで集めて、次の冒険を計画しよう
              </p>
            </div>

            {/* Primary CTA */}
            <div className="mb-12">
              <Link
                to="/create"
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="text-lg">✨ 新しいグループを作成</span>
              </Link>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Join group card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title text-xl">既存グループに参加</h3>
                <p className="card-description">
                  グループIDを入力してメンバーに加わりましょう
                </p>
              </div>
              <div className="card-content">
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="例: xy7k9m2p"
                    className="input"
                    maxLength={8}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary w-full"
                  >
                    🚀 参加する
                  </button>
                </form>
              </div>
            </div>

            {/* Features card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title text-xl">主な機能</h3>
                <p className="card-description">
                  シンプルで使いやすい設計
                </p>
              </div>
              <div className="card-content">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <span className="text-slate-900 dark:text-slate-50">アカウント不要</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm">
                      🔗
                    </div>
                    <span className="text-slate-900 dark:text-slate-50">URLで簡単共有</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm">
                      📍
                    </div>
                    <span className="text-slate-900 dark:text-slate-50">地図で場所を確認</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="card">
            <div className="card-header text-center">
              <h3 className="card-title">使い方はとても簡単</h3>
              <p className="card-description">3ステップで始められます</p>
            </div>
            <div className="card-content">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-900/10 dark:bg-slate-50/10 text-slate-900 dark:text-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">グループ作成</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    グループ名を入力して新しいリストを作成
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-900/10 dark:bg-slate-50/10 text-slate-900 dark:text-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">場所を追加</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    行きたい場所のURLを貼り付けて保存
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-900/10 dark:bg-slate-50/10 text-slate-900 dark:text-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">みんなで共有</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    グループURLを家族・友人に送信
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
