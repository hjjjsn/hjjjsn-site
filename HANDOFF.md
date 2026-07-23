# 引き継ぎメモ(→ Sonnet)

前工程(Fable)で Phase 1 の骨格実装 + デプロイまで完了済み。仕様の唯一の情報源は `hjjjsn-site-requirements.md`。判断に迷ったら §2 ブランド定義に立ち返ること(静か・誇張しない・「!」と絵文字は使わない)。

## 公開URL・リポジトリ

- **本番サイト**: https://hjjjsn-site.hjjjsn.workers.dev/ (稼働確認済み。全6ページ + `/rss.xml` + `/404` が 200 OK)
- **GitHub**: https://github.com/hjjjsn/hjjjsn-site (public)
- 独自ドメインは未取得。取得後は `astro.config.mjs` の `site` と Cloudflare 側のカスタムドメイン設定を両方更新すること

## デプロイ構成(重要・仕様書 §5.2 からの変更点)

要件書は「Cloudflare Pages」を想定しているが、実際にダッシュボードで「Connect to Git」した結果は **Cloudflare Pages ではなく Cloudflare Workers Builds**(新しい統合UI。Build command / Deploy command / Root directory を wrangler ベースで設定する形式)だった。クラシックな Pages の「Build output directory」を指定する画面は出てこない。この違いにより:

- リポジトリ直下に **`wrangler.jsonc`** を追加済み。`assets.directory: "./dist"` で `dist` を静的アセットとして配信する設定。**これが無いと `npx wrangler deploy` が何もできず失敗する**
- `wrangler.jsonc` の `assets.not_found_handling: "404-page"` を使っているため `dist/404.html` が必須。`src/pages/404.astro` を追加済み(ブランドトーンに沿った最小限のページ)
- Cloudflare アカウントに `workers.dev` サブドメインが未登録だったため、API 経由で `hjjjsn` として登録済み(`https://api.cloudflare.com/.../workers/subdomain` へ PUT)。これはアカウント単位で一度きりの設定
- ローカルで `wrangler` は OAuth 認証済み(`tatituteto1217@gmail.com` アカウント、`npx wrangler login` 実施済み、トークンは `~/Library/Preferences/.wrangler/config/default.toml` に保存されている)。**このマシンからは `npx wrangler deploy` で即座に手動デプロイできる**

### git push → 自動デプロイの挙動

GitHub 連携(Cloudflare の GitHub App "Cloudflare Workers and Pages")は正常に機能している。ただし **push から自動ビルドの完了まで 15〜20分程度のラグがある**(検証済み。バグではなく、このプロジェクトの標準的な待ち時間らしい)。ダッシュボードで「Initializing」のまま数分固まって見えても、それだけでは異常と判断しないこと。心配な場合は以下で確認できる:

```bash
gh api repos/hjjjsn/hjjjsn-site/commits/<sha>/check-runs --jq '.check_runs[] | {status, conclusion}'
```

`conclusion: "success"` が出れば本番反映済み。急ぎで確認したい・待てない場合は、ローカルから `npm run build && npx wrangler deploy` で即時デプロイ可能(CIとは独立して動く)。

## 現状:完了していること

- **Astro 7 + TypeScript** プロジェクト一式。`npm run build` が通り、全6ページ + `/rss.xml` + `/404` が静的生成される(`npm run dev` / `npm run preview` も可)
- デザイントークン(`src/styles/tokens.css`)と共通スタイル(`src/styles/global.css`)。§3.2 の5色をCSS変数で定義済み
- コンテンツモデル(`src/content.config.ts`):works / words の zod スキーマ。**mdファイルを `src/content/works/` または `words/` に置くだけでページ・一覧・RSSに反映される**(受け入れ条件の核。確認済み)
- サンプルコンテンツ:works 3件、words 3件(URL・埋め込みIDはすべてダミー)
- コンポーネント:
  - `EmbedFacade.astro` — クリックまで iframe を読み込まないファサード。YouTube は nocookie ドメイン、--haze オーバーレイがホバーで晴れる。noscript 時は外部リンクを表示
  - `WorkCard.astro` / `WordRow.astro` / `DiscordCta.astro`
- 「析出」モーション(§3.4):`.settle`(スクロール出現、IntersectionObserver)と `.settle-hero`(初回表示)。blur(8px)→0 / 600ms ease-out。`prefers-reduced-motion` と JS無効(`html.no-js`)では即時表示
- `--precipitate` の使用箇所は Discord CTA と nav の現在地表示(`aria-current="page"`)のみ — 受け入れ条件どおり
- OGP/Twitterカード全ページ設定済み。`public/og-default.png` は --base 単色のプレースホルダ
- Cloudflare Workers へのデプロイ完了(上記参照)

## サイト再構成(2026-07-23)

ユーザー指示により、サイトを「頼まれてできること(依頼)」+「応援して欲しいこと(Support)」の2本柱に再構成した。デザイン・トーンは変更なし。

- **works は実データ2件のみ**:`vocal-mix.md`(YouTube rB7107d5a2o)と `oke-ongen.md`(YouTube VYkGTB1FP5o)。どちらも megu さんのカバー動画(ボーカルmix / オケ制作の実績)。type enum に `mix` / `inst` を追加済み
- **words は全削除**(コレクション・ページ・WordRow・RSSから除去)。全部ダミーだったため。書籍は Support リンク(Amazon)に移動
- **実URL反映済み**(`src/config.ts` に一元管理、全て有効性確認済み):Discord 招待 `discord.gg/m9bwWuGZ`、Spotify・YouTube・niconico・BOOTH・書籍(Amazon B0H35397NZ)。旧ダミー(X / Bandcamp / note / メール連絡先)は削除
- トップは Hero(vocal-mix)+ Works(依頼)+ Support(リンク列)+ About 抜粋 + Discord CTA。nav は Works / About / Links の3つ

## 残タスク(優先順)

1. **モバイル(375px)での全ページ目視確認**(受け入れ条件)。特にトップのヒーロー(縦書き併置の grid)と works グリッド
2. **Lighthouse(モバイル)Performance 95+ / Accessibility 95+ の計測**。Google Fonts のブロッキングが引っかかる場合はサブセット化 or `fontsource` セルフホストへ切り替え
3. **独自ドメイン接続**(取得後):Cloudflare ダッシュボードでカスタムドメインを Worker に紐付け、`astro.config.mjs` の `site` を更新
4. **OG画像の改善**(Phase 2 だが余裕があれば):satori でタイトル入り自動生成。現状は単色プレースホルダ

## 実装上の注意(仕様書に無い決定事項)

- Astro 7 の Content Layer API を使用。コレクション定義は `src/content/config.ts` ではなく **`src/content.config.ts`**(ルート直下)にある。作品詳細の slug は `work.id`(ファイル名から拡張子を除いたもの)
- CSS はプレーンCSS(Tailwind不使用)。スタイルは各 `.astro` の scoped `<style>` + global.css の2層
- 縦書き(`writing-mode: vertical-rl`)はトップのヒーロー右端の一箇所のみ。増やさない(§3.3)
- モーションは「析出」1種のみ。新しいアニメーションを追加しない(§3.4)
- 全外部リンクは `src/config.ts` に一元管理。ページ内に URL を直書きしない(§4.4)
- デプロイは Cloudflare Pages ではなく Workers Builds(上記参照)。要件書 §5.2 の「Cloudflare Pages」という記述と実態がずれているが、「git push だけで運用できる」というゴールは達成されている
