---
kb_id: community/datawhale/index
title: "Datawhale 共学专区"
domain: community
component: datawhale
topic: index
difficulty: intermediate
status: reviewed
sidebar_position: 1
version_scope: "Datawhale integration workspace policy as of 2026-04-28"
last_verified_at: "2026-04-28"
source_ids: []
claim_ids: []
---

# 一句话定位

Datawhale 共学专区是可信社区内容的二次整理区，不是原仓库搬运区。它负责把 Datawhale 项目的学习路径、项目经验和实践案例整理成可复习、可检索、可转化为面试题的知识资产。

# 为什么单独成区

Datawhale 内容质量较高，并且用户本人参与社区建设，因此本系统把它设置为 trusted-community 来源。单独成区有三个目的：

1. 保留社区项目的上下文，不把项目经验拆散到看不见来源。
2. 按面试系统重新组织，不照搬原仓库目录。
3. 让主知识库可以吸收高价值内容，同时保留来源和复核状态。

# 和主知识库的关系

Datawhale 专区按项目和学习路径组织，主知识库按面试知识体系组织。两边不是重复关系，而是上下游关系：

```text
Datawhale 原项目
  -> Datawhale 共学专区整理页
    -> AI Agent / 大模型 / RAG 主知识库知识点
      -> 题库、Claim、样例、学习路径
```

# 当前工作原则

1. 不直接复制仓库章节。
2. 不堆相似内容，多个仓库讲同一主题时要融合成一条主线。
3. 项目经验可以优先采用 Datawhale。
4. API 行为、协议细节、框架版本、模型能力边界必须补官方来源或标注待复核。
5. 每个整理页都要说明它能转成哪些面试知识点。

# 主要入口

1. [Datawhale 导入状态](./import-status)
2. [Datawhale 仓库全量清单](./repo-inventory)
3. [Datawhale 来源使用政策](./source-policy)
4. [Datawhale 项目地图](./project-map)
