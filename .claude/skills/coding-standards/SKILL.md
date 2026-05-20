---
name: coding-standards
description: app/配下のコード実装・レビュー・リファクタ時に使う。wanna-goのReact Router v7規約とコーディング規約を提供する。loader/actionのオブジェクト直接返却（Response.json禁止）、useLoaderDataの型推論、meta関数のdata?.アクセス、APIルート登録（routes.tsへの追加必須）、kebab-case/PascalCase/camelCaseの命名規則、*.server.tsの命名分離、HeroUI + Lucide Reactの採用、loaderのthrow Response / actionのreturn errorによるエラーハンドリング。
---

# wanna-go コーディング規約

## React Router v7（loader / action / meta）

### loader と action の戻り値
- **オブジェクトを直接返す**（型推論を効かせるため）。
- `Response.json(...)` は **使わない**。型推論が消える。
- 例外的に APIルート（`routes/api.*.ts`）で生レスポンスを返したい場合のみ `Response` を使ってよい。
- バリデーション失敗等の **想定エラーは return**：`return { error: "メッセージ" }`
- 想定外・404 等は **throw Response**：`throw new Response("Not found", { status: 404 })`

### useLoaderData の型
- `useLoaderData<typeof loader>()` を使い、型推論で受ける。手書きの型注釈は不要。

### meta 関数
- `meta({ data })` で `data?.property` 経由で loader の戻り値にアクセスする。
- `data` が undefined の可能性を前提に optional chaining を使う。

### APIルートの登録
- ファイルを `app/routes/api.*.ts` に作っただけでは公開されない。`app/routes.ts` に **必ず `route("/api/...", "routes/api.*.ts")` を追加** する。
- ファイル名の `$paramName` は URL では `:paramName` に変換する。

## サービス層
- `*.server.ts` — サーバーサイド専用。`db.server.ts` などのサーバー専用モジュールを import する。
- `*.ts` — クライアント / サーバー共用（純粋ロジックや型定義）。
- サービス層は `app/services/` 配下と、ドメインに紐づくものは `app/entities/<domain>/` 配下に置く。

## 命名規則
- ファイル名: `kebab-case.tsx` / `kebab-case.ts`
- React コンポーネント名: `PascalCase`
- 関数 / 変数名: `camelCase`
- 定数: `UPPER_SNAKE_CASE`（`app/lib/constants.ts` 参照）

## UI
- メイン UI コンポーネントは **HeroUI**（`@heroui/react`）。独自に類似コンポーネントを再実装しない。
- アイコンは **Lucide React**。
- スタイリングは Tailwind CSS。

## エラーハンドリング方針
- **loader**：データが存在しないなど続行不能なら `throw new Response(...)`。
- **action**：ユーザー入力起因のバリデーションエラーは `return { error }` で UI に戻す。
- 想定外例外は握りつぶさず Route 境界（Error Boundary）まで伝播させる。

## 開発時チェック
- `npm run typecheck` を要所で回す（`react-router typegen && tsc`）。
- 未使用 import / 未使用変数の警告は放置せず削除する。

## 参照先
- ドメイン用語・データモデルの規約は `domain-knowledge` Skill。
- 仕様（ユースケース・データモデル詳細）は `docs/spec/`。
- アーキテクチャの背景は `docs/architecture/overview.md`。
