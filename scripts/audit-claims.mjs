import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

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

function readYamlRows(filePath) {
  const parsed = yaml.load(fs.readFileSync(filePath, "utf8")) || [];
  return Array.isArray(parsed) ? parsed : [parsed];
}

function loadSourceRows() {
  const rows = [];
  for (const file of walkFiles(path.join(repoRoot, "sources"), (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    for (const row of readYamlRows(file)) rows.push({ ...row, file });
  }
  return rows;
}

function loadClaimRows() {
  const rows = [];
  for (const file of walkFiles(path.join(repoRoot, "claims"), (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    for (const row of readYamlRows(file)) rows.push({ ...row, file });
  }
  return rows;
}

function countBy(rows, getter) {
  const map = new Map();
  for (const row of rows) {
    const key = getter(row) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

const sources = loadSourceRows();
const sourceById = new Map(sources.map((row) => [row.id, row]));
const claims = loadClaimRows();
const generated = claims.filter((row) => String(row.notes || "").includes("generated deep-coverage claim"));
const noSource = claims.filter((row) => !Array.isArray(row.source_ids) || row.source_ids.length === 0);
const communityOnly = claims.filter((row) => Array.isArray(row.source_ids) && row.source_ids.length > 0 && row.source_ids.every((id) => sourceById.get(id)?.source_tier === "trusted-community" || sourceById.get(id)?.trust_level === "trusted-community"));
const highGenerated = generated.filter((row) => row.confidence === "high" || row.status === "reviewed");

const markdown = [
  "---",
  "kb_id: blueprint/claim-quality-audit",
  'title: "Claim 质量审计"',
  "domain: blueprint",
  "component: project",
  "topic: claim-quality-audit",
  "difficulty: intermediate",
  "status: reviewed",
  "sidebar_position: 10",
  `version_scope: "Claim audit generated on ${today}"`,
  `last_verified_at: "${today}"`,
  "source_ids: []",
  "claim_ids: []",
  "---",
  "",
  "# 结论",
  "",
  "Claim 是准确性的核心资产。当前主要问题不是数量不足，而是 generated claim、reviewed/high 标记过强、实践来源和官方来源边界不够清晰。",
  "",
  "# 汇总",
  "",
  `1. Claim 总数：${claims.length}`,
  `2. generated deep-coverage claim：${generated.length}`,
  `3. generated 且 reviewed/high 的 Claim：${highGenerated.length}`,
  `4. 无来源 Claim：${noSource.length}`,
  `5. 仅实践来源 Claim：${communityOnly.length}`,
  "",
  "# 按 status 统计",
  "",
  "| status | 数量 |",
  "| --- | ---: |",
  ...countBy(claims, (row) => row.status).map(([name, count]) => `| ${name} | ${count} |`),
  "",
  "# 按 confidence 统计",
  "",
  "| confidence | 数量 |",
  "| --- | ---: |",
  ...countBy(claims, (row) => row.confidence).map(([name, count]) => `| ${name} | ${count} |`),
  "",
  "# 处理规则",
  "",
  "1. generated claim 后续不能直接保持 reviewed/high，必须人工复核。",
  "2. 仅实践来源的 Claim 可以保留，但要标出适用范围。",
  "3. API、协议、框架行为类 Claim 必须补官方来源。",
  "4. Claim 应尽量原子化，避免把写作建议当成事实 Claim。",
  "",
].join("\n");

if (shouldWrite) fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "claim-quality-audit.md"), markdown, "utf8");
console.log(JSON.stringify({ total: claims.length, generated: generated.length, highGenerated: highGenerated.length, noSource: noSource.length, communityOnly: communityOnly.length }, null, 2));
