from dataclasses import dataclass


@dataclass
class ToolSignature:
    model_visible_fields: list[str]
    runtime_only_fields: list[str]
    strict_json_schema: bool


def build_tool_contract(signature: ToolSignature) -> dict[str, object]:
    return {
        "schema_fields": signature.model_visible_fields,
        "context_fields_hidden_from_model": signature.runtime_only_fields,
        "strict_mode": signature.strict_json_schema,
    }


def can_expose_to_model(field_name: str, runtime_only_fields: list[str]) -> bool:
    return field_name not in runtime_only_fields


if __name__ == "__main__":
    signature = ToolSignature(
        model_visible_fields=["ticket_title", "priority", "team"],
        runtime_only_fields=["run_context"],
        strict_json_schema=True,
    )
    print(build_tool_contract(signature))
    print(can_expose_to_model("priority", signature.runtime_only_fields))
    print(can_expose_to_model("run_context", signature.runtime_only_fields))
