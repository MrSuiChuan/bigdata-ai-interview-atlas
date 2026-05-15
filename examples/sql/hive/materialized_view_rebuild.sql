CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_balance
DISABLE REWRITE
AS
SELECT dt, SUM(balance) AS total_balance
FROM dwd_user_balance_snapshot
GROUP BY dt;

ALTER MATERIALIZED VIEW mv_daily_balance ENABLE REWRITE;
ALTER MATERIALIZED VIEW mv_daily_balance REBUILD;