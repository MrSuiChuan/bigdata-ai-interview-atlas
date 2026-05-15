from dataclasses import dataclass


@dataclass
class Request:
    task_type: str
    interactive: bool
    requires_structured_output: bool


def route_model(request: Request) -> str:
    if not request.interactive:
        return "batch_or_flex_tier"
    if request.requires_structured_output and request.task_type == "deep_reasoning":
        return "flagship_realtime_tier"
    if request.task_type == "simple_classification":
        return "small_fast_tier"
    return "standard_realtime_tier"


if __name__ == "__main__":
    print(route_model(Request(task_type="deep_reasoning", interactive=True, requires_structured_output=True)))
    print(route_model(Request(task_type="simple_classification", interactive=True, requires_structured_output=False)))
    print(route_model(Request(task_type="offline_report", interactive=False, requires_structured_output=True)))