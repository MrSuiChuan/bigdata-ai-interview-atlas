CREATE TABLE IF NOT EXISTS dwd_user_balance (
  user_id BIGINT,
  balance DECIMAL(18,2),
  updated_at TIMESTAMP
)
CLUSTERED BY (user_id) INTO 8 BUCKETS
STORED AS ORC
TBLPROPERTIES ('transactional'='true');

MERGE INTO dwd_user_balance AS t
USING (
  SELECT 1001 AS user_id, 20.50 AS delta, current_timestamp() AS updated_at
) AS s
ON t.user_id = s.user_id
WHEN MATCHED THEN
  UPDATE SET balance = t.balance + s.delta, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT VALUES (s.user_id, s.delta, s.updated_at);