-- Spark SQL / Iceberg 示例：创建带 hidden partitioning 的表
CREATE TABLE prod.db.orders (
  order_id BIGINT,
  user_id BIGINT,
  order_ts TIMESTAMP,
  amount DECIMAL(18,2),
  status STRING
)
USING iceberg
PARTITIONED BY (days(order_ts), bucket(16, user_id));

-- 查询仍然按业务列过滤，而不是手工维护物理分区列
SELECT order_id, user_id, amount
FROM prod.db.orders
WHERE order_ts >= TIMESTAMP '2026-04-01 00:00:00'
  AND order_ts < TIMESTAMP '2026-04-02 00:00:00';