---
kb_id: blueprint/claim-quality-audit
title: "Claim 质量审计"
domain: blueprint
component: project
topic: claim-quality-audit
difficulty: intermediate
status: reviewed
sidebar_position: 10
version_scope: "Claim audit generated on 2026-05-11"
last_verified_at: "2026-05-11"
source_ids: []
claim_ids: []
---

# 结论

Claim 是准确性的核心资产。当前主要问题不是数量不足，而是 generated claim、reviewed/high 标记过强、实践来源和官方来源边界不够清晰。

# 汇总

1. Claim 总数：1425
2. generated deep-coverage claim：0
3. generated 且 reviewed/high 的 Claim：0
4. 无来源 Claim：0
5. 仅实践来源 Claim：30

# 按 status 统计

| status | 数量 |
| --- | ---: |
| reviewed | 1425 |

# 按 confidence 统计

| confidence | 数量 |
| --- | ---: |
| high | 1392 |
| medium | 33 |

# 处理规则

1. generated claim 后续不能直接保持 reviewed/high，必须人工复核。
2. 仅实践来源的 Claim 可以保留，但要标出适用范围。
3. API、协议、框架行为类 Claim 必须补官方来源。
4. Claim 应尽量原子化，避免把写作建议当成事实 Claim。
