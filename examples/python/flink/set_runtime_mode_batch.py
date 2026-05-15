from pyflink.datastream import StreamExecutionEnvironment, RuntimeExecutionMode


env = StreamExecutionEnvironment.get_execution_environment()
env.set_runtime_mode(RuntimeExecutionMode.BATCH)

numbers = env.from_collection([1, 2, 3, 4, 5])
numbers.map(lambda x: x * 2).print()

env.execute("set-runtime-mode-batch")
