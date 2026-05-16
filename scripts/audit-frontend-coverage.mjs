import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full, entry.name)) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function rel(file) {
  return path.relative(repoRoot, file).replaceAll("\\", "/");
}

function parseFrontmatter(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  return yaml.load(match[1]) ?? {};
}

function trackFromDomain(domain) {
  if (domain === "bigdata") return "big-data";
  if (domain === "ai-agent") return "ai-agents";
  if (domain === "llm-foundations") return "llm-foundations";
  if (domain === "community") return "community";
  return domain || "unknown";
}

function componentLabel(component) {
  const map = {
    hdfs: "HDFS",
    yarn: "YARN",
    hbase: "HBase",
    trino: "Trino",
    hudi: "Hudi",
    "delta-lake": "Delta Lake",
    clickhouse: "ClickHouse",
    kafka: "Kafka",
    spark: "Spark",
    flink: "Flink",
    hive: "Hive",
    iceberg: "Iceberg",
  };
  return map[component] || component || "未分类";
}

function loadMarkdownQuestions() {
  return walkFiles(path.join(repoRoot, "questions"), (_, name) => name.endsWith(".md"))
    .map((file) => ({ file, data: parseFrontmatter(file) }))
    .filter((row) => row.data.id);
}

function loadMarkdownDocs() {
  return walkFiles(path.join(repoRoot, "docs"), (_, name) => name.endsWith(".md") && name !== "_category_.json")
    .map((file) => ({ file, data: parseFrontmatter(file) }))
    .filter((row) => row.data.kb_id);
}

async function loadCatalog() {
  const catalogPath = path.join(repoRoot, "web", "docs-site", "src", "data", "catalog.js");
  return import(pathToFileURL(catalogPath).href + `?t=${Date.now()}`);
}

function pageQuestionIds() {
  const pagesDir = path.join(repoRoot, "web", "docs-site", "src", "pages", "questions");
  return walkFiles(pagesDir, (_, name) => name.endsWith(".js")).map((file) => {
    const content = fs.readFileSync(file, "utf8");
    const match = content.match(/getQuestionById\("([^"]+)"\)/);
    return { file, id: match?.[1] || "" };
  });
}

function buildTrackDocLinks(trackCatalog) {
  const links = new Set();
  for (const track of Object.values(trackCatalog)) {
    for (const module of track.modules || []) {
      for (const doc of module.docs || []) {
        if (doc.href?.startsWith("/docs/")) links.add(doc.href.replace(/^\/docs\//, ""));
      }
    }
  }
  return links;
}

function countBy(rows, getter) {
  const map = new Map();
  for (const row of rows) {
    const key = getter(row) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function buildReport() {
  const { trackCatalog, questionBank } = await loadCatalog();
  const markdownQuestions = loadMarkdownQuestions();
  const markdownDocs = loadMarkdownDocs();
  const catalogIds = new Set(questionBank.map((q) => q.id));
  const markdownQuestionIds = new Set(markdownQuestions.map((q) => q.data.id));
  const missingInCatalog = markdownQuestions.filter((q) => !catalogIds.has(q.data.id));
  const catalogWithoutMarkdown = questionBank.filter((q) => !markdownQuestionIds.has(q.id));
  const pages = pageQuestionIds();
  const pageIdMap = new Map();
  for (const page of pages) {
    if (!page.id) continue;
    if (!pageIdMap.has(page.id)) pageIdMap.set(page.id, []);
    pageIdMap.get(page.id).push(page.file);
  }
  const duplicatePages = [...pageIdMap.entries()].filter(([, files]) => files.length > 1);
  const pageIds = new Set([...pageIdMap.keys()]);
  const catalogNoPage = questionBank.filter((q) => !pageIds.has(q.id));
  const docLinks = buildTrackDocLinks(trackCatalog);
  const docsMissingFromTrackModules = markdownDocs.filter((doc) => {
    const id = doc.data.kb_id;
    if (!id) return false;
    if (doc.data.domain === "blueprint") return false;
    if (id.startsWith("blueprint/")) return false;
    return !docLinks.has(id);
  });

  const lines = [
    "---",
    "kb_id: blueprint/frontend-coverage-audit",
    'title: "前端收录审计"',
    "domain: blueprint",
    "component: project",
    "topic: frontend-coverage-audit",
    "difficulty: intermediate",
    "status: reviewed",
    "sidebar_position: 9",
    `version_scope: "Workspace audit generated on ${new Date().toISOString().slice(0, 10)}"`,
    `last_verified_at: "${new Date().toISOString().slice(0, 10)}"`,
    "source_ids: []",
    "claim_ids: []",
    "---",
    "",
    "# 结论",
    "",
    "这份报告用于发现 Markdown 内容和前端入口之间的缺口。前端可见不等于内容质量达标，但不可见会直接影响使用。",
    "",
    "# 题库收录",
    "",
    `1. Markdown 题目总数：${markdownQuestions.length}`,
    `2. 前端 questionBank 总数：${questionBank.length}`,
    `3. Markdown 有但前端缺失：${missingInCatalog.length}`,
    `4. 前端有但 Markdown 缺失：${catalogWithoutMarkdown.length}`,
    `5. 题目详情页文件数：${pages.length}`,
    `6. 重复题目详情页 ID：${duplicatePages.length}`,
    `7. 前端题库中没有独立详情页的题目：${catalogNoPage.length}`,
    "",
    "# Markdown 有但前端缺失：按方向统计",
    "",
    "| 方向 | 数量 |",
    "| --- | ---: |",
    ...countBy(missingInCatalog, (row) => trackFromDomain(row.data.domain)).map(([name, count]) => `| ${name} | ${count} |`),
    "",
    "# Markdown 有但前端缺失：按组件统计",
    "",
    "| 组件 | 数量 |",
    "| --- | ---: |",
    ...countBy(missingInCatalog, (row) => componentLabel(row.data.component)).map(([name, count]) => `| ${name} | ${count} |`),
    "",
    "# 首页模块未链接文档：按方向统计",
    "",
    "| 方向 | 数量 |",
    "| --- | ---: |",
    ...countBy(docsMissingFromTrackModules, (row) => trackFromDomain(row.data.domain)).map(([name, count]) => `| ${name} | ${count} |`),
    "",
    "# 重复题目详情页",
    "",
    ...duplicatePages.map(([id, files]) => `- ${id}: ${files.map(rel).join(", ")}`),
    "",
    "# 后续处理原则",
    "",
    "1. 前端 questionBank 应从 Markdown 自动生成，避免手写 catalog 漏题。",
    "2. 题目详情页应尽量改成统一入口，避免每题一个 JS 文件导致构建膨胀。",
    "3. 首页模块文档链接应自动审计，不能长期依赖人工维护。",
    "",
  ];

  return {
    markdown: lines.join("\n"),
    summary: {
      markdownQuestions: markdownQuestions.length,
      catalogQuestions: questionBank.length,
      missingInCatalog: missingInCatalog.length,
      catalogWithoutMarkdown: catalogWithoutMarkdown.length,
      questionPageFiles: pages.length,
      duplicatePageIds: duplicatePages.length,
      catalogNoPage: catalogNoPage.length,
      docsMissingFromTrackModules: docsMissingFromTrackModules.length,
    },
  };
}

const report = await buildReport();
if (shouldWrite) {
  fs.writeFileSync(path.join(repoRoot, "internal", "blueprint", "frontend-coverage-audit.md"), report.markdown, "utf8");
}
console.log(JSON.stringify(report.summary, null, 2));


