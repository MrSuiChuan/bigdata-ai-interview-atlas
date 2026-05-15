from pprint import pprint


AGENT_CARD = {
    "name": "ResearchPlannerAgent",
    "description": "负责把复杂研究请求拆分成可执行研究任务。",
    "url": "https://planner.example.com/a2a",
    "version": "1.0.0",
    "capabilities": {
        "streaming": True,
        "pushNotifications": False,
        "stateTransitionHistory": True,
    },
    "skills": [
        {
            "id": "research_planning",
            "name": "Research Planning",
            "description": "将研究目标拆分为可执行任务列表",
            "tags": ["planning", "research"],
        }
    ],
    "authentication": {
        "schemes": ["Bearer"]
    },
}


if __name__ == "__main__":
    # A2A 推荐通过 /.well-known/agent.json 暴露类似结构
    pprint(AGENT_CARD)