"""Trino lifecycle 面试推演脚本。

脚本用于把回答结构化，不替代真实集群命令。
生产排查需要结合官方文档、系统指标、日志、执行计划和变更记录。
"""

from dataclasses import dataclass, field
import json


@dataclass
class TrinoLifecycleChecklist:
    component: str = "Trino"
    positioning: str = "面向多数据源的分布式 SQL 查询引擎"
    objects: list[str] = field(default_factory=lambda: ["Coordinator","Worker","Catalog","Connector","Split","Stage","Task","Exchange"])
    evidence: list[str] = field(default_factory=lambda: [
        "核心对象状态",
        "请求链路",
        "错误日志或执行计划",
        "资源与治理边界",
    ])

    def outline(self) -> dict:
        return {
            "component": self.component,
            "positioning": self.positioning,
            "not_for": "底层数据湖存储、事务数据库或单一数据格式",
            "objects": self.objects,
            "flow": "SQL 进入 Coordinator 后经过解析、分析、优化和分布式计划生成；Worker 执行 splits，stage 之间通过 exchange 传递中间数据。",
            "boundary": "Trino 自身是查询引擎，不统一提供跨异构数据源的事务一致性；一致性语义来自 connector 和底层系统。",
            "evidence": self.evidence,
        }


if __name__ == "__main__":
    print(json.dumps(TrinoLifecycleChecklist().outline(), ensure_ascii=False, indent=2))
