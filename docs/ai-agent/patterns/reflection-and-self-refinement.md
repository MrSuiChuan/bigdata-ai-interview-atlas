---
kb_id: ai-agent/patterns/reflection-and-self-refinement
title: Reflection / Self-Refinement：它为什么不是简单重写一遍答案
domain: ai-agent
component: agent-patterns
topic: reflection-self-refinement
difficulty: advanced
status: reviewed
sidebar_position: 3
version_scope: Primary papers as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - self-refine-paper
  - reflexion-paper
  - generative-agents-paper
claim_ids:
  - pattern-claim-0008
  - pattern-claim-0009
  - pattern-claim-0010
  - pattern-claim-0011
  - pattern-claim-0012
tags:
  - ai-agent
  - reflection
  - self-refinement
  - reflexion
---
## 一句话结论



Reflection / Self-Refinement 的关键不是“再改一次答案”，而是让系统把反馈本身变成可利用对象，从而形成持续改进闭环。

## 为什么这类题经常被理解停留在表层

很多人会把 reflection 说成：

1. 让模型再检查一下
2. 不满意就再改一版

如果只答到这里，就很容易和普通 rewrite 混淆。

真正关键的问题是：

1. 反馈来自哪里
2. 反馈是否被保留下来
3. 反馈会不会影响后续决策，而不仅是这一次输出

## Self-Refine 的核心是什么

Self-Refine 论文的结构非常清楚：

1. 先生成初稿
2. 再生成对初稿的 feedback
3. 再基于 feedback refine
4. 多轮循环

重点在于：

1. 生成、反馈、改写是显式分开的
2. 不依赖额外训练数据或额外训练

所以它是一种推理时改进模式，不是训练时改进模式。

## Reflexion 为什么更进一步

Reflexion 的关键在于：

1. 反馈不只是当轮使用
2. 反馈会被存成 verbal reflections
3. 这些 reflections 进入 episodic memory，影响后续尝试

这就从“单轮自我修改”升级成了“跨轮经验积累”。

## Reflection 和 Memory 为什么会自然连在一起

一旦 feedback 要跨步骤或跨回合持续生效，系统就必须回答：

1. 反馈存在哪
2. 下次怎么取
3. 哪些 reflection 值得保留

所以 Reflection pattern 真答深了，几乎一定会碰到 memory architecture。

## 为什么普通 rewrite 不能叫 reflection pattern

如果系统只是：

1. 输出一版
2. 再让模型润色一版

但没有：

1. 显式 feedback 结构
2. 反馈驱动下一轮决策
3. 反馈保留与重用

那更像普通改写，而不是 reflection loop。

## 机制解读

Reflection / Self-Refinement 模式的核心，是把反馈本身变成系统内部的正式对象。Self-Refine 通过“生成 -> 反馈 -> 改写”的迭代循环，在不额外训练模型的前提下改进输出；Reflexion 则进一步把 verbal reflections 存入 episodic memory，使经验可以跨轮复用；Generative Agents 也展示了 reflection 如何从低层记忆中提炼高层结论并影响后续计划。因此，reflection 真正重要的不是多写一版答案，而是让系统形成基于反馈的持续改进回路。

## 易混边界

1. 把 reflection 说成简单 rewrite
2. 只说“让模型反思”，却说不清反馈怎么进入系统
3. 忽略 reflection 与 memory 的关系

## 相关样例

1. `examples/python/ai-agent/reflection_self_refine_outline.py`
