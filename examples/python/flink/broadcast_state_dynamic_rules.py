from pyflink.common import Types
from pyflink.datastream import StreamExecutionEnvironment, MapStateDescriptor
from pyflink.datastream.functions import KeyedBroadcastProcessFunction


class MatchRule(KeyedBroadcastProcessFunction):
    def process_broadcast_element(self, value, ctx):
        rule_state = ctx.get_broadcast_state(self.rule_state_descriptor)
        rule_state.put(value[0], value[1])

    def process_element(self, value, ctx):
        rule_state = ctx.get_broadcast_state(self.rule_state_descriptor)
        active_rule = rule_state.get("active-rule")
        yield (value[0], value[1], active_rule)


env = StreamExecutionEnvironment.get_execution_environment()

items = env.from_collection(
    [("blue", "rectangle"), ("blue", "triangle")],
    type_info=Types.TUPLE([Types.STRING(), Types.STRING()])
)

rules = env.from_collection(
    [("active-rule", "rectangle->triangle")],
    type_info=Types.TUPLE([Types.STRING(), Types.STRING()])
)

rule_state_descriptor = MapStateDescriptor(
    "RuleBroadcastState",
    Types.STRING(),
    Types.STRING()
)

processor = MatchRule()
processor.rule_state_descriptor = rule_state_descriptor

items.key_by(lambda item: item[0]) \
    .connect(rules.broadcast(rule_state_descriptor)) \
    .process(processor, output_type=Types.TUPLE([Types.STRING(), Types.STRING(), Types.STRING()])) \
    .print()

env.execute("broadcast-state-dynamic-rules")
