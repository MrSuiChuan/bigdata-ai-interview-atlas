from dataclasses import dataclass


@dataclass
class ShuffleRecoveryEvent:
    event: str
    action: str


def on_reduce_side_failure(event: str) -> ShuffleRecoveryEvent:
    if event == "fetch_failed":
        return ShuffleRecoveryEvent(
            event=event,
            action="resubmit_shuffle_map_stage",
        )
    return ShuffleRecoveryEvent(
        event=event,
        action="retry_task_only",
    )


def recovery_boundary(external_shuffle_service: bool, executor_lost: bool) -> str:
    if external_shuffle_service and executor_lost:
        return "wait_for_real_fetch_failure_before_invalidating_shuffle_outputs"
    if executor_lost:
        return "likely_invalidate_map_outputs"
    return "preserve_existing_shuffle_outputs"


if __name__ == "__main__":
    print(on_reduce_side_failure("fetch_failed"))
    print(recovery_boundary(True, True))
