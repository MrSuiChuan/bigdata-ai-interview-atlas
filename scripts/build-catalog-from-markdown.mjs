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

function parseMarkdown(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: content };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length) };
}

function trackFromDomain(domain) {
  if (domain === "bigdata") return "big-data";
  if (domain === "ai-agent") return "ai-agents";
  if (domain === "llm-foundations") return "llm-foundations";
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

function difficultyLabel(value) {
  const map = { beginner: "初级", intermediate: "中级", advanced: "高级", expert: "高级" };
  return map[value] || value || "中级";
}

function typeLabel(value) {
  const map = {
    principle: "原理题",
    "system-design": "系统设计题",
    system_design: "系统设计题",
    scenario: "系统设计题",
    tradeoff: "对比题",
    comparison: "对比题",
    troubleshooting: "排障题",
    operations: "运维治理题",
    failure: "故障恢复题",
    security: "安全治理题",
    short_answer: "简答题",
  };
  return map[value] || value || "简答题";
}

function defaultJobs(track) {
  if (track === "big-data") return ["大数据开发", "数据平台", "实时数仓"];
  if (track === "ai-agents") return ["Agent 工程", "AI 应用工程", "RAG 工程"];
  if (track === "llm-foundations") return ["AI 应用工程", "Agent 工程", "RAG 工程"];
  return ["AI 工程", "数据工程", "后端工程"];
}

function splitSections(body) {
  const sections = new Map();
  let current = "正文";
  let buffer = [];
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (match) {
      sections.set(current, buffer.join("\n").trim());
      current = match[1].trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  sections.set(current, buffer.join("\n").trim());
  return sections;
}

function findSection(sections, names) {
  for (const [key, value] of sections.entries()) {
    if (names.some((name) => key.includes(name))) return value;
  }
  return "";
}

function cleanText(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitParagraphs(text) {
  return String(text || "")
    .split(/\r?\n\s*\r?\n/)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function listItems(text, fallback = []) {
  const items = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+?)\s*$/);
    if (match) items.push(cleanText(match[1]));
  }
  return items.filter(Boolean).slice(0, 8).length ? items.filter(Boolean).slice(0, 8) : fallback;
}

function firstSentence(text, fallback) {
  const cleaned = cleanText(text);
  if (!cleaned) return fallback;
  const match = cleaned.match(/^(.{20,180}?[。！？.!?])/);
  return match ? match[1] : cleaned.slice(0, 180);
}

function relatedDocs(data, docRouteMap = new Map()) {
  const docs = Array.isArray(data.related_docs) ? data.related_docs : [];
  return docs.map((doc) => {
    const id = String(doc);
    return { label: id.split("/").slice(-2).join(" / "), href: docRouteMap.get(id) || `/docs/${id}` };
  });
}

function docLabel(data, file) {
  if (data.title) return String(data.title).replace(/^"|"$/g, "");
  return path.basename(file, ".md").replaceAll("-", " ");
}

function docHref(data, file) {
  const docsRoot = path.join(repoRoot, "docs");
  const relative = path.relative(docsRoot, file).replaceAll(path.sep, "/").replace(/\.mdx?$/, "");
  if (relative && !relative.startsWith("..")) return `/docs/${relative.replace(/\/index$/, "")}`;
  if (!data.kb_id) return "";
  return `/docs/${String(data.kb_id).replace(/\/index$/, "")}`;
}

function loadSourceMap() {
  const map = new Map();
  const roots = [
    ["official", path.join(repoRoot, "sources", "official")],
    ["trusted-community", path.join(repoRoot, "sources", "community")],
  ];

  for (const [defaultTier, dir] of roots) {
    for (const file of walkFiles(dir, (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
      const parsed = yaml.load(fs.readFileSync(file, "utf8")) || [];
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const row of rows) {
        if (!row?.id) continue;
        map.set(row.id, {
          title: row.title || row.id,
          tier: row.source_tier || row.trust_level || defaultTier,
        });
      }
    }
  }

  return map;
}

const sourceMap = loadSourceMap();

function sourceInfo(sourceIds) {
  const tiers = Array.from(new Set(sourceIds.map((id) => normalizeSourceTier(sourceMap.get(id)?.tier || "unknown"))));
  const labels = sourceIds.map((id) => sourceDisplayLabel(id));
  let category = "unknown";
  if (tiers.length === 1 && tiers[0] === "trusted-community") category = "trusted-community";
  else if (tiers.length === 1 && tiers[0] === "official") category = "official";
  else if (tiers.length > 1 && tiers.includes("trusted-community")) category = "mixed";
  else if (tiers.length > 0) category = tiers[0];
  return { tiers, labels, category };
}

function normalizeSourceTier(tier) {
  if (tier === "official" || tier === "primary" || tier === "vendor") return "official";
  if (tier === "trusted-community") return "trusted-community";
  return tier || "unknown";
}

function sourceDisplayLabel(id) {
  const tier = normalizeSourceTier(sourceMap.get(id)?.tier || "unknown");
  if (tier === "trusted-community") return "实践来源";
  return sourceMap.get(id)?.title || id;
}

function sanitizeVisibleText(text) {
  return String(text)
    .replace(/Datawhale\s*/gi, "")
    .replace(/可信社区/g, "实践来源")
    .replace(/社区共学/g, "实践资料")
    .replace(/社区项目/g, "实践项目")
    .replace(/社区内容/g, "实践内容")
    .replace(/trusted-community/g, "实践来源")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeTrackCatalogForFrontend(value) {
  if (typeof value === "string") return sanitizeVisibleText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeTrackCatalogForFrontend(item)).filter((item) => item !== "");
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeTrackCatalogForFrontend(item)]));
  }
  return value;
}

