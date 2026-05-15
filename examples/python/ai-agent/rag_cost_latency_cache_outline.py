from dataclasses import dataclass


@dataclass
class RagBudget:
    latency_ms: int
    max_cost_level: str
    use_cache: bool
    async_allowed: bool


def choose_path(budget: RagBudget) -> str:
    if budget.async_allowed and budget.max_cost_level == "low":
        return "离线批处理或 flex 路径"
    if budget.use_cache and budget.latency_ms <= 1500:
        return "走缓存友好的在线路径"
    return "标准在线检索 + 合成路径"


if __name__ == "__main__":
    online = RagBudget(latency_ms=1200, max_cost_level="medium", use_cache=True, async_allowed=False)
    offline = RagBudget(latency_ms=60000, max_cost_level="low", use_cache=False, async_allowed=True)
    print(choose_path(online))
    print(choose_path(offline))