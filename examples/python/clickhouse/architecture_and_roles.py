"""ClickHouse 本地表、Distributed 表与副本分层 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "architecture_and_roles"
    title: str = "本地表、Distributed 表与副本分层"
    summary: str = "确认访问层、本地数据面和复制层的职责边界。"
    questions: list[str] = field(default_factory=lambda: [
    "入口表是本地 MergeTree 还是 Distributed？",
    "当前问题发生在本地表、路由层还是复制层？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "SHOW CREATE TABLE analytics.events_all;",
    "SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
