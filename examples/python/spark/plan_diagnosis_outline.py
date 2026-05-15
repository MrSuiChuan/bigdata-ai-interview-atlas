from dataclasses import dataclass


@dataclass
class ExplainGoal:
    mode: str
    question_answered: str


def explain_mode_for_goal(goal: str) -> ExplainGoal:
    if goal == "see_estimates":
        return ExplainGoal(mode="cost", question_answered="what_the_optimizer_estimates")
    if goal == "see_codegen":
        return ExplainGoal(mode="codegen", question_answered="whether_generated_code_exists")
    if goal == "see_structure":
        return ExplainGoal(mode="formatted", question_answered="operator_outline_and_node_details")
    return ExplainGoal(mode="extended", question_answered="logical_and_physical_plan_changes")


def diagnosis_path() -> list[str]:
    return [
        "describe_extended_for_object_stats",
        "explain_cost_for_static_estimates",
        "sql_ui_statistics_isRuntime_true_for_runtime_evidence",
    ]


if __name__ == "__main__":
    print(explain_mode_for_goal("see_structure"))
    print(diagnosis_path())
