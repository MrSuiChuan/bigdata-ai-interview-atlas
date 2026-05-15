import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import yaml from "js-yaml";

const repoRoot = path.resolve(process.cwd());
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, predicate));
    else if (predicate(full, entry.name)) out.push(full);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function parseMarkdown(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: content, content };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length), content };
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
    a2a: "A2A",
    mcp: "MCP",
    autogen: "AutoGen",
    crewai: "CrewAI",
    langgraph: "LangGraph",
    "openai-agents-sdk": "OpenAI Agents SDK",
    "microsoft-agent-framework": "Microsoft Agent Framework",
    "semantic-kernel": "Semantic Kernel",
    "agent-foundations": "Agent Runtime 基础",
    "agent-runtime": "Agent Runtime 基础",
    "agent-patterns": "Agent 工程模式",
    "harness-engineering": "Agent 工程模式",
    "agent-skills": "Agent 工程模式",
    "agentic-ai": "Agent 工程模式",
    "agent-platforms": "Agent 平台与工作流",
    "cli-agent": "Agent 平台与工作流",
    n8n: "Agent 平台与工作流",
    openclaw: "Agent 平台与工作流",
    "agent-cases": "Agent 场景案例",
    "ai-coding-workflow": "Agent 场景案例",
    deepseek: "Agent 场景案例",
    "ai-mental-health-agent": "Agent 场景案例",
    "multi-agent-writing": "Agent 场景案例",
    rag: "Agent 场景案例",
    "video-note-agent": "Agent 场景案例",
    "camel-ai": "多 Agent 框架扩展",
    "generic-agent": "多 Agent 框架扩展",
    "multi-agent-frameworks": "多 Agent 框架扩展",
    pocketflow: "多 Agent 框架扩展",
    "wow-agent": "多 Agent 框架扩展",
    "llm-overview": "LLM 总览",
    transformer: "Transformer",
    tokenizer: "Tokenizer",
    "rag-foundations": "RAG 基础",
    inference: "Inference",
    evaluation: "Evaluation",
    "post-training": "Post-training",
    "prompt-engineering": "Prompt Engineering",
  };
  return map[component] || component || "未分类";
}

function trackFromDomain(domain) {
  if (domain === "bigdata") return "big-data";
  if (domain === "ai-agent") return "ai-agents";
  if (domain === "llm-foundations") return "llm-foundations";
  return domain || "unknown";
}

