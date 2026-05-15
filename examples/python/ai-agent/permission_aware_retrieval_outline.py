from dataclasses import dataclass


@dataclass
class SecureDocument:
    doc_id: str
    tenant_id: str
    group_ids: list[str]
    text: str


def permission_filter(documents: list[SecureDocument], tenant_id: str, user_groups: list[str]) -> list[SecureDocument]:
    visible: list[SecureDocument] = []
    for doc in documents:
        if doc.tenant_id != tenant_id:
            continue
        if set(doc.group_ids).intersection(user_groups):
            visible.append(doc)
    return visible


if __name__ == "__main__":
    docs = [
        SecureDocument(doc_id="1", tenant_id="tenant-a", group_ids=["g1", "g2"], text="Kafka 内部文档"),
        SecureDocument(doc_id="2", tenant_id="tenant-b", group_ids=["g3"], text="Spark 内部文档"),
    ]
    print(permission_filter(docs, tenant_id="tenant-a", user_groups=["g2"]))