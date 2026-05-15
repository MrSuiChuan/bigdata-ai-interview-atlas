from dataclasses import dataclass


@dataclass
class ToolCall:
    name: str
    side_effect_level: str


def requires_human_approval(call: ToolCall) -> bool:
    return call.side_effect_level in {"high", "irreversible"}


def execute_tool(call: ToolCall) -> str:
    if requires_human_approval(call):
        return f"暂停执行 {call.name}，等待人工审批"
    return f"已执行 {call.name}"


if __name__ == "__main__":
    print(execute_tool(ToolCall(name="file_search", side_effect_level="none")))
    print(execute_tool(ToolCall(name="computer_click_buy_button", side_effect_level="irreversible")))