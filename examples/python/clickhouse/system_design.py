"""ClickHouse 架构骨架检查 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "system_design"
    title: str = "架构骨架检查"
    summary: str = "确认本地表、Distributed 表、TTL 和副本在设计里各自承担什么职责。"
    questions: list[str] = field(default_factory=lambda: [
    "本地表模型是否先于集群拓扑被设计清楚？",
    "副本是为了高可用，还是被误当成主要扩容手段？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "SHOW CREATE TABLE analytics.events_all;",
    "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
