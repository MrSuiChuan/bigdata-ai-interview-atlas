from confluent_kafka import Consumer


def build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": "localhost:9092",
            "group.id": "orders-processor",
            "enable.auto.commit": False,
            "auto.offset.reset": "earliest",
        }
    )


def process_message(value: bytes) -> None:
    text = value.decode("utf-8")
    print(f"processed: {text}")


def main() -> None:
    consumer = build_consumer()
    consumer.subscribe(["orders"])

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                raise RuntimeError(msg.error())

            process_message(msg.value())
            consumer.commit(message=msg)
    finally:
        consumer.close()


if __name__ == "__main__":
    main()

