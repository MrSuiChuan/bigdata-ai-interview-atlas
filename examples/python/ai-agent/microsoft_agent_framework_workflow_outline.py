"""
Microsoft Agent Framework 概念性示例。

这个文件的重点不是可直接运行，而是说明企业级 workflow 往往会把：
1. conversation context
2. workflow executors
3. observability hooks
放进同一运行时。
"""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentSessionState:
    conversation_id: str
    messages: list[dict[str, Any]] = field(default_factory=list)

    def serialize(self) -> dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "messages": self.messages,
        }


def intake_executor(state: AgentSessionState, user_message: str) -> AgentSessionState:
    state.messages.append({"role": "user", "content": user_message})
    state.messages.append({"role": "system", "content": "进入 intake 节点"})
    return state


def approval_executor(state: AgentSessionState) -> AgentSessionState:
    state.messages.append({"role": "system", "content": "进入 approval 节点"})
    return state


def fulfillment_executor(state: AgentSessionState) -> AgentSessionState:
    state.messages.append({"role": "system", "content": "进入 fulfillment 节点"})
    return state


if __name__ == "__main__":
    session = AgentSessionState(conversation_id="ticket-2026-0001")
    session = intake_executor(session, "请帮我重置数据同步任务")
    session = approval_executor(session)
    session = fulfillment_executor(session)
    print(session.serialize())