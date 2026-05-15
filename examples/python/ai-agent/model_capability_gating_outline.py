from dataclasses import dataclass


@dataclass
class ModelProfile:
    name: str
    supports_tools: bool
    context_window: int
    max_output_tokens: int
    model_shape: str


def can_route(profile: ModelProfile, needs_tools: bool, min_context: int, min_output: int, required_shape: str) -> bool:
    return (
        (not needs_tools or profile.supports_tools)
        and profile.context_window >= min_context
        and profile.max_output_tokens >= min_output
        and profile.model_shape == required_shape
    )


if __name__ == "__main__":
    fast_model = ModelProfile("fast-mini", True, 200000, 8000, "responses")
    cheap_model = ModelProfile("cheap-legacy", False, 128000, 4000, "chat_completions")
    print(can_route(fast_model, needs_tools=True, min_context=100000, min_output=3000, required_shape="responses"))
    print(can_route(cheap_model, needs_tools=True, min_context=100000, min_output=3000, required_shape="responses"))
