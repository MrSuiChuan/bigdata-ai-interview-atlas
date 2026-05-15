from dataclasses import dataclass, field


@dataclass
class PlanState:
    goal: str
    plan: list[str] = field(default_factory=list)
    results: list[str] = field(default_factory=list)


def planner(state: PlanState) -> PlanState:
    state.plan = [
        "检索官方文档",
        "提取关键机制",
        "整理成标准答案",
    ]
    return state


def executor(state: PlanState) -> PlanState:
    for step in state.plan:
        state.results.append(f"已执行: {step}")
    return state


if __name__ == "__main__":
    state = PlanState(goal="回答 Iceberg hidden partitioning 原理")
    state = planner(state)
    state = executor(state)
    print(state)