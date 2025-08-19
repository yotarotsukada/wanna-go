# wanna-go 開発ガイド

## 全体を通しての留意点
- ユーザーとの対話においては必ず**日本語**を使用すること
- 一人で悩み過ぎず、`gemini -p <question>`により得られるWeb検索結果および生成AIからの評価を活用すること

## 概要
行きたい場所を家族・恋人と共有するWebアプリ。アカウント不要、URLで簡単共有。

## ディレクトリ構成

```
app/
├── components/           # 共通コンポーネント
│   ├── bookmark-card.tsx
│   └── emoji-picker.tsx
├── entities/            # ドメインエンティティ
│   ├── group/
│   ├── bookmark/
│   └── theme/
├── lib/                 # ユーティリティ・定数
│   ├── constants.ts
│   ├── utils.ts
│   └── db.server.ts
├── routes/              # ページルート
│   ├── home.tsx
│   ├── create.tsx
│   ├── group.tsx
│   ├── add-bookmark.tsx
│   ├── edit-bookmark.tsx
│   ├── themes.tsx
│   ├── theme-create.tsx
│   ├── theme-edit.tsx
│   ├── group-settings.tsx
│   └── api.url-metadata.ts
├── services/            # ビジネスロジック
│   ├── group.server.ts
│   ├── bookmark.server.ts
│   └── theme.ts
└── welcome/             # React Router生成
```

## 開発ルール

### 1. React Router設定

#### loaderとactionの戻り値
- **オブジェクト直接返却**: `return { data }`
- **Response.jsonは使わない**: 型推論が効かなくなる
- **エラー処理**: `throw new Response("error", { status: 400 })`

```typescript
// ✅ 正しい例
export async function loader({ params }: Route.LoaderArgs) {
  const group = await getGroup(params.groupId!);
  return { group, themes }; // オブジェクト直接返却
}

// ❌ 間違った例
export async function loader({ params }: Route.LoaderArgs) {
  const group = await getGroup(params.groupId!);
  return Response.json({ group, themes }); // 型推論が効かない
}
```

#### useLoaderDataの型指定
```typescript
// ✅ 型推論を活用
const { group, themes } = useLoaderData<typeof loader>();
```

#### meta関数でのデータアクセス
```typescript
export function meta({ params, data }: Route.MetaArgs) {
  const group = data?.group; // loaderデータに型安全にアクセス
  return [
    { title: `${group?.name || 'デフォルト'} - wanna-go` }
  ];
}
```

#### APIルート登録
- **重要**: APIルートファイルを作成したら `routes.ts` への登録が必須
- ファイル名: `api.*.ts` → ルートパス: `/api/*`
- パラメータ: `$paramName` → `:paramName`

```typescript
// routes.ts での登録例
route("/api/theme/:themeId/bookmarks", "routes/api.theme.$themeId.bookmarks.ts"),
```

### 2. データベース (SQLite)

#### 主要テーブル
- `groups`: グループ情報
- `bookmarks`: ブックマーク情報
- `themes`: テーマ情報
- `bookmark_themes`: ブックマーク-テーマ関連（多対多）

#### グループID仕様
- 長さ: 8文字
- 文字種: 英数字 (0-9, a-z)
- 例: `xy7k9m2p`

### 3. URL構成

```
/ (ホーム)
├── /create (グループ作成)
├── /group/:groupId (グループメイン)
│   ├── /group/:groupId/add (ブックマーク追加)
│   ├── /group/:groupId/edit/:bookmarkId (ブックマーク編集)
│   ├── /group/:groupId/themes (テーマ管理)
│   │   ├── /group/:groupId/themes/create (テーマ作成)
│   │   └── /group/:groupId/themes/edit/:themeId (テーマ編集)
│   └── /group/:groupId/settings (グループ設定)
└── /api/url-metadata (メタデータ取得API)
```

### 4. コンポーネント設計

#### UIライブラリ
- **HeroUI**: メインUIコンポーネント
- **Lucide React**: アイコン

#### 命名規則
- ファイル名: `kebab-case.tsx`
- コンポーネント名: `PascalCase`
- 関数名: `camelCase`

### 5. 型定義

#### カテゴリ
```typescript
const CATEGORIES = [
  'レストラン',
  '観光地', 
  'ショッピング',
  'アクティビティ',
  'その他'
] as const;
```

#### エンティティ例
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6. サービス層

#### ファイル命名
- `*.server.ts`: サーバーサイド専用
- `*.ts`: クライアント・サーバー共用

#### 関数例
```typescript
// services/group.server.ts
export async function getGroup(id: string): Promise<Group | null>
export async function createGroup(data: CreateGroupData): Promise<Group>
export async function updateGroup(id: string, data: UpdateGroupData): Promise<void>
```

### 7. エラーハンドリング

#### loaderでのエラー
```typescript
if (!group) {
  throw new Response("Group not found", { status: 404 });
}
```

#### actionでのバリデーションエラー
```typescript
if (!name?.trim()) {
  return { error: "名前は必須です" };
}
```

### 8. 開発時の注意点

- **型チェック**: `npm run typecheck` で定期実行
- **未使用import削除**: TypeScript警告に対応
- **loader/action戻り値**: 必ずオブジェクト直接返却
- **Response.json**: APIルート以外では使用禁止
- **meta関数**: `data?.property` でアクセス
- **APIルート**: 作成後は必ず `routes.ts` に登録

## 機能概要

### 主要機能
1. **グループ管理**: 作成・編集・共有
2. **ブックマーク管理**: URL追加・編集・削除・訪問管理
3. **テーマ機能**: ブックマークのカテゴリ化
4. **URLメタデータ取得**: 自動タイトル・説明取得
5. **フィルタ・検索**: カテゴリ・訪問状況・キーワード

### 技術スタック
- **フロントエンド**: React Router v7, HeroUI, Tailwind CSS
- **バックエンド**: React Router (SSR), SQLite
- **デプロイ**: Vercel