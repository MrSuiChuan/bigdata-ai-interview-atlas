-- ClickHouse 数据生命周期追踪 示例
-- 目的：观察一批数据从新 part 到 merge、mutation、TTL 的演进。
SELECT partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC;
SELECT event_type, part_name, rows, size_in_bytes FROM system.part_log WHERE database = 'analytics' AND table = 'events_local' ORDER BY event_time DESC LIMIT 20;
SELECT mutation_id, command, parts_to_do, is_done FROM system.mutations WHERE database = 'analytics' AND table = 'events_local';

-- 关键追问：
-- 1. 数据现在停在生命周期的哪一步？
-- 2. 是 merge、mutation 还是 TTL 在拖慢演进？
