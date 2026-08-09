// 全外部リンク・サイト定数の一元管理(§4.4)
// URL・動画IDはすべてここだけを書き換えれば全ページに反映される。

export const SITE = {
  title: "hjjjsn",
  description:
    "hjjjsn。音楽をしています。ボーカルミックス・オケ音源制作・楽器演奏の依頼と、作品の置き場。",
  // 縦書きで置く一文(トップページ・ヒーロー右端)
  verticalLine: "音楽をしています",
  // トップのヒーローにランダム表示する動画の取得元チャンネル
  youtubeChannelId: "UCygmaycqK-SxtJSTyU2iLFA",
} as const;

export const DISCORD = {
  inviteUrl: "https://discord.gg/m9bwWuGZ",
  buttonLabel: "Discord",
} as const;

// 頼まれてできること。videos は実績動画(YouTube ID)
export const SERVICES = [
  { title: "ボーカルミックス", videos: ["rB7107d5a2o"] },
  { title: "オケ音源制作", videos: ["VYkGTB1FP5o"] },
  {
    title: "楽器演奏",
    videos: ["4NQBUvLZVao", "8AFoT6Y13ok", "v11Vk62Xvz8"],
  },
] as const;

// 企画したコンピレーションアルバム(参加セクション)
export const COMPILATION = {
  label: "コンピレーションアルバム",
  title: "【ボーマス53】コンピレーションアルバム「キャプリズム」 XFD",
  videoId: "-LR0hXOsLu8",
} as const;

export const MUSIC = {
  // iTunes Search API のアーティストID。最新リリース(ジャケット・タイトル)の
  // 自動取得に使う(認証不要。Spotify API は Premium 必須になったため不採用)
  itunesArtistId: "1869213901",
} as const;

// 書籍(作品セクションの棚に置く)。画像は Amazon の ASIN 画像エンドポイント(静的)
export const BOOK = {
  label: "『溶けているあいだ』",
  url: "https://www.amazon.co.jp/dp/B0H35397NZ",
  image: "https://m.media-amazon.com/images/P/B0H35397NZ.01._SCLZZZZZZZ_.jpg",
} as const;

// 応援して欲しいもの。フッタ・/links/・トップの作品セクションに使う
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
  { label: "SoundCloud", url: "https://soundcloud.com/wjxxsthzcucq" },
  { label: "BOOTH", url: "https://hjjjsn.booth.pm" },
  { label: "note", url: "https://note.com/hjjjsn" },
] as const;
