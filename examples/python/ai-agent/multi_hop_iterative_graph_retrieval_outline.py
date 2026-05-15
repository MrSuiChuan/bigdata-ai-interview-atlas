from dataclasses import dataclass, field


@dataclass
class RetrievalState:
    question: str
    reasoning_steps: list[str] = field(default_factory=list)
    retrieved_evidence: list[str] = field(default_factory=list)


def retrieve(query: str) -> list[str]:
    return [f"evidence for: {query}"]


def next_query(state: RetrievalState) -> str:
    if not state.reasoning_steps:
        return state.question
    return f"基于中间结论继续检索: {state.reasoning_steps[-1]}"


def iterative_retrieve(state: RetrievalState, rounds: int = 2) -> RetrievalState:
    for _ in range(rounds):
        query = next_query(state)
        evidence = retrieve(query)
        state.retrieved_evidence.extend(evidence)
        state.reasoning_steps.append(f"根据 {evidence[0]} 形成新的中间结论")
    return state


if __name__ == "__main__":
    state = RetrievalState(question="Kafka Consumer Group 为什么并行度受分区数限制")
    print(iterative_retrieve(state))