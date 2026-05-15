"""HDFS partition-layout 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsPartitionLayoutChecklist:
    topic: str = "partition-layout"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 的 block 和 replica 布局既影响可靠性，也影响吞吐、网络、NameNode 元数据和上层任务并行度；面试中要把 block size、replication factor 和 rack awareness 联动解释。",
            "objects": self.core_objects,
            "chain": [
          "文件写入时被切成 block，NameNode 为每个 block 选择若干 DataNode 放置 replica。",
          "常见三副本策略会优先考虑本地或同 rack、远端 rack 和远端 rack 内不同节点。",
          "DataNode 上报 block report 后，NameNode 才能持续维护全局 block map。",
          "欠复制、过复制和失衡会触发修复、删除或 balancer 相关动作。"
],
            "boundaries": [
          "Block 不是 Hive 分区，也不是 Kafka Partition，不承载业务顺序语义。",
          "调大 block size 不能解决所有小文件问题，文件数量本身仍会压 NameNode。",
          "跨 rack 副本提升容灾，但会影响写入链路网络成本。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsPartitionLayoutChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
