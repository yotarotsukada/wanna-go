---
name: design-system
description: UI 実装・スタイリング・新規画面 / コンポーネント追加・色やトークンの選択時に使う。wanna-go のデザイン言語（暖色オフホワイト + 深海ネイビーのカラートークン、surface クラス、AppHeader / BookmarkCard / ProgressGauge / StampChip の再利用方針、フォーム 3 カード構成、HeroUI テーマと inputWrapper 規約）を提供する。`surface` / `paper-card` / `parchment` / `deep-sea` / `gold` / `rust` / `moss` / `font-display` / BookmarkCard / ProgressGauge / AppHeader / hero.ts / app.css / スタイリング / カラー / トークン / デザイン のいずれかに触れる作業で発火させる。
---

# wanna-go デザインシステム

`app/app.css` の `@theme` ブロックと `app/lib/hero.ts` を Single Source とする。設計の Why は `docs/architecture/ui-design.md` 参照。

## 1. カラートークン

`app/app.css` の `@theme` で定義。Tailwind の `bg-parchment` / `text-deep-sea` などで参照する。HeroUI のセマンティックカラーは `app/lib/hero.ts` で本パレットにマッピング済みなので、`color="primary"` 等の指定でも自動で同じパレットになる。

| トークン | 値（light） | 役割 |
|---|---|---|
| `parchment` / `parchment-2` / `parchment-3` | `#F4EEDE` / `#EFE7D2` / `#E6DCC4` | ボディ背景・補助面（3 段の暖色オフホワイト） |
| `surface` / `surface-2` / `surface-3` | `#FBF8EE` / `#F7F2E4` / `#EBE2CB` | カード面・カード内入力面（クラス `.surface` / `.surface-inset` 経由で使う） |
| `deep-sea` / `deep-sea-ink` | `#1F3A5F` / `#142840` | 見出し色・本文色・primary |
| `ink-muted` | `#5A6C83` | 補助テキスト・eyebrow ラベル |
| `gold` / `gold-soft` | `#C69544` / `#E0BF85` | 興味度・warning（ダークモードの primary） |
| `rust` / `rust-soft` | `#A4503A` / `#C87355` | 強調・danger / secondary |
| `moss` / `moss-soft` | `#3D5A3D` / `#5B7D5B` | 訪問済み・success |
| `line` / `line-strong` | `rgba(20,40,64,0.1)` / `.18` | 枠線（直接 hex 値で書かず CSS 変数で参照） |
| `night-sea` / `night-sea-2` / `night-paper` / `night-paper-2` | `#0D1F33` 系 | ダークモードの背景・カード面 |

ダークモードは `app/lib/hero.ts` の `themes.dark` で別パレットに切り替わる。新色を足すときは `@theme` と `hero.ts` の両方を同期させる。

## 2. サーフェスクラス

- `.surface` — カードの基本面。`background: var(--color-surface); border: 1px solid var(--color-line); border-radius: 14px; box-shadow: 弱い影`。新規カードは原則これを使う。
- `.surface-inset` — カード内の浅い面。OG プレビューの内枠などに使う。
- `.paper-card` — `.surface` と同じスタイルに揃えた後方互換クラス。新規コードでは `.surface` を使う。
- `.app-header` — sticky + backdrop-blur のヘッダー専用クラス。`AppHeader` コンポーネントが内包しているので直接書くことは少ない。

カード内で「入力フィールドだけ少し沈ませたい」場合は HeroUI の `classNames={{ inputWrapper: "bg-content2" }}` を使う。`bg-white` / `bg-slate-*` は使わない。

## 3. タイポグラフィ

- `font-sans`（Inter + Noto Sans JP）— 本文・ラベル・ボタン。
- `font-display`（DM Serif Display + Noto Serif JP）— ページ見出し・カードタイトル・統計の大きな数値。
- `font-serif-jp`（Noto Serif JP）— ヘルプテキストや「使い方」など、少し書き味を残したい補助文。
- `.text-eyebrow` — `0.6875rem / letter-spacing: 0.18em / uppercase` の小ラベル。セクションの上に置く。

## 4. 再利用コンポーネント（`app/components/`）

