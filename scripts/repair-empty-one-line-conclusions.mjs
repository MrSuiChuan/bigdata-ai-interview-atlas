import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const docsRoot = path.resolve("docs");
const oneLineHeading = "\u4e00\u53e5\u8bdd\u7ed3\u8bba";
const sentenceStop = /[。！？.!?]/;

function walkMarkdownFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        walkMarkdownFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function firstSentence(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const index = [...normalized].findIndex((char) => sentenceStop.test(char));
  return index >= 0 ? [...normalized].slice(0, index + 1).join("") : normalized;
}

function buildConclusion(frontmatter, relativePath) {
  const title = String(frontmatter.title || path.basename(relativePath, ".md")).trim();
  const description = firstSentence(frontmatter.description);
  if (description) return description;
  return `${title} \u7684\u6838\u5fc3\u662f\u8bf4\u6e05\u5bf9\u8c61\u3001\u94fe\u8def\u3001\u8fb9\u754c\u548c\u53ef\u590d\u6838\u8bc1\u636e\uff0c\u907f\u514d\u628a\u672f\u8bed\u8bb0\u5fc6\u5f53\u6210\u673a\u5236\u7406\u89e3\u3002`;
}

function repairFile(file) {
  const original = fs.readFileSync(file, "utf8");
  const frontmatterMatch = original.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatterText = frontmatterMatch ? frontmatterMatch[1] : "";
  const frontmatter = frontmatterText ? yaml.load(frontmatterText) || {} : {};
  const bodyStart = frontmatterMatch ? frontmatterMatch[0].length : 0;
  const body = original.slice(bodyStart);
  const headingPattern = new RegExp(`^## ${oneLineHeading}\\n([\\s\\S]*?)(?=^##\\s+|$)`, "m");
  const match = body.match(headingPattern);
  if (!match) return false;

  const current = match[1].trim();
  if (current) return false;

  const relativePath = path.relative(process.cwd(), file);
  const conclusion = buildConclusion(frontmatter, relativePath);
  const repairedSection = `## ${oneLineHeading}\n\n${conclusion}\n\n`;
  const nextBody = body.replace(match[0], repairedSection);
  fs.writeFileSync(file, `${original.slice(0, bodyStart)}${nextBody}`, "utf8");
  return true;
}

const changedFiles = [];
for (const file of walkMarkdownFiles(docsRoot)) {
  if (repairFile(file)) {
    changedFiles.push(path.relative(process.cwd(), file));
  }
}

console.log(JSON.stringify({ changed: changedFiles.length, changedFiles }, null, 2));
