from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("structured-streaming-watermark-demo").getOrCreate()

# 使用 rate source 生成演示数据。它适合学习和压测，不适合作为生产输入源。
events = (
    spark.readStream.format("rate")
    .option("rowsPerSecond", 20)
    .load()
    .select(
        F.col("timestamp").alias("event_time"),
        (F.col("value") % 5).cast("string").alias("user_id"),
    )
)

windowed = (
    events.withWatermark("event_time", "10 minutes")
    .groupBy(F.window("event_time", "5 minutes"), F.col("user_id"))
    .count()
)

query = (
    windowed.writeStream.format("console")
    .outputMode("append")
    # 生产环境应落到 HDFS-compatible 的容错存储，这里仅演示 API 形态。
    .option("checkpointLocation", "hdfs:///spark/checkpoints/structured-streaming-watermark-demo")
    .option("truncate", False)
    .start()
)

query.awaitTermination()
