---
kb_id: community/datawhale/rag/what-is-vs
title: Datawhale what-is-vs 项目整理
domain: community
component: datawhale
topic: what-is-vs
difficulty: advanced
status: reviewed
sidebar_position: 22
version_scope: Datawhale what-is-vs as organized on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - datawhale-what-is-vs
claim_ids: []
---

# 一句话定位

向量检索与 RAG 实践，适合整理向量表示、相似度、ANN、召回和检索边界。

# 项目在面试系统里的位置

what-is-vs 在本系统中被归入「向量检索原理项目」。整理它的目的不是复刻原仓库目录，而是把社区项目经验转成面试可表达的知识点、系统设计能力和项目复盘素材。

# 核心对象

1. 向量：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
2. 相似度：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
3. ANN 索引：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
4. 过滤：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
5. 召回：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
6. 排序：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
7. Embedding：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。

# 核心原理

1. 向量相似不等于答案正确。
2. ANN 提升效率但可能牺牲部分召回。
3. 向量检索需要和关键词检索、过滤、重排配合。

# 可转化的面试场景

1. 解释向量检索
2. 选择 ANN 索引
3. 排查相似但不正确的召回

# 标准回答框架

回答 what-is-vs 相关问题时，建议按四步组织：

1. 先说明它解决的工程问题：向量检索原理项目。
2. 再说明关键对象：向量、相似度、ANN 索引、过滤、召回。
3. 然后讲清执行链路、状态变化、失败恢复和可观测性。
4. 最后补充边界：哪些结论来自 Datawhale trusted-community，哪些 API、协议或版本行为需要官方文档交叉复核。

# 常见误区

1. 只介绍仓库做了什么，不提炼背后的通用机制。
2. 把教程步骤当成面试答案，没有讲对象、状态和链路。
3. 不说明项目适用边界和生产化差距。
4. 把社区经验直接说成官方事实。

# 需要官方交叉复核的点

1. 具体向量库索引类型
2. 相似度实现
3. 过滤语义

# 题库入口

1. `q-community-datawhale-what-is-vs-0001`
1. `q-community-datawhale-what-is-vs-0002`
1. `q-community-datawhale-what-is-vs-0003`
1. `q-community-datawhale-what-is-vs-0004`
1. `q-community-datawhale-what-is-vs-0005`
