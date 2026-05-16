---
kb_id: blueprint/frontend-coverage-audit
title: "前端收录审计"
domain: blueprint
component: project
topic: frontend-coverage-audit
difficulty: intermediate
status: reviewed
sidebar_position: 9
version_scope: "Workspace audit generated on 2026-05-05"
last_verified_at: "2026-05-05"
source_ids: []
claim_ids: []
---

# 结论

这份报告用于发现 Markdown 内容和前端入口之间的缺口。前端可见不等于内容质量达标，但不可见会直接影响使用。

# 题库收录

1. Markdown 题目总数：600
2. 前端 questionBank 总数：600
3. Markdown 有但前端缺失：0
4. 前端有但 Markdown 缺失：0
5. 题目详情页文件数：0
6. 重复题目详情页 ID：0
7. 前端题库中没有独立详情页的题目：600

# Markdown 有但前端缺失：按方向统计

| 方向 | 数量 |
| --- | ---: |

# Markdown 有但前端缺失：按组件统计

| 组件 | 数量 |
| --- | ---: |

# 首页模块未链接文档：按方向统计

| 方向 | 数量 |
| --- | ---: |

# 重复题目详情页


# 后续处理原则

1. 前端 questionBank 应从 Markdown 自动生成，避免手写 catalog 漏题。
2. 题目详情页应尽量改成统一入口，避免每题一个 JS 文件导致构建膨胀。
3. 首页模块文档链接应自动审计，不能长期依赖人工维护。
