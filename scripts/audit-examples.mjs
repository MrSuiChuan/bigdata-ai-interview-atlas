import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full, entry.name)) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function countBy(rows, getter) {
  const map = new Map();
  for (const row of rows) {
    const key = getter(row) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

const files = walkFiles(path.join(repoRoot, "examples"));
const conceptual = files.filter((file) => fs.readFileSync(file, "utf8").includes("概念性样例"));
const pythonFiles = files.filter((file) => file.endsWith(".py"));
const sqlFiles = files.filter((file) => file.endsWith(".sql"));
const shellFiles = files.filter((file) => file.endsWith(".sh"));
const pythonCheck = spawnSync("python", ["--version"], { encoding: "utf8" });
const pythonAvailable = pythonCheck.status === 0;

const markdown = [
  "---",
  "kb_id: blueprint/example-quality-audit",
  'title: "样例代码质量审计"',
  "domain: blueprint",
  "component: project",
  "topic: example-quality-audit",
  "difficulty: intermediate",
  "status: reviewed",
  "sidebar_position: 11",
  `version_scope: "Example audit generated on ${today}"`,
  `last_verified_at: "${today}"`,
  "source_ids: []",
  "claim_ids: []",
  "---",
  "",
  "# 结论",
  "",
  "样例代码目前主要问题是概念性样例较多，并且当前环境无法稳定执行 Python 样例校验。样例后续需要分级：概念解释、可本地运行、需要集群、伪代码。",
  "",
  "# 汇总",
  "",
  `1. 样例文件总数：${files.length}`,
  `2. Python 样例：${pythonFiles.length}`,
  `3. SQL 样例：${sqlFiles.length}`,
  `4. Shell 样例：${shellFiles.length}`,
  `5. 概念性样例：${conceptual.length}`,
  `6. 当前环境 Python 可用：${pythonAvailable ? "是" : "否"}`,
  "",
  "# 按扩展名统计",
  "",
  "| 扩展名 | 数量 |",
  "| --- | ---: |",
  ...countBy(files, (file) => path.extname(file) || "无扩展名").map(([name, count]) => `| ${name} | ${count} |`),
  "",
  "# 后续处理规则",
  "",
  "1. 概念性样例必须显式标注 conceptual，不能伪装成生产脚本。",
  "2. Python 样例应尽量能在本地执行，不能执行时要说明依赖和前提。",
  "3. SQL 样例要说明适用引擎、catalog、表格式和执行前提。",
  "4. 大数据组件样例不能只用 dataclass 复述概念，要优先体现真实操作链路。",
  "",
].join("\n");

if (shouldWrite) fs.writeFileSync(path.join(repoRoot, "docs", "blueprint", "example-quality-audit.md"), markdown, "utf8");
console.log(JSON.stringify({ total: files.length, python: pythonFiles.length, sql: sqlFiles.length, shell: shellFiles.length, conceptual: conceptual.length, pythonAvailable }, null, 2));
