# wanna-go

行きたい場所を家族・恋人と共有するWebアプリ。アカウント不要、URLで簡単共有。

## 言語ポリシー
- ユーザーとの対話・コミット・PR・コメントはすべて **日本語** で行う。

## エージェントの動き方
- 作業に入る前に `.claude/skills/` の各 Skill description を確認し、該当するものを発火させる。規約・ドメイン知識・データモデルは Skill 本文と `docs/` に集約してある。
- 一人で悩み過ぎず、`gemini -p <question>` による Web 検索および生成 AI からの評価を活用する。

## ディレクトリ役割
- `app/` — React Router v7 アプリ本体（`routes/` / `services/` / `entities/` / `components/` / `lib/`）
- `prisma/` — SQLite + Prisma のスキーマとマイグレーション
- `docs/` — 仕様・アーキテクチャ決定。コードに表せない不変条件と過去の決定を置く
- `.claude/skills/` — エージェント向けの規約・ドメイン知識索引

## 振る舞いの制約
- 破壊的な git 操作（`push --force`、`reset --hard`、ブランチ削除など）はユーザーの明示的指示なしに行わない。
- `--no-verify` 等でフックを迂回しない。失敗した場合は原因を直す。
- `loader` / `action` の戻り値や React Router の規約に触れる前に `coding-standards` Skill を必ず参照する。
