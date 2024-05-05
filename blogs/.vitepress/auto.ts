import fs from "fs";
const base = "./blogs";
export const get_sidebar = () => {
    let categories: string[] = [];
    fs.readdirSync(base).forEach((dir) => {
        let s = fs.lstatSync(base + "/" + dir);
        if (s.isDirectory() && dir != ".vitepress") {
            categories.push(dir);
        }
    });

    let sidebar = [
        {
            items: [
                {
                    text: "博客主页",
                    link: "/home.md",
                },
            ],
        },
    ];

    categories.forEach((category) => {
        let item = {
            text: category,
            collapsed: true,
            items: [] as any,
        };

        fs.readdirSync(base + "/" + category).forEach((dir) => {
            if (dir.endsWith(".md") || dir.endsWith(".MD")) {
                let name = dir.split(".")[0];
                let path = "/" + category + "/" + dir;
                item.items.push({
                    text: name,
                    link: path,
                });
            }
        });

        sidebar.push(item);
    });
    return sidebar;
};
