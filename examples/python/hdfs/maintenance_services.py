"""HDFS maintenance-services 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsMaintenanceServicesChecklist:
    topic: str = "maintenance-services"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 维护能力要围绕“看状态、修副本、均衡数据、隔离节点、控制元数据恢复成本”组织，不能把 fsck、dfsadmin、balancer 当成孤立命令背。",
            "objects": self.core_objects,
            "chain": [
          "先用 UI、report、日志判断是容量、节点、block、网络还是元数据问题。",
          "如果是 block 健康问题，用 fsck 定位文件和 block 状态。",
          "如果是节点下线或扩容后的数据不均，用 decommission 或 balancer 控制迁移。",
          "如果是 NameNode edits 膨胀或重启恢复风险，检查 checkpoint 机制和元数据目录。"
],
            "boundaries": [
          "Balancer 是均衡工具，不是性能万能药，运行时也会消耗网络和磁盘。",
          "Decommission 要考虑副本数和机架分布，否则会放大欠复制风险。",
          "fsck 发现问题不等于自动修复所有业务影响，还要看 replica 是否可用。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsMaintenanceServicesChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
