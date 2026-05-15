"""ClickHouse 安全边界定义 辅助脚本。

该脚本输出排查主题、建议追问和可复核 SQL。
"""

import json
from dataclasses import dataclass, asdict, field


@dataclass
class ClickHouseGuide:
    topic: str = "security_governance"
    title: str = "安全边界定义"
    summary: str = "用角色、row policy 和 quota 组合出最小权限模型。"
    questions: list[str] = field(default_factory=lambda: [
    "权限是直接发给用户，还是通过角色复用？",
    "数据可见范围和资源边界是否都已经被定义？"
])
    evidence_sql: list[str] = field(default_factory=lambda: [
    "CREATE ROLE analytics_reader;",
    "GRANT SELECT ON analytics.events_local TO analytics_reader;",
    "CREATE ROW POLICY only_cn_events ON analytics.events_local FOR SELECT USING region = 'cn' TO analytics_reader;",
    "CREATE QUOTA analytics_reader_quota FOR INTERVAL 1 hour MAX queries = 20000 TO analytics_reader;"
])


if __name__ == "__main__":
    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))
