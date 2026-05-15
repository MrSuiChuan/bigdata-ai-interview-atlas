from dataclasses import dataclass, field


@dataclass
class Checkpoint:
    thread_id: str
    step_index: int = 0
    status: str = "queued"
    completed_effects: set[str] = field(default_factory=set)


def execute_effect(checkpoint: Checkpoint, effect_key: str) -> str:
    if effect_key in checkpoint.completed_effects:
        return f"skip duplicated effect: {effect_key}"
    checkpoint.completed_effects.add(effect_key)
    return f"execute effect once: {effect_key}"


def run_workflow(checkpoint: Checkpoint) -> list[str]:
    events: list[str] = []
    checkpoint.status = "in_progress"

    if checkpoint.step_index <= 0:
        events.append("step0: fetch context")
        checkpoint.step_index = 1

    if checkpoint.step_index <= 1:
        events.append(execute_effect(checkpoint, "write_ticket:case-1001"))
        checkpoint.step_index = 2

    if checkpoint.step_index <= 2:
        events.append("step2: synthesize final answer")
        checkpoint.step_index = 3

    checkpoint.status = "completed"
    return events


if __name__ == "__main__":
    cp = Checkpoint(thread_id="thread-42")
    first_run = run_workflow(cp)
    resumed_run = run_workflow(cp)
    print("first run:", first_run)
    print("resumed run:", resumed_run)
    print("checkpoint:", cp)