---
id: q-bigdata-hbase-0031
title: 版本数和删除标记为什么会把 HBase 慢慢拖成“读放大系统”？
domain: bigdata
component: hbase
topic: read-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: HBase official docs as verified on 2026-05-09
last_verified_at: '2026-05-09'
source_ids:
  - hbase-datamodel
  - hbase-acid-semantics
  - hbase-regionserver-docs
claim_ids:
  - bigdata-hbase-claim-0004
  - bigdata-hbase-claim-0006
  - bigdata-hbase-claim-0013
related_docs:
  - bigdata/hbase/read-path
  - bigdata/hbase/performance-model
estimated_minutes: 9
---

# 题目

版本数和删除标记为什么会把 HBase 慢慢拖成“读放大系统”？

# 一句话结论

多版本和删除标记会让一次读取为了拼出当前结果不得不接触越来越多状态，读放大是累积出来的。

# 这题想考什么

这题主要考你是否理解 HBase 读取为什么要跨多层状态合并结果，以及慢读通常从哪里产生。

# 回答主线

1. 说明多版本和删除标记都会增加读路径的可见性判断成本。
2. 说明删除不是立即物理擦除，而是依赖后续 compaction 清理。
3. 说明版本/删除标记问题具有慢性累积特征。
4. 说明版本保留策略属于性能与治理设计的一部分。

# 参考作答

因为 HBase 读取的成本不只取决于“现在有多少数据”，还取决于“为了确认当前可见值，要额外检查多少历史状态”。多版本和删除标记正是这类额外状态的主要来源。

HBase 支持一个 cell 的多个版本共存，删除操作也不是立刻把所有旧值从底层文件中物理抹掉，而是先留下删除标记，后续再由 compaction 重写文件清理。这意味着当版本保留过多、删除频繁而 compaction 又跟不上时，读路径为了判断当前结果是否可见，就需要跨更多版本、更多标记、更多 `HFile` 做合并判断。

这类问题的危险之处在于它常常是慢性积累。刚上线时看不出问题，但随着时间增长，点查和 scan 都可能越来越不稳定，缓存也更难真正覆盖有效工作集。所以版本和删除策略不是“想留多少留多少”的业务自由，而是性能设计的一部分。

# 现场判断抓手

1. 能把版本膨胀、删除标记堆积和 `HFile` 债务一起解释。
2. 这类问题对 `Get` 和 `Scan` 都会有影响，只是表现形式可能不同。

# 常见误区

1. 觉得删除成功就代表底层文件立刻干净了。
2. 只把慢读归因给磁盘，不看版本和删除标记。
3. 认为保留版本只影响存储空间，不影响读性能。

# 追问

1. 为什么 major compaction 往往和版本、删除清理联系更紧？
2. 如果业务坚持保留很多版本，你会怎么控制读放大风险？
3. 删除标记多但磁盘还没满，为什么线上仍可能先变慢？
