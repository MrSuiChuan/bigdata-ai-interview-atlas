ANALYZE TABLE dwd_user_balance COMPUTE STATISTICS FOR COLUMNS;

DESCRIBE FORMATTED dwd_user_balance user_id;

EXPLAIN CBO
SELECT user_id, SUM(balance)
FROM dwd_user_balance
GROUP BY user_id;