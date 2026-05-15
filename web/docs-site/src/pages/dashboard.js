import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { learningPaths, mockInterviewScenarios, questionBank } from "../data/catalog.js";
import { useQuestionProgress } from "../lib/questionProgress.js";

const topicSpotlights = [
  { title: "Hive 总览", description: "把 Hive 放回 SQL 数仓、执行引擎和 Metastore 的完整语境里理解。", href: "/docs/bigdata/hive/overview" },
  { title: "Iceberg 总览", description: "从开放表格式、多引擎共享和 schema evolution 切入。", href: "/docs/bigdata/iceberg/overview" },
  {
    title: "Microsoft Agent Framework 总览",
    description: "补齐企业级 Agent runtime、workflow、telemetry 和 preview 边界。",
    href: "/docs/ai-agent/frameworks/microsoft-agent-framework",
  },
];

export default function DashboardPage() {
  const { progressSummary, getState } = useQuestionProgress();
  const nextQuestions = questionBank.filter((item) => ["未开始", "需复习"].includes(getState(item.id).progress)).slice(0, 4);

  const trackProgress = [
    {
      key: "big-data",
      title: "大数据主线",
      description: "消息、计算、数仓层和表格式要放到同一张图里理解。",
    },
    {
      key: "ai-agents",
      title: "AI Agent 主线",
      description: "框架、协议、运行时和企业治理要能一起讲清边界。",
    },
    {
      key: "llm-foundations",
      title: "大模型基础主线",
      description: "Transformer、Tokenizer、后训练和上下文预算要能讲清底层逻辑。",
    },
  ].map((track) => {
    const questions = questionBank.filter((item) => item.track === track.key);
    const viewed = questions.filter((item) => getState(item.id).progress === "已看").length;
    const done = questions.filter((item) => getState(item.id).progress === "已练").length;
    const review = questions.filter((item) => getState(item.id).progress === "需复习").length;

    return {
      ...track,
      total: questions.length,
      viewed,
      done,
      review,
    };
  });

  return (
    <Layout title="学习仪表盘" description="汇总题库进度、主线掌握情况和下一步推荐动作。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--green">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">Study Dashboard</p>
            <h1>学习仪表盘</h1>
            <p className="hero-text">这里把阅读、练题、复习和模拟面试放到同一个面板里，帮助你快速判断下一步该补哪一块。</p>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">题库总数</span>
              <strong>{progressSummary.total}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">已看 / 已练</span>
              <strong>
                {progressSummary.viewed} / {progressSummary.done}
              </strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">收藏 / 待复习</span>
              <strong>
                {progressSummary.favorites} / {progressSummary.review}
              </strong>
            </article>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">主线进度</p>
            <h2>按方向看，你现在卡在什么位置</h2>
          </div>
          <div className="dashboard-track-grid">
            {trackProgress.map((item) => (
              <article key={item.key} className="mock-shell-card">
                <p className="section-label">{item.title}</p>
                <h3>{item.total} 道题已入库</h3>
                <p>{item.description}</p>
                <div className="question-summary-row">
                  <span className="mini-chip">已看 {item.viewed}</span>
                  <span className="mini-chip">已练 {item.done}</span>
                  <span className="mini-chip">需复习 {item.review}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mock-grid">
          <article className="mock-shell-card">
            <p className="section-label">下一步建议</p>
            <h2>优先处理这些题</h2>
            <div className="mock-rounds">
              {nextQuestions.length > 0 ? (
                nextQuestions.map((item) => (
                  <article key={item.id} className="mock-round-card">
                    <p>{item.title}</p>
                    <div className="inline-links">
                      <Link className="inline-link inline-link--strong" to={item.detailHref}>
                        打开题目
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <article className="mock-round-card">
                  <p>当前“未开始”和“需复习”的题已经不多了，可以切到模拟面试继续压实表达。</p>
                </article>
              )}
            </div>
          </article>

          <article className="mock-shell-card">
            <p className="section-label">模拟场景</p>
            <h2>接下来适合练哪一组</h2>
            <div className="mock-rounds">
              {mockInterviewScenarios.map((scenario) => (
                <article key={scenario.id} className="mock-round-card">
                  <p>{scenario.title}</p>
                  <small>{scenario.description}</small>
                </article>
              ))}
            </div>
            <div className="inline-links">
              <Link className="inline-link inline-link--strong" to="/mock-interview">
                打开模拟面试
              </Link>
            </div>
          </article>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">新补主题</p>
            <h2>这些内容已经接进系统了</h2>
          </div>
          <div className="dashboard-track-grid">
            {topicSpotlights.map((item) => (
              <article key={item.title} className="question-preview-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="inline-links">
                  <Link className="inline-link inline-link--strong" to={item.href}>
                    进入文档
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">学习路径</p>
            <h2>继续沿着路线推进</h2>
          </div>
          <div className="mock-rounds">
            {learningPaths.map((path) => (
              <article key={path.id} className="mock-round-card">
                <p>{path.title}</p>
                <small>{path.audience}</small>
              </article>
            ))}
          </div>
          <div className="inline-links">
            <Link className="inline-link" to="/learning-paths">
              查看学习路径
            </Link>
            <Link className="inline-link" to="/favorites">
              打开收藏夹
            </Link>
            <Link className="inline-link" to="/review-queue">
              打开复习队列
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
