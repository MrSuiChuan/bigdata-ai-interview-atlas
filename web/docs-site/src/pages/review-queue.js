import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { questionBank } from "../data/catalog.js";
import { useQuestionProgress } from "../lib/questionProgress.js";

function trackLabel(track) {
  const labels = {
    "big-data": "大数据",
    "ai-agents": "AI Agent",
    "llm-foundations": "大模型基础",
  };
  return labels[track] || track;
}

export default function ReviewQueuePage() {
  const { getState } = useQuestionProgress();
  const reviewItems = questionBank.filter((item) => getState(item.id).progress === "需复习");

  return (
    <Layout title="复习队列" description="集中查看被标记为需复习的题目。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--amber">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">复习清单</p>
            <h1>复习队列</h1>
            <p className="hero-text">把暂时没答稳、需要二次打磨的题集中到这里，后面还可以继续接入推荐复习顺序和间隔复习策略。</p>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">待复习题目</span>
              <strong>{reviewItems.length} 道</strong>
            </article>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="question-card-grid">
            {reviewItems.map((item) => (
              <article key={item.id} className="question-card">
                <div className="question-card-meta">
                  <span className="mini-chip">{trackLabel(item.track)}</span>
                  <span className="mini-chip">{item.component}</span>
                  <span className="mini-chip">{item.minutes} 分钟</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="inline-links">
                  <Link className="inline-link inline-link--strong" to={item.detailHref}>
                    进入复习
                  </Link>
                  <Link className="inline-link" to="/mock-interview">
                    去模拟面试
                  </Link>
                </div>
              </article>
            ))}
            {reviewItems.length === 0 ? (
              <article className="empty-state">
                <h3>当前没有待复习题目</h3>
                <p>你可以在题库页把一些答得不稳的问题标成“需复习”，这里就会自动聚合。</p>
              </article>
            ) : null}
          </div>
        </section>
      </main>
    </Layout>
  );
}
