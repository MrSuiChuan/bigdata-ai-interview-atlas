from dataclasses import dataclass


@dataclass
class TracePlan:
    workflow_name: str
    grouped_runs: int
    needs_immediate_flush: bool


def choose_trace_plan(grouped_runs: int, background_worker: bool) -> TracePlan:
    return TracePlan(
        workflow_name="agent_workflow",
        grouped_runs=grouped_runs,
        needs_immediate_flush=background_worker,
    )


def sensitive_data_policy(include_sensitive_data: bool) -> str:
    if include_sensitive_data:
        return "generation_and_function_payloads_may_be_exported"
    return "only_non_sensitive_trace_metadata_exported"


if __name__ == "__main__":
    print(choose_trace_plan(grouped_runs=2, background_worker=True))
    print(sensitive_data_policy(include_sensitive_data=False))
