from dataclasses import dataclass


@dataclass
class McpDecision:
    transport: str
    control_plane_owner: str
    approval_mode: str


def choose_mcp_mode(public_server: bool, app_manages_transport: bool) -> McpDecision:
    if public_server and not app_manages_transport:
        return McpDecision(
            transport="HostedMCPTool",
            control_plane_owner="openai_responses_api",
            approval_mode="tool_config_require_approval",
        )
    return McpDecision(
        transport="MCPServerStreamableHttp",
        control_plane_owner="application_runtime",
        approval_mode="server_require_approval",
    )


def should_expose_tool(agent_name: str, tool_name: str) -> bool:
    if agent_name == "Code Reviewer" and tool_name.startswith("danger_"):
        return False
    return True


def build_tool_meta(tenant_id: str | None) -> dict[str, str] | None:
    if not tenant_id:
        return None
    return {"tenant_id": tenant_id, "source": "agents-sdk"}


if __name__ == "__main__":
    print(choose_mcp_mode(public_server=True, app_manages_transport=False))
    print(choose_mcp_mode(public_server=False, app_manages_transport=True))
    print(should_expose_tool("Code Reviewer", "danger_delete_file"))
    print(build_tool_meta("tenant-42"))
