from pyflink.common import Duration, Types
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import ProcessJoinFunction
from pyflink.common.watermark_strategy import WatermarkStrategy, TimestampAssigner


class EventTimestampAssigner(TimestampAssigner):
    def extract_timestamp(self, value, record_timestamp):
        return value[1]


class JoinOutput(ProcessJoinFunction):
    def process_element(self, left, right, ctx):
        yield (left[0], left[1], right[1])


env = StreamExecutionEnvironment.get_execution_environment()
watermarks = (
    WatermarkStrategy
    .for_bounded_out_of_orderness(Duration.of_seconds(2))
    .with_timestamp_assigner(EventTimestampAssigner())
)

left = env.from_collection(
    [("u1", 1714000000000), ("u1", 1714000004000)],
    type_info=Types.TUPLE([Types.STRING(), Types.LONG()])
).assign_timestamps_and_watermarks(watermarks)

right = env.from_collection(
    [("u1", 1714000001000), ("u1", 1714000006000)],
    type_info=Types.TUPLE([Types.STRING(), Types.LONG()])
).assign_timestamps_and_watermarks(watermarks)

left.key_by(lambda x: x[0]).interval_join(right.key_by(lambda x: x[0])) \
    .between(Duration.of_seconds(-2), Duration.of_seconds(3)) \
    .process(JoinOutput(), output_type=Types.TUPLE([Types.STRING(), Types.LONG(), Types.LONG()])) \
    .print()

env.execute("interval-join-process-function")
