"""HDFS read-path 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsReadPathChecklist:
    topic: str = "read-path"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 读路径的关键是 metadata lookup 和 data streaming 分离：NameNode 返回 block locations，客户端按距离、可用性和失败切换策略从 DataNode 拉取数据。",
            "objects": self.core_objects,
            "chain": [
          "Client open 文件，NameNode 返回文件状态、block 列表和位置。",
          "Client 选择一个合适的 DataNode 建立数据流。",
          "DataNode 从本地磁盘读取 block 数据并返回给客户端。",
          "遇到失败或校验问题时，客户端尝试其他 replica，同时错误信息会影响后续排障。"
],
            "boundaries": [
          "NameNode 不转发数据，因此 NameNode RPC 慢和 DataNode 读慢是两类问题。",
          "读吞吐可能被磁盘、网络、block 分布、客户端并发和上层任务调度共同限制。",
          "replica 存在不代表一定读取快，距离、负载和坏盘都会影响实际表现。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsReadPathChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
