from dataclasses import dataclass, field


@dataclass
class MCPServerSurface:
    tools: list[str]
    resources: list[str]
    prompts: list[str]


@dataclass
class ExposurePolicy:
    allowed_tools: set[str] = field(default_factory=set)
    allowed_prompts: set[str] = field(default_factory=set)
    execution_mode: str = "local"


def build_agent_view(surface: MCPServerSurface, policy: ExposurePolicy) -> dict[str, list[str] | str]:
    return {
        "tools": [tool for tool in surface.tools if tool in policy.allowed_tools],
        "resources": surface.resources,
        "prompts": [prompt for prompt in surface.prompts if prompt in policy.allowed_prompts],
        "execution_mode": policy.execution_mode,
    }


if __name__ == "__main__":
    surface = MCPServerSurface(
        tools=["create_ticket", "delete_index", "run_report"],
        resources=["kb://ops/playbook", "db://analytics/monthly"],
        prompts=["incident_triage", "report_review"],
    )
    policy = ExposurePolicy(
        allowed_tools={"create_ticket", "run_report"},
        allowed_prompts={"incident_triage"},
        execution_mode="hosted",
    )
    print(build_agent_view(surface, policy))
