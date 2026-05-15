from dataclasses import dataclass


@dataclass
class Tool:
    name: str
    requires_approval: bool


def visible_tools(role: str) -> list[Tool]:
    if role == "research_agent":
        return [Tool(name="web_search", requires_approval=False)]
    return [
        Tool(name="web_search", requires_approval=False),
        Tool(name="purchase_order", requires_approval=True),
    ]


def execute_tool(tool: Tool) -> str:
    if tool.requires_approval:
        return f"approval required for {tool.name}"
    return f"executed {tool.name}"


if __name__ == "__main__":
    for tool in visible_tools("research_agent"):
        print(execute_tool(tool))
    for tool in visible_tools("ops_agent"):
        print(execute_tool(tool))