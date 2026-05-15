-- Spark SQL / Iceberg 示例：UPDATE、DELETE、MERGE INTO
UPDATE prod.db.customer_profile
SET vip_level = 'gold'
WHERE total_amount >= 10000;

DELETE FROM prod.db.customer_profile
WHERE ds = DATE '2026-04-01';

MERGE INTO prod.db.customer_profile AS t
USING staging.db.customer_profile_delta AS s
ON t.user_id = s.user_id
WHEN MATCHED AND s.op = 'DELETE' THEN DELETE
WHEN MATCHED THEN UPDATE SET
  t.user_name = s.user_name,
  t.total_amount = s.total_amount,
  t.vip_level = s.vip_level,
  t.updated_at = s.updated_at
WHEN NOT MATCHED THEN INSERT (
  user_id,
  user_name,
  total_amount,
  vip_level,
  updated_at
) VALUES (
  s.user_id,
  s.user_name,
  s.total_amount,
  s.vip_level,
  s.updated_at
);