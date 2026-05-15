"""HDFS core-objects-state 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsCoreObjectsStateChecklist:
    topic: str = "core-objects-state"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 的对象不能按名词背，要按状态所有权理解：NameNode 管 namespace 和 block map，DataNode 管本地 block replica，Client 负责发起元数据请求和实际数据流。",
            "objects": self.core_objects,
            "chain": [
          "NameNode 收到客户端请求后先处理 namespace 语义，例如 open、create、rename、delete。",
          "涉及数据读写时，NameNode 返回 block 位置或分配写入 pipeline，而不是转发数据。",
          "DataNode 接收客户端读写请求，同时按 NameNode 指令创建、删除、复制 block。",
          "心跳说明 DataNode 是否在线，block report 说明它持有哪些 block，二者共同驱动副本管理。"
],
            "boundaries": [
          "NameNode 持有全局元数据，因此小文件和超大 namespace 会放大它的内存与 RPC 压力。",
          "DataNode 不理解 HDFS 文件语义，只知道本地 block 文件和校验相关信息。",
          "Block 大小和副本数是文件级存储行为的重要参数，但不能替代数据建模。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsCoreObjectsStateChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
