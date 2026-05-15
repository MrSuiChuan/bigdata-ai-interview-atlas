from dataclasses import dataclass


@dataclass
class RuntimeFootprint:
    batch_size: int
    compression_enabled: bool
    vectorized_reader_enabled: bool
    dynamic_partition_pruning_enabled: bool


def cache_runtime_profile(batch_size: int) -> RuntimeFootprint:
    return RuntimeFootprint(
        batch_size=batch_size,
        compression_enabled=True,
        vectorized_reader_enabled=True,
        dynamic_partition_pruning_enabled=True,
    )


def remaining_risk(single_partition_bytes: int, limit_bytes: int = 128 * 1024 * 1024) -> str:
    if single_partition_bytes > limit_bytes:
        return "planner_may_insert_shuffle_to_restore_parallelism"
    return "columnar_pruning_and_cache_likely_sufficient_for_current_partition"


if __name__ == "__main__":
    print(cache_runtime_profile(10000))
    print(remaining_risk(256 * 1024 * 1024))
