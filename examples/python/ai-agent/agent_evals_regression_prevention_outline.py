from dataclasses import dataclass


@dataclass
class EvalCase:
    name: str
    trace_score: float
    task_score: float


def regression_detected(before: EvalCase, after: EvalCase, threshold: float = 0.05) -> bool:
    return (before.trace_score - after.trace_score) > threshold or (before.task_score - after.task_score) > threshold


if __name__ == "__main__":
    baseline = EvalCase(name="tool-routing", trace_score=0.92, task_score=0.89)
    candidate = EvalCase(name="tool-routing", trace_score=0.81, task_score=0.87)
    print("是否触发回归告警:", regression_detected(baseline, candidate))