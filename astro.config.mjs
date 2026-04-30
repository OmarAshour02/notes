import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { gruvboxMaterialDark } from "./src/styles/shiki-theme.ts";

export default defineConfig({
  site: "https://example.pages.dev",
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: {
      theme: gruvboxMaterialDark,
      wrap: true,
    },
  },
});
