import ast
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def extract_json_array(path: Path, marker: str) -> list:
    text = path.read_text(encoding="utf-8")
    marker_index = text.index(marker)
    start = text.index("[", marker_index + len(marker))
    end = text.rindex("];")
    return json.loads(text[start : end + 1])


def extract_json_object(path: Path, marker: str) -> dict:
    text = path.read_text(encoding="utf-8")
    marker_index = text.index(marker)
    start = text.index("{", marker_index + len(marker))
    end = text.index("\n};", start)
    return json.loads(text[start : end + 2])


def normalize_code(code: str) -> str:
    code = code.replace("\r\n", "\n").strip()
    if not code:
        return code
    return code


def is_annotation_node(node: ast.AST, parent_map: dict[ast.AST, ast.AST]) -> bool:
    current = node
    while current in parent_map:
        parent = parent_map[current]
        if isinstance(parent, ast.arg) and parent.annotation is current:
            return True
        if isinstance(parent, ast.AnnAssign) and parent.annotation is current:
            return True
        if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)) and parent.returns is current:
            return True
        current = parent
    return False


def call_name(node: ast.Call) -> str:
    func = node.func
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        parts = [func.attr]
        value = func.value
        while isinstance(value, ast.Attribute):
            parts.append(value.attr)
            value = value.value
        if isinstance(value, ast.Name):
            parts.append(value.id)
        return ".".join(reversed(parts))
    return ""


def check_code(code: str) -> list[str]:
    issues: list[str] = []
    code = normalize_code(code)
    if not code:
        return ["代码为空"]

    try:
        tree = ast.parse(code, feature_version=(3, 9))
    except SyntaxError as exc:
        return [f"不是 Python3.9 语法：line {exc.lineno}, {exc.msg}"]

    parent_map: dict[ast.AST, ast.AST] = {}
    for parent in ast.walk(tree):
        for child in ast.iter_child_nodes(parent):
            parent_map[child] = parent

    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr) and is_annotation_node(node, parent_map):
            issues.append("类型注解使用了 X | Y；Python3.9 请改成 Optional[...] 或 Union[...]")

        if isinstance(node, ast.Call):
            name = call_name(node)
            if name.endswith(".total"):
                issues.append("Counter.total() 是 Python3.10+ API；Python3.9 请改成 sum(counter.values())")
            if name.endswith("pairwise"):
                issues.append("itertools.pairwise 是 Python3.10+ API；Python3.9 请改成 zip(seq, seq[1:]) 或手写循环")
            if name in {"bisect_left", "bisect_right", "bisect.bisect_left", "bisect.bisect_right"}:
                if any(keyword.arg == "key" for keyword in node.keywords):
                    issues.append("bisect 的 key 参数是 Python3.10+；Python3.9 请改成预处理数组或自写二分")

    return issues


def collect_snippets() -> list[tuple[str, str]]:
    snippets: list[tuple[str, str]] = []

    problems = extract_json_array(ROOT / "src/data/problems.ts", "export const problems: Problem[] = ")
    for problem in problems:
        prefix = f"problems #{problem['leetcodeId']} {problem['slug']}"
        snippets.append((f"{prefix} solutionCode", problem.get("solutionCode", "")))
        hints = problem.get("hints", {})
        if hints.get("level6"):
            snippets.append((f"{prefix} hints.level6", hints["level6"]))

    refinements = extract_json_object(
        ROOT / "src/data/problemRefinements.ts",
        "export const problemRefinements: Record<number, ProblemRefinement> = ",
    )
    for key, refinement in refinements.items():
        snippets.append((f"problemRefinements #{key} annotatedCode", refinement.get("annotatedCode", "")))

    variants = extract_json_object(
        ROOT / "src/data/solutionVariants.ts",
        "export const solutionVariants: Record<number, SolutionVariant[]> = ",
    )
    for key, items in variants.items():
        for index, variant in enumerate(items, start=1):
            snippets.append((f"solutionVariants #{key} variant {index} {variant.get('name', '')}", variant.get("code", "")))

    return snippets


def main() -> int:
    failures: list[tuple[str, list[str]]] = []
    snippets = collect_snippets()

    for label, code in snippets:
        issues = check_code(code)
        if issues:
            failures.append((label, issues))

    print(f"checked snippets: {len(snippets)}")
    if not failures:
        print("Python3.9 compatibility: PASS")
        return 0

    print("Python3.9 compatibility: FAIL")
    for label, issues in failures:
        print(f"\n{label}")
        for issue in issues:
            print(f"  - {issue}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
