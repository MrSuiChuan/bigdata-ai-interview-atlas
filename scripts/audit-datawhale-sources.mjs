import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const shouldRefresh = process.argv.includes("--refresh");
const shouldUpgradeSources = process.argv.includes("--upgrade-sources");
const today = new Date().toISOString().slice(0, 10);

const p0Agent = new Set([
  "hello-agents",
  "agentic-ai",
  "agent-tutorial",
  "self-harness",
  "handy-multi-agent",
  "hugging-multi-agent",
  "easy-langent",
  "agent-skills-with-anthropic",
  "hello-generic-agent",
]);
const p0Rag = new Set(["all-in-rag", "wow-rag", "llm-universe", "what-is-vs", "easy-vecdb"]);
const p0Llm = new Set([
  "happy-llm",
  "base-llm",
  "self-llm",
  "diy-llm",
  "code-your-own-llm",
  "tiny-universe",
  "post-training-of-llms",
  "llm-deploy",
  "llms-from-scratch-cn",
  "llm-cookbook",
]);
const p1Engineering = new Set([
  "self-dify",
  "handy-ollama",
  "coze-ai-assistant",
  "openclaw-tutorial",
  "hand-on-openclaw",
  "mcp-lite-dev",
  "llm-protocols-guide",
  "smart-dev",
  "vibe-blog",
  "easy-vibe",
  "vibe-vibe",
  "anycli",
]);
const p1Foundations = new Set([
  "learn-nlp-with-transformers",
  "fun-transformer",
  "thorough-pytorch",
  "easy-rl",
  "fun-rec",
  "dive-into-cv-pytorch",
  "team-learning-nlp",
  "team-learning-cv",
  "hugging-llm",
  "leegenai-tutorial",
]);

const categoryRules = [
  { category: "AI Agent", subcategory: "agent-foundations", keywords: ["agent", "harness", "multi-agent", "generic-agent", "skills"] },
  { category: "RAG", subcategory: "retrieval-augmented-generation", keywords: ["rag", "retrieval", "vector", "vecdb"] },
  { category: "LLM", subcategory: "llm-foundations", keywords: ["llm", "large-lm", "transformer", "post-training", "deepseek", "hugging"] },
  { category: "Engineering", subcategory: "ai-application-engineering", keywords: ["dify", "ollama", "coze", "vibe", "claw", "mcp", "protocol", "coding", "dev"] },
  { category: "ML Foundations", subcategory: "ml-cv-nlp-rl", keywords: ["pytorch", "nlp", "cv", "rl", "rec", "bert", "robot", "embodied"] },
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "codex-datawhale-audit" } }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GitHub API ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        resolve(JSON.parse(data));
      });
    });
    req.on("error", reject);
  });
}

async function loadOrgRepos() {
  const auditPath = path.join(repoRoot, "datawhale-org-repos.audit.json");
  if (!shouldRefresh && fs.existsSync(auditPath)) return readJson(auditPath);
  const all = [];
  for (let page = 1; page <= 5; page += 1) {
    const rows = await httpGetJson(`https://api.github.com/orgs/datawhalechina/repos?per_page=100&page=${page}&sort=updated`);
    if (!rows.length) break;
    all.push(...rows.map((row) => ({
      name: row.name,
      html_url: row.html_url,
      description: row.description || "",
      stargazers_count: row.stargazers_count || 0,
      language: row.language || "",
      updated_at: row.updated_at || "",
    })));
  }
  fs.writeFileSync(auditPath, JSON.stringify(all, null, 2), "utf8");
  return all;
}

function classify(repo) {
  const name = repo.name;
  const haystack = `${repo.name} ${repo.description || ""}`.toLowerCase();
  let priority = "P3";
  let category = "暂不合并";
  let subcategory = "weakly-related";
  let reason = "与当前大数据 + AI 面试系统关联较弱，暂不进入主线。";

  if (p0Agent.has(name)) {
    priority = "P0"; category = "AI Agent"; subcategory = "agent-foundations"; reason = "Agent 原理、框架或工程实践，直接服务 AI Agent 面试主线。";
  } else if (p0Rag.has(name)) {
    priority = "P0"; category = "RAG"; subcategory = "retrieval-augmented-generation"; reason = "RAG、向量检索或知识库应用，直接服务 RAG 面试主线。";
  } else if (p0Llm.has(name)) {
    priority = "P0"; category = "LLM"; subcategory = "llm-foundations"; reason = "大模型基础、训练、部署或后训练，直接服务 LLM 面试主线。";
  } else if (p1Engineering.has(name)) {
    priority = "P1"; category = "Engineering"; subcategory = "ai-application-engineering"; reason = "AI 应用工程、平台实践或协议实践，适合转成项目题和工程题。";
  } else if (p1Foundations.has(name)) {
    priority = "P1"; category = "ML Foundations"; subcategory = "ml-cv-nlp-rl"; reason = "AI 基础能力，可作为 LLM/Agent 背景知识补充。";
  } else {
    for (const rule of categoryRules) {
      if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
        priority = "P2";
        category = rule.category;
        subcategory = rule.subcategory;
        reason = "AI 相关但不是当前最核心面试主线，进入候选池。";
        break;
      }
    }
  }

  return { priority, category, subcategory, reason };
}

function loadLocalSources() {
  const file = path.join(repoRoot, "sources", "community", "datawhale.yaml");
  const rows = yaml.load(fs.readFileSync(file, "utf8")) || [];
  return { file, rows };
}

