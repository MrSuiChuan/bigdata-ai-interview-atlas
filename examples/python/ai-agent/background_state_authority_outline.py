from dataclasses import dataclass


@dataclass
class ExecutionPlan:
    mode: str
    state_authority: str
    use_server_compaction: bool
    requires_store: bool


def choose_plan(task_seconds: int, zero_data_retention: bool, state_authority: str) -> ExecutionPlan:
    background = task_seconds > 20 and not zero_data_retention
    return ExecutionPlan(
        mode="background" if background else "interactive",
        state_authority=state_authority,
        use_server_compaction=state_authority == "conversation",
        requires_store=background,
    )


def next_input(previous_response_id: str | None, user_message: str, use_server_compaction: bool) -> dict[str, str]:
    payload = {"user_message": user_message}
    if previous_response_id is not None:
        payload["previous_response_id"] = previous_response_id
    if use_server_compaction:
        payload["pruning_strategy"] = "do_not_manually_prune"
    else:
        payload["pruning_strategy"] = "client_controls_context"
    return payload


if __name__ == "__main__":
    plan = choose_plan(task_seconds=45, zero_data_retention=False, state_authority="conversation")
    print(plan)
    print(next_input(previous_response_id="resp_123", user_message="continue_analysis", use_server_compaction=plan.use_server_compaction))
