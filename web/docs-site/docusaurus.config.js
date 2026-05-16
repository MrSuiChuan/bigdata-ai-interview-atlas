const path = require("path");
const { themes } = require("prism-react-renderer");

const repoName =
  process.env.DOCS_SITE_REPO ||
  process.env.GITHUB_REPOSITORY?.split("/")[1] ||
  "bigdata-ai-interview-system";
const ownerName =
  process.env.DOCS_SITE_OWNER ||
  process.env.GITHUB_REPOSITORY_OWNER ||
  "local";
const customSiteUrl = process.env.DOCS_SITE_URL;
const customBaseUrl = process.env.DOCS_SITE_BASE_URL;
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgSite = repoName.toLowerCase() === `${ownerName.toLowerCase()}.github.io`;

function normalizeBaseUrl(value) {
  let base = value || "/";
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  return base;
}

const siteUrl = customSiteUrl || (isGithubActions ? `https://${ownerName}.github.io` : "http://localhost");
const siteBaseUrl = normalizeBaseUrl(
  customBaseUrl || (isGithubActions ? (isUserOrOrgSite ? "/" : `/${repoName}/`) : "/"),
);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "大数据与 AI 面试图谱",
  tagline: "一个以中文知识解读、题库训练和模拟面试为核心的大数据与 AI 学习系统",
  favicon: "img/favicon.svg",
  url: siteUrl,
  baseUrl: siteBaseUrl,
  organizationName: ownerName,
  projectName: repoName,
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
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsDir: ["../../docs"],
        language: ["zh", "en"],
        explicitSearchResultPath: true,
        highlightSearchTermsOnTargetPage: true,
        removeDefaultStemmer: true,
        searchBarPosition: "right",
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchResultLimits: 10,
      },
    ],
  ],
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
