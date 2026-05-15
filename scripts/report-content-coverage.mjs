import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);
const generatedComponents = new Set(["hdfs", "yarn", "hbase", "trino", "hudi", "delta-lake", "clickhouse"]);
const deepThreshold = { docs: 20, questions: 28, examples: 12, claims: 120 };

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
  return out;
}

function readYamlRows(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const parsed = yaml.load(fs.readFileSync(filePath, "utf8"));
  if (!parsed) return [];
  return Array.isArray(parsed) ? parsed : [parsed];
}

function loadClaims(domain) {
  return walkFiles(path.join(repoRoot, "claims", domain), (_, name) => name.endsWith(".yaml") || name.endsWith(".yml")).flatMap(readYamlRows);
}

function listDirs(...segments) {
  const dir = path.join(repoRoot, ...segments);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function countDocs(...segments) {
  return walkFiles(path.join(repoRoot, ...segments), (_, name) => name.endsWith(".md") && name !== "_category_.json").length;
}

function countQuestions(...segments) {
  return walkFiles(path.join(repoRoot, ...segments), (_, name) => name.endsWith(".md")).length;
}

function countExamplesByToken(token) {
  const normalizedToken = token.toLowerCase();
  return walkFiles(path.join(repoRoot, "examples")).filter((full) => {
    const normalized = full.replaceAll("/", "\\").toLowerCase();
    const basename = path.basename(normalized);
    return normalized.includes(`\\${normalizedToken}\\`) || basename.startsWith(`${normalizedToken}_`) || basename.includes(`_${normalizedToken}_`);
  }).length;
}

function countClaims(claimRows, component) {
  return claimRows.filter((row) => row?.component === component).length;
}

function quantityStatus(row) {
  if (row.docs >= deepThreshold.docs && row.questions >= deepThreshold.questions && row.examples >= deepThreshold.examples && row.claims >= deepThreshold.claims) return "数量达标";
  if (row.docs >= 1 && row.questions >= 1 && row.claims >= 1) return "基础达标";
  return "待补齐";
}

function qualityStatus(row) {
  if (generatedComponents.has(row.component)) return "待人工精修";
  if (row.track === "大数据") return row.quantityStatus === "数量达标" ? "需抽检复核" : "待补齐后复核";
  if (row.track === "AI Agent" || row.track === "大模型基础") return "专题整理中";
  return "待复核";
}

function bigdataRows() {
  const claims = loadClaims("bigdata");
  return listDirs("docs", "bigdata").map((component) => {
    const row = {
      track: "大数据",
      component,
      docs: countDocs("docs", "bigdata", component),
      questions: countQuestions("questions", "bigdata", component),
      examples: countExamplesByToken(component),
      claims: countClaims(claims, component),
    };
    row.quantityStatus = quantityStatus(row);
    row.qualityStatus = qualityStatus(row);
    return row;
  });
}

function aiRows() {
  const claims = loadClaims("ai-agent");
  return listDirs("docs", "ai-agent").map((component) => {
    const row = {
      track: "AI Agent",
      component,
      docs: countDocs("docs", "ai-agent", component),
      questions: countQuestions("questions", "ai-agent", component),
      examples: countExamplesByToken(component),
      claims: countClaims(claims, component),
    };
    row.quantityStatus = row.docs && row.questions ? "专题已入库" : "待补齐";
    row.qualityStatus = qualityStatus(row);
    return row;
  });
}

function llmRows() {
  const claims = loadClaims("llm-foundations");
  const row = {
    track: "大模型基础",
    component: "llm-foundations",
    docs: countDocs("docs", "llm-foundations"),
    questions: countQuestions("questions", "llm-foundations"),
    examples: 0,
    claims: claims.length,
  };
  row.quantityStatus = row.docs && row.questions ? "专题已入库" : "待补齐";
  row.qualityStatus = qualityStatus(row);
  return [row];
}

const rows = [...bigdataRows(), ...aiRows(), ...llmRows()];
const totals = rows.reduce((acc, row) => {
  acc.docs += row.docs;
  acc.questions += row.questions;
  acc.examples += row.examples;
  acc.claims += row.claims;
  return acc;
}, { docs: 0, questions: 0, examples: 0, claims: 0 });

const markdown = [
  "---",
  "kb_id: blueprint/content-coverage-status",
  'title: "内容覆盖统计"',
  "domain: blueprint",
  "component: project",
  "topic: coverage",
  "difficulty: intermediate",
  "status: reviewed",
  "sidebar_position: 5",
  `version_scope: "Workspace content snapshot generated on ${today}"`,
  `last_verified_at: "${today}"`,
  "source_ids: []",
  "claim_ids: []",
  "---",
  "",
  "# 说明",
  "",
  "这页只跟踪覆盖规模和整理状态，不再把数量达标直接称为深度闭环。最终质量以人工精修、来源复核、Claim 质量和样例可用性为准。",
  "",
  "# 状态口径",
  "",
  "1. 数量达标：文档、题目、样例、Claim 数量达到阶段性门槛。",
  "2. 基础达标：至少具备文档、题目和 Claim。",
  "3. 待人工精修：存在批量生成或模板化痕迹，不能视为最终完成。",
  "4. 需抽检复核：数量较完整，但仍需要按来源和内容深度抽检。",
  "5. 专题整理中：AI Agent 和大模型专题仍在整理和融合。",
  "",
  "# 当前总量",
  "",
  `1. 文档：${totals.docs}`,
  `2. 题目：${totals.questions}`,
  `3. 样例：${totals.examples}`,
  `4. Claim：${totals.claims}`,
  "",
  "# 当前统计",
  "",
  "| 方向 | 模块 | 文档 | 题目 | 样例 | Claim | 数量状态 | 质量状态 |",
  "| --- | --- | ---: | ---: | ---: | ---: | --- | --- |",
  ...rows.map((row) => `| ${row.track} | ${row.component} | ${row.docs} | ${row.questions} | ${row.examples} | ${row.claims} | ${row.quantityStatus} | ${row.qualityStatus} |`),
  "",
  "# 使用方式",
  "",
  "```powershell",
  "npm.cmd run report:coverage",
  "```",
  "",
].join("\n");

if (shouldWrite) fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "content-coverage-status.md"), markdown, "utf8");
console.log(JSON.stringify({ rows: rows.length, totals }, null, 2));
