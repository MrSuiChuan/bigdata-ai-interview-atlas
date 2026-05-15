"""ClickHouse 整体定位与最小链路 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "overview"
    title: str = "整体定位与最小链路"
    summary: str = "确认表布局、查询裁剪和最小证据链。"
    questions: list[str] = field(default_factory=lambda: [
    "这张表的 ORDER BY 是否服务于高频过滤条件？",
    "这条查询真正裁掉了多少 partition 和 granule？",
    "当前性能问题是读放大，还是后台维护拖慢了读取？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "EXPLAIN indexes = 1 SELECT event_type, sum(amount) FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
