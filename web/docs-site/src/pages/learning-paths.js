import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { learningPaths } from "../data/catalog.js";

export default function LearningPathsPage() {
  return (
    <Layout title="学习路径" description="按岗位与准备周期查看大数据、AI Agent 和大模型基础的学习路线。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--neutral">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">Learning Paths</p>
            <h1>学习路径</h1>
            <p className="hero-text">
              这里不是一堆零散文章的列表，而是面向目标岗位和准备周期的学习路线图。先搭结构，再按阶段进入文档、题库和模拟面试。
            </p>
            <div className="hero-actions">
              <Link className="button button--primary button--lg" to="/questions">
                进入题库
              </Link>
              <Link className="button button--secondary button--lg" to="/mock-interview">
                打开模拟面试
              </Link>
            </div>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">当前路径</span>
              <strong>{learningPaths.length} 条</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">覆盖方向</span>
              <strong>大数据 / AI Agent / 大模型基础</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">目标</span>
              <strong>阅读、练题、模拟面试形成闭环</strong>
            </article>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">路线卡片</p>
            <h2>先按目标岗位选，再按阶段推进</h2>
            <p>每条路径都会给出周期、适用对象和阶段动作，后面还可以继续接入学习进度与个性化推荐。</p>
          </div>
          <div className="path-grid">
            {learningPaths.map((path) => (
              <article key={path.id} className="path-card">
                <div className="path-card-head">
                  <div>
                    <p className="section-label">学习路线</p>
                    <h3>{path.title}</h3>
                  </div>
                  <span className="catalog-badge catalog-badge--live">{path.duration}</span>
                </div>
                <p className="path-audience">{path.audience}</p>
                <p>{path.description}</p>
                <div className="path-stage-list">
                  {path.stages.map((stage) => (
                    <section key={stage.title} className="path-stage">
                      <h4>{stage.title}</h4>
                      <p>{stage.summary}</p>
                      <ul className="compact-list">
                        {stage.actions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
