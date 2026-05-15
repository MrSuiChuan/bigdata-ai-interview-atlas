from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("broadcast-accumulator-demo").getOrCreate()
sc = spark.sparkContext

rules = sc.broadcast({"A": 10, "B": 20})
matched = sc.accumulator(0)

codes = sc.parallelize(["A", "B", "A", "C"], 2)


def enrich(code: str):
    if code in rules.value:
        matched.add(1)
        return code, rules.value[code]
    return code, None

for row in codes.map(enrich).collect():
    print(row)

# accumulator 的最终值只能在 driver 侧读取。
print("matched=", matched.value)

spark.stop()
