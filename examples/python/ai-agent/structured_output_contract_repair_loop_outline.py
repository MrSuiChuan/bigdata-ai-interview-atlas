from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class AnswerContract:
    topic: str
    key_point: str
    confidence: float


REQUIRED_FIELDS = {
    "topic": str,
    "key_point": str,
    "confidence": float,
}


def validate_payload(payload: Dict[str, Any]) -> Optional[str]:
    for field_name, field_type in REQUIRED_FIELDS.items():
        if field_name not in payload:
            return f"missing field: {field_name}"
        if not isinstance(payload[field_name], field_type):
            return f"invalid type for {field_name}"
    return None


def repair_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    repaired = dict(payload)
    repaired.setdefault("topic", "unknown")
    repaired.setdefault("key_point", "needs manual review")
    if "confidence" in repaired:
        repaired["confidence"] = float(repaired["confidence"])
    else:
        repaired["confidence"] = 0.0
    return repaired


def to_contract(payload: Dict[str, Any]) -> AnswerContract:
    error = validate_payload(payload)
    if error:
        payload = repair_payload(payload)
        error = validate_payload(payload)
        if error:
            raise ValueError(error)
    return AnswerContract(**payload)


if __name__ == "__main__":
    raw_output = {"topic": "Kafka", "key_point": "rebalance changes partition ownership", "confidence": "0.82"}
    print(to_contract(raw_output))