---
kb_id: blueprint/example-quality-audit
title: "样例代码质量审计"
domain: blueprint
component: project
topic: example-quality-audit
difficulty: intermediate
status: reviewed
sidebar_position: 11
version_scope: "Example audit generated on 2026-05-05"
last_verified_at: "2026-05-05"
source_ids: []
claim_ids: []
---

# 结论

样例代码目前主要问题是概念性样例较多，并且当前环境无法稳定执行 Python 样例校验。样例后续需要分级：概念解释、可本地运行、需要集群、伪代码。

# 汇总

1. 样例文件总数：357
2. Python 样例：248
3. SQL 样例：108
4. Shell 样例：1
5. 概念性样例：0
6. 当前环境 Python 可用：否

# 按扩展名统计

| 扩展名 | 数量 |
| --- | ---: |
| .py | 248 |
| .sql | 108 |
| .sh | 1 |

# 后续处理规则

1. 概念性样例必须显式标注 conceptual，不能伪装成生产脚本。
2. Python 样例应尽量能在本地执行，不能执行时要说明依赖和前提。
3. SQL 样例要说明适用引擎、catalog、表格式和执行前提。
4. 大数据组件样例不能只用 dataclass 复述概念，要优先体现真实操作链路。
