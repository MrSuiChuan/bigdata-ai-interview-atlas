# Datawhale 内容导入执行计划

## 目标

把 Datawhale 相关仓库系统吸收到当前“大数据 + AI 面试题系统”中，但不把外部资料简单堆到导航里。导入后的内容必须形成稳定的知识结构，服务于面试复习、系统设计回答和工程实践理解。

## 当前结论

截至 2026-04-26，`datawhalechina` 组织公开仓库数量约为 199 个。当前系统不应该全量导入，而应该分层处理：

1. 直接导入池：31 个，主要进入 `ai-agent` 的 `foundations`、`frameworks`、`patterns`、`protocols`、`platforms`、`cases`。
2. LLM 基础补充池：16 个，建议新建 `llm-foundations` 模块承接。
3. 大数据补充池：优先处理 `juicy-bigdata` 和 `wonderful-sql`。
4. 其余仓库暂不进入主系统，只保留为未来扩展候选。

## 导入原则

1. 不整仓搬运，只抽取可服务面试系统的知识单元。
2. 优先增补现有主文，只有新主题足够独立时才新建页面。
3. 平台类内容进入 `platforms`，案例类内容进入 `cases`，协议类内容进入 `protocols`。
4. `patterns` 只接收能独立支撑高质量面试题的通用架构模式。
5. 翻译类、课程类、社区教程类仓库可以作为辅助来源，但涉及协议、产品行为、API 行为、模型能力时必须用官方文档二次核验。
6. 所有用户可见文档使用中文，专业术语和官方名称可以保留英文。
7. 每个导入批次必须通过 `npm.cmd run validate` 和 `npm.cmd run build`。

## 输出标准

每个成功导入的知识单元至少应该形成下面闭环：

1. 知识库主文：讲清核心对象、执行链路、边界条件和原理。
2. 面试题：把主文压缩成可答、可追问、可评分的题目。
3. 样例代码：只在有助于理解时加入最小示例。
4. 来源标注：记录 Datawhale 仓库来源；需要官方复核的内容再绑定官方来源。

## 阶段 0：导入台账

目标是把候选仓库、优先级、目标目录、导入方式和核验要求写死。

交付物：

1. `docs/blueprint/datawhale-import-plan.md`
2. `docs/blueprint/datawhale-import-matrix.md`

完成标准：

1. 47 个候选仓库全部入表。
2. 每个仓库都有目标落点。
3. 每个仓库都有导入方式。
4. 每个仓库都有是否需要官方复核的标记。

## 阶段 1：P0 主干导入

优先处理 12 个仓库：

1. `hello-agents`
2. `all-in-rag`
3. `self-dify`
4. `handy-ollama`
5. `coze-ai-assistant`
6. `llm-protocols-guide`
7. `mcp-lite-dev`
8. `easy-vecdb`
9. `what-is-vs`
10. `self-harness`
11. `handy-multi-agent`
12. `wow-agent`

目标：

1. 补齐 Agent 基础主线。
2. 补齐 RAG、向量检索、向量数据库主线。
3. 建立 Dify、Ollama、Coze、MCP、运行时工程的 `platforms` 和 `protocols` 内容。
4. 保证新增页面数量受控，优先增强现有主文。

建议交付：

1. `platforms/dify` 主文和题库。
2. `platforms/ollama` 主文和题库。
3. `platforms/coze` 主文和题库。
4. `protocols/mcp` 补充极简开发和边界说明。
5. RAG 主线补充向量数据库、向量检索和全链路案例。
6. Agent 主线补充从零构建、运行时与多智能体工程实践。

## 阶段 2：P1 平台与案例导入

处理仓库：

1. `handy-n8n`
2. `anycli`
3. `hello-generic-agent`
4. `easy-pocket`
5. `resonant-soul`
6. `video-devour`
7. `vibe-blog`
8. `smart-dev`
9. `openclaw-tutorial`
10. `hand-on-openclaw`

目标：

1. 建立 `cases` 目录的真实案例内容。
2. 补齐 n8n、CLI agent、PocketFlow、OpenClaw 等平台或运行时知识。
3. 把多智能体写作、视频笔记、心理健康 Agent、AI 编程工作流转化成系统设计案例。

## 阶段 3：P2 补充导入

处理仓库：

1. `agentic-ai`
2. `agent-skills-with-anthropic`
3. `agent-tutorial`
4. `hugging-multi-agent`
5. `easy-langent`
6. `wow-rag`
7. `llm-universe`
8. `unlock-deepseek`

目标：

1. 补充 Agentic AI、Agent Skills、多智能体和 RAG 框架视角。
2. 把 DeepSeek 实践类内容转成案例，不把模型宣传内容写成事实结论。
3. 对翻译类课程内容进行来源降权，优先提炼结构和题目，不作为唯一事实来源。

## 阶段 4：LLM Foundations 模块

处理 16 个基础仓库：

1. `llm-cookbook`
2. `hands-on-llm`
3. `base-llm`
4. `so-large-lm`
5. `happy-llm`
6. `self-llm`
7. `code-your-own-llm`
8. `diy-llm`
9. `tiny-universe`
10. `reasoning-kingdom`
11. `unlock-hf`
12. `open-ai-general-course`
13. `llm-preview`
14. `post-training-of-llms`
15. `fun-ir`
16. `smart-prompt`

建议新建目录：

1. `docs/llm-foundations`
2. `questions/llm-foundations`

建议子模块：

1. `overview`
2. `tokenizer-and-data`
3. `transformer-and-attention`
4. `pretraining`
5. `post-training`
6. `reasoning-and-inference`
7. `prompting`
8. `rag-and-ir-foundations`
9. `deployment-and-serving`

## 阶段 5：大数据补充

优先处理：

1. `juicy-bigdata`
2. `wonderful-sql`

可选处理：

1. `docker-notes`
2. `scientific-computing`

目标：

1. 补大数据导论、组件生态和数据处理主线。
2. 补 SQL 面试基础和分析 SQL 能力。
3. 部署基础只作为补充，不扩成独立主线。

## 单仓库处理流程

每导入一个仓库，按下面流程执行：

1. 读取 README、目录结构和在线文档入口。
2. 抽取章节级知识点。
3. 判断落点：现有文档增补、新建主文、新建案例、仅生成题目、暂缓。
4. 标记与现有页面的重叠关系。
5. 改写成中文面试系统内容。
6. 必要时补官方文档来源和最小样例代码。
7. 新增或更新题库。
8. 运行 `npm.cmd run validate`。
9. 运行 `npm.cmd run build`。
10. 检查 `http://localhost:3000`。

## 不导入规则

下面情况暂不进入主系统：

1. 与大数据、AI Agent、LLM 基础、RAG、平台工程无直接关系。
2. 主要是组织治理、活动、模板、展示页。
3. 主要面向 CV、RL、量化、办公自动化、数学建模，且无法服务当前面试系统主线。
4. 资料质量不稳定，且无法找到可靠一手来源交叉验证。

## 验收口径

阶段 1 完成后，应达到：

1. `platforms` 不再只有空目录，至少有 Dify、Ollama、Coze 三条主线。
2. `protocols` 补齐 MCP 开发与协议工程基础。
3. RAG 主线有向量数据库和全链路实践补充。
4. Agent 主线有从零构建和多智能体实践补充。
5. 全站校验和构建通过。

阶段 4 完成后，应达到：

1. `llm-foundations` 独立成系。
2. Agent 主干不再承接过多 LLM 基础内容。
3. LLM 原理题库能支撑基础面试、工程面试和系统设计追问。
