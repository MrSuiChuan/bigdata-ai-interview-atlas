from dataclasses import dataclass, field


@dataclass
class QueryBundle:
    raw_query: str
    rewritten_query: str = ""
    hypothetical_document: str = ""
    retrieved_documents: list[str] = field(default_factory=list)


def rewrite_query(raw_query: str) -> str:
    return f"请把问题改写成更接近文档表达的检索请求: {raw_query}"


def build_hypothetical_document(rewritten_query: str) -> str:
    return (
        "这是一篇仅用于检索的假想说明文档，"
        f"它围绕问题展开: {rewritten_query}"
    )


def retrieve_real_documents(hypothetical_document: str) -> list[str]:
    return [
        f"真实文档候选 A <- 由假想文档触发检索: {hypothetical_document}",
        "真实文档候选 B <- 来自知识库",
    ]


def run_hyde_pipeline(raw_query: str) -> QueryBundle:
    bundle = QueryBundle(raw_query=raw_query)
    bundle.rewritten_query = rewrite_query(raw_query)
    bundle.hypothetical_document = build_hypothetical_document(bundle.rewritten_query)
    bundle.retrieved_documents = retrieve_real_documents(bundle.hypothetical_document)
    return bundle


if __name__ == "__main__":
    result = run_hyde_pipeline("Kafka Consumer Group 为什么并行度受分区数限制")
    print(result)