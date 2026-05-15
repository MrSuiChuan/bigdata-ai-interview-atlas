---
kb_id: bigdata/hive/llap-daemon-io-cache-and-hybrid-execution-boundaries
title: Hive LLAP Daemon、IO Cache 与混合执行
description: 解释 LLAP 如何通过驻留服务、缓存和向量化执行降低查询延迟，以及它和 Hive 正常查询链路的边界在哪里。
domain: bigdata
component: hive
topic: llap-daemon-io-cache-hybrid-execution-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 15
version_scope: Hive design docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - hive-llap
  - hive-config-properties
  - hive-docs-home
  - hive-introduction
  - hive-language-manual
  - hive-language-manual-ddl
  - hive-managed-external-tables
  - hive-metastore-admin
claim_ids:
  - hive-claim-0095
  - hive-claim-0096
  - hive-claim-0097
  - hive-claim-0098
  - hive-claim-0099
  - hive-claim-0100
  - hive-claim-0101
  - hive-claim-0102
  - hive-claim-0103
  - hive-claim-0104
  - hive-claim-0105
  - hive-claim-0106
tags:
  - hive
  - llap
  - cache
  - vectorization
  - tez
  - knowledge-base
  - production
---
## LLAP 解决的不是“有没有内存”，而是低延迟路径要不要常驻化

第一次接触 LLAP 时，最容易把它理解成“把数据放进内存，所以 Hive 会更快”。这个理解太浅。官方设计文档对 LLAP 的定义非常明确：它是一个 hybrid execution model，由长生命周期的 daemon 和紧密集成的 DAG 框架组成，把 caching、pre-fetching、一部分 query processing 和 access control 下沉到 daemon 中。

这段定义最重要的地方不是缓存，而是“常驻服务化”和“混合执行”。LLAP 不是再造一个完整执行引擎，而是在现有 Hive 执行体系里，把对低延迟最敏感的读和局部计算路径做深。

## 为什么 LLAP 不是第二个 Tez

官方文档明确写了两层边界：

1. LLAP 不会替代现有 process-based Hive execution。
2. 它不是像 MapReduce 或 Tez 那样的 execution engine。
3. 整体执行仍然由现有引擎如 Tez 在 LLAP 节点和普通容器之间统一调度和监控。

这三条合在一起，才能准确描述 LLAP 的定位。它不是拿来替换 Tez 的，而是和 Tez 协作。Tez 仍然掌握整张 DAG 的全局调度权，LLAP 只是让其中一部分适合加速的片段进入常驻 daemon 路径。

## 为什么“部署了 LLAP”不等于“所有查询都跑在 LLAP 里”

这点在官方配置里也有证据。`hive.execution.mode` 用来决定 query fragments 在 `container` 还是 `llap` 中运行，默认值是 `container`；同时 `hive.llap.io.enabled` 还能控制 LLAP I/O 层是否启用。

这说明 LLAP 从来不是不可绕开的唯一运行时，而是一条可选快路径。查询是否进入 LLAP，至少要先满足模式和 I/O 配置层面的前提。

## daemon 真正承担了哪些工作

官方文档给出的范围很具体：LLAP daemon 运行在 worker 节点上，负责 I/O、cache 和 query fragment execution；可执行的片段包括 filter、projection、data transformation、partial aggregate、sorting、bucketing 以及 hash join 或 semi-join。

这说明 LLAP 不只是“缓存服务”，而是会承担一部分真实的算子执行责任。但它执行的是 fragment，而不是整条 SQL。这个边界很重要，因为它直接区分了“局部下沉”与“整查询接管”这两种完全不同的架构含义。

## 为什么 LLAP 的低延迟来自一整条协同链路

官方文档对读路径机制给出了很强的事实锚点：LLAP 把 I/O 和压缩格式转换卸载到独立线程，再把数据向后传递成适合 vectorized processing 的 RLE-encoded columnar format，这个格式本身也是 cache format。

再结合另一组事实：LLAP 会缓存 metadata 和 data，缓存数据位于 off-heap，缓存单位是 column chunks，并使用面向分析负载的驱逐策略。把这些事实连起来，就能得到一条完整因果链：

1. 读取和格式转换先被专门线程处理。
2. 结果被转成向量化友好的列式表达。
3. 同一种表达又被拿来做缓存格式。
4. 数据再次命中时，不必重复做同样的解码和转换。

所以 LLAP 的收益不是单一“命中缓存”，而是 I/O、解码、缓存和向量化执行在同一种列式表示上协同。

## 为什么事务感知是 LLAP 正确性边界，而不是附加功能

官方文档明确说明，LLAP 对事务是感知的。它会在数据进入缓存前，先把请求所需表状态对应的 delta 合并起来，并且可以根据请求提供多个版本。这个事实非常重要，因为它说明：

1. LLAP 缓存的不是简单的原始文件片段。
2. ACID 表的正确性不能被“最近读过一遍”这种经验替代。
3. 同一物理对象在不同请求下可能需要体现不同可见性版本。

