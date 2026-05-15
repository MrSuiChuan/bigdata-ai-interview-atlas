from dataclasses import dataclass


@dataclass
class ToolSurface:
    name: str
    execution_locus: str
    visible_to_model_up_front: bool


def classify_tool(name: str) -> ToolSurface:
    if name in {"WebSearchTool", "FileSearchTool", "CodeInterpreterTool"}:
        return ToolSurface(name=name, execution_locus="openai_hosted", visible_to_model_up_front=True)
    if name == "ToolSearchTool":
        return ToolSurface(name=name, execution_locus="openai_hosted", visible_to_model_up_front=True)
    if name in {"ComputerTool", "ApplyPatchTool"}:
        return ToolSurface(name=name, execution_locus="local_runtime", visible_to_model_up_front=True)
    return ToolSurface(name=name, execution_locus="custom_or_nested", visible_to_model_up_front=True)


def deferred_loading_rule(tool_count: int) -> str:
    if tool_count > 20:
        return "prefer_tool_search_or_namespaces_to_reduce_schema_surface"
    return "direct_exposure_may_be_acceptable"


if __name__ == "__main__":
    print(classify_tool("WebSearchTool"))
    print(classify_tool("ComputerTool"))
    print(deferred_loading_rule(50))
