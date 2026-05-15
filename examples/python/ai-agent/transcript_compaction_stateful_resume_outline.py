from dataclasses import dataclass, field


@dataclass
class ResumeState:
    transcript_items: list[str] = field(default_factory=list)
    compacted_state: str | None = None
    paused_snapshot: dict | None = None


def continue_with_previous_response_id(new_turn: str) -> str:
    return f"send only new turn: {new_turn}"


def prune_before_compaction(state: ResumeState) -> ResumeState:
    if state.compacted_state:
        state.transcript_items = [state.compacted_state, state.transcript_items[-1]]
    return state


def resume_from_snapshot(state: ResumeState) -> str:
    if state.paused_snapshot:
        return "resume execution from saved state"
    return "no snapshot available"


if __name__ == "__main__":
    state = ResumeState(
        transcript_items=["user asks question", "agent drafts answer", "user asks follow-up"],
        compacted_state="compaction-item",
        paused_snapshot={"step": "approval_pending"},
    )
    print(continue_with_previous_response_id("继续解释 Kafka ISR"))
    print(prune_before_compaction(state))
    print(resume_from_snapshot(state))