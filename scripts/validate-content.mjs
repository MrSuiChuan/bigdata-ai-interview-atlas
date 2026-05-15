import { execSync } from "node:child_process";

const scripts = [
  "node scripts/validate-frontmatter.mjs",
  "node scripts/validate-references.mjs",
  "node scripts/validate-code-snippets.mjs",
];

for (const command of scripts) {
  execSync(command, { stdio: "inherit" });
}

console.log("all content validation checks passed");

