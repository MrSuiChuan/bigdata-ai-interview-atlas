-- Spark SQL / Iceberg 示例：直接写 branch，与 WAP branch 二选一
INSERT INTO prod.db.orders.branch_audit_branch
SELECT *
FROM staging.db.orders_increment;

SET spark.wap.branch = audit_branch;

INSERT INTO prod.db.orders
SELECT *
FROM staging.db.orders_increment_checked;

CALL prod.system.fast_forward('db.orders', 'main', 'audit_branch');
