"""HDFS tuning 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsTuningChecklist:
    topic: str = "tuning"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 调优不是背参数，而是根据文件大小、吞吐目标、容灾目标、机架拓扑、上层任务并行度和 NameNode 资源做权衡。",
            "objects": self.core_objects,
            "chain": [
          "先用监控确认瓶颈在 NameNode、DataNode、网络、客户端还是上层框架。",
          "如果 NameNode 压力来自小文件，优先减少文件和 block 数。",
          "如果写入慢，检查 pipeline、磁盘、网络、机架、客户端并发和副本数。",
          "如果读取慢，检查 block locality、热点节点、坏盘、压缩格式和任务并行度。"
],
            "boundaries": [
          "没有通用最优 block size，必须结合数据规模和上层计算方式。",
          "副本数不是越高越好，高副本会放大写入和存储成本。",
          "参数修改需要结合版本和集群配置，不应脱离 hdfs-default.xml 和生产观测。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsTuningChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
