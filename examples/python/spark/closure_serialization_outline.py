from dataclasses import dataclass


@dataclass
class ClosureBehavior:
    mode: str
    executor_sees_original_variable: bool
    mutation_is_well_defined: bool


def closure_semantics(mode: str) -> ClosureBehavior:
    if mode == "cluster":
        return ClosureBehavior(
            mode="cluster",
            executor_sees_original_variable=False,
            mutation_is_well_defined=False,
        )
    return ClosureBehavior(
        mode="local",
        executor_sees_original_variable=False,
        mutation_is_well_defined=False,
    )


def safe_update_path(update_kind: str) -> str:
    if update_kind == "driver_metric":
        return "use_accumulator"
    return "avoid_mutating_external_closure_state"


if __name__ == "__main__":
    print(closure_semantics("local"))
    print(closure_semantics("cluster"))
    print(safe_update_path("driver_metric"))
