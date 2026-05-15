from pyflink.table import EnvironmentSettings, StreamTableEnvironment


settings = EnvironmentSettings.in_streaming_mode()
t_env = StreamTableEnvironment.create(environment_settings=settings)

t_env.execute_sql("""
CREATE TEMPORARY TABLE clicks (
  user_id STRING,
  url STRING,
  ts TIMESTAMP(3),
  WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
) WITH (
  'connector' = 'datagen'
)
""")

result = t_env.sql_query("""
SELECT user_id, COUNT(*) AS cnt
FROM clicks
GROUP BY user_id
""")

# 这类聚合结果通常不是 append-only，
# 下游需要理解 changelog 语义，例如 retract / upsert。
result.execute().print()
