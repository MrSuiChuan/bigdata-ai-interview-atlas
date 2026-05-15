import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve("docs");

const zh = {
  knowledgeSupplement: "\u77e5\u8bc6\u89e3\u8bfb\u8865\u5145",
  whatProblem: "\u5b83\u89e3\u51b3\u4ec0\u4e48\u95ee\u9898",
  coreObjectsState: "\u6838\u5fc3\u5bf9\u8c61\u4e0e\u72b6\u6001",
  mechanismPath: "\u6838\u5fc3\u673a\u5236\u548c\u6267\u884c\u94fe\u8def",
  boundaries: "\u8fb9\u754c\u4e0e\u4e0d\u4fdd\u8bc1\u4e8b\u9879",
  troubleshooting: "\u751f\u4ea7\u6392\u969c\u5165\u53e3",
  deepSupplement: "\u6df1\u5ea6\u89e3\u8bfb\u8865\u5145",
  stateChecklist: "\u72b6\u6001\u68c0\u67e5\u6e05\u5355",
  perfCapacity: "\u6027\u80fd\u548c\u5bb9\u91cf\u5224\u65ad",
  governanceBoundary: "\u6cbb\u7406\u548c\u5b89\u5168\u8fb9\u754c",
  exampleUnderstanding: "\u793a\u4f8b\u5316\u7406\u89e3",
  example: "\u793a\u4f8b",
  solveProblem: "\u89e3\u51b3\u4ec0\u4e48\u95ee\u9898",
  technicalBoundary: "\u5b9a\u4f4d\u4e0e\u6280\u672f\u8fb9\u754c",
  coreMechanism: "\u6838\u5fc3\u673a\u5236",
  runtimeState: "\u8fd0\u884c\u94fe\u8def\u4e0e\u72b6\u6001\u53d8\u5316",
  topicExpandPrefix: "\u4e3b\u9898\u5c55\u5f00\uff1a",
  mechanismInterpretationSuffix: "\u7684\u673a\u5236\u89e3\u8bfb",
  topicEntry: "\u4e3b\u9898\u5207\u5165\u70b9",
  realPath: "\u5148\u770b\u771f\u5b9e\u8fd0\u884c\u8def\u5f84",
  componentLearningLine: "\u672c\u7ec4\u4ef6\u7684\u5b66\u4e60\u4e3b\u7ebf",
  learningLine: "\u5b66\u4e60\u4e3b\u7ebf",
  structuredReadingHint: "\u7ed3\u6784\u5316\u9605\u8bfb\u63d0\u793a",
};

const aiAndLlmTemplateHeadings = new Set([
  zh.knowledgeSupplement,
  zh.whatProblem,
  zh.coreObjectsState,
  zh.mechanismPath,
  zh.boundaries,
  zh.troubleshooting,
  zh.deepSupplement,
  zh.stateChecklist,
  zh.perfCapacity,
  zh.governanceBoundary,
  zh.exampleUnderstanding,
]);

const genericExampleSnippets = [
  "\u8bb0\u5f55\u6bcf\u4e00\u6b65 tool call \u7684\u8f93\u5165",
  "\u5148\u56fa\u5b9a\u8bc4\u4f30\u96c6\uff0c\u518d\u6bd4\u8f83\u6a21\u578b",
  "\u4e3b\u9898\uff1a",
  "\u73b0\u8c61\uff1a\u5148\u63cf\u8ff0\u7528\u6237\u53ef\u611f\u77e5\u7684\u95ee\u9898",
  "\u5b9a\u4f4d\uff1a\u786e\u8ba4\u95ee\u9898\u5c5e\u4e8e\u63a7\u5236\u9762",
];

