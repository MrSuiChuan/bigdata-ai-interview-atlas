-- ClickHouse 端到端巡检串讲 示例
-- 目的：把布局、写入、读取、后台维护和复制健康放到同一条检查链路中。
SHOW CREATE TABLE analytics.events_local;
SELECT partition, count() AS active_parts, sum(rows) AS rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;
SELECT query_duration_ms, read_rows, read_bytes, memory_usage FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;
SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';

-- 关键追问：
-- 1. 布局是否匹配主查询？
-- 2. part 是否在健康区间？
-- 3. 后台 merge 和复制是否跟得上业务写入？
