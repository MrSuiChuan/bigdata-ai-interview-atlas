from dataclasses import dataclass


@dataclass
class AgentContract:
    instructions_mode: str
    output_type: str
    tool_use_behavior: str
    reset_tool_choice: bool


def choose_instruction_source(has_dynamic_context: bool) -> str:
    return "callable_instructions" if has_dynamic_context else "static_instructions"


def summarize_contract(contract: AgentContract) -> dict[str, str | bool]:
    return {
        "instruction_authority": contract.instructions_mode,
        "output_contract": contract.output_type,
        "tool_finalization": contract.tool_use_behavior,
        "loop_protection": contract.reset_tool_choice,
    }


if __name__ == "__main__":
    contract = AgentContract(
        instructions_mode=choose_instruction_source(has_dynamic_context=True),
        output_type="typed_dataclass",
        tool_use_behavior="run_llm_again",
        reset_tool_choice=True,
    )
    print(summarize_contract(contract))
