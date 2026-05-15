SET hive.optimize.ppd=true;
SET hive.optimize.ppd.storage=true;
SET hive.ppd.recognizetransivity=true;

EXPLAIN
SELECT
  a.user_id,
  b.province
FROM fact_orders a
LEFT OUTER JOIN dim_user b
  ON a.user_id = b.user_id
WHERE b.ds = '2026-04-25';

EXPLAIN
SELECT
  a.user_id,
  b.province
FROM fact_orders a
LEFT OUTER JOIN dim_user b
  ON a.user_id = b.user_id
 AND b.ds = '2026-04-25';
