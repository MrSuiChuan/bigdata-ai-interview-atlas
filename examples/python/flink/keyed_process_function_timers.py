from pyflink.common import Duration, Types
from pyflink.common.time import Time
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import KeyedProcessFunction, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.common.watermark_strategy import WatermarkStrategy, TimestampAssigner


class EventTimestampAssigner(TimestampAssigner):
    def extract_timestamp(self, value, record_timestamp):
        return value[1]


class UserInactivityDetector(KeyedProcessFunction):
    def open(self, runtime_context: RuntimeContext):
        self.last_event_state = runtime_context.get_state(
            ValueStateDescriptor("last-event-ts", Types.LONG())
        )

    def process_element(self, value, ctx: "KeyedProcessFunction.Context"):
        current_ts = value[1]
        last_ts = self.last_event_state.value()
        if last_ts is not None:
            ctx.timer_service().delete_event_time_timer(last_ts + 30_000)

        self.last_event_state.update(current_ts)
        ctx.timer_service().register_event_time_timer(current_ts + 30_000)
        yield ("seen", value[0], current_ts)

    def on_timer(self, timestamp: int, ctx: "KeyedProcessFunction.OnTimerContext"):
        yield ("timeout", ctx.get_current_key(), timestamp)


env = StreamExecutionEnvironment.get_execution_environment()
env.enable_checkpointing(10_000)

watermark_strategy = (
    WatermarkStrategy
    .for_bounded_out_of_orderness(Duration.of_seconds(3))
    .with_timestamp_assigner(EventTimestampAssigner())
)

events = env.from_collection(
    [("u1", 1714000000000), ("u1", 1714000005000), ("u2", 1714000010000)],
    type_info=Types.TUPLE([Types.STRING(), Types.LONG()]),
).assign_timestamps_and_watermarks(watermark_strategy)

events.key_by(lambda row: row[0]).process(
    UserInactivityDetector(),
    output_type=Types.TUPLE([Types.STRING(), Types.STRING(), Types.LONG()]),
).print()

env.execute("keyed-process-function-timers")
