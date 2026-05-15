from dataclasses import dataclass


@dataclass
class Candidate:
    doc_id: str
    keyword_score: float
    vector_score: float
    rerank_score: float = 0.0


def hybrid_retrieve(query: str) -> list[Candidate]:
    print(f"召回阶段: 同时执行 keyword + vector 检索 -> {query}")
    return [
        Candidate(doc_id="doc-1", keyword_score=0.95, vector_score=0.71),
        Candidate(doc_id="doc-2", keyword_score=0.30, vector_score=0.92),
        Candidate(doc_id="doc-3", keyword_score=0.60, vector_score=0.62),
    ]


def rerank(candidates: list[Candidate]) -> list[Candidate]:
    for candidate in candidates:
        candidate.rerank_score = candidate.keyword_score * 0.3 + candidate.vector_score * 0.7
    return sorted(candidates, key=lambda item: item.rerank_score, reverse=True)


if __name__ == "__main__":
    recalled = hybrid_retrieve("Iceberg hidden partitioning 原理")
    ranked = rerank(recalled)
    for row in ranked:
        print(row)