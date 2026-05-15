from dataclasses import dataclass
from time import time


@dataclass
class Policy:
    zero_data_retention: bool
    tracing_enabled: bool
    session_ttl_seconds: int


@dataclass
class MemoryItem:
    kind: str
    text: str
    contains_pii: bool
    expires_at: float


def redact_pii(text: str) -> str:
    return text.replace("13800000000", "[PHONE]").replace("alice@example.com", "[EMAIL]")


def prepare_memory_item(raw_text: str, contains_pii: bool, ttl_seconds: int) -> MemoryItem | None:
    if contains_pii:
        return None
    return MemoryItem(
        kind="session_memory",
        text=raw_text,
        contains_pii=False,
        expires_at=time() + ttl_seconds,
    )


def export_trace(policy: Policy, raw_text: str) -> str:
    if policy.zero_data_retention or not policy.tracing_enabled:
        return "tracing disabled by retention policy"
    return redact_pii(raw_text)


if __name__ == "__main__":
    policy = Policy(zero_data_retention=False, tracing_enabled=True, session_ttl_seconds=3600)
    item = prepare_memory_item(
        raw_text="User prefers Spark SQL examples",
        contains_pii=False,
        ttl_seconds=policy.session_ttl_seconds,
    )
    trace_payload = export_trace(policy, "contact alice@example.com or 13800000000")
    print("memory item:", item)
    print("trace payload:", trace_payload)