因此，LLAP 的正确性来源依然是 Hive 的事务和可见性语义，缓存只是性能工具，不是正确性来源。

## 为什么只允许 Hive code 和 blessed UDF

官方文档还指出，LLAP 只接受 Hive code 和 blessed UDF，因为代码不会被临时本地化后再动态执行。这个边界解释了一个容易被忽略的问题：为什么 LLAP 不是任意脚本都能随意下沉的开放执行沙盒。

原因在于，低延迟和安全边界是一起设计的。要把片段长期运行在 daemon 中，就必须限制执行面，不能靠每次动态本地化陌生代码来完成。

## SARG、Bloom Filter 和 runtime filtering 为什么也属于 LLAP 价值的一部分

官方文档说明，LLAP 可以在底层存储支持的前提下把 SARG 和 Bloom filter 下推到存储层，还会自动创建 Bloom filter 作为动态 runtime filtering。这意味着 LLAP 的收益不仅来自“数据已经在缓存里”，还来自“很多不需要的数据根本没被读进来”。

因此，当一条查询在 LLAP 场景下明显提速时，不能简单把全部收益归因于 cache hit。还要考虑：

1. 是否发生了更深层的 predicate pushdown。
2. 是否利用了运行时 Bloom filter 减少了无效扫描。
3. 是否因为 vectorized-friendly data path 让后续片段也变快了。

## 失败恢复为什么没有被节点缓存绑死

官方文档对恢复边界也说得很清楚：请求会携带数据位置和元数据，而节点本身保持无状态，因此 Tez AM 能在片段失败时在集群内重新运行这些 fragments。这里的关键是“daemon 常驻”和“节点无状态”并不矛盾。

这意味着：

1. LLAP 有常驻服务，但不会把执行恢复绑死到单台机器。
2. 某个 daemon 出问题，不等于整条查询失去恢复路径。
3. 有缓存不代表必须回到同一节点才能继续执行。

## 哪些 vertex 才有资格进入 LLAP

除了 `hive.execution.mode` 和 `hive.llap.io.enabled`，官方配置里还有两条很容易被忽略的资格边界：`hive.llap.auto.enforce.vectorized` 和 `hive.llap.auto.enforce.stats` 默认都为 `true`，要求输入必须支持向量化并且列统计可用，vertex 才会被考虑放入 LLAP。

这条边界说明，LLAP 不是“集群一部署就自动全局强启”。它会根据输入形态和统计条件筛选候选片段。因此现实中的 Hive 查询经常会处于混合状态：有些片段走 LLAP，有些片段仍留在普通 container。

## 观察 LLAP 是否真正生效，要看什么证据

最有价值的观察点通常包括：

1. 当前 `hive.execution.mode` 是否为 `llap`。
2. `hive.llap.io.enabled` 是否启用。
3. 当前 vertex 是否满足 vectorization 和 stats 的资格条件。
4. 执行日志或计划中是否体现 query fragment 被下沉到 LLAP daemon。
5. ACID 表场景下是否正确体现目标版本可见性，而不是只看 cache hit。

只有把这些证据合起来，才能回答“LLAP 到底有没有参与、参与到哪一层”。

## 常见误判

1. 把 LLAP 说成新的执行引擎，或者说成“替代 Tez”。
2. 认为部署了 LLAP 后，所有 Hive 查询都会完整跑在 LLAP 里。
3. 把 LLAP 只理解成内存缓存，而忽略 fragment execution、pushdown 和 runtime filtering。
4. 在事务表场景下，只谈缓存命中，不谈版本可见性。

## 示例

```sql
SET hive.execution.mode=llap;
SET hive.llap.io.enabled=true;

EXPLAIN
SELECT shop_id, sum(amount)
FROM dwd_sales_orc
WHERE dt = '2026-05-01'
GROUP BY shop_id;
```

这段示例的重点不是“设成 llap 就一定更快”，而是用配置和计划一起验证：查询片段是否真的有资格进入 LLAP，以及执行链路是否体现了预期下沉。

## 本页结论

LLAP 的核心价值，是在不替换 Hive 整体执行引擎的前提下，把低延迟最敏感的 I/O、缓存、局部计算、事务感知读取和运行时过滤做成常驻化快路径。它不是“把数据放进内存”这么简单，而是一整条混合执行链路的重构。

## 来源与事实边界

### 来源

`hive-llap`、`hive-config-properties`、`hive-docs-home`、`hive-introduction`、`hive-language-manual`、`hive-language-manual-ddl`、`hive-managed-external-tables`、`hive-metastore-admin`

### 事实声明

`hive-claim-0095`、`hive-claim-0096`、`hive-claim-0097`、`hive-claim-0098`、`hive-claim-0099`、`hive-claim-0100`、`hive-claim-0101`、`hive-claim-0102`、`hive-claim-0103`、`hive-claim-0104`、`hive-claim-0105`、`hive-claim-0106`
