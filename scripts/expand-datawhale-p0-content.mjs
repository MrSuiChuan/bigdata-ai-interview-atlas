import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const today = "2026-04-28";
const shouldWrite = process.argv.includes("--write");

const projects = [
  {
    slug: "hello-agents",
    id: "datawhale-hello-agents",
    category: "ai-agent",
    title: "hello-agents",
    sourceTitle: "Datawhale hello-agents",
    component: "agent-foundations",
    summary: "从零开始构建智能体，适合沉淀 Agent 基础、工具调用、任务循环和项目实践表达。",
    position: "Agent 入门和 runtime 基础项目",
    objects: ["模型", "工具", "任务状态", "执行循环", "停止条件", "观测日志"],
    principles: ["Agent 不是单次模型调用，而是带状态和控制循环的运行时系统。", "工具调用必须配合权限、参数校验、错误处理和审计。", "最小 Agent 也要说明输入、计划、执行、观察和停止。"],
    scenarios: ["从零搭建最小 Agent", "解释 Agent 和普通 LLM App 的区别", "把工具调用 demo 升级成可观测系统"],
    crossCheck: ["具体框架 API", "模型 tool calling 参数", "工具权限和沙箱能力"],
  },
  {
    slug: "agentic-ai",
    id: "datawhale-agentic-ai",
    category: "ai-agent",
    title: "agentic-ai",
    sourceTitle: "Datawhale agentic-ai",
    component: "agentic-ai",
    summary: "围绕 Agentic AI 课程内容整理规划、行动、反馈、工具使用和多步任务边界。",
    position: "Agentic AI 思维和多步执行项目",
    objects: ["任务目标", "计划", "行动", "反馈", "工具结果", "反思"],
    principles: ["Agentic AI 的重点是让模型在任务循环中持续选择行动，而不是一次性回答。", "规划和行动必须被状态、工具结果和停止条件约束。", "反思机制只能改善部分路径选择，不能替代验证和评估。"],
    scenarios: ["解释 agentic workflow", "设计多步工具任务", "评估反思机制是否有效"],
    crossCheck: ["课程原始定义", "框架 planning API", "工具调用格式"],
  },
  {
    slug: "agent-tutorial",
    id: "datawhale-agent-tutorial",
    category: "ai-agent",
    title: "agent-tutorial",
    sourceTitle: "Datawhale agent-tutorial",
    component: "agent-foundations",
    summary: "适合做 Agent 入门路线和基础面试题素材，把概念、流程和最小实现串起来。",
    position: "Agent 入门教程项目",
    objects: ["任务", "Prompt", "工具列表", "模型输出", "工具执行", "最终答案"],
    principles: ["Agent 入门不能只学 prompt，要理解工具 schema、执行器和结果回填。", "最小实现应能解释模型输出如何转成动作。", "教学 demo 必须进一步补生产边界。"],
    scenarios: ["从零说明 Agent 架构", "把教程项目讲成面试项目", "识别 demo 与生产系统差距"],
    crossCheck: ["所用框架版本", "工具调用协议", "模型接口行为"],
  },
  {
    slug: "self-harness",
    id: "datawhale-self-harness",
    category: "ai-agent",
    title: "self-harness",
    sourceTitle: "Datawhale self-harness",
    component: "harness-engineering",
    summary: "聚焦长时间运行 Agent 的 Harness Engineering，适合整理可靠性、状态恢复、评估和观测。",
    position: "长任务 Agent 可靠性工程项目",
    objects: ["任务状态机", "Checkpoint", "工具调用日志", "错误分类", "人工接管", "评估集"],
    principles: ["Harness 把 Agent 从 demo 包装成可恢复、可观测、可评估的运行系统。", "长任务失败后必须知道执行到哪里、是否可重试、是否有副作用。", "评估和 tracing 是长任务 Agent 的基本能力。"],
    scenarios: ["设计长任务 Agent", "排查 Agent 执行中断", "说明 checkpoint 保存什么"],
    crossCheck: ["具体 harness 实现", "日志/追踪工具接口", "模型调用重试语义"],
  },
  {
    slug: "handy-multi-agent",
    id: "datawhale-handy-multi-agent",
    category: "ai-agent",
    title: "handy-multi-agent",
    sourceTitle: "Datawhale handy-multi-agent",
    component: "multi-agent",
    summary: "基于 CAMEL 多 Agent 教程，适合整理角色划分、通信、协同边界和成本控制。",
    position: "多 Agent 协作实践项目",
    objects: ["角色", "消息", "共享上下文", "协作协议", "冲突解决", "终止条件"],
    principles: ["多 Agent 的价值是任务分工和审查制衡，不是角色数量。", "角色边界不清会导致重复推理、上下文污染和成本膨胀。", "通信协议和最终决策权是多 Agent 设计核心。"],
    scenarios: ["设计多 Agent 代码生成", "分析多 Agent 失控", "比较多 Agent 和 workflow"],
    crossCheck: ["CAMEL API", "多 Agent 框架版本", "消息协议语义"],
  },
  {
    slug: "hugging-multi-agent",
    id: "datawhale-hugging-multi-agent",
    category: "ai-agent",
    title: "hugging-multi-agent",
    sourceTitle: "Datawhale hugging-multi-agent",
    component: "multi-agent-frameworks",
    summary: "基于 MetaGPT 等多 Agent 思路，适合整理角色型协作、工作流产物和工程治理。",
    position: "角色型多 Agent 工程实践项目",
    objects: ["产品角色", "工程角色", "产物", "流程", "共享状态", "评审"],
    principles: ["角色型多 Agent 要把协作产物和责任边界说清楚。", "流程化角色可以提升结构化输出，但会增加延迟和成本。", "多角色系统需要可回放的过程记录。"],
    scenarios: ["解释 MetaGPT 类框架", "设计角色型需求到代码流程", "评估多角色协作质量"],
    crossCheck: ["MetaGPT 行为", "框架状态管理", "生成物格式"],
  },
  {
    slug: "easy-langent",
    id: "datawhale-easy-langent",
    category: "ai-agent",
    title: "easy-langent",
    sourceTitle: "Datawhale easy-langent",
    component: "agent-frameworks",
    summary: "围绕 LangChain、LangGraph、Lagent 等生态，适合整理框架选型和 runtime 能力对比。",
    position: "Agent 框架学习项目",
    objects: ["Chain", "Graph", "State", "Tool", "Node", "Edge", "Runtime"],
    principles: ["Agent 框架选型要看状态、控制流、工具、持久化和观测，不是只看 demo。", "Graph 类框架适合显式控制流程和恢复。", "框架抽象会降低样板代码，但也带来调试和迁移成本。"],
    scenarios: ["比较 LangChain 和 LangGraph", "设计带状态的 Agent 流程", "解释框架选型指标"],
    crossCheck: ["各框架官方 API", "状态持久化能力", "tracing 集成方式"],
  },
  {
    slug: "agent-skills-with-anthropic",
    id: "datawhale-agent-skills-with-anthropic",
    category: "ai-agent",
    title: "agent-skills-with-anthropic",
    sourceTitle: "Datawhale agent-skills-with-anthropic",
    component: "agent-skills",
    summary: "围绕 Agent Skills 课程整理 skill、tool、上下文工程和任务封装边界。",
    position: "Agent skills 和工具工程项目",
    objects: ["Skill", "Tool", "Instruction", "Context", "调用条件", "失败策略"],
    principles: ["Skill 更偏任务能力封装，Tool 更偏可执行外部动作。", "Skills 需要清晰的触发条件、输入输出和边界。", "上下文工程决定模型是否能稳定使用 skill。"],
    scenarios: ["区分 skill 和 tool", "设计一个 Agent skill", "排查 skill 触发错误"],
    crossCheck: ["Anthropic 课程定义", "具体平台 skill 机制", "工具调用 API"],
  },
  {
    slug: "hello-generic-agent",
    id: "datawhale-hello-generic-agent",
    category: "ai-agent",
    title: "hello-generic-agent",
    sourceTitle: "Datawhale hello-generic-agent",
    component: "generic-agent",
    summary: "适合整理通用 Agent、自进化能力边界和可配置 Agent 的工程风险。",
    position: "通用 Agent 使用和边界项目",
    objects: ["通用任务描述", "工具集合", "配置", "记忆", "反馈", "改进策略"],
    principles: ["Generic Agent 的难点是任务边界和能力约束，而不是声称什么都能做。", "自进化需要评估闭环，否则可能只是错误自我强化。", "通用性越强，权限和安全治理越重要。"],
    scenarios: ["解释通用 Agent 边界", "设计自改进评估闭环", "控制通用 Agent 权限"],
    crossCheck: ["项目实际能力", "安全沙箱", "自进化机制"],
  },
  {
    slug: "all-in-rag",
    id: "datawhale-all-in-rag",
    category: "rag",
    title: "all-in-rag",
    sourceTitle: "Datawhale all-in-rag",
    component: "rag-full-stack",
    summary: "RAG 技术全栈指南，适合整理文档治理、检索、重排、生成、评估和生产优化。",
    position: "RAG 全链路核心项目",
    objects: ["文档", "Chunk", "Embedding", "索引", "Retriever", "Reranker", "Generator", "评估集"],
    principles: ["RAG 是知识接入链路，不是向量库加模型。", "召回、重排和生成要分层评估。", "企业 RAG 必须处理权限、增量更新和证据引用。"],
    scenarios: ["设计企业知识库 RAG", "排查 RAG 答错", "构建 RAG 评估集"],
    crossCheck: ["向量库能力", "Embedding 模型参数", "Rerank API"],
  },
  {
    slug: "wow-rag",
    id: "datawhale-wow-rag",
    category: "rag",
    title: "wow-rag",
    sourceTitle: "Datawhale wow-rag",
    component: "rag-framework",
    summary: "RAG 框架和教程项目，适合整理可复用 RAG 管线、模块边界和框架化实践。",
    position: "RAG 框架实践项目",
    objects: ["Loader", "Splitter", "Retriever", "Reranker", "Prompt", "Pipeline", "Cache"],
    principles: ["RAG 框架要把文档、检索、重排、生成和评估模块化。", "框架复用不能牺牲问题定位能力。", "模块边界清晰才能替换检索器或模型。"],
    scenarios: ["设计 RAG 框架", "替换检索模块", "定位 RAG pipeline 瓶颈"],
    crossCheck: ["框架依赖版本", "向量库接口", "模型调用行为"],
  },
  {
    slug: "llm-universe",
    id: "datawhale-llm-universe",
    category: "rag",
    title: "llm-universe",
    sourceTitle: "Datawhale llm-universe",
    component: "llm-application-development",
    summary: "面向大模型应用开发，适合整理 RAG 应用、知识库问答、应用工程和端到端项目表达。",
    position: "LLM 应用与 RAG 落地项目",
    objects: ["应用入口", "知识库", "检索链", "Prompt", "模型", "前端", "评估"],
    principles: ["LLM 应用不是一次 API 调用，需要知识、工具、评估和交互层共同工作。", "知识库问答要把数据治理和用户体验一起设计。", "应用工程要关注异常、成本和迭代。"],
    scenarios: ["讲述 LLM 应用项目", "设计知识库问答系统", "从 demo 走向生产"],
    crossCheck: ["使用框架版本", "模型 API", "部署方式"],
  },
  {
    slug: "what-is-vs",
    id: "datawhale-what-is-vs",
    category: "rag",
    title: "what-is-vs",
    sourceTitle: "Datawhale what-is-vs",
    component: "vector-search",
    summary: "向量检索与 RAG 实践，适合整理向量表示、相似度、ANN、召回和检索边界。",
    position: "向量检索原理项目",
    objects: ["向量", "相似度", "ANN 索引", "过滤", "召回", "排序", "Embedding"],
    principles: ["向量相似不等于答案正确。", "ANN 提升效率但可能牺牲部分召回。", "向量检索需要和关键词检索、过滤、重排配合。"],
    scenarios: ["解释向量检索", "选择 ANN 索引", "排查相似但不正确的召回"],
    crossCheck: ["具体向量库索引类型", "相似度实现", "过滤语义"],
  },
  {
    slug: "easy-vecdb",
    id: "datawhale-easy-vecdb",
    category: "rag",
    title: "easy-vecdb",
    sourceTitle: "Datawhale easy-vecdb",
    component: "vector-database",
    summary: "向量数据库基础教程，适合整理向量库职责、索引、过滤、更新和 RAG 边界。",
    position: "向量数据库基础项目",
    objects: ["Collection", "Embedding", "Index", "Metadata", "Filter", "TopK", "Update"],
    principles: ["向量数据库负责存储、索引和相似度检索，不负责答案正确性。", "metadata filter 既能提高精确性，也可能过滤掉正确答案。", "选型要看规模、更新、过滤、延迟、生态和运维成本。"],
    scenarios: ["向量库选型", "设计知识库索引", "排查 metadata 过滤问题"],
    crossCheck: ["具体产品能力", "索引参数", "一致性和更新语义"],
  },
  {
    slug: "happy-llm",
    id: "datawhale-happy-llm",
    category: "llm",
    title: "happy-llm",
    sourceTitle: "Datawhale happy-llm",
    component: "llm-foundations",
    summary: "从零开始构建大模型，适合整理 LLM 学习路径、基础概念和训练到应用的主线。",
    position: "大模型基础学习项目",
    objects: ["数据", "Tokenizer", "Transformer", "预训练", "后训练", "推理", "评估"],
    principles: ["LLM 要按数据、表示、架构、训练、推理和应用分层解释。", "模型能力不是应用可靠性。", "基础学习路线必须连接工程落地。"],
    scenarios: ["系统解释 LLM", "搭建 LLM 学习路径", "区分模型层和应用层"],
    crossCheck: ["模型架构细节", "训练方法定义", "推理框架行为"],
  },
  {
    slug: "base-llm",
    id: "datawhale-base-llm",
    category: "llm",
    title: "base-llm",
    sourceTitle: "Datawhale base-llm",
    component: "llm-theory-to-engineering",
    summary: "从 NLP 到 LLM 的算法全栈教程，适合整理传统 NLP、Transformer 和 LLM 的演进关系。",
    position: "NLP 到 LLM 算法主线项目",
    objects: ["词表示", "序列建模", "Attention", "Transformer", "预训练", "指令学习"],
    principles: ["LLM 继承 NLP 的表示学习问题，但通过规模化预训练和上下文学习扩展能力。", "Transformer 改变的是并行建模和长距离依赖方式。", "传统 NLP 方法仍能帮助理解 token、检索和评估。"],
    scenarios: ["解释 NLP 到 LLM 演进", "对比 RNN 和 Transformer", "讲清预训练价值"],
    crossCheck: ["算法定义", "论文结论", "模型架构差异"],
  },
  {
    slug: "self-llm",
    id: "datawhale-self-llm",
    category: "llm",
    title: "self-llm",
    sourceTitle: "Datawhale self-llm",
    component: "open-source-llm-deployment-finetuning",
    summary: "开源大模型部署和微调实践，适合整理本地部署、LoRA、推理服务和资源约束。",
    position: "开源 LLM 部署微调项目",
    objects: ["模型权重", "显存", "量化", "LoRA", "推理服务", "数据集", "许可证"],
    principles: ["本地部署不能只看参数量，还要看上下文、KV Cache、精度、框架和并发。", "微调改善任务适配，不等于注入可靠事实。", "许可证和数据安全是开源模型落地边界。"],
    scenarios: ["部署开源模型", "设计 LoRA 微调", "排查显存不足"],
    crossCheck: ["模型许可证", "推理框架参数", "微调库版本"],
  },
  {
    slug: "diy-llm",
    id: "datawhale-diy-llm",
    category: "llm",
    title: "diy-llm",
    sourceTitle: "Datawhale diy-llm",
    component: "llm-full-stack-training",
    summary: "系统性大语言模型构建课程，适合整理预训练数据、Tokenizer、Transformer、MoE、CUDA/Triton 和分布式训练。",
    position: "LLM 全栈训练实践项目",
    objects: ["预训练数据", "Tokenizer", "模型结构", "MoE", "CUDA", "Triton", "分布式训练"],
    principles: ["从零训练 LLM 是数据、模型、系统和评估共同工程。", "训练系统瓶颈不只在模型代码，也在数据吞吐、通信和显存。", "MoE 提高参数规模但引入路由和负载均衡问题。"],
    scenarios: ["解释训练全链路", "分析训练瓶颈", "比较 dense 和 MoE"],
    crossCheck: ["训练框架 API", "CUDA/Triton 示例", "MoE 论文结论"],
  },
  {
    slug: "code-your-own-llm",
    id: "datawhale-code-your-own-llm",
    category: "llm",
    title: "code-your-own-llm",
    sourceTitle: "Datawhale code-your-own-llm",
    component: "llm-white-box-implementation",
    summary: "端到端定义模型从零训练到工程落地，适合整理白盒实现和面试中的机制解释。",
    position: "LLM 白盒实现项目",
    objects: ["Tokenizer", "Dataset", "Decoder Block", "Loss", "Optimizer", "Checkpoint", "推理"],
    principles: ["自己实现 LLM 的价值在于解释 token 如何流过模型，而不是追求生产规模。", "白盒实现能帮助理解 attention mask、loss、训练循环和推理生成。", "小规模实现不能直接代表大规模训练结论。"],
    scenarios: ["解释 decoder-only 训练", "手写 attention 机制", "说明小模型实验边界"],
    crossCheck: ["模型公式", "实现代码行为", "训练目标"],
  },
  {
    slug: "tiny-universe",
    id: "datawhale-tiny-universe",
    category: "llm",
    title: "tiny-universe",
    sourceTitle: "Datawhale tiny-universe",
    component: "llm-white-box-systems",
    summary: "小模型和训练系统实践，适合整理小规模实验、训练闭环和系统边界。",
    position: "小模型训练系统项目",
    objects: ["小模型", "训练数据", "训练循环", "评估", "推理", "实验记录"],
    principles: ["小模型适合验证机制和训练流程，不适合直接外推大模型能力。", "实验闭环要包含数据、训练、评估和对照。", "训练系统要记录配置、指标和 checkpoint。"],
    scenarios: ["设计小模型实验", "解释小模型边界", "做训练回归分析"],
    crossCheck: ["实验代码", "评估指标", "模型结构"],
  },
  {
    slug: "post-training-of-llms",
    id: "datawhale-post-training-of-llms",
    category: "llm",
    title: "post-training-of-llms",
    sourceTitle: "Datawhale post-training-of-llms",
    component: "post-training",
    summary: "围绕 LLM 后训练课程，适合整理 SFT、偏好优化、DPO/RLHF、评估和安全边界。",
    position: "LLM 后训练项目",
    objects: ["SFT 数据", "Preference Pair", "Reward Model", "DPO", "RLHF", "评估集", "安全策略"],
    principles: ["后训练主要改善指令遵循、偏好对齐和安全行为，不等于事实知识实时更新。", "偏好数据质量决定偏好优化上限。", "后训练必须配合回归评估防止能力退化。"],
    scenarios: ["比较 SFT 和 DPO", "设计偏好数据", "评估后训练效果"],
    crossCheck: ["算法公式", "训练框架实现", "评估方法"],
  },
  {
    slug: "llm-cookbook",
    id: "datawhale-llm-cookbook",
    category: "llm",
    title: "llm-cookbook",
    sourceTitle: "Datawhale llm-cookbook",
    component: "llm-application-development",
    summary: "面向开发者的 LLM 入门教程，适合整理 API 调用、Prompt、RAG、工具和评估的应用开发路径。",
    position: "LLM 应用开发项目",
    objects: ["API", "Prompt", "上下文", "RAG", "工具", "评估", "错误处理"],
    principles: ["LLM 应用开发要关注超时、限流、成本、日志和输出约束。", "Prompt 是任务规约，不是魔法咒语。", "应用可靠性来自评估和工程治理。"],
    scenarios: ["设计 LLM API 应用", "Prompt 工程治理", "构建评估闭环"],
    crossCheck: ["API 参数", "模型版本", "价格和限流"],
  },
  {
    slug: "llm-deploy",
    id: "datawhale-llm-deploy",
    category: "llm",
    title: "llm-deploy",
    sourceTitle: "Datawhale llm-deploy",
    component: "llm-deployment",
    summary: "大模型推理和部署理论与实践，适合整理推理引擎、显存、吞吐、延迟和生产部署。",
    position: "LLM 推理部署项目",
    objects: ["推理引擎", "KV Cache", "Batching", "量化", "显存", "吞吐", "延迟"],
    principles: ["部署优化要同时看 prefill、decode、KV Cache 和 batching。", "吞吐和延迟常常互相制约。", "量化、并发和调度要结合业务 SLO。"],
    scenarios: ["设计推理服务", "排查推理延迟", "选择部署框架"],
    crossCheck: ["vLLM/Ollama/Transformers 行为", "GPU 驱动和 CUDA", "模型许可证"],
  },
  {
    slug: "llms-from-scratch-cn",
    id: "datawhale-llms-from-scratch-cn",
    category: "llm",
    title: "llms-from-scratch-cn",
    sourceTitle: "Datawhale llms-from-scratch-cn",
    component: "llm-from-scratch",
    summary: "从零构建大语言模型，适合整理 GLM/Llama/RWKV 类模型实现和从机制到代码的白盒理解。",
    position: "从零构建 LLM 项目",
    objects: ["模型结构", "Attention", "位置编码", "训练循环", "采样", "推理缓存"],
    principles: ["从零实现帮助理解架构差异和训练细节。", "不同模型家族在注意力、位置编码、归一化和推理缓存上有差异。", "白盒实现要说明可验证机制和规模边界。"],
    scenarios: ["比较 Llama/GLM/RWKV", "解释推理缓存", "从代码讲模型结构"],
    crossCheck: ["模型论文", "实现代码", "具体架构参数"],
  },
];

