"""HDFS performance-model 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsPerformanceModelChecklist:
    topic: str = "performance-model"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 性能分析必须先确认访问模式：它擅长大文件顺序吞吐和数据本地性，不擅长海量小文件、低延迟点查和频繁随机更新。",
            "objects": self.core_objects,
            "chain": [
          "先区分读慢、写慢、list 慢、任务慢和 NameNode RPC 慢。",
          "读写慢看 DataNode 磁盘、网络、block 分布、pipeline 和客户端并发。",
          "list/open/create 慢看 NameNode RPC、目录规模、文件数和 GC。",
          "任务慢再结合 Spark/MapReduce 的 split、locality、并行度和数据倾斜分析。"
],
            "boundaries": [
          "调大 block size 可能减少元数据和任务数量，但不能替代小文件治理。",
          "增加 DataNode 能提升容量和数据面吞吐，不直接解决 NameNode 元数据瓶颈。",
          "副本数、压缩格式、文件格式和上层计算框架会共同影响性能。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsPerformanceModelChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
