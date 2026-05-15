from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("statistics-cbo-demo").getOrCreate()

spark.sql("CREATE OR REPLACE TEMP VIEW orders AS SELECT id, id % 10 AS shop_id, id * 3 AS amount FROM range(1000)")
plan = spark.sql("SELECT shop_id, count(*) AS cnt, sum(amount) AS gmv FROM orders GROUP BY shop_id")

# cost 模式可以观察估算信息；本地临时视图的统计信息有限，生产中应结合 catalog/table stats。
plan.explain("cost")
print(plan.orderBy("shop_id").collect())

spark.stop()
