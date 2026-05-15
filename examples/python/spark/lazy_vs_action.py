from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("lazy-vs-action-demo").getOrCreate()

orders = spark.read.parquet("s3://warehouse/orders")
summary = (
    orders.filter(F.col("dt") == "2026-04-23")
    .groupBy("user_id")
    .agg(F.count("*").alias("order_cnt"))
)

# 到这里还主要是在构造 logical plan，不会真正把结果全部算出来。
summary.explain("extended")

# action 才会触发真正执行。
rows = summary.take(10)
for row in rows:
    print(row)

spark.stop()
