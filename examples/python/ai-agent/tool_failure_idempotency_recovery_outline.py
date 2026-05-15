from dataclasses import dataclass, field


@dataclass
class EffectState:
    completed_effects: set[str] = field(default_factory=set)


def execute_effect(state: EffectState, effect_key: str) -> str:
    if effect_key in state.completed_effects:
        return f"reuse recorded result for {effect_key}"
    state.completed_effects.add(effect_key)
    return f"execute side effect once: {effect_key}"


if __name__ == "__main__":
    state = EffectState()
    print(execute_effect(state, "create_ticket:42"))
    print(execute_effect(state, "create_ticket:42"))