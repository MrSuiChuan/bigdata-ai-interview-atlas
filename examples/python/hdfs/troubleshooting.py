"""HDFS troubleshooting 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsTroubleshootingChecklist:
    topic: str = "troubleshooting"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 排障要先分层：NameNode 元数据、DataNode 存储、block 副本、网络、权限和上层任务协议；不要用重启或重跑掩盖根因。",
            "objects": self.core_objects,
            "chain": [
          "先确认故障范围：全局、单目录、单文件、单租户、单 DataNode 还是单任务。",
          "再用 report、fsck、UI、日志定位层次。",
          "根据层次选择动作：修权限、下线坏节点、等待或触发副本修复、治理小文件、调整上层任务。",
          "最后复盘是否需要容量阈值、告警、目录规范或作业提交协议修复。"
],
            "boundaries": [
          "Safemode 不应盲目退出，先确认是否有大量 block 未达到安全阈值。",
          "欠复制不是立即不可用，但长期欠复制会降低容错能力。",
          "小文件治理是长期工程，不是一次合并脚本能彻底解决。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsTroubleshootingChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
