import { defineConfig } from "vitepress";

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
        search: {
            provider: "local",
        },
        outline: [2, 3],
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "主页", link: "/" },
            { text: "博客", link: "/home" },
        ],

        sidebar: [
            {
                items: [
                    {
                        text: "博客主页",
                        link: "/home.md",
                    },
                ],
            },
            {
                text: "2024-4-30",
                collapsed: true,
                items: [
                    {
                        text: "Volatility2内存取证",
                        link: "/2024-4-30/Volatility2内存取证.md",
                    },
                    {
                        text: "HTTP请求头常见绕过",
                        link: "/2024-4-30/HTTP请求头绕过.md",
                    },
                ],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/freetbash" }],
    },
});
