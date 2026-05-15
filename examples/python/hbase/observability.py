"""HBase observability 面试推演脚本。

脚本用于把回答结构化，不替代真实集群命令。
生产排查需要结合官方文档、系统指标、日志、执行计划和变更记录。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HBaseObservabilityChecklist:
    component: str = "HBase"
    positioning: str = "面向稀疏大表和低延迟随机读写的分布式列族存储"
    objects: list[str] = field(default_factory=lambda: ["HMaster","RegionServer","Region","RowKey","Column Family","WAL","MemStore","HFile","BlockCache"])
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
            "not_for": "离线大文件顺序扫描的通用文件系统或关系型 SQL 数仓",
            "objects": self.objects,
            "flow": "客户端定位 meta 和目标 Region 后直连 RegionServer；HMaster 负责 region 分配、故障恢复和管理，不承载正常数据读写主路径。",
            "boundary": "HBase 更适合按 row key 的在线随机访问，常见面试主线是单行读写语义、版本、WAL 恢复和 region 迁移边界。",
            "evidence": self.evidence,
        }


if __name__ == "__main__":
    print(json.dumps(HBaseObservabilityChecklist().outline(), ensure_ascii=False, indent=2))
