from pyflink.common import Duration, WatermarkStrategy
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import KafkaOffsetsInitializer, KafkaSource


env = StreamExecutionEnvironment.get_execution_environment()

source = (
    KafkaSource.builder()
    .set_bootstrap_servers("kafka-broker:9092")
    .set_topics("orders")
    .set_group_id("flink-watermark-alignment-demo")
    .set_starting_offsets(KafkaOffsetsInitializer.earliest())
    .set_value_only_deserializer(lambda value: value)
    .build()
)

strategy = (
    WatermarkStrategy
    .for_bounded_out_of_orderness(Duration.of_seconds(5))
    .with_idleness(Duration.of_seconds(30))
    .with_watermark_alignment(
        "orders-source-group",
        Duration.of_seconds(20),
        Duration.of_seconds(1),
    )
)

# Watermark alignment 只适用于支持相关能力的 source。
(
    env.from_source(source, strategy, "orders-source")
    .print()
)

env.execute("kafka-watermark-alignment-demo")
