---
kb_id: blueprint/content-spec
title: "内容规范"
domain: blueprint
component: project
topic: content-spec
difficulty: intermediate
status: reviewed
sidebar_position: 2
version_scope: "Workspace content specification as of 2026-04-29"
last_verified_at: "2026-04-29"
source_ids: []
claim_ids: []
---

# 一句话原则

知识库负责把技术讲清楚，题库负责把知识转成练习。两者可以互相引用，但不能混写。

# Source 规范

`Source` 表示经过登记的来源条目，用来记录官方文档、官方规范、论文、代码仓库或可信实践资料。

必须字段：

1. `id`
2. `title`
3. `kind`
4. `component`
5. `url`
6. `version_scope`
7. `last_verified_at`
8. `trust_level`

使用原则：

1. 协议、API、版本行为、产品能力优先使用官方来源。
2. 实践资料可以提供工程经验和学习路径，但不能替代官方事实。
3. 来源只说明依据，不等于内容已经被充分解读。

# Claim 规范

`Claim` 表示最小可复核事实单元。它应该是一条可以被明确验证的事实，而不是一段写作建议。

必须字段：

1. `id`
2. `domain`
3. `component`
4. `statement`
5. `status`
6. `version_scope`
7. `last_verified_at`
8. `source_ids`

可选字段：

1. `confidence`
2. `notes`

处理原则：

1. Claim 应尽量原子化。
2. API、协议、版本行为类 Claim 必须有官方来源。
3. 实践来源 Claim 必须标明适用边界。
4. `reviewed` 不代表永久正确，需要随版本变化复核。

# 知识库 Document 规范

`Document` 是面向学习者的知识解读文档，位于 `docs` 目录。

知识库应该回答：

1. 这个技术解决什么问题。
2. 核心对象是什么。
3. 对象之间的状态关系是什么。
4. 读写链路、执行链路或控制链路如何运行。
5. 一致性、容错、性能、安全和资源边界是什么。
6. 生产环境如何观测和排障。
7. 和相邻技术的职责边界是什么。
8. 必要时提供配置、SQL、伪代码、命令或 Mermaid 图。

知识库不应该出现：

1. `标准答案`
2. `标准面试答案`
3. `常见误答`
4. `必答点`
5. `评分点`
6. `延伸追问`
7. `面试答题结构`
8. `30 秒 / 2 分钟 / 5 分钟回答`
9. 旧的答题手册式文件名

推荐章节：

```markdown
# 一句话定位

# 它解决什么问题

# 核心对象

# 核心机制

# 执行链路

# 状态变化

# 一致性与容错边界

# 性能模型

# 生产排障

# 和相邻技术的边界

# 示例

# 总结
```

必须 frontmatter 字段：

1. `kb_id`
2. `title`
3. `domain`
4. `component`
5. `topic`
6. `difficulty`
7. `status`
8. `sidebar_position`
9. `version_scope`
10. `last_verified_at`
11. `source_ids`
12. `claim_ids`

# 题库 Question 规范

`Question` 位于 `questions` 目录，用来训练面试表达和追问能力。

题库可以包含：

1. 题目
2. 一句话结论
3. 这题想考什么
4. 回答主线
5. 参考作答
6. 现场判断抓手
7. 常见误区
8. 追问
9. 关联知识库文档

题库必须从知识库派生，不能反过来替代知识库。

必须 frontmatter 字段：

1. `id`
2. `title`
3. `domain`
4. `component`
5. `topic`
6. `question_type`
7. `difficulty`
8. `status`
9. `version_scope`
10. `last_verified_at`
11. `source_ids`
12. `claim_ids`

推荐 `question_type`：

1. `concept`
2. `principle`
3. `failure`
4. `tradeoff`
5. `comparison`
6. `system-design`
7. `troubleshooting`
8. `operations`
9. `security`

# 中文写作规范

所有对用户可见的正文默认使用中文。

允许保留英文的情况：

1. 专业术语，例如 `Consumer Group`、`Watermark`、`Tool Calling`。
2. 官方产品名或框架名，例如 `OpenAI Agents SDK`、`LangGraph`。
3. 代码、字段名、命令、协议关键字。

推荐写法：

1. 首次出现时使用“中文解释 + 英文术语”。
2. 后续重复出现时可以只保留专业术语。
3. 不要把整段正文写成英文。

# 开发顺序

推荐按组件闭环推进：

1. 登记 `sources`。
2. 抽取 `claims`。
3. 编写 `docs` 知识解读。
4. 补充 `examples`。
5. 基于知识库生成 `questions`。
6. 再补系统设计、模拟面试和学习路径。

一个组件至少应具备：

1. 总览定位文档。
2. 核心对象与状态文档。
3. 主链路文档。
4. 边界与不保证事项文档。
5. 故障与恢复文档。
6. 配置或治理文档。
7. 最小必要样例。
8. 对应题库。

# 校验命令

每次内容调整后至少运行：

```powershell
npm.cmd run validate
npm.cmd run audit:knowledge
node scripts\build-catalog-from-markdown.mjs --write
npm.cmd --prefix web\docs-site run build
```

完整验收运行：

```powershell
npm.cmd run audit:all
```
