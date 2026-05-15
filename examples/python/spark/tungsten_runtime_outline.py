from dataclasses import dataclass


@dataclass
class SqlRuntimeLayer:
    layer: str
    main_value: str


def explain_sql_speed(reason: str) -> SqlRuntimeLayer:
    mapping = {
        "catalyst": SqlRuntimeLayer("planning", "tree_transformation_and_plan_optimization"),
        "whole_stage_codegen": SqlRuntimeLayer("runtime", "reduce_operator_boundary_overhead"),
        "off_heap": SqlRuntimeLayer("runtime", "reduce_gc_pressure"),
        "vectorization": SqlRuntimeLayer("scan_runtime", "increase_columnar_scan_throughput"),
    }
    return mapping[reason]


if __name__ == "__main__":
    print(explain_sql_speed("catalyst"))
    print(explain_sql_speed("whole_stage_codegen"))
    print(explain_sql_speed("off_heap"))
    print(explain_sql_speed("vectorization"))
