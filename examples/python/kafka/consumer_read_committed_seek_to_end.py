from kafka import KafkaConsumer, TopicPartition

consumer = KafkaConsumer(
    bootstrap_servers=["localhost:9092"],
    isolation_level="read_committed",
    enable_auto_commit=False,
)

tp = TopicPartition("txn-orders", 0)
consumer.assign([tp])
consumer.seek_to_end(tp)
print("read_committed end offset:", consumer.position(tp))

consumer.close()