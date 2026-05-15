"""HDFS resource-governance 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsResourceGovernanceChecklist:
    topic: str = "resource-governance"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 资源治理要同时管容量、文件数、block 数、副本数、目录权限、热点访问和运维流程；只看磁盘使用率无法保证集群健康。",
            "objects": self.core_objects,
            "chain": [
          "先按业务目录和租户拆解容量、文件数、增长速度和访问模式。",
          "再检查副本数、block 大小、冷数据生命周期和小文件合并策略。",
          "对扩容和下线节点，配合 balancer、decommission 和容量水位管理。",
          "对权限和误删风险，配合 owner/group/mode、审计和上层平台流程。"
],
            "boundaries": [
          "DataNode 还有空间不代表 NameNode 元数据健康。",
          "统一目录权限不能替代租户隔离和上层数仓权限治理。",
          "冷热数据生命周期要考虑快照、回收站和合规保留要求。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsResourceGovernanceChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
