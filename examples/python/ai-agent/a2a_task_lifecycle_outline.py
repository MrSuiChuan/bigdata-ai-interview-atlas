from dataclasses import dataclass, field


TERMINAL_STATES = {"completed", "failed", "canceled", "rejected"}


@dataclass
class AgentCard:
    name: str
    service_url: str
    skills: list[str]
    auth_schemes: list[str]


@dataclass
class Task:
    task_id: str
    context_id: str
    state: str = "submitted"
    events: list[str] = field(default_factory=list)


def continue_task(task: Task, user_message: str) -> str:
    if task.state != "input-required":
        return "no_continuation_needed"
    task.events.append(f"resume:{task.task_id}:{task.context_id}:{user_message}")
    task.state = "working"
    return task.state


def subscribe_events(task: Task) -> list[str]:
    stream = [f"current:{task.state}"]
    if task.state not in TERMINAL_STATES:
        stream.append("status_update:working")
        stream.append("artifact_update:partial_result")
    if task.state in TERMINAL_STATES:
        stream.append("close_stream")
    return stream


if __name__ == "__main__":
    card = AgentCard(
        name="research-agent",
        service_url="https://example.com/.well-known/agent-card.json",
        skills=["market_research", "report_synthesis"],
        auth_schemes=["oauth2"],
    )
    task = Task(task_id="t-100", context_id="ctx-9", state="input-required")
    print(card)
    print(continue_task(task, "continue_with_enterprise_template"))
    print(subscribe_events(task))
