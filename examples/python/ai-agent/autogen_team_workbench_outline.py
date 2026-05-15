"""
AutoGen 概念性示例。

重点展示：
1. 单 Agent 不够时再上 team
2. team 内部的共享上下文与轮转响应
3. workbench 作为工具共享作用域
"""

from dataclasses import dataclass


@dataclass
class FakeWorkbench:
    tools: list[str]


def build_round_robin_team() -> dict:
    workbench = FakeWorkbench(tools=["lookup_runbook", "query_metrics", "create_ticket"])
    return {
        "team_type": "RoundRobinGroupChat",
        "shared_context": True,
        "agents": ["Planner", "Analyst", "Operator"],
        "workbench": workbench,
    }


if __name__ == "__main__":
    team = build_round_robin_team()
    print(team)