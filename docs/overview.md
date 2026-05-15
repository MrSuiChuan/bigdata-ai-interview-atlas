---
kb_id: overview
title: 知识库总览
domain: blueprint
component: project
topic: overview
difficulty: beginner
status: reviewed
sidebar_position: 1
version_scope: Workspace overview as organized on 2026-04-29
last_verified_at: '2026-04-29'
source_ids: []
claim_ids: []
---

# 知识库总览

这个系统分成三层：知识库、题库、模拟训练。知识库负责解释技术本身，题库负责把知识转成训练问题，模拟训练负责把多个知识点串成表达和复盘场景。

## 知识库负责什么

知识库只做知识解读，不承担标准答案堆叠。每个主题都要尽量说明以下内容：

1. 这个技术解决什么问题。
2. 它处在系统的哪一层。
3. 核心对象是谁创建、谁维护、状态如何变化。
4. 数据、请求或控制流如何经过内部链路。
5. 它保证什么，不保证什么。
6. 生产环境中如何排障、调优和治理。

### 阅读方式

先看组件总览，再看核心对象、读写链路、状态管理、一致性边界、性能模型和排障页面。不要从题目直接倒推知识点，否则容易只记结论，不能解释机制。

## 题库负责什么

题库基于知识库生成，用来训练表达、判断掌握程度和暴露薄弱点。题库可以包含问题、评分点、进一步分析方向和参考解释，但这些表达不应该混入知识库正文。

### 题库和知识库的关系

题库中的每一道题都应该能回到一个或多个知识库页面。如果题库讲得比知识库更深，说明知识库需要回补，而不是让题库替代知识库。

## 模拟训练负责什么

模拟训练面向真实沟通场景，用来练习如何把多个主题串起来，例如 Kafka 消费延迟、Spark Shuffle 调优、Flink 状态恢复、RAG 评估和 Agent 工具治理。

### 训练后的回流

模拟训练发现的问题要回流到两个地方：如果是概念不清，回补知识库；如果是表达不稳，回到题库训练。

## 当前主线

1. 大数据：Kafka、Spark、Flink、Hive、HDFS、HBase、Iceberg、Hudi、Delta Lake、ClickHouse、Trino、YARN。
2. AI Agent：Runtime、框架、协议、RAG、工具调用、多 Agent、观测与安全治理。
3. 大模型基础：Transformer、Tokenizer、训练、推理、Embedding、RAG、评估和安全。

## 内容质量原则

1. 优先使用官方文档、规范、API 文档和权威论文作为事实来源。
2. 复杂结论必须绑定 source 和 claim。
3. 工程实践可以吸收社区项目经验，但不能替代官方事实。
4. 页面要讲清机制、边界、失败模式和示例，不只列术语。
