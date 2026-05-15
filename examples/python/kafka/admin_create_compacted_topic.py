from confluent_kafka.admin import AdminClient, NewTopic


TOPIC_NAME = "user-profile-changelog"


def main() -> None:
    admin = AdminClient({"bootstrap.servers": "localhost:9092"})

    new_topic = NewTopic(
        TOPIC_NAME,
        num_partitions=6,
        replication_factor=3,
        config={
            "cleanup.policy": "compact",
            "min.insync.replicas": "2",
        },
    )

    futures = admin.create_topics([new_topic])

    for topic, future in futures.items():
        try:
            future.result()
            print(f"created topic: {topic}")
        except Exception as exc:  # pragma: no cover - demo script
            print(f"failed to create {topic}: {exc}")


if __name__ == "__main__":
    main()
