"""ClickHouse 可观测性入口清单 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "observability"
    title: str = "可观测性入口清单"
    summary: str = "把 query_log、processes、parts、replicas 和指标表串成现场证据链。"
    questions: list[str] = field(default_factory=lambda: [
    "现在需要看的是历史查询、在线请求，还是节点资源？",
    "现象证据是否已经足够支撑下一步判断？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;",
    "SELECT user, query_id, elapsed, memory_usage FROM system.processes ORDER BY elapsed DESC LIMIT 10;",
    "SELECT metric, value FROM system.metrics ORDER BY metric LIMIT 20;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
