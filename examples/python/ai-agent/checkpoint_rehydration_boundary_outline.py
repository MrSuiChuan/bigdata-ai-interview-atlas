from dataclasses import dataclass


@dataclass
class CheckpointPlan:
    boundary: str
    storage: str
    trusted_source: bool


def can_rehydrate(plan: CheckpointPlan) -> bool:
    return plan.boundary == "superstep_complete" and plan.trusted_source


def restore_mode(use_same_run: bool) -> str:
    if use_same_run:
        return "resume_existing_run"
    return "rehydrate_new_instance"


if __name__ == "__main__":
    plan = CheckpointPlan(boundary="superstep_complete", storage="file", trusted_source=True)
    print(can_rehydrate(plan))
    print(restore_mode(use_same_run=False))
