from dataclasses import dataclass, field


@dataclass
class Draft:
    answer: str
    feedback: list[str] = field(default_factory=list)


def critique(answer: str) -> str:
    if "为什么" not in answer:
        return "答案缺少原因解释，应补原理与边界。"
    return "答案基本完整。"


def refine(draft: Draft) -> Draft:
    feedback = critique(draft.answer)
    draft.feedback.append(feedback)
    if "缺少原因解释" in feedback:
        draft.answer += " 其原因在于系统通过显式元数据而不是目录扫描定义状态边界。"
    return draft


if __name__ == "__main__":
    draft = Draft(answer="Iceberg 更适合对象存储。")
    draft = refine(draft)
    print(draft)