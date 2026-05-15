import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = process.cwd();
const sourceIds = new Set(loadIds(path.join(root, "sources")));
const claimIds = new Set(loadIds(path.join(root, "claims")));

let failures = 0;

for (const dir of ["docs/bigdata", "docs/ai-agent", "docs/llm-foundations", "questions"]) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;

  for (const file of walk(fullDir)) {
    if (!file.endsWith(".md")) continue;
    const data = parseFrontmatter(file);
    if (!data) continue;

    for (const id of normalizeList(data.source_ids)) {
      if (!sourceIds.has(id)) {
        fail(`${relative(file)} references missing source id: ${id}`);
      }
    }

    for (const id of normalizeList(data.claim_ids)) {
      if (!claimIds.has(id)) {
        fail(`${relative(file)} references missing claim id: ${id}`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`reference validation failed with ${failures} issue(s)`);
  process.exit(1);
}

console.log("reference validation passed");

function loadIds(dir) {
  if (!fs.existsSync(dir)) return [];
  const ids = [];
  for (const file of walk(dir)) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const content = fs.readFileSync(file, "utf8");
    const parsed = yaml.load(content);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    for (const row of rows) {
      if (row?.id) ids.push(row.id);
    }
  }
  return ids;
}

function parseFrontmatter(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${relative(file)} is missing frontmatter block`);
    return null;
  }
  return yaml.load(match[1]) ?? {};
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(fullPath));
    else results.push(fullPath);
  }
  return results;
}

function fail(message) {
  failures += 1;
  console.error(message);
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

