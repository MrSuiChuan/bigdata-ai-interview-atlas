"""HDFS overview 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsOverviewChecklist:
    topic: str = "overview"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 的核心定位是面向大文件、流式访问和高吞吐批处理的分布式文件系统；面试时要把 NameNode 元数据、DataNode block replica、客户端直连数据流、复制和故障恢复放在一条链路里讲。",
            "objects": self.core_objects,
            "chain": [
          "客户端创建或打开文件前先访问 NameNode，NameNode 校验 namespace、权限和 block 位置信息。",
          "读数据时客户端拿到 block locations 后直接连 DataNode，失败时切换到其他 replica。",
          "写数据时 NameNode 选择 DataNode pipeline，客户端把数据包推入 pipeline，副本写入后逐级确认。",
          "DataNode 周期性上报 Heartbeat 和 Blockreport，NameNode 用这些状态做存活判断和副本修复。"
],
            "boundaries": [
          "适合大文件和顺序吞吐，不适合大量小文件和频繁随机覆盖写。",
          "NameNode 不是数据转发节点，真实文件内容不会经过 NameNode。",
          "Secondary NameNode 不是热备；高可用需要专门的 HA 架构。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsOverviewChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
