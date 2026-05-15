from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    linger_ms=5,
    batch_size=32 * 1024,
)

# No key: modern producers can still batch efficiently through sticky partitioning.
for i in range(500):
    producer.send("anonymous-clicks", value=f"click-{i}".encode())

producer.flush()
producer.close()