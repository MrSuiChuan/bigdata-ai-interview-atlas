from dataclasses import dataclass, field


@dataclass
class TraceRecord:
    spans: list[str] = field(default_factory=list)
    tripwire_fired: bool = False
    escalated: bool = False


def run_guardrail(input_text: str) -> bool:
    return "删除全部" in input_text or "支付" in input_text


def run_agent(input_text: str) -> TraceRecord:
    trace = TraceRecord(spans=["input_received", "plan_generated"])
    if run_guardrail(input_text):
        trace.tripwire_fired = True
        trace.escalated = True
        trace.spans.append("human_approval_required")
        return trace
    trace.spans.extend(["tool_called", "final_output"])
    return trace


if __name__ == "__main__":
    print(run_agent("请删除全部历史数据"))
    print(run_agent("请总结 Kafka Consumer Group 原理"))