const questionTypes = [
  { suffix: "0001", type: "principle", label: "原理题", prompt: (p) => `${p.title} 为什么不能只当成教程项目，应该提炼成哪些面试原理？` },
  { suffix: "0002", type: "system-design", label: "系统设计题", prompt: (p) => `如果基于 ${p.title} 做一个可面试的系统方案，核心架构应该怎么讲？` },
  { suffix: "0003", type: "troubleshooting", label: "排障题", prompt: (p) => `${p.title} 相关实践在生产中失败时，应该沿着哪些链路排查？` },
  { suffix: "0004", type: "tradeoff", label: "权衡题", prompt: (p) => `${p.title} 对应方案的核心收益和代价分别是什么？` },
  { suffix: "0005", type: "scenario", label: "项目复盘题", prompt: (p) => `面试中如何把 ${p.title} 讲成一个高质量项目复盘？` },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function frontmatter(data) {
  return `---\n${yaml.dump(data, { lineWidth: 120, noRefs: true }).trim()}\n---\n`;
}

function docPath(project) {
  return path.join(repoRoot, "docs", "community", "datawhale", project.category, `${project.slug}.md`);
}

function questionPath(project, q) {
  return path.join(repoRoot, "questions", "community", "datawhale", `q-community-datawhale-${project.slug}-${q.suffix}.md`);
}

function docContent(project, index) {
  const data = {
    kb_id: `community/datawhale/${project.category}/${project.slug}`,
    title: `Datawhale ${project.title} 项目整理`,
    domain: "community",
    component: "datawhale",
    topic: project.slug,
    difficulty: "advanced",
    status: "reviewed",
    sidebar_position: index + 10,
    version_scope: `${project.sourceTitle} as organized on ${today}`,
    last_verified_at: today,
    source_ids: [project.id],
    claim_ids: [],
  };
  return `${frontmatter(data)}
# 一句话定位

${project.summary}

# 项目在面试系统里的位置

${project.title} 在本系统中被归入「${project.position}」。整理它的目的不是复刻原仓库目录，而是把社区项目经验转成面试可表达的知识点、系统设计能力和项目复盘素材。

# 核心对象

${project.objects.map((item, i) => `${i + 1}. ${item}：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。`).join("\n")}

# 核心原理

${project.principles.map((item, i) => `${i + 1}. ${item}`).join("\n")}

# 可转化的面试场景

${project.scenarios.map((item, i) => `${i + 1}. ${item}`).join("\n")}

# 标准回答框架

回答 ${project.title} 相关问题时，建议按四步组织：

1. 先说明它解决的工程问题：${project.position}。
2. 再说明关键对象：${project.objects.slice(0, 5).join("、")}。
3. 然后讲清执行链路、状态变化、失败恢复和可观测性。
4. 最后补充边界：哪些结论来自 Datawhale trusted-community，哪些 API、协议或版本行为需要官方文档交叉复核。

# 常见误区

1. 只介绍仓库做了什么，不提炼背后的通用机制。
2. 把教程步骤当成面试答案，没有讲对象、状态和链路。
3. 不说明项目适用边界和生产化差距。
4. 把社区经验直接说成官方事实。

# 需要官方交叉复核的点

${project.crossCheck.map((item, i) => `${i + 1}. ${item}`).join("\n")}

# 题库入口

${questionTypes.map((q) => `1. \`q-community-datawhale-${project.slug}-${q.suffix}\``).join("\n")}
`;
}

function questionContent(project, q) {
  const qid = `q-community-datawhale-${project.slug}-${q.suffix}`;
  const title = q.prompt(project);
  const firstObjects = project.objects.slice(0, 4).join("、");
  const data = {
    id: qid,
    title,
    domain: "community",
    component: "datawhale",
    topic: project.slug,
    question_type: q.type,
    difficulty: "advanced",
    status: "reviewed",
    version_scope: `${project.sourceTitle} as organized on ${today}`,
    last_verified_at: today,
    source_ids: [project.id],
    claim_ids: [],
    related_docs: [`community/datawhale/${project.category}/${project.slug}`],
    estimated_minutes: 10,
  };
  const standard = q.type === "principle"
    ? `${project.title} 不能只当成教程项目，因为面试考察的是它背后的可迁移原理。应该先说明它属于${project.position}，再讲 ${firstObjects} 这些对象如何协作，最后补上工程边界和需要官方复核的部分。`
    : q.type === "system-design"
      ? `基于 ${project.title} 讲系统设计时，要先抽象目标和边界，再画出 ${firstObjects} 等核心对象的协作链路，并补充状态存储、失败恢复、观测指标和权限控制。不能只复述安装步骤或 notebook 流程。`
      : q.type === "troubleshooting"
        ? `${project.title} 相关实践失败时，要先按链路分层定位：输入是否正确、核心对象状态是否异常、外部依赖是否失败、日志和指标是否能解释现象。不能直接把失败归因于模型或框架。`
        : q.type === "tradeoff"
          ? `${project.title} 的收益在于降低学习和实践门槛，把复杂主题组织成可操作路径；代价是教程场景和生产系统仍有距离。面试中要主动说明哪些经验可迁移，哪些结论需要结合官方文档和真实业务复核。`
          : `复盘 ${project.title} 时，要按背景、目标、方案、关键对象、故障处理、评估指标和个人贡献来讲。重点不是说“我学过这个仓库”，而是说明你能从项目中抽象出可复用的工程方法。`;
  return `${frontmatter(data)}
