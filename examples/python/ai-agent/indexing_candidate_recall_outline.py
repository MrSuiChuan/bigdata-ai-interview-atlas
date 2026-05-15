from dataclasses import dataclass


@dataclass
class IndexEntry:
    doc_id: str
    chunk_id: int
    text: str


def build_index(documents: dict[str, list[str]]) -> list[IndexEntry]:
    entries: list[IndexEntry] = []
    for doc_id, chunks in documents.items():
        for chunk_id, chunk in enumerate(chunks):
            entries.append(IndexEntry(doc_id=doc_id, chunk_id=chunk_id, text=chunk))
    return entries


def retrieve_candidates(index: list[IndexEntry], keyword: str) -> list[IndexEntry]:
    return [entry for entry in index if keyword in entry.text]


if __name__ == "__main__":
    index = build_index(
        {
            "kafka": [
                "Partition 是并行度基本单位。",
                "Consumer Group 负责分区分配和故障接管。",
            ],
            "spark": [
                "RDD lineage 支持容错恢复。",
            ],
        }
    )
    candidates = retrieve_candidates(index, "分区")
    print("候选数量:", len(candidates))
    print(candidates)