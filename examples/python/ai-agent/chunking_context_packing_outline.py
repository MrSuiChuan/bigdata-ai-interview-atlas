from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    score: float


def chunk_document(text: str, chunk_size: int = 80, overlap: int = 20) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = max(start + chunk_size - overlap, start + 1)
    return chunks


def pack_context(chunks: list[Chunk], top_k: int = 3) -> list[str]:
    # 让最关键证据尽量出现在更靠前的位置，避免被埋在长上下文中段。
    ranked = sorted(chunks, key=lambda item: item.score, reverse=True)
    return [item.text for item in ranked[:top_k]]


if __name__ == "__main__":
    doc = "Kafka Consumer Group 通过分区实现组内并行消费，同一分区在同一时刻只会分配给组内一个消费者。" * 4
    raw_chunks = chunk_document(doc)
    scored_chunks = [Chunk(text=chunk, score=1.0 / (index + 1)) for index, chunk in enumerate(raw_chunks)]
    print(pack_context(scored_chunks))