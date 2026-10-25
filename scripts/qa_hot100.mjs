#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function extractJsonish(path, pattern) {
  const text = read(path);
  const match = text.match(pattern);
  if (!match) {
    throw new Error(`Cannot parse ${path}`);
  }
  return JSON.parse(match[1]);
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

const problems = extractJsonish('src/data/problems.ts', /export const problems: Problem\[\] = (\[[\s\S]*?\n\]);/);
const refinements = extractJsonish('src/data/problemRefinements.ts', /export const problemRefinements: Record<number, ProblemRefinement> = (\{[\s\S]*?\n\});/);
const solutionVariants = extractJsonish('src/data/solutionVariants.ts', /export const solutionVariants: Record<number, SolutionVariant\[\]> = (\{[\s\S]*?\n\});/);
const learningPathText = read('src/data/learningPath.ts');
const issues = [];

const ids = problems.map((problem) => problem.id);
const leetcodeIds = problems.map((problem) => problem.leetcodeId);
const slugs = problems.map((problem) => problem.slug);

if (problems.length !== 100) issues.push(`题目数量不是 100：${problems.length}`);
for (const [label, values] of [['id', ids], ['leetcodeId', leetcodeIds], ['slug', slugs]]) {
  const repeated = duplicates(values);
  if (repeated.length) issues.push(`${label} 重复：${repeated.join(', ')}`);
}

const pathIds = [...learningPathText.matchAll(/problemIds:\s*\[([^\]]*)\]/g)]
  .flatMap((match) => [...match[1].matchAll(/\d+/g)].map((num) => Number(num[0])));
const missingFromPath = [...new Set(ids.filter((id) => !pathIds.includes(id)))].sort((a, b) => a - b);
const extraInPath = [...new Set(pathIds.filter((id) => !ids.includes(id)))].sort((a, b) => a - b);
const duplicatePathIds = duplicates(pathIds);
if (missingFromPath.length) issues.push(`学习路线遗漏题目 id：${missingFromPath.join(', ')}`);
if (extraInPath.length) issues.push(`学习路线包含不存在题目 id：${extraInPath.join(', ')}`);
if (duplicatePathIds.length) issues.push(`学习路线题目重复：${duplicatePathIds.join(', ')}`);

const requiredProblemFields = [
  'summary', 'learningGoal', 'whyThisPattern', 'bruteForceIdea',
  'optimizedIdea', 'pseudocode', 'solutionCode',
];

for (const problem of problems) {
  const prefix = `#${problem.id} ${problem.title}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problem.slug)) {
    issues.push(`${prefix} slug 非法：${problem.slug}`);
  }
  if (!problem.externalUrl.includes(problem.slug)) {
    issues.push(`${prefix} externalUrl 与 slug 不一致：${problem.externalUrl}`);
  }
  for (const field of requiredProblemFields) {
    if (String(problem[field] ?? '').trim().length < 20) {
      issues.push(`${prefix} 字段过短或为空：${field}`);
    }
  }
  if ((problem.commonMistakes ?? []).length < 3) issues.push(`${prefix} 常见错误少于 3 条`);
  if ((problem.reviewQuestions ?? []).length < 4) issues.push(`${prefix} 复盘问题少于 4 条`);
  if (!problem.complexity?.time || !problem.complexity?.space) issues.push(`${prefix} 缺少复杂度`);
  if (!/class |def |return |pass/.test(problem.solutionCode ?? '')) issues.push(`${prefix} 参考代码不像可读 Python3.9 代码`);

  const variants = solutionVariants[String(problem.leetcodeId)];
  if (!variants) {
    issues.push(`${prefix} 缺少多解法数据`);
  } else {
    if (variants.length < 2) issues.push(`${prefix} 多解法少于 2 种`);
    if (!variants.some((variant) => variant.badge === '推荐')) issues.push(`${prefix} 多解法缺少推荐解法`);
    for (const [variantIndex, variant] of variants.entries()) {
      for (const field of ['name', 'badge', 'idea', 'time', 'space', 'complexityDetail', 'code']) {
        if (!String(variant[field] ?? '').trim()) issues.push(`${prefix} 解法 ${variantIndex + 1} 缺少字段 ${field}`);
      }
      if (!/class |def |return |from |import /.test(variant.code ?? '')) issues.push(`${prefix} 解法 ${variantIndex + 1} 代码不像 Python3.9`);
    }
  }

  const refinement = refinements[String(problem.leetcodeId)];
  if (!refinement) {
    issues.push(`${prefix} 缺少逐题精修数据`);
    continue;
  }
  if (refinement.slug !== problem.slug) issues.push(`${prefix} 精修 slug 不一致：${refinement.slug}`);
  if (refinement.title !== problem.title) issues.push(`${prefix} 精修标题不一致：${refinement.title}`);
  if ((refinement.handwriteSteps ?? []).length < 4) issues.push(`${prefix} 手撕步骤少于 4 条`);
  if ((refinement.edgeCases ?? []).length < 3) issues.push(`${prefix} 边界样例少于 3 条`);
  if ((refinement.commonPitfalls ?? []).length < 3) issues.push(`${prefix} 常见坑少于 3 条`);
  if ((refinement.interviewChecklist ?? []).length < 4) issues.push(`${prefix} 面试检查单少于 4 条`);
  for (const [index, edgeCase] of (refinement.edgeCases ?? []).entries()) {
    for (const field of ['input', 'expected', 'why']) {
      if (!edgeCase[field]) issues.push(`${prefix} 边界样例 ${index + 1} 缺少 ${field}`);
    }
  }
  if (!/class |def |return |pass/.test(refinement.annotatedCode ?? '')) issues.push(`${prefix} 精修代码不像可读 Python3.9 代码`);
}

if (issues.length) {
  console.log('QA FAILED');
  for (const issue of issues) console.log(`- ${issue}`);
  process.exit(1);
}

console.log('QA PASSED');
console.log(`- problems: ${problems.length}`);
console.log(`- refinements: ${Object.keys(refinements).length}`);
console.log(`- route ids: ${pathIds.length}`);
console.log(`- unique slugs: ${new Set(slugs).size}`);
console.log(`- solution variants: ${Object.values(solutionVariants).reduce((sum, items) => sum + items.length, 0)}`);
console.log('- teaching fields, edge cases and solution snippets: present');
