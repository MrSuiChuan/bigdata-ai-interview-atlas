"""ClickHouse 性能基线采样 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "performance_model"
    title: str = "性能基线采样"
    summary: str = "用 query_log、parts 和节点指标判断慢点到底在哪一类成本上。"
    questions: list[str] = field(default_factory=lambda: [
    "当前主瓶颈是读放大、part 过多、后台维护还是内存压力？",
    "如果扩容前不改布局，症状会不会只是被放大？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT query_duration_ms, read_rows, read_bytes, result_rows, memory_usage FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
    "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
    "SELECT metric, value FROM system.metrics WHERE metric IN ('Query', 'Merge', 'ReplicatedFetch');"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
