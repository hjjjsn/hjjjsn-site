// 全外部リンク・サイト定数の一元管理(§4.4)
// URL はすべてここだけを書き換えれば全ページに反映される。

export const SITE = {
  title: "hjjjsn",
  description: "体が先に引っかかって、あとから言葉がついてくる。音楽・言葉・イラスト・プラグインの置き場。",
  // 縦書きで置く一文(トップページ・ヒーロー右端)
  verticalLine: "体が先に引っかかって、あとから言葉がついてくる",
} as const;

export const DISCORD = {
  // TODO: 実際の招待リンクに差し替える
  inviteUrl: "https://discord.gg/XXXXXXXX",
  // トーン基準(§2.4):「参加しよう!」ではない温度
  ctaText: "たまに、ここで話しています",
  buttonLabel: "Discord",
} as const;

export const LINKS = [
  { label: "YouTube", url: "https://www.youtube.com/@hjjjsn" },
  { label: "niconico", url: "https://www.nicovideo.jp/user/XXXXXXXX" },
  { label: "X", url: "https://x.com/hjjjsn" },
  { label: "Bandcamp", url: "https://hjjjsn.bandcamp.com" },
  { label: "BOOTH", url: "https://hjjjsn.booth.pm" },
  { label: "note", url: "https://note.com/hjjjsn" },
] as const;
