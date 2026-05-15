-- ClickHouse 可观测性入口清单 示例
-- 目的：把 query_log、processes、parts、replicas 和指标表串成现场证据链。
SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;
SELECT user, query_id, elapsed, memory_usage FROM system.processes ORDER BY elapsed DESC LIMIT 10;
SELECT metric, value FROM system.metrics ORDER BY metric LIMIT 20;

-- 关键追问：
-- 1. 现在需要看的是历史查询、在线请求，还是节点资源？
-- 2. 现象证据是否已经足够支撑下一步判断？
