"""HDFS write-path 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsWritePathChecklist:
    topic: str = "write-path"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 写入不是客户端把文件发给 NameNode，而是先由 NameNode 建立命名空间和 block 写入计划，再由客户端把数据按 packet 推入 DataNode pipeline。",
            "objects": self.core_objects,
            "chain": [
          "Client 向 NameNode 发起 create，NameNode 校验 namespace 并授予写入。",
          "当需要新 block 时，NameNode 根据副本数、rack、存储策略和节点状态选择 DataNode。",
          "Client 将数据切成 packet 写入第一个 DataNode，第一个 DataNode 再转发给下游 DataNode。",
          "ack 从 pipeline 末端反向返回，客户端据此推进写入并最终 close 文件。"
],
            "boundaries": [
          "HDFS 面向顺序写和追加，不适合把随机覆盖更新作为核心访问模式。",
          "增加副本数提升可靠性和读可用性，但会增加写入网络和存储成本。",
          "pipeline 写失败不等同于文件完全损坏，需要看 block、lease 和已确认副本状态。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsWritePathChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
