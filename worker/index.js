// Worker エントリ。/api/hero-videos だけ動的に返し、それ以外は dist の静的アセットを配信する。
// ヒーローのランダム表示候補を「表示時点のチャンネル動画一覧」にするための YouTube フィードプロキシ
// (フィードは CORS 不可なのでブラウザから直接は取れない)。
import { SITE } from "../src/config";

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/hero-videos") {
      return env.ASSETS.fetch(request);
    }

    const cache = caches.default;
    // キー末尾はキャッシュ世代。フィルタ条件を変えたらここを上げて旧キャッシュを無効化する
    const cacheKey = new Request(`${url.origin}/api/hero-videos?v=2`);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const feed = await fetch(FEED_URL);
      if (!feed.ok) throw new Error(`feed ${feed.status}`);
      const xml = await feed.text();
      const ids = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map(
        (m) => m[1],
      );
      const titles = [
        ...xml.matchAll(/<media:title>([^<]+)<\/media:title>/g),
      ].map((m) => decodeEntities(m[1]));
      const videos = ids.map((id, i) => ({
        id,
        title: titles[i] ?? SITE.title,
      }));
      if (videos.length === 0) throw new Error("empty feed");

      // 横動画だけに絞る:通常動画は /shorts/{id} が /watch へリダイレクトされ、
      // Shorts(縦動画)は 200 で止まる。判定不能な動画は除外する
      const checked = await Promise.all(
        videos.map(async (video) => {
          try {
            const probe = await fetch(
              `https://www.youtube.com/shorts/${video.id}`,
              { method: "HEAD", redirect: "manual" },
            );
            return probe.status >= 300 && probe.status < 400 ? video : null;
          } catch {
            return null;
          }
        }),
      );
      const landscape = checked.filter((v) => v !== null);
      if (landscape.length === 0) throw new Error("no landscape videos");

      const res = new Response(JSON.stringify(landscape), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          // エッジで10分キャッシュ。新着動画はこの遅延までで候補に入る
          "cache-control": "public, max-age=600",
        },
      });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    } catch {
      // 失敗時は空配列。クライアント側がビルド時リストにフォールバックする
      return new Response("[]", {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
};
