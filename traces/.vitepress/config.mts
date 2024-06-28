import { defineConfig } from "vitepress";
import { get_sidebar } from "./auto";
import { RssPlugin, RSSOptions } from "vitepress-plugin-rss";
const baseUrl = "https://trace.freet.tech";
const RSS: RSSOptions = {
    title: "Freet Bash's traces",
    baseUrl,
    copyright: "Copyright (c) 2024-present, Freet Bash",
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
    vite: {
        plugins: [RssPlugin(RSS)],
    },
    head: [
        [
            "link",
            {
                rel: "icon",
                href: "https://avatars.githubusercontent.com/u/88578981?v=4",
            },
        ],
    ],
    title: "trace",
    description: "path, core, trace",
    lastUpdated: true,
    cleanUrls: true,
    markdown: {
        lineNumbers: true,
        toc: {
            level: [1, 2, 3],
        },
    },
    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "traces", link: "/home" },
        ],
        search: {
            provider: "local",
        },
        outline: [2, 3],
        sidebar: get_sidebar(),
        socialLinks: [{ icon: "github", link: "https://github.com/fb0sh" }],
    },
});
