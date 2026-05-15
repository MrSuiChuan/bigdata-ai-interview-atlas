import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve("docs", "bigdata", "spark");
const genericHeadings = [
  "\u5b9a\u4f4d\u4e0e\u8fb9\u754c",
  "\u6838\u5fc3\u5bf9\u8c61",
  "\u6267\u884c\u94fe\u8def",
  "\u72b6\u6001\u3001\u5bb9\u9519\u4e0e\u8fb9\u754c",
  "\u6027\u80fd\u4e0e\u8bca\u65ad",
  "\u8bbe\u8ba1\u53d6\u820d",
  "\u6765\u6e90\u4e0e\u4e8b\u5b9e\u8fb9\u754c",
];

const oldTemplatePhrases = [
  "\u89e3\u51b3\u4ec0\u4e48\u95ee\u9898",
  "\u672c\u9875\u805a\u7126",
  "\u5b66\u4e60\u8fd9\u4e00\u9875\u65f6",
  "\u4e3b\u9898\u5c55\u5f00\uff1a",
  "\u672c\u9875\u9700\u8981\u4e32\u8d77\u6765\u7684\u94fe\u8def",
];

const files = fs
  .readdirSync(rootDir)
  .filter((file) => file.endsWith(".md"))
  .sort();

const rows = files.map((file) => {
  const fullPath = path.join(rootDir, file);
  const text = fs.readFileSync(fullPath, "utf8");
  const headings = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
  const genericHits = genericHeadings.filter((heading) => headings.includes(heading));
  const oldHits = oldTemplatePhrases.filter((phrase) => text.includes(phrase));
  return {
    file,
    genericCount: genericHits.length,
    genericHits,
    oldTemplateCount: oldHits.length,
    oldHits,
    headings,
  };
});

const summary = {
  totalFiles: rows.length,
  severeGenericFiles: rows.filter((row) => row.genericCount >= 5).length,
  moderateGenericFiles: rows.filter((row) => row.genericCount >= 3 && row.genericCount < 5).length,
  oldTemplateFiles: rows.filter((row) => row.oldTemplateCount > 0).length,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
} else {
  console.log(JSON.stringify(summary, null, 2));
  for (const row of rows) {
    if (row.genericCount > 0 || row.oldTemplateCount > 0) {
      console.log(
        `${row.file}\tgeneric=${row.genericCount}\told=${row.oldTemplateCount}\t${row.headings.join(" | ")}`,
      );
    }
  }
}
