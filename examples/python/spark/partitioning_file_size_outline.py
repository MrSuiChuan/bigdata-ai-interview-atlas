from dataclasses import dataclass


@dataclass
class PartitionLayout:
    read_partition_bytes: int
    write_max_records_per_file: int
    preferred_shuffle_action: str


def plan_layout(
    many_small_files: bool,
    need_balanced_write: bool,
    must_emit_single_file: bool,
) -> PartitionLayout:
    if must_emit_single_file:
        action = "avoid_coalesce_1_until_last_possible_step"
    elif need_balanced_write:
        action = "repartition_or_rebalance_before_write"
    else:
        action = "allow_aqe_post_shuffle_coalesce"

    return PartitionLayout(
        read_partition_bytes=128 * 1024 * 1024,
        write_max_records_per_file=500000 if many_small_files else 0,
        preferred_shuffle_action=action,
    )


def repartition_semantics(mode: str) -> str:
    if mode == "coalesce":
        return "fewer_partitions_without_full_shuffle"
    if mode == "repartition_by_range":
        return "range_partitioned_but_not_sorted_within_partition"
    return "hash_partitioned_with_shuffle"


if __name__ == "__main__":
    print(plan_layout(many_small_files=True, need_balanced_write=True, must_emit_single_file=False))
    print(repartition_semantics("repartition_by_range"))
