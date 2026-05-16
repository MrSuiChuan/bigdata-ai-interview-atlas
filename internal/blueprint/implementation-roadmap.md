# 实施路线图

## 项目定位

这个项目应该先被当成一个知识工程系统，再被当成一个 AI 应用。

推荐的建设顺序是：

1. 内容模型
2. 仓库骨架
3. 种子内容
4. 校验流水线
5. 文档站
6. 练题应用
7. AI 解释与模拟面试

## 第一阶段：内容模型

目标：

1. 定义大数据与 AI Agent 的分类体系
2. 定义 Markdown frontmatter 结构
3. 定义题目结构
4. 定义 claim 结构
5. 定义来源准入规则

交付物：

1. `internal/blueprint/content-spec.md`
2. `templates/`
3. 初版校验脚本

## 第二阶段：种子知识库

目标：

1. 选出 10 到 20 个高价值主题
2. 每个主题至少有一篇总览文档
3. 每个大组件补 3 到 6 篇子主题文档
4. 给主题补充面试题、常见误答和评分依据
5. 补最小可用的代码样例

首批优先主题：

1. Kafka
2. Spark
3. Flink
4. Hive
5. Iceberg
6. OpenAI Agents SDK
7. LangGraph
8. CrewAI
9. Microsoft Agent Framework
10. MCP

## 第三阶段：校验与治理

目标：

1. 检查 frontmatter 是否完整
2. 检查 `source_ids` 和 `claim_ids` 是否存在
3. 检查 `examples/` 引用是否有效
4. 检查本地 Markdown 链接是否失效
5. 为变化快的主题建立复核流程

治理规则：

1. 没有来源的 reviewed 文档不能发布
2. 没有 claim 的 reviewed 题目不能发布
3. 文档里引用了代码样例，就必须真的有那个文件
4. AI Agent 相关文档必须带 `last_verified_at`

## 第四阶段：文档体验

建议技术栈：

1. 文档站：Docusaurus
2. 搜索：MVP 可先用本地搜索，后续升级 Meilisearch
3. 内容源：Git 管理的 Markdown

文档站能力：

1. 分类导航
2. 标签浏览
3. 来源追溯
4. 版本范围展示
5. 从文档跳转到相关题目
6. 相关推荐主题

## 第五阶段：练题应用

建议技术栈：

1. Web 应用：Next.js
2. 后端：NestJS 或 FastAPI
3. 数据库：PostgreSQL
4. 缓存：Redis

核心能力：

1. 分类练习
2. 随机练习
3. 收藏
4. 错题本
5. 学习进度
6. 基于 rubric 的评分

## 第六阶段：AI 能力

AI 应该是增强器，不应该替代批准过的知识库。

建议的 AI 功能：

1. 把标准答案讲得更容易理解
2. 基于固定 claim 生成追问
3. 按明确 rubric 评分
4. 做模拟面试
5. 生成个性化学习计划

AI 不应该做的事：

1. 未经人工审核直接发布 reviewed 内容
2. 没有来源地编造官方行为
3. 替代固定评分标准

## 运行方式

相对稳定的组件可以按季度复核。变化快的 AI Agent 主题建议按月复核，或者在官方文档变更后立即复核。

