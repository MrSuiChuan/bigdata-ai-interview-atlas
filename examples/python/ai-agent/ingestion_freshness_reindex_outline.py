from dataclasses import dataclass
from datetime import datetime


@dataclass
class SourceDocument:
    doc_id: str
    last_modified: datetime
    deleted: bool = False


@dataclass
class IndexerState:
    high_water_mark: datetime | None
    reset_requested: bool = False


def should_incrementally_index(document: SourceDocument, state: IndexerState) -> bool:
    if state.high_water_mark is None:
        return True
    return document.last_modified > state.high_water_mark


def requires_full_reindex(schema_changed: bool, reset_requested: bool) -> bool:
    return schema_changed or reset_requested


if __name__ == "__main__":
    state = IndexerState(high_water_mark=datetime(2026, 4, 25, 9, 0, 0))
    doc = SourceDocument(doc_id="kafka-doc", last_modified=datetime(2026, 4, 25, 9, 30, 0))
    print("是否进入增量索引:", should_incrementally_index(doc, state))
    print("是否需要 full reindex:", requires_full_reindex(schema_changed=True, reset_requested=False))