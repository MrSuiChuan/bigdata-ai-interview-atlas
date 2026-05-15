"""ClickHouse 核心对象状态巡检 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "core_objects_state"
    title: str = "核心对象状态巡检"
    summary: str = "围绕 part、partition、replica 和 Distributed 表检查真实状态。"
    questions: list[str] = field(default_factory=lambda: [
    "当前最该看的对象是表、part、replica 还是 Distributed 路由？",
    "哪个对象真正持有问题现场的状态？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT database, table, partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY partition, name;",
    "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
