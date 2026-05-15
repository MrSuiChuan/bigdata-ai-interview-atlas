from dataclasses import dataclass


@dataclass
class DelegationPlan:
    mode: str
    passes_full_history: bool
    original_agent_continues: bool


def choose_delegation_mode(needs_takeover: bool) -> DelegationPlan:
    if needs_takeover:
        return DelegationPlan("handoff", True, False)
    return DelegationPlan("agent_as_tool", False, True)


def history_visibility(mode: str) -> str:
    if mode == "handoff":
        return "next_agent_sees_filtered_history_view"
    return "nested_agent_gets_constructed_input_only"


if __name__ == "__main__":
    handoff_plan = choose_delegation_mode(needs_takeover=True)
    tool_plan = choose_delegation_mode(needs_takeover=False)
    print(handoff_plan, history_visibility(handoff_plan.mode))
    print(tool_plan, history_visibility(tool_plan.mode))
