LOAD DATA LOCAL INPATH '/data/staging/orders_2026_04_25.tsv'
INTO TABLE ods_orders_text;

INSERT OVERWRITE TABLE dwd_orders PARTITION (dt, hr)
SELECT
  order_id,
  user_id,
  amount,
  dt,
  hr
FROM ods_orders_stage;
