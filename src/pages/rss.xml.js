// works + words 統合 RSS(§4.5)
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../config";

export async function GET(context) {
  const works = await getCollection("works");
  const words = await getCollection("words");

  const items = [
    ...works.map((work) => ({
      title: work.data.title,
      pubDate: work.data.date,
      description: work.data.description,
      link: `/works/${work.id}/`,
    })),
    ...words.map((word) => ({
      title: word.data.title,
      pubDate: word.data.date,
      description: word.data.description,
      // 外部記事はそのまま外部URLへ
      link: word.data.url ?? `/words/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items,
  });
}
