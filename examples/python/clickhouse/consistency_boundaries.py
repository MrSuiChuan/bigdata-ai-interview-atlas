"""ClickHouse 一致性边界核查 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "consistency_boundaries"
    title: str = "一致性边界核查"
    summary: str = "区分本地提交、复制追平和 Distributed 转发的完成定义。"
    questions: list[str] = field(default_factory=lambda: [
    "这里的成功是指本地可见、所有副本追平，还是远端 shard 已可见？",
    "调用方有没有重试和幂等策略？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT name, active, rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC LIMIT 10;",
    "SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
