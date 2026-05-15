from pyflink.common import Duration, Types
from pyflink.datastream import StreamExecutionEnvironment, OutputTag
from pyflink.datastream.functions import AggregateFunction, ProcessWindowFunction
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.common.watermark_strategy import WatermarkStrategy, TimestampAssigner


class EventTimestampAssigner(TimestampAssigner):
    def extract_timestamp(self, value, record_timestamp):
        return value[2]


class SumAggregate(AggregateFunction):
    def create_accumulator(self):
        return 0

    def add(self, value, accumulator):
        return accumulator + value[1]

    def get_result(self, accumulator):
        return accumulator

    def merge(self, a, b):
        return a + b


class EmitWindowResult(ProcessWindowFunction):
    def process(self, key, context, aggregates):
        total = next(iter(aggregates))
        yield (key, context.window().start, context.window().end, total)


env = StreamExecutionEnvironment.get_execution_environment()
env.enable_checkpointing(10_000)

late_output = OutputTag("late-orders", Types.TUPLE([Types.STRING(), Types.INT(), Types.LONG()]))

watermark_strategy = (
    WatermarkStrategy
    .for_bounded_out_of_orderness(Duration.of_seconds(5))
    .with_timestamp_assigner(EventTimestampAssigner())
)

stream = env.from_collection(
    [
        ("u1", 10, 1714000000000),
        ("u1", 30, 1714000004000),
        ("u1", 20, 1714000012000),
    ],
    type_info=Types.TUPLE([Types.STRING(), Types.INT(), Types.LONG()]),
).assign_timestamps_and_watermarks(watermark_strategy)

windowed = (
    stream
    .key_by(lambda row: row[0])
    .window(TumblingEventTimeWindows.of(Duration.of_seconds(10)))
    .allowed_lateness(Duration.of_seconds(30))
    .side_output_late_data(late_output)
    .aggregate(SumAggregate(), EmitWindowResult(), Types.TUPLE([Types.STRING(), Types.LONG(), Types.LONG(), Types.INT()]))
)

windowed.print("main-result")
windowed.get_side_output(late_output).print("too-late")

env.execute("event-time-late-data-window")
