"""ClickHouse 布局设计验证 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "partition_layout"
    title: str = "布局设计验证"
    summary: str = "同时验证 PARTITION BY、ORDER BY、active part 数和索引裁剪效果。"
    questions: list[str] = field(default_factory=lambda: [
    "分区是否只承担管理边界，而不是被误用成主加速手段？",
    "排序键前缀是否真的帮助高频过滤条件？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "SELECT partition, count() AS active_parts, sum(rows) AS total_rows, sum(bytes_on_disk) AS total_bytes FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY partition;",
    "EXPLAIN indexes = 1 SELECT count() FROM analytics.events_local WHERE event_type = 'pay' AND event_time >= toDateTime('2026-05-01 00:00:00');"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
