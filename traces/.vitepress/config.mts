import { defineConfig } from "vitepress";
import { RssPlugin, RSSOptions } from "vitepress-plugin-rss";
import { generateSidebar } from "vitepress-sidebar";

const baseUrl = "https://trace.freet.tech";

// RSS 配置
const RSS: RSSOptions = {
  title: "fb0sh's traces",
  baseUrl,
  copyright: "Copyright (c) 2024-present, fb0sh",
};

// 侧边栏配置
const vitepressSidebarOptions = {
  documentRootPath: "/traces",
  excludeFolders: [".vitepress", "images"],
  excludeFiles: ["home.md", "index.md"],
  collapsed: true,
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "trace",
  description: "path, core, trace",
  lastUpdated: true,
  cleanUrls: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "https://avatars.githubusercontent.com/u/88578981?v=4",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "traces", link: "/home" },
    ],
    search: {
      provider: "local",
    },
    outline: [2, 3],
    sidebar: generateSidebar(vitepressSidebarOptions),
    socialLinks: [{ icon: "github", link: "https://github.com/fb0sh" }],
  },
  // 代码段设置
  markdown: {
    lineNumbers: true,
    toc: {
      level: [1, 2, 3],
    },
  },
  // 插件
  vite: {
    plugins: [RssPlugin(RSS)],
  },
});
