from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("unified-memory-observation-demo").getOrCreate()

base = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id").alias("v"))
cached = base.repartition(4, "k").cache()
print("cached rows", cached.count())

agg = cached.groupBy("k").agg(F.count("*").alias("cnt"), F.sum("v").alias("sum_v"))
agg.explain("formatted")
print(agg.orderBy("k").take(5))

cached.unpersist()
spark.stop()
