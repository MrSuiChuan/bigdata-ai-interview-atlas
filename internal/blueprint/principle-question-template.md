---
kb_id: blueprint/principle-question-template
title: 原理题模板
---

# 原理题模板

这套模板的目标不是写“名词解释题”，而是把每道高质量面试题都写成：

`现象 -> 机制 -> 边界 -> 故障 -> 权衡`

## 什么叫原理题

一题如果只能回答：

1. 它是什么
2. 它解决什么问题

那还不算原理题。

一题如果必须回答：

1. 为什么这样设计
2. 内部靠什么对象和状态运转
3. 哪些条件下成立
4. 故障时会怎样
5. 代价和权衡是什么

那才算真正深入到原理。

## 标准结构

每道原理题固定写成下面这些栏目：

1. 题目
2. 一句话结论
3. 这题想考什么
4. 回答主线
5. 参考作答
6. 现场判断抓手
7. 常见误区
8. 追问

## 出题公式

推荐按下面这个公式来写题目：

```text
为什么 + 某个现象 / 限制 / 抖动 / 故障
本质上由什么机制决定
这个机制如何影响
语义 / 性能 / 并行度 / 一致性 / 恢复 / 代价
```

## 好题和坏题

### 坏题

什么是 Consumer Group？

### 普通题

为什么 Consumer Group 的并行度受 partition 数限制？

### 好题

为什么 Kafka 在同一 consumer group 内要求一个 partition 同时只能属于一个 consumer？这种 ownership 模型如何同时影响顺序性、offset 提交、故障接管和 rebalance 成本？

## Markdown 模板

```md
---
id: q-xxx-0001
title: 题目标题
domain: bigdata
component: kafka
topic: consumer-group
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "版本范围，必须写清"
last_verified_at: "YYYY-MM-DD"
source_ids:
  - official-source-1
claim_ids:
  - claim-001
related_docs:
  - doc/path-1
estimated_minutes: 8
---

# 题目

# 一句话结论

# 这题想考什么

# 回答主线

# 参考作答

# 现场判断抓手

# 常见误区

# 追问
```

## 质量检查清单

每道原理题在入库前，至少检查下面这些项：

1. 有没有版本范围
2. 有没有官方来源
3. 有没有一句话结论
4. 有没有明确这题想考什么
5. 有没有一条清晰的回答主线
6. 有没有可直接复述的参考作答
7. 有没有现场判断抓手
8. 有没有指出常见误区
9. 有没有继续追问的空间
10. 有没有关联知识库与来源边界

## 深度分级

### L1 概念层

是什么

### L2 作用层

解决什么问题

### L3 机制层

靠什么对象和状态工作

### L4 边界层

保证什么，不保证什么

### L5 故障层

异常、重启、扩容、切换时会怎样

### L6 设计层

为什么这样设计，代价是什么

系统中的“高质量原理题”至少应达到 `L4`，更理想的是达到 `L5/L6`。
