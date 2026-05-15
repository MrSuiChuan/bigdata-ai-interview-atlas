from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("checkpoint-demo").getOrCreate()
sc = spark.sparkContext
sc.setCheckpointDir("hdfs:///tmp/spark-checkpoints")

base = spark.read.parquet("s3://warehouse/orders")
current = base.filter(F.col("dt") >= "2026-04-01")

for _ in range(5):
    current = current.groupBy("user_id").agg(F.count("*").alias("cnt"))

# checkpoint 的重点不是缓存，而是截断过长的逻辑计划。
checkpointed = current.checkpoint(eager=True)
checkpointed.explain("extended")

spark.stop()
