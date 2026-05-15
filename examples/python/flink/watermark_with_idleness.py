from datetime import timedelta

from pyflink.common import WatermarkStrategy, Duration, Types
from pyflink.datastream import StreamExecutionEnvironment


env = StreamExecutionEnvironment.get_execution_environment()

strategy = (
    WatermarkStrategy
    .for_bounded_out_of_orderness(Duration.of_seconds(5))
    .with_idleness(Duration.of_seconds(30))
)

stream = env.from_collection(
    collection=[("u1", 1713859200000), ("u1", 1713859202000)],
    type_info=Types.TUPLE([Types.STRING(), Types.LONG()])
)

# 真实生产中更推荐在 source 上直接分配 watermark strategy。
watermarked = stream.assign_timestamps_and_watermarks(
    strategy.with_timestamp_assigner(lambda event, ts: event[1])
)

watermarked.print()
env.execute("watermark-idleness-demo")