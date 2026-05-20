# データモデル仕様

スキーマの確定形は `prisma/schema.prisma` を Single Source とし、この文書はそこに表現できない決定と暗黙の不変条件のみを置く。

## エンティティ概要

```
Group 1 ─── * Bookmark * ─── * Theme
                  └─ BookmarkTheme（結合表）
Group 1 ─── * Theme
```

- `Group` がトップレベル集約。`Bookmark` と `Theme` は `Group` に属する。
- `Bookmark` と `Theme` は `BookmarkTheme` を介した多対多。
- `Group` 削除時、配下の `Bookmark` / `Theme`、および結合表は `onDelete: Cascade` で連鎖削除する。

## グループ ID の決定

- 長さ: 8 文字
- 文字種: 英数字（`0-9`, `a-z`）
- 推測困難性は **8 文字 36 進** の探索難度に依存する。アカウントレスで権限分離を持たない前提が成立するのは、この ID が URL 経由でしか流通しないこと（検索可能な公開導線を持たないこと）が条件。

棄却した選択肢:
- **UUID v4** — URL が長くなり、人が口頭・チャットで共有しにくい。
- **連番** — 推測攻撃が容易。

## ブックマークが持つ「自動取得」フィールド

`Bookmark` には、URL 登録時にスクレイピングで自動取得した値を保存するカラム群がある（`autoTitle` / `autoDescription` / `autoImageUrl` / `autoSiteName`）。

- ユーザーが手入力する `title` とは分離する。これによりサイト側の OG タグ変更があっても、ユーザーが付けたタイトルが上書きされない。
- 取得失敗時はカラムが null のままで、UI 側は `auto*` のフォールバックを段階的に行う。

## 訪問状態

- `visited: Boolean`（既定 `false`）と `visitedAt: DateTime?` の 2 列を持つ。
- `visited = true` に切り替えた瞬間に `visitedAt` を設定する想定。両者の整合は呼び出し側の責務。

## インデックス方針

頻出フィルタである `groupId` / `category` / `visited` / `priority` / `createdAt` / `url` / `placeId` に対して、`Bookmark` 上に個別インデックスを張る（`prisma/schema.prisma` 参照）。
- `groupId`: グループ単位の取得が常時。
- `url` / `placeId`: 重複登録の検出に使う。
- `priority` / `createdAt`: 一覧の並び替え用。
