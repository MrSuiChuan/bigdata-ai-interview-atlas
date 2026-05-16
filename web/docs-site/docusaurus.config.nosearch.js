const path = require("path");
const { themes } = require("prism-react-renderer");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "大数据与 AI 面试图谱",
  tagline: "一个以中文知识解读、题库训练和模拟面试为核心的大数据与 AI 学习系统",
  favicon: "img/favicon.svg",
  url: "http://localhost",
  baseUrl: "/",
  organizationName: "local",
  projectName: "bigdata-ai-interview-system",
  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },
  trailingSlash: true,
  themes: [],
  themeConfig: {
    image: "img/social-card.svg",
    navbar: {
      title: "面试图谱",
      logo: {
        alt: "面试图谱 Logo",
        src: "img/favicon.svg",
      },
      items: [
        { to: "/docs/overview", label: "知识库", position: "left" },
        { to: "/big-data", label: "大数据", position: "left" },
        { to: "/ai-agents", label: "AI Agent", position: "left" },
        { to: "/llm-foundations", label: "大模型基础", position: "left" },
        { to: "/questions", label: "题库", position: "left" },
        { to: "/dashboard", label: "仪表盘", position: "left" },
        { to: "/learning-paths", label: "学习路径", position: "left" },
        { to: "/mock-interview", label: "模拟面试", position: "left" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "内容结构",
          items: [
            { label: "知识入口", to: "/docs/overview" },
            { label: "大数据主题", to: "/big-data" },
            { label: "AI Agent 主题", to: "/ai-agents" },
            { label: "题库总览", to: "/questions" },
            { label: "学习仪表盘", to: "/dashboard" },
            { label: "学习路径", to: "/learning-paths" },
            { label: "模拟面试", to: "/mock-interview" },
          ],
        },
      ],
      copyright: "面向本地写作、知识沉淀和面试练习构建。",
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.github,
    },
  },
  presets: [
    [
      "classic",
      {
        docs: {
          path: path.resolve(__dirname, "../../docs"),
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
          exclude: ["**/_*.{js,jsx,ts,tsx,md,mdx,json}", "**/blueprint/**"],
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};

module.exports = config;
