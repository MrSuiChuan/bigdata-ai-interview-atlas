from confluent_kafka import Producer


def build_producer() -> Producer:
    return Producer({"bootstrap.servers": "localhost:9092"})


def delivery_report(err, msg) -> None:
    if err is not None:
        print(f"delivery failed: {err}")
        return

    print(
        f"delivered topic={msg.topic()} partition={msg.partition()} "
        f"offset={msg.offset()} key={msg.key().decode('utf-8')}"
    )


def main() -> None:
    producer = build_producer()

    events = [
        ("user-42", '{"event":"login"}'),
        ("user-42", '{"event":"purchase"}'),
        ("user-99", '{"event":"login"}'),
    ]

    for key, payload in events:
        producer.produce(
            topic="user-events",
            key=key.encode("utf-8"),
            value=payload.encode("utf-8"),
            on_delivery=delivery_report,
        )

    producer.flush()


if __name__ == "__main__":
    main()
