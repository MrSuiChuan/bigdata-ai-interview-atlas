import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repoRoot, "web", "docs-site", "src", "data", "catalog.js");
const { questionBank } = await import(pathToFileURL(catalogPath).href + `?t=${Date.now()}`);

function groupCount(key) {
  const map = new Map();
  for (const question of questionBank) {
    const value = question[key] || "未分类";
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function trackLabel(track) {
  if (track === "big-data") return "大数据";
  if (track === "ai-agents") return "AI Agent";
  if (track === "llm-foundations") return "大模型基础";
  return track;
}

function table(title, rows) {
  return [
    `# ${title}`,
    "",
    "| 分类 | 数量 |",
    "| --- | ---: |",
    ...rows.map(([name, count]) => `| ${name} | ${count} |`),
    "",
  ].join("\n");
}

function buildMarkdown() {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const byTrack = groupCount("track").map(([track, count]) => [trackLabel(track), count]);
  const byType = groupCount("type");
  const byDifficulty = groupCount("difficulty");
  const byComponent = groupCount("component");

  return [
    "---",
    "kb_id: blueprint/question-bank-coverage",
    'title: "题库覆盖统计"',
    "domain: blueprint",
    "component: project",
    "topic: question-bank-coverage",
    "difficulty: intermediate",
    "status: reviewed",
    "sidebar_position: 6",
    `version_scope: "Question bank snapshot generated on ${generatedAt}"`,
    `last_verified_at: "${generatedAt}"`,
    "source_ids: []",
    "claim_ids: []",
    "---",
    "",
    "# 说明",
    "",
    "这页统计前端题库 `questionBank` 当前可浏览的题目分布。它和 Markdown 题目文件不是同一个口径：Markdown 是内容资产，`questionBank` 是前端练习入口。",
    "",
    `当前前端题库共 ${questionBank.length} 道题。`,
    "",
    table("按方向", byTrack),
    table("按题型", byType),
    table("按难度", byDifficulty),
    table("按组件", byComponent),
    "# 后续补题原则",
    "",
    "1. 知识库先达标，再扩题库；题库不能替代知识库。",
    "2. 每个核心组件至少要覆盖原理题、系统设计题、排障题和对比题。",
    "3. 高阶题应包含一句话结论、这题想考什么、回答主线、参考作答、现场判断抓手、常见误区和追问。",
    "4. 新增题目必须关联已有文档和来源 Claim。",
    "",
  ].join("\n");
}

const markdown = buildMarkdown();
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(repoRoot, "internal", "blueprint", "question-bank-coverage.md"), markdown, "utf8");
}

console.log(`question bank coverage: ${questionBank.length} questions`);

