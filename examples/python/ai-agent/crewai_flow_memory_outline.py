"""
CrewAI 概念性示例。

重点展示：
1. Flow 作为生产骨架
2. Crew 作为 Flow 内的自治任务单元
3. state 与 persistence 的位置
"""

from dataclasses import dataclass, field


@dataclass
class FlowState:
    request_id: str
    user_goal: str
    approved: bool = False
    memory: list[str] = field(default_factory=list)


def intake(state: FlowState) -> FlowState:
    state.memory.append("进入 intake 节点")
    return state


def crew_task(state: FlowState) -> FlowState:
    state.memory.append("Crew 完成候选方案生成")
    return state


def approval(state: FlowState) -> FlowState:
    state.approved = True
    state.memory.append("审批通过，进入执行")
    return state


if __name__ == "__main__":
    state = FlowState(request_id="flow-001", user_goal="生成客服升级处置方案")
    state = intake(state)
    state = crew_task(state)
    state = approval(state)
    print(state)