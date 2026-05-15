from dataclasses import dataclass


@dataclass
class SafetyDecision:
    use_moderation: bool
    require_human_review: bool
    require_identity_friction: bool
    constrain_output: bool


def choose_safety_layers(risk_level: str, open_generation: bool) -> SafetyDecision:
    return SafetyDecision(
        use_moderation=True,
        require_human_review=risk_level in {"high", "critical"},
        require_identity_friction=risk_level == "critical",
        constrain_output=open_generation,
    )


def choose_answer_mode(use_validated_backend_materials: bool) -> str:
    if use_validated_backend_materials:
        return "retrieve_and_return_validated_materials"
    return "open_generation_with_extra_controls"


if __name__ == "__main__":
    print(choose_safety_layers(risk_level="high", open_generation=True))
    print(choose_answer_mode(use_validated_backend_materials=True))
