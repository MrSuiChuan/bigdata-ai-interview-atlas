CREATE EXTERNAL TABLE IF NOT EXISTS ods_orders (
  order_id BIGINT,
  user_id BIGINT,
  amount DECIMAL(18,2),
  created_at STRING
)
PARTITIONED BY (dt STRING)
STORED AS ORC
LOCATION 'hdfs:///warehouse/external/ods_orders';

ALTER TABLE ods_orders ADD IF NOT EXISTS PARTITION (dt='2026-04-24')
LOCATION 'hdfs:///warehouse/external/ods_orders/dt=2026-04-24';

MSCK REPAIR TABLE ods_orders;