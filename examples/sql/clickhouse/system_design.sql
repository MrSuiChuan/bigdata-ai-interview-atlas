-- ClickHouse 架构骨架检查 示例
-- 目的：确认本地表、Distributed 表、TTL 和副本在设计里各自承担什么职责。
SHOW CREATE TABLE analytics.events_local;
SHOW CREATE TABLE analytics.events_all;
SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';

-- 关键追问：
-- 1. 本地表模型是否先于集群拓扑被设计清楚？
-- 2. 副本是为了高可用，还是被误当成主要扩容手段？
