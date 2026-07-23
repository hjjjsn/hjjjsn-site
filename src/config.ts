// 全外部リンク・サイト定数の一元管理(§4.4)
// URL はすべてここだけを書き換えれば全ページに反映される。

export const SITE = {
  title: "hjjjsn",
  description:
    "体が先に引っかかって、あとから言葉がついてくる。ボーカルミックスとオケ音源制作、作ったものの置き場。",
  // 縦書きで置く一文(トップページ・ヒーロー右端)
  verticalLine: "体が先に引っかかって、あとから言葉がついてくる",
} as const;

export const DISCORD = {
  inviteUrl: "https://discord.gg/m9bwWuGZ",
  // トーン基準(§2.4):「参加しよう!」ではない温度
  ctaText: "たまに、ここで話しています",
  buttonLabel: "Discord",
} as const;

// 応援して欲しいこと。フッタ・/links/・トップの Support に使う
export const LINKS = [
  {
    label: "Spotify",
    url: "https://open.spotify.com/artist/4Gpi6eJGAAPZkk9Rt9UPo4",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/channel/UCygmaycqK-SxtJSTyU2iLFA",
  },
  { label: "niconico", url: "https://www.nicovideo.jp/user/142850614" },
  { label: "BOOTH", url: "https://hjjjsn.booth.pm" },
  { label: "書籍", url: "https://www.amazon.co.jp/dp/B0H35397NZ" },
] as const;
