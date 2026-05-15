from dataclasses import dataclass


@dataclass
class QueryState:
    question: str
    retrieved_docs: list[str]
    draft_answer: str | None = None


def retrieve(question: str) -> list[str]:
    return [
        "DocA: Kafka exactly-once 的边界是幂等生产 + 事务 + 下游语义配合。",
        "DocB: Consumer 侧仍需处理外部副作用一致性。",
    ]


def generate_answer(state: QueryState) -> QueryState:
    state.draft_answer = (
        "基于检索结果，Kafka exactly-once 不能脱离生产端事务和下游消费语义单独讨论。"
    )
    return state


if __name__ == "__main__":
    state = QueryState(question="Kafka exactly-once 怎么理解？", retrieved_docs=[])
    state.retrieved_docs = retrieve(state.question)
    state = generate_answer(state)
    print(state)