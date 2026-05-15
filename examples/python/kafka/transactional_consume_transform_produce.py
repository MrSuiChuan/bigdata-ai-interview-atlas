from confluent_kafka import Consumer, Producer, TopicPartition


INPUT_TOPIC = "raw-orders"
OUTPUT_TOPIC = "normalized-orders"


def build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": "localhost:9092",
            "group.id": "orders-normalizer",
            "enable.auto.commit": False,
            "auto.offset.reset": "earliest",
            "isolation.level": "read_committed",
        }
    )



def build_producer() -> Producer:
    producer = Producer(
        {
            "bootstrap.servers": "localhost:9092",
            "transactional.id": "orders-normalizer-tx-1",
            "enable.idempotence": True,
        }
    )
    producer.init_transactions()
    return producer



def transform(value: bytes) -> bytes:
    return value.upper()



def main() -> None:
    consumer = build_consumer()
    producer = build_producer()
    consumer.subscribe([INPUT_TOPIC])

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                raise RuntimeError(msg.error())

            producer.begin_transaction()
            producer.produce(OUTPUT_TOPIC, key=msg.key(), value=transform(msg.value()))
            producer.send_offsets_to_transaction(
                [TopicPartition(msg.topic(), msg.partition(), msg.offset() + 1)],
                consumer.consumer_group_metadata(),
            )
            producer.commit_transaction()
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
