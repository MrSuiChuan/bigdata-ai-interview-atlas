SET hive.execution.mode=llap;
SET hive.llap.io.enabled=true;
SET hive.llap.auto.enforce.vectorized=true;
SET hive.llap.auto.enforce.stats=true;

EXPLAIN VECTORIZATION
SELECT
  user_id,
  sum(amount) AS total_amount
FROM dwd_payments_orc
WHERE province = 'zj'
GROUP BY user_id;
