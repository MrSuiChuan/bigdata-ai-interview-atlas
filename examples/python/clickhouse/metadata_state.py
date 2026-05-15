"""ClickHouse 三层元数据交叉核验 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "metadata_state"
    title: str = "三层元数据交叉核验"
    summary: str = "同时检查逻辑定义、物理 part 状态和复制元数据。"
    questions: list[str] = field(default_factory=lambda: [
    "问题出在逻辑定义、物理 part 还是复制元数据？",
    "哪个层次的状态最先失真？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SHOW CREATE TABLE analytics.events_local;",
    "SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';",
    "SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
