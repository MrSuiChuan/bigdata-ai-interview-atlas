from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    enable_idempotence=True,
    acks="all",
    retries=10,
    max_in_flight_requests_per_connection=5,
)

for i in range(100):
    producer.send("payments-events", key=b"acct-42", value=f"payment-{i}".encode())

producer.flush()
producer.close()