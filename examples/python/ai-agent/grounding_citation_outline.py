from dataclasses import dataclass, field


@dataclass
class Evidence:
    file_name: str
    snippet: str
    citation: str


@dataclass
class GroundedAnswer:
    answer: str
    citations: list[str] = field(default_factory=list)


def select_supporting_evidence(question: str) -> list[Evidence]:
    print(f"根据问题选择支持证据: {question}")
    return [
        Evidence(
            file_name="kafka-docs.md",
            snippet="同一 consumer group 内，一个 partition 同时只会分配给一个 consumer。",
            citation="[1] kafka-docs.md",
        )
    ]


def compose_grounded_answer(question: str, evidence: list[Evidence]) -> GroundedAnswer:
    answer = "在同一个 Consumer Group 中，分区是并行消费的基本上限，因此消费者数超过分区数后吞吐通常不会继续线性增长。"
    citations = [item.citation for item in evidence]
    return GroundedAnswer(answer=answer, citations=citations)


if __name__ == "__main__":
    selected = select_supporting_evidence("为什么 Kafka Consumer Group 并行度受分区数限制")
    grounded = compose_grounded_answer("为什么 Kafka Consumer Group 并行度受分区数限制", selected)
    print(grounded)