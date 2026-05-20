# docs/

過去の決定とコードに表せない不変条件を置く。実行コマンド・運用手順は `README.md`、規約とドメイン索引は `.claude/skills/` を参照。

## 構成

- `spec/` — プロダクト仕様
  - `use-cases.md` — 提供ユースケース一覧
  - `data-model.md` — エンティティ関連・ID 設計・不変条件
- `architecture/` — 横断的な技術決定
  - `overview.md` — フレームワーク・DB・UI・認証モデル・メタデータ取得方針の「決定 / 背景 / 棄却した選択肢」

## 書く / 書かないの境界

- 書く: 過去の決定、コードに表せない不変条件、複数モジュールに跨る前提。
- 書かない: 実行コマンド（→ `README.md`）、ドメイン用語の単純定義（→ `domain-knowledge` Skill）、規約（→ `coding-standards` Skill）、バージョン番号や依存一覧（→ `package.json`）。
