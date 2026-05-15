from dataclasses import dataclass


@dataclass
class GuardrailDecision:
    stage: str
    run_in_parallel: bool
    may_have_side_effects_before_stop: bool


def evaluate_input_guardrail(run_in_parallel: bool) -> GuardrailDecision:
    if run_in_parallel:
        return GuardrailDecision(
            stage="before_and_during_agent_execution",
            run_in_parallel=True,
            may_have_side_effects_before_stop=True,
        )
    return GuardrailDecision(
        stage="before_agent_execution",
        run_in_parallel=False,
        may_have_side_effects_before_stop=False,
    )


def tool_guardrail_scope(tool_kind: str) -> str:
    if tool_kind == "function_tool":
        return "supported_before_and_after_each_call"
    return "not_covered_by_function_tool_guardrail_pipeline"


if __name__ == "__main__":
    print(evaluate_input_guardrail(run_in_parallel=True))
    print(evaluate_input_guardrail(run_in_parallel=False))
    print(tool_guardrail_scope("function_tool"))
    print(tool_guardrail_scope("hosted_tool"))
