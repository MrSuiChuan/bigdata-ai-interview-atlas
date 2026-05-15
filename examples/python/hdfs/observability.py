"""HDFS observability 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsObservabilityChecklist:
    topic: str = "observability"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 观测要从全局到局部：先看 NameNode/UI/report 判断集群健康，再用 fsck、DataNode 日志和上层任务错误定位到文件、block、节点和路径。",
            "objects": self.core_objects,
            "chain": [
          "先判断是全局问题还是单任务、单路径、单节点问题。",
          "全局问题看 NameNode 状态、safemode、容量水位、dead DataNode 和欠复制。",
          "单文件问题用 fsck 定位 block 和 replica。",
          "任务问题结合 Spark/MapReduce 日志，看是否是权限、文件缺失、坏块、慢节点或网络超时。"
],
            "boundaries": [
          "一个指标无法证明根因，要把 UI、命令、日志、任务错误合并判断。",
          "剩余容量充足不代表无热点、无坏盘、无欠复制。",
          "上层任务失败不一定是 HDFS，也可能是表元数据、输入格式或作业配置问题。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsObservabilityChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
