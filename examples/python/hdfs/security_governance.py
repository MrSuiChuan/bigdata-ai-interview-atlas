"""HDFS security-governance 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsSecurityGovernanceChecklist:
    topic: str = "security-governance"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 安全不能只说 chmod，而要把文件 owner/group/mode、认证、代理用户、服务账号、审计和 Hive/Spark 等上层引擎的权限边界一起讲。",
            "objects": self.core_objects,
            "chain": [
          "用户或服务向上层引擎提交任务，实际 HDFS 访问身份可能是用户、代理用户或服务账号。",
          "HDFS 根据路径、owner、group、mode 等信息判断是否允许访问。",
          "上层 Hive/Spark/调度平台可能增加表级或任务级权限，但不能替代底层路径控制。",
          "审计需要串联应用层用户、代理链路、HDFS 操作和数据目录。"
],
            "boundaries": [
          "chmod 只能解决一部分访问控制，不能单独解决认证、数据脱敏和审计。",
          "给服务账号过大权限会放大越权访问和误删风险。",
          "HDFS 目录权限和表权限不一致时，容易出现能查不能读或能读绕过表权限的问题。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsSecurityGovernanceChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
