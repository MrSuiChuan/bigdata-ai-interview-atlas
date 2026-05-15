from typing import TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt


class ApprovalState(TypedDict):
    request: str
    approved: bool


def draft_action(state: ApprovalState) -> ApprovalState:
    # 真实场景里这里通常会调用模型或工具
    print(f"准备执行: {state['request']}")
    return state


def human_review(state: ApprovalState) -> ApprovalState:
    approved = interrupt({"question": f"是否批准执行: {state['request']}?"})
    return {**state, "approved": bool(approved)}


def run_action(state: ApprovalState) -> ApprovalState:
    if state["approved"]:
        print("已批准，继续执行后续动作")
    else:
        print("未批准，任务终止")
    return state


builder = StateGraph(ApprovalState)
builder.add_node("draft_action", draft_action)
builder.add_node("human_review", human_review)
builder.add_node("run_action", run_action)
builder.add_edge(START, "draft_action")
builder.add_edge("draft_action", "human_review")
builder.add_edge("human_review", "run_action")
builder.add_edge("run_action", END)

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

# 关键点：thread_id 让这条执行线可以在人工介入后恢复
config = {"configurable": {"thread_id": "approval-demo-1"}}
state = {"request": "删除异常测试数据", "approved": False}
result = graph.invoke(state, config=config)
print(result)