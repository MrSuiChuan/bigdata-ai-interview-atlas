"""ClickHouse 数据生命周期追踪 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "lifecycle"
    title: str = "数据生命周期追踪"
    summary: str = "观察一批数据从新 part 到 merge、mutation、TTL 的演进。"
    questions: list[str] = field(default_factory=lambda: [
    "数据现在停在生命周期的哪一步？",
    "是 merge、mutation 还是 TTL 在拖慢演进？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC;",
    "SELECT event_type, part_name, rows, size_in_bytes FROM system.part_log WHERE database = 'analytics' AND table = 'events_local' ORDER BY event_time DESC LIMIT 20;",
    "SELECT mutation_id, command, parts_to_do, is_done FROM system.mutations WHERE database = 'analytics' AND table = 'events_local';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
