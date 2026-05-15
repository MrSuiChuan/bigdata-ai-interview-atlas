"""HDFS fault-recovery 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsFaultRecoveryChecklist:
    topic: str = "fault-recovery"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 故障恢复不是一个机制，而是 DataNode 心跳检测、副本修复、Safemode、checkpoint、HA failover 和运维工具共同组成的恢复体系。",
            "objects": self.core_objects,
            "chain": [
          "DataNode 周期性发送 Heartbeat；网络分区或节点故障会导致心跳缺失。",
          "NameNode 根据 block report 和副本策略识别欠复制 block。",
          "NameNode 选择其他 DataNode 发起 re-replication，直到满足目标副本数。",
          "NameNode 故障时，HA 依赖 standby 状态追赶和 failover 控制完成切换。"
],
            "boundaries": [
          "副本修复依赖剩余 replica；所有副本都丢失时不能凭空恢复数据。",
          "Safemode 不是故障本身，它是保护状态，要结合 block 安全比例判断。",
          "HA 不等于备份，也不能替代元数据目录、edits 和运维误操作保护。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsFaultRecoveryChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
