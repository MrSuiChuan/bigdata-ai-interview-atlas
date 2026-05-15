from dataclasses import dataclass


@dataclass
class StreamingJoinBoundary:
    join_type: str
    has_watermark: bool
    has_event_time_constraint: bool


def state_growth_risk(boundary: StreamingJoinBoundary) -> str:
    if boundary.join_type in {"left_outer", "right_outer", "full_outer", "left_semi"}:
        if not boundary.has_watermark or not boundary.has_event_time_constraint:
            return "semantic_violation_for_correctness_and_state_cleanup"
    if not boundary.has_watermark or not boundary.has_event_time_constraint:
        return "unbounded_state_risk"
    return "state_can_be_evicted_when_future_match_is_impossible"


def restart_compatibility(change_kind: str) -> str:
    if change_kind in {"input_source_type", "aggregation_keys", "dedup_columns", "join_type", "equi_join_columns"}:
        return "not_allowed_with_same_checkpoint"
    return "depends_on_query_and_change"


if __name__ == "__main__":
    print(
        state_growth_risk(
            StreamingJoinBoundary(
                join_type="left_outer",
                has_watermark=True,
                has_event_time_constraint=True,
            )
        )
    )
    print(restart_compatibility("join_type"))
