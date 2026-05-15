import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

const pillars = [
  {
    eyebrow: "大数据",
    title: "从组件原理到系统设计，按面试思路拆开",
    text: "围绕 Kafka、Spark、Flink、Hive、Iceberg 等核心组件，把定义、原理、误区、追问和代码样例组织成结构化知识。",
    href: "/big-data",
  },
  {
    eyebrow: "AI Agent",
    title: "把框架、协议、模式和工程实践放到一张图里",
    text: "覆盖 OpenAI Agents SDK、LangGraph、Microsoft Agent Framework、MCP 等主流主题，并强调版本边界与来源追溯。",
    href: "/ai-agents",
  },
  {
    eyebrow: "大模型基础",
    title: "从 Transformer、Token 到后训练，补齐 Agent 的底层知识",
    text: "把 LLM 拆成 Tokenizer、Attention、预训练、后训练、上下文预算和评估，不再只停留在调用 API。",
    href: "/llm-foundations",
  },
];

const quickLinks = [
  { label: "进入知识总览", href: "/docs/overview" },
  { label: "查看题库总览", href: "/questions" },
  { label: "查看学习路径", href: "/learning-paths" },
  { label: "查看学习仪表盘", href: "/dashboard" },
  { label: "进入模拟面试", href: "/mock-interview" },
  { label: "进入大模型基础", href: "/llm-foundations" },
  { label: "查看收藏夹", href: "/favorites" },
  { label: "浏览 Hive 总览", href: "/docs/bigdata/hive/overview" },
  { label: "浏览 Iceberg 总览", href: "/docs/bigdata/iceberg/overview" },
  { label: "浏览 Microsoft Agent Framework", href: "/docs/ai-agent/frameworks/microsoft-agent-framework" },
];

const practiceLoops = [
  {
    title: "先看结构，再进文档",
    text: "先从大数据主线或 AI Agent 主线进入，把主题边界和高频问题挂到脑子里。",
    href: "/learning-paths",
    label: "查看学习路径",
  },
  {
    title: "再用题库打磨表达",
    text: "按方向、组件、难度、关键词筛题，收藏高频题，给每一道题打上自己的掌握状态。",
    href: "/questions",
    label: "进入题库",
  },
  {
    title: "用仪表盘看整体进度",
    text: "把已看、已练、收藏和待复习状态聚合起来，快速判断下一步应该学什么、练什么。",
    href: "/dashboard",
    label: "打开仪表盘",
  },
  {
    title: "最后做模拟面试复盘",
    text: "用场景化模拟把知识点串起来，再根据复盘报告回看文档和题库补强。",
    href: "/mock-interview",
    label: "开始模拟",
  },
];

const steps = [
  "先写 Source，再写 Claim，再组装文档和题目",
  "所有 reviewed 内容都要带版本范围和核验日期",
  "代码样例单独落盘，避免文档里只有伪代码",
  "AI 只负责解释、追问和模拟面试，不充当唯一事实来源",
];

const mapNodes = [
  {
    label: "Source",
    title: "来源层",
    text: "记录官方文档、规范和一手资料，是准确性校验的起点。",
  },
  {
    label: "Claim",
    title: "事实层",
    text: "把复杂知识拆成最小可复核事实，方便复用、更新和审查。",
  },
  {
    label: "Doc",
    title: "文档层",
    text: "把事实组织成适合学习和复习的主题文档，服务长期积累。",
  },
  {
    label: "Question",
    title: "题库层",
    text: "从文档和事实生成题目、标准答案、追问和评分依据。",
  },
];

const learningTracks = [
  {
    title: "大数据基础线",
    subtitle: "先搭知识底盘，再看系统权衡",
    items: ["Kafka", "Spark", "Flink", "Hive", "Iceberg"],
    href: "/big-data",
  },
  {
    title: "Agent 工程线",
    subtitle: "先懂框架和协议，再看生产治理",
    items: ["OpenAI Agents SDK", "LangGraph", "MCP", "Microsoft Agent Framework"],
    href: "/ai-agents",
  },
  {
    title: "大模型基础线",
    subtitle: "先懂模型底座，再看 RAG 与 Agent",
    items: ["Transformer", "Tokenizer", "Post-training", "Token Budget"],
    href: "/llm-foundations",
  },
];

