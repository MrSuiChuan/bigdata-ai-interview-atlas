-- ClickHouse 安全边界定义 示例
-- 目的：用角色、row policy 和 quota 组合出最小权限模型。
CREATE ROLE analytics_reader;
GRANT SELECT ON analytics.events_local TO analytics_reader;
CREATE ROW POLICY only_cn_events ON analytics.events_local FOR SELECT USING region = 'cn' TO analytics_reader;
CREATE QUOTA analytics_reader_quota FOR INTERVAL 1 hour MAX queries = 20000 TO analytics_reader;

-- 关键追问：
-- 1. 权限是直接发给用户，还是通过角色复用？
-- 2. 数据可见范围和资源边界是否都已经被定义？
