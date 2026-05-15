"""HDFS metadata-state 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class HdfsMetadataStateChecklist:
    topic: str = "metadata-state"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "HDFS 元数据不是简单目录信息，而是 namespace、文件属性、block map 和持久化日志的组合；理解 FsImage、EditLog 和 checkpoint，才能讲清 NameNode 重启、恢复和小文件问题。",
            "objects": self.core_objects,
            "chain": [
          "客户端创建、删除、改名、变更副本数等操作会转成元数据变更。",
          "NameNode 把变更记录到 EditLog，并维护内存中的 namespace 和 block map。",
          "Checkpoint 节点周期性拉取 FsImage 和 EditLog，合并后上传新的 FsImage。",
          "重启时 NameNode 读取 FsImage 并回放 EditLog；EditLog 过大时恢复时间会变长。"
],
            "boundaries": [
          "Checkpoint 降低恢复成本，不提供自动主备切换。",
          "扩容 DataNode 不能直接解决 NameNode 元数据膨胀。",
          "只看磁盘容量无法判断 NameNode 是否接近内存或 GC 边界。"
],
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = HdfsMetadataStateChecklist()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
