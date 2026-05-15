---
id: q-bigdata-hudi-0005
title: Hudi 的 upsert 写路径为什么不能只理解成“找到文件然后覆盖”
domain: bigdata
component: hudi
topic: write-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-writing-data-docs
  - hudi-timeline-docs
  - hudi-file-layout-docs
claim_ids:
  - bigdata-hudi-claim-0005
  - bigdata-hudi-claim-0006
  - bigdata-hudi-claim-0010
related_docs:
  - bigdata/hudi/write-path
  - bigdata/hudi/core-objects-state
estimated_minutes: 10
---

# 题目

Hudi 的 upsert 写路径为什么不能只理解成“找到文件然后覆盖”？

# 一句话结论

因为一次 upsert 同时涉及 key 路由、file group 归属、COW 或 MOR 的物理写法、instant 提交边界以及失败恢复，不是简单文件覆盖动作。

# 这题想考什么

这题考的是写路径的完整链路理解。真正答到原理层的人，会把 record key、index、file group、instant 和 rollback 串起来。

# 回答主线

1. 先讲 upsert 先决定记录归属，而不是先落文件。
2. 再讲 COW 和 MOR 写路径怎样分叉。
3. 然后讲 instant completed 才是真正提交成功。
4. 最后补失败恢复和表服务影响。

# 参考作答

第一步不是覆盖文件，而是先根据 `record key` 和索引确定这条记录应该进入哪个 file group。只有归属找准了，后续更新链路才不会被打散。这个阶段如果 key 设计不稳、索引过重或 file group 分布失衡，写入吞吐会先掉下来。

第二步才是物理写入分叉。COW 倾向于直接生成新的 base file 版本，MOR 倾向于先把变化追加进 log file，后续再依赖 compaction 整理。也就是说，同样叫 upsert，不同表类型的真实代价并不一样。

第三步必须落到 timeline。文件写出来不代表提交成功，只有对应 instant 完成状态推进，读者才应该把这批变化视为稳定版本。失败时也不能只看目录，而要结合 rollback、cleaning 和 instant 状态判断哪些产物应保留、哪些应清理。

# 现场判断抓手

1. 看写入对应 instant 是否 completed。
2. 看 key 路由后的 file group 是否失衡。
3. 看 MOR 场景下 log file 是否积压。

# 常见误区

1. 把 upsert 说成覆盖 Parquet 文件。
2. 只讲 Spark API，不讲 timeline 边界。
3. 忽略 COW 和 MOR 在写成本上的差异。

# 追问

1. 为什么目录里有新文件但查询还可能看不到？
2. preCombine 和业务最终顺序是什么关系？
3. 为什么 compaction 会反过来影响写链路的长期成本？
