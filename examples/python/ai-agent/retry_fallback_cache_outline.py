from dataclasses import dataclass, field
from typing import List


@dataclass
class NodeState:
    attempt: int = 0
    events: List[str] = field(default_factory=list)


def flaky_primary_call(state: NodeState) -> str:
    state.attempt += 1
    if state.attempt == 1:
        raise TimeoutError("temporary upstream timeout")
    return "primary-result"


def fallback_call() -> str:
    return "fallback-result"


def run_node_with_policy(state: NodeState) -> str:
    try:
        result = flaky_primary_call(state)
        state.events.append("primary success")
        return result
    except TimeoutError:
        state.events.append("primary timeout")
        if state.attempt >= 2:
            state.events.append("switch to fallback")
            return fallback_call()
        raise


def run_cached_transform(cache: dict, key: str) -> str:
    if key in cache:
        return cache[key]
    cache[key] = f"normalized:{key}"
    return cache[key]


if __name__ == "__main__":
    state = NodeState()
    cache = {}
    try:
        run_node_with_policy(state)
    except TimeoutError:
        state.events.append("retry later")
    print(run_node_with_policy(state))
    print(run_cached_transform(cache, "spark_sql_plan"))
    print(run_cached_transform(cache, "spark_sql_plan"))
    print(state.events)