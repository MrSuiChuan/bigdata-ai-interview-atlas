import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

const knowledgeRoots = [
  path.join(repoRoot, "docs", "bigdata"),
  path.join(repoRoot, "docs", "ai-agent"),
  path.join(repoRoot, "docs", "llm-foundations"),
];

const questionStyleMarkers = [
  "标准面试答案",
  "标准答案",
  "常见误答",
  "必答点",
  "评分点",
  "延伸追问",
  "面试答题结构",
  "面试回答",
  "答题手册",
  "30 秒",
  "2 分钟",
  "5 分钟",
];

const mojibakeMarkers = [
  "\u9225",
  "\u6d93",
  "\u935a",
  "\u68f0",
  "\u6fe1",
  "\u93c9",
  "\u95c3",
  "\u7039",
  "\ufffd",
];

const requiredKnowledgeSignals = [
  "解决什么问题",
  "核心对象",
  "核心机制",
  "执行链路",
  "状态",
  "边界",
  "排障",
];

const interviewKnowledgeMarkers = [
  "\u9762\u8bd5\u5b98",
  "\u8ffd\u95ee",
  "\u53c2\u8003\u7b54\u6848",
  "\u7b54\u6848\u8981\u70b9",
  "\u9ad8\u9891\u9762\u8bd5",
  "\u5019\u9009\u4eba",
  "\u80cc\u8bf5",
  "\u600e\u4e48\u56de\u7b54",
  "\u9762\u8bd5\u9898",
  "\u8fd9\u9898",
  "\u7b54\u6d45",
  "\u771f\u6b63\u8981\u7b54",
  "\u9762\u8bd5\u4e2d",
];

const templateRiskMarkers = [
  "\u672c\u9875\u7528\u4e8e\u628a",
  "\u8bf4\u660e\u7cfb\u7edf",
  "\u8bf4\u660e\u8bf7\u6c42",
  "\u4e3a\u4ec0\u4e48\u8fd9\u4e0d\u662f\u672f\u8bed\u9898",
  "\u672c\u9875\u9700\u8981\u4e32\u8d77\u6765\u7684\u94fe\u8def",
  "\u5165\u53e3\uff1a\u786e\u8ba4\u8bf7\u6c42\u3001\u4f5c\u4e1a\u3001SQL\u3001\u540e\u53f0\u4efb\u52a1\u6216\u7ba1\u7406\u547d\u4ee4\u4ece\u54ea\u91cc\u8fdb\u5165\u7cfb\u7edf",
  "\u5bf9\u8c61\uff1a\u628a\u53c2\u4e0e\u5bf9\u8c61\u6309\u63a7\u5236\u9762\u3001\u6570\u636e\u9762\u3001\u5143\u6570\u636e\u9762\u548c\u5916\u90e8\u4f9d\u8d56\u5206\u7c7b",
  "\u94fe\u8def\uff1a\u63cf\u8ff0\u8bf7\u6c42\u5982\u4f55\u63a8\u8fdb\u3001\u72b6\u6001\u5982\u4f55\u53d8\u5316\u3001\u7ed3\u679c\u4f55\u65f6\u53ef\u89c1",
  "\u8fb9\u754c\uff1a\u660e\u786e\u7ec4\u4ef6\u4fdd\u8bc1\u4ec0\u4e48\uff0c\u4e0d\u4fdd\u8bc1\u4ec0\u4e48\uff0c\u4ee5\u53ca\u8c03\u7528\u65b9\u9700\u8981\u627f\u62c5\u4ec0\u4e48",
  "\u8bc1\u636e\uff1a\u7528\u6307\u6807\u3001\u65e5\u5fd7\u3001\u5143\u6570\u636e\u3001\u6267\u884c\u8ba1\u5212\u6216\u547d\u4ee4\u884c\u5f62\u6210\u53ef\u590d\u6838\u5224\u65ad",
];

