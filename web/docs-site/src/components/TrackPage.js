import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { getFeaturedQuestions } from "../data/catalog.js";
import { componentQualityByTrackAndComponent } from "../data/quality.js";

function StatusBadge({ status }) {
  const className = status === "已入库" ? "catalog-badge catalog-badge--live" : "catalog-badge catalog-badge--planned";
  return <span className={className}>{status}</span>;
}

function QuestionPreview({ item }) {
  return (
    <article key={item.id} className="question-preview-card">
      <div className="question-preview-top">
        <div>
          <p className="section-label">题目预览</p>
          <h3>{item.title}</h3>
        </div>
        <div className="question-meta-row">
          <span className="mini-chip">{item.component}</span>
          <span className="mini-chip">{item.difficulty}</span>
          <span className="mini-chip">{item.type}</span>
        </div>
      </div>
      <p>{item.summary}</p>
      <div className="question-preview-grid">
        <div>
          <h4>回答主线</h4>
          <ul className="compact-list">
            {(item.answerOutline || item.scorePoints).slice(0, 3).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>追问方向</h4>
          <ul className="compact-list">
            {item.followUps.slice(0, 3).map((follow) => (
              <li key={follow}>{follow}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="inline-links">
        {item.relatedDocs.map((doc) => (
          <Link key={doc.href} className="inline-link" to={doc.href}>
            {doc.label}
          </Link>
        ))}
        <Link className="inline-link" to={item.detailHref}>
          查看详情页
        </Link>
        <Link className="inline-link inline-link--strong" to={`/questions?focus=${item.id}`}>
          在题库中查看
        </Link>
      </div>
    </article>
  );
}

export default function TrackPage({ track }) {
  const featuredQuestions = getFeaturedQuestions(track.featuredQuestions);
  const docCount = track.modules.reduce((sum, item) => sum + item.docs.length, 0);
  const questionCount = track.modules.reduce((sum, item) => sum + item.questions.length, 0);
  const liveCount = track.modules.filter((item) => item.status === "已入库").length;
  const tagCount = new Set(track.modules.flatMap((item) => item.tags)).size;

  return (
    <Layout title={track.title} description={track.description}>
      <main className="atlas-home catalog-page">
        <section className={`catalog-hero catalog-hero--${track.accent}`}>
          <div className="catalog-hero-copy">
            <p className="hero-kicker">{track.eyebrow}</p>
            <h1>{track.title}</h1>
            <p className="hero-text">{track.description}</p>
            <p className="catalog-focus">{track.focus}</p>
            <div className="hero-actions">
              <Link className="button button--primary button--lg" to="/questions">
                查看题库
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/overview">
                返回知识总览
              </Link>
            </div>
            <div className="track-signal-board" aria-label="内容覆盖信号">
              <article className="track-signal-card">
                <span>模块</span>
                <strong>{liveCount}/{track.modules.length}</strong>
              </article>
              <article className="track-signal-card">
                <span>入口文档</span>
                <strong>{docCount}</strong>
              </article>
              <article className="track-signal-card">
                <span>入口题目</span>
                <strong>{questionCount}</strong>
              </article>
              <article className="track-signal-card">
                <span>标签</span>
                <strong>{tagCount}</strong>
              </article>
            </div>
          </div>
          <div className="catalog-stat-grid">
            {track.stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <span className="stat-label">{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">专题地图</p>
            <h2>这条学习线先讲什么，再补什么</h2>
            <p>这里不是简单列题目，而是把已完成样板和接下来要补的模块放到同一张内容地图里。</p>
          </div>
          <div className="module-grid">
            {track.modules.map((module, index) => {
              const quality = componentQualityByTrackAndComponent[`${track.slug}/${module.title}`];
              return (
              <article key={module.title} className="module-card">
                <div className="module-card-head">
                  <div>
                    <p className="section-label">模块</p>
                    <h3>
                      <span className="module-index">{String(index + 1).padStart(2, "0")}</span>
                      {module.title}
                    </h3>
                  </div>
                  <StatusBadge status={module.status} />
                </div>
                <p className="module-level">{module.level}</p>
                {quality ? (
                  <div className="quality-strip">
                    <span className={`quality-grade quality-grade--${quality.grade.toLowerCase()}`}>{quality.grade}</span>
                    <span>{quality.score} 分</span>
                    <span>{quality.themeCoverage}/{quality.themeTotal} 项覆盖</span>
                    <span>{Math.round(quality.relatedDocCoverage * 100)}% 题库映射</span>
                  </div>
                ) : null}
                <p>{module.summary}</p>
                <div className="module-metrics">
                  <span>{module.docs.length} 篇文档</span>
                  <span>{module.questions.length} 道入口题</span>
                  <span>{module.tags.length} 个标签</span>
                </div>
                <div className="tag-cluster">
                  {module.tags.map((tag) => (
                    <span key={tag} className="track-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-links">
                  {module.docs.length > 0 ? (
                    module.docs.map((doc) => (
                      <Link key={doc.href} className="inline-link" to={doc.href}>
                        {doc.label}
                      </Link>
                    ))
                  ) : (
                    <span className="inline-link inline-link--muted">文档待补充</span>
                  )}
                  {module.questions.length > 0 ? (
                    module.questions.map((question) => (
                      <Link key={question.href} className="inline-link inline-link--strong" to={question.href}>
                        {question.label}
                      </Link>
                    ))
                  ) : (
                    <span className="inline-link inline-link--muted">题目待补充</span>
                  )}
                  {quality?.primaryDoc ? (
                    <Link className="inline-link" to={`/docs/${quality.primaryDoc.replace(/^docs\//, "").replace(/\.md$/, "")}`}>
                      质量指南
                    </Link>
                  ) : null}
                </div>
              </article>
              );
            })}
          </div>
        </section>

        <section className="detail-grid catalog-detail-grid">
          <article className="detail-card">
            <p className="section-label">写作原则</p>
            <h2>这一条线怎样保持准确、可读、能复习</h2>
            <ul className="step-list">
              {track.principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="detail-card">
            <p className="section-label">开发节奏</p>
            <h2>接下来怎么继续往下扩</h2>
            <ul className="step-list">
              {track.roadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">题库入口</p>
            <h2>用高频题检验知识掌握程度</h2>
            <p>题库页会继续承担筛选和检索，这里只展示最能代表这条学习线的问题样板。</p>
          </div>
          <div className="question-preview-stack">
            {featuredQuestions.map((item) => (
              <QuestionPreview key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

