SET hive.execution.engine=tez;

EXPLAIN
SELECT s.store_id, SUM(s.amount) AS total_amt
FROM (
  SELECT store_id, order_id, amount
  FROM dwd_sales
  WHERE dt BETWEEN '2026-04-01' AND '2026-04-25'
) s
JOIN dim_store d
  ON s.store_id = d.store_id
GROUP BY s.store_id
ORDER BY total_amt DESC;
