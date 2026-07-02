# 引き継ぎメモ(→ Sonnet)

前工程(Fable)で Phase 1 の骨格を実装済み。仕様の唯一の情報源は `hjjjsn-site-requirements.md`。判断に迷ったら §2 ブランド定義に立ち返ること(静か・誇張しない・「!」と絵文字は使わない)。

## 現状:完了していること

- **Astro 7 + TypeScript** プロジェクト一式。`npm run build` が通り、全6ページ + `/rss.xml` が静的生成される(`npm run dev` / `npm run preview` も可)
- デザイントークン(`src/styles/tokens.css`)と共通スタイル(`src/styles/global.css`)。§3.2 の5色をCSS変数で定義済み
- コンテンツモデル(`src/content.config.ts`):works / words の zod スキーマ。**mdファイルを `src/content/works/` または `words/` に置くだけでページ・一覧・RSSに反映される**(受け入れ条件の核。確認済み)
- サンプルコンテンツ:works 3件、words 3件(URL・埋め込みIDはすべてダミー)
- コンポーネント:
  - `EmbedFacade.astro` — クリックまで iframe を読み込まないファサード。YouTube は nocookie ドメイン、--haze オーバーレイがホバーで晴れる。noscript 時は外部リンクを表示
  - `WorkCard.astro` / `WordRow.astro` / `DiscordCta.astro`
- 「析出」モーション(§3.4):`.settle`(スクロール出現、IntersectionObserver)と `.settle-hero`(初回表示)。blur(8px)→0 / 600ms ease-out。`prefers-reduced-motion` と JS無効(`html.no-js`)では即時表示
- `--precipitate` の使用箇所は Discord CTA と nav の現在地表示(`aria-current="page"`)のみ — 受け入れ条件どおり
- OGP/Twitterカード全ページ設定済み。`public/og-default.png` は --base 単色のプレースホルダ

## 残タスク(優先順)

1. **実データへの差し替え** — grep で `TODO` と `XXXXXXXX` を検索。対象:
   - `src/config.ts`:Discord 招待リンク、SNS 6リンク(ユーザーに確認が必要)
   - サンプル md の embedId / links / 本文
   - `src/pages/about.astro` の連絡先
   - `astro.config.mjs` の `site`(独自ドメイン取得後)
2. **モバイル(375px)での全ページ目視確認**(受け入れ条件)。特にトップのヒーロー(縦書き併置の grid)と works グリッド
3. **Lighthouse(モバイル)Performance 95+ / Accessibility 95+ の計測**。Google Fonts のブロッキングが引っかかる場合はサブセット化 or `fontsource` セルフホストへ切り替え
4. **Cloudflare Pages デプロイ**:git init → GitHub リポジトリ作成 → Pages 接続(ビルドコマンド `npm run build`、出力 `dist`)。まだ git init していない
5. **OG画像の改善**(Phase 2 だが余裕があれば):satori でタイトル入り自動生成。現状は単色プレースホルダ
6. niconico のファサードはサムネイル無し(タイトル表示のみ)。niconico のサムネイルAPI(`https://ext.nicovideo.jp/api/getthumbinfo/{id}`)はビルド時取得が必要なので、やるなら Astro のビルド時 fetch で

## 実装上の注意(仕様書に無い決定事項)

- Astro 7 の Content Layer API を使用。コレクション定義は `src/content/config.ts` ではなく **`src/content.config.ts`**(ルート直下)にある。作品詳細の slug は `work.id`(ファイル名から拡張子を除いたもの)
- CSS はプレーンCSS(Tailwind不使用)。スタイルは各 `.astro` の scoped `<style>` + global.css の2層
- 縦書き(`writing-mode: vertical-rl`)はトップのヒーロー右端の一箇所のみ。増やさない(§3.3)
- モーションは「析出」1種のみ。新しいアニメーションを追加しない(§3.4)
- 全外部リンクは `src/config.ts` に一元管理。ページ内に URL を直書きしない(§4.4)
