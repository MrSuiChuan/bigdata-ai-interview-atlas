import { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { getQuestionById, mockInterviewScenarios } from "../data/catalog.js";

function normalizeText(value) {
  return (value || "").toLowerCase();
}

function analyzeAnswer(answer, keywords) {
  const normalizedAnswer = normalizeText(answer);
  const hits = keywords.filter((keyword) => normalizedAnswer.includes(normalizeText(keyword)));
  const misses = keywords.filter((keyword) => !hits.includes(keyword));
  const coverage = keywords.length === 0 ? 0 : hits.length / keywords.length;

  if (!answer.trim()) {
    return {
      coverage: 0,
      hits: [],
      misses: keywords,
      verdict: "未作答",
      tone: "low",
    };
  }

  if (coverage >= 0.75) {
    return {
      coverage,
      hits,
      misses,
      verdict: "表达较稳",
      tone: "good",
    };
  }

  if (coverage >= 0.4) {
    return {
      coverage,
      hits,
      misses,
      verdict: "基本到位",
      tone: "mid",
    };
  }

  return {
    coverage,
    hits,
    misses,
    verdict: "还需补关键点",
    tone: "low",
  };
}

function ScorePill({ tone, children }) {
  const className =
    tone === "good"
      ? "score-pill score-pill--good"
      : tone === "mid"
        ? "score-pill score-pill--mid"
        : "score-pill score-pill--low";

  return <span className={className}>{children}</span>;
}

function trackLabel(track) {
  const labels = {
    "big-data": "大数据",
    "ai-agents": "AI Agent",
    "llm-foundations": "大模型基础",
  };
  return labels[track] || track;
}

export default function MockInterviewPage() {
  const [scenarioId, setScenarioId] = useState(mockInterviewScenarios[0].id);
  const [started, setStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const scenario = useMemo(
    () => mockInterviewScenarios.find((item) => item.id === scenarioId) ?? mockInterviewScenarios[0],
    [scenarioId]
  );

  const currentQuestion = scenario.rounds[roundIndex];
  const interviewCompleted = started && roundIndex >= scenario.rounds.length;
  const completedRounds = scenario.rounds.map((round, index) => ({
    round,
    answer: answers[index] ?? "",
    analysis: analyzeAnswer(answers[index] ?? "", scenario.answerSignals[index] ?? []),
    signals: scenario.answerSignals[index] ?? [],
  }));

  const overallCoverage = useMemo(() => {
    const allSignals = completedRounds.flatMap((item) => item.signals);
    const totalKeywords = allSignals.length;
    const totalHits = completedRounds.reduce((accumulator, item) => accumulator + item.analysis.hits.length, 0);

    if (totalKeywords === 0) {
      return 0;
    }

    return totalHits / totalKeywords;
  }, [completedRounds]);

  const relatedQuestions = useMemo(
    () => scenario.relatedQuestions.map((id) => getQuestionById(id)).filter(Boolean),
    [scenario.relatedQuestions]
  );

  function resetSession(nextScenarioId = scenarioId) {
    setScenarioId(nextScenarioId);
    setStarted(false);
    setRoundIndex(0);
    setAnswers({});
  }

  function startScenario(id) {
    resetSession(id);
    setStarted(true);
  }

  function updateAnswer(value) {
    setAnswers((current) => ({
      ...current,
      [roundIndex]: value,
    }));
  }

  function nextRound() {
    if (roundIndex < scenario.rounds.length - 1) {
      setRoundIndex((current) => current + 1);
      return;
    }

    setRoundIndex(scenario.rounds.length);
  }

  const overallTone = overallCoverage >= 0.75 ? "good" : overallCoverage >= 0.4 ? "mid" : "low";

  return (
    <Layout title="模拟面试" description="前端模拟面试已支持场景切换、逐轮作答和基于关键词覆盖的结构化复盘。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--amber">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">模拟训练</p>
            <h1>模拟面试</h1>
            <p className="hero-text">
              现在这一页不再只是占位。你可以切换场景、逐轮作答、查看结构化自检结果，再跳回文档和题库继续补薄弱点。
            </p>
            <div className="question-summary-row">
              <span className="mini-chip">支持 4 组场景</span>
              <span className="mini-chip">覆盖大数据 / AI Agent</span>
              <span className="mini-chip">逐轮作答</span>
              <span className="mini-chip">自检复盘</span>
            </div>
          </div>
          <div className="filter-panel">
            <div className="filter-panel-head">
              <p className="section-label">场景选择</p>
              <h2>先选你要练的主线</h2>
            </div>
            <div className="scenario-picker">
              {mockInterviewScenarios.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === scenarioId ? "scenario-button scenario-button--active" : "scenario-button"}
                  onClick={() => resetSession(item.id)}
                >
                  <span>{item.title}</span>
                  <small>
                    {trackLabel(item.track)} / {item.difficulty}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </section>

        {!started ? (
          <section className="mock-grid">
            <article className="mock-shell-card">
              <p className="section-label">当前场景</p>
              <h2>{scenario.title}</h2>
              <p>{scenario.description}</p>
              <div className="mock-rounds">
                {scenario.rounds.map((round, index) => (
                  <article key={round} className="mock-round-card">
                    <span className="catalog-badge catalog-badge--planned">第 {index + 1} 轮</span>
                    <p>{round}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="mock-shell-card">
              <p className="section-label">开始前提示</p>
              <h2>建议按这个结构作答</h2>
              <ul className="compact-list">
                <li>先给一句话定义或结论</li>
                <li>再解释核心机制、边界和关键术语</li>
                <li>补充设计权衡、误区和工程场景</li>
                <li>最后把结论落到选型或生产适用性判断</li>
              </ul>
              <div className="inline-links">
                {scenario.relatedDocs.map((doc) => (
                  <Link key={doc.href} className="inline-link" to={doc.href}>
                    {doc.label}
                  </Link>
                ))}
              </div>
              <div className="hero-actions">
                <button type="button" className="button button--primary button--lg" onClick={() => startScenario(scenario.id)}>
                  开始这组模拟
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {started && !interviewCompleted ? (
          <section className="mock-grid">
            <article className="mock-shell-card">
              <p className="section-label">当前轮次</p>
              <h2>
                第 {roundIndex + 1} 轮 / 共 {scenario.rounds.length} 轮
              </h2>
              <p>{currentQuestion}</p>
              <label className="mock-answer-field">
                <span>你的回答草稿</span>
                <textarea
                  value={answers[roundIndex] ?? ""}
                  onChange={(event) => updateAnswer(event.target.value)}
                  placeholder="先写结论，再补机制、边界、权衡和场景。"
                />
              </label>
              <div className="hero-actions">
                <button type="button" className="button button--primary button--lg" onClick={nextRound}>
                  {roundIndex === scenario.rounds.length - 1 ? "完成并查看复盘" : "下一轮"}
                </button>
                <button type="button" className="button button--secondary button--lg" onClick={() => resetSession(scenario.id)}>
                  重新开始
                </button>
              </div>
            </article>

            <article className="mock-shell-card">
              <p className="section-label">本轮复盘维度</p>
              <h2>这一轮建议主动覆盖这些点</h2>
              <ul className="compact-list">
                {scenario.reviewPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="mock-rounds">
                <article className="mock-note-panel">
                  <h3>建议你主动覆盖的关键词</h3>
                  <div className="signal-row">
                    {(scenario.answerSignals[roundIndex] ?? []).map((item) => (
                      <span key={item} className="mini-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </article>
          </section>
        ) : null}

        {interviewCompleted ? (
          <section className="catalog-shell">
            <div className="section-head">
              <p className="section-label">复盘报告</p>
              <h2>这一轮已经结束，现在把结构和薄弱点一起扫一遍</h2>
              <p>当前是前端版结构化自检，会根据关键词覆盖度提示哪些点已经讲到、哪些点还值得补。</p>
            </div>

            <div className="mock-score-grid">
              <article className="stat-card">
                <span className="stat-label">整体覆盖度</span>
                <strong>{Math.round(overallCoverage * 100)}%</strong>
                <ScorePill tone={overallTone}>
                  {overallTone === "good" ? "表达较稳" : overallTone === "mid" ? "还可以再压实" : "建议回看文档补关键点"}
                </ScorePill>
              </article>
              <article className="stat-card">
                <span className="stat-label">场景方向</span>
                <strong>{trackLabel(scenario.track)}</strong>
                <p>{scenario.title}</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">下一步建议</span>
                <strong>{overallCoverage >= 0.75 ? "切到下一组场景" : "先补文档，再重练一轮"}</strong>
              </article>
            </div>

            <div className="mock-rounds">
              {completedRounds.map((item, index) => (
                <article key={item.round} className="mock-round-card">
                  <div className="question-card-head">
                    <div>
                      <span className="catalog-badge catalog-badge--live">第 {index + 1} 轮</span>
                      <p className="mock-round-question">{item.round}</p>
                    </div>
                    <ScorePill tone={item.analysis.tone}>{item.analysis.verdict}</ScorePill>
                  </div>
                  <p>{item.answer || "这一轮还没有填写回答。建议回到上一轮补完，再看复盘更有意义。"}</p>
                  <div className="question-two-col">
                    <div>
                      <h4>已覆盖的关键词</h4>
                      <div className="signal-row">
                        {item.analysis.hits.length > 0 ? (
                          item.analysis.hits.map((hit) => (
                            <span key={hit} className="mini-chip">
                              {hit}
                            </span>
                          ))
                        ) : (
                          <span className="inline-link inline-link--muted">当前还没有命中关键词</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4>建议补上的关键词</h4>
                      <div className="signal-row">
                        {item.analysis.misses.length > 0 ? (
                          item.analysis.misses.map((miss) => (
                            <span key={miss} className="mini-chip">
                              {miss}
                            </span>
                          ))
                        ) : (
                          <span className="inline-link inline-link--muted">这一轮的核心点基本都覆盖到了</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="question-preview-grid">
              <article className="question-preview-card">
                <h3>回看文档</h3>
                <div className="inline-links">
                  {scenario.relatedDocs.map((doc) => (
                    <Link key={doc.href} className="inline-link" to={doc.href}>
                      {doc.label}
                    </Link>
                  ))}
                </div>
              </article>
              <article className="question-preview-card">
                <h3>回刷题目</h3>
                <div className="inline-links">
                  {relatedQuestions.map((question) => (
                    <Link key={question.id} className="inline-link inline-link--strong" to={question.detailHref}>
                      {question.title}
                    </Link>
                  ))}
                </div>
              </article>
            </div>

            <div className="inline-links">
              <button type="button" className="state-button state-button--active" onClick={() => resetSession(scenario.id)}>
                再练一轮
              </button>
              <Link className="inline-link" to="/questions">
                返回题库
              </Link>
              <Link className="inline-link" to="/dashboard">
                去学习仪表盘
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </Layout>
  );
}