| ファイル | 役割 | 注意 |
|---|---|---|
| `app-header.tsx` | sticky の共通ヘッダー。`rightSlot` に右上アクションを差し込む | 全ルート上部に必ず置く |
| `bookmark-card.tsx` | ブックマーク 1 枚。グリッドに敷き詰める想定。左サイドにカテゴリ色帯、主アクションは訪問トグル、補助アクションは Dropdown | 情報優先順位は `docs/architecture/ui-design.md` §4 を守る |
| `progress-gauge.tsx` | 「訪問数 / 達成率」の線形プログレスバー。平均興味度は表示しない | 表示する指標は増やさない |
| `empty-atlas.tsx` | 一覧の空状態。中央寄せのアイコン + 見出し + 説明 + CTA | Suspense fallback ではなく空状態専用 |
| `loading-compass.tsx` | Suspense fallback。Lucide `Loader2` のスピン + 短文 | 装飾を増やさない |
| `stamp-chip.tsx` | テーマ・タグ用のミニチップ。`tone` で色を選ぶ | HeroUI `Chip` は選択肢の Select 内などで併用 |
| `compass-rose.tsx` | コンパスアイコン（SVG）。ヘッダーロゴ等の識別子としてのみ使う | 興味度のスライダ連動には使わない |
| `category-pin.tsx` | カテゴリ別の涙滴ピン SVG。現状は地図画面など限定用途のみ | カード左上の突き出しには使わない |
| `paper-card.tsx` | `.surface` をラップした React コンポーネント。新規では `<div className="surface ...">` 直書きで十分 | 過去互換のために残す |

## 5. フォーム 3 カード構成

ブックマーク登録 / 編集画面（`add-bookmark.tsx` / `edit-bookmark.tsx`）は次の 3 カードに分割する。

1. **URL から取得**（`Globe` アイコン）— URL Input + 取得結果ミニプレビュー（OG 画像 + サイト名）。
2. **場所を選ぶ / 場所**（`MapPin` アイコン）— `LocationSearch` + 選択結果ミニプレビュー（地点名 + 住所 + クリアボタン）。
3. **詳細（を入力）**（`Pencil` アイコン）— タイトル / カテゴリ / 興味度 / テーマ / メモ。

共通ヘッダー様式:

```tsx
<div className="flex items-center gap-2 mb-1">
  <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-... text-...">
    <Icon size={14} />
  </span>
  <h2 className="text-sm font-semibold text-deep-sea dark:text-parchment">見出し</h2>
</div>
<p className="text-xs text-deep-sea-ink/60 dark:text-parchment/60 mb-3">ヘルプ</p>
```

詳細カード内のフィールドはすべて HeroUI の `label` + `labelPlacement="outside"` で記述する。興味度は `Slider` の `label` + `getValue` を使い、自作 `<label>` や数値スパンの併用はしない。

## 6. HeroUI テーマと入力背景

- HeroUI のセマンティックカラー（`primary` / `secondary` / `success` / `warning` / `danger` / `default`）は `app/lib/hero.ts` でパレットにマッピング済み。`<Button color="primary" />` 等で常に同じトーンになる。
- `content1` / `content2` / `content3` / `content4` は本体背景に近い 4 段のサーフェスとして登録済み。フォーム入力の白浮きを防ぐため、`Input` / `Textarea` / `Select` には `classNames={{ inputWrapper: "bg-content2" }}` を付ける（`Select` は `trigger: "bg-content2"`）。
- Modal / Popover の中身は `app/app.css` 末尾の HeroUI overrides で `content1` / `night-paper` に固定済み。追加の対処は不要。

## 7. アニメーション

`app/app.css` で定義済みの 4 種だけを使う。

- `animate-pin-drop` — カード初出。
- `animate-fadeIn` — 軽い fade-in。
- `animate-compass-spin` — コンパス回転（現状未使用。再導入は `LoadingCompass` の置換時のみ）。
- `animate-ink-check` — 訪問チェックの描画。

`prefers-reduced-motion: reduce` で全て無効化される。新規アニメを足す場合も同じ媒介を必ず通す。

## 8. 廃止 / 後退させた要素（再導入禁止）

`docs/architecture/ui-design.md` の各「棄却した選択肢」と整合させること。代表例:

- `paper-card` の `::before` 等高線テクスチャ
- カード左上のカテゴリピン突き出し
- 半円メーターの ProgressGauge
- 平均興味度の表示
- 興味度スライダに連動するコンパス針アニメ
- 招待状カード（透かし + 点線 + 大判 ID の装飾構成）

これらを再導入したい場合は、`ui-design.md` を更新して棄却理由を上書きしてから着手する。

## 参照先

- 設計判断の Why → `docs/architecture/ui-design.md`
- React Router / loader / action の規約 → `coding-standards` Skill
- ドメイン用語・データモデル → `domain-knowledge` Skill
