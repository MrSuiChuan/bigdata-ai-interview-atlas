from dataclasses import dataclass


@dataclass
class WatermarkCleanupRule:
    output_mode: str
    same_event_time_column: bool
    watermark_before_aggregation: bool


def can_cleanup_aggregation_state(rule: WatermarkCleanupRule) -> bool:
    if rule.output_mode not in {"append", "update"}:
        return False
    if not rule.same_event_time_column:
        return False
    return rule.watermark_before_aggregation


def late_data_guarantee(delay_hours: int, lateness_hours: int) -> str:
    if lateness_hours <= delay_hours:
        return "guaranteed_not_dropped"
    return "may_or_may_not_be_processed"


if __name__ == "__main__":
    print(
        can_cleanup_aggregation_state(
            WatermarkCleanupRule(
                output_mode="append",
                same_event_time_column=True,
                watermark_before_aggregation=True,
            )
        )
    )
    print(late_data_guarantee(delay_hours=2, lateness_hours=3))
