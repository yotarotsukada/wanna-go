# wanna-go 🗺️

行きたい場所を家族・恋人と共有するWebアプリケーション

## 概要

wanna-goは、アカウント登録不要で「行きたい場所」を簡単に共有・管理できるWebアプリです。
8桁のグループIDを共有するだけで、みんなで行きたいスポットを集めることができます。

## 主な機能

- 🚀 **アカウント不要**: 登録なしですぐに使用開始
- 🔗 **簡単共有**: URLまたはグループIDで瞬時に共有
- 📍 **ブックマーク管理**: URL、カテゴリ、興味度、メモを登録
- 🤖 **自動情報取得**: URLからタイトルや説明を自動取得
- ✅ **訪問管理**: 行った場所をチェックして管理
- 🔍 **検索・フィルター**: カテゴリや訪問状況で絞り込み
- 📊 **統計情報**: グループの活動状況を可視化

## 技術スタック

- **フロントエンド**: React 19 + React Router 7 + TypeScript + TailwindCSS
- **バックエンド**: Express.js + Node.js
- **データベース**: SQLite + Prisma ORM
- **その他**: Cheerio (スクレイピング), Helmet (セキュリティ)

## セットアップ

### 前提条件

- Node.js 18+ 
- npm

### インストール

```bash
# 依存関係をインストール
npm install

# サービス層の依存関係をインストール
cd apps/service && npm install && cd ../..

# データベースを初期化
npm run db:migrate
```

### 開発サーバーの起動

#### 方法1: フロントエンドとAPIを同時に起動

```bash
npm run dev:all
```

- フロントエンド: http://localhost:5173
- API: http://localhost:3001

#### 方法2: 個別に起動

```bash
# フロントエンド開発サーバー
npm run dev

# APIサーバー（別ターミナル）
npm run dev:api
```

## プロジェクト構造

```
wanna-go/
├── app/                    # フロントエンド (React Router)
│   ├── routes/            # ページコンポーネント
│   ├── components/        # 共有コンポーネント
│   └── lib/              # ユーティリティ・API層
├── apps/
│   └── service/          # APIサーバー (Express.js)
│       ├── routes/       # APIルート
│       └── utils/        # ユーティリティ関数
├── prisma/               # データベーススキーマ・マイグレーション
└── public/               # 静的ファイル
```

## API エンドポイント

### グループ関連
- `GET /api/groups/:groupId` - グループ情報取得
- `POST /api/groups` - グループ作成
- `PUT /api/groups/:groupId` - グループ更新
- `GET /api/groups/check/:groupId` - ID重複チェック

### ブックマーク関連
- `GET /api/groups/:groupId/bookmarks` - ブックマーク一覧
- `POST /api/groups/:groupId/bookmarks` - ブックマーク作成
- `GET /api/bookmarks/:bookmarkId` - ブックマーク詳細
- `PUT /api/bookmarks/:bookmarkId` - ブックマーク更新
- `DELETE /api/bookmarks/:bookmarkId` - ブックマーク削除

### その他
- `POST /api/url-metadata` - URLメタデータ取得

## データベース操作

```bash
# マイグレーション実行
npm run db:migrate

# Prisma Clientの生成
npm run db:generate

# データベース管理画面
npm run db:studio
```

## 本番環境構築

```bash
# 本番用ビルド
npm run build

# 本番サーバー起動
npm start
```

## 環境変数

```bash
# .env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3001
```

## カテゴリ

以下のカテゴリが利用可能です：
- レストラン
- 観光地
- ショッピング
- アクティビティ
- その他

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

Built with ❤️ using React Router + Prisma
