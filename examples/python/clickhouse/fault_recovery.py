"""ClickHouse 故障恢复最小证据链 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "fault_recovery"
    title: str = "故障恢复最小证据链"
    summary: str = "先确认 part、replica 和队列状态，再决定是否进入更重的恢复动作。"
    questions: list[str] = field(default_factory=lambda: [
    "故障发生在 part、本地副本、复制队列，还是需要进入备份恢复？",
    "系统当前还有没有副本自愈条件？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';",
    "SELECT table, is_readonly, queue_size, absolute_delay, lost_part_count FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
    "SELECT database, table, type, create_time, num_tries, last_exception FROM system.replication_queue WHERE database = 'analytics' AND table = 'events_local' ORDER BY create_time;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
