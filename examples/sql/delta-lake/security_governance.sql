-- Delta Lake 安全治理 面试推演 SQL
-- 重点：数据文件不是表状态边界，_delta_log 中的事务提交才决定版本可见性。

CREATE TABLE IF NOT EXISTS demo_delta_orders (
  order_id STRING,
  user_id STRING,
  amount DOUBLE,
  updated_at TIMESTAMP
) USING delta
PARTITIONED BY (user_id);

DESCRIBE HISTORY demo_delta_orders;

-- 面试说明：继续追问时要讲 schema enforcement/evolution、time travel、checkpoint、VACUUM 和并发冲突。
