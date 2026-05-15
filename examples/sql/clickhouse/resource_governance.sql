-- ClickHouse 资源治理最小动作 示例
-- 目的：先看当前重负载，再定义 quota 和工作负载边界。
SELECT user, query_id, elapsed, memory_usage, query FROM system.processes ORDER BY memory_usage DESC LIMIT 20;
CREATE QUOTA analytics_quota FOR INTERVAL 1 hour MAX queries = 50000, execution_time = 36000 TO analytics_role;

-- 关键追问：
-- 1. 最重的是前台查询，还是后台维护任务？
-- 2. 限制对象应该是单次执行、长期配额，还是工作负载调度层？
