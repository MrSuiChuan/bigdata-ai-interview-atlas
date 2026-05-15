from dataclasses import dataclass, field


@dataclass
class SharedState:
    task_id: str
    controller: str = "orchestrator"
    public_facts: dict[str, str] = field(default_factory=dict)
    private_notes: dict[str, list[str]] = field(default_factory=dict)


def add_private_note(state: SharedState, agent_name: str, note: str) -> None:
    state.private_notes.setdefault(agent_name, []).append(note)


def delegate_by_handoff(state: SharedState, filtered_input: dict[str, str]) -> str:
    state.controller = "research_agent"
    state.public_facts["delegation_mode"] = "handoff"
    return f"control transferred with input: {filtered_input}"


def call_agent_as_tool(state: SharedState, question: str) -> str:
    state.public_facts["delegation_mode"] = "agent_as_tool"
    return f"tool result for: {question}"


def run_demo() -> SharedState:
    state = SharedState(task_id="task-001")
    state.public_facts["goal"] = "explain kafka rebalance"

    add_private_note(state, "orchestrator", "Only share the goal and audience level")
    tool_result = call_agent_as_tool(state, "What is partition assignment?")
    state.public_facts["draft_summary"] = tool_result

    filtered_input = {
        "goal": state.public_facts["goal"],
        "audience": "interview_candidate",
    }
    handoff_result = delegate_by_handoff(state, filtered_input)
    state.public_facts["handoff_result"] = handoff_result
    return state


if __name__ == "__main__":
    final_state = run_demo()
    print("controller:", final_state.controller)
    print("public facts:", final_state.public_facts)
    print("private notes:", final_state.private_notes)