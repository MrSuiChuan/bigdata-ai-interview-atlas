from dataclasses import dataclass, field


@dataclass
class ApprovalDecision:
    approved: bool
    edited_amount: int | None = None
    reason: str = ""


@dataclass
class RunState:
    status: str = "running"
    pending_action: str | None = None
    audit_log: list[str] = field(default_factory=list)


def needs_approval(action: str, amount: int) -> bool:
    return action == "wire_transfer" and amount >= 10000


def request_approval(state: RunState, action: str, amount: int) -> None:
    state.status = "interrupted"
    state.pending_action = f"{action}:{amount}"
    state.audit_log.append(f"pause_for_approval:{action}:{amount}")


def resume_after_approval(state: RunState, decision: ApprovalDecision) -> str:
    if state.pending_action is None:
        return "nothing_to_resume"

    action, raw_amount = state.pending_action.split(":")
    amount = int(raw_amount)
    final_amount = decision.edited_amount if decision.edited_amount is not None else amount

    if not decision.approved:
        state.status = "rejected"
        state.audit_log.append(f"rejected:{action}:{amount}:{decision.reason}")
        state.pending_action = None
        return "rejected"

    state.status = "running"
    state.audit_log.append(f"approved:{action}:{final_amount}:{decision.reason}")
    state.pending_action = None
    return f"execute:{action}:{final_amount}"


if __name__ == "__main__":
    state = RunState()
    if needs_approval("wire_transfer", 20000):
        request_approval(state, "wire_transfer", 20000)

    result = resume_after_approval(
        state,
        ApprovalDecision(approved=True, edited_amount=12000, reason="manager_override"),
    )
    print(result)
    print(state.audit_log)
