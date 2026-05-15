from dataclasses import dataclass


@dataclass
class Budget:
    remaining_steps: int
    remaining_tokens: int


def choose_next_action(budget: Budget, evidence_is_enough: bool) -> str:
    if evidence_is_enough:
        return "early_exit"
    if budget.remaining_steps <= 1 or budget.remaining_tokens < 500:
        return "fallback_or_best_effort"
    return "continue_reasoning"


if __name__ == "__main__":
    print(choose_next_action(Budget(remaining_steps=4, remaining_tokens=2000), evidence_is_enough=False))
    print(choose_next_action(Budget(remaining_steps=1, remaining_tokens=300), evidence_is_enough=False))
    print(choose_next_action(Budget(remaining_steps=3, remaining_tokens=1800), evidence_is_enough=True))