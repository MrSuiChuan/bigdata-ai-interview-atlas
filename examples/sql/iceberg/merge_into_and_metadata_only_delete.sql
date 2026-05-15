-- Spark SQL / Iceberg 示例：MERGE INTO 与 metadata-only delete
MERGE INTO prod.db.orders t
USING staging.db.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED AND s.op = 'delete' THEN DELETE
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

DELETE FROM prod.db.orders
WHERE dt = DATE '2026-03-31';
