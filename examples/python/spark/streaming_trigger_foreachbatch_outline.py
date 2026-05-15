from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("foreach-batch-demo").getOrCreate()

seen_batches = []

def write_batch(batch_df, batch_id):
    # 生产中可用 batch_id 做幂等去重；这里仅打印每个 batch 的聚合结果。
    seen_batches.append(batch_id)
    batch_df.groupBy("bucket").count().orderBy("bucket").show(truncate=False)

stream = (
    spark.readStream.format("rate")
    .option("rowsPerSecond", 5)
    .load()
    .select((F.col("value") % 3).alias("bucket"))
)

query = (
    stream.writeStream.foreachBatch(write_batch)
    .option("checkpointLocation", "/tmp/spark-foreach-batch-demo-checkpoint")
    .trigger(processingTime="5 seconds")
    .start()
)

query.awaitTermination(15)
query.stop()
spark.stop()
