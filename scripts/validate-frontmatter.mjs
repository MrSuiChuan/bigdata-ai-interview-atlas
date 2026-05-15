import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = process.cwd();
const targets = [
  { dir: "docs/bigdata", required: baseDocFields() },
  { dir: "docs/ai-agent", required: baseDocFields() },
  { dir: "docs/llm-foundations", required: baseDocFields() },
  { dir: "questions", required: baseQuestionFields() },
];

let failures = 0;

for (const target of targets) {
  const fullDir = path.join(root, target.dir);
  if (!fs.existsSync(fullDir)) continue;

  for (const file of walk(fullDir)) {
    if (!file.endsWith(".md")) continue;
    const content = fs.readFileSync(file, "utf8");
    const data = parseFrontmatter(file, content);
    if (!data) continue;

    for (const field of target.required) {
      if (!(field in data)) {
        fail(`${relative(file)} is missing required frontmatter field: ${field}`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`frontmatter validation failed with ${failures} issue(s)`);
  process.exit(1);
}

console.log("frontmatter validation passed");

function baseDocFields() {
  return [
    "kb_id",
    "title",
    "domain",
    "component",
    "topic",
    "difficulty",
    "status",
    "version_scope",
    "last_verified_at",
    "source_ids",
    "claim_ids",
  ];
}

function baseQuestionFields() {
  return [
    "id",
    "title",
    "domain",
    "component",
    "topic",
    "question_type",
    "difficulty",
    "status",
    "version_scope",
    "last_verified_at",
    "source_ids",
    "claim_ids",
  ];
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

function parseFrontmatter(file, content) {
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${relative(file)} is missing frontmatter block`);
    return null;
  }

  try {
    return yaml.load(match[1]) ?? {};
  } catch (error) {
    fail(`${relative(file)} has invalid YAML frontmatter: ${error.message}`);
    return null;
  }
}

function fail(message) {
  failures += 1;
  console.error(message);
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

