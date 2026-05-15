from pyflink.common.time import Time
from pyflink.common.typeinfo import Types
from pyflink.datastream.functions import RuntimeContext, RichFlatMapFunction
from pyflink.datastream.state import ValueStateDescriptor, StateTtlConfig


class RememberRecentUser(RichFlatMapFunction):
    def open(self, runtime_context: RuntimeContext):
        ttl_config = (
            StateTtlConfig
            .new_builder(Time.hours(1))
            .set_update_type(StateTtlConfig.UpdateType.OnCreateAndWrite)
            .set_state_visibility(StateTtlConfig.StateVisibility.NeverReturnExpired)
            .build()
        )

        state_descriptor = ValueStateDescriptor("last-city", Types.STRING())
        state_descriptor.enable_time_to_live(ttl_config)
        self.last_city = runtime_context.get_state(state_descriptor)

    def flat_map(self, value):
        user_id, city = value
        previous = self.last_city.value()
        self.last_city.update(city)
        yield (user_id, previous, city)
