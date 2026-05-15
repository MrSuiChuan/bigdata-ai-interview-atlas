"""ClickHouse 读取路径验证 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "read_path"
    title: str = "读取路径验证"
    summary: str = "把 EXPLAIN 与 query_log 对齐，确认查询到底裁掉了多少。"
    questions: list[str] = field(default_factory=lambda: [
    "partition、granule 和列读取分别裁掉了多少？",
    "协调节点是否在分布式查询里承受了额外压力？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "EXPLAIN indexes = 1 SELECT event_type, count() FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;",
    "SELECT query_duration_ms, read_rows, read_bytes, result_rows, memory_usage FROM system.query_log WHERE query LIKE '%event_type = \\'pay\\'%' AND type = 'QueryFinish' ORDER BY event_time DESC LIMIT 5;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
