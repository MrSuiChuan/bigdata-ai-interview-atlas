---
kb_id: blueprint/release-readiness-checklist
title: "发布级验收清单"
domain: blueprint
component: project
topic: release-readiness-checklist
difficulty: advanced
status: reviewed
sidebar_position: 16
version_scope: "Workspace release checklist generated on 2026-04-29"
last_verified_at: "2026-04-29"
source_ids: []
claim_ids: []
---

# 必须通过的命令

```powershell
npm.cmd run catalog:build
npm.cmd run validate
npm.cmd run audit:all
npm.cmd --prefix web\docs-site run build
```

# 内容验收

1. 知识库是知识解读型，不出现标准答案、常见误答、评分点这类题库结构。
2. 题库可以保留标准答案、评分点、误区和追问，但必须有知识库反查链接。
3. 每个核心组件至少具备定位、对象、链路、边界、性能、排障、示例和对比。
4. AI 实践来源必须被吸收成通用知识，不在前端展示社区品牌。
5. 官方事实以官方来源为准，实践经验只能作为工程补充。

# 前端验收

1. 首页可以访问。
2. 大数据页可以访问。
3. AI Agent 页可以访问。
4. 题库页可以访问。
5. 质量看板可以访问。
6. Kafka、Spark、Flink、Hive 等核心知识页可以访问。
7. 静态产物不包含旧答题手册路径断链。
8. 静态产物不包含不应展示的外部社区品牌名。

# 发布风险

1. Docusaurus 构建耗时较长，失败时优先看 broken links。
2. 如果新增文档后题库 catalog 没更新，要先运行 `npm.cmd run catalog:build`。
3. 如果题库数量和 catalog 数量不一致，先查 Markdown frontmatter。
4. 如果质量看板数据不更新，先运行 `npm.cmd run audit:component-quality`。
5. 如果示例审计提示 `pythonAvailable: false`，说明当前环境没有可用 Python，不代表示例内容一定错误。
