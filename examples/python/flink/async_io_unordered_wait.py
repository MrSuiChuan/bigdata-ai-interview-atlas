from concurrent.futures import Future, ThreadPoolExecutor

from pyflink.common import Types
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import AsyncFunction, ResultFuture
from pyflink.datastream.connectors import AsyncDataStream


class AsyncDimLookup(AsyncFunction):
    def open(self, runtime_context):
        self.pool = ThreadPoolExecutor(max_workers=16)

    def close(self):
        self.pool.shutdown(wait=False)

    def async_invoke(self, value, result_future: ResultFuture):
        def query():
            user_id = value
            return (user_id, f"vip-{user_id}")

        future: Future = self.pool.submit(query)
        future.add_done_callback(lambda f: result_future.complete([f.result()]))


env = StreamExecutionEnvironment.get_execution_environment()
env.enable_checkpointing(10_000)

stream = env.from_collection(["u1", "u2", "u3"], type_info=Types.STRING())

AsyncDataStream.unordered_wait(
    stream,
    AsyncDimLookup(),
    timeout=3_000,
    capacity=100,
    output_type=Types.TUPLE([Types.STRING(), Types.STRING()])
).print()

env.execute("async-io-unordered-wait")
