-- ClickHouse 通用排障起手式 示例
-- 目的：先缩小故障面，再决定看 query、parts、后台任务还是复制。
SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;
SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;
SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics';

-- 关键追问：
-- 1. 这是查询问题、part 问题、后台任务问题，还是复制问题？
-- 2. 下一步应该去 EXPLAIN、replication_queue 还是 system.processes？
