import os

from agents import Agent, Runner, SQLiteSession, function_tool


@function_tool
def lookup_runbook(service_name: str) -> str:
    runbooks = {
        "payments": "https://internal.example/runbooks/payments",
        "orders": "https://internal.example/runbooks/orders",
    }
    return runbooks.get(service_name, "not-found")


def build_triage_agent() -> Agent:
    specialist = Agent(
        name="RunbookSpecialist",
        instructions="Answer only with the most relevant runbook URL.",
        tools=[lookup_runbook],
    )

    return Agent(
        name="OpsTriage",
        instructions=(
            "Handle platform support questions. "
            "If the request is about a production service runbook, hand off to RunbookSpecialist."
        ),
        handoffs=[specialist],
    )


def main() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is required")

    session = SQLiteSession("ops-triage", "sqlite:///agent_sessions.db")
    agent = build_triage_agent()

    result = Runner.run_sync(
        agent,
        "payments service rollback runbook 在哪里？",
        session=session,
    )
    print(result.final_output)


if __name__ == "__main__":
    main()