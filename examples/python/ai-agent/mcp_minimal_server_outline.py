import json
import sys


TOOLS = [
    {
        "name": "lookup_cluster_owner",
        "description": "根据集群名查询负责团队",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cluster_name": {"type": "string"}
            },
            "required": ["cluster_name"],
        },
    }
]


def handle_request(message: dict) -> dict:
    method = message.get("method")
    request_id = message.get("id")

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2025-03-26",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "cluster-owner-server", "version": "0.1.0"},
            },
        }

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": request_id, "result": {"tools": TOOLS}}

    if method == "tools/call":
        args = message["params"]["arguments"]
        cluster_name = args["cluster_name"]
        owner = {
            "kafka-prod": "streaming-platform-team",
            "spark-batch": "data-compute-team",
        }.get(cluster_name, "unknown")
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "content": [{"type": "text", "text": owner}]
            },
        }

    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": -32601, "message": f"Unknown method: {method}"},
    }


for line in sys.stdin:
    request = json.loads(line)
    response = handle_request(request)
    sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
    sys.stdout.flush()