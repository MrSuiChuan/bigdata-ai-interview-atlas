---
kb_id: blueprint/content-quality-audit
title: "内容质量审计"
domain: blueprint
component: project
topic: content-quality-audit
difficulty: intermediate
status: reviewed
sidebar_position: 8
version_scope: "Workspace audit generated on 2026-05-07"
last_verified_at: "2026-05-07"
source_ids: []
claim_ids: []
---

# 结论

结构化审计未发现模板化文档、模板化题目、概念性样例、generated claim 或缺失组件分类。后续重点从“清理占位内容”转为“继续按官方来源做深度复核和持续更新”。

# 核心风险

1. 批量组件文档命中模板短语：0 / 147
2. 批量组件题目命中模板短语：0 / 196
3. 概念性样例命中数量：0 / 220
4. generated deep-coverage claim 数量：0 / 1308
5. 批量组件文档单一来源：0 / 147
6. 批量组件题目单一来源：180 / 196
7. Claim 无来源数量：0
8. 仅社区来源 Claim 数量：30

# 题型分布

| question_type | 数量 |
| --- | ---: |
| principle | 293 |
| system-design | 90 |
| tradeoff | 77 |
| operations | 51 |
| troubleshooting | 44 |
| scenario | 26 |
| failure | 11 |
| short_answer | 10 |
| security | 8 |
| comparison | 6 |
| system_design | 4 |

# 缺少 _category_.json 的大数据组件


# Claim 状态分布

| status | 数量 |
| --- | ---: |
| reviewed | 1308 |

# Claim 置信度分布

| confidence | 数量 |
| --- | ---: |
| high | 1277 |
| medium | 31 |

# 后续处理原则

1. 数量达标不能等同于人工精修达标。
2. generated claim 不应直接作为 high confidence 的事实依据。
3. 实践来源可用于补充学习路径和项目经验，但协议、API、版本行为仍需要官方来源交叉确认。
4. 批量生成内容必须进入人工精修队列，不能继续标记为最终完成。
