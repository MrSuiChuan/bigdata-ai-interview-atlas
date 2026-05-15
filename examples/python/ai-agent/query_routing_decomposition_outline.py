from dataclasses import dataclass


@dataclass
class RoutePlan:
    route: str
    subqueries: list[str]


def route_query(question: str) -> str:
    if "Kafka" in question:
        return "bigdata-kafka-index"
    if "Agent" in question:
        return "ai-agent-index"
    return "general-index"


def decompose_query(question: str) -> list[str]:
    if "以及" in question:
        return [part.strip() for part in question.split("以及") if part.strip()]
    return [question]


if __name__ == "__main__":
    question = "Kafka Consumer Group 原理以及 rebalance 为什么代价高"
    plan = RoutePlan(route=route_query(question), subqueries=decompose_query(question))
    print(plan)