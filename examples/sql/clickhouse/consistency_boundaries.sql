-- ClickHouse 一致性边界核查 示例
-- 目的：区分本地提交、复制追平和 Distributed 转发的完成定义。
SELECT name, active, rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC LIMIT 10;
SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';

-- 关键追问：
-- 1. 这里的成功是指本地可见、所有副本追平，还是远端 shard 已可见？
-- 2. 调用方有没有重试和幂等策略？
