from dataclasses import dataclass


@dataclass
class LegacyCheckpoint:
    thread_id: str
    customer_id: str
    risk_score: str


@dataclass
class CurrentState:
    thread_id: str
    account_id: str
    risk_score: int
    review_note: str = ""


def migrate_checkpoint(old: LegacyCheckpoint) -> CurrentState:
    return CurrentState(
        thread_id=old.thread_id,
        account_id=old.customer_id,
        risk_score=int(old.risk_score),
        review_note="migrated_from_legacy_schema",
    )


def can_apply_breaking_change(interrupted_threads: int) -> bool:
    return interrupted_threads == 0


if __name__ == "__main__":
    legacy = LegacyCheckpoint(thread_id="t-001", customer_id="c-9", risk_score="7")
    current = migrate_checkpoint(legacy)
    print(current)
    print(can_apply_breaking_change(interrupted_threads=0))
