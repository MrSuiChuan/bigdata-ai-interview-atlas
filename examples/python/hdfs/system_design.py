"""HDFS system-design 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsSystemDesignChecklist:
    topic: str = "system-design"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 设计题不能只画 NameNode 和 DataNode，要从数据规模、文件大小、读写比例、容灾、机架、权限、多租户、计算框架和运维工具链一起设计。",
            "objects": self.core_objects,
            "chain": [
          "先问业务访问模式：批量写入、批量读取、是否低延迟、是否有随机更新。",
          "再设计目录、文件格式、block size、副本数、机架和容量水位。",
          "然后补 NameNode HA、DataNode 扩缩容、监控、权限、审计和备份策略。",
          "最后说明不适合场景：高 QPS 点查、频繁小文件写入、在线事务更新。"
],
            "boundaries": [
          "PB 级容量不等于 PB 级可用设计，元数据和运维流程同样关键。",
          "HDFS 只解决文件存储底座，上层表格式和计算引擎要另外设计。",
          "多租户场景必须把权限和审计放进方案，而不是上线后补。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsSystemDesignChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
