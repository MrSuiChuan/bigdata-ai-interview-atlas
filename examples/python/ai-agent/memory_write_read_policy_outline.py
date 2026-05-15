from dataclasses import dataclass


@dataclass
class MemoryItem:
    kind: str
    content: str
    importance: int
    reusable: bool


def should_write_to_long_term(item: MemoryItem) -> bool:
    return item.importance >= 8 and item.reusable


def choose_read_path(question: str) -> str:
    if "用户偏好" in question or "历史选择" in question:
        return "读取长期记忆层"
    if "当前步骤" in question or "执行到哪" in question:
        return "读取短期执行上下文"
    return "优先走外部知识检索层"


if __name__ == "__main__":
    candidate = MemoryItem(
        kind="reflection",
        content="用户更偏好中文、结构化、带原理边界的答案",
        importance=9,
        reusable=True,
    )
    print("是否写入长期记忆:", should_write_to_long_term(candidate))
    print("读取路径:", choose_read_path("这个用户偏好是什么"))
    print("读取路径:", choose_read_path("当前步骤执行到哪了"))
    print("读取路径:", choose_read_path("Kafka ISR 为什么缩小"))