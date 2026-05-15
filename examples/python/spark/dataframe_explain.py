from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("dataframe-explain-demo").getOrCreate()

users = spark.read.json("s3://warehouse/users")
result = (
    users.filter(F.col("country") == "CN")
    .select("user_id", "level", "country")
    .groupBy("level")
    .agg(F.count("*").alias("user_cnt"))
    .orderBy(F.col("user_cnt").desc())
)

# explain() 适合在面试或排障时观察 Spark 生成的计划。
result.explain("extended")

spark.stop()
