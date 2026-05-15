from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("join-strategy-selection-demo").getOrCreate()

fact = spark.range(0, 10000).select((F.col("id") % 100).alias("user_id"), F.col("id").alias("order_id"))
dim = spark.range(0, 100).select(F.col("id").alias("user_id"), F.concat(F.lit("user_"), F.col("id")).alias("name"))

joined = fact.join(F.broadcast(dim), "user_id").groupBy("name").count()
joined.explain("formatted")
print(joined.orderBy("name").take(5))

spark.stop()
