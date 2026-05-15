import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { progressSteps } from "../data/catalog.js";
import { useQuestionProgress } from "../lib/questionProgress.js";

function asArray(content) {
  if (!content) {
    return [];
  }

  return Array.isArray(content) ? content : [content];
}

function ParagraphGroup({ content }) {
  const items = asArray(content);

  if (!items.length) {
    return null;
  }

  return (
    <div className="stacked-copy">
      {items.map((item, index) => (
        <p key={String(index) + String(item).slice(0, 24)}>{item}</p>
      ))}
    </div>
  );
}

function StructuredList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className="structured-list">
      {items.map((item, index) => {
        if (typeof item === "string") {
          return (
            <li key={String(index) + item.slice(0, 24)}>
              <span>{item}</span>
            </li>
          );
        }

        const title = item.name || item.title || item.label;
        const detail = item.detail || item.description || item.value || item.notes;
        const extra = item.extra || item.why || item.boundary;

        return (
          <li key={String(index) + String(title || detail || "item")}>
            {title ? <strong>{title}</strong> : null}
            {detail ? <span>{detail}</span> : null}
            {extra ? <span>{extra}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function SectionCard({ label, title, content, items }) {
  if (!content && !(items && items.length)) {
    return null;
  }

  return (
    <article className="question-preview-card">
      {label ? <p className="section-label">{label}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {content ? <ParagraphGroup content={content} /> : null}
      {items?.length ? <StructuredList items={items} /> : null}
    </article>
  );
}

function trackLabel(track) {
  if (track === "big-data") return "大数据";
  if (track === "ai-agents") return "AI Agent";
  if (track === "llm-foundations") return "大模型基础";
  return track;
}

export default function QuestionDetailPage({ question }) {
  const { getState, updateQuestionState } = useQuestionProgress();
  const state = getState(question.id);

  const conclusion = question.conclusion;
  const questionIntent = question.questionIntent || question.designMotivation;
  const answerOutline = question.answerOutline?.length ? question.answerOutline : question.scorePoints;
  const referenceAnswer = question.referenceAnswer?.length ? question.referenceAnswer : question.standardAnswer;
  const fieldSignals = question.fieldSignals?.length ? question.fieldSignals : [];
  const deepDiveExists =
    question.coreMechanism?.length ||
    question.keyObjects?.length ||
    question.fullFlow?.length ||
    question.guarantees?.length ||
    question.nonGuarantees?.length ||
    question.failureScenarios?.length ||
    question.tradeoffs?.length;

  return (
    <Layout title={question.title} description={question.summary}>
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--neutral">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">Question Detail</p>
            <h1>{question.title}</h1>
            <p className="hero-text">{question.summary}</p>
            <div className="question-summary-row">
              <span className="mini-chip">{trackLabel(question.track)}</span>
              <span className="mini-chip">{question.component}</span>
              <span className="mini-chip">{question.difficulty}</span>
              <span className="mini-chip">{question.type}</span>
              <span className="mini-chip">{question.minutes} 分钟</span>
              <span className="mini-chip">{state.progress}</span>
            </div>
            <div className="question-actions">
              <button
                type="button"
                className={state.favorite ? "state-button state-button--active" : "state-button"}
                onClick={() => updateQuestionState(question.id, { favorite: !state.favorite })}
              >
                {state.favorite ? "已收藏" : "收藏题目"}
              </button>
              {progressSteps.map((progressValue) => (
                <button
                  key={progressValue}
                  type="button"
                  className={state.progress === progressValue ? "state-button state-button--active" : "state-button"}
                  onClick={() => updateQuestionState(question.id, { progress: progressValue })}
                >
                  {progressValue}
                </button>
              ))}
            </div>
            <div className="inline-links">
              <Link className="inline-link" to="/questions">
                返回题库
              </Link>
              <Link className="inline-link" to="/review-queue">
                进入复习队列
              </Link>
              <Link className="inline-link inline-link--strong" to="/mock-interview">
                去模拟面试
              </Link>
            </div>
          </div>
          <div className="catalog-stat-grid">
            <article className="stat-card">
              <span className="stat-label">适用岗位</span>
              <strong>{question.jobs.join(" / ")}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">复习建议</span>
              <strong>{state.progress === "需复习" ? "优先回看这道题" : "可按主线推进"}</strong>
            </article>
          </div>
        </section>

        {conclusion || questionIntent?.length || answerOutline?.length ? (
          <section className="catalog-shell">
            <div className="section-head">
              <p className="section-label">题目拆解</p>
              <h2>先明确判断，再组织回答主线</h2>
            </div>
            <div className="question-preview-grid">
              <SectionCard label="一句话结论" title="先把最核心的判断说清" content={conclusion} />
              <SectionCard label="这题想考什么" title="面试官真正想确认的能力点" content={questionIntent} />
              <SectionCard label="回答主线" title="现场表达时建议按这条顺序展开" items={answerOutline} />
            </div>
          </section>
        ) : null}

        {referenceAnswer || fieldSignals?.length ? (
          <section className="catalog-shell">
            <div className="section-head">
              <p className="section-label">参考作答</p>
              <h2>把知识点压缩成可复述、可判断的现场回答</h2>
            </div>
            <div className="question-preview-grid">
              <SectionCard label="参考作答" title="面试现场可直接组织成这版答案" content={referenceAnswer} />
              <SectionCard label="现场判断抓手" title="遇到真实场景时优先核对这些点" items={fieldSignals} />
            </div>
          </section>
        ) : null}

        {deepDiveExists ? (
          <section className="catalog-shell">
            <div className="section-head">
              <p className="section-label">深入补充</p>
              <h2>把对象、链路、边界和故障放回完整工程上下文</h2>
            </div>
            <div className="question-preview-grid">
              <SectionCard label="核心机制" title="它到底依赖什么对象和约束运转" content={question.coreMechanism} />
              <SectionCard label="关键对象与状态" title="谁维护什么状态" items={question.keyObjects} />
              <SectionCard label="完整链路" title="从输入到结果中间发生了什么" items={question.fullFlow} />
              <SectionCard label="边界与不保证项" title="结论在哪些边界内成立" items={question.nonGuarantees || question.boundaries} />
              <SectionCard label="故障场景" title="异常发生时最容易失真的地方" items={question.failureScenarios} />
              <SectionCard label="代价与权衡" title="为什么这样设计，以及代价在哪里" items={question.tradeoffs} />
            </div>
          </section>
        ) : null}

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">误区与追问</p>
            <h2>别只记住答案，也要知道哪里最容易答偏</h2>
          </div>
          <div className="question-preview-grid">
            <article className="question-preview-card">
              <h3>常见误区</h3>
              <ul className="compact-list">
                {question.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="question-preview-card">
              <h3>追问</h3>
              <ul className="compact-list">
                {question.followUps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="inline-links">
            {question.relatedDocs.map((doc) => (
              <Link key={doc.href} className="inline-link" to={doc.href}>
                {doc.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

