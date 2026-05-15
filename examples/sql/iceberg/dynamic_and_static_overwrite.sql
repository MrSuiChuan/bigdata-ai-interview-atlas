-- Spark SQL / Iceberg 示例：dynamic overwrite 与 static overwrite
SET spark.sql.sources.partitionOverwriteMode = dynamic;

INSERT OVERWRITE prod.db.orders
SELECT *
FROM staging.db.orders_daily_fix;

INSERT OVERWRITE prod.db.orders PARTITION (dt = DATE '2026-03-31')
SELECT *
FROM staging.db.orders_20260331;
