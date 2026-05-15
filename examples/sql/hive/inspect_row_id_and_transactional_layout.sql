CREATE TABLE IF NOT EXISTS dwd_user_profile_acid (
  user_id BIGINT,
  city STRING,
  level STRING
)
CLUSTERED BY (user_id) INTO 4 BUCKETS
STORED AS ORC
TBLPROPERTIES (
  'transactional'='true'
);

SELECT
  ROW__ID,
  user_id,
  city,
  level
FROM dwd_user_profile_acid;
