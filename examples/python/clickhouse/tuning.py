"""ClickHouse 调优闭环模板 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "tuning"
    title: str = "调优闭环模板"
    summary: str = "先看 EXPLAIN，再看 query_log，最后决定改布局还是改设置。"
    questions: list[str] = field(default_factory=lambda: [
    "收益来自读放大下降，还是只是偶然缓存命中？",
    "当前更应该改表布局、改写入模式，还是改执行设置？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "EXPLAIN indexes = 1 SELECT user_id, sum(amount) FROM analytics.events_local WHERE event_type = 'pay' AND event_time >= toDateTime('2026-05-01 00:00:00') GROUP BY user_id;",
    "SELECT query_duration_ms, read_rows, read_bytes, memory_usage FROM system.query_log WHERE query LIKE '%sum(amount)%' AND type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
