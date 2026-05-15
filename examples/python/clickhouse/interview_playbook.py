"""ClickHouse 端到端巡检串讲 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "interview_playbook"
    title: str = "端到端巡检串讲"
    summary: str = "把布局、写入、读取、后台维护和复制健康放到同一条检查链路中。"
    questions: list[str] = field(default_factory=lambda: [
    "布局是否匹配主查询？",
    "part 是否在健康区间？",
    "后台 merge 和复制是否跟得上业务写入？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "SELECT partition, count() AS active_parts, sum(rows) AS rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
    "SELECT query_duration_ms, read_rows, read_bytes, memory_usage FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;",
    "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
