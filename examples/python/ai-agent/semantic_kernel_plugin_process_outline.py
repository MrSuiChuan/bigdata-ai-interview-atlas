"""
Semantic Kernel 概念性示例。

重点展示：
1. Kernel 作为中心容器
2. Plugin 作为能力接入层
3. Process 作为确定性业务流程骨架
"""

from dataclasses import dataclass, field


@dataclass
class Kernel:
    plugins: dict = field(default_factory=dict)

    def add_plugin(self, name: str, plugin: object) -> None:
        self.plugins[name] = plugin


class TicketPlugin:
    def create_ticket(self, title: str) -> str:
        return f"ticket://{title}"


@dataclass
class ProcessState:
    request: str
    ticket_uri: str | None = None


if __name__ == "__main__":
    kernel = Kernel()
    kernel.add_plugin("ticketing", TicketPlugin())

    state = ProcessState(request="创建异常告警工单")
    state.ticket_uri = kernel.plugins["ticketing"].create_ticket("alert-2026-04-24")
    print(state)