FROM raw_logs
SELECT TRANSFORM(user_id, event_json)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
USING 'python3 normalize_event.py'
AS (user_id BIGINT, event_name STRING, event_ts STRING)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t';

FROM (
  FROM raw_logs
  SELECT TRANSFORM(user_id, event_json)
  USING 'python3 emit_key_value.py'
  CLUSTER BY key
) t
SELECT key, value;
