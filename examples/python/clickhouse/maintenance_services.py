"""ClickHouse 后台维护状态巡检 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "maintenance_services"
    title: str = "后台维护状态巡检"
    summary: str = "判断 merge、mutation、TTL 和复制任务是否在抢资源。"
    questions: list[str] = field(default_factory=lambda: [
    "现在最重的后台任务是谁？",
    "前台查询慢是因为读路径，还是后台任务在吞资源？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT database, table, elapsed, progress, num_parts, result_part_name FROM system.merges ORDER BY elapsed DESC;",
    "SELECT database, table, mutation_id, command, parts_to_do, is_done FROM system.mutations ORDER BY create_time DESC;",
    "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
