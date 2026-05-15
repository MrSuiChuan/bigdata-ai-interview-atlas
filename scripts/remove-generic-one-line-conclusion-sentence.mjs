import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const docsRoot = path.resolve("docs");
const oneLineHeading = "\u4e00\u53e5\u8bdd\u7ed3\u8bba";
const genericTail =
  " \u7684\u6838\u5fc3\u662f\u8bf4\u6e05\u5bf9\u8c61\u3001\u94fe\u8def\u3001\u8fb9\u754c\u548c\u53ef\u590d\u6838\u8bc1\u636e\uff0c\u907f\u514d\u628a\u672f\u8bed\u8bb0\u5fc6\u5f53\u6210\u673a\u5236\u7406\u89e3\u3002";

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

function splitByH2(body) {
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  if (matches.length === 0) return { preface: body, sections: [] };

  const preface = body.slice(0, matches[0].index);
  const sections = matches.map((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    return {
      heading: match[1].trim(),
      text: body.slice(start, end),
    };
  });
  return { preface, sections };
}

function firstMeaningfulParagraph(sectionText) {
  return sectionText
    .replace(/^##\s+.+\n/, "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("###") && !part.startsWith("|") && !part.startsWith("```"));
}

function conclusionFromFrontmatter(frontmatter) {
  const description = String(frontmatter.description || "").trim();
  if (description) return description.replace(/[ \t\r\n]+/g, " ");
  const title = String(frontmatter.title || "").trim();
  if (title) return `${title}\u9700\u8981\u4ece\u5bf9\u8c61\u3001\u94fe\u8def\u3001\u8fb9\u754c\u548c\u8bc1\u636e\u56db\u4e2a\u89d2\u5ea6\u7406\u89e3\u3002`;
  return "\u672c\u9875\u9700\u8981\u56f4\u7ed5\u6838\u5fc3\u5bf9\u8c61\u3001\u8fd0\u884c\u94fe\u8def\u3001\u8fb9\u754c\u6761\u4ef6\u548c\u53ef\u89c2\u6d4b\u8bc1\u636e\u5efa\u7acb\u7406\u89e3\u3002";
}

function repairBody(body, frontmatter) {
  const { preface, sections } = splitByH2(body);
  if (sections.length === 0) return body;

  let changed = false;
  const nextSections = sections.map((section) => {
    if (section.heading !== oneLineHeading) return section.text;

    let text = section.text;
    const lines = text.split(/\r?\n/);
    const filtered = lines.filter((line) => !line.trim().endsWith(genericTail));
    if (filtered.length !== lines.length) {
      text = filtered.join("\n");
      changed = true;
    }

    const paragraph = firstMeaningfulParagraph(text);
    if (!paragraph) {
      text = `## ${oneLineHeading}\n\n${conclusionFromFrontmatter(frontmatter)}\n\n`;
      changed = true;
    }
    return text;
  });

  return changed ? `${preface}${nextSections.join("")}` : body;
}

let changed = 0;
const changedFiles = [];

for (const file of walkMarkdownFiles(docsRoot)) {
  const original = fs.readFileSync(file, "utf8");
  const frontmatterMatch = original.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatterText = frontmatterMatch ? frontmatterMatch[1] : "";
  const frontmatter = frontmatterText ? yaml.load(frontmatterText) || {} : {};
  const bodyStart = frontmatterMatch ? frontmatterMatch[0].length : 0;
  const body = original.slice(bodyStart);
  const nextBody = repairBody(body, frontmatter);

  if (nextBody !== body) {
    fs.writeFileSync(file, `${original.slice(0, bodyStart)}${nextBody}`, "utf8");
    changed += 1;
    changedFiles.push(path.relative(process.cwd(), file));
  }
}

console.log(JSON.stringify({ changed, changedFiles }, null, 2));
