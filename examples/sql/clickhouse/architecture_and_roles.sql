-- ClickHouse 本地表、Distributed 表与副本分层 示例
-- 目的：确认访问层、本地数据面和复制层的职责边界。
SHOW CREATE TABLE analytics.events_local;
SHOW CREATE TABLE analytics.events_all;
SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';

-- 关键追问：
-- 1. 入口表是本地 MergeTree 还是 Distributed？
-- 2. 当前问题发生在本地表、路由层还是复制层？
