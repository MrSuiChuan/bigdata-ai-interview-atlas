from pyflink.datastream import CheckpointingMode, StreamExecutionEnvironment


env = StreamExecutionEnvironment.get_execution_environment()

# 生产中应根据延迟、背压和恢复目标调整这些参数。
env.enable_checkpointing(30_000)

checkpoint_config = env.get_checkpoint_config()
checkpoint_config.set_checkpointing_mode(CheckpointingMode.EXACTLY_ONCE)
checkpoint_config.set_checkpoint_timeout(120_000)
checkpoint_config.set_min_pause_between_checkpoints(10_000)
checkpoint_config.set_tolerable_checkpoint_failure_number(2)
checkpoint_config.enable_unaligned_checkpoints()

(
    env.from_collection([("u1", 1), ("u2", 1)])
    .map(lambda x: x)
    .print()
)

env.execute("checkpoint-config-unaligned-demo")