function upgradeLocalSources(rows) {
  return rows.map((row) => {
    const repoName = row.url?.split("/").pop() || row.id?.replace(/^datawhale-/, "");
    const classified = classify({ name: repoName, description: row.notes || "" });
    return {
      ...row,
      source_tier: "trusted-community",
      trust_level: "trusted-community",
      category: row.category || classified.category,
      subcategory: row.subcategory || classified.subcategory,
      import_priority: row.import_priority || classified.priority,
      import_status: row.import_status || "source-indexed",
      use_for: row.use_for || ["学习路径", "项目实践", "面试题素材"],
      requires_official_cross_check: row.requires_official_cross_check || ["API 行为", "协议细节", "框架版本", "模型能力边界"],
      license_checked: row.license_checked ?? false,
      commit_pinned: row.commit_pinned ?? false,
    };
  });
}

function table(rows) {
  return [
    "| 优先级 | 分类 | 仓库 | Stars | 更新时间 | 本地状态 | 处理说明 |",
    "| --- | --- | --- | ---: | --- | --- | --- |",
    ...rows.map((row) => `| ${row.priority} | ${row.category} | [${row.name}](${row.html_url}) | ${row.stargazers_count ?? 0} | ${String(row.updated_at || "").slice(0, 10)} | ${row.localStatus} | ${row.reason.replaceAll("|", "/")} |`),
  ].join("\n");
}

function groupedSummary(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.priority} / ${row.category}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function buildDocs(rows) {
  const summary = groupedSummary(rows);
  const p0 = rows.filter((row) => row.priority === "P0");
  const p1 = rows.filter((row) => row.priority === "P1");
  const p2 = rows.filter((row) => row.priority === "P2");
  const p3 = rows.filter((row) => row.priority === "P3");

  const inventory = [
    "---",
    "kb_id: community/datawhale/repo-inventory",
    'title: "Datawhale 仓库全量清单"',
    "domain: community",
    "component: datawhale",
    "topic: repo-inventory",
    "difficulty: intermediate",
    "status: reviewed",
    "sidebar_position: 4",
    `version_scope: "GitHub datawhalechina repo inventory generated on ${today}"`,
    `last_verified_at: "${today}"`,
    "source_ids: []",
    "claim_ids: []",
    "---",
    "",
    "# 说明",
    "",
    "这份清单用于管理 Datawhale 仓库到面试系统的导入优先级。它不是把仓库内容直接搬进来，而是先筛选、分类、再二次整理。",
    "",
    "# 汇总",
    "",
    `1. GitHub 组织仓库数：${rows.length}`,
    `2. P0 核心面试高价值：${p0.length}`,
    `3. P1 工程实践或基础补充：${p1.length}`,
    `4. P2 候选扩展：${p2.length}`,
    `5. P3 暂不合并：${p3.length}`,
    "",
    "# 分类统计",
    "",
    "| 分组 | 数量 |",
    "| --- | ---: |",
    ...summary.map(([key, count]) => `| ${key} | ${count} |`),
    "",
    "# 全量清单",
    "",
    table(rows),
    "",
  ].join("\n");

  const status = [
    "---",
    "kb_id: community/datawhale/import-status",
    'title: "Datawhale 导入状态"',
    "domain: community",
    "component: datawhale",
    "topic: import-status",
    "difficulty: intermediate",
    "status: reviewed",
    "sidebar_position: 3",
    `version_scope: "Datawhale import status generated on ${today}"`,
    `last_verified_at: "${today}"`,
    "source_ids: []",
    "claim_ids: []",
    "---",
    "",
    "# 当前结论",
    "",
    "Datawhale 已被设置为 trusted-community 来源，但当前仍处于分阶段整理状态。已登记来源不等于已经完成面试化吸收。",
    "",
    "# 导入口径",
    "",
    "1. P0：优先进入 Datawhale 专区，并提炼到 AI Agent / RAG / LLM 主知识库。",
    "2. P1：进入专区或案例库，按项目题、工程题整理。",
    "3. P2：进入候选池，等待主线内容稳定后再处理。",
    "4. P3：暂不合并，只保留清单记录和原因。",
    "",
    "# P0 项目队列",
    "",
    table(p0),
    "",
    "# P1 项目队列",
    "",
    table(p1),
    "",
  ].join("\n");

  return { inventory, status };
}

const repos = await loadOrgRepos();
const { file: sourceFile, rows: localSources } = loadLocalSources();
const localNames = new Set(localSources.map((row) => row.url?.split("/").pop()?.toLowerCase()).filter(Boolean));
const rows = repos.map((repo) => {
  const classified = classify(repo);
  return {
    ...repo,
    ...classified,
    localStatus: localNames.has(repo.name.toLowerCase()) ? "已登记来源" : "未登记来源",
  };
}).sort((a, b) => {
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return priorityOrder[a.priority] - priorityOrder[b.priority] || b.stargazers_count - a.stargazers_count;
});

if (shouldUpgradeSources) {
  fs.writeFileSync(sourceFile, yaml.dump(upgradeLocalSources(localSources), { lineWidth: 120, noRefs: true }), "utf8");
}

const docs = buildDocs(rows);
if (shouldWrite) {
  const dir = path.join(repoRoot, "archive", "internal-source-materials", "practice-sources", "audit");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "repo-inventory.md"), docs.inventory, "utf8");
  fs.writeFileSync(path.join(dir, "import-status.md"), docs.status, "utf8");
}

const localPresent = rows.filter((row) => row.localStatus === "已登记来源").length;
console.log(JSON.stringify({
  orgRepos: rows.length,
  localDatawhaleSources: localSources.length,
  localPresent,
  missingFromLocalSources: rows.length - localPresent,
  p0: rows.filter((row) => row.priority === "P0").length,
  p1: rows.filter((row) => row.priority === "P1").length,
  p2: rows.filter((row) => row.priority === "P2").length,
  p3: rows.filter((row) => row.priority === "P3").length,
}, null, 2));
