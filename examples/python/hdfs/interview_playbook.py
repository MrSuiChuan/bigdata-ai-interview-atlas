"""HDFS interview-playbook 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsInterviewPlaybookChecklist:
    topic: str = "interview-playbook"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 面试答案要有层次：30 秒讲定位，2 分钟讲对象和链路，5 分钟讲故障、性能、治理和设计取舍。",
            "objects": self.core_objects,
            "chain": [
          "先用一句话把 HDFS 和普通文件系统、对象存储、HBase、Kafka 区分开。",
          "再选一条链路展开，例如读路径或写路径。",
          "接着补失败场景，例如 DataNode 掉线、欠复制、NameNode HA 或小文件。",
          "最后讲取舍：吞吐优先、元数据集中、非低延迟随机更新、多租户治理成本。"
],
            "boundaries": [
          "不要在所有题目里套同一个答案，要根据问题选择读、写、元数据、排障或设计主线。",
          "能画链路比能背名词更重要。",
          "讲参数前先讲问题模型，否则调优答案没有依据。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsInterviewPlaybookChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
