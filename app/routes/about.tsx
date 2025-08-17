import type { Route } from "./+types/about";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "アプリについて - wanna-go" },
    { name: "description", content: "wanna-goについての詳細情報" },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              ← ホームに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              wanna-goについて
            </h1>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🗺️ wanna-goとは
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                wanna-goは、家族や恋人、友人と「行きたい場所」を簡単に共有・管理できるWebアプリです。
                アカウント登録不要で、URLを共有するだけでグループを作成し、みんなで行きたいスポットを集めることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                ✨ 主な機能
              </h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>グループ共有:</strong> 8桁のIDでグループを作成・参加</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>ブックマーク管理:</strong> URL、カテゴリ、興味度、メモを登録</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>自動情報取得:</strong> URLからタイトルや説明を自動取得</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>訪問管理:</strong> 行った場所をチェックして管理</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>検索・フィルター:</strong> カテゴリや訪問状況で絞り込み</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🎯 こんな時に便利
              </h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>家族での旅行計画や週末のお出かけ先選び</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>カップルでのデートスポット共有</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>友人グループでの遊び場リスト作成</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>チームでのランチや飲み会の店選び</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🔒 プライバシーとセキュリティ
              </h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span>アカウント登録不要でプライバシーを保護</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span>グループIDを知っている人のみアクセス可能</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  <span>個人情報の収集は最小限に留めています</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🚀 使い方
              </h2>
              <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <span>「新しいグループを作成」でグループを作成</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <span>生成されたURLやIDを家族・友人に共有</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                  <span>「ブックマーク追加」で行きたい場所を登録</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                  <span>みんなで場所を選んで、楽しくお出かけ！</span>
                </li>
              </ol>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                💡 ヒント
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• URLを入力すると、自動でタイトルや説明文を取得します</li>
                <li>• 興味度（⭐1-5）で優先度を設定できます</li>
                <li>• 訪問済みにチェックすると、行った記録として残ります</li>
                <li>• グループ設定からURLをコピーして簡単に共有できます</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}