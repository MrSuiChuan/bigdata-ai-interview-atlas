"""HDFS consistency-boundaries 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsConsistencyBoundariesChecklist:
    topic: str = "consistency-boundaries"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 为高吞吐批处理放松了一些通用 POSIX 假设，核心模型更接近写一次读多次、单写者、追加和截断，而不是任意位置随机更新。",
            "objects": self.core_objects,
            "chain": [
          "写入者创建文件并获得 lease，数据沿 pipeline 写入 block replica。",
          "写入过程中的可见性和故障恢复受客户端、lease 和 close 状态影响。",
          "任务型系统常用临时路径写出，再通过 rename 暴露最终结果。",
          "读者按 NameNode 元数据和 block locations 打开文件，而不是参与写入事务。"
],
            "boundaries": [
          "不能把 HDFS 当支持任意随机覆盖更新的文件系统。",
          "HDFS 的 rename 常被上层用作提交边界，但要结合目录、文件系统实现和作业协议理解。",
          "一致性问题排查要同时看 writer、lease、pipeline、NameNode 元数据和上层框架提交逻辑。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsConsistencyBoundariesChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
