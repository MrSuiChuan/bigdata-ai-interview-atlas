import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const today = "2026-04-28";
const archiveRoot = path.join(repoRoot, "archive", "internal-source-materials", "practice-sources", today);

const agentSourceIds = [
  "datawhale-hello-agents",
  "datawhale-agentic-ai",
  "datawhale-agent-tutorial",
  "datawhale-self-harness",
  "datawhale-handy-multi-agent",
  "datawhale-hugging-multi-agent",
  "datawhale-easy-langent",
  "datawhale-agent-skills-with-anthropic",
  "datawhale-hello-generic-agent",
];

const ragSourceIds = [
  "datawhale-all-in-rag",
  "datawhale-wow-rag",
  "datawhale-llm-universe",
  "datawhale-what-is-vs",
  "datawhale-easy-vecdb",
];

const llmSourceIds = [
  "datawhale-happy-llm",
  "datawhale-base-llm",
  "datawhale-self-llm",
  "datawhale-diy-llm",
  "datawhale-code-your-own-llm",
  "datawhale-tiny-universe",
  "datawhale-post-training-of-llms",
  "datawhale-llm-cookbook",
  "datawhale-llm-deploy",
  "datawhale-llms-from-scratch-cn",
];

const engineeringSourceIds = [
  "datawhale-self-dify",
  "datawhale-handy-ollama",
  "datawhale-coze-ai-assistant",
  "datawhale-llm-protocols-guide",
  "datawhale-mcp-lite-dev",
  "datawhale-anycli",
  "datawhale-vibe-blog",
  "datawhale-smart-dev",
  "datawhale-openclaw-tutorial",
  "datawhale-hand-on-openclaw",
  "datawhale-handy-n8n",
  "datawhale-wow-agent",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeText(relativePath, content) {
  const fullPath = path.join(repoRoot, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.replace(/\n{3,}/g, "\n\n"), "utf8");
}

function archivePath(sourceRelativePath) {
  const source = path.join(repoRoot, sourceRelativePath);
  if (!fs.existsSync(source)) return false;
  const target = path.join(archiveRoot, sourceRelativePath);
  ensureDir(path.dirname(target));
  if (fs.existsSync(target)) {
    const backup = `${target}.${Date.now()}`;
    fs.renameSync(source, backup);
  } else {
    fs.renameSync(source, target);
  }
  return true;
}

function archiveDirectory(sourceRelativePath) {
  const source = path.join(repoRoot, sourceRelativePath);
  if (!fs.existsSync(source)) return false;
  const target = path.join(archiveRoot, sourceRelativePath);
  ensureDir(path.dirname(target));
  let finalTarget = target;
  if (fs.existsSync(finalTarget)) finalTarget = `${target}.${Date.now()}`;
  fs.renameSync(source, finalTarget);
  return true;
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function removeGeneratedQuestions() {
  const roots = [
    path.join(repoRoot, "questions", "ai-agent"),
    path.join(repoRoot, "questions", "llm-foundations"),
  ];
  let removed = 0;
  for (const root of roots) {
    for (const file of walkFiles(root)) {
      const name = path.basename(file);
      if (/^q-(ai|llm)-practice-/.test(name)) {
        fs.rmSync(file, { force: true });
        removed += 1;
      }
    }
  }
  return removed;
}

function yamlList(items) {
  if (!items.length) return "[]";
  return `\n${items.map((item) => `  - ${item}`).join("\n")}`;
}

function docFrontmatter({ kbId, title, domain, component, topic, difficulty = "advanced", sidebarPosition, sourceIds }) {
  return [
    "---",
    `kb_id: ${kbId}`,
    `title: "${title}"`,
    `domain: ${domain}`,
    `component: ${component}`,
    `topic: ${topic}`,
    `difficulty: ${difficulty}`,
    "status: reviewed",
    `sidebar_position: ${sidebarPosition}`,
    `version_scope: "实践资料主线化整理，截至 ${today}"`,
    `last_verified_at: "${today}"`,
    `source_ids:${yamlList(sourceIds)}`,
    "claim_ids: []",
    "tags:",
    "  - practice",
    "  - interview",
    "---",
    "",
  ].join("\n");
}

function questionFrontmatter({ id, title, domain, component, topic, type, difficulty, sourceIds, relatedDocs, minutes }) {
  return [
    "---",
    `id: ${id}`,
    `title: "${title}"`,
    `domain: ${domain}`,
    `component: ${component}`,
    `topic: ${topic}`,
    `question_type: ${type}`,
    `difficulty: ${difficulty}`,
    "status: reviewed",
    `version_scope: "实践资料主线化整理，截至 ${today}"`,
    `last_verified_at: "${today}"`,
    `source_ids:${yamlList(sourceIds)}`,
    "claim_ids: []",
    `related_docs:${yamlList(relatedDocs)}`,
    `estimated_minutes: ${minutes}`,
    "---",
    "",
  ].join("\n");
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function questionMarkdown(meta, sections) {
  return [
    questionFrontmatter(meta),
    `# 题目\n\n${meta.title}`,
    `# 一句话结论\n\n${sections.conclusion}`,
    `# 核心机制\n\n${sections.core}`,
    `# 标准答案\n\n${sections.answer}`,
    `# 必答点\n\n${numbered(sections.score)}`,
    `# 常见误答\n\n${numbered(sections.mistakes)}`,
    `# 延伸追问\n\n${numbered(sections.followUps)}`,
    "",
  ].join("\n\n");
}

function makeAgentQuestion(source, index, variant) {
  const base = {
    domain: "ai-agent",
    component: source.component,
    topic: source.topic,
    difficulty: variant.difficulty,
    type: variant.type,
    sourceIds: [source.sourceId],
    relatedDocs: [source.doc],
    minutes: variant.minutes,
  };
  const id = `q-ai-practice-agent-${source.slug}-${String(index + 1).padStart(2, "0")}`;
  const title = `${source.focus}：${variant.title}`;
  return {
    path: path.join("questions", "ai-agent", source.bucket, `${id}.md`),
    content: questionMarkdown({ ...base, id, title }, {
      conclusion: variant.conclusion(source),
      core: variant.core(source),
      answer: variant.answer(source),
      score: variant.score,
      mistakes: variant.mistakes,
      followUps: variant.followUps,
    }),
  };
}

function makeGenericQuestion(prefix, source, index, variant, targetPath) {
  const id = `${prefix}-${source.slug}-${String(index + 1).padStart(2, "0")}`;
  const title = `${source.focus}：${variant.title}`;
  return {
    path: path.join(targetPath, `${id}.md`),
    content: questionMarkdown({
      id,
      title,
      domain: source.domain,
      component: source.component,
      topic: source.topic,
      type: variant.type,
      difficulty: variant.difficulty,
      sourceIds: [source.sourceId],
      relatedDocs: [source.doc],
      minutes: variant.minutes,
    }, {
      conclusion: variant.conclusion(source),
      core: variant.core(source),
      answer: variant.answer(source),
      score: variant.score,
      mistakes: variant.mistakes,
      followUps: variant.followUps,
    }),
  };
}

function writeDocs() {
  writeText(
    "docs/ai-agent/foundations/agent-runtime-production-practice.md",
    `${docFrontmatter({
      kbId: "ai-agent/foundations/agent-runtime-production-practice",
      title: "Agent 运行时工程实践：从最小闭环到生产治理",
      domain: "ai-agent",
      component: "agent-runtime",
      topic: "agent-runtime-production-practice",
      sidebarPosition: 9,
      sourceIds: agentSourceIds,
    })}# 一句话结论

Agent 不是一次模型调用，也不是单纯的 Tool Calling。面试里要把它讲成一个运行时系统：模型负责决策，工具负责外部动作，状态负责连续性，控制循环负责推进和停止，观测与评估负责判断系统是否可靠。

# 为什么这部分必须放进知识库

很多候选人会把 Agent 说成“LLM 加工具”。这个说法只能覆盖最浅的一层能力，无法解释生产系统里真正困难的问题：工具失败怎么办、状态如何恢复、长任务怎么续跑、多个角色如何协调、权限和审计怎么落地、效果如何回归评估。

高质量回答必须把实践项目抽象成可迁移的工程模型，而不是复述某个教程步骤。

# Agent 运行时的核心对象

| 对象 | 作用 | 面试必须讲清楚的边界 |
| --- | --- | --- |
| Instruction | 约束模型行为、角色、输出格式和禁止事项 | Instruction 不是业务状态，不能替代权限系统 |
| Model | 理解任务、选择动作、生成中间推理或最终答案 | 模型不保证事实正确，也不天然理解工具副作用 |
| Tool | 把外部能力暴露给模型调用 | 工具必须有 schema、权限、超时、重试和审计 |
| State | 保存任务上下文、中间结果、工具调用记录和检查点 | State 不是无限上下文，必须控制大小、生命周期和隐私 |
| Planner | 把目标拆成步骤，决定下一步动作 | 复杂任务才需要规划，简单任务强行规划会增加错误和成本 |
| Executor | 执行模型选择的动作并收集结果 | Executor 要处理异常、幂等、回滚和人工接管 |
| Memory | 保存跨轮或跨任务可复用信息 | Memory 必须有写入规则、检索规则、过期规则和安全规则 |
| Trace | 记录每一步输入、输出、工具参数和结果 | Trace 是排障和评估基础，不只是日志 |
| Evaluation | 衡量任务成功率、工具正确率、幻觉率、延迟和成本 | 不能只靠“看起来能跑”的 demo 判断质量 |

# 最小运行闭环

一个最小 Agent 闭环可以拆成六步：

1. 接收用户目标和可用上下文。
2. 组装 instruction、短期状态、可用工具和约束。
3. 模型选择直接回答、调用工具、请求澄清或停止。
4. Executor 校验工具参数、执行工具、记录结果。
5. 将工具结果写回状态，再交给模型做下一步判断。
6. 满足停止条件后输出答案，并保存 trace 和评估信号。

~~~python
def run_agent(goal, tools, state_store, max_steps=8):
    state = state_store.load_or_create(goal)
    for step in range(max_steps):
        decision = model_decide(goal=goal, state=state, tools=tools)
        if decision.type == "final":
            state_store.save(state)
            return decision.answer
        if decision.type != "tool_call":
            return ask_human_or_fail(decision.reason)
        tool = tools[decision.tool_name]
        args = validate_args(tool.schema, decision.arguments)
        result = execute_with_timeout_and_audit(tool, args)
        state.append_trace(step=step, decision=decision, result=result)
        if result.needs_human_review:
            return handoff_to_human(state)
    return stop_safely("超过最大步数，避免无限循环", state)
~~~

这段伪代码的重点不是语法，而是面试表达：Agent 必须有循环边界、参数校验、工具审计、状态保存、人工接管和安全停止。

# Tool Calling 和 Agent 的区别

Tool Calling 解决的是“模型能不能请求外部能力”。Agent 解决的是“系统能不能在多步任务中可靠地选择、执行、恢复、观测和评估”。两者关系如下：

1. Tool Calling 是 Agent 的能力之一。
2. Agent 还需要状态、循环、停止条件、错误处理和评估。
3. 没有运行时治理的 Tool Calling 只能算增强型对话，不等于生产级 Agent。
4. 工具有副作用时，Agent 必须引入权限、审批、幂等和回滚策略。

# 长任务为什么需要 Harness

长任务 Agent 的核心风险不是某一步生成错了，而是任务链路长、失败点多、上下文持续变化。Harness 的价值是把模型和工具包在一个可靠性外壳里：

1. 任务生命周期：创建、运行、暂停、恢复、取消、完成。
2. Checkpoint：保存目标、计划、已完成步骤、中间产物和工具结果。
3. 错误分类：模型输出错误、工具参数错误、权限错误、外部服务错误、数据缺失。
4. 恢复策略：自动重试、降级、跳过、回滚、人工接管。
5. 可观测性：trace、span、输入输出快照、成本、延迟和异常率。
6. 评估回归：用固定任务集验证改 prompt、换模型、加工具之后是否退化。

# 多 Agent 的正确打开方式

多 Agent 不是角色越多越好。它只在任务天然可拆分、需要不同视角、需要审查制衡或需要并行探索时才有价值。

设计多 Agent 时至少回答四个问题：

1. 角色边界：每个 Agent 负责什么，不负责什么。
2. 通信方式：通过共享状态、消息队列、工作流节点，还是由主控 Agent 调度。
3. 冲突处理：多个 Agent 给出不同结论时谁裁决。
4. 评估方式：如何证明多 Agent 比单 Agent 更好，而不是更贵更慢。

# 生产环境风险清单

1. 无限循环：必须有最大步数、预算和停止条件。
2. 工具副作用：写数据库、发消息、下单、删除文件都需要审批或幂等设计。
3. 上下文污染：工具返回内容可能注入恶意指令，必须做输入约束和隔离。
4. 状态膨胀：长期记忆必须有摘要、淘汰、权限和过期策略。
5. 模型漂移：换模型或改 prompt 后必须跑回归集。
6. 成本失控：多 Agent、长上下文、重试和检索都会放大 token 成本。
7. 排障困难：没有 trace 就无法判断问题出在模型、工具、状态还是数据。

# 面试回答模板

回答 Agent 题时可以按这个顺序：

1. 先定义：Agent 是带状态、工具和控制循环的运行时系统。
2. 再拆对象：模型、工具、状态、记忆、规划、执行、观测、评估。
3. 讲链路：一次任务如何从输入到工具调用，再到最终答案。
4. 讲失败：工具错误、权限不足、循环不停止、上下文污染怎么处理。
5. 讲权衡：什么时候用 workflow，什么时候用自主 Agent，什么时候用多 Agent。
6. 讲验证：用 trace、任务成功率、人工接管率、延迟和成本证明系统可用。
`
  );

  writeText(
    "docs/ai-agent/patterns/rag-engineering-production-practice.md",
    `${docFrontmatter({
      kbId: "ai-agent/patterns/rag-engineering-production-practice",
      title: "RAG 工程实践：从检索 Demo 到可评估系统",
      domain: "ai-agent",
      component: "agent-patterns",
      topic: "rag-engineering-production-practice",
      sidebarPosition: 42,
      sourceIds: ragSourceIds,
    })}# 一句话结论

RAG 不是“向量库加大模型”。可落地的 RAG 系统必须覆盖文档治理、切分、索引、召回、重排、上下文组装、引用、权限、评估和持续更新。

# RAG 的完整链路

| 阶段 | 核心问题 | 典型故障 |
| --- | --- | --- |
| 文档接入 | 文件格式、解析质量、去重、元数据 | PDF 表格丢失、标题层级错乱、重复文档污染 |
| 切分 | chunk 大小、overlap、语义完整性 | 答案被切碎、噪声混入、上下文过长 |
| 表征 | BM25、Embedding、Hybrid Search | 语义相近但事实不匹配，关键词强约束丢失 |
| 索引 | collection、metadata、版本、增量更新 | 旧文档未下线，新文档未生效，权限字段缺失 |
| 召回 | top-k、query rewrite、多路召回 | 正确片段没召回，召回结果全是近义噪声 |
| 重排 | reranker、规则过滤、去重 | 正确片段被排后，模型拿不到证据 |
| 生成 | 引用证据、拒答、格式约束 | 编造答案、引用不对应、把无证据内容说成事实 |
| 评估 | 召回率、答案正确率、幻觉率、延迟成本 | 只靠人工试问，无法判断版本迭代是否变差 |

# 为什么向量检索不等于答案正确

向量检索优化的是表示空间中的相似度，不是事实正确性。一个片段可能语义相似，但实体、时间、版本、权限或条件完全不匹配。因此面试回答不能停在“用 Embedding 找相似文本”，必须继续说明：

1. Query 是否表达了真实意图。
2. 文档切分是否保留了完整证据。
3. metadata filter 是否限制了租户、时间、权限和版本。
4. reranker 是否把真正有证据的片段排到前面。
5. Prompt 是否要求模型只基于证据回答。
6. 评估集是否能发现召回正确但生成错误的情况。

# Chunk 设计原则

Chunk 设计的目标不是越小越好，也不是越大越好，而是在召回粒度、语义完整性和上下文成本之间取平衡。

1. 小 chunk 召回更精细，但容易丢上下文。
2. 大 chunk 保留上下文，但会带来噪声和 token 成本。
3. overlap 能缓解边界切断，但过大时会造成重复召回。
4. 标题、章节、表格、代码块应该尽量作为结构化元数据保留。
5. 对 FAQ、合同、日志、代码、论文，切分策略不应该完全相同。

~~~python
def build_chunks(document):
    blocks = parse_by_structure(document)
    chunks = []
    for block in blocks:
        metadata = {
            "title_path": block.title_path,
            "source_version": document.version,
            "tenant_id": document.tenant_id,
            "permission": document.permission,
        }
        for text in split_with_semantic_boundary(block.text, max_tokens=500, overlap=80):
            chunks.append({"text": text, "metadata": metadata})
    return chunks
~~~

# 排障路径

RAG 答错时不要直接换模型。应该按链路定位：

1. 知识库里是否真的存在答案。
2. 文档解析是否把答案字段解析出来。
3. 切分是否把答案和限定条件切开。
4. 索引是否包含正确版本。
5. 过滤条件是否误删正确文档。
6. 召回是否拿到正确片段。
7. 重排是否把正确片段放在前面。
8. 上下文组装是否超长截断。
9. Prompt 是否允许模型无证据发挥。
10. 评估样本是否覆盖这个问题类型。

# 评估指标

RAG 至少要分层评估：

1. 检索层：Recall@k、MRR、命中正确文档比例。
2. 重排层：正确证据进入 top-n 的比例。
3. 生成层：答案正确性、引用一致性、拒答正确性。
4. 安全层：越权召回率、敏感信息泄露率。
5. 工程层：P95 延迟、token 成本、索引更新时间、失败率。

# 面试回答模板

回答 RAG 系统设计题时，建议按“数据、检索、生成、评估、治理”五段展开：

1. 数据：如何解析、清洗、切分、加元数据和做版本管理。
2. 检索：为什么需要关键词、向量、混合召回和 rerank。
3. 生成：如何让模型基于证据回答、引用来源、不会就拒答。
4. 评估：如何构建问题集、标注证据、监控幻觉和回归。
5. 治理：如何处理权限、增量更新、成本、延迟和排障。
`
  );

  writeText(
    "docs/llm-foundations/llm-engineering-full-stack-practice.md",
    `${docFrontmatter({
      kbId: "llm-foundations/llm-engineering-full-stack-practice",
      title: "大模型工程实践：从基础原理到训练、后训练和部署",
      domain: "llm-foundations",
      component: "llm-overview",
      topic: "llm-engineering-full-stack-practice",
      sidebarPosition: 20,
      sourceIds: llmSourceIds,
    })}# 一句话结论

大模型知识不能只讲 Transformer，也不能只讲调用 API。完整面试能力要覆盖数据、Tokenizer、模型结构、预训练、后训练、推理部署、应用开发、评估和安全。

# 全链路结构

| 层级 | 必须掌握什么 | 面试常见追问 |
| --- | --- | --- |
| 数据层 | 语料来源、清洗、去重、质量过滤、数据配比 | 为什么数据质量会比单纯扩大模型更重要 |
| Tokenizer | BPE、SentencePiece、词表、上下文预算 | 中文、代码、长文本为什么 token 成本不同 |
| 模型结构 | Decoder-only Transformer、Attention、FFN、Norm、位置编码 | 为什么现代 LLM 多使用自回归 Decoder-only |
| 预训练 | next token prediction、batch、优化器、checkpoint | 训练损失下降不代表任务能力完整 |
| 后训练 | SFT、偏好优化、RLHF、DPO、安全对齐 | 微调为什么不适合当事实数据库 |
| 推理 | prefill、decode、KV Cache、batching、量化 | 为什么吞吐和首 token 延迟经常冲突 |
| 应用 | Prompt、RAG、工具调用、Agent、评估 | 为什么 LLM 应用不是一次 API 调用 |
| 治理 | 安全、权限、监控、回归、成本 | 如何发现上线后能力退化 |

# Tokenizer 和上下文预算

Tokenizer 决定文本如何被拆成 token。它直接影响三件事：

1. 成本：API 和推理服务通常按 token 计费或计资源。
2. 上下文容量：同样长度的中文、英文、代码、表格消耗 token 不同。
3. 生成质量：稀有词、数字、代码符号、特殊格式会影响模型理解。

面试里不能只说“上下文窗口越大越好”。上下文越长，prefill 成本越高，注意力计算和 KV Cache 占用也会上升。真正的工程方案通常是：检索压缩、结构化摘要、分阶段推理、缓存复用和窗口内证据排序。

# Transformer 的核心机制

Decoder-only LLM 的核心是自回归生成：每次根据已有 token 预测下一个 token。Attention 的作用是让当前位置根据上下文中不同 token 的相关性聚合信息，FFN 负责非线性变换，残差和归一化帮助深层网络稳定训练。

高质量面试回答要讲清楚：

1. Attention 解决的是上下文依赖建模问题。
2. 多头 Attention 让模型从不同子空间关注不同关系。
3. 位置编码让模型区分 token 顺序。
4. Decoder-only 适合 next token prediction 和生成式任务。
5. 模型结构只是能力的一部分，数据和训练目标同样关键。

# 后训练的边界

后训练常被误解为“给模型补知识”。更准确的说法是：后训练主要改变模型行为风格、指令遵循、安全边界和偏好排序；事实更新更适合通过检索、工具或数据更新解决。

| 方法 | 主要目标 | 风险 |
| --- | --- | --- |
| SFT | 让模型学习指令格式和示范答案 | 数据质量差会放大错误风格 |
| RLHF | 用人类偏好优化输出 | 成本高，奖励模型可能引入偏差 |
| DPO | 直接用偏好对优化 | 对偏好数据质量敏感 |
| 安全对齐 | 降低有害输出和越权行为 | 过度拒答会影响可用性 |

# 推理部署关键点

推理服务通常拆成 prefill 和 decode：

1. Prefill 处理输入上下文，计算初始 KV Cache。
2. Decode 每次生成一个或一批 token，并复用 KV Cache。
3. 长上下文会显著增加 prefill 成本和显存占用。
4. Batching 提高吞吐，但可能增加单请求延迟。
5. 量化降低显存和成本，但可能影响精度和部分任务能力。

~~~python
def estimate_kv_cache_layers(batch, seq_len, layers, hidden, bytes_per_value=2):
    # 粗略估算 KV Cache 量级：K 和 V 各一份。
    return batch * seq_len * layers * hidden * 2 * bytes_per_value
~~~

面试里要把这些机制和实际指标连起来：吞吐、首 token 延迟、平均生成速度、显存、并发、成本和稳定性。

# 应用开发路径

LLM 应用通常经历四层演进：

1. Prompt 应用：适合低风险、短上下文、无外部动作的任务。
2. RAG 应用：适合需要私有知识、可引用证据、需要更新知识的任务。
3. Tool 应用：适合需要查询系统、计算、执行动作的任务。
4. Agent 应用：适合多步、带状态、需要计划和恢复的任务。

每上一层，能力增强，复杂度也增加。面试中要主动讲清楚为什么要升级到更复杂形态，以及新增的评估和治理成本。

# 面试回答模板

回答大模型题时可以按这个顺序：

1. 先定位问题属于模型结构、训练、后训练、推理还是应用。
2. 再讲核心机制，避免只背术语。
3. 补充工程指标：延迟、吞吐、显存、成本、数据质量、评估。
4. 说明边界：哪些问题靠模型解决，哪些应靠 RAG、工具、权限和流程解决。
5. 给出验证方法：离线评估、线上监控、回归集、人工抽检和安全测试。
`
  );

  writeText(
    "docs/ai-agent/platforms/ai-application-platform-engineering-practice.md",
    `${docFrontmatter({
      kbId: "ai-agent/platforms/ai-application-platform-engineering-practice",
      title: "AI 应用平台工程实践：工作流、协议、本地模型和工具生态",
      domain: "ai-agent",
      component: "agent-platforms",
      topic: "ai-application-platform-engineering-practice",
      sidebarPosition: 50,
      sourceIds: engineeringSourceIds,
    })}# 一句话结论

AI 应用平台不是“把模型接到页面上”。它要解决模型接入、工具生态、工作流编排、权限、观测、成本、本地部署和团队协作问题。

# 平台型能力的分层

| 层级 | 主要职责 | 面试重点 |
| --- | --- | --- |
| 模型接入层 | 统一接入云模型、本地模型和开源推理服务 | 路由、降级、限流、密钥和成本 |
| 工作流层 | 把检索、工具、审核、生成串成可控流程 | 节点状态、失败恢复、人工审批 |
| 工具层 | 暴露业务系统能力 | schema、权限、幂等、审计 |
| 协议层 | 统一模型、工具、上下文的交互方式 | 协议边界、版本兼容、安全约束 |
| 观测层 | 收集 trace、日志、指标和反馈 | 排障、回放、评估和回归 |
| 治理层 | 管理用户、权限、数据、发布和安全 | 多租户、越权、灰度和回滚 |

# 本地模型和平台服务的权衡

本地模型部署适合数据敏感、成本可控、低延迟或离线场景，但它不是天然更简单。面试里要讲清楚：

1. 模型大小、量化方式和显存决定能否部署。
2. 推理框架影响吞吐、延迟、并发和上下文长度。
3. 本地模型能力可能低于闭源强模型，需要任务分级。
4. 运维成本从 API 调用方转移到平台团队。
5. 安全责任不会消失，仍要做权限、审计和内容治理。

# 工作流和 Agent 的边界

工作流适合步骤明确、风险可控、需要审计和审批的任务。Agent 适合步骤不完全固定、需要动态决策和多轮工具使用的任务。

实际系统经常混合使用：

1. 外层用 workflow 固定关键节点和审批点。
2. 内层用 Agent 处理开放式子任务。
3. 工具调用由平台统一做权限和审计。
4. 输出进入评估和人工复核流程。

# 协议和工具生态

协议的价值不是“多一个接口名”，而是降低工具和模型之间的耦合。设计协议或工具生态时要关注：

1. 工具描述是否足够稳定。
2. 参数 schema 是否可校验。
3. 权限是否能在调用前判断。
4. 错误是否能被模型和平台理解。
5. 版本变化是否会破坏已有 workflow。
6. trace 是否能跨工具、模型和平台串起来。

# 面试回答模板

回答 AI 应用平台题时建议按六段展开：

1. 目标：平台要解决模型接入、应用交付还是工具生态。
2. 架构：模型层、工作流层、工具层、协议层、观测层、治理层。
3. 链路：一次用户请求如何经过检索、工具、生成和审核。
4. 风险：越权、成本失控、模型退化、工具副作用、数据泄露。
5. 指标：成功率、延迟、吞吐、调用成本、人工接管率、回归通过率。
6. 权衡：什么时候用平台，什么时候直接写代码，什么时候引入 Agent。
`
  );
}

const agentSources = [
  { slug: "runtime-loop", sourceId: "datawhale-hello-agents", focus: "最小 Agent 运行闭环", topic: "agent-runtime", component: "agent-runtime", bucket: "foundations", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "agentic-planning", sourceId: "datawhale-agentic-ai", focus: "Agentic 规划与行动", topic: "agentic-workflow", component: "agent-patterns", bucket: "patterns", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "agent-tutorial", sourceId: "datawhale-agent-tutorial", focus: "Agent 入门体系", topic: "agent-runtime", component: "agent-runtime", bucket: "foundations", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "harness", sourceId: "datawhale-self-harness", focus: "长任务 Harness", topic: "harness-engineering", component: "agent-patterns", bucket: "patterns", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "multi-agent-collab", sourceId: "datawhale-handy-multi-agent", focus: "多 Agent 协作", topic: "multi-agent", component: "multi-agent-frameworks", bucket: "frameworks", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "multi-agent-workflow", sourceId: "datawhale-hugging-multi-agent", focus: "角色型多 Agent 工作流", topic: "multi-agent", component: "multi-agent-frameworks", bucket: "frameworks", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "framework-selection", sourceId: "datawhale-easy-langent", focus: "Agent 框架选型", topic: "framework-selection", component: "agent-runtime", bucket: "foundations", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "skills", sourceId: "datawhale-agent-skills-with-anthropic", focus: "Skill 与 Tool 边界", topic: "agent-skills", component: "agent-patterns", bucket: "patterns", doc: "ai-agent/foundations/agent-runtime-production-practice" },
  { slug: "generic-agent", sourceId: "datawhale-hello-generic-agent", focus: "通用 Agent 边界", topic: "generic-agent", component: "agent-runtime", bucket: "foundations", doc: "ai-agent/foundations/agent-runtime-production-practice" },
];

const agentVariants = [
  {
    title: "为什么不能把它简化成一次模型调用？",
    type: "principle",
    difficulty: "advanced",
    minutes: 10,
    conclusion: (s) => `${s.focus}的重点是运行时控制，而不是单次生成。面试要说明模型、工具、状态、循环、停止条件和观测如何协作。`,
    core: () => "一次模型调用只产生文本，Agent 运行时要在多步任务中不断读取状态、选择工具、处理异常、更新 trace，并在满足条件时安全停止。",
    answer: (s) => `回答${s.focus}时，不能只描述 prompt 或工具函数。应该先说明 Agent 是带状态和控制循环的系统，再解释工具调用只是外部动作接口。生产系统还要处理参数校验、权限、超时、重试、幂等、人工接管和评估回归。这样才能把实践经验上升为工程原理。`,
    score: ["说明 Agent 是运行时系统", "说明工具调用只是其中一层", "说明状态、循环和停止条件", "说明失败恢复和人工接管", "说明观测、评估和成本控制"],
    mistakes: ["只说模型会调用 API", "把 ReAct prompt 等同于完整 Agent", "不讲工具副作用", "不讲 trace 和评估"],
    followUps: ["如果工具返回错误，运行时如何处理？", "如何防止无限循环？", "什么场景不应该使用 Agent？"],
  },
  {
    title: "如何设计可恢复、可观测的执行链路？",
    type: "system-design",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "可恢复和可观测的关键是把每一步决策、工具参数、工具结果、中间状态和停止原因记录下来，并用 checkpoint 支持续跑。",
    core: () => "执行链路至少包含任务状态机、tool call 记录、错误分类、重试策略、人工接管、trace 回放和评估指标。缺少这些能力，系统只能演示，不能稳定运行。",
    answer: (s) => `设计${s.focus}的执行链路时，可以把任务拆成创建、规划、执行、检查、恢复和完成几个阶段。每个阶段都要写入状态和 trace。工具调用前做 schema 校验和权限判断，调用后记录结果、耗时和异常。失败时根据错误类型决定重试、降级、回滚或交给人工。最后用固定任务集评估任务成功率、人工接管率、延迟和成本。`,
    score: ["任务生命周期清晰", "checkpoint 保存关键状态", "工具调用有参数校验和审计", "错误分类对应恢复策略", "指标能支撑回归评估"],
    mistakes: ["只说加日志", "没有状态持久化", "所有错误都自动重试", "没有人工接管入口"],
    followUps: ["checkpoint 应该保存哪些字段？", "哪些工具不能自动重试？", "trace 如何支持问题复现？"],
  },
  {
    title: "什么时候用固定 Workflow，什么时候用自主 Agent？",
    type: "tradeoff",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "步骤稳定、风险高、需要审批的任务优先用 Workflow；目标开放、步骤不确定、需要动态探索的任务才适合自主 Agent。",
    core: () => "Workflow 的优势是可控、可审计、可预测；Agent 的优势是灵活和自适应。工程设计常见做法是外层 Workflow 固定风险边界，内层 Agent 处理开放子任务。",
    answer: (s) => `讨论${s.focus}时，应先判断任务的不确定性和风险。如果业务流程固定，例如审批、报表生成、标准客服，可以用 Workflow。若任务需要动态选择工具、多轮探索或处理未知路径，可以引入 Agent。生产系统常采用混合架构：关键节点由 Workflow 控制，Agent 只在受限工具和预算内执行。`,
    score: ["说明 Workflow 和 Agent 的能力边界", "结合任务确定性和风险判断", "说明混合架构", "说明成本、延迟和可审计性", "说明失败和人工审批策略"],
    mistakes: ["认为 Agent 一定比 Workflow 高级", "所有任务都让模型自由规划", "不讲风险和审批", "只比较框架名字"],
    followUps: ["高风险工具如何加审批？", "如何限制 Agent 的预算？", "工作流节点失败后如何恢复？"],
  },
  {
    title: "如何评估它是否真的比普通 LLM 应用更可靠？",
    type: "scenario",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "可靠性不能靠主观演示判断，必须用任务集、trace、成功率、错误分类、人工接管率、延迟和成本共同衡量。",
    core: () => "Agent 增加了工具、状态和循环，也增加了失败面。评估要覆盖最终答案、过程正确性、工具调用正确性和安全边界。",
    answer: (s) => `评估${s.focus}时，先构建代表真实任务的测试集，标注期望结果、允许工具和禁止行为。执行后检查最终答案是否正确，也检查每一步工具参数、权限、状态更新和停止条件。线上再监控任务成功率、人工接管率、重试率、P95 延迟和 token 成本。只要改模型、改 prompt 或加工具，都要跑回归集。`,
    score: ["构建任务级评估集", "评估最终结果和执行过程", "关注工具调用正确率", "监控延迟、成本和人工接管", "改动后做回归"],
    mistakes: ["只看一次 demo", "只评估最终文本", "不检查工具参数", "上线后没有监控"],
    followUps: ["如何标注 Agent 任务集？", "任务成功率和答案正确率有什么区别？", "如何发现某个工具拖慢整体链路？"],
  },
];

const ragSources = [
  { slug: "full-pipeline", sourceId: "datawhale-all-in-rag", focus: "RAG 全链路", domain: "ai-agent", component: "agent-patterns", topic: "rag", doc: "ai-agent/patterns/rag-engineering-production-practice" },
  { slug: "framework", sourceId: "datawhale-wow-rag", focus: "可复用 RAG 管线", domain: "ai-agent", component: "agent-patterns", topic: "rag-framework", doc: "ai-agent/patterns/rag-engineering-production-practice" },
  { slug: "knowledge-app", sourceId: "datawhale-llm-universe", focus: "知识库问答应用", domain: "ai-agent", component: "agent-patterns", topic: "rag-application", doc: "ai-agent/patterns/rag-engineering-production-practice" },
  { slug: "vector-search", sourceId: "datawhale-what-is-vs", focus: "向量检索边界", domain: "ai-agent", component: "agent-patterns", topic: "vector-search", doc: "ai-agent/patterns/rag-engineering-production-practice" },
  { slug: "vector-db", sourceId: "datawhale-easy-vecdb", focus: "向量数据库职责", domain: "ai-agent", component: "agent-patterns", topic: "vector-database", doc: "ai-agent/patterns/rag-engineering-production-practice" },
];

const ragVariants = [
  {
    title: "为什么不能说成“向量库加模型”？",
    type: "principle",
    difficulty: "advanced",
    minutes: 10,
    conclusion: (s) => `${s.focus}要覆盖数据治理、检索、重排、生成、引用、权限和评估，向量库只是索引与召回的一部分。`,
    core: () => "RAG 的目标是让模型基于可追溯证据回答。向量检索只解决候选片段召回，不能保证片段正确、权限正确、版本正确或答案忠实。",
    answer: (s) => `回答${s.focus}时，要先画出完整链路：文档解析、清洗、切分、embedding、索引、召回、rerank、上下文组装、生成、引用和评估。向量库负责相似片段召回，但答案正确性还依赖数据质量、metadata filter、重排、prompt 约束和离线评估。`,
    score: ["说明完整 RAG 链路", "说明向量库职责边界", "说明 metadata 和权限过滤", "说明 rerank 与上下文组装", "说明评估和引用一致性"],
    mistakes: ["只讲 embedding", "不看召回片段", "不做权限过滤", "不做评估集"],
    followUps: ["什么时候需要 hybrid search？", "召回正确但答案错怎么排查？", "如何评估引用是否对应证据？"],
  },
  {
    title: "Chunk 设计如何影响召回和生成质量？",
    type: "principle",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "Chunk 决定检索粒度和上下文完整性，过小会切断证据，过大会引入噪声并增加成本。",
    core: () => "切分策略要结合文档结构、标题层级、表格、代码块、overlap、metadata 和问题类型设计，不能所有资料一刀切。",
    answer: (s) => `在${s.focus}中，Chunk 设计要平衡召回粒度、语义完整性和 token 成本。FAQ 可以按问答对切，技术文档应保留标题层级，表格和代码块要避免被切碎。overlap 能缓解边界问题，但过大会造成重复召回。正确做法是用评估集比较不同 chunk size、overlap 和结构化切分策略。`,
    score: ["说明 chunk 大小权衡", "说明 overlap 的收益和代价", "说明结构化切分", "说明 metadata 继承", "说明用评估集验证"],
    mistakes: ["认为 chunk 越小越好", "忽略标题和表格结构", "overlap 设置过大", "不做实验对比"],
    followUps: ["PDF 表格如何切分？", "代码文档如何切分？", "如何发现答案被切碎？"],
  },
  {
    title: "RAG 答错时应该按什么链路排查？",
    type: "troubleshooting",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "不要第一反应换模型，应该从知识是否存在、解析、切分、索引、召回、重排、上下文和生成约束逐层定位。",
    core: () => "RAG 错误可能发生在任何一层。排障必须把最终答案拆回证据链，看正确证据是否存在、是否被召回、是否被放入上下文、是否被模型忠实使用。",
    answer: (s) => `排查${s.focus}时，先确认知识库中是否有答案，再检查解析是否丢字段、切分是否破坏语义、索引是否是最新版本、metadata filter 是否误过滤。接着看 top-k 召回和 rerank 结果，确认正确证据是否进入上下文。最后检查 prompt 是否要求基于证据回答，以及模型是否在无证据时拒答。`,
    score: ["先确认知识存在", "检查解析和切分", "检查索引版本和过滤条件", "检查召回与重排", "检查生成约束和拒答"],
    mistakes: ["直接换大模型", "只看最终答案", "不保存召回片段", "不区分检索错和生成错"],
    followUps: ["如何保存每次检索 trace？", "metadata filter 误杀怎么发现？", "召回片段太多如何压缩？"],
  },
  {
    title: "如何设计 RAG 评估指标？",
    type: "system-design",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "RAG 评估要分层：检索看证据命中，生成看答案忠实，安全看权限边界，工程看延迟和成本。",
    core: () => "只评估最终答案会掩盖问题来源。必须把 query、标准证据、召回片段、引用、最终答案和人工判定关联起来。",
    answer: (s) => `设计${s.focus}评估时，先构建问题集和标准证据。检索层用 Recall@k、MRR、正确文档命中率；重排层看正确证据是否进入 top-n；生成层看答案正确性、引用一致性和拒答正确性；安全层看越权召回；工程层看 P95 延迟、成本和索引更新时间。`,
    score: ["有问题集和标准证据", "检索层指标明确", "生成层评估忠实性", "安全层评估越权", "工程层评估延迟和成本"],
    mistakes: ["只用人工随便问", "只看 BLEU 或相似度", "没有标准证据", "不评估拒答"],
    followUps: ["如何标注标准证据？", "引用一致性怎么判断？", "线上反馈如何进入评估集？"],
  },
  {
    title: "如何处理权限、版本和知识更新？",
    type: "scenario",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "生产 RAG 必须把权限、版本和更新时间写入 metadata，并在检索前后都做约束。",
    core: () => "知识正确不代表用户有权访问，旧版本正确不代表当前有效。权限过滤、版本控制和增量索引是生产系统和 demo 的分水岭。",
    answer: (s) => `在${s.focus}中，文档入库时就要写入租户、部门、角色、版本、生效时间和来源。检索时先按权限和版本过滤，再做召回和重排。文档更新要支持增量索引、旧版本下线和回滚。生成答案时应带引用和版本信息，避免把过期资料当成当前事实。`,
    score: ["metadata 包含权限和版本", "检索前做权限过滤", "支持增量更新和旧版本下线", "答案带引用和版本", "监控越权和过期知识"],
    mistakes: ["只在前端控制权限", "不同租户共用无过滤索引", "旧文档不下线", "答案不展示证据"],
    followUps: ["多租户向量库怎么设计？", "旧版本召回怎么排查？", "权限变化后索引如何同步？"],
  },
];

const llmSources = [
  { slug: "overview", sourceId: "datawhale-happy-llm", focus: "大模型全景", domain: "llm-foundations", component: "llm-overview", topic: "llm-overview", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "nlp-to-llm", sourceId: "datawhale-base-llm", focus: "从 NLP 到 LLM", domain: "llm-foundations", component: "llm-overview", topic: "nlp-to-llm", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "local-runtime", sourceId: "datawhale-self-llm", focus: "开源模型部署与微调", domain: "llm-foundations", component: "inference", topic: "open-source-llm", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "training-system", sourceId: "datawhale-diy-llm", focus: "训练系统与模型构建", domain: "llm-foundations", component: "transformer", topic: "training-system", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "from-scratch", sourceId: "datawhale-code-your-own-llm", focus: "从零实现 LLM", domain: "llm-foundations", component: "transformer", topic: "llm-from-scratch", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "tiny-model", sourceId: "datawhale-tiny-universe", focus: "小模型实验", domain: "llm-foundations", component: "llm-overview", topic: "small-model", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "post-training", sourceId: "datawhale-post-training-of-llms", focus: "后训练与对齐", domain: "llm-foundations", component: "post-training", topic: "post-training", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "application", sourceId: "datawhale-llm-cookbook", focus: "LLM 应用开发", domain: "llm-foundations", component: "prompt-engineering", topic: "llm-application", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "serving", sourceId: "datawhale-llm-deploy", focus: "推理部署", domain: "llm-foundations", component: "inference", topic: "llm-serving", doc: "llm-foundations/llm-engineering-full-stack-practice" },
  { slug: "architecture", sourceId: "datawhale-llms-from-scratch-cn", focus: "模型结构白盒理解", domain: "llm-foundations", component: "transformer", topic: "llm-architecture", doc: "llm-foundations/llm-engineering-full-stack-practice" },
];

const llmVariants = [
  {
    title: "面试时如何讲清楚它在 LLM 全链路中的位置？",
    type: "principle",
    difficulty: "advanced",
    minutes: 10,
    conclusion: (s) => `${s.focus}不能孤立理解，要放到数据、Tokenizer、模型结构、训练、后训练、推理、应用和评估的链路中定位。`,
    core: () => "LLM 能力来自结构、数据和训练过程共同作用。只讲一个术语会丢失上下游约束，也无法回答工程问题。",
    answer: (s) => `回答${s.focus}时，先说明它属于 LLM 链路中的哪一层，再讲这一层输入什么、输出什么、影响哪些指标。例如推理部署影响延迟、吞吐和显存；后训练影响指令遵循和偏好；Tokenizer 影响上下文预算和成本。最后补充它和 RAG、工具调用、Agent 的关系。`,
    score: ["能定位到 LLM 全链路", "说明输入输出和影响指标", "说明与上下游关系", "说明工程边界", "能给出验证方法"],
    mistakes: ["只背概念", "只讲 API 调用", "不讲数据和评估", "不讲成本和延迟"],
    followUps: ["这一层最常见的瓶颈是什么？", "如何证明改动有效？", "它和 RAG 或 Agent 有什么关系？"],
  },
  {
    title: "为什么不能只看模型参数量？",
    type: "tradeoff",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "参数量只是能力相关因素之一，数据质量、上下文长度、推理框架、量化、后训练和任务匹配同样重要。",
    core: () => "同等参数量模型可能因为数据、训练目标、后训练和部署方式不同表现差异很大；更大模型也可能因为延迟、成本或私有化要求不适合业务。",
    answer: (s) => `讨论${s.focus}时，不能用参数量直接判断系统效果。需要同时看模型结构、训练数据、上下文窗口、推理速度、显存、量化方式、指令遵循、安全边界和任务评估结果。工程上常用模型分级和路由：简单任务用小模型，复杂任务用强模型，高风险任务加入 RAG、工具或人工复核。`,
    score: ["说明参数量不是唯一指标", "补充数据和后训练因素", "补充推理成本和延迟", "说明任务匹配和模型路由", "说明用评估而不是感觉选型"],
    mistakes: ["参数越大越好", "忽略上下文窗口", "忽略部署成本", "不做任务评估"],
    followUps: ["如何做模型路由？", "量化会影响哪些任务？", "小模型适合哪些场景？"],
  },
  {
    title: "后训练、RAG 和微调分别适合解决什么问题？",
    type: "principle",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "后训练主要改行为和偏好，RAG 适合接入可更新知识，微调适合稳定任务格式和领域表达，三者不能互相替代。",
    core: () => "把事实更新交给微调通常成本高且难回滚；把行为对齐交给 RAG 也不合适。正确方案要先判断问题属于知识、行为、格式还是工具能力。",
    answer: (s) => `在${s.focus}相关问题中，先分类需求：如果是私有知识和实时更新，用 RAG；如果是输出风格、指令遵循和偏好排序，用后训练；如果是稳定领域格式、专有表达或小模型适配，可以考虑微调。涉及外部系统动作时，要使用工具调用或 Agent，并加权限和审计。`,
    score: ["区分知识、行为、格式和动作", "说明 RAG 的知识更新优势", "说明后训练的行为边界", "说明微调的适用场景", "说明回滚和评估成本"],
    mistakes: ["用微调修所有事实", "用 RAG 解决行为对齐", "忽略数据质量", "不考虑回滚"],
    followUps: ["事实更新为什么更适合 RAG？", "SFT 数据质量差会怎样？", "如何评估微调是否退化？"],
  },
  {
    title: "推理部署为什么要关注 prefill、decode 和 KV Cache？",
    type: "principle",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "prefill 决定处理上下文的成本，decode 决定生成阶段速度，KV Cache 决定长上下文和并发下的显存压力。",
    core: () => "LLM 推理不是普通函数调用。输入越长，prefill 越重；并发越高，KV Cache 越占显存；batching 提高吞吐但可能影响延迟。",
    answer: (s) => `讲${s.focus}时，要把推理拆成 prefill 和 decode。prefill 处理输入上下文并生成 KV Cache，长 prompt 和 RAG 证据会增加这部分成本。decode 逐步生成 token，通常受 KV Cache、batching 和采样策略影响。生产部署要同时看首 token 延迟、tokens/s、P95 延迟、显存、并发和成本。`,
    score: ["解释 prefill 和 decode", "解释 KV Cache 作用和显存压力", "说明 batching 权衡", "联系长上下文和 RAG", "给出关键线上指标"],
    mistakes: ["只说模型慢", "不区分首 token 延迟和生成速度", "忽略显存", "忽略上下文长度"],
    followUps: ["为什么长上下文首 token 慢？", "continuous batching 解决什么问题？", "量化对 KV Cache 有什么影响？"],
  },
  {
    title: "如何设计 LLM 应用的评估和回归机制？",
    type: "system-design",
    difficulty: "advanced",
    minutes: 12,
    conclusion: () => "LLM 应用必须有离线评估集、线上监控、人工抽检和版本回归，不能只凭交互体验判断质量。",
    core: () => "模型、prompt、RAG 数据、工具和安全策略任一变化都可能引入回归。评估要覆盖正确性、忠实性、安全、延迟和成本。",
    answer: (s) => `评估${s.focus}时，先把真实任务整理成测试集，标注期望答案、标准证据、允许工具和拒答条件。离线看准确率、引用一致性、安全拒答、格式正确率；线上看用户反馈、人工接管、异常率、延迟和成本。每次改模型、prompt、检索策略或工具，都要跑回归并保留版本对比。`,
    score: ["有离线评估集", "覆盖正确性和安全", "线上监控延迟和成本", "变更后做回归", "保留版本对比"],
    mistakes: ["只靠人工试用", "只看答案像不像", "不评估拒答", "改 prompt 不跑回归"],
    followUps: ["如何构建黄金集？", "线上反馈如何进入离线集？", "如何评估幻觉率？"],
  },
];

const engineeringSources = [
  { slug: "dify-platform", sourceId: "datawhale-self-dify", focus: "低代码 AI 应用平台", domain: "ai-agent", component: "agent-platforms", topic: "ai-platform", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "local-model", sourceId: "datawhale-handy-ollama", focus: "本地模型运行时", domain: "ai-agent", component: "agent-platforms", topic: "local-model-runtime", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "assistant-platform", sourceId: "datawhale-coze-ai-assistant", focus: "助手平台应用", domain: "ai-agent", component: "agent-platforms", topic: "assistant-platform", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "protocol-guide", sourceId: "datawhale-llm-protocols-guide", focus: "LLM 协议治理", domain: "ai-agent", component: "agent-platforms", topic: "llm-protocol", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "mcp-lite", sourceId: "datawhale-mcp-lite-dev", focus: "MCP 工具接入", domain: "ai-agent", component: "mcp", topic: "mcp", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "cli-agent", sourceId: "datawhale-anycli", focus: "CLI Agent 工程", domain: "ai-agent", component: "agent-platforms", topic: "cli-agent", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "blog-workflow", sourceId: "datawhale-vibe-blog", focus: "内容生产工作流", domain: "ai-agent", component: "agent-platforms", topic: "workflow", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "coding-workflow", sourceId: "datawhale-smart-dev", focus: "AI 编码工作流", domain: "ai-agent", component: "agent-platforms", topic: "ai-coding", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "openclaw-platform", sourceId: "datawhale-openclaw-tutorial", focus: "可视化 Agent 平台", domain: "ai-agent", component: "agent-platforms", topic: "agent-platform", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "openclaw-practice", sourceId: "datawhale-hand-on-openclaw", focus: "平台化 Agent 实践", domain: "ai-agent", component: "agent-platforms", topic: "agent-platform", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "n8n-workflow", sourceId: "datawhale-handy-n8n", focus: "自动化工作流", domain: "ai-agent", component: "agent-platforms", topic: "workflow", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
  { slug: "cross-platform-agent", sourceId: "datawhale-wow-agent", focus: "跨平台 Agent 框架", domain: "ai-agent", component: "agent-platforms", topic: "agent-framework", doc: "ai-agent/platforms/ai-application-platform-engineering-practice" },
];

const engineeringVariants = [
  {
    title: "系统设计时应该拆成哪些平台层？",
    type: "system-design",
    difficulty: "advanced",
    minutes: 12,
    conclusion: (s) => `${s.focus}要按模型接入、工作流、工具、协议、观测和治理分层，而不是只描述页面和调用接口。`,
    core: () => "平台工程的核心是把多模型、多工具、多用户、多工作流统一治理，保证权限、可观测性、成本和发布可控。",
    answer: (s) => `设计${s.focus}时，可以拆成模型接入层、工作流编排层、工具层、协议层、观测层和治理层。模型接入层处理密钥、路由、降级和限流；工作流层管理节点状态和失败恢复；工具层负责 schema、权限和审计；观测层记录 trace；治理层处理多租户、灰度、回滚和安全策略。`,
    score: ["分层清晰", "模型接入有路由和降级", "工具层有权限和审计", "工作流有状态和恢复", "观测和治理可落地"],
    mistakes: ["只画前端页面", "只说接一个模型接口", "没有权限模型", "没有发布和回滚"],
    followUps: ["模型路由策略怎么设计？", "工具权限在哪里判断？", "工作流失败后如何恢复？"],
  },
  {
    title: "如何在工作流和 Agent 之间做取舍？",
    type: "tradeoff",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "确定步骤和高风险动作适合 Workflow，开放探索和动态决策适合 Agent，生产系统经常两者混合。",
    core: () => "Workflow 提供确定性和审计，Agent 提供灵活性。把所有步骤交给模型会降低可控性，把所有步骤写死又会降低适应性。",
    answer: (s) => `在${s.focus}里，先判断任务是否固定、风险是否高、是否需要审批。如果步骤固定，例如数据同步、通知、审核，优先 Workflow。如果任务需要动态检索、选择工具或多轮探索，可以在受限范围内使用 Agent。常见架构是外层 Workflow 控制关键节点，内层 Agent 处理开放子任务。`,
    score: ["用确定性和风险做判断", "说明 Workflow 的审计优势", "说明 Agent 的灵活优势", "说明混合架构", "说明审批和预算限制"],
    mistakes: ["所有任务都 Agent 化", "所有节点都写死", "不讲审批", "不讲成本和延迟"],
    followUps: ["高风险节点如何人工审批？", "如何限制 Agent 工具范围？", "如何评价混合架构效果？"],
  },
  {
    title: "上线后如何治理成本、权限和可观测性？",
    type: "operations",
    difficulty: "advanced",
    minutes: 10,
    conclusion: () => "上线治理要把模型调用、工具调用、工作流节点和用户权限统一纳入 trace、指标、预算和审计。",
    core: () => "AI 应用的成本和风险来自模型 token、工具副作用、数据权限和多步骤失败。没有观测和治理的平台无法稳定扩展。",
    answer: (s) => `治理${s.focus}时，要记录每次请求的模型、输入输出 token、工具调用、节点耗时、错误类型、用户和租户。成本上设置预算、限流、缓存和模型分级；权限上做最小授权、调用前校验和审计；观测上保留 trace、指标和回放能力。涉及高风险工具时加入审批和回滚。`,
    score: ["记录模型和工具 trace", "有预算、限流和模型分级", "权限最小化并可审计", "有错误分类和回放", "高风险操作可审批可回滚"],
    mistakes: ["只看总 token", "工具调用不审计", "权限只放前端", "没有 trace 回放"],
    followUps: ["如何定位成本突然升高？", "如何防止越权调用工具？", "如何设计灰度发布？"],
  },
];

function writeQuestions() {
  const generated = [];
  for (const source of agentSources) {
    agentVariants.forEach((variant, index) => generated.push(makeAgentQuestion(source, index, variant)));
  }
  for (const source of ragSources) {
    ragVariants.forEach((variant, index) => generated.push(makeGenericQuestion("q-ai-practice-rag", source, index, variant, path.join("questions", "ai-agent", "patterns"))));
  }
  for (const source of llmSources) {
    llmVariants.forEach((variant, index) => generated.push(makeGenericQuestion("q-llm-practice", source, index, variant, path.join("questions", "llm-foundations"))));
  }
  for (const source of engineeringSources) {
    engineeringVariants.forEach((variant, index) => generated.push(makeGenericQuestion("q-ai-practice-platform", source, index, variant, path.join("questions", "ai-agent", "platforms"))));
  }

  for (const item of generated) writeText(item.path, item.content);
  return generated.length;
}

const archived = {
  docsCommunity: archiveDirectory("docs/community"),
  questionsCommunity: archiveDirectory("questions/community"),
  oldAgentDoc: archivePath("docs/ai-agent/foundations/datawhale-agent-practice-to-interview.md"),
  oldRagDoc: archivePath("docs/ai-agent/patterns/datawhale-rag-practice-to-interview.md"),
  oldLlmDoc: archivePath("docs/llm-foundations/datawhale-llm-practice-to-interview.md"),
};

const removedGeneratedQuestions = removeGeneratedQuestions();
writeDocs();
const generatedQuestions = writeQuestions();

console.log(JSON.stringify({
  archived,
  removedGeneratedQuestions,
  generatedMainlineDocs: 4,
  generatedMainlineQuestions: generatedQuestions,
}, null, 2));
