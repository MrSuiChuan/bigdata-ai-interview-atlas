from dataclasses import dataclass


@dataclass
class SubgraphPlan:
    shared_state_keys: list[str]
    has_private_history: bool
    persistence_mode: str


def choose_composition_mode(plan: SubgraphPlan) -> str:
    if plan.has_private_history or not plan.shared_state_keys:
        return "wrapper_node_invocation"
    return "direct_subgraph_node"


def choose_persistence_behavior(plan: SubgraphPlan) -> str:
    if plan.persistence_mode == "per_thread":
        return "subagent_keeps_memory_across_calls"
    if plan.persistence_mode == "stateless":
        return "plain_function_like_subgraph"
    return "fresh_each_call_but_checkpointed_during_invocation"


if __name__ == "__main__":
    plan = SubgraphPlan(
        shared_state_keys=["task", "final_answer"],
        has_private_history=True,
        persistence_mode="per_invocation",
    )
    print(choose_composition_mode(plan))
    print(choose_persistence_behavior(plan))
