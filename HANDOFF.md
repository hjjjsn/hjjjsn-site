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

## 現状のサイト構成(2026-07-23 再構成後)

ユーザー指示により、要件書の「Works/Words/About」構成から **「依頼(頼まれてできること)」+「作品(応援して欲しいもの)」の2本柱** に再構成した。デザイントークン・「析出」モーション・トーンは維持。ページは `/`・`/links/`・`/404` の3つだけ。

- **トップ `/`**(セクション順はユーザー指示で 作品 → 依頼):
  - Hero:**Worker の `/api/hero-videos`(YouTube フィードプロキシ、エッジ10分キャッシュ)から表示時に取得**し、クライアント側でランダムに1本表示。API 失敗時はビルド時に埋め込んだリスト、それも無ければ SERVICES にフォールバック。縦書き文言は「音楽をしています」。※ビルド時のフィード取得は **CI 環境では失敗する**(検証済み)ので、ランタイム API が本命
  - 作品:コンピレーションアルバム「キャプリズム」XFD(-LR0hXOsLu8)+ 応援リンク(Spotify / YouTube / niconico / BOOTH / note)。リード文なし
  - 依頼:ボーカルミックス(rB7107d5a2o)/ オケ音源制作(VYkGTB1FP5o)/ 楽器演奏(4NQBUvLZVao, 8AFoT6Y13ok)。実績動画の埋め込みのみ。リード文は「相談は Discord から。」だけ
  - Discord CTA はボタンのみ(「たまに、ここで話しています」の文言はユーザー指示で削除)
- **Worker スクリプト追加済み**(`worker/index.js` + `wrangler.jsonc` の `main`)。静的アセット配信 + `/api/hero-videos` のみ。チャンネルIDは `src/config.ts` の `SITE.youtubeChannelId` を import
- **削除済み**:About・works 詳細/一覧・words・RSS・コンテンツコレクション(`src/content.config.ts`)・`WorkCard`/`WordRow`。全コンテンツは **`src/config.ts` の定数(SERVICES / COMPILATION / LINKS / DISCORD)で一元管理** に変更
- 実URLは全て有効性確認済み(YouTube oEmbed / Discord invite API)。書籍(Amazon)リンクはユーザー指示で削除済み

## 残タスク(優先順)

1. **ユーザーのサイト確認 → 訂正指示待ち**(このサイクルで反復中)
2. **モバイル(375px)での全ページ目視確認**(受け入れ条件)
3. **Lighthouse(モバイル)Performance 95+ / Accessibility 95+ の計測**。Google Fonts のブロッキングが引っかかる場合はサブセット化 or `fontsource` セルフホストへ切り替え
4. **独自ドメイン接続**(取得後):Cloudflare ダッシュボードでカスタムドメインを Worker に紐付け、`astro.config.mjs` の `site` を更新
5. **OG画像の改善**:satori でタイトル入り自動生成。現状は単色プレースホルダ

## 実装上の注意(仕様書に無い決定事項)

- CSS はプレーンCSS(Tailwind不使用)。スタイルは各 `.astro` の scoped `<style>` + global.css の2層
- 縦書き(`writing-mode: vertical-rl`)はトップのヒーロー右端の一箇所のみ。増やさない(§3.3)
- モーションは「析出」1種のみ。新しいアニメーションを追加しない(§3.4)
- 全外部リンク・動画IDは `src/config.ts` に一元管理。ページ内に URL を直書きしない(§4.4)
- ヒーローのランダム表示:動画リストはビルド時の YouTube フィード(`https://www.youtube.com/feeds/videos.xml?channel_id=...`)スナップショット。新しい動画を反映するには再ビルドが必要。フィード取得失敗時は SERVICES の実績動画にフォールバック
- デプロイは Cloudflare Pages ではなく Workers Builds(上記参照)。要件書 §5.2 の「Cloudflare Pages」という記述と実態がずれているが、「git push だけで運用できる」というゴールは達成されている
- 要件書の works/words コンテンツモデル(§4.2)と About(§4.1)はユーザー指示により廃止。仕様書より本メモの本節を優先すること
