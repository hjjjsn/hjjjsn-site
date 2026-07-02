// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  // 独自ドメイン取得後に差し替える(RSS・OGP の絶対URL生成に使われる)
  site: "https://hjjjsn-site.hjjjsn.workers.dev",
  trailingSlash: "always",
});
