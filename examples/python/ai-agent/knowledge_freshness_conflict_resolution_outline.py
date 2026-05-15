from dataclasses import dataclass


@dataclass
class SourceRecord:
    name: str
    freshness_score: float
    trust_score: float
    statement: str


def choose_preferred_source(records: list[SourceRecord]) -> SourceRecord:
    return max(records, key=lambda item: (item.freshness_score, item.trust_score))


def needs_revision(records: list[SourceRecord]) -> bool:
    return len({item.statement for item in records}) > 1


if __name__ == "__main__":
    sources = [
        SourceRecord(name="doc_a", freshness_score=0.9, trust_score=0.7, statement="feature is enabled"),
        SourceRecord(name="doc_b", freshness_score=0.6, trust_score=0.95, statement="feature is disabled"),
    ]
    print(choose_preferred_source(sources))
    print("needs revision:", needs_revision(sources))