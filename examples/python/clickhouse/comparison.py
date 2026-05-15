"""ClickHouse 选型前的证据采样 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "comparison"
    title: str = "选型前的证据采样"
    summary: str = "用真实读写特征判断是否适合 ClickHouse，而不是先下结论。"
    questions: list[str] = field(default_factory=lambda: [
    "我们的主场景是交互式分析，还是联邦查询、离线计算或全文搜索？",
    "是否愿意为高频查询维护专门的数据布局？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT query_duration_ms, read_rows, read_bytes, result_rows FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
    "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND active GROUP BY partition ORDER BY active_parts DESC LIMIT 20;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
