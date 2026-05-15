-- Spark SQL / Iceberg 示例：创建 branch、tag，并设置 retention
ALTER TABLE prod.db.orders CREATE BRANCH audit_branch;
ALTER TABLE prod.db.orders CREATE TAG month_end_2026_03;

ALTER TABLE prod.db.orders REPLACE BRANCH audit_branch AS OF VERSION 1234567890123 RETAIN 14 DAYS WITH SNAPSHOT RETENTION 5 SNAPSHOTS 7 DAYS;
ALTER TABLE prod.db.orders REPLACE TAG month_end_2026_03 AS OF VERSION 1234567890123 RETAIN 180 DAYS;

SELECT * FROM prod.db.orders.refs;