# 题目

${title}

# 一句话结论

${standard}

# 核心机制

${project.principles.map((item, i) => `${i + 1}. ${item}`).join("\n")}

# 标准答案

${standard} 具体回答时要把 ${project.objects.slice(0, 5).join("、")} 放到同一条链路里解释，说明它们分别承担什么职责、维护什么状态、异常时如何定位。最后要补充：Datawhale 在这里作为 trusted-community 来源，适合提供项目经验和学习路径；涉及 API、协议、框架版本或模型能力边界时，必须继续用官方来源交叉复核。

# 必答点

1. 说明项目定位：${project.position}。
2. 说明核心对象：${project.objects.slice(0, 5).join("、")}。
3. 说明执行链路和状态变化。
4. 说明失败排查或工程权衡。
5. 说明 trusted-community 和官方复核边界。

# 常见误答

1. 只背项目名或仓库目录。
2. 只讲安装步骤，不讲机制。
3. 不讲异常和边界。
4. 把社区经验直接当成官方事实。

# 延伸追问

${project.scenarios.map((item, i) => `${i + 1}. ${item} 时，你会如何设计评估指标？`).join("\n")}
`;
}

function addMissingSources() {
  const sourceFile = path.join(repoRoot, "sources", "community", "datawhale.yaml");
  const rows = yaml.load(fs.readFileSync(sourceFile, "utf8")) || [];
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const project of projects) {
    if (!byId.has(project.id)) {
      rows.push({
        id: project.id,
        title: project.sourceTitle,
        kind: "community-course",
        component: project.component,
        url: `https://github.com/datawhalechina/${project.slug}`,
        version_scope: `Datawhale GitHub repository as verified on ${today}`,
        last_verified_at: today,
        trust_level: "trusted-community",
        notes: `${project.summary} API、协议、框架版本和模型能力边界需要官方来源交叉复核。`,
        source_tier: "trusted-community",
        category: project.category === "rag" ? "RAG" : project.category === "llm" ? "LLM" : "AI Agent",
        subcategory: project.component,
        import_priority: "P0",
        import_status: "question-ready",
        use_for: ["学习路径", "项目实践", "面试题素材"],
        requires_official_cross_check: ["API 行为", "协议细节", "框架版本", "模型能力边界"],
        license_checked: false,
        commit_pinned: false,
      });
    } else {
      const row = byId.get(project.id);
      row.source_tier = "trusted-community";
      row.trust_level = "trusted-community";
      row.import_priority = "P0";
      row.import_status = "question-ready";
      row.category = row.category || (project.category === "rag" ? "RAG" : project.category === "llm" ? "LLM" : "AI Agent");
      row.subcategory = row.subcategory || project.component;
      row.use_for = row.use_for || ["学习路径", "项目实践", "面试题素材"];
      row.requires_official_cross_check = row.requires_official_cross_check || ["API 行为", "协议细节", "框架版本", "模型能力边界"];
      row.license_checked = row.license_checked ?? false;
      row.commit_pinned = row.commit_pinned ?? false;
    }
  }
  if (shouldWrite) fs.writeFileSync(sourceFile, yaml.dump(rows, { lineWidth: 120, noRefs: true }), "utf8");
}

