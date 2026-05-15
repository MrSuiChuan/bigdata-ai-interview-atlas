from dataclasses import dataclass, field


@dataclass
class RunRecord:
    status: str
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


@dataclass
class OfflineEvalResult:
    recall_at_5: float
    ndcg_at_10: float
    bm25_baseline: float


def debug_run(record: RunRecord) -> str:
    if record.errors:
        return "先处理 ingestion / indexing 错误"
    if record.warnings:
        return "检查 skipped docs 和 warning 是否影响关键语料"
    return "进入 retrieval ranking 与 answer synthesis 诊断"


def compare_with_baseline(result: OfflineEvalResult) -> str:
    if result.ndcg_at_10 < result.bm25_baseline:
        return "当前方案还没有稳定超过 BM25 baseline"
    return "当前方案已超过 baseline，可以继续做成本评估"


if __name__ == "__main__":
    run = RunRecord(status="success", warnings=["2 documents skipped because of malformed field"])
    eval_result = OfflineEvalResult(recall_at_5=0.74, ndcg_at_10=0.61, bm25_baseline=0.58)
    print(debug_run(run))
    print(compare_with_baseline(eval_result))