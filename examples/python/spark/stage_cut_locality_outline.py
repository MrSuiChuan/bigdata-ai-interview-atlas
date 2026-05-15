from dataclasses import dataclass


@dataclass
class StageCutDecision:
    dependency_type: str
    same_stage: bool
    preferred_location_source: str


def classify_dependency(needs_shuffle: bool) -> StageCutDecision:
    if needs_shuffle:
        return StageCutDecision(
            dependency_type="shuffle_dependency",
            same_stage=False,
            preferred_location_source="map_outputs_or_cached_shuffle_data",
        )
    return StageCutDecision(
        dependency_type="narrow_dependency",
        same_stage=True,
        preferred_location_source="underlying_rdd_preferred_locations",
    )


def scheduler_layer(question: str) -> str:
    if question in {"stage_cut", "preferred_locations", "shuffle_file_loss"}:
        return "DAGScheduler"
    return "TaskScheduler"


if __name__ == "__main__":
    print(classify_dependency(needs_shuffle=False))
    print(classify_dependency(needs_shuffle=True))
    print(scheduler_layer("stage_cut"))
    print(scheduler_layer("task_retry"))
