-- Trino 安全治理 面试推演 SQL
-- 重点：用 EXPLAIN / EXPLAIN ANALYZE 观察扫描、过滤、join、exchange 和 connector 下推。

EXPLAIN
SELECT
  customer_id,
  count(*) AS order_count
FROM lake.sales.orders
WHERE order_date >= DATE '2026-01-01'
GROUP BY customer_id;

-- 排查时关注：TableScan 的列裁剪和谓词下推、stage 数量、exchange、join 分布和扫描数据量。
