from dataclasses import dataclass, field


@dataclass
class RunResultOutline:
    final_output: str | None
    new_items: list[str] = field(default_factory=list)
    raw_responses: list[str] = field(default_factory=list)
    last_agent: str = "router"
    interruptions: list[str] = field(default_factory=list)


def choose_continuation_input(use_server_state: bool, full_history: list[str], new_user_input: str) -> list[str]:
    if use_server_state:
        return [new_user_input]
    return full_history + [new_user_input]


def summarize_result_surfaces(result: RunResultOutline) -> dict[str, object]:
    return {
        "answer_surface": result.final_output,
        "workflow_surface_count": len(result.new_items),
        "raw_response_count": len(result.raw_responses),
        "resume_required": len(result.interruptions) > 0,
        "next_agent_hint": result.last_agent,
    }


if __name__ == "__main__":
    result = RunResultOutline(
        final_output=None,
        new_items=["handoff:researcher", "tool:search", "approval:pending"],
        raw_responses=["resp_1", "resp_2"],
        last_agent="researcher",
        interruptions=["approval_required"],
    )
    print(summarize_result_surfaces(result))
    print(choose_continuation_input(use_server_state=True, full_history=["old_turn"], new_user_input="continue"))
