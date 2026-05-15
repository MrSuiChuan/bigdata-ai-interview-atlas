-- ClickHouse 后台维护状态巡检 示例
-- 目的：判断 merge、mutation、TTL 和复制任务是否在抢资源。
SELECT database, table, elapsed, progress, num_parts, result_part_name FROM system.merges ORDER BY elapsed DESC;
SELECT database, table, mutation_id, command, parts_to_do, is_done FROM system.mutations ORDER BY create_time DESC;
SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';

-- 关键追问：
-- 1. 现在最重的后台任务是谁？
-- 2. 前台查询慢是因为读路径，还是后台任务在吞资源？
