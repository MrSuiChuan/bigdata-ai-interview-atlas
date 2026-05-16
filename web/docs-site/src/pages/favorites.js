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

export default function FavoritesPage() {
  const { getState } = useQuestionProgress();
  const favorites = questionBank.filter((item) => getState(item.id).favorite);

  return (
    <Layout title="收藏夹" description="集中查看你标记收藏的面试题。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--neutral">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">收藏题目</p>
            <h1>收藏夹</h1>
            <p className="hero-text">把高频题、薄弱题和你想反复打磨表达的题先收进这里，后面再接账号同步或学习计划联动。</p>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">当前收藏</span>
              <strong>{favorites.length} 道</strong>
            </article>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="question-card-grid">
            {favorites.map((item) => (
              <article key={item.id} className="question-card">
                <div className="question-card-meta">
                  <span className="mini-chip">{trackLabel(item.track)}</span>
                  <span className="mini-chip">{item.component}</span>
                  <span className="mini-chip">{item.difficulty}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="inline-links">
                  <Link className="inline-link inline-link--strong" to={item.detailHref}>
                    查看题目详情
                  </Link>
                </div>
              </article>
            ))}
            {favorites.length === 0 ? (
              <article className="empty-state">
                <h3>收藏夹还是空的</h3>
                <p>你可以先去题库页，把想反复练习的题目收藏起来。</p>
              </article>
            ) : null}
          </div>
        </section>
      </main>
    </Layout>
  );
}
