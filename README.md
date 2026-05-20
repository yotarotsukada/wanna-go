# wanna-go

行きたい場所を家族・恋人と共有する Web アプリ。アカウント登録不要、8 文字のグループ ID または URL で共有できる。

## ドキュメント構成の考え方

コードが唯一の状態情報源。コードで表現できることはコードに書く。

それ以外の情報は層で分ける：

- **`docs/`** — コードに表せない「過去の決定・背景・不変条件」を置く。なぜその設計にしたか、なぜその選択肢を棄却したか、コードを読んでも分からないことだけ書く。
- **`.claude/skills/`** — エージェントが作業前に知るべき規約とドメイン知識を置く。コーディング規約、ドメイン用語、参照先マップ。
- **`README.md`（本ファイル）** — 環境を立ち上げて動かすための運用ガイド。設計判断の Why は書かない。

## 前提条件

- Node.js 20+
- npm

## セットアップ

```bash
npm install
npm run db:migrate
```

`postinstall` で `prisma generate` が自動実行される。

## 開発

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く。React Router v7 の SSR モードで起動し、API ルート (`/api/...`) も同じプロセスから配信される（別 API サーバーは不要）。

## 型チェック

```bash
npm run typecheck
```

`react-router typegen` でルート型を再生成してから `tsc` を走らせる。

## データベース操作

```bash
npm run db:migrate    # マイグレーション作成・適用
npm run db:generate   # Prisma Client 再生成
npm run db:studio     # Prisma Studio で中身を見る
```

スキーマ定義は `prisma/schema.prisma`、データモデルの設計意図は `docs/spec/data-model.md` を参照。

## ビルドと本番起動

```bash
npm run build
npm start
```

`npm start` は `react-router-serve` で `build/server/index.js` を配信する。Dockerfile も同梱しているのでコンテナ運用も可能。

## 環境変数

| 変数 | 用途 | 例 |
|------|------|----|
| `DATABASE_URL` | Prisma が使う接続文字列 | `file:./dev.db` |
| `NODE_ENV` | 実行モード | `development` / `production` |

その他、libSQL ドライバ経由でリモート SQLite に接続する場合は、デプロイ先（Vercel など）の環境変数で別途指定する。

## ライセンス

MIT
