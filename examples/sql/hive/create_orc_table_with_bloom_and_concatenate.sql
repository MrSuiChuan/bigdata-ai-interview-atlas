CREATE TABLE IF NOT EXISTS dwd_payments_orc (
  order_id BIGINT,
  user_id BIGINT,
  province STRING,
  amount DECIMAL(18,2),
  pay_time TIMESTAMP
)
STORED AS ORC
TBLPROPERTIES (
  'orc.compress'='SNAPPY',
  'orc.row.index.stride'='10000',
  'orc.bloom.filter.columns'='province,user_id'
);

ALTER TABLE dwd_payments_orc CONCATENATE;
