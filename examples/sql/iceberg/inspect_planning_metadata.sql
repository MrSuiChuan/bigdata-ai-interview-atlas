-- Spark SQL / Iceberg 示例：查看规划相关元数据表
SELECT *
FROM prod.db.orders.snapshots;

SELECT *
FROM prod.db.orders.manifests;

SELECT *
FROM prod.db.orders.files;