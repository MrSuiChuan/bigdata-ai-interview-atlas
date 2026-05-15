import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { componentQuality, qualitySummary } from "../data/quality.js";

function docHref(file) {
  if (!file) return "/docs/overview";
  return `/docs/${file.replace(/^docs\//, "").replace(/\.md$/, "")}`;
}

export default function QualityPage() {
  const weakest = [...componentQuality].sort((a, b) => a.score - b.score).slice(0, 12);
  const coreBigData = componentQuality.filter((item) => item.track === "big-data");
  const aiRows = componentQuality.filter((item) => item.track === "ai-agents" || item.track === "llm-foundations");

  return (
    <Layout title="质量看板" description="按组件查看知识库、题库、示例、来源和映射质量。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--green">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">Quality Board</p>
            <h1>质量看板</h1>
            <p className="hero-text">这里不是单纯展示“内容有多少”，而是检查每个组件是否足够支撑学习、面试、系统设计和生产排障。</p>
            <div className="hero-actions">
              <Link className="button button--primary button--lg" to="/docs/blueprint/component-quality-standard">
                查看质量标准
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/blueprint/question-to-knowledge-audit">
                查看题库映射
              </Link>
            </div>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">组件总数</span>
              <strong>{qualitySummary.total}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">平均分</span>
              <strong>{qualitySummary.avgScore}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">S / A / B / C / D</span>
              <strong>
                {qualitySummary.byGrade.S} / {qualitySummary.byGrade.A} / {qualitySummary.byGrade.B} / {qualitySummary.byGrade.C} / {qualitySummary.byGrade.D}
              </strong>
            </article>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">优先补强</p>
            <h2>分数最低的组件先看这里</h2>
            <p>这些组件不是不能用，而是示例、排障、来源、题库映射或主题覆盖还需要继续精修。</p>
          </div>
          <div className="module-grid">
            {weakest.map((item) => (
              <article key={item.key} className="module-card">
                <div className="module-card-head">
                  <div>
                    <p className="section-label">{item.track}</p>
                    <h3>{item.componentLabel}</h3>
                  </div>
                  <span className={`quality-grade quality-grade--${item.grade.toLowerCase()}`}>{item.grade}</span>
                </div>
                <div className="quality-strip">
                  <span>{item.score} 分</span>
                  <span>{item.docs}/{item.docTarget} 文档</span>
                  <span>{item.questions}/{item.questionTarget} 题目</span>
                  <span>{item.examples}/{item.exampleTarget} 示例</span>
                </div>
                <p>{item.missingThemes.length ? `缺口：${item.missingThemes.join("、")}` : "主题覆盖已经完整，后续以人工精修为主。"}</p>
                {item.issueFiles.length ? (
                  <ul className="compact-list">
                    {item.issueFiles.slice(0, 3).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="inline-links">
                  <Link className="inline-link inline-link--strong" to={docHref(item.primaryDoc)}>
                    打开主文档
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">大数据组件</p>
            <h2>核心大数据组件质量矩阵</h2>
          </div>
          <div className="quality-table">
            {coreBigData.map((item) => (
              <Link key={item.key} className="quality-row" to={docHref(item.primaryDoc)}>
                <span className={`quality-grade quality-grade--${item.grade.toLowerCase()}`}>{item.grade}</span>
                <strong>{item.componentLabel}</strong>
                <span>{item.score} 分</span>
                <span>{item.docs} 篇文档</span>
                <span>{item.questions} 道题</span>
                <span>{item.examples} 个示例</span>
                <span>{item.issueFiles.length} 个页面风险</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">AI 与大模型</p>
            <h2>Agent、RAG 和大模型基础质量矩阵</h2>
          </div>
          <div className="quality-table">
            {aiRows.map((item) => (
              <Link key={item.key} className="quality-row" to={docHref(item.primaryDoc)}>
                <span className={`quality-grade quality-grade--${item.grade.toLowerCase()}`}>{item.grade}</span>
                <strong>{item.componentLabel}</strong>
                <span>{item.score} 分</span>
                <span>{item.docs} 篇文档</span>
                <span>{item.questions} 道题</span>
                <span>{item.examples} 个示例</span>
                <span>{item.issueFiles.length} 个页面风险</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
