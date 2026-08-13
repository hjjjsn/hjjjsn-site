// Worker エントリ。動的APIだけ処理し、それ以外は dist の静的アセットを配信する。
//   /api/hero-videos … ヒーローのランダム表示候補(チャンネルの横動画一覧)
//   /api/works       … 作品セクションの自動取得データ(最新リリース・各カードの画像)
// どちらも外部サービスの公開エンドポイントをエッジでプロキシ+キャッシュする。
import { SITE, LINKS } from "../src/config";

const YT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;

const linkUrl = (label) => LINKS.find((l) => l.label === label)?.url ?? "";

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// produce() の結果をエッジキャッシュ付き JSON レスポンスにする。
// キー末尾の ?v=N は世代。取得ロジックを変えたら上げて旧キャッシュを無効化する
async function withCache(cacheUrl, maxAge, produce, ctx) {
  const cache = caches.default;
  const key = new Request(cacheUrl);
  const hit = await cache.match(key);
  if (hit) return hit;

  const data = await produce();
  const res = new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

async function safe(fn, errors, name) {
  try {
    return await fn();
  } catch (e) {
    if (errors) errors[name] = String(e);
    return null;
  }
}

// ---- ヒーロー候補:チャンネルの横動画一覧 ----

async function fetchLandscapeVideos() {
  const feed = await fetch(YT_FEED_URL);
  if (!feed.ok) throw new Error(`feed ${feed.status}`);
  const xml = await feed.text();
  const ids = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map(
    (m) => m[1],
  );
  const titles = [...xml.matchAll(/<media:title>([^<]+)<\/media:title>/g)].map(
    (m) => decodeEntities(m[1]),
  );
  const videos = ids.map((id, i) => ({ id, title: titles[i] ?? SITE.title }));
  if (videos.length === 0) throw new Error("empty feed");

  // 横動画だけに絞る:通常動画は /shorts/{id} が /watch へリダイレクトされ、
  // Shorts(縦動画)は 200 で止まる。判定不能な動画は除外する
  const checked = await Promise.all(
    videos.map(async (video) => {
      try {
        const probe = await fetch(`https://www.youtube.com/shorts/${video.id}`, {
          method: "HEAD",
          redirect: "manual",
        });
        return probe.status >= 300 && probe.status < 400 ? video : null;
      } catch {
        return null;
      }
    }),
  );
  const landscape = checked.filter((v) => v !== null);
  if (landscape.length === 0) throw new Error("no landscape videos");
  return landscape;
}

function heroVideosResponse(origin, ctx) {
  return withCache(
    `${origin}/api/hero-videos?v=2`,
    600,
    fetchLandscapeVideos,
    ctx,
  );
}

// ---- 作品セクションの自動取得 ----
// 最新リリース(iTunes)はここでは扱わない:itunes.apple.com は Cloudflare の
// エッジIPを 403 で弾くため、CORS 対応を利用してクライアントから直接取得する

// niconico:公式 nvapi でユーザーの最新投稿動画のサムネイルを取る
async function fetchNicoImage() {
  const userId = linkUrl("niconico").split("/user/")[1];
  const res = await fetch(
    `https://nvapi.nicovideo.jp/v3/users/${userId}/videos?sortKey=registeredAt&sortOrder=desc&pageSize=1&page=1`,
    {
      headers: {
        "X-Frontend-Id": "6",
        "X-Frontend-Version": "0",
        "User-Agent": "Mozilla/5.0",
      },
    },
  );
  if (!res.ok) throw new Error(`nvapi ${res.status}`);
  const data = await res.json();
  const item = data?.data?.items?.[0]?.essential;
  return item?.thumbnail?.largeUrl ?? item?.thumbnail?.url ?? null;
}

// note:RSS の最新記事のサムネイル
async function fetchNoteImage() {
  const res = await fetch(`${linkUrl("note")}/rss`);
  if (!res.ok) throw new Error(`note ${res.status}`);
  const xml = await res.text();

  // RSS 全体から thumbnail を探すと、最新記事にアイキャッチが
  // 無い場合に古い記事の画像を拾ってしまう。必ず先頭 item のみ見る。
  const latestItem = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1];
  if (!latestItem) return null;

  const thumbnail = latestItem.match(
    /<media:thumbnail>([^<]+)<\/media:thumbnail>/,
  )?.[1];
  if (thumbnail) return decodeEntities(thumbnail);

  // note は記事本文の先頭画像だけを description に入れることがある。
  const contentImage = latestItem.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
  return contentImage ? decodeEntities(contentImage) : null;
}

// BOOTH:ショップページの先頭商品画像。商品が並ぶまでは null(カードはラベル表示)
async function fetchBoothImage() {
  const res = await fetch(linkUrl("BOOTH"), {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`booth ${res.status}`);
  const html = await res.text();
  const m = html.match(/https:\/\/booth\.pximg\.net\/[^"']+/);
  return m ? decodeEntities(m[0]) : null;
}

async function fetchWorksData(origin, ctx, errors) {
  const [heroRes, niconico, note, booth] = await Promise.all([
    safe(() => heroVideosResponse(origin, ctx), errors, "youtube"),
    safe(fetchNicoImage, errors, "niconico"),
    safe(fetchNoteImage, errors, "note"),
    safe(fetchBoothImage, errors, "booth"),
  ]);

  // YouTube カードはヒーロー候補(横動画)の最新サムネイルを流用
  let youtube = null;
  if (heroRes) {
    const videos = await heroRes.json();
    if (videos.length > 0) {
      youtube = `https://i.ytimg.com/vi/${videos[0].id}/hqdefault.jpg`;
    }
  }

  return { cards: { youtube, niconico, note, booth } };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hero-videos") {
      try {
        return await heroVideosResponse(url.origin, ctx);
      } catch {
        // 失敗時は空配列。クライアント側がページ埋め込みのフォールバックを使う
        return new Response("[]", {
          status: 502,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    if (url.pathname === "/api/works") {
      // ?debug=1 はキャッシュを通さず、各取得の失敗理由も返す(動作確認用)
      if (url.searchParams.has("debug")) {
        const errors = {};
        const data = await fetchWorksData(url.origin, ctx, errors);
        return Response.json({ ...data, errors });
      }
      return withCache(
        `${url.origin}/api/works?v=4`,
        1800,
        () => fetchWorksData(url.origin, ctx),
        ctx,
      );
    }

    return env.ASSETS.fetch(request);
  },
};
