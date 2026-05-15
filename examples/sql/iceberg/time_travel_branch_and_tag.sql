-- Spark SQL / Iceberg 示例：创建 branch、写入 branch、time travel、发布
ALTER TABLE prod.db.orders CREATE BRANCH audit;
ALTER TABLE prod.db.orders CREATE TAG month_end_2026_04;

-- 写到 audit branch；branch 必须事先存在
INSERT INTO prod.db.orders.branch_audit
SELECT *
FROM staging.db.orders_checked;

-- 使用 snapshot id 做 time travel
SELECT *
FROM prod.db.orders VERSION AS OF 918273645;

-- 把 main 快进到 audit 分支头部
CALL prod.system.fast_forward('db.orders', 'main', 'audit');