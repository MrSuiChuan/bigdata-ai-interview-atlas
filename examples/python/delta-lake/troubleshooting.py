"""Delta Lake troubleshooting 面试推演脚本。

脚本用于把回答结构化，不替代真实集群命令。
生产排查需要结合官方文档、系统指标、日志、执行计划和变更记录。
"""

from dataclasses import dataclass, field
import json


@dataclass
class DeltaLakeTroubleshootingChecklist:
    component: str = "Delta Lake"
    positioning: str = "基于事务日志的数据湖表格式和湖仓语义层"
    objects: list[str] = field(default_factory=lambda: ["_delta_log","JSON Commit","Checkpoint","Protocol","Metadata","AddFile","RemoveFile","Data File","Snapshot"])
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
            "not_for": "计算引擎本身或普通 Parquet 目录",
            "objects": self.objects,
            "flow": "写入端生成数据文件后以事务提交日志动作；读取端根据日志和 checkpoint 构造快照，再读取对应数据文件。",
            "boundary": "Delta 提供表级 ACID 语义、time travel 和 schema 相关能力，但底层对象存储和计算引擎行为仍要纳入设计。",
            "evidence": self.evidence,
        }


if __name__ == "__main__":
    print(json.dumps(DeltaLakeTroubleshootingChecklist().outline(), ensure_ascii=False, indent=2))
