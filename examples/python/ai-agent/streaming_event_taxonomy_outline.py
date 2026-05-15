from dataclasses import dataclass


@dataclass
class StreamEvent:
    event_type: str
    namespace: tuple[str, ...]
    data: dict


def route_event(event: StreamEvent) -> str:
    if event.event_type == "messages":
        return "render_token_stream"
    if event.event_type in {"updates", "values"}:
        return "update_state_view"
    if event.event_type in {"checkpoints", "tasks", "debug"}:
        return "update_recovery_observer"
    if event.event_type == "request_info":
        return "open_approval_ui"
    return "handle_custom_progress"


if __name__ == "__main__":
    events = [
        StreamEvent("messages", ("root",), {"chunk": "thinking"}),
        StreamEvent("updates", ("root", "planner"), {"step": "retrieve"}),
        StreamEvent("request_info", ("root",), {"approval_id": "appr_1"}),
    ]
    for event in events:
        print(route_event(event))