export default function Home() {
  return (
    <Layout title="大数据与 AI 面试图谱" description="一个可追溯的大数据与 AI Agent 知识学习系统。">
      <main className="atlas-home">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="hero-kicker">Markdown-First Interview Knowledge Base</p>
            <h1>把大数据和 AI Agent 知识体系，做成一张可以长期维护的知识地图</h1>
            <p className="hero-text">
              这不是一个只会聊天的刷题机器人，而是一个以文档、事实、题库和来源为核心的知识工程底座。
              我们先把准确性和结构打稳，再把检索、练题和模拟面试叠上去。
            </p>
            <div className="hero-actions">
              <Link className="button button--primary button--lg" to="/docs/overview">
                打开知识库
              </Link>
              <Link className="button button--secondary button--lg" to="/questions">
                进入题库
              </Link>
              <Link className="button button--secondary button--lg" to="/mock-interview">
                模拟面试
              </Link>
            </div>
          </div>
          <div className="hero-aside">
            <div className="stat-card stat-card--tall">
              <span className="stat-label">当前入库范围</span>
              <strong>5 个大数据主题 + 4 个 AI Agent 主题</strong>
              <p>Kafka、Spark、Flink、Hive、Iceberg 已接入大数据主线；OpenAI Agents SDK、MCP、LangGraph、Microsoft Agent Framework 已接入 Agent 主线。</p>
            </div>
            <div className="stat-card stat-card--split">
              <div>
                <span className="stat-label">内容模型</span>
                <strong>Source -&gt; Claim -&gt; Doc -&gt; Question</strong>
              </div>
              <div>
                <span className="stat-label">准确性策略</span>
                <strong>来源优先、版本标注、自动校验、人工复核</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="pillar-grid">
          {pillars.map((pillar) => (
            <Link key={pillar.title} className="pillar-card" to={pillar.href}>
              <span className="pillar-eyebrow">{pillar.eyebrow}</span>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
            </Link>
          ))}
        </section>

        <section className="system-map">
          <div className="section-head">
            <p className="section-label">系统结构</p>
            <h2>知识系统不是一层文档，而是四层协作</h2>
            <p>先把来源和事实打牢，再往上长文档、题库和练习体验，这样内容才能持续演进，而不是越写越乱。</p>
          </div>
          <div className="map-grid">
            {mapNodes.map((node) => (
              <article key={node.label} className="map-card">
                <span className="map-chip">{node.label}</span>
                <h3>{node.title}</h3>
                <p>{node.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="track-section">
          <div className="section-head">
            <p className="section-label">学习路径</p>
            <h2>不同目标，走不同学习线</h2>
            <p>首页不是营销页，而是一张可执行的导览图。你可以按组件、Agent 工程或系统建设视角进入内容。</p>
          </div>
          <div className="track-grid">
            {learningTracks.map((track) => (
              <Link key={track.title} className="track-card" to={track.href}>
                <p className="track-subtitle">{track.subtitle}</p>
                <h3>{track.title}</h3>
                <div className="track-tags">
                  {track.items.map((item) => (
                    <span key={item} className="track-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="detail-grid">
          <div className="detail-card">
            <p className="section-label">快速入口</p>
            <h2>从这里开始扩写内容</h2>
            <div className="quick-links">
              {quickLinks.map((item) => (
                <Link key={item.label} className="quick-link" to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <p className="section-label">构建规则</p>
            <h2>先把系统性建立起来，再让 AI 参与进来</h2>
            <ul className="step-list">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">练习闭环</p>
            <h2>从阅读到练题，再到模拟面试</h2>
            <p>这套系统不准备停在“有文档”这一步，而是继续把学习路径、题库和模拟面试接成一个可重复循环。</p>
          </div>
          <div className="module-grid">
            {practiceLoops.map((item) => (
              <article key={item.title} className="module-card">
                <p className="section-label">Practice Loop</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="inline-links">
                  <Link className="inline-link inline-link--strong" to={item.href}>
                    {item.label}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
