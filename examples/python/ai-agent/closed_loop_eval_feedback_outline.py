from dataclasses import dataclass, field


@dataclass
class TraceCase:
    trace_id: str
    failure_mode: str
    human_label: str


@dataclass
class EvalRegistry:
    backlog: list[TraceCase] = field(default_factory=list)
    regression_suite: list[TraceCase] = field(default_factory=list)


def mine_trace_for_eval_case(registry: EvalRegistry, trace: TraceCase) -> None:
    registry.backlog.append(trace)


def promote_to_regression_suite(registry: EvalRegistry) -> None:
    while registry.backlog:
        registry.regression_suite.append(registry.backlog.pop(0))


def run_multicriteria_check(case: TraceCase) -> dict[str, bool]:
    return {
        "task_success": case.human_label == "fixed",
        "policy_safe": "unsafe" not in case.failure_mode,
        "process_followed": "tool_order" not in case.failure_mode,
    }


if __name__ == "__main__":
    registry = EvalRegistry()
    mine_trace_for_eval_case(
        registry,
        TraceCase(trace_id="trace-17", failure_mode="tool_order_error", human_label="fixed"),
    )
    promote_to_regression_suite(registry)
    print(run_multicriteria_check(registry.regression_suite[0]))
