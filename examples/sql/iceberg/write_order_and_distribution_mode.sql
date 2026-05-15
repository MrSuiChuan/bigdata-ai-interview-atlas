-- Spark SQL / Iceberg 示例：写排序与分布模式
ALTER TABLE prod.db.orders WRITE ORDERED BY (dt, order_id);

ALTER TABLE prod.db.orders SET TBLPROPERTIES (
  'write.distribution-mode' = 'range',
  'write.target-file-size-bytes' = '536870912'
);

INSERT INTO prod.db.orders
SELECT *
FROM staging.db.orders_sorted_source;
