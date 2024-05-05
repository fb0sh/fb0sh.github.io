import { defineConfig } from "vitepress";
import { get_sidebar } from "./auto";
// https://vitepress.dev/reference/site-config
export default defineConfig({
    head: [
        [
            "link",
            {
                rel: "icon",
                href: "https://avatars.githubusercontent.com/u/88578981?v=4",
            },
        ],
    ],
    title: "博客随笔",
    description: "记录每天的学习",
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
            { text: "主页", link: "/" },
            { text: "博客", link: "/home" },
        ],
        search: {
            provider: "local",
        },
        outline: [2, 3],
        sidebar: get_sidebar(),
        socialLinks: [{ icon: "github", link: "https://github.com/freetbash" }],
    },
});
