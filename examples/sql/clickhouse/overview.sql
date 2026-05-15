-- ClickHouse 整体定位与最小链路 示例
-- 目的：确认表布局、查询裁剪和最小证据链。
SHOW CREATE TABLE analytics.events_local;
EXPLAIN indexes = 1 SELECT event_type, sum(amount) FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;

-- 关键追问：
-- 1. 这张表的 ORDER BY 是否服务于高频过滤条件？
-- 2. 这条查询真正裁掉了多少 partition 和 granule？
-- 3. 当前性能问题是读放大，还是后台维护拖慢了读取？