const placeholderMarkers = [
  "TODO",
  "\u5f85\u8865\u5145",
  "\u5360\u4f4d",
  "\u540e\u7eed\u8865\u5145",
  "\u5f85\u5b8c\u5584",
];

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

function parseMarkdown(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: content };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length) };
}

function rel(file) {
  return path.relative(repoRoot, file).replaceAll("\\", "/");
}

function countBy(rows, getter) {
  const map = new Map();
  for (const row of rows) {
    const key = getter(row) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function auditFile(file) {
  const { data, body } = parseMarkdown(file);
  const text = `${data.title || ""}\n${data.topic || ""}\n${Array.isArray(data.tags) ? data.tags.join(" ") : ""}\n${body}`;
  const questionStyleHits = questionStyleMarkers.filter((marker) => text.includes(marker));
  const mojibakeHits = mojibakeMarkers.filter((marker) => text.includes(marker));
  const lowerPath = rel(file).toLowerCase();
  const missingSignals = requiredKnowledgeSignals.filter((signal) => !text.includes(signal));
  const chars = [...body].length;
  const h2Count = (body.match(/^##\s+/gm) || []).length;
  const h3Count = (body.match(/^###\s+/gm) || []).length;
  const codeBlocks = Math.floor((body.match(/```|~~~/g) || []).length / 2);
  const tables = (body.match(/^\|.+\|$/gm) || []).length;
  const sourceIds = Array.isArray(data.source_ids) ? data.source_ids : [];
  const claimIds = Array.isArray(data.claim_ids) ? data.claim_ids : [];
  const interviewKnowledgeHits = interviewKnowledgeMarkers.filter((marker) => text.includes(marker));
  const templateRiskHits = templateRiskMarkers.filter((marker) => text.includes(marker));
  const placeholderHits = placeholderMarkers.filter((marker) => text.includes(marker));

  const issues = [];
  if (questionStyleHits.length) issues.push("question-style");
  if (interviewKnowledgeHits.length) issues.push("interview-wording");
  if (templateRiskHits.length) issues.push("template-risk");
  if (placeholderHits.length) issues.push("placeholder");
  if (lowerPath.includes("interview")) issues.push("interview-path");
  if (mojibakeHits.length) issues.push("mojibake-like");
  if (chars < 2500) issues.push("too-short");
  if (missingSignals.length >= 4) issues.push("missing-knowledge-signals");
  if (h2Count === 0) issues.push("flat-heading-structure");
  if (sourceIds.length === 0) issues.push("no-source");
  if (sourceIds.length > 0 && sourceIds.length < 2) issues.push("weak-source");
  if (claimIds.length === 0) issues.push("no-claim");
  if (chars > 3000 && h3Count === 0) issues.push("flat-depth");

  return {
    file: rel(file),
    domain: data.domain || "missing",
    component: data.component || "missing",
    title: data.title || path.basename(file, ".md"),
    chars,
    h2Count,
    h3Count,
    codeBlocks,
    tables,
    sources: sourceIds.length,
    claims: claimIds.length,
    questionStyleHits,
    interviewKnowledgeHits,
    templateRiskHits,
    placeholderHits,
    missingSignals,
    issues,
  };
}

const docs = knowledgeRoots.flatMap((root) => walkFiles(root, (_, name) => name.endsWith(".md")));
const rows = docs.map(auditFile);
const issueRows = rows.filter((row) => row.issues.length);
const hardFailures = rows.filter((row) =>
  row.issues.includes("question-style") ||
  row.issues.includes("interview-wording") ||
  row.issues.includes("placeholder") ||
  row.issues.includes("no-claim") ||
  row.issues.includes("interview-path") ||
  row.issues.includes("mojibake-like") ||
  row.issues.includes("no-source")
);

const markdown = [
  "---",
  "kb_id: blueprint/knowledge-style-audit",
  'title: "知识库风格审计"',
  "domain: blueprint",
  "component: project",
  "topic: knowledge-style-audit",
  "difficulty: intermediate",
  "status: reviewed",
  "sidebar_position: 14",
  `version_scope: "Workspace knowledge audit generated on ${today}"`,
  `last_verified_at: "${today}"`,
  "source_ids: []",
  "claim_ids: []",
  "---",
  "",
  "# 结论",
  "",
  "这份报告只审计知识库文档，不审计题库。知识库应保持知识解读型写法，不应出现标准答案、必答点、评分点、延伸追问等题库表达。",
  "",
  "# 汇总",
  "",
  `1. 知识库文档总数：${rows.length}`,
  `2. 存在问题的文档：${issueRows.length}`,
  `3. 必须修复的问题文档：${hardFailures.length}`,
  `4. 题库化表达文档：${rows.filter((row) => row.issues.includes("question-style")).length}`,
  `5. interview 路径文档：${rows.filter((row) => row.issues.includes("interview-path")).length}`,
  `6. 疑似乱码文档：${rows.filter((row) => row.issues.includes("mojibake-like")).length}`,
  `7. 无来源文档：${rows.filter((row) => row.issues.includes("no-source")).length}`,
  `8. 少于 2500 字符的文档：${rows.filter((row) => row.issues.includes("too-short")).length}`,
  "",
  "# 按问题类型统计",
  "",
  "| 问题类型 | 数量 |",
  "| --- | ---: |",
  ...countBy(issueRows.flatMap((row) => row.issues.map((issue) => ({ issue }))), (row) => row.issue).map(([name, count]) => `| ${name} | ${count} |`),
  "",
  "# 按方向和组件统计",
  "",
  "| 方向 / 组件 | 问题文档数 |",
  "| --- | ---: |",
  ...countBy(issueRows, (row) => `${row.domain} / ${row.component}`).map(([name, count]) => `| ${name} | ${count} |`),
  "",
  "# 必须修复清单",
  "",
  "| 文件 | 问题 | 命中词 |",
  "| --- | --- | --- |",
  ...hardFailures.slice(0, 200).map((row) => `| ${row.file} | ${row.issues.join(", ")} | ${row.questionStyleHits.join("、")} |`),
  "",
  "# 处理原则",
  "",
  "1. 知识库文档只讲机制、对象、链路、边界、排障和示例。",
  "2. 面试题表达只能放在 `questions` 目录。",
  "3. 短文档可以暂时保留，但必须进入后续精修队列。",
  "4. 涉及协议、API、版本行为的内容必须继续使用官方来源复核。",
  "",
].join("\n");

if (shouldWrite) {
  fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "knowledge-style-audit.md"), markdown, "utf8");
}

console.log(JSON.stringify({
  docs: rows.length,
  issueDocs: issueRows.length,
  hardFailures: hardFailures.length,
  questionStyleDocs: rows.filter((row) => row.issues.includes("question-style")).length,
  interviewPathDocs: rows.filter((row) => row.issues.includes("interview-path")).length,
  mojibakeLikeDocs: rows.filter((row) => row.issues.includes("mojibake-like")).length,
  noSourceDocs: rows.filter((row) => row.issues.includes("no-source")).length,
  weakSourceDocs: rows.filter((row) => row.issues.includes("weak-source")).length,
  noClaimDocs: rows.filter((row) => row.issues.includes("no-claim")).length,
  interviewWordingDocs: rows.filter((row) => row.issues.includes("interview-wording")).length,
  templateRiskDocs: rows.filter((row) => row.issues.includes("template-risk")).length,
  placeholderDocs: rows.filter((row) => row.issues.includes("placeholder")).length,
  flatDepthDocs: rows.filter((row) => row.issues.includes("flat-depth")).length,
  shortDocs: rows.filter((row) => row.issues.includes("too-short")).length,
}, null, 2));

if (hardFailures.length && process.argv.includes("--strict")) {
  process.exit(1);
}
