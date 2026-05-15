from dataclasses import dataclass, field


@dataclass
class MemoryStack:
    short_term_context: list[str] = field(default_factory=list)
    long_term_memory: list[str] = field(default_factory=list)
    external_knowledge_source: str = "vector-index://docs"


if __name__ == "__main__":
    memory = MemoryStack(
        short_term_context=["当前任务: 生成部署方案", "用户偏好: 偏中文输出"],
        long_term_memory=["历史上用户偏好图解式答案", "曾经拒绝过过度自动删除动作"],
    )
    print(memory)