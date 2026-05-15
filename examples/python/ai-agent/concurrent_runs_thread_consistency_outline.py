from dataclasses import dataclass, field
from typing import List


@dataclass
class ThreadState:
    status: str = "idle"
    history: List[str] = field(default_factory=list)


def handle_new_message(state: ThreadState, message: str, strategy: str) -> str:
    if state.status == "busy" and strategy == "enqueue":
        return f"enqueue:{message}"
    if state.status == "busy" and strategy == "reject":
        return f"reject:{message}"
    if state.status == "busy" and strategy == "interrupt":
        state.status = "interrupted"
        state.history.append("partial progress preserved")
        state.history.append(message)
        return "interrupt-and-resume"
    if state.status == "busy" and strategy == "rollback":
        state.history = [message]
        return "rollback-and-restart"

    state.status = "busy"
    state.history.append(message)
    return "start-run"


if __name__ == "__main__":
    thread = ThreadState(status="busy", history=["draft report"])
    print(handle_new_message(thread, "补充 Kafka ISR 细节", strategy="enqueue"))
    print(handle_new_message(thread, "改成 Spark 题目", strategy="interrupt"))
    print(thread)