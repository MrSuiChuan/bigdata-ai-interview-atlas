-- Hudi 架构与角色分工 面试推演 SQL
-- 重点：把 upsert、record key、precombine、partition path 和 timeline 提交边界讲清楚。

CREATE TABLE IF NOT EXISTS demo_hudi_orders (
  order_id STRING,
  user_id STRING,
  amount DOUBLE,
  updated_at TIMESTAMP
) USING hudi
OPTIONS (
  type = 'cow',
  primaryKey = 'order_id',
  preCombineField = 'updated_at'
)
PARTITIONED BY (user_id);

-- 面试说明：真实生产还要结合索引、compaction、cleaning、clustering 和并发写入策略。
