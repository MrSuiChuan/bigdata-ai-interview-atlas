import os

from agents import Agent, Runner, function_tool


@function_tool
def lookup_cluster_owner(cluster_name: str) -> str:
    owners = {
        "kafka-prod": "streaming-platform-team",
        "spark-batch": "data-compute-team",
    }
    return owners.get(cluster_name, "unknown")


def main() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is required")

    agent = Agent(
        name="PlatformOpsAssistant",
        instructions=(
            "You help users answer platform ownership questions. "
            "Use tools when you need factual lookup."
        ),
        tools=[lookup_cluster_owner],
    )

    result = Runner.run_sync(agent, "Who owns kafka-prod?")
    print(result.final_output)


if __name__ == "__main__":
    main()

