"""HDFS lifecycle 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsLifecycleChecklist:
    topic: str = "lifecycle"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 文件生命周期不只是 create/read/delete，而是涉及 lease、block 分配、close、namespace 变更、trash/回收、空间释放、升级和 rollback 的完整运维边界。",
            "objects": self.core_objects,
            "chain": [
          "Client 创建路径，NameNode 记录元数据并控制写入 lease。",
          "写入过程中 block replica 被逐步创建和确认。",
          "close 后元数据进入完成状态，上层读者才能稳定消费。",
          "删除、降低副本数或升级回滚会触发后续空间和元数据处理。"
],
            "boundaries": [
          "文件 close 前后的语义要和上层任务提交协议一起判断。",
          "删除不一定立即等于所有空间立刻可用，要结合回收站、快照和副本删除流程。",
          "升级回滚不是业务层恢复方案，需要提前设计窗口和验证策略。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsLifecycleChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
