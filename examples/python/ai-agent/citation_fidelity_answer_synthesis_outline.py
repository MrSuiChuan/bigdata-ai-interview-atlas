from dataclasses import dataclass, field


@dataclass
class Evidence:
    doc_id: str
    snippet: str
    supports: list[str]


@dataclass
class GroundedDraft:
    answer_sentences: list[str] = field(default_factory=list)
    citations: dict[int, list[str]] = field(default_factory=dict)


def select_evidence(question: str, retrieved: list[Evidence]) -> list[Evidence]:
    return [item for item in retrieved if item.supports]


def synthesize_answer(question: str, evidence: list[Evidence]) -> GroundedDraft:
    draft = GroundedDraft()
    for index, item in enumerate(evidence, start=1):
        draft.answer_sentences.append(f"结论 {index}: {item.snippet}")
        draft.citations[index - 1] = [item.doc_id]
    return draft


def verify_citation_coverage(draft: GroundedDraft) -> bool:
    return len(draft.answer_sentences) == len(draft.citations)


if __name__ == "__main__":
    evidence = [
        Evidence(doc_id="doc-kafka-1", snippet="同一 Consumer Group 内，一个分区同一时刻最多分配给一个消费者。", supports=["并行度上限"]),
        Evidence(doc_id="doc-kafka-2", snippet="分区数决定组内可并行消费的基本上限。", supports=["吞吐扩展边界"]),
    ]
    selected = select_evidence("为什么 Kafka 消费者加到一定数量吞吐不再增长", evidence)
    draft = synthesize_answer("为什么 Kafka 消费者加到一定数量吞吐不再增长", selected)
    print(draft)
    print("引用覆盖是否完整:", verify_citation_coverage(draft))