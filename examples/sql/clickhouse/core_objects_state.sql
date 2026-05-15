-- ClickHouse 核心对象状态巡检 示例
-- 目的：围绕 part、partition、replica 和 Distributed 表检查真实状态。
SELECT database, table, partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY partition, name;
SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';

-- 关键追问：
-- 1. 当前最该看的对象是表、part、replica 还是 Distributed 路由？
-- 2. 哪个对象真正持有问题现场的状态？
