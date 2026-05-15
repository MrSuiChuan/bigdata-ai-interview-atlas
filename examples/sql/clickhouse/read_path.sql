-- ClickHouse 读取路径验证 示例
-- 目的：把 EXPLAIN 与 query_log 对齐，确认查询到底裁掉了多少。
EXPLAIN indexes = 1 SELECT event_type, count() FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;
SELECT query_duration_ms, read_rows, read_bytes, result_rows, memory_usage FROM system.query_log WHERE query LIKE '%event_type = \'pay\'%' AND type = 'QueryFinish' ORDER BY event_time DESC LIMIT 5;

-- 关键追问：
-- 1. partition、granule 和列读取分别裁掉了多少？
-- 2. 协调节点是否在分布式查询里承受了额外压力？
