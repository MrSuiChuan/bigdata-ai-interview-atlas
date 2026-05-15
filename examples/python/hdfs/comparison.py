"""HDFS comparison 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsComparisonChecklist:
    topic: str = "comparison"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 是大文件分布式存储底座，不是消息系统、低延迟 KV 表、对象存储 API 或湖仓事务表；对比题要从访问模式、元数据、事务、索引和计算耦合度拆。",
            "objects": self.core_objects,
            "chain": [
          "先判断业务是顺序批处理、低延迟点查、事件流还是湖仓表管理。",
          "如果是大文件离线处理，HDFS 可能是合适底座。",
          "如果需要行级低延迟更新，考虑 HBase 或其他 KV/OLTP 系统。",
          "如果需要表级 ACID、快照、schema 演进，HDFS 本身不够，需要湖仓表格式。"
],
            "boundaries": [
          "HDFS 可以作为底层存储承载很多系统文件，但不代表它提供这些系统的上层语义。",
          "对象存储和 HDFS 在一致性、rename、目录语义、吞吐和运维模型上要结合具体实现判断。",
          "湖仓表格式不是替代磁盘，它是叠在文件存储上的表管理层。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsComparisonChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
