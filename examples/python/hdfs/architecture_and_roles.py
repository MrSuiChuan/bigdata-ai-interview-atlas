"""HDFS architecture-and-roles 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsArchitectureAndRolesChecklist:
    topic: str = "architecture-and-roles"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 架构的主线是 master/slave 式元数据集中管理加 DataNode 分布式存储；高质量回答要能说明为什么元数据集中简化了一致性，同时也带来 NameNode 可用性和容量边界。",
            "objects": self.core_objects,
            "chain": [
          "命名空间请求进入 NameNode，NameNode 在内存元数据上做校验和更新。",
          "数据访问请求被拆成元数据获取和 DataNode I/O 两段。",
          "DataNode 通过心跳和 block report 把局部事实上报给 NameNode。",
          "HA 场景下 standby 通过共享 edits 追赶 active 状态，故障切换时必须确保旧 active 被隔离。"
],
            "boundaries": [
          "集中元数据让一致性更容易，但会让 NameNode 内存、GC、RPC 和磁盘持久化变成关键资源。",
          "HA 解决 active NameNode 故障切换，不自动解决错误删除、业务误写和小文件膨胀。",
          "DataNode 数量扩展提升容量和吞吐，但 namespace 规模仍受 NameNode 约束。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsArchitectureAndRolesChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
