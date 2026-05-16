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
    text: "覆盖 OpenAI Agents SDK、LangGraph、Microsoft Agent Framework、MCP 等主流主题，并强调边界、协作方式和工程落地。",
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
    text: "用场景化模拟把知识点串起来，再根据复盘结果回看文档和题库补强。",
    href: "/mock-interview",
    label: "开始模拟",
  },
];

const learningHabits = [
  "先读总览页，再进入对象、链路、边界和排障页",
  "遇到容易混淆的概念时，优先做对比和职责拆分",
  "看完文档后立刻刷题，把原理转成可表达的回答",
  "做模拟面试时，先讲结论，再补机制、边界和取舍",
];

const mapNodes = [
  {
    label: "总览",
    title: "总览层",
    text: "先回答技术是做什么的、处在系统哪一层、为什么不能和相邻组件混着理解。",
  },
  {
    label: "机制",
    title: "机制层",
    text: "把核心对象、执行链路、状态变化和一致性边界讲清楚，避免只记术语。",
  },
  {
    label: "场景",
    title: "场景层",
    text: "把性能、故障恢复、系统设计和生产排障放进真实场景里理解。",
  },
  {
    label: "训练",
    title: "训练层",
    text: "通过题库、收藏、复习和模拟面试，把阅读沉淀成可复述、可判断的能力。",
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
    subtitle: "先懂框架和协议，再看生产落地",
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
    <Layout title="大数据与 AI 面试图谱" description="一个面向大数据、AI Agent 与大模型基础的中文学习系统。">
      <main className="atlas-home">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="hero-kicker">中文知识库与训练系统</p>
            <h1>把大数据和 AI Agent 知识体系，做成一张可以长期维护的知识地图</h1>
            <p className="hero-text">
              这里把知识库、题库、学习路径和模拟面试接成一个完整学习闭环，帮助你不只记住概念，还能讲清机制、边界和工程判断。
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
              <span className="stat-label">当前覆盖方向</span>
              <strong>大数据 + AI Agent + 大模型基础</strong>
              <p>围绕消息、计算、湖仓、Agent Runtime、协议协作与大模型基础，把知识点拆成可学习、可练习、可复盘的结构。</p>
            </div>
            <div className="stat-card stat-card--split">
              <div>
                <span className="stat-label">使用方式</span>
                <strong>先读知识库，再刷题和模拟</strong>
              </div>
              <div>
                <span className="stat-label">适合人群</span>
                <strong>准备面试、补体系、做项目复盘</strong>
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
            <p className="section-label">学习结构</p>
            <h2>不是一层文档，而是一条从理解到表达的学习链</h2>
            <p>先把总览和机制看懂，再进入系统设计、故障场景和题目训练，这样知识才更容易沉淀成稳定能力。</p>
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
            <p>首页不是营销页，而是一张可执行的导览图。你可以按组件、Agent 工程或大模型基础视角进入内容。</p>
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
            <h2>从这里开始进入内容</h2>
            <div className="quick-links">
              {quickLinks.map((item) => (
                <Link key={item.label} className="quick-link" to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <p className="section-label">学习建议</p>
            <h2>先把节奏跑顺，再让练习产生效果</h2>
            <ul className="step-list">
              {learningHabits.map((step) => (
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
                <p className="section-label">学习闭环</p>
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
