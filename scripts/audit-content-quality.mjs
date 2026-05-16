import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");

const generatedComponents = ["hdfs", "yarn", "hbase", "trino", "hudi", "delta-lake", "clickhouse"];
const generatedDocPhrase = "为什么这不是术语题";
const generatedQuestionPhrase = "不能只回答术语定义";
const conceptualExamplePhrase = "概念性样例";
const generatedClaimPhrase = "generated deep-coverage claim";

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

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function parseFrontmatter(file) {
  const content = read(file);
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: content };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length) };
}

function countPattern(files, pattern) {
  return files.reduce((sum, file) => sum + (read(file).includes(pattern) ? 1 : 0), 0);
}

function countPatternOccurrences(files, pattern) {
  return files.reduce((sum, file) => sum + (read(file).split(pattern).length - 1), 0);
}

function sourceStats(files) {
  const stats = { total: 0, zero: 0, single: 0, multi: 0 };
  for (const file of files) {
    const { data } = parseFrontmatter(file);
    const sources = Array.isArray(data.source_ids) ? data.source_ids : [];
    stats.total += 1;
    if (sources.length === 0) stats.zero += 1;
    else if (sources.length === 1) stats.single += 1;
    else stats.multi += 1;
  }
  return stats;
}

function groupQuestionTypes() {
  const out = new Map();
  for (const file of walkFiles(path.join(repoRoot, "questions"), (_, name) => name.endsWith(".md"))) {
    const { data } = parseFrontmatter(file);
    const type = data.question_type || "(missing)";
    out.set(type, (out.get(type) || 0) + 1);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

function missingCategories() {
  const dir = path.join(repoRoot, "docs", "bigdata");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !fs.existsSync(path.join(dir, name, "_category_.json")))
    .sort();
}

function claimStats() {
  const rows = [];
  for (const file of walkFiles(path.join(repoRoot, "claims"), (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    const parsed = yaml.load(read(file)) || [];
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) rows.push({ ...item, file });
  }
  const byStatus = new Map();
  const byConfidence = new Map();
  let generated = 0;
  let noSource = 0;
  let communityOnly = 0;
  const communityIds = new Set(loadSourceIds(path.join(repoRoot, "sources", "community")));
  for (const row of rows) {
    byStatus.set(row.status || "(missing)", (byStatus.get(row.status || "(missing)") || 0) + 1);
    byConfidence.set(row.confidence || "(missing)", (byConfidence.get(row.confidence || "(missing)") || 0) + 1);
    if (String(row.notes || "").includes(generatedClaimPhrase)) generated += 1;
    const sources = Array.isArray(row.source_ids) ? row.source_ids : [];
    if (!sources.length) noSource += 1;
    if (sources.length && sources.every((id) => communityIds.has(id))) communityOnly += 1;
  }
  return {
    total: rows.length,
    generated,
    noSource,
    communityOnly,
    byStatus: [...byStatus.entries()].sort((a, b) => b[1] - a[1]),
    byConfidence: [...byConfidence.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function loadSourceIds(dir) {
  const ids = [];
  for (const file of walkFiles(dir, (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    const parsed = yaml.load(read(file)) || [];
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    for (const row of rows) if (row?.id) ids.push(row.id);
  }
  return ids;
}

function buildReport() {
  const generatedDocFiles = generatedComponents.flatMap((component) =>
    walkFiles(path.join(repoRoot, "docs", "bigdata", component), (_, name) => name.endsWith(".md"))
  );
  const generatedQuestionFiles = generatedComponents.flatMap((component) =>
    walkFiles(path.join(repoRoot, "questions", "bigdata", component), (_, name) => name.endsWith(".md"))
  );
  const generatedExampleFiles = [
    ...generatedComponents.flatMap((component) => walkFiles(path.join(repoRoot, "examples", "python", component), () => true)),
    ...generatedComponents.flatMap((component) => walkFiles(path.join(repoRoot, "examples", "sql", component), () => true)),
  ];
  const allDocs = walkFiles(path.join(repoRoot, "docs"), (_, name) => name.endsWith(".md"));
  const allQuestions = walkFiles(path.join(repoRoot, "questions"), (_, name) => name.endsWith(".md"));
  const claims = claimStats();
  const generatedDocSourceStats = sourceStats(generatedDocFiles);
  const generatedQuestionSourceStats = sourceStats(generatedQuestionFiles);
  const generatedDocTemplateHits = countPattern(generatedDocFiles, generatedDocPhrase);
  const generatedQuestionTemplateHits = countPattern(generatedQuestionFiles, generatedQuestionPhrase);
  const conceptualExamples = countPattern(generatedExampleFiles, conceptualExamplePhrase);
  const missingCategoryCount = missingCategories().length;
  const qualityConclusion =
    generatedDocTemplateHits === 0 && generatedQuestionTemplateHits === 0 && conceptualExamples === 0 && claims.generated === 0 && missingCategoryCount === 0
      ? "结构化审计未发现模板化文档、模板化题目、概念性样例、generated claim 或缺失组件分类。后续重点从“清理占位内容”转为“继续按官方来源做深度复核和持续更新”。"
      : "这份报告只反映结构化审计结果，不代表内容已经人工精修完成。当前系统可以构建和运行，但仍存在批量生成内容、单一来源、Claim 状态过强、前端收录缺口等问题。";

  const lines = [
    "---",
    "kb_id: blueprint/content-quality-audit",
    'title: "内容质量审计"',
    "domain: blueprint",
    "component: project",
    "topic: content-quality-audit",
    "difficulty: intermediate",
    "status: reviewed",
    "sidebar_position: 8",
    `version_scope: "Workspace audit generated on ${new Date().toISOString().slice(0, 10)}"`,
    `last_verified_at: "${new Date().toISOString().slice(0, 10)}"`,
    "source_ids: []",
    "claim_ids: []",
    "---",
    "",
    "# 结论",
    "",
    qualityConclusion,
    "",
    "# 核心风险",
    "",
    `1. 批量组件文档命中模板短语：${generatedDocTemplateHits} / ${generatedDocFiles.length}`,
    `2. 批量组件题目命中模板短语：${generatedQuestionTemplateHits} / ${generatedQuestionFiles.length}`,
    `3. 概念性样例命中数量：${conceptualExamples} / ${generatedExampleFiles.length}`,
    `4. generated deep-coverage claim 数量：${claims.generated} / ${claims.total}`,
    `5. 批量组件文档单一来源：${generatedDocSourceStats.single} / ${generatedDocSourceStats.total}`,
    `6. 批量组件题目单一来源：${generatedQuestionSourceStats.single} / ${generatedQuestionSourceStats.total}`,
    `7. Claim 无来源数量：${claims.noSource}`,
    `8. 仅社区来源 Claim 数量：${claims.communityOnly}`,
    "",
    "# 题型分布",
    "",
    "| question_type | 数量 |",
    "| --- | ---: |",
    ...groupQuestionTypes().map(([type, count]) => `| ${type} | ${count} |`),
    "",
    "# 缺少 _category_.json 的大数据组件",
    "",
    ...missingCategories().map((name) => `- ${name}`),
    "",
    "# Claim 状态分布",
    "",
    "| status | 数量 |",
    "| --- | ---: |",
    ...claims.byStatus.map(([status, count]) => `| ${status} | ${count} |`),
    "",
    "# Claim 置信度分布",
    "",
    "| confidence | 数量 |",
    "| --- | ---: |",
    ...claims.byConfidence.map(([confidence, count]) => `| ${confidence} | ${count} |`),
    "",
    "# 后续处理原则",
    "",
    "1. 数量达标不能等同于人工精修达标。",
    "2. generated claim 不应直接作为 high confidence 的事实依据。",
    "3. 实践来源可用于补充学习路径和项目经验，但协议、API、版本行为仍需要官方来源交叉确认。",
    "4. 批量生成内容必须进入人工精修队列，不能继续标记为最终完成。",
    "",
  ];

  return {
    markdown: lines.join("\n"),
    summary: {
      docs: allDocs.length,
      questions: allQuestions.length,
      generatedDocs: generatedDocFiles.length,
      generatedQuestions: generatedQuestionFiles.length,
      generatedDocTemplateHits,
      generatedQuestionTemplateHits,
      conceptualExamples,
      generatedClaims: claims.generated,
      claimTotal: claims.total,
      missingCategories: missingCategoryCount,
    },
  };
}

const report = buildReport();
if (shouldWrite) {
  const outPath = path.join(repoRoot, "internal", "blueprint", "content-quality-audit.md");
  fs.writeFileSync(outPath, report.markdown, "utf8");
}
console.log(JSON.stringify(report.summary, null, 2));


