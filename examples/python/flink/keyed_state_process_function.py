from pyflink.common import Types
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import KeyedProcessFunction, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor


class UserCounter(KeyedProcessFunction):
    def open(self, runtime_context: RuntimeContext):
        descriptor = ValueStateDescriptor("user_cnt", Types.LONG())
        self.user_cnt = runtime_context.get_state(descriptor)

    def process_element(self, value, ctx: 'KeyedProcessFunction.Context'):
        current = self.user_cnt.value()
        if current is None:
            current = 0
        current += 1
        self.user_cnt.update(current)
        yield value[0], current


env = StreamExecutionEnvironment.get_execution_environment()
stream = env.from_collection(
    collection=[("u1", 1), ("u2", 1), ("u1", 1)],
    type_info=Types.TUPLE([Types.STRING(), Types.INT()])
)

(
    stream.key_by(lambda x: x[0])
    .process(UserCounter(), output_type=Types.TUPLE([Types.STRING(), Types.LONG()]))
    .print()
)

env.execute("keyed-state-demo")