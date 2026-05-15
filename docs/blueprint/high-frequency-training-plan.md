---
kb_id: blueprint/high-frequency-training-plan
title: "真实面试训练闭环"
domain: blueprint
component: project
topic: high-frequency-training-plan
difficulty: advanced
status: reviewed
sidebar_position: 15
version_scope: "Workspace training plan generated on 2026-04-29"
last_verified_at: "2026-04-29"
source_ids: []
claim_ids: []
---

# 目标

真实面试训练闭环不是继续堆题，而是让每道高频题都能回到知识库。答题失败时，回补知识库；知识库没有讲清时，不直接扩题库。

# 大数据高频训练组

1. Kafka：Consumer Group、Rebalance、ISR、acks、幂等、事务、offset、log compaction。
2. Spark：DAG、Stage、Shuffle、Catalyst、AQE、Executor 内存、数据倾斜、慢 SQL。
3. Flink：State、Checkpoint、Watermark、反压、Exactly-once、TwoPhaseCommit、状态恢复。
4. Hive：Metastore、分区、SerDe、小文件、ACID、Join 优化、EXPLAIN。
5. HDFS：NameNode、Block、Pipeline、HA、FsImage/EditLog、小文件、block corrupt。
6. HBase：RowKey、Region、WAL、MemStore、HFile、BlockCache、Compaction、热点。
7. Trino：Coordinator、Worker、Connector、Split、Exchange、Join 内存、下推。
8. ClickHouse：MergeTree、Part、Mark、稀疏索引、Merge、Replica、Shard。
9. Iceberg/Hudi/Delta Lake：Snapshot、Timeline、Transaction Log、并发提交、小文件治理。

# AI 与大模型高频训练组

1. Agent Runtime：执行循环、工具调用、状态、记忆、trace、eval、人工介入。
2. MCP/A2A：Host、Client、Server、Tool、Resource、Prompt、Agent Card、Task。
3. RAG：chunk、embedding、hybrid retrieval、rerank、引用、拒答、权限过滤、eval。
4. 多 Agent 框架：状态持久化、工作流、工具边界、长任务恢复、多 Agent 协作。
5. 大模型基础：Tokenizer、context window、采样、结构化输出、延迟、成本、评估。

# 单题训练流程

1. 先用 30 秒说清一句话定位。
2. 再用 2 分钟讲核心对象和执行链路。
3. 然后用 5 分钟讲失败场景、性能瓶颈和工程取舍。
4. 最后回到知识库，检查有没有遗漏对象、状态、边界、示例和来源。

# 复盘规则

1. 如果回答只有术语，没有对象关系，回到知识库的“核心对象”补。
2. 如果回答只有正常路径，没有失败路径，回到“生产排障入口”补。
3. 如果回答只有结论，没有约束条件，回到“保证项与边界”补。
4. 如果回答没有示例，回到“工程样例”补。
5. 如果题库讲到知识库没有的内容，先回补知识库，再保留题目。