function rel(file) {
  return path.relative(repoRoot, file).replaceAll("\\", "/");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function countCodeBlocks(text) {
  return [...String(text).matchAll(/```([a-zA-Z0-9_-]*)\n/g)].map((m) => m[1] || "text");
}

const themeChecks = [
  { key: "positioning", label: "定位与不适用场景", patterns: ["解决什么问题", "不适合", "不等于", "边界"] },
  { key: "objects", label: "核心对象", patterns: ["核心对象", "对象", "状态归属", "Topic", "Driver", "NameNode", "Tool"] },
  { key: "flow", label: "执行链路", patterns: ["执行链路", "读写链路", "写入", "读取", "flowchart", "步骤"] },
  { key: "fault", label: "一致性与容错", patterns: ["一致性", "容错", "故障", "恢复", "checkpoint", "副本"] },
  { key: "performance", label: "性能模型", patterns: ["性能", "吞吐", "延迟", "瓶颈", "调优", "Shuffle"] },
  { key: "troubleshooting", label: "生产排障", patterns: ["排障", "定位", "日志", "指标", "EXPLAIN", "trace"] },
  { key: "examples", label: "样例", patterns: ["```", "示例", "mermaid", "SQL", "shell"] },
  { key: "comparison", label: "相邻技术边界", patterns: ["对比", "边界", "区别", "相邻技术", "分工"] },
];

const pageRiskMarkers = {
  interview: ["面试官", "追问", "参考答案", "答案要点", "高频面试", "候选人", "背诵", "怎么回答", "面试题", "这题", "答浅", "真正要答"],
  template: ["本页用于把", "说明系统", "说明请求", "为什么这不是术语题"],
  placeholder: ["TODO", "待补充", "占位", "后续补充", "待完善"],
};

function loadDocs() {
  return walkFiles(path.join(repoRoot, "docs"), (_, name) => name.endsWith(".md"))
    .map((file) => ({ file, ...parseMarkdown(file) }))
    .filter((row) => row.data.kb_id && row.data.domain && row.data.domain !== "blueprint");
}

function loadQuestions() {
  return walkFiles(path.join(repoRoot, "questions"), (_, name) => name.endsWith(".md"))
    .map((file) => ({ file, ...parseMarkdown(file) }))
    .filter((row) => row.data.id);
}

function scoreComponent(row) {
  const baseScore =
    Math.min(row.docs / row.docTarget, 1) * 16 +
      Math.min(row.questions / row.questionTarget, 1) * 14 +
      Math.min(row.examples / row.exampleTarget, 1) * 14 +
      Math.min(row.sources / 4, 1) * 12 +
      Math.min(row.claims / 4, 1) * 10 +
      (row.themeCoverage / themeChecks.length) * 24 +
      row.relatedDocCoverage * 10;
  const pageRiskPenalty = Math.min((row.issueFiles?.length || 0) * 2, 18);
  const score = Math.max(0, Math.round(baseScore - pageRiskPenalty));
  const grade = score >= 90 ? "S" : score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  return { score, grade };
}

function buildQualityRows(docs, questions) {
  const docIds = new Set(docs.map((doc) => String(doc.data.kb_id)));
  const byKey = new Map();

  for (const doc of docs) {
    const key = `${doc.data.domain}/${doc.data.component}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        domain: doc.data.domain,
        track: trackFromDomain(doc.data.domain),
        component: doc.data.component,
        componentLabel: componentLabel(doc.data.component),
        docs: 0,
        docFiles: [],
        questions: 0,
        examples: 0,
        mermaid: 0,
        sourcesSet: new Set(),
        claimsSet: new Set(),
        chars: 0,
        themeHits: new Set(),
        questionRelatedTotal: 0,
        questionRelatedValid: 0,
        issueFiles: [],
      });
    }
    const row = byKey.get(key);
    row.docs += 1;
    row.docFiles.push(rel(doc.file));
    row.chars += doc.content.length;
    const codeBlocks = countCodeBlocks(doc.body);
    row.examples += codeBlocks.length;
    row.mermaid += codeBlocks.filter((lang) => lang === "mermaid").length;
    for (const id of doc.data.source_ids || []) row.sourcesSet.add(id);
    for (const id of doc.data.claim_ids || []) row.claimsSet.add(id);
    for (const check of themeChecks) {
      if (check.patterns.some((pattern) => doc.content.includes(pattern))) row.themeHits.add(check.key);
    }
    const docSources = Array.isArray(doc.data.source_ids) ? doc.data.source_ids : [];
    const docClaims = Array.isArray(doc.data.claim_ids) ? doc.data.claim_ids : [];
    const h3Count = (doc.body.match(/^###\s+/gm) || []).length;
    if (doc.content.length < 2800) row.issueFiles.push(`${rel(doc.file)}：篇幅偏短`);
    if (docSources.length === 0) row.issueFiles.push(`${rel(doc.file)}：缺少来源`);
    if (docSources.length > 0 && docSources.length < 2) row.issueFiles.push(`${rel(doc.file)}：来源偏弱`);
    if (docClaims.length === 0) row.issueFiles.push(`${rel(doc.file)}：缺少 Claim`);
    if (doc.content.length > 3000 && h3Count === 0) row.issueFiles.push(`${rel(doc.file)}：结构过平`);
    if (pageRiskMarkers.interview.some((marker) => doc.content.includes(marker))) row.issueFiles.push(`${rel(doc.file)}：混入面试化表达`);
    if (pageRiskMarkers.template.some((marker) => doc.content.includes(marker))) row.issueFiles.push(`${rel(doc.file)}：模板化表达`);
    if (pageRiskMarkers.placeholder.some((marker) => doc.content.includes(marker))) row.issueFiles.push(`${rel(doc.file)}：存在占位内容`);
  }

  for (const question of questions) {
    const key = `${question.data.domain}/${question.data.component}`;
    if (!byKey.has(key)) continue;
    const row = byKey.get(key);
    row.questions += 1;
    const related = Array.isArray(question.data.related_docs) ? question.data.related_docs : [];
    row.questionRelatedTotal += Math.max(related.length, 1);
    row.questionRelatedValid += related.filter((id) => docIds.has(String(id))).length;
  }

  return [...byKey.values()]
    .map((row) => {
      const docTarget = row.domain === "bigdata" ? 12 : row.domain === "ai-agent" ? 3 : 2;
      const questionTarget = row.domain === "bigdata" ? 20 : row.domain === "ai-agent" ? 5 : 3;
      const exampleTarget = row.domain === "bigdata" ? 12 : row.domain === "ai-agent" ? 4 : 3;
      const normalized = {
        ...row,
        docTarget,
        questionTarget,
        exampleTarget,
        sources: row.sourcesSet.size,
        claims: row.claimsSet.size,
        themeCoverage: row.themeHits.size,
        missingThemes: themeChecks.filter((check) => !row.themeHits.has(check.key)).map((check) => check.label),
        relatedDocCoverage: row.questionRelatedTotal ? row.questionRelatedValid / row.questionRelatedTotal : 0,
      };
      const scored = scoreComponent(normalized);
      return {
        key: normalized.key,
        track: normalized.track,
        domain: normalized.domain,
        component: normalized.component,
        componentLabel: normalized.componentLabel,
        grade: scored.grade,
        score: scored.score,
        docs: normalized.docs,
        docTarget,
        questions: normalized.questions,
        questionTarget,
        examples: normalized.examples,
        exampleTarget,
        mermaid: normalized.mermaid,
        sources: normalized.sources,
        claims: normalized.claims,
        chars: normalized.chars,
        avgChars: Math.round(normalized.chars / Math.max(normalized.docs, 1)),
        themeCoverage: normalized.themeCoverage,
        themeTotal: themeChecks.length,
        missingThemes: normalized.missingThemes,
        relatedDocCoverage: Number(normalized.relatedDocCoverage.toFixed(3)),
        issueFiles: normalized.issueFiles.slice(0, 8),
        primaryDoc: normalized.docFiles.find((file) => file.endsWith("/release-quality-guide.md")) || normalized.docFiles[0],
      };
    })
    .sort((a, b) => a.track.localeCompare(b.track) || a.componentLabel.localeCompare(b.componentLabel));
}

function buildQuestionAudit(docs, questions) {
  const docIds = new Set(docs.map((doc) => String(doc.data.kb_id)));
  const docTextById = new Map(docs.map((doc) => [String(doc.data.kb_id), doc.body]));
  const rows = questions.map((question) => {
    const related = Array.isArray(question.data.related_docs) ? question.data.related_docs.map(String) : [];
    const missing = related.filter((id) => !docIds.has(id));
    const relatedText = related.map((id) => docTextById.get(id) || "").join("\n");
    const questionTerms = unique(String(question.body).match(/[A-Za-z][A-Za-z0-9_-]{3,}|[\u4e00-\u9fa5]{2,}/g) || []);
    const weakSignals = questionTerms.filter((term) => term.length >= 4 && !relatedText.includes(term)).slice(0, 10);
    return {
      id: question.data.id,
      file: rel(question.file),
      title: question.data.title,
      domain: question.data.domain,
      component: question.data.component,
      relatedCount: related.length,
      missingRelated: missing,
      weakSignals,
    };
  });
  return {
    rows,
    noRelated: rows.filter((row) => row.relatedCount === 0),
    missingRelated: rows.filter((row) => row.missingRelated.length > 0),
    weakSupport: rows.filter((row) => row.relatedCount > 0 && row.weakSignals.length >= 8).slice(0, 80),
  };
}

function markdownTable(rows) {
  return [
    "| 方向 | 组件 | 等级 | 分数 | 文档 | 题目 | 示例 | 来源 | Claim | 主题覆盖 | 题目映射 | 缺口 |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |",
    ...rows.map((row) => `| ${row.track} | ${row.componentLabel} | ${row.grade} | ${row.score} | ${row.docs}/${row.docTarget} | ${row.questions}/${row.questionTarget} | ${row.examples}/${row.exampleTarget} | ${row.sources} | ${row.claims} | ${row.themeCoverage}/${row.themeTotal} | ${Math.round(row.relatedDocCoverage * 100)}% | ${row.missingThemes.join("、") || "无"} |`),
  ].join("\n");
}

function buildStandardDoc() {
  return `---
kb_id: blueprint/component-quality-standard
title: "组件发布级质量标准"
domain: blueprint
component: project
topic: component-quality-standard
difficulty: advanced
status: reviewed
sidebar_position: 12
version_scope: "Workspace quality standard generated on ${today}"
last_verified_at: "${today}"
source_ids: []
claim_ids: []
---

# 目标

知识库负责详细解读技术，题库负责基于知识库训练表达。组件达标不是看字数，而是看能否支撑真实学习、排障、系统设计和面试追问。

# 发布级组件必须覆盖的 10 个维度

${themeChecks.map((item, index) => `${index + 1}. ${item.label}`).join("\n")}
9. 版本边界：说明内容基于哪个版本、官方文档或实践范围。
10. 来源依据：关键结论必须能追溯到 source 或 claim。

# 等级定义

1. S：内容完整、题库映射充分、有示例和排障闭环，可作为主推组件。
2. A：核心链路完整，少量深水区仍需人工精修。
3. B：能学习和刷题，但系统设计、排障或示例有缺口。
4. C：内容可用但不够深，不能作为高阶面试主线。
5. D：只能作为占位或候选，需要重构。

# 使用规则

1. 先补知识库，再补题库。
2. 题库结论不能明显超出知识库。
3. 实践来源可以吸收为通用经验，但不能覆盖官方事实。
4. 高风险、版本相关、协议相关结论必须保留来源和边界。
`;
}

function buildAuditDoc(rows) {
  const summary = {
    components: rows.length,
    s: rows.filter((row) => row.grade === "S").length,
    a: rows.filter((row) => row.grade === "A").length,
    b: rows.filter((row) => row.grade === "B").length,
    c: rows.filter((row) => row.grade === "C").length,
    d: rows.filter((row) => row.grade === "D").length,
  };
  const weakest = [...rows].sort((a, b) => a.score - b.score).slice(0, 12);
  return `---
kb_id: blueprint/component-quality-audit
title: "组件质量盘点报告"
domain: blueprint
component: project
topic: component-quality-audit
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: "Workspace component quality audit generated on ${today}"
last_verified_at: "${today}"
source_ids: []
claim_ids: []
---

# 汇总

1. 组件数：${summary.components}
2. S 级：${summary.s}
3. A 级：${summary.a}
4. B 级：${summary.b}
5. C 级：${summary.c}
6. D 级：${summary.d}

# 组件质量表

${markdownTable(rows)}

# 优先补强队列

${weakest.map((row, index) => `${index + 1}. ${row.componentLabel}：${row.grade} / ${row.score} 分，缺口：${row.missingThemes.join("、") || "主要是题库或示例覆盖"}`).join("\n")}

# 处理原则

1. S/A 组件进入精修和真实面试训练闭环。
2. B 组件优先补示例、排障和系统设计边界。
3. C/D 组件先补发布级知识指南，再补题库。
4. 如果题库比知识库讲得更深，必须回补知识库。
`;
}

function buildQuestionAuditDoc(audit) {
  return `---
kb_id: blueprint/question-to-knowledge-audit
title: "题库到知识库映射审计"
domain: blueprint
component: project
topic: question-to-knowledge-audit
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: "Workspace question mapping audit generated on ${today}"
last_verified_at: "${today}"
source_ids: []
claim_ids: []
---

# 汇总

1. 题目总数：${audit.rows.length}
2. 没有关联知识库的题目：${audit.noRelated.length}
3. 关联文档不存在的题目：${audit.missingRelated.length}
4. 可能需要回补知识库的题目样本：${audit.weakSupport.length}

# 关联文档不存在

${audit.missingRelated.length ? audit.missingRelated.map((row) => `- ${row.id}：${row.missingRelated.join("、")}`).join("\n") : "无。"}

# 可能需要回补知识库的题目样本

这些不是硬失败，而是提醒：题目正文中有较多词没有在关联知识库里直接出现，后续人工精修时应检查题库是否超出知识库。

${audit.weakSupport.length ? audit.weakSupport.slice(0, 40).map((row) => `- ${row.id}：${row.title}`).join("\n") : "无。"}
`;
}

function buildQualityData(rows) {
  const gradeOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
  const sorted = [...rows].sort((a, b) => gradeOrder[a.grade] - gradeOrder[b.grade] || b.score - a.score);
  const summary = {
    total: rows.length,
    byGrade: Object.fromEntries(["S", "A", "B", "C", "D"].map((grade) => [grade, rows.filter((row) => row.grade === grade).length])),
    avgScore: Math.round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(rows.length, 1)),
    generatedAt: today,
  };
  const byTrackComponent = Object.fromEntries(sorted.map((row) => [`${row.track}/${row.componentLabel}`, row]));
  return [
    `export const qualitySummary = ${JSON.stringify(summary, null, 2)};`,
    `export const componentQuality = ${JSON.stringify(sorted, null, 2)};`,
    `export const componentQualityByTrackAndComponent = ${JSON.stringify(byTrackComponent, null, 2)};`,
    "",
  ].join("\n");
}

const docs = loadDocs();
const questions = loadQuestions();
const rows = buildQualityRows(docs, questions);
const questionAudit = buildQuestionAudit(docs, questions);

if (shouldWrite) {
  fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "component-quality-standard.md"), buildStandardDoc(), "utf8");
  fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "component-quality-audit.md"), buildAuditDoc(rows), "utf8");
  fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "question-to-knowledge-audit.md"), buildQuestionAuditDoc(questionAudit), "utf8");
  fs.writeFileSync(path.join(repoRoot, "web", "docs-site", "src", "data", "quality.js"), buildQualityData(rows), "utf8");
}

const summary = {
  components: rows.length,
  docs: docs.length,
  questions: questions.length,
  gradeS: rows.filter((row) => row.grade === "S").length,
  gradeA: rows.filter((row) => row.grade === "A").length,
  gradeB: rows.filter((row) => row.grade === "B").length,
  gradeC: rows.filter((row) => row.grade === "C").length,
  gradeD: rows.filter((row) => row.grade === "D").length,
  questionsWithoutRelatedDocs: questionAudit.noRelated.length,
  questionsWithMissingRelatedDocs: questionAudit.missingRelated.length,
};

console.log(JSON.stringify(summary, null, 2));

if (questionAudit.missingRelated.length > 0) process.exitCode = 1;
