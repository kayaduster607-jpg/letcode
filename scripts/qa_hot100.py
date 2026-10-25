#!/usr/bin/env python3
"""Static QA checks for the Hot100 teaching dataset and learning route."""

from __future__ import annotations

import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def extract_jsonish(path: Path, pattern: str):
    text = path.read_text(encoding='utf-8')
    match = re.search(pattern, text, re.S)
    if not match:
        raise AssertionError(f'Cannot parse {path}')
    return json.loads(match.group(1))


def main() -> None:
    problems = extract_jsonish(
        ROOT / 'src/data/problems.ts',
        r'export const problems: Problem\[\] = (\[.*\n\]);',
    )
    refinements = extract_jsonish(
        ROOT / 'src/data/problemRefinements.ts',
        r'export const problemRefinements: Record<number, ProblemRefinement> = (\{.*\n\});',
    )
    learning_path_text = (ROOT / 'src/data/learningPath.ts').read_text(encoding='utf-8')

    issues: list[str] = []
    ids = [p['id'] for p in problems]
    leetcode_ids = [p['leetcodeId'] for p in problems]
    slugs = [p['slug'] for p in problems]

    if len(problems) != 100:
      issues.append(f'题目数量不是 100：{len(problems)}')

    for label, values in [('id', ids), ('leetcodeId', leetcode_ids), ('slug', slugs)]:
        duplicates = sorted({value for value in values if values.count(value) > 1})
        if duplicates:
            issues.append(f'{label} 重复：{duplicates}')

    path_ids: list[int] = []
    for group in re.findall(r'problemIds:\s*\[([^\]]*)\]', learning_path_text):
        path_ids.extend(int(num) for num in re.findall(r'\d+', group))

    missing_from_path = sorted(set(ids) - set(path_ids))
    extra_in_path = sorted(set(path_ids) - set(ids))
    duplicate_path_ids = sorted({value for value in path_ids if path_ids.count(value) > 1})
    if missing_from_path:
        issues.append(f'学习路线遗漏题目 id：{missing_from_path}')
    if extra_in_path:
        issues.append(f'学习路线包含不存在题目 id：{extra_in_path}')
    if duplicate_path_ids:
        issues.append(f'学习路线题目重复：{duplicate_path_ids}')

    required_problem_fields = [
        'summary', 'learningGoal', 'whyThisPattern', 'bruteForceIdea',
        'optimizedIdea', 'pseudocode', 'solutionCode',
    ]

    for problem in problems:
        prefix = f"#{problem['id']} {problem['title']}"
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', problem['slug']):
            issues.append(f"{prefix} slug 非法：{problem['slug']}")
        if problem['slug'] not in problem['externalUrl']:
            issues.append(f"{prefix} externalUrl 与 slug 不一致：{problem['externalUrl']}")
        for field in required_problem_fields:
            if len(str(problem.get(field, '')).strip()) < 20:
                issues.append(f'{prefix} 字段过短或为空：{field}')
        if len(problem.get('commonMistakes', [])) < 3:
            issues.append(f'{prefix} 常见错误少于 3 条')
        if len(problem.get('reviewQuestions', [])) < 4:
            issues.append(f'{prefix} 复盘问题少于 4 条')
        complexity = problem.get('complexity', {})
        if not complexity.get('time') or not complexity.get('space'):
            issues.append(f'{prefix} 缺少复杂度')
        try:
            ast.parse(problem.get('solutionCode', ''), feature_version=(3, 9))
        except SyntaxError as exc:
            issues.append(f'{prefix} 参考代码 Python3.9 语法错误：line {exc.lineno} {exc.msg}')

        refinement = refinements.get(str(problem['leetcodeId']))
        if not refinement:
            issues.append(f'{prefix} 缺少逐题精修数据')
            continue
        if refinement['slug'] != problem['slug']:
            issues.append(f"{prefix} 精修 slug 不一致：{refinement['slug']}")
        if refinement['title'] != problem['title']:
            issues.append(f"{prefix} 精修标题不一致：{refinement['title']}")
        if len(refinement.get('handwriteSteps', [])) < 4:
            issues.append(f'{prefix} 手撕步骤少于 4 条')
        if len(refinement.get('edgeCases', [])) < 3:
            issues.append(f'{prefix} 边界样例少于 3 条')
        if len(refinement.get('commonPitfalls', [])) < 3:
            issues.append(f'{prefix} 常见坑少于 3 条')
        if len(refinement.get('interviewChecklist', [])) < 4:
            issues.append(f'{prefix} 面试检查单少于 4 条')
        for index, edge_case in enumerate(refinement.get('edgeCases', []), start=1):
            for field in ['input', 'expected', 'why']:
                if not edge_case.get(field):
                    issues.append(f'{prefix} 边界样例 {index} 缺少 {field}')
        try:
            ast.parse(refinement.get('annotatedCode', ''), feature_version=(3, 9))
        except SyntaxError as exc:
            issues.append(f'{prefix} 精修代码 Python3.9 语法错误：line {exc.lineno} {exc.msg}')

    if issues:
        print('QA FAILED')
        for issue in issues:
            print('-', issue)
        raise SystemExit(1)

    print('QA PASSED')
    print(f'- problems: {len(problems)}')
    print(f'- refinements: {len(refinements)}')
    print(f'- route ids: {len(path_ids)}')
    print(f'- unique slugs: {len(set(slugs))}')
    print('- code snippets: Python3.9 AST parse passed')


if __name__ == '__main__':
    main()
