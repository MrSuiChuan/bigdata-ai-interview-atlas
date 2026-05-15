"""ClickHouse 通用排障起手式 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "troubleshooting"
    title: str = "通用排障起手式"
    summary: str = "先缩小故障面，再决定看 query、parts、后台任务还是复制。"
    questions: list[str] = field(default_factory=lambda: [
    "这是查询问题、part 问题、后台任务问题，还是复制问题？",
    "下一步应该去 EXPLAIN、replication_queue 还是 system.processes？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
    "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
    "SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
