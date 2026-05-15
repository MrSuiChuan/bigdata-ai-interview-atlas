"""ClickHouse 写入路径核查 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "write_path"
    title: str = "写入路径核查"
    summary: str = "确认 part 生成、Distributed 转发和复制传播分别走到哪一步。"
    questions: list[str] = field(default_factory=lambda: [
    "当前成功返回代表本地 part 已提交，还是远端和副本也已追平？",
    "part 生成速度是否已经快到会拖垮后台 merge？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "INSERT INTO analytics.events_local SELECT now(), number, 'pay', randUniform(1, 100) FROM numbers(100000);",
    "SELECT name, partition, rows, bytes_on_disk, active FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC LIMIT 10;",
    "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
