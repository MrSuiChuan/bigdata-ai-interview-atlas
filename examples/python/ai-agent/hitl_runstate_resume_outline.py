from dataclasses import dataclass


@dataclass
class ApprovalState:
    interruption_id: str
    sticky: bool
    resumed_with_original_agent: bool


def resolve_interruption(approve: bool, sticky: bool) -> ApprovalState:
    return ApprovalState(
        interruption_id="call_123",
        sticky=sticky,
        resumed_with_original_agent=True if approve else True,
    )


def rejection_message(run_default: str | None, per_call: str | None) -> str:
    if per_call:
        return per_call
    if run_default:
        return run_default
    return "sdk_default_rejection_message"


if __name__ == "__main__":
    print(resolve_interruption(approve=True, sticky=True))
    print(rejection_message("run level fallback", "manual rejection override"))
