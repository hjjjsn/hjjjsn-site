// works の RSS(§4.5)
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../config";

export async function GET(context) {
  const works = await getCollection("works");

  const items = works
    .map((work) => ({
      title: work.data.title,
      pubDate: work.data.date,
      description: work.data.description,
      link: `/works/${work.id}/`,
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items,
  });
}
