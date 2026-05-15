-- Spark SQL / Iceberg 示例：升级表格式到 v3
ALTER TABLE prod.db.orders SET TBLPROPERTIES (
  'format-version' = '3'
);

SELECT *
FROM prod.db.orders.snapshots;