const genericParagraphPatterns = [
  /本页聚焦“[^”]+”。学习这一页时，应先把主题放回[^。\n]+。[^。\n]+不能只停留在术语层面。\n?/g,
  /本页聚焦“[^”]+”。学习这一页时，应先把主题放回[\s\S]*?(?=\n\n|^###\s+|^##\s+|$)/gm,
  /如果把这些边界混在一起，常见后果是：把性能症状当成根因，把执行层问题误判为存储层问题，或者把上层业务语义误认为组件自身已经保证。\n?/g,
  /这些对象不应孤立记忆。更可靠的理解方式是把它们放到“请求进入、状态变化、结果可见、失败恢复”这条链路中：入口对象负责接收请求，控制面对象负责计划或协调，数据面对象负责读写或计算，元数据对象负责描述可见状态，维护任务负责修正长期运行后的物理布局或状态漂移。\n?/g,
  /写入路径需要重点检查三件事：第一，请求在进入组件后由谁接管；第二，哪些状态会被同步写入或异步维护；第三，客户端看到成功时，哪些结果已经具备可见性，哪些后台工作只是后续优化。\n?/g,
  /读取路径要避免只看 API 名称。更完整的链路是：先确定元数据或调度入口，再确定数据切分方式，然后分析执行单元如何读取、过滤、聚合、返回结果。对分析型系统尤其要关注裁剪能力、并行度、网络传输和内存边界。\n?/g,
  /状态变化通常分为控制面状态、数据面状态和外部依赖状态。生产环境中的故障定位必须先判断状态属于哪一层，再决定看日志、指标、执行计划、文件布局还是元数据。\n?/g,
  /状态变化通常分为控制面状态、数据面状态、元数据状态和外部依赖状态。生产环境中的故障定位必须先判断状态属于哪一层，再决定看日志、指标、执行计划、文件布局还是元数据。\n?/g,
  /学习[^。\n]+时不要先背术语清单，而要先把入口、状态变化、可见性和失败恢复串起来。只要能说明一次请求或任务如何进入系统、经过哪些控制面和数据面对象、在哪里形成状态、失败后如何恢复、结果什么时候可见，才算真正理解了这一页。\n?/g,
];

const genericLinkSectionPattern =
  /## 本页需要串起来的链路\n\n入口：确认请求、作业、SQL、后台任务或管理命令从哪里进入系统。\n对象：把参与对象按控制面、数据面、元数据面和外部依赖分类。\n链路：描述请求如何推进、状态如何变化、结果何时可见。\n边界：明确组件保证什么，不保证什么，以及调用方需要承担什么。\n证据：用指标、日志、元数据、执行计划或命令行形成可复核判断。\n?/g;

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

function splitByH3(sectionText) {
  const matches = [...sectionText.matchAll(/^###\s+(.+)$/gm)];
  if (matches.length === 0) return { preface: sectionText, sections: [] };

  const preface = sectionText.slice(0, matches[0].index);
  const sections = matches.map((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : sectionText.length;
    return {
      heading: match[1].trim(),
      text: sectionText.slice(start, end),
    };
  });
  return { preface, sections };
}

function stripAiAndLlmTemplateSections(file, body) {
  const normalizedPath = file.split(path.sep).join("/");
  if (!normalizedPath.includes("/ai-agent/") && !normalizedPath.includes("/llm-foundations/")) {
    return body;
  }

  const { preface, sections } = splitByH2(body);
  const keptSections = sections.filter((section) => {
    if (aiAndLlmTemplateHeadings.has(section.heading)) return false;
    if (section.heading === zh.example) {
      return !genericExampleSnippets.some((snippet) => section.text.includes(snippet));
    }
    return true;
  });
  return `${preface}${keptSections.map((section) => section.text).join("")}`;
}

function stripGenericParagraphs(body) {
  let next = body.replace(genericLinkSectionPattern, "");
  for (const pattern of genericParagraphPatterns) {
    next = next.replace(pattern, "");
  }
  return next;
}

function renameOldBigDataTemplateHeadings(file, body) {
  const normalizedPath = file.split(path.sep).join("/");
  if (!normalizedPath.includes("/bigdata/") || normalizedPath.includes("/bigdata/spark/")) {
    return body;
  }

  return body
    .replace(new RegExp(`^## ${escapeRegExp(zh.solveProblem)}$`, "gm"), `## ${zh.technicalBoundary}`)
    .replace(new RegExp(`^## ${escapeRegExp(zh.coreMechanism)}$`, "gm"), `## ${zh.runtimeState}`)
    .replace(new RegExp(`^## ${escapeRegExp(zh.topicExpandPrefix)}(.+)$`, "gm"), `## $1 ${zh.mechanismInterpretationSuffix}`)
    .replace(new RegExp(`^### ${escapeRegExp(zh.topicEntry)}$`, "gm"), `### ${zh.realPath}`)
    .replace(new RegExp(`^### ${escapeRegExp(zh.componentLearningLine)}$`, "gm"), `### ${zh.learningLine}`);
}

function stripRepeatedReadingHint(body) {
  const { preface, sections } = splitByH2(body);
  const nextSections = sections.map((section) => {
    const h3 = splitByH3(section.text);
    if (h3.sections.length === 0) return section.text;
    const keptH3 = h3.sections.filter((subsection) => subsection.heading !== zh.structuredReadingHint);
    return `${h3.preface}${keptH3.map((subsection) => subsection.text).join("")}`;
  });
  return `${preface}${nextSections.join("")}`;
}

function stripBigDataGeneratedMechanismSection(file, body) {
  const normalizedPath = file.split(path.sep).join("/");
  if (!normalizedPath.includes("/bigdata/") || normalizedPath.includes("/bigdata/spark/")) {
    return body;
  }

  const { preface, sections } = splitByH2(body);
  const keptSections = sections.filter((section) => {
    const isGeneratedMechanism = section.heading.endsWith(` ${zh.mechanismInterpretationSuffix}`);
    if (!isGeneratedMechanism) return true;
    return !(
      section.text.includes(zh.realPath) ||
      section.text.includes("\u672c\u4e3b\u9898\u7684\u673a\u5236\u94fe\u8def") ||
      section.text.includes("\u5e38\u89c1\u8bef\u5224")
    );
  });
  return `${preface}${keptSections.map((section) => section.text).join("")}`;
}

function normalizeBlankLines(body) {
  return body
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trimEnd();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let changed = 0;
const changedFiles = [];

for (const file of walkMarkdownFiles(docsRoot)) {
  const original = fs.readFileSync(file, "utf8");
  const frontmatterMatch = original.match(/^---\n[\s\S]*?\n---\n?/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : "";
  const body = frontmatter ? original.slice(frontmatter.length) : original;

  let nextBody = body;
  nextBody = stripAiAndLlmTemplateSections(file, nextBody);
  nextBody = stripGenericParagraphs(nextBody);
  nextBody = renameOldBigDataTemplateHeadings(file, nextBody);
  nextBody = stripRepeatedReadingHint(nextBody);
  nextBody = stripBigDataGeneratedMechanismSection(file, nextBody);
  nextBody = normalizeBlankLines(nextBody);

  const next = `${frontmatter}${nextBody}\n`;
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
    changedFiles.push(path.relative(process.cwd(), file));
  }
}

console.log(JSON.stringify({ changed, changedFiles }, null, 2));