function writeIndex() {
  const groups = [
    ["AI Agent", "ai-agent", projects.filter((p) => p.category === "ai-agent")],
    ["RAG", "rag", projects.filter((p) => p.category === "rag")],
    ["大模型", "llm", projects.filter((p) => p.category === "llm")],
  ];
  const data = {
    kb_id: "community/datawhale/p0-project-index",
    title: "Datawhale P0 项目整理索引",
    domain: "community",
    component: "datawhale",
    topic: "p0-project-index",
    difficulty: "intermediate",
    status: "reviewed",
    sidebar_position: 6,
    version_scope: `Datawhale P0 project index generated on ${today}`,
    last_verified_at: today,
    source_ids: [],
    claim_ids: [],
  };
  const body = `${frontmatter(data)}
# 说明

这页汇总 P0 项目的整理进度。P0 项目不是直接搬运到系统，而是整理成项目页、面试题和主知识库映射。

# 汇总

1. P0 项目数：${projects.length}
2. 项目整理页：${projects.length}
3. 项目面试题：${projects.length * questionTypes.length}

${groups.map(([label, folder, rows]) => `# ${label}\n\n${rows.map((p) => `1. [${p.title}](./${folder}/${p.slug})：${p.summary}`).join("\n")}`).join("\n\n")}
`;
  const out = path.join(repoRoot, "docs", "community", "datawhale", "p0-project-index.md");
  if (shouldWrite) fs.writeFileSync(out, body, "utf8");
}

addMissingSources();
for (const [index, project] of projects.entries()) {
  const dpath = docPath(project);
  ensureDir(path.dirname(dpath));
  if (shouldWrite) fs.writeFileSync(dpath, docContent(project, index), "utf8");
  for (const q of questionTypes) {
    const qpath = questionPath(project, q);
    ensureDir(path.dirname(qpath));
    if (shouldWrite) fs.writeFileSync(qpath, questionContent(project, q), "utf8");
  }
}
writeIndex();
console.log(JSON.stringify({ p0Projects: projects.length, docs: projects.length + 1, questions: projects.length * questionTypes.length, write: shouldWrite }, null, 2));
