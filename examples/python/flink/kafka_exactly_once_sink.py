from pyflink.common import Types
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import KafkaSource, KafkaSink, KafkaOffsetsInitializer
from pyflink.datastream.connectors.base import DeliveryGuarantee
from pyflink.datastream.formats.json import JsonRowDeserializationSchema
from pyflink.common.serialization import SimpleStringSchema
from pyflink.datastream.connectors.kafka import KafkaRecordSerializationSchema
from pyflink.common.watermark_strategy import WatermarkStrategy


env = StreamExecutionEnvironment.get_execution_environment()
env.enable_checkpointing(15_000)

source = (
    KafkaSource.builder()
    .set_bootstrap_servers("localhost:9092")
    .set_topics("input-orders")
    .set_group_id("flink-orders-job")
    .set_starting_offsets(KafkaOffsetsInitializer.earliest())
    .set_value_only_deserializer(SimpleStringSchema())
    .build()
)

sink = (
    KafkaSink.builder()
    .set_bootstrap_servers("localhost:9092")
    .set_record_serializer(
        KafkaRecordSerializationSchema.builder()
        .set_topic("output-orders")
        .set_value_serialization_schema(SimpleStringSchema())
        .build()
    )
    .set_delivery_guarantee(DeliveryGuarantee.EXACTLY_ONCE)
    .set_transactional_id_prefix("flink-orders-job-v1")
    .build()
)

stream = env.from_source(source, WatermarkStrategy.no_watermarks(), "kafka-source")
stream.map(lambda value: value.upper(), output_type=Types.STRING()).sink_to(sink)

env.execute("kafka-exactly-once-sink")
