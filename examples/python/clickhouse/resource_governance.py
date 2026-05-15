"""ClickHouse 资源治理最小动作 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "resource_governance"
    title: str = "资源治理最小动作"
    summary: str = "先看当前重负载，再定义 quota 和工作负载边界。"
    questions: list[str] = field(default_factory=lambda: [
    "最重的是前台查询，还是后台维护任务？",
    "限制对象应该是单次执行、长期配额，还是工作负载调度层？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "SELECT user, query_id, elapsed, memory_usage, query FROM system.processes ORDER BY memory_usage DESC LIMIT 20;",
    "CREATE QUOTA analytics_quota FOR INTERVAL 1 hour MAX queries = 50000, execution_time = 36000 TO analytics_role;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
