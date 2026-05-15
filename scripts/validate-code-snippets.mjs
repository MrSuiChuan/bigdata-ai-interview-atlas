import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let failures = 0;

for (const dir of ["docs/bigdata", "docs/ai-agent", "docs/llm-foundations", "docs/community"]) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;

  for (const file of walk(fullDir)) {
    if (!file.endsWith(".md")) continue;
    const content = fs.readFileSync(file, "utf8");
    const matches = [...content.matchAll(/`(examples\/[^`]+)`/g)];
    for (const match of matches) {
      const examplePath = match[1];
      const fullPath = path.join(root, examplePath);
      if (!fs.existsSync(fullPath)) {
        fail(`${relative(file)} references missing example file: ${examplePath}`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`example validation failed with ${failures} issue(s)`);
  process.exit(1);
}

console.log("example validation passed");

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
