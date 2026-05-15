from confluent_kafka import Consumer, TopicPartition


TOPIC = "orders"
PARTITION = 0
REPLAY_OFFSET = 120


def build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": "localhost:9092",
            "group.id": "orders-replay",
            "enable.auto.commit": False,
            "auto.offset.reset": "earliest",
        }
    )


def main() -> None:
    consumer = build_consumer()

    try:
        consumer.assign([TopicPartition(TOPIC, PARTITION, REPLAY_OFFSET)])

        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                raise RuntimeError(msg.error())

            print(
                f"replay topic={msg.topic()} partition={msg.partition()} "
                f"offset={msg.offset()} value={msg.value().decode('utf-8')}"
            )
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
