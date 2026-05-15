from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    compression_type="lz4",
    linger_ms=5,
    batch_size=64 * 1024,
    acks="all",
)

for i in range(1000):
    producer.send("orders-events", key=f"user-{i % 32}".encode(), value=f"event-{i}".encode())

producer.flush()
producer.close()