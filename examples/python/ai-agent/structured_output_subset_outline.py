from dataclasses import dataclass


@dataclass
class SchemaCheck:
    root_is_object: bool
    all_fields_required: bool
    additional_properties_false: bool


def validate_structured_output_shape(check: SchemaCheck) -> str:
    if not check.root_is_object:
        return "invalid_root_schema"
    if not check.all_fields_required:
        return "missing_required_contract"
    if not check.additional_properties_false:
        return "object_shape_not_closed"
    return "schema_subset_compatible"


def handle_model_edge_case(refusal: bool, incomplete: bool) -> str:
    if refusal:
        return "handle_refusal_before_schema_parse"
    if incomplete:
        return "handle_incomplete_before_schema_parse"
    return "safe_to_parse_schema_matched_output"


if __name__ == "__main__":
    print(validate_structured_output_shape(SchemaCheck(True, True, True)))
    print(handle_model_edge_case(refusal=False, incomplete=False))
    print(handle_model_edge_case(refusal=True, incomplete=False))
