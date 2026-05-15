import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { URL, fileURLToPath } from "node:url";
import yaml from "js-yaml";

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const contentDirs = {
  docs: path.join(rootDir, "docs"),
  questions: path.join(rootDir, "questions"),
  claims: path.join(rootDir, "claims"),
  sources: path.join(rootDir, "sources"),
};

const server = http.createServer((req, res) => {
  try {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    route(url, res);
  } catch (error) {
    sendJson(res, 500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Content service listening on http://${HOST}:${PORT}`);
});

function route(url, res) {
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "content-service",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (pathname === "/api") {
    sendJson(res, 200, {
      service: "content-service",
      endpoints: [
        "/health",
        "/api/docs",
        "/api/docs/:kb_id",
        "/api/questions",
        "/api/questions/:id",
        "/api/claims",
        "/api/sources",
      ],
    });
    return;
  }

  if (pathname === "/api/docs") {
    sendJson(res, 200, { items: readMarkdownCollection(contentDirs.docs, "kb_id") });
    return;
  }

  if (pathname.startsWith("/api/docs/")) {
    const id = pathname.slice("/api/docs/".length);
    const item = readMarkdownCollection(contentDirs.docs, "kb_id").find((doc) => doc.kb_id === id);
    if (!item) {
      sendJson(res, 404, { error: "Document not found", id });
      return;
    }
    sendJson(res, 200, item);
    return;
  }

  if (pathname === "/api/questions") {
    sendJson(res, 200, { items: readMarkdownCollection(contentDirs.questions, "id") });
    return;
  }

  if (pathname.startsWith("/api/questions/")) {
    const id = pathname.slice("/api/questions/".length);
    const item = readMarkdownCollection(contentDirs.questions, "id").find((question) => question.id === id);
    if (!item) {
      sendJson(res, 404, { error: "Question not found", id });
      return;
    }
    sendJson(res, 200, item);
    return;
  }

  if (pathname === "/api/claims") {
    sendJson(res, 200, { items: readYamlCollection(contentDirs.claims) });
    return;
  }

  if (pathname === "/api/sources") {
    sendJson(res, 200, { items: readYamlCollection(contentDirs.sources) });
    return;
  }

  sendJson(res, 404, { error: "Not found", path: pathname });
}

function readMarkdownCollection(dir, keyField) {
  return walk(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => readMarkdownFile(file))
    .filter((item) => item && item[keyField])
    .sort((a, b) => String(a[keyField]).localeCompare(String(b[keyField]), "zh-Hans-CN"));
}

function readMarkdownFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  let frontmatter = {};
  let body = raw;

  if (match) {
    frontmatter = yaml.load(match[1]) ?? {};
    body = match[2];
  }

  return {
    ...frontmatter,
    body,
    filePath: normalizePath(path.relative(rootDir, file)),
  };
}

function readYamlCollection(dir) {
  return walk(dir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .flatMap((file) => {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = yaml.load(raw);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      return rows
        .filter(Boolean)
        .map((row) => ({
          ...row,
          filePath: normalizePath(path.relative(rootDir, file)),
        }));
    });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}
