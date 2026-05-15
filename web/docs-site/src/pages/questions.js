import { useEffect, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { progressFilters, progressSteps, questionBank, questionFilters } from "../data/catalog.js";
import { useQuestionProgress } from "../lib/questionProgress.js";

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function trackLabel(track) {
  const labels = {
    "big-data": "大数据",
    "ai-agents": "AI Agent",
    "llm-foundations": "大模型基础",
  };
  return labels[track] || track;
}

function sourceLabel(category) {
  const labels = {
    official: "官方来源",
    "trusted-community": "实践来源",
    mixed: "官方 + 实践来源",
    unknown: "未分类来源",
  };
  return labels[category] || category || "未分类来源";
}

export default function QuestionsPage() {
  const [track, setTrack] = useState("all");
  const [component, setComponent] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");
  const [sourceCategory, setSourceCategory] = useState("all");
  const [progress, setProgress] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [focusedId, setFocusedId] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { progressMap, progressSummary, getState, updateQuestionState } = useQuestionProgress();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus") || "";
    setFocusedId(focus);
    if (!focus) return;
    window.setTimeout(() => {
      const target = document.getElementById(focus);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  const componentOptions = useMemo(() => {
    const components = questionBank
      .filter((item) => (track === "all" ? true : item.track === track))
      .map((item) => item.component);
    return [{ value: "all", label: "全部组件" }, ...Array.from(new Set(components)).map((item) => ({ value: item, label: item }))];
  }, [track]);

  useEffect(() => {
    if (!componentOptions.some((option) => option.value === component)) setComponent("all");
  }, [component, componentOptions]);

  const filteredQuestions = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return questionBank.filter((item) => {
      const state = getState(item.id);
      if (track !== "all" && item.track !== track) return false;
      if (component !== "all" && item.component !== component) return false;
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      if (type !== "all" && item.type !== type) return false;
      if (sourceCategory !== "all" && item.sourceCategory !== sourceCategory) return false;
      if (progress !== "all" && state.progress !== progress) return false;
      if (favoritesOnly && !state.favorite) return false;
      if (!search) return true;

      const haystack = [
        item.title,
        item.component,
        item.topic,
        item.summary,
        item.conclusion,
        ...(item.questionIntent || []),
        ...(item.answerOutline || []),
        ...(item.referenceAnswer || []),
        ...(item.fieldSignals || []),
        item.standardAnswer,
        ...(item.sourceLabels || []),
        ...item.scorePoints,
        ...item.followUps,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [component, difficulty, favoritesOnly, getState, keyword, progress, progressMap, sourceCategory, track, type]);

  return (
    <Layout title="题库总览" description="按方向、组件、难度、题型和来源筛选面试题，并查看评分点、延伸追问与关联知识库。">
      <main className="atlas-home catalog-page">
        <section className="catalog-hero catalog-hero--neutral">
          <div className="catalog-hero-copy">
            <p className="hero-kicker">Question Bank</p>
            <h1>题库总览</h1>
            <p className="hero-text">
              题库不是和知识库分离的题目列表，而是从知识点、工程链路、样例代码和来源证据中抽出的练习层。先按方向筛选，再按组件、难度、题型和掌握状态缩小范围。
            </p>
            <div className="question-summary-row">
              <span className="mini-chip">{questionBank.length} 道题</span>
              <span className="mini-chip">已看 {progressSummary.viewed}</span>
              <span className="mini-chip">已练 {progressSummary.done}</span>
              <span className="mini-chip">收藏 {progressSummary.favorites}</span>
              <span className="mini-chip">待复习 {progressSummary.review}</span>
            </div>
            <div className="inline-links">
              <Link className="inline-link" to="/favorites">打开收藏夹</Link>
              <Link className="inline-link" to="/review-queue">打开复习队列</Link>
              <Link className="inline-link inline-link--strong" to="/dashboard">查看学习仪表盘</Link>
            </div>
          </div>
          <div className="filter-panel">
            <div className="filter-panel-head">
              <p className="section-label">筛选器</p>
              <h2>按准备目标缩小范围</h2>
            </div>
            <div className="filter-grid">
              <FilterSelect label="方向" value={track} onChange={setTrack} options={questionFilters.tracks} />
              <FilterSelect label="组件" value={component} onChange={setComponent} options={componentOptions} />
              <FilterSelect label="难度" value={difficulty} onChange={setDifficulty} options={questionFilters.difficulties} />
              <FilterSelect label="题型" value={type} onChange={setType} options={questionFilters.types} />
              <FilterSelect label="来源" value={sourceCategory} onChange={setSourceCategory} options={questionFilters.sources || [{ value: "all", label: "全部来源" }]} />
              <FilterSelect label="掌握状态" value={progress} onChange={setProgress} options={progressFilters} />
              <label className="filter-toggle">
                <input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} />
                <span>只看已收藏</span>
              </label>
              <label className="filter-field filter-field--search">
                <span>关键词</span>
                <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="例如 Kafka、MCP、Tracing" />
              </label>
            </div>
          </div>
        </section>

        <section className="catalog-shell">
          <div className="section-head">
            <p className="section-label">结果列表</p>
            <h2>当前命中 {filteredQuestions.length} 道题</h2>
            <p>每道题都带方向、组件、来源类型、评分点、延伸追问和关联文档。建议先读知识库，再用题库检查能否讲清楚原理、边界和工程取舍。</p>
          </div>
          <div className="question-card-grid">
            {filteredQuestions.map((item) => {
              const state = getState(item.id);
              const className = item.id === focusedId ? "question-card question-card--focused" : "question-card";

              return (
                <article key={item.id} id={item.id} className={className}>
                  <div className="question-card-head">
                    <div className="question-card-meta">
                      <span className="mini-chip">{trackLabel(item.track)}</span>
                      <span className="mini-chip">{item.component}</span>
                      <span className="mini-chip">{item.difficulty}</span>
                      <span className="mini-chip">{item.type}</span>
                      <span className="mini-chip">{sourceLabel(item.sourceCategory)}</span>
                      <span className="mini-chip">{state.progress}</span>
                    </div>
                    <span className="question-minutes">{item.minutes} 分钟</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="question-actions">
                    <button
                      type="button"
                      className={state.favorite ? "state-button state-button--active" : "state-button"}
                      onClick={() => updateQuestionState(item.id, { favorite: !state.favorite })}
                    >
                      {state.favorite ? "已收藏" : "收藏题目"}
                    </button>
                    {progressSteps.map((progressValue) => (
                      <button
                        key={progressValue}
                        type="button"
                        className={state.progress === progressValue ? "state-button state-button--active" : "state-button"}
                        onClick={() => updateQuestionState(item.id, { progress: progressValue })}
                      >
                        {progressValue}
                      </button>
                    ))}
                  </div>
                  <div className="question-two-col">
                    <div>
                      <h4>回答主线</h4>
                      <ul className="compact-list">
                        {(item.answerOutline || item.scorePoints).map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4>追问</h4>
                      <ul className="compact-list">
                        {item.followUps.map((follow) => <li key={follow}>{follow}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="inline-links">
                    <Link className="inline-link inline-link--strong" to={item.detailHref}>查看题目详情</Link>
                    {item.relatedDocs.map((doc) => (
                      <Link key={doc.href} className="inline-link" to={doc.href}>{doc.label}</Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          {filteredQuestions.length === 0 ? (
            <article className="empty-state">
              <h3>当前筛选条件下还没有命中题目</h3>
              <p>可以放宽方向、组件、难度或关键词。题库会持续从知识库中抽取更细的原理题、场景题、系统设计题和排障题。</p>
            </article>
          ) : null}
        </section>
      </main>
    </Layout>
  );
}

