from dataclasses import dataclass


@dataclass
class RetrievedDoc:
    title: str
    tenant: str
    year: int
    score: float


def apply_filters(docs: list[RetrievedDoc], tenant: str, min_year: int) -> list[RetrievedDoc]:
    return [doc for doc in docs if doc.tenant == tenant and doc.year >= min_year]


def rerank(docs: list[RetrievedDoc]) -> list[RetrievedDoc]:
    return sorted(docs, key=lambda item: item.score, reverse=True)


if __name__ == "__main__":
    docs = [
        RetrievedDoc(title="Kafka 设计说明", tenant="team-a", year=2025, score=0.86),
        RetrievedDoc(title="旧版 Hive 运维文档", tenant="team-a", year=2022, score=0.91),
        RetrievedDoc(title="Spark 内部资料", tenant="team-b", year=2025, score=0.95),
    ]
    filtered = apply_filters(docs, tenant="team-a", min_year=2024)
    print(rerank(filtered))