function buildQuestionFromMarkdown(file, existing, docRouteMap = new Map()) {
  const { data, body } = parseMarkdown(file);
  const track = trackFromDomain(data.domain);
  const sections = splitSections(body);
  const prompt = findSection(sections, ["题目"]);
  const conclusion = findSection(sections, ["一句话结论", "结论"]);
  const intent = findSection(sections, ["这题想考什么", "考点"]);
  const outline = findSection(sections, ["回答主线", "作答主线", "答题主线"]);
  const reference = findSection(sections, ["参考作答", "参考回答", "参考答案"]);
  const fieldSignalsText = findSection(sections, ["现场判断抓手", "现场抓手", "判断抓手"]);
  const standard = findSection(sections, ["标准答案", "参考答案"]);
  const core = findSection(sections, ["核心机制", "核心原理", "原理", "核心"]);
  const designMotivation = findSection(sections, ["设计动机", "为什么会有这个机制"]);
  const keyObjectsText = findSection(sections, ["关键对象与状态", "核心对象"]);
  const fullFlowText = findSection(sections, ["完整链路", "执行链路"]);
  const guaranteesText = findSection(sections, ["系统保证项", "保证项"]);
  const nonGuaranteesText = findSection(sections, ["边界与不保证项", "不保证项", "边界"]);
  const failureText = findSection(sections, ["故障场景"]);
  const tradeoffText = findSection(sections, ["代价与权衡", "权衡"]);
  const interviewAnswer = findSection(sections, ["面试表达"]);
  const score = findSection(sections, ["必答点", "评分点", "得分点"]);
  const mistakes = findSection(sections, ["常见误答", "常见误区", "误区"]);
  const follow = findSection(sections, ["延伸追问", "追问"]);

  const answerOutline = listItems(
    outline,
    listItems(score, ["先说明它解决什么问题", "再说明关键链路或状态边界", "最后补故障、取舍和适用条件"])
  );
  const referenceAnswerText =
    reference || standard || interviewAnswer || [conclusion, core, designMotivation].filter(Boolean).join("\n\n");
  const summary = firstSentence(
    conclusion || intent || referenceAnswerText || core || body,
    data.title || "题目摘要待补充"
  );
  const standardAnswer = cleanText(referenceAnswerText) || summary;
  const sourceIds = Array.isArray(data.source_ids) ? data.source_ids : [];
  const sources = sourceInfo(sourceIds);

  const generated = {
    id: data.id,
    title: data.title || data.id,
    track,
    component: componentLabel(data.component),
    topic: data.topic || "未分类",
    type: typeLabel(data.question_type),
    difficulty: difficultyLabel(data.difficulty),
    jobs: defaultJobs(track),
    minutes: Number(data.estimated_minutes || 8),
    status: data.status || "reviewed",
    detailHref: `/questions?focus=${encodeURIComponent(data.id)}`,
    prompt: cleanText(prompt || data.title || data.id),
    conclusion: cleanText(conclusion),
    questionIntent: splitParagraphs(intent || designMotivation),
    answerOutline,
    referenceAnswer: splitParagraphs(referenceAnswerText),
    fieldSignals: listItems(
      fieldSignalsText,
      listItems(keyObjectsText || fullFlowText || guaranteesText || nonGuaranteesText, [
        "回到关键对象和状态判断",
        "结合链路与版本边界核对",
        "用日志、指标或计划交叉验证",
      ])
    ),
    summary,
    standardAnswer,
    scorePoints: answerOutline,
    commonMistakes: listItems(mistakes, ["只背概念", "不讲边界", "不结合故障或工程场景"]),
    followUps: listItems(follow, ["这个机制失效时怎么排查？", "生产环境里主要权衡是什么？"]),
    designMotivation: splitParagraphs(designMotivation),
    coreMechanism: splitParagraphs(core),
    keyObjects: listItems(keyObjectsText),
    fullFlow: listItems(fullFlowText),
    guarantees: listItems(guaranteesText),
    nonGuarantees: listItems(nonGuaranteesText),
    boundaries: listItems(nonGuaranteesText),
    failureScenarios: listItems(failureText),
    tradeoffs: listItems(tradeoffText),
    interviewAnswer: splitParagraphs(interviewAnswer),
    relatedDocs: relatedDocs(data, docRouteMap),
    sourceIds,
    sourceTiers: sources.tiers,
    sourceLabels: sources.labels,
    sourceCategory: sources.category,
    claimIds: Array.isArray(data.claim_ids) ? data.claim_ids : [],
  };

  if (!existing) return generated;
  return {
    ...generated,
    ...existing,
    title: generated.title,
    track: generated.track,
    component: generated.component,
    topic: generated.topic,
    type: generated.type,
    difficulty: generated.difficulty,
    jobs: generated.jobs,
    minutes: generated.minutes,
    status: generated.status,
    detailHref: generated.detailHref,
    prompt: generated.prompt,
    conclusion: generated.conclusion,
    questionIntent: generated.questionIntent,
    answerOutline: generated.answerOutline,
    referenceAnswer: generated.referenceAnswer,
    fieldSignals: generated.fieldSignals,
    summary: generated.summary,
    standardAnswer: generated.standardAnswer,
    scorePoints: generated.scorePoints,
    commonMistakes: generated.commonMistakes,
    followUps: generated.followUps,
    designMotivation: generated.designMotivation,
    coreMechanism: generated.coreMechanism,
    keyObjects: generated.keyObjects,
    fullFlow: generated.fullFlow,
    guarantees: generated.guarantees,
    nonGuarantees: generated.nonGuarantees,
    boundaries: generated.boundaries,
    failureScenarios: generated.failureScenarios,
    tradeoffs: generated.tradeoffs,
    interviewAnswer: generated.interviewAnswer,
    sourceIds: generated.sourceIds,
    sourceTiers: generated.sourceTiers,
    sourceLabels: generated.sourceLabels,
    sourceCategory: generated.sourceCategory,
    claimIds: generated.claimIds,
    relatedDocs: generated.relatedDocs,
  };
}
function uniqueOptions(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

function loadMarkdownDocs() {
  return walkFiles(path.join(repoRoot, "docs"), (_, name) => name.endsWith(".md"))
    .map((file) => ({ file, ...parseMarkdown(file) }))
    .filter((row) => row.data?.kb_id && row.data.domain !== "blueprint" && !row.data.kb_id.startsWith("blueprint/"))
    .map((row) => ({
      id: row.data.kb_id,
      track: trackFromDomain(row.data.domain),
      component: componentLabel(row.data.component),
      label: docLabel(row.data, row.file),
      href: docHref(row.data, row.file),
      order: Number(row.data.sidebar_position || 999),
    }))
    .filter((row) => row.href)
    .sort((a, b) => a.track.localeCompare(b.track) || a.component.localeCompare(b.component) || a.order - b.order || a.label.localeCompare(b.label));
}

function buildDocRouteMap(docs) {
  return new Map(docs.map((doc) => [doc.id, doc.href]));
}

function removeArchivedTracks(trackCatalog) {
  return Object.fromEntries(Object.entries(trackCatalog).filter(([key]) => key !== "community"));
}

function ensureModule(track, module) {
  if ((track.modules || []).some((item) => item.title === module.title)) return track;
  return { ...track, modules: [...(track.modules || []), module] };
}

function ensureSupportingModules(trackCatalog) {
  let next = trackCatalog;
  if (next["ai-agents"]) {
    let ai = next["ai-agents"];
    const aiModules = [
      {
        title: "Agent Runtime 基础",
        status: "已入库",
        level: "运行时、状态、工具和多 Agent 基础",
        summary: "把 Agent 的执行循环、工具调用、状态、记忆、handoff、治理和系统设计放在同一条基础线上。",
        docs: [],
        questions: [],
        tags: ["Agent Runtime", "Tool Use", "Memory", "Handoff", "System Design"],
      },
      {
        title: "Agent 工程模式",
        status: "已入库",
        level: "从 RAG 到长任务 Agent 的工程模式",
        summary: "覆盖检索、记忆、工具、结构化输出、长任务恢复、权限、安全、评估和成本延迟治理。",
        docs: [],
        questions: [],
        tags: ["RAG", "Memory", "Tool Surface", "Guardrails", "Tracing"],
      },
      {
        title: "Semantic Kernel",
        status: "已入库",
        level: "AI 中间件与 Agent 编排框架",
        summary: "从 plugin、process、agent orchestration 和 observability 视角理解 Semantic Kernel 的工程定位。",
        docs: [],
        questions: [],
        tags: ["Semantic Kernel", "Plugin", "Process", "Orchestration"],
      },
      {
        title: "Agent 平台与工作流",
        status: "已入库",
        level: "低代码平台、CLI 工具层和本地模型运行时",
        summary: "把 Dify、Coze、n8n、Ollama、OpenClaw、AnyCLI 等平台型内容归到资源、工作流、插件和安全边界下理解。",
        docs: [],
        questions: [],
        tags: ["Dify", "Coze", "n8n", "Ollama", "CLI", "Gateway"],
      },
      {
        title: "Agent 场景案例",
        status: "已入库",
        level: "工程实践到面试表达",
        summary: "把工程实践整理成可复盘的案例，重点说明目标、链路、风险、评估和不能泛化的边界。",
        docs: [],
        questions: [],
        tags: ["Case Study", "RAG", "AI Coding", "Safety"],
      },
      {
        title: "多 Agent 框架扩展",
        status: "已入库",
        level: "多智能体框架和轻量编排",
        summary: "覆盖 CAMEL-AI、PocketFlow、GenericAgent、wow-agent、MetaGPT/Lagent 等框架的角色、状态、工具和协作边界。",
        docs: [],
        questions: [],
        tags: ["Multi-Agent", "CAMEL-AI", "PocketFlow", "MetaGPT", "Lagent"],
      },
    ];
    for (const module of aiModules) ai = ensureModule(ai, module);
    next = { ...next, "ai-agents": ai };
  }
  return next;
}

function trackMeta(trackKey) {
  const defaults = {
    "big-data": {
      slug: "big-data",
      title: "大数据主线",
      eyebrow: "Big Data Track",
      description: "把消息、计算、数仓、湖仓表格式、存储、资源调度和分析引擎放到同一张知识图谱里理解。",
      focus: "适合准备大数据开发、数据平台、实时数仓、湖仓平台和数据基础设施方向的面试。",
      accent: "green",
      principles: [
        "知识库先解释组件定位、核心对象、执行链路、状态边界和生产证据。",
        "题库基于知识库生成，用来检查能否把原理讲成可复核的工程判断。",
        "涉及版本差异、语义保证和生产限制时，必须回到来源与组件边界。",
      ],
      roadmap: [
        "继续补齐组件内的高频机制页、故障页和系统设计页。",
        "把每个知识点映射到题库、追问和可观测证据。",
        "定期运行内容质量审计，清理模板化表达和弱证据表述。",
      ],
    },
    "ai-agents": {
      slug: "ai-agents",
      title: "AI Agent 主线",
      eyebrow: "AI Agent Track",
      description: "围绕 Agent 运行时、工具调用、状态、记忆、多 Agent 协作、框架选型、评估和生产治理建立知识体系。",
      focus: "适合准备 Agent 工程、AI 应用工程、RAG 工程、AI 平台和智能体系统设计方向的面试。",
      accent: "amber",
      principles: [
        "不要把 Agent 简化成聊天机器人，要解释运行循环、工具、状态、编排和观测。",
        "框架内容必须区分官方语义、实践模式和项目案例，避免把经验写成绝对规则。",
        "安全、权限、成本、延迟、评估和人工介入要作为生产边界一起说明。",
      ],
      roadmap: [
        "继续把运行时基础、协议、框架、工程模式和案例整理成可复习链路。",
        "将知识库内容沉淀为系统设计题、排障题、对比题和开放追问。",
        "补充跨框架对比和生产治理证据，减少只讲概念的页面。",
      ],
    },
    "llm-foundations": {
      slug: "llm-foundations",
      title: "大模型基础主线",
      eyebrow: "LLM Foundations",
      description: "把 Transformer、Tokenizer、训练、后训练、推理、RAG、Prompt、Embedding、评估和安全放到工程视角下理解。",
      focus: "适合准备 AI 应用工程、Agent 工程、RAG 工程、模型应用平台和大模型基础方向的面试。",
      accent: "neutral",
      principles: [
        "基础知识要讲清机制、能力边界、工程约束和常见误解。",
        "应用层问题要回到 token、上下文、检索、评估、成本和延迟这些可观察对象。",
        "涉及模型能力时避免泛化夸大，用来源、实验和系统边界支撑判断。",
      ],
      roadmap: [
        "继续补齐模型基础、应用开发、RAG、评估、安全和部署微调主题。",
        "把知识库页面与题库、模拟面试和学习路径形成闭环。",
        "持续排查口号化表述，补充示例、反例和可复核指标。",
      ],
    },
  };

  return defaults[trackKey] || {
    slug: trackKey,
    title: trackKey,
    eyebrow: "Knowledge Track",
    description: "围绕该方向的核心知识、工程边界和面试表达建立结构化内容。",
    focus: "适合按知识库和题库组合复习。",
    accent: "neutral",
    principles: ["先讲知识解读，再进入题库练习。"],
    roadmap: ["继续补充文档、题目、示例和来源证据。"],
  };
}

function fallbackModuleFromDocs(component, docs) {
  const sample = docs[0];
  const tags = Array.from(new Set([component, ...docs.slice(0, 4).map((doc) => doc.label.split(/[：:]/)[0]).filter(Boolean)])).slice(0, 6);
  return {
    title: component,
    status: "已入库",
    level: `${component} 核心知识、机制、边界和生产问题`,
    summary: `${component} 模块已经从 Markdown 知识库同步，覆盖定位、核心对象、执行链路、状态边界、性能排查、治理与系统设计等内容。`,
    docs: [],
    questions: [],
    tags: tags.length ? tags : [sample?.track || "知识库"],
  };
}

function buildFallbackTrackCatalog(docs) {
  const tracks = new Map();
  for (const doc of docs) {
    if (!["big-data", "ai-agents", "llm-foundations"].includes(doc.track)) continue;
    if (!tracks.has(doc.track)) tracks.set(doc.track, new Map());
    const modules = tracks.get(doc.track);
    if (!modules.has(doc.component)) modules.set(doc.component, []);
    modules.get(doc.component).push(doc);
  }

  const catalog = {};
  for (const trackKey of ["big-data", "ai-agents", "llm-foundations"]) {
    const meta = trackMeta(trackKey);
    const modulesByComponent = tracks.get(trackKey) || new Map();
    const modules = Array.from(modulesByComponent.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([component, moduleDocs]) => fallbackModuleFromDocs(component, moduleDocs));
    const docCount = Array.from(modulesByComponent.values()).reduce((sum, moduleDocs) => sum + moduleDocs.length, 0);

    catalog[trackKey] = {
      ...meta,
      stats: [
        { label: "已入库模块", value: `${modules.length} 个` },
        { label: "知识库页面", value: `${docCount} 篇` },
        { label: "内容原则", value: "中文解读、来源可查、链路清晰、边界明确" },
      ],
      modules,
      featuredQuestions: [],
    };
  }

  return ensureSupportingModules(catalog);
}

async function loadCurrentCatalog(catalogPath, docs) {
  try {
    return await import(pathToFileURL(catalogPath).href + `?t=${Date.now()}`);
  } catch (error) {
    console.warn(`[catalog] existing catalog.js is not importable, rebuilding from Markdown fallback: ${error.message}`);
    return {
      trackCatalog: buildFallbackTrackCatalog(docs),
      questionBank: [],
      progressFilters: [
        { value: "all", label: "全部状态" },
        { value: "未开始", label: "未开始" },
        { value: "已看", label: "已看" },
        { value: "已练", label: "已练" },
        { value: "需复习", label: "需复习" },
      ],
      progressSteps: ["未开始", "已看", "已练", "需复习"],
      learningPaths: [
        {
          id: "big-data-platform",
          title: "大数据平台面试路线",
          duration: "4-6 周",
          audience: "准备大数据开发、数据平台、实时数仓和湖仓平台岗位的同学。",
          description: "先建立 Kafka、Spark、Flink、Hive、Iceberg、HDFS、YARN 等组件的运行链路，再进入系统设计和排障题。",
          stages: [
            { title: "第一阶段：组件定位", summary: "先理解每个组件解决什么问题、不解决什么问题。", actions: ["阅读大数据总览和各组件 overview", "整理组件之间的数据流和控制流", "标记不熟悉的核心对象"] },
            { title: "第二阶段：核心机制", summary: "围绕状态、调度、容错、存储和查询优化建立深度理解。", actions: ["逐页阅读核心机制文档", "把机制转写成自己的链路图", "对照题库完成第一轮回答"] },
            { title: "第三阶段：生产表达", summary: "把知识落到故障、调优、选型和系统设计。", actions: ["练习排障题和系统设计题", "补充指标、日志和执行计划证据", "用模拟面试复盘表达完整度"] },
          ],
        },
        {
          id: "agent-engineering",
          title: "AI Agent 工程面试路线",
          duration: "3-5 周",
          audience: "准备 Agent 工程、AI 应用工程、RAG 工程和 AI 平台岗位的同学。",
          description: "从运行循环、工具调用、状态、记忆和多 Agent 协作入手，再比较主流框架和生产治理。",
          stages: [
            { title: "第一阶段：运行时基础", summary: "先把 Agent 与普通聊天应用区分开。", actions: ["阅读 Agent Runtime 基础", "梳理工具调用、session、memory 和 handoff", "练习基础原理题"] },
            { title: "第二阶段：框架与模式", summary: "理解不同框架在状态、编排、工具和观测上的取舍。", actions: ["阅读 LangGraph、AutoGen、CrewAI、Semantic Kernel 等框架页", "对比框架适用场景", "练习框架选型题"] },
            { title: "第三阶段：生产治理", summary: "把安全、权限、评估、成本和人工介入放入设计方案。", actions: ["阅读案例与治理页面", "设计 RAG 或多 Agent 系统", "用模拟面试检查回答链路"] },
          ],
        },
        {
          id: "llm-application",
          title: "大模型应用基础路线",
          duration: "3-4 周",
          audience: "准备 AI 应用工程、RAG 工程和模型应用平台岗位的同学。",
          description: "把模型机制、上下文、RAG、Prompt、推理、评估和安全串成应用工程闭环。",
          stages: [
            { title: "第一阶段：模型基础", summary: "理解 Transformer、Tokenizer、上下文窗口和生成机制。", actions: ["阅读 LLM 总览、Transformer、Tokenizer", "总结 token 与上下文限制", "练习基础解释题"] },
            { title: "第二阶段：应用链路", summary: "把 Prompt、RAG、Embedding、评估和推理成本连接起来。", actions: ["阅读 RAG 与应用开发页面", "梳理检索、重排和答案合成链路", "练习系统设计题"] },
            { title: "第三阶段：上线边界", summary: "补齐安全、评估、延迟、成本和模型选择。", actions: ["阅读评估和安全页面", "对照题库补薄弱点", "完成一轮模拟面试"] },
          ],
        },
      ],
      mockInterviewScenarios: [
        {
          id: "spark-performance",
          title: "Spark 性能与稳定性排查",
          track: "big-data",
          difficulty: "高级",
          description: "练习从 Spark UI、stage、task、shuffle、spill 和 executor 日志定位性能问题。",
          rounds: ["一个 Spark SQL 作业突然变慢，你先看哪些证据？", "如果看到 shuffle read 暴涨和少数 task 特别慢，你怎么判断是不是数据倾斜？", "调优时为什么不应该一上来就加 executor？"],
          reviewPoints: ["先给排查顺序", "说明 Spark UI 证据", "区分数据倾斜、资源不足和存储问题", "说明调优边界"],
          answerSignals: [["Spark UI", "stage", "task", "shuffle", "spill"], ["数据倾斜", "partition", "skew", "shuffle read", "长尾 task"], ["executor", "并行度", "数据布局", "join 策略", "证据"]],
          relatedDocs: [
            { label: "Spark 总览", href: "/docs/bigdata/spark/overview" },
            { label: "Spark 性能调优", href: "/docs/bigdata/spark/performance-tuning" },
          ],
          relatedQuestions: ["q-bigdata-spark-0001", "q-bigdata-spark-0008"],
        },
        {
          id: "kafka-consumer-group",
          title: "Kafka Consumer Group 与 Rebalance",
          track: "big-data",
          difficulty: "高级",
          description: "练习解释 Consumer Group 并行消费、分区分配、offset 和 rebalance 对稳定性的影响。",
          rounds: ["为什么同组消费者数量超过分区数后吞吐通常不再增长？", "Rebalance 什么时候发生，它为什么会影响延迟？", "如何降低消费抖动和重复处理风险？"],
          reviewPoints: ["说明分区分配模型", "区分 offset 与业务幂等", "说明 rebalance 触发和影响", "给出生产治理手段"],
          answerSignals: [["Consumer Group", "Partition", "一个分区", "一个消费者"], ["rebalance", "成员变化", "订阅变化", "metadata"], ["offset", "幂等", "批处理", "静态成员", "监控"]],
          relatedDocs: [
            { label: "Kafka 总览", href: "/docs/bigdata/kafka/overview" },
            { label: "Consumer Group", href: "/docs/bigdata/kafka/consumer-group-rebalance-and-offset-management" },
          ],
          relatedQuestions: ["q-bigdata-kafka-0002", "q-bigdata-kafka-0007"],
        },
        {
          id: "agent-runtime",
          title: "AI Agent 运行时设计",
          track: "ai-agents",
          difficulty: "高级",
          description: "练习把 Agent 从聊天形态讲到运行循环、工具、状态、观测和治理。",
          rounds: ["为什么 Agent 不应该只讲成带工具的聊天机器人？", "工具调用、session、memory 和 checkpoint 分别负责什么？", "生产 Agent 为什么必须设计 tracing、guardrails 和人工介入？"],
          reviewPoints: ["说明运行时视角", "区分状态对象", "讲清工具边界", "补充生产治理"],
          answerSignals: [["运行循环", "工具", "状态", "编排", "观测"], ["session", "memory", "checkpoint", "tool use"], ["tracing", "guardrails", "human-in-the-loop", "安全", "评估"]],
          relatedDocs: [
            { label: "Agent 基础总览", href: "/docs/ai-agent/foundations/overview" },
            { label: "执行循环与工具使用", href: "/docs/ai-agent/foundations/execution-loop-and-tool-use" },
          ],
          relatedQuestions: ["q-ai-agent-0001", "q-ai-agent-0002", "q-ai-agent-0005"],
        },
      ],
    };
  }
}

function moduleMatchesDoc(moduleTitle, doc) {
  return doc.component === moduleTitle;
}

function normalizeHref(href) {
  return String(href || "").replace(/\/index$/, "");
}

function appendUniqueLinks(existing, additions, validHrefs = null) {
  const out = [];
  const byHref = new Map();
  for (const item of existing || []) {
    const href = normalizeHref(item.href);
    if (!href || (validHrefs && !validHrefs.has(href))) continue;
    byHref.set(href, { ...item, href });
  }
  for (const item of additions) {
    const href = normalizeHref(item.href);
    if (!href || (validHrefs && !validHrefs.has(href))) continue;
    // Prefer the latest Markdown-derived label for the same href so frontend
    // cards do not keep stale legacy titles after docs are rewritten.
    byHref.set(href, { label: item.label, href });
  }
  for (const item of byHref.values()) out.push(item);
  return out;
}

function appendUniqueQuestions(existing, additions, limit = 12) {
  const byHref = new Map();
  for (const item of existing || []) {
    if (!item?.href) continue;
    byHref.set(item.href, { label: item.label, href: item.href });
  }
  for (const item of additions) {
    if (!item.detailHref) continue;
    // Prefer the latest question title generated from Markdown for the same
    // question href so module entry lists stay aligned with the current bank.
    byHref.set(item.detailHref, { label: item.title, href: item.detailHref });
  }
  return Array.from(byHref.values()).slice(0, limit);
}

function enrichTrackCatalog(baseCatalog, docs, questions) {
  const trackCatalog = ensureSupportingModules(removeArchivedTracks(baseCatalog));
  const validDocHrefs = new Set(docs.map((doc) => normalizeHref(doc.href)));
  const enriched = {};

  for (const [trackKey, track] of Object.entries(trackCatalog)) {
    enriched[trackKey] = {
      ...track,
      modules: (track.modules || []).map((module) => {
        const moduleDocs = docs.filter((doc) => doc.track === trackKey && moduleMatchesDoc(module.title, doc));
        const moduleQuestions = questions.filter((question) => question.track === trackKey && question.component === module.title);
        return {
          ...module,
          docs: appendUniqueLinks(module.docs, moduleDocs, validDocHrefs),
          questions: appendUniqueQuestions(module.questions, moduleQuestions),
        };
      }),
    };
  }

  return enriched;
}

function fillFeaturedQuestions(trackCatalog, questions) {
  const validIds = new Set(questions.map((question) => question.id));
  return Object.fromEntries(
    Object.entries(trackCatalog).map(([trackKey, track]) => {
      const existing = Array.isArray(track.featuredQuestions) ? track.featuredQuestions.filter((id) => validIds.has(id)) : [];
      const additions = questions.filter((question) => question.track === trackKey).map((question) => question.id);
      const featuredQuestions = Array.from(new Set([...existing, ...additions])).slice(0, 4);
      return [trackKey, { ...track, featuredQuestions }];
    })
  );
}

const catalogPath = path.join(repoRoot, "web", "docs-site", "src", "data", "catalog.js");
const markdownFiles = walkFiles(path.join(repoRoot, "questions"), (_, name) => name.endsWith(".md"));
const markdownDocs = loadMarkdownDocs();
const docRouteMap = buildDocRouteMap(markdownDocs);
const current = await loadCurrentCatalog(catalogPath, markdownDocs);
const existingById = new Map((current.questionBank || []).map((question) => [question.id, question]));
const generatedQuestions = markdownFiles
  .map((file) => buildQuestionFromMarkdown(file, existingById.get(parseMarkdown(file).data.id), docRouteMap))
  .filter((question) => question.id)
  .sort((a, b) => a.track.localeCompare(b.track) || a.component.localeCompare(b.component) || a.id.localeCompare(b.id));
const enrichedTrackCatalog = sanitizeTrackCatalogForFrontend(fillFeaturedQuestions(enrichTrackCatalog(current.trackCatalog, markdownDocs, generatedQuestions), generatedQuestions));

const questionFilters = {
  tracks: [
    { value: "all", label: "全部方向" },
    { value: "big-data", label: "大数据" },
    { value: "ai-agents", label: "AI Agent" },
    { value: "llm-foundations", label: "大模型基础" },
  ].filter((item) => item.value === "all" || generatedQuestions.some((q) => q.track === item.value)),
  difficulties: [{ value: "all", label: "全部难度" }, ...uniqueOptions(generatedQuestions.map((q) => q.difficulty)).map((value) => ({ value, label: value }))],
  types: [{ value: "all", label: "全部题型" }, ...uniqueOptions(generatedQuestions.map((q) => q.type)).map((value) => ({ value, label: value }))],
  sources: [
    { value: "all", label: "全部来源" },
    { value: "official", label: "官方来源" },
    { value: "trusted-community", label: "实践来源" },
    { value: "mixed", label: "官方 + 实践来源" },
    { value: "unknown", label: "未分类来源" },
  ].filter((item) => item.value === "all" || generatedQuestions.some((q) => q.sourceCategory === item.value)),
};

const output = [
  `export const trackCatalog = ${JSON.stringify(enrichedTrackCatalog, null, 2)};`,
  `export const questionBank = ${JSON.stringify(generatedQuestions, null, 2)};`,
  `export const questionFilters = ${JSON.stringify(questionFilters, null, 2)};`,
  `export const progressFilters = ${JSON.stringify(current.progressFilters, null, 2)};`,
  `export const progressSteps = ${JSON.stringify(current.progressSteps, null, 2)};`,
  `export const learningPaths = ${JSON.stringify(current.learningPaths, null, 2)};`,
  `export const mockInterviewScenarios = ${JSON.stringify(current.mockInterviewScenarios, null, 2)};`,
  "",
  "export function getFeaturedQuestions(ids) {",
  "  return ids.map((id) => questionBank.find((question) => question.id === id)).filter(Boolean);",
  "}",
  "",
  "export function getQuestionById(id) {",
  "  return questionBank.find((question) => question.id === id);",
  "}",
  "",
].join("\n\n");

if (shouldWrite) fs.writeFileSync(catalogPath, output, "utf8");
console.log(JSON.stringify({ markdownQuestions: markdownFiles.length, generatedQuestionBank: generatedQuestions.length, existingPreserved: generatedQuestions.filter((q) => existingById.has(q.id)).length }, null, 2));

