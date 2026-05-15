from kafka import KafkaConsumer

consumer = KafkaConsumer(
    "orders-events",
    bootstrap_servers=["localhost:9092"],
    group_id="orders-workers",
    group_instance_id="orders-worker-01",
    enable_auto_commit=False,
    max_poll_interval_ms=300000,
    session_timeout_ms=45000,
)

try:
    for records in consumer:
        for record in records:
            print(record.topic, record.partition, record.offset)
finally:
    consumer.close()