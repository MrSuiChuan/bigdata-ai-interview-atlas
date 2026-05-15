-- ClickHouse 故障恢复最小证据链 示例
-- 目的：先确认 part、replica 和队列状态，再决定是否进入更重的恢复动作。
SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';
SELECT table, is_readonly, queue_size, absolute_delay, lost_part_count FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';
SELECT database, table, type, create_time, num_tries, last_exception FROM system.replication_queue WHERE database = 'analytics' AND table = 'events_local' ORDER BY create_time;

-- 关键追问：
-- 1. 故障发生在 part、本地副本、复制队列，还是需要进入备份恢复？
-- 2. 系统当前还有没有副本自愈条件？
