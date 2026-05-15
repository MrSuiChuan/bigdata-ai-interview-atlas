-- ClickHouse 三层元数据交叉核验 示例
-- 目的：同时检查逻辑定义、物理 part 状态和复制元数据。
SHOW CREATE TABLE analytics.events_local;
SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';
SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';

-- 关键追问：
-- 1. 问题出在逻辑定义、物理 part 还是复制元数据？
-- 2. 哪个层次的状态最先失真？
