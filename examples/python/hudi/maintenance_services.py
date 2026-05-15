"""Hudi maintenance-services 面试推演脚本。

脚本用于把回答结构化，不替代真实集群命令。
生产排查需要结合官方文档、系统指标、日志、执行计划和变更记录。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HudiMaintenanceServicesChecklist:
    component: str = "Hudi"
    positioning: str = "带时间线、upsert、增量处理和表服务的湖仓数据管理层"
    objects: list[str] = field(default_factory=lambda: ["Timeline","Instant","Commit","File Group","File Slice","Base File","Log File","Index","Compaction","Clustering"])
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
            "not_for": "单纯文件格式或只读数据目录",
            "objects": self.objects,
            "flow": "写入根据 record key 和 index 定位目标 file group，按 Copy-on-Write 或 Merge-on-Read 方式生成新文件或追加 log，并把结果提交到 timeline。",
            "boundary": "Hudi 的语义围绕 timeline instant 和表服务展开，不应被简化成把 Parquet 文件覆盖到目录里。",
            "evidence": self.evidence,
        }


if __name__ == "__main__":
    print(json.dumps(HudiMaintenanceServicesChecklist().outline(), ensure_ascii=False, indent=2))
