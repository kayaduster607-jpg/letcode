import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DEFAULT_TARGET_ROOT = 'C:\\Users\\11873\\Desktop\\ship';
const SKIP_SLUGS = new Set([]);
const ASSET_VERSION = 'benchmark-v3-20260605';

function extractJsonArray(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Cannot find marker: ${marker}`);
  const start = source.indexOf('[', markerIndex + marker.length);
  const end = source.lastIndexOf('];');
  return JSON.parse(source.slice(start, end + 1));
}

function extractJsonObject(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Cannot find marker: ${marker}`);
  const start = source.indexOf('{', markerIndex + marker.length);
  const end = source.indexOf('\n};', start);
  return JSON.parse(source.slice(start, end + 2));
}

function clean(text = '') {
  return String(text)
    .replaceAll('Python3.9', 'Python')
    .replaceAll('Python3', 'Python')
    .replace(/\r\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function compact(text = '', limit = 150) {
  const value = clean(text).replace(/\s+/g, ' ');
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
}

function codeText(code = '') {
  return clean(code).replaceAll('Python3.9', 'Python');
}

function codeLines(code = '') {
  return codeText(code).split('\n').length;
}

function pickVariant(variants, predicate) {
  return variants.find(predicate) || null;
}

function variantKey(variant) {
  return variant ? `${variant.name}|${variant.badge}|${variant.time}` : '';
}

function variantCodeShape(code = '') {
  return codeText(code)
    .split('\n')
    .map((line) => line.replace(/#.*$/, ''))
    .filter((line) => line.trim())
    .join('\n')
    .replace(/:\s*Optional\[[^\]]+\]/g, '')
    .replace(/:\s*List\[[^\]]+\]/g, '')
    .replace(/:\s*(int|str|bool|float)\b/g, '')
    .replace(/\)\s*->\s*[^:]+:/g, '):')
    .replace(/\s+/g, '');
}

const SKIP_DUPLICATE_ALTERNATIVE_SLUGS = new Set([
  'sort-colors',
  'maximum-subarray',
  'find-all-numbers-disappeared-in-an-array',
  'sort-list',
  'binary-tree-inorder-traversal',
  'lowest-common-ancestor-of-a-binary-tree',
  'convert-bst-to-greater-tree',
  'implement-trie-prefix-tree',
  'serialize-and-deserialize-binary-tree',
  'group-anagrams',
  'subarray-sum-equals-k',
]);

function shouldSkipVariantCode(problem, variant, role) {
  if (!problem || !variant || role !== 'alternate') return false;
  return SKIP_DUPLICATE_ALTERNATIVE_SLUGS.has(problem.slug);
}

function decodeUnicodeEscapes(value = '') {
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function categoryModel(category = '') {
  if (category.includes('动态规划')) {
    return {
      visual: 'dp',
      framework: '动态规划五部曲',
      steps: ['定义 dp 数组含义', '写递推公式', '初始化边界', '确定遍历顺序', '举例推导表格'],
      cue: '状态、转移、初始化和遍历顺序要一起看。',
    };
  }
  if (category.includes('二叉树')) {
    return {
      visual: 'tree',
      framework: '二叉树递归三部曲',
      steps: ['递归函数返回什么', '空节点怎么处理', '当前节点做什么', '左右子树如何合并'],
      cue: '先确定返回值，再写单层逻辑。',
    };
  }
  if (category.includes('回溯')) {
    return {
      visual: 'backtrack',
      framework: '回溯三件套',
      steps: ['画选择树', '横向枚举选择', '纵向递归深入', '撤销选择', '剪枝重复或非法分支'],
      cue: '每一层只负责一个选择位置。',
    };
  }
  if (category.includes('栈') || category.includes('队列')) {
    return {
      visual: 'stack',
      framework: '栈里保存未解决信息',
      steps: ['栈里存什么', '什么时候入栈', '什么时候弹出', '弹出时结算什么'],
      cue: '栈里存的不是随便放的数据，而是还没被当前信息解决的位置。',
    };
  }
  if (category.includes('滑动窗口') || category.includes('双指针')) {
    return {
      visual: 'pointer',
      framework: '指针移动不变量',
      steps: ['窗口或左右指针含义', '右指针何时前进', '左指针何时收缩', '答案何时更新'],
      cue: '指针每移动一次，都要维护当前窗口或区间的含义。',
    };
  }
  if (category.includes('哈希') || category.includes('前缀')) {
    return {
      visual: 'hash',
      framework: '用记录换查询',
      steps: ['记录什么 key', '保存什么 value', '什么时候查询', '什么时候写入'],
      cue: '核心是把重复查找变成一次记录查询。',
    };
  }
  if (category.includes('贪心')) {
    return {
      visual: 'greedy',
      framework: '贪心局部最优',
      steps: ['局部最优是什么', '排序或扫描规则', '反例检查', '为什么能推出全局最优'],
      cue: '贪心要讲清楚选择规则，而不是只说感觉。',
    };
  }
  if (category.includes('二分')) {
    return {
      visual: 'binary',
      framework: '二分边界不变量',
      steps: ['搜索区间含义', 'mid 如何判断', '哪边可以丢掉', '循环结束返回什么'],
      cue: '二分题最重要的是边界含义一致。',
    };
  }
  if (category.includes('链表')) {
    return {
      visual: 'linked',
      framework: '链表指针关系',
      steps: ['dummy 是否需要', '当前指针指向哪里', 'next 什么时候保存', '返回哪个头节点'],
      cue: '链表题要先保护 next，再移动指针。',
    };
  }
  return {
    visual: 'flow',
    framework: '拆题四步',
    steps: ['读题建模', '写出暴力', '定位瓶颈', '落到优化代码'],
    cue: '先看正确性，再看怎么消掉重复工作。',
  };
}

function cleanProblemText(text = '') {
  return clean(text)
    .replace(/请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。?/g, '')
    .replace(/先别急着写代码。?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(text = '', limit = 130) {
  const value = cleanProblemText(text);
  const match = value.match(/^(.+?[。！？；])/);
  return compact(match ? match[1] : value, limit);
}

function clause(text = '', limit = 120) {
  return compact(text, limit).replace(/[。！？；，,.!?;]+$/g, '');
}

function splitIdea(text = '', limit = 4) {
  const value = cleanProblemText(text);
  return value
    .split(/[。；]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

const RETURN_BY_SLUG = {
  'best-time-to-buy-and-sell-stock': '返回一次买卖能获得的最大利润',
  'best-time-to-buy-and-sell-stock-with-cooldown': '返回含冷冻期规则下能获得的最大利润',
  'burst-balloons': '返回戳完所有气球能获得的最大硬币数',
  'climbing-stairs': '返回爬到第 n 阶的方法数',
  'house-robber': '返回不偷相邻房屋时能偷到的最大金额',
  'house-robber-iii': '返回不偷父子相邻节点时能偷到的最大金额',
  'longest-increasing-subsequence': '返回最长严格递增子序列的长度',
  'lowest-common-ancestor-of-a-binary-tree': '返回 p 和 q 的最近公共祖先节点',
  'maximum-depth-of-binary-tree': '返回二叉树的最大深度',
  'merge-two-binary-trees': '返回合并后的二叉树根节点',
  'merge-two-sorted-lists': '返回合并后的升序链表头节点',
  'minimum-path-sum': '返回从左上到右下的最小路径和',
  'number-of-islands': '返回网格中的岛屿数量',
  'path-sum-iii': '返回路径和等于 targetSum 的路径数量',
  'shortest-unsorted-continuous-subarray': '返回最短无序连续子数组的长度',
  'trapping-rain-water': '返回能接住的雨水总量',
  'unique-paths': '返回从左上角走到右下角的路径总数',
  'search-a-2d-matrix-ii': '返回矩阵中是否存在 target',
  'course-schedule': '返回是否可以学完全部课程',
  'evaluate-division': '每个查询返回除法结果；无法连通返回 -1.0',
  'implement-trie-prefix-tree': 'insert 修改 Trie；search 和 startsWith 返回 true 或 false',
  'unique-binary-search-trees': '返回能组成的不同 BST 数量',
  'sliding-window-maximum': '返回每个窗口里的最大值数组',
  'largest-rectangle-in-histogram': '返回柱状图能形成的最大矩形面积',
  'word-search': '返回单词是否能在网格路径中找到',
  'lru-cache': 'get 返回值或 -1；put 更新缓存状态',
  'regular-expression-matching': '返回 s 是否能被模式 p 完整匹配',
  'edit-distance': '返回 word1 变成 word2 的最少操作数',
  '3sum': '返回所有和为 0 的不重复三元组',
  'combination-sum': '返回所有和为 target 的组合',
  'permutations': '返回所有排列列表',
  'subsets': '返回所有子集列表',
  'longest-palindromic-substring': '返回最长回文子串',
  'median-of-two-sorted-arrays': '返回两个有序数组合并后的中位数',
  'find-the-duplicate-number': '返回数组里重复的那个数',
  'hamming-distance': '返回两个整数二进制位不同的个数',
  'product-of-array-except-self': '返回除自身以外其他元素乘积组成的数组',
  'daily-temperatures': '返回每一天还要等几天才会升温',
  'counting-bits': '返回 0 到 n 每个数字二进制中 1 的个数数组',
  'palindromic-substrings': '返回回文子串数量',
  'convert-bst-to-greater-tree': '原地修改 BST，并返回根节点',
  'serialize-and-deserialize-binary-tree': '序列化为字符串，也可还原树根',
  'find-all-anagrams-in-a-string': '返回所有异位词子串的起始下标',
  'find-all-numbers-disappeared-in-an-array': '返回 [1,n] 中没有出现过的数字列表',
  'find-minimum-in-rotated-sorted-array': '返回旋转数组中的最小值',
  'search-in-rotated-sorted-array': '返回 target 下标；不存在返回 -1',
  'search-in-rotated-sorted-array-ii': '返回 target 是否存在',
  'generate-parentheses': '返回所有合法括号组合',
  'longest-consecutive-sequence': '返回最长连续序列的长度',
  'longest-substring-without-repeating-characters': '返回最长无重复子串的长度',
  'longest-valid-parentheses': '返回最长有效括号子串的长度',
  'maximal-rectangle': '返回只包含 1 的最大矩形面积',
  'min-stack': 'getMin 返回当前栈中的最小元素',
  'next-permutation': '原地改成下一个字典序排列，不返回新数组',
  'queue-reconstruction-by-height': '返回重建后的队列',
  'binary-tree-level-order-traversal': '返回按层分组的节点值列表',
  'single-number': '返回只出现一次的数字',
  'task-scheduler': '返回完成所有任务的最短时间',
  'flatten-binary-tree-to-linked-list': '原地把树展开成前序顺序的右指针链表',
};

function inferReturn(problem) {
  if (RETURN_BY_SLUG[problem.slug]) return RETURN_BY_SLUG[problem.slug];
  const summary = cleanProblemText(problem.summary);
  if (/原地|不使用额外/.test(summary)) return '原地修改输入，不返回新容器';
  const explicit = summary.match(/返回[^。；]+/);
  if (explicit) return explicit[0];
  if (/判断|是否/.test(summary)) return '返回 true 或 false';
  if (/数量|多少|个数/.test(summary)) return '返回一个数量';
  if (problem.category.includes('动态规划')) return '返回最优值、可行性或计数结果';
  if (problem.category.includes('链表')) return '返回处理后的链表节点或判断结果';
  if (problem.category.includes('二叉树')) return '返回树相关的节点、路径或数值结果';
  return '返回题目要求的结果';
}

function boundaryLine(problem, edge) {
  if (edge) return `${edge.input} -> ${edge.expected}`;
  if (problem.category.includes('链表')) return '空链表、单节点、头节点被改动';
  if (problem.category.includes('动态规划')) return '空串、第一行第一列、最小规模';
  if (problem.category.includes('二叉树')) return '空树、单节点、左右子树缺失';
  if (problem.category.includes('滑动窗口') || problem.category.includes('双指针')) return '空输入、重复值、左右边界相遇';
  return '空输入、单元素、重复值或极端值';
}

function methodCost(method) {
  if (!method) return '复杂度看枚举层数';
  return normalizeComplexityText(`${method.time}，${method.space}`);
}

function chooseDirectMethod(variants, problem) {
  return (
    pickVariant(variants, (item) => item.badge === '暴力') ||
    pickVariant(variants, (item) => item.badge === '基础') ||
    variants[0] ||
    {
      name: '最直接做法',
      idea: problem.bruteForceIdea,
      time: problem.complexity?.time || '看实现',
      space: problem.complexity?.space || '看实现',
      code: '',
    }
  );
}

function directMethodMeta(problem, brute) {
  const bySlug = {
    '3sum': { name: '三重循环枚举', time: 'O(n³)', space: 'O(1)' },
    'trapping-rain-water': { name: '每格向两边找最高墙', time: 'O(n²)', space: 'O(1)' },
    'maximal-square': { name: '枚举所有正方形', time: 'O(mn·min(m,n)²)', space: 'O(1)' },
    'maximum-product-subarray': { name: '枚举所有子数组乘积', time: 'O(n²)', space: 'O(1)' },
    'perfect-squares': { name: 'BFS 最短路', time: 'O(n√n)', space: 'O(n)' },
    'search-a-2d-matrix-ii': { name: '逐行二分', time: 'O(m log n)', space: 'O(1)' },
    'course-schedule': { name: '反复扫描可学课程', time: 'O(VE)', space: 'O(V)' },
    'evaluate-division': { name: '带权图搜索', time: '每次查询 O(V+E)', space: 'O(V+E)' },
    'implement-trie-prefix-tree': { name: '列表逐词比较', time: 'O(NL)', space: 'O(NL)' },
    'unique-binary-search-trees': { name: '递归枚举根', time: '指数级', space: 'O(n)' },
    'sliding-window-maximum': { name: '暴力扫描每个窗口', time: 'O(nk)', space: 'O(1)' },
    'largest-rectangle-in-histogram': { name: '逐柱向两侧扩展', time: 'O(n²)', space: 'O(1)' },
    'word-search': { name: '从每个起点 DFS', time: 'O(mn·4^L)', space: 'O(mn)' },
    'lru-cache': { name: '列表维护最近使用', time: 'get/put O(n)', space: 'O(n)' },
    'regular-expression-matching': { name: '递归尝试匹配', time: '指数级', space: 'O(m+n)' },
    'edit-distance': { name: '递归尝试三种操作', time: '指数级', space: 'O(m+n)' },
    'median-of-two-sorted-arrays': { name: '合并后取中位数', time: 'O(m+n)', space: 'O(m+n)' },
    'find-the-duplicate-number': { name: '哈希集合查重', time: 'O(n)', space: 'O(n)' },
    'hamming-distance': { name: '逐位比较', time: 'O(log C)', space: 'O(1)' },
    'product-of-array-except-self': { name: '左右乘积数组', time: 'O(n)', space: 'O(n)' },
    'min-stack': { name: 'getMin 时扫描栈', time: 'getMin O(n)', space: 'O(n)' },
    'binary-tree-inorder-traversal': { name: '递归中序遍历', time: 'O(n)', space: 'O(h)' },
    'binary-tree-level-order-traversal': { name: '队列按层遍历', time: 'O(n)', space: 'O(w)' },
    'construct-binary-tree-from-preorder-and-inorder-traversal': { name: '递归切数组构造', time: 'O(n²)', space: 'O(n²)' },
    'flatten-binary-tree-to-linked-list': { name: '前序数组重连', time: 'O(n)', space: 'O(n)' },
    'decode-string': { name: '递归解析括号内容', time: 'O(输出长度)', space: 'O(嵌套深度)' },
  };
  return { ...(brute || {}), ...(bySlug[problem.slug] || {}) };
}

function whyOptimize(problem, direct, recommended) {
  const directCost = methodCost(direct);
  const recommendedCost = methodCost(recommended);
  if (direct?.time === recommended?.time && direct?.space && recommended?.space && direct.space !== recommended.space) {
    return `直接做法时间已经可以，但要用 ${direct.space} 额外空间；优化目标是把空间降到 ${recommended.space}。${compact(problem.optimizedIdea, 110)}`;
  }
  return `直接做法先保证正确，但会留下可优化的重复工作或状态成本。优化方向是：${compact(problem.optimizedIdea, 150)} 对比一下，直接做法 ${directCost}，推荐写法 ${recommendedCost}。`;
}

function reasoningSteps(problem, refinement, model, recommended) {
  if (problem.slug === 'linked-list-cycle') {
    return ['slow 和 fast 都从 head 出发', '每轮 slow 走一步，fast 走两步', 'fast 或 fast.next 为空，说明走到尾部，没有环', 'slow 和 fast 相遇，说明快指针在环里追上了慢指针'];
  }
  if (problem.slug === 'linked-list-cycle-ii') {
    return ['先用 slow/fast 判断是否相遇', '相遇后把一个指针放回 head', '两个指针每次都走一步', '再次相遇的位置就是环入口'];
  }
  if (problem.slug === 'remove-nth-node-from-end-of-list') {
    return ['dummy 指向 head，统一删除头节点的情况', 'fast 先走 n 步，拉开距离', 'fast 和 slow 同步走到末尾', 'slow.next 就是要删除的节点'];
  }
  const ideas = splitIdea(recommended?.idea || problem.optimizedIdea || refinement?.coreIdea, 5);
  if (ideas.length >= 3) return ideas;
  const handwritten = refinement?.handwriteSteps || [];
  const tooGeneric = handwritten.some((item) => /dummy、prev、cur、next|删除头节点、单节点/.test(item)) && !problem.category.includes('链表');
  if (handwritten.length && !tooGeneric) return handwritten.slice(0, 5);
  return model.steps;
}

function speechText(text = '') {
  return clean(text)
    .replace(/O\(n²\)|O\(n\^2\)/g, 'O N 平方')
    .replace(/O\(m\*n\)|O\(mn\)/g, 'O M 乘 N')
    .replace(/O\(m\+n\)/g, 'O M 加 N')
    .replace(/O\(log n\)/gi, 'O log N')
    .replace(/O\(n log n\)/gi, 'O N log N')
    .replace(/O\(n\)/g, 'O N')
    .replace(/O\(1\)/g, 'O 一');
}

function normalizeComplexityText(text = '') {
  return String(text)
    .replace(/O\(n\^2\)/g, 'O(n²)')
    .replace(/O\(m\*n\)/g, 'O(mn)')
    .replace(/O\(m \* n\)/g, 'O(mn)')
    .replace(/O\(m n\)/g, 'O(mn)');
}

function importantParams(text = '') {
  const found = [];
  const re = /\b(target|k|n|amount|pos|word|numCourses)\s*=\s*("[^"]*"|'[^']*'|[^,\s]+)/gi;
  for (const match of String(text).matchAll(re)) {
    found.push(`${match[1]}=${match[2]}`);
  }
  return [...new Set(found)];
}

function matrixShape(text = '') {
  const match = String(text).match(/\[\[([\s\S]*?)\]\]/);
  if (!match) return null;
  const rows = match[1].split(/\]\s*,\s*\[/);
  const cols = rows[0].split(',').filter((item) => item.trim()).length;
  return { rows: rows.length, cols: Math.max(1, cols) };
}

function isMatrixLikeName(name = '') {
  return /^(matrix|grid|board)$/i.test(name);
}

function compressArrayLiteral(raw = '') {
  const value = String(raw).trim();
  if (!value.startsWith('[') || !value.endsWith(']')) return value;
  if (value.startsWith('[[')) {
    if (value.length <= 76) return value;
    const rows = value.slice(2, -2).split(/\]\s*,\s*\[/).map((item) => item.trim()).filter(Boolean);
    if (rows.length >= 2) return `[[${rows[0]}],...,[${rows.at(-1)}]]`;
    return value;
  }
  const body = value.slice(1, -1);
  const items = body.split(',').map((item) => item.trim()).filter(Boolean);
  if (items.length <= 12 && value.length <= 110) return value;
  if (!items.length) return value;
  return `[${[...items.slice(0, 3), '...', items.at(-1)].join(',')}]`;
}

function summarizeAssignedValue(name = '', raw = '') {
  const value = String(raw).trim();
  if (value.startsWith('[[')) {
    if (name === 'prerequisites' && value.length <= 44) return value;
    if (!isMatrixLikeName(name)) return compressArrayLiteral(value);
    const shape = matrixShape(value);
    return shape ? `${shape.rows}x${shape.cols}` : value;
  }
  if (value.startsWith('[')) return compressArrayLiteral(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    if (value.length <= 34) return value;
    return `${value.slice(0, 31)}..."`;
  }
  return value;
}

function assignmentSummary(text = '') {
  const value = String(text);
  const re = /\b([A-Za-z_]\w*)\s*=\s*("[^"]*"|'[^']*'|\[\[[\s\S]*?\]\]|\[[^\]]*\]|[^,\s]+)/g;
  const parts = [];
  for (const match of value.matchAll(re)) {
    const name = match[1];
    const raw = match[2];
    parts.push(`${name}=${summarizeAssignedValue(name, raw)}`);
  }
  if (!parts.length) return '';
  return [...new Set(parts)].slice(0, 3).join(', ');
}

function structuredLine(text = '') {
  const value = clean(text).replace(/\s+/g, ' ').trim();
  if (!value) return '';

  if (/\s*->\s*/.test(value)) {
    const [left, ...rightParts] = value.split(/\s*->\s*/);
    const right = rightParts.join(' -> ');
    if (right && /[A-Za-z_]\w*\s*=|\[/.test(left)) {
      const summarizePart = (part) => {
        const trimmed = part.trim();
        const assigned = assignmentSummary(trimmed);
        if (assigned) return assigned;
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) return compressArrayLiteral(trimmed);
        return compact(trimmed, 48);
      };
      return compact(`${summarizePart(left)} -> ${summarizePart(right)}`, 120);
    }
  }

  const operations = value.match(/\b(?:put|get|push|pop|top|getMin|insert|search|startsWith)\([^)]*\)|\b(?:pop|getMin|top)\(\)/g);
  if (operations?.length) {
    const opLine = operations.join(', ');
    return opLine.length <= 96 ? opLine : `${opLine.slice(0, 93)}...`;
  }

  const board = value.match(/board=([^,\s]+).*?\bword=("[^"]*"|'[^']*'|[^,\s]+)/i);
  if (board) {
    const rows = board[1].split('/').filter(Boolean);
    const cols = rows[0]?.length || 0;
    return `board=${rows.length}x${cols}, word=${board[2]}`;
  }

  const assigned = assignmentSummary(value);
  if (assigned) return assigned;

  if (value.startsWith('[[') && value.endsWith(']')) return compressArrayLiteral(value);

  const shape = matrixShape(value);
  if (shape) {
    if (!/\b(matrix|grid|board)\s*=\s*\[\[/i.test(value)) {
      const literal = value.match(/\[\[[\s\S]*?\]\]/)?.[0];
      if (literal) return compressArrayLiteral(literal);
    }
    const named = value.match(/([A-Za-z_]\w*)\s*=\s*\[\[/);
    const params = importantParams(value).filter((item) => !item.toLowerCase().startsWith('n='));
    const name = named?.[1] || 'matrix';
    if (name === 'prerequisites') {
      const exact = value.match(/prerequisites\s*=\s*(\[\[[\s\S]*?\]\])/i)?.[1];
      if (exact && exact.length <= 44) {
        const prefixExact = params.length ? `${params.join(', ')}, ` : '';
        return `${prefixExact}${name}=${exact}`;
      }
    }
    const prefix = params.length ? `${params.join(', ')}, ` : '';
    return `${prefix}${name}=${shape.rows}x${shape.cols}`;
  }

  const array = value.match(/([A-Za-z_]\w*)\s*=\s*\[([^\]]*)\]([\s\S]*)/);
  if (array) {
    const items = array[2].split(',').map((item) => item.trim()).filter(Boolean);
    const shown = items.length > 7 ? [...items.slice(0, 4), '...', items.at(-1)].join(',') : items.join(',');
    const params = importantParams(array[3] || '');
    return `${array[1]}=[${shown}]${params.length ? `, ${params.join(', ')}` : ''}`;
  }

  if (value.startsWith('[') && value.endsWith(']')) return compressArrayLiteral(value);

  const params = importantParams(value);
  if (params.length >= 2) return params.join(', ');
  return '';
}

function shortLine(text = '', limit = 72) {
  const structured = structuredLine(text);
  if (structured) return structured.length > 120 ? `${structured.slice(0, 117)}...` : structured;
  return clause(text, limit);
}

function cleanStep(item = '') {
  return compact(String(item).replace(/^\d+[.、]\s*/, '').trim(), 68).replace(/[。；;]+$/g, '');
}

function isWeakStep(item = '') {
  return /^(优化思路|读题建模|写出暴力|定位瓶颈|落到优化代码)$/.test(item)
    || /实现时先定义关键状态或数据结构|先保证答案正确|最后返回题目要求的结果|根据状态更新候选答案|把当前元素转成题目需要的状态|再严格维护循环不变量|最后用边界样例检查/.test(item);
}

function sentenceItems(text = '', limit = 4) {
  const items = cleanProblemText(text)
    .split(/[。；;]/)
    .map(cleanStep)
    .filter(Boolean)
    .filter((item) => !isWeakStep(item))
    .map((item) => compact(item, 70));
  return items.slice(0, limit);
}

function ideaActions(text = '', limit = 5) {
  return cleanProblemText(text)
    .split(/[。；;，：:]/)
    .map(cleanStep)
    .filter((item) => item.length >= 4)
    .filter((item) => !isWeakStep(item))
    .slice(0, limit);
}

const VISUAL_BY_SLUG = {
  'search-a-2d-matrix-ii': 'matrixSearch',
  'course-schedule': 'graphDAG',
  'evaluate-division': 'weightedGraph',
  'implement-trie-prefix-tree': 'trieTrace',
  'unique-binary-search-trees': 'catalanDP',
  'sliding-window-maximum': 'dequeWindow',
  'largest-rectangle-in-histogram': 'histogramStack',
  'word-search': 'wordGrid',
  'lru-cache': 'lruCache',
  'regular-expression-matching': 'regexDP',
  'edit-distance': 'dp2D',
  'median-of-two-sorted-arrays': 'medianPartition',
  'find-the-duplicate-number': 'functionalCycle',
  'hamming-distance': 'bitTrace',
  'product-of-array-except-self': 'prefixSuffix',
  'daily-temperatures': 'tempStack',
  'decode-string': 'decodeStack',
  'find-all-anagrams-in-a-string': 'anagramWindow',
  'find-all-numbers-disappeared-in-an-array': 'indexMark',
  'find-minimum-in-rotated-sorted-array': 'rotateBinary',
  'generate-parentheses': 'parenBuild',
  'longest-consecutive-sequence': 'numberLine',
  'longest-valid-parentheses': 'parenIndexStack',
  'maximal-rectangle': 'maximalRect',
  'min-stack': 'minStack',
  'next-permutation': 'permutationPivot',
  'queue-reconstruction-by-height': 'queueTrace',
  'single-number': 'xorCancel',
  'sort-colors': 'dutchFlag',
  'task-scheduler': 'taskFrame',
  'top-k-frequent-elements': 'freqBucket',
  'best-time-to-buy-and-sell-stock': 'stockProfit',
  'binary-tree-inorder-traversal': 'inorderTree',
  'binary-tree-level-order-traversal': 'levelOrderTree',
  'construct-binary-tree-from-preorder-and-inorder-traversal': 'buildTree',
  'flatten-binary-tree-to-linked-list': 'flattenTree',
};

const EXTRA_VISUAL_BY_SLUG = {
  'add-two-numbers': 'addListDigits',
  'longest-substring-without-repeating-characters': 'noRepeatWindow',
  'longest-palindromic-substring': 'palindromeCenter',
  'container-with-most-water': 'waterBars',
  '3sum': 'threeSumPointers',
  'letter-combinations-of-a-phone-number': 'phoneChoices',
  'remove-nth-node-from-end-of-list': 'removeNthList',
  'valid-parentheses': 'bracketStack',
  'merge-two-sorted-lists': 'mergeLists',
  'search-in-rotated-sorted-array': 'rotatedSearch',
  'find-first-and-last-position-of-element-in-sorted-array': 'rangeBinary',
  'combination-sum': 'combinationTree',
  'trapping-rain-water': 'rainBars',
  permutations: 'permuteTree',
  'rotate-image': 'rotateMatrix',
  'group-anagrams': 'anagramBuckets',
  'maximum-subarray': 'kadaneTrace',
  'jump-game': 'jumpReach',
  'merge-intervals': 'intervalMerge',
  'unique-paths': 'pathGrid',
  'minimum-path-sum': 'minPathGrid',
  'climbing-stairs': 'stairsDP',
  'minimum-window-substring': 'coverWindow',
  subsets: 'subsetTree',
  'search-in-rotated-sorted-array-ii': 'rotatedSearchDup',
  'validate-binary-search-tree': 'bstBounds',
  'symmetric-tree': 'mirrorTree',
  'maximum-depth-of-binary-tree': 'depthTree',
  'binary-tree-maximum-path-sum': 'treeMaxPath',
  'word-break': 'wordBreakDP',
  'sort-list': 'mergeSortList',
  'maximum-product-subarray': 'maxMinProduct',
  'house-robber': 'robberLine',
  'number-of-islands': 'islandGrid',
  'reverse-linked-list': 'reverseList',
  'kth-largest-element-in-an-array': 'heapK',
  'maximal-square': 'squareDP',
  'invert-binary-tree': 'invertTree',
  'palindrome-linked-list': 'palindromeList',
  'lowest-common-ancestor-of-a-binary-tree': 'lcaTree',
  'find-minimum-in-rotated-sorted-array-ii': 'rotateBinaryDup',
  'intersection-of-two-linked-lists': 'intersectionList',
  'majority-element': 'majorityVote',
  'perfect-squares': 'squaresDP',
  'move-zeroes': 'moveZeroes',
  'serialize-and-deserialize-binary-tree': 'serializeTree',
  'longest-increasing-subsequence': 'lisDP',
  'best-time-to-buy-and-sell-stock-with-cooldown': 'stockCooldown',
  'burst-balloons': 'balloonInterval',
  'coin-change': 'coinDP',
  'house-robber-iii': 'robberTree',
  'partition-equal-subset-sum': 'partitionDP',
  'path-sum-iii': 'pathPrefixTree',
  'target-sum': 'targetSigns',
  'convert-bst-to-greater-tree': 'bstGreater',
  'diameter-of-binary-tree': 'diameterTree',
  'subarray-sum-equals-k': 'prefixSumK',
  'shortest-unsorted-continuous-subarray': 'unsortedWindow',
  'merge-two-binary-trees': 'mergeTrees',
  'palindromic-substrings': 'palindromeExpand',
  'counting-bits': 'bitsDP',
};

Object.assign(VISUAL_BY_SLUG, EXTRA_VISUAL_BY_SLUG);

function categoryVisual(problem) {
  const category = problem.category || '';
  if (VISUAL_BY_SLUG[problem.slug]) return VISUAL_BY_SLUG[problem.slug];
  if (problem.slug === 'linked-list-cycle' || problem.slug === 'linked-list-cycle-ii') return 'cycleList';
  if (category.includes('链表')) return 'linkedList';
  if (category.includes('动态规划')) return 'dpTable';
  if (category.includes('二叉树') || category.includes('前缀树')) return 'treeTrace';
  if (category.includes('回溯')) return 'choiceTree';
  if (category.includes('栈') || category.includes('队列')) return 'stackTrace';
  if (category.includes('滑动窗口')) return 'windowTrace';
  if (category.includes('双指针')) return 'pointerTrace';
  if (category.includes('二分')) return 'binaryTrace';
  if (category.includes('矩阵')) return 'matrixTrace';
  if (category.includes('图论')) return 'gridTrace';
  if (category.includes('哈希') || category.includes('前缀和')) return 'hashTrace';
  if (category.includes('堆')) return 'heapTrace';
  if (category.includes('贪心')) return 'greedyTrace';
  return 'arrayTrace';
}

function problemObject(problem) {
  const bySlug = {
    'search-a-2d-matrix-ii': '行列升序矩阵坐标',
    'course-schedule': '课程依赖有向图',
    'evaluate-division': '带权有向图边',
    'implement-trie-prefix-tree': '字符前缀树节点',
    'unique-binary-search-trees': 'BST 数量状态',
    'sliding-window-maximum': '数组窗口和单调队列',
    'largest-rectangle-in-histogram': '柱状图高度',
    'word-search': '字符网格和路径',
    'lru-cache': '缓存 key、value 和双向链表节点',
    'regular-expression-matching': '二维匹配状态',
    'edit-distance': '二维编辑状态',
    'median-of-two-sorted-arrays': '两个有序数组的切分线',
    'find-the-duplicate-number': '数组下标和值形成的环',
    'hamming-distance': '二进制位',
    'product-of-array-except-self': '前缀积和后缀积',
    'daily-temperatures': '温度数组和等待天数',
    'decode-string': '带数字和方括号的编码字符串',
    'generate-parentheses': '括号对数 n 和合法括号串',
    'maximal-rectangle': '只包含 0/1 的矩阵',
    'min-stack': '栈操作序列和值',
    'binary-tree-inorder-traversal': '二叉树根节点 root',
    'binary-tree-level-order-traversal': '二叉树根节点 root',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '前序数组和中序数组',
    'flatten-binary-tree-to-linked-list': '二叉树根节点 root',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  if (problem.category.includes('链表')) return '链表节点';
  if (problem.category.includes('二叉树')) return '树节点';
  if (problem.category.includes('动态规划')) return '状态';
  if (problem.category.includes('矩阵')) return '矩阵坐标';
  if (problem.category.includes('图论')) return '网格格子';
  if (problem.category.includes('栈')) return '字符或下标';
  if (problem.category.includes('哈希') || problem.category.includes('前缀和')) return '记录表';
  return '数组元素';
}

function parseExampleParts(edge) {
  if (!edge) return { input: '题目给定输入', output: '题目要求输出', why: '用最小样例确认逻辑' };
  return { input: edge.input, output: edge.expected, why: edge.why };
}

function exampleScore(edge) {
  if (!edge) return -Infinity;
  const input = `${edge.input}`;
  const expected = `${edge.expected}`;
  const why = `${edge.why}`;
  let score = 0;
  if (input.includes(',')) score += 2;
  if (input.length > 12) score += 1;
  if (expected.length > 4) score += 1;
  if (/标准|重复|排序|进位|连通|去重|旋转|递推|多种/.test(why)) score += 3;
  if (/true|\[\[|\[/.test(expected)) score += 1;
  if (/n=1|matrix=\[\[1\]\]|全是|空|单节点|单行|单列|零值|不存在/.test(input) || /一阶|1×1|没有|为空/.test(why)) score -= 4;
  return score;
}

function chooseExampleEdge(edgeCases = []) {
  if (!edgeCases.length) return null;
  return [...edgeCases].sort((a, b) => exampleScore(b) - exampleScore(a))[0];
}

function chooseBoundaryEdge(edgeCases = []) {
  if (!edgeCases.length) return null;
  return [...edgeCases].sort((a, b) => exampleScore(a) - exampleScore(b))[0];
}

function exampleOverride(problem) {
  const examples = {
    'search-a-2d-matrix-ii': {
      input: 'matrix=[[1,4,7,11],[2,5,8,12],[3,6,9,16]], target=5',
      expected: 'true',
      why: '从右上角开始，5 比 11 小就左移，比 4 大就下移，刚好落到 5。',
    },
    'course-schedule': {
      input: 'numCourses=2, prerequisites=[[1,0]]',
      expected: 'true',
      why: '先学 0 再学 1，没有形成依赖环。',
    },
    'evaluate-division': {
      input: 'a/b=2.0, b/c=3.0, query=a/c',
      expected: '6.0',
      why: '沿路径 a -> b -> c，把边权 2.0 和 3.0 相乘。',
    },
    'implement-trie-prefix-tree': {
      input: 'insert("apple"), search("app"), startsWith("app")',
      expected: 'false, true',
      why: 'app 是前缀但不是完整单词，直到标记 isEnd 才算 search 成功。',
    },
    'unique-binary-search-trees': {
      input: 'n=3',
      expected: '5',
      why: '分别选 1、2、3 做根，左右子树数量相乘再累加。',
    },
    'sliding-window-maximum': {
      input: 'nums=[1,3,-1,-3,5,3,6,7], k=3',
      expected: '[3,3,5,5,6,7]',
      why: '每个长度为 3 的窗口都要立刻拿到当前最大值。',
    },
    'largest-rectangle-in-histogram': {
      input: 'heights=[2,1,5,6,2,3]',
      expected: '10',
      why: '高度 5 和 6 组成宽度 2 的矩形，面积是 10。',
    },
    'word-search': {
      input: 'board=ABCE/SFCS/ADEE, word="ABCCED"',
      expected: 'true',
      why: '路径按相邻格子走 A -> B -> C -> C -> E -> D，不能重复用格子。',
    },
    'lru-cache': {
      input: 'put(1,1), put(2,2), get(1), put(3,3), get(2)',
      expected: '1, -1',
      why: '访问 1 后它变成最近使用；插入 3 时淘汰最久未使用的 2。',
    },
    'regular-expression-matching': {
      input: 's="aab", p="c*a*b"',
      expected: 'true',
      why: 'c* 可以取 0 个，a* 匹配 aa，最后 b 匹配 b。',
    },
    'edit-distance': {
      input: 'word1="horse", word2="ros"',
      expected: '3',
      why: '用插入、删除、替换把 horse 变成 ros，最少 3 步。',
    },
    'median-of-two-sorted-arrays': {
      input: 'nums1=[1,3], nums2=[2]',
      expected: '2.0',
      why: '合并后的有序序列是 [1,2,3]，中间值为 2。',
    },
    'find-the-duplicate-number': {
      input: 'nums=[1,3,4,2,2]',
      expected: '2',
      why: '把值当作下一个下标会形成环，环入口就是重复数。',
    },
    'hamming-distance': {
      input: 'x=1, y=4',
      expected: '2',
      why: '001 和 100 有两个二进制位不同。',
    },
    'product-of-array-except-self': {
      input: 'nums=[1,2,3,4]',
      expected: '[24,12,8,6]',
      why: '每个位置等于左边所有数乘右边所有数。',
    },
    'generate-parentheses': {
      input: 'n=3',
      expected: '["((()))","(()())","(())()","()(())","()()()"]',
      why: '每个结果都由 3 对括号组成，并且任意前缀里右括号数量不能超过左括号。',
    },
    'maximal-rectangle': {
      input: 'matrix=[["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]',
      expected: '6',
      why: '第 2、3 行的连续 1 能组成高 2、宽 3 的矩形，面积是 6。',
    },
    'binary-tree-inorder-traversal': {
      input: 'root=[1,null,2,3]',
      expected: '[1,3,2]',
      why: '中序顺序是左子树、根、右子树；节点 2 的左孩子 3 会先于 2 访问。',
    },
    'binary-tree-level-order-traversal': {
      input: 'root=[3,9,20,null,null,15,7]',
      expected: '[[3],[9,20],[15,7]]',
      why: '按层从上到下访问，每层内部从左到右。',
    },
    'construct-binary-tree-from-preorder-and-inorder-traversal': {
      input: 'preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]',
      expected: 'root=[3,9,20,null,null,15,7]',
      why: '前序第一个 3 是根；中序里 3 左边是左子树，右边是右子树。',
    },
    'flatten-binary-tree-to-linked-list': {
      input: 'root=[1,2,5,3,4,null,6]',
      expected: '[1,null,2,null,3,null,4,null,5,null,6]',
      why: '展开后的 right 链正好是前序遍历 1,2,3,4,5,6，所有 left 都要置空。',
    },
    'min-stack': {
      input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
      expected: '-3, 0, -2',
      why: 'getMin 要随时返回当前栈内最小值，pop 后最小值也要恢复到上一层。',
    },
    'decode-string': {
      input: 's="3[a2[c]]"',
      expected: '"accaccacc"',
      why: '内层 2[c] 先变成 cc，再由外层 3[...] 重复三次。',
    },
    'container-with-most-water': {
      input: 'height=[1,8,6,2,5,4,8,3,7]',
      expected: '49',
      why: '下标 1 和下标 8 的高度较小值是 7，宽度是 7，面积 49。',
    },
    '3sum': {
      input: 'nums=[-1,0,1,2,-1,-4]',
      expected: '[[-1,-1,2],[-1,0,1]]',
      why: '两组三元组都凑成 0，并且排序后不能重复收同一组。',
    },
    'letter-combinations-of-a-phone-number': {
      input: 'digits="23"',
      expected: '["ad","ae","af","bd","be","bf","cd","ce","cf"]',
      why: '数字 2 对应 abc，数字 3 对应 def，每层选一个字母。',
    },
    'remove-nth-node-from-end-of-list': {
      input: 'head=[1,2,3,4,5], n=2',
      expected: '[1,2,3,5]',
      why: '倒数第 2 个节点是 4，删除后 3 直接指向 5。',
    },
    'valid-parentheses': {
      input: 's="()[]{}"',
      expected: 'true',
      why: '每个右括号都能和栈顶左括号正确配对。',
    },
    'merge-two-sorted-lists': {
      input: 'list1=[1,2,4], list2=[1,3,4]',
      expected: '[1,1,2,3,4,4]',
      why: '每次接两个链表当前较小的节点，整体保持升序。',
    },
    'next-permutation': {
      input: 'nums=[1,2,3]',
      expected: '[1,3,2]',
      why: '从右侧找到可增大的 2，再用 3 替换并反转后缀。',
    },
    'search-in-rotated-sorted-array': {
      input: 'nums=[4,5,6,7,0,1,2], target=0',
      expected: '4',
      why: 'target 0 在旋转点右侧，下标是 4。',
    },
    'find-first-and-last-position-of-element-in-sorted-array': {
      input: 'nums=[5,7,7,8,8,10], target=8',
      expected: '[3,4]',
      why: '8 连续出现两次，左边界是 3，右边界是 4。',
    },
    'combination-sum': {
      input: 'candidates=[2,3,6,7], target=7',
      expected: '[[2,2,3],[7]]',
      why: '2 可以重复选择，7 也可以单独组成 target。',
    },
    'trapping-rain-water': {
      input: 'height=[0,1,0,2,1,0,1,3,2,1,2,1]',
      expected: '6',
      why: '每个位置能接的水由左右最高墙的较小值减当前高度得到。',
    },
    permutations: {
      input: 'nums=[1,2,3]',
      expected: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
      why: '每个位置从未使用数字里选一个，直到 path 长度等于 nums。',
    },
    'group-anagrams': {
      input: 'strs=["eat","tea","tan","ate","nat","bat"]',
      expected: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
      why: '同组单词排序后签名相同。',
    },
    'maximum-subarray': {
      input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]',
      expected: '6',
      why: '连续子数组 [4,-1,2,1] 的和最大，为 6。',
    },
    'jump-game': {
      input: 'nums=[2,3,1,1,4]',
      expected: 'true',
      why: '从下标 0 最远能到 2，到下标 1 后最远能覆盖终点。',
    },
    'merge-intervals': {
      input: 'intervals=[[1,3],[2,6],[8,10],[15,18]]',
      expected: '[[1,6],[8,10],[15,18]]',
      why: '[1,3] 和 [2,6] 重叠，合并成 [1,6]。',
    },
    'unique-paths': {
      input: 'm=3, n=7',
      expected: '28',
      why: '每个格子只来自上方或左方，逐格累加路径数。',
    },
    'minimum-path-sum': {
      input: 'grid=[[1,3,1],[1,5,1],[4,2,1]]',
      expected: '7',
      why: '路径 1 -> 3 -> 1 -> 1 -> 1 的和最小。',
    },
    'climbing-stairs': {
      input: 'n=5',
      expected: '8',
      why: '到第 5 阶来自第 4 阶和第 3 阶，两者方案数相加。',
    },
    'sort-colors': {
      input: 'nums=[2,0,2,1,1,0]',
      expected: '[0,0,1,1,2,2]',
      why: '原地把 0 放左侧、2 放右侧，中间自然是 1。',
    },
    'minimum-window-substring': {
      input: 's="ADOBECODEBANC", t="ABC"',
      expected: '"BANC"',
      why: 'BANC 是最短且同时包含 A、B、C 的窗口。',
    },
    subsets: {
      input: 'nums=[1,2,3]',
      expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]',
      why: '每个数字都有选或不选两条分支，最终得到 8 个子集。',
    },
    'search-in-rotated-sorted-array-ii': {
      input: 'nums=[2,5,6,0,0,1,2], target=0',
      expected: 'true',
      why: '数组中存在 target，重复元素只会让边界判断多一步收缩。',
    },
    'largest-rectangle-in-histogram': {
      input: 'heights=[2,1,5,6,2,3]',
      expected: '10',
      why: '高度 5 和 6 可以组成宽度 2 的矩形，面积 10。',
    },
    'validate-binary-search-tree': {
      input: 'root=[2,1,3]',
      expected: 'true',
      why: '左子树所有值小于 2，右子树所有值大于 2。',
    },
    'symmetric-tree': {
      input: 'root=[1,2,2,3,4,4,3]',
      expected: 'true',
      why: '左右子树外侧和内侧都成镜像。',
    },
    'maximum-depth-of-binary-tree': {
      input: 'root=[3,9,20,null,null,15,7]',
      expected: '3',
      why: '最长根到叶子路径有 3 层。',
    },
    'binary-tree-maximum-path-sum': {
      input: 'root=[-10,9,20,null,null,15,7]',
      expected: '42',
      why: '最大路径是 15 -> 20 -> 7，和为 42。',
    },
    'longest-consecutive-sequence': {
      input: 'nums=[100,4,200,1,3,2]',
      expected: '4',
      why: '连续序列 1,2,3,4 的长度是 4。',
    },
    'single-number': {
      input: 'nums=[4,1,2,1,2]',
      expected: '4',
      why: '相同数字异或后抵消，只剩出现一次的 4。',
    },
    'linked-list-cycle': {
      input: 'head=[3,2,0,-4], pos=1',
      expected: 'true',
      why: '尾节点 -4 指回下标 1 的节点 2，沿 next 会重复走到 2。',
    },
    'linked-list-cycle-ii': {
      input: 'head=[3,2,0,-4], pos=1',
      expected: '节点 2',
      why: '第一次进入环的位置是值为 2 的节点。',
    },
    'sort-list': {
      input: 'head=[4,2,1,3]',
      expected: '[1,2,3,4]',
      why: '链表排序后节点值按升序连接。',
    },
    'maximum-product-subarray': {
      input: 'nums=[2,3,-2,4]',
      expected: '6',
      why: '子数组 [2,3] 的乘积最大；负数会交换最大和最小乘积。',
    },
    'find-minimum-in-rotated-sorted-array': {
      input: 'nums=[3,4,5,1,2]',
      expected: '1',
      why: '旋转点后的第一个元素就是最小值。',
    },
    'find-minimum-in-rotated-sorted-array-ii': {
      input: 'nums=[2,2,2,0,1]',
      expected: '0',
      why: '重复元素会干扰判断，但最小值仍在旋转断点处。',
    },
    'intersection-of-two-linked-lists': {
      input: 'A=[4,1,8,4,5], B=[5,6,1,8,4,5]',
      expected: '节点 8',
      why: '两条链表从值为 8 的同一个节点开始共享后缀。',
    },
    'majority-element': {
      input: 'nums=[2,2,1,1,1,2,2]',
      expected: '2',
      why: '2 出现 4 次，超过数组长度的一半。',
    },
    'house-robber': {
      input: 'nums=[2,7,9,3,1]',
      expected: '12',
      why: '偷第 1、3、5 间房可得 2+9+1=12。',
    },
    'number-of-islands': {
      input: 'grid=[["1","1","0"],["1","0","0"],["0","0","1"]]',
      expected: '2',
      why: '左上连通块是一座岛，右下单独是一座岛。',
    },
    'reverse-linked-list': {
      input: 'head=[1,2,3,4,5]',
      expected: '[5,4,3,2,1]',
      why: '每个节点的 next 都反向指回前一个节点。',
    },
    'kth-largest-element-in-an-array': {
      input: 'nums=[3,2,1,5,6,4], k=2',
      expected: '5',
      why: '排序后第二大的元素是 5。',
    },
    'maximal-square': {
      input: 'matrix=[["1","0","1","0"],["1","0","1","1"],["1","1","1","1"]]',
      expected: '4',
      why: '右下区域能组成边长 2 的正方形，面积是 4。',
    },
    'invert-binary-tree': {
      input: 'root=[4,2,7,1,3,6,9]',
      expected: '[4,7,2,9,6,3,1]',
      why: '每个节点都交换左右孩子。',
    },
    'palindrome-linked-list': {
      input: 'head=[1,2,2,1]',
      expected: 'true',
      why: '从两端向中间读，节点值完全相同。',
    },
    'lowest-common-ancestor-of-a-binary-tree': {
      input: 'root=[3,5,1,6,2,0,8], p=5, q=1',
      expected: '节点 3',
      why: '5 和 1 分别在根节点 3 的左右子树里。',
    },
    'sliding-window-maximum': {
      input: 'nums=[1,3,-1,-3,5,3,6,7], k=3',
      expected: '[3,3,5,5,6,7]',
      why: '每个长度为 3 的窗口都输出当前最大值。',
    },
    'perfect-squares': {
      input: 'n=12',
      expected: '3',
      why: '12 可以由 4+4+4 凑成，最少 3 个完全平方数。',
    },
    'move-zeroes': {
      input: 'nums=[0,1,0,3,12]',
      expected: '[1,3,12,0,0]',
      why: '非零元素保持相对顺序前移，0 留到末尾。',
    },
    'longest-increasing-subsequence': {
      input: 'nums=[10,9,2,5,3,7,101,18]',
      expected: '4',
      why: '一个最长递增子序列是 2,3,7,101。',
    },
    'best-time-to-buy-and-sell-stock-with-cooldown': {
      input: 'prices=[1,2,3,0,2]',
      expected: '3',
      why: '卖出后必须冷冻一天，最佳收益为 3。',
    },
    'burst-balloons': {
      input: 'nums=[3,1,5,8]',
      expected: '167',
      why: '按合适顺序戳气球可以得到最大硬币数 167。',
    },
    'coin-change': {
      input: 'coins=[1,2,5], amount=11',
      expected: '3',
      why: '11 可以用 5+5+1 凑出，最少 3 枚硬币。',
    },
    'house-robber-iii': {
      input: 'root=[3,2,3,null,3,null,1]',
      expected: '7',
      why: '偷根节点 3，再偷两个孙子 3 和 1，总额 7。',
    },
    'counting-bits': {
      input: 'n=5',
      expected: '[0,1,1,2,1,2]',
      why: '0 到 5 的二进制 1 个数依次是这些值。',
    },
    'top-k-frequent-elements': {
      input: 'nums=[1,1,1,2,2,3], k=2',
      expected: '[1,2]',
      why: '1 出现 3 次，2 出现 2 次，频率最高。',
    },
    'queue-reconstruction-by-height': {
      input: 'people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]',
      expected: '[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]',
      why: '插入后每个人前面身高不低于自己的人数正好等于 k。',
    },
    'partition-equal-subset-sum': {
      input: 'nums=[1,5,11,5]',
      expected: 'true',
      why: '可以分成 [11] 和 [1,5,5] 两组，和都为 11。',
    },
    'path-sum-iii': {
      input: 'root=[10,5,-3,3,2,null,11,3,-2,null,1], targetSum=8',
      expected: '3',
      why: '树中有 3 条向下路径的和等于 8。',
    },
    'find-all-anagrams-in-a-string': {
      input: 's="cbaebabacd", p="abc"',
      expected: '[0,6]',
      why: 'cba 和 bac 都是 abc 的异位词。',
    },
    'find-all-numbers-disappeared-in-an-array': {
      input: 'nums=[4,3,2,7,8,2,3,1]',
      expected: '[5,6]',
      why: '1 到 8 中只有 5 和 6 没出现。',
    },
    'target-sum': {
      input: 'nums=[1,1,1,1,1], target=3',
      expected: '5',
      why: '给每个数加正负号后，有 5 种表达式结果为 3。',
    },
    'convert-bst-to-greater-tree': {
      input: 'root=[4,1,6,0,2,5,7]',
      expected: '累加树根节点',
      why: '每个节点值加上所有比它大的节点值。',
    },
    'diameter-of-binary-tree': {
      input: 'root=[1,2,3,4,5]',
      expected: '3',
      why: '最长路径可以是 4 -> 2 -> 1 -> 3，边数为 3。',
    },
    'subarray-sum-equals-k': {
      input: 'nums=[1,1,1], k=2',
      expected: '2',
      why: '两个长度为 2 的连续子数组和都等于 2。',
    },
    'shortest-unsorted-continuous-subarray': {
      input: 'nums=[2,6,4,8,10,9,15]',
      expected: '5',
      why: '只要排序下标 1 到 5 的子数组，整体就会升序。',
    },
    'merge-two-binary-trees': {
      input: 'root1=[1,3,2,5], root2=[2,1,3,null,4,null,7]',
      expected: '[3,4,5,5,4,null,7]',
      why: '两个节点都存在就相加，缺失一边就接上另一边。',
    },
    'task-scheduler': {
      input: 'tasks=["A","A","A","B","B","B"], n=2',
      expected: '8',
      why: 'A 和 B 之间需要冷却间隔，最短安排长度是 8。',
    },
    'palindromic-substrings': {
      input: 's="aaa"',
      expected: '6',
      why: '三个单字符、两个 aa、一个 aaa，一共 6 个回文子串。',
    },
    'daily-temperatures': {
      input: 'temperatures=[73,74,75,71,69,72,76,73]',
      expected: '[1,1,4,2,1,1,0,0]',
      why: '每个位置记录到下一个更高温度之间隔了几天。',
    },
  };
  if (examples[problem.slug]) return examples[problem.slug];
  if (problem.slug === 'rotate-image') {
    return {
      input: 'matrix=[[1,2,3],[4,5,6],[7,8,9]]',
      expected: '[[7,4,1],[8,5,2],[9,6,3]]',
      why: '标准 3×3 旋转，最能看出坐标变化。',
    };
  }
  return null;
}

function directSteps(problem, brute) {
  const bySlug = {
    'group-anagrams': ['把每个字符串变成统一签名', '签名可以用排序后的字符串，也可以用 26 维计数', '把原字符串加入 map[签名] 对应的桶', '所有字符串处理完后返回这些桶', '直接做法如果两两比较异位词，会重复检查很多字符'],
    'longest-consecutive-sequence': ['先把所有数字放进 set 去重', '遍历每个数字时先看 num-1 是否存在', '只有不存在前驱时，它才是连续段起点', '从起点不断检查 num+1、num+2', '用扩展长度更新答案'],
    'subarray-sum-equals-k': ['枚举子数组左端点', '再枚举右端点累加区间和', '区间和等于 k 就计数加一', '每个起点都要重新累加很多次', '优化方向是用前缀和复用区间和'],
    '3sum': ['先固定第一个下标 i', '再枚举第二个下标 j', '最后枚举第三个下标 k', '检查 nums[i]+nums[j]+nums[k] 是否为 0', '还要额外处理重复三元组，所以会又慢又绕'],
    'trapping-rain-water': ['固定一个位置 i', '向左扫描找到左边最高柱子', '向右扫描找到右边最高柱子', '当前位置能接的水是 min(leftMax,rightMax)-height[i]', '每个位置都重复向两边扫，时间会变成平方级'],
    'maximal-square': ['固定每一个左上角', '枚举可能的边长', '检查这个正方形内部是否全是 1', '全是 1 就更新最大面积', '大量格子会被反复检查'],
    'maximum-product-subarray': ['固定子数组左端点', '向右不断乘出当前子数组乘积', '每得到一个乘积就更新答案', '负数会让最大和最小互相翻转', '枚举所有区间会重复计算太多乘积'],
    'perfect-squares': ['把数字 n 看成起点', '每次减去一个平方数', '减到 0 时步数就是一种答案', 'BFS 第一层层推进可以找到最少次数', '但 DP 写法更适合直接提交和复盘'],
    'search-a-2d-matrix-ii': ['从第一行开始逐行检查', '每一行用二分查找 target', '找到就返回 true', '所有行都查完还没有就返回 false', '问题是没有利用“列也升序”的信息'],
    'course-schedule': ['用一个 learned 集合记录已经能学的课', '每一轮扫描全部 prerequisites', '如果某门课的前置课都学过，就把它加入 learned', '一轮扫描没有新增课程就停下', '这种写法会反复扫描同一批依赖'],
    'evaluate-division': ['每个等式 a/b=value 建两条边', 'a -> b 权重 value', 'b -> a 权重 1/value', '查询时从起点搜索终点', '沿路把权重连续相乘'],
    'implement-trie-prefix-tree': ['最朴素可以把所有单词存在列表里', 'search 就逐个比较完整单词', 'startsWith 就逐个比较前缀', '单词多了以后每次查询都要扫很多字符串', '所以需要把公共前缀共享起来'],
    'unique-binary-search-trees': ['枚举哪个数字当根', '根左边只能组成左子树', '根右边只能组成右子树', '左右子树数量相乘得到当前根的方案数', '递归会重复计算同样规模的子树'],
    'sliding-window-maximum': ['固定每个长度为 k 的窗口', '窗口内逐个扫描找最大值', '把最大值放进答案', '窗口右移一格后再扫描一遍', '重复扫描让时间变成 O(nk)'],
    'largest-rectangle-in-histogram': ['固定一根柱子作为矩形高度', '向左找到第一个更矮柱子', '向右找到第一个更矮柱子', '用宽度乘高度更新最大面积', '每根柱子都扩展会重复找边界'],
    'word-search': ['在网格中找等于首字母的起点', '从起点向上下左右递归', '当前格子必须匹配 word 的当前字符', '用额外 visited 记录走过的格子', '走不通就撤销标记回到上一步'],
    'lru-cache': ['用一个列表按使用时间保存 key', 'get 时线性查找 key', '命中后把它挪到最新位置', 'put 时也要线性查找和更新', '容量满了删除列表头部最旧 key'],
    'regular-expression-matching': ['从 s 和 p 的当前位置开始递归匹配', '普通字符必须相等', '. 可以匹配任意一个字符', '* 可以让前一个字符取 0 次或多次', '同一组 i、j 会被反复递归到'],
    'edit-distance': ['递归比较 word1[i] 和 word2[j]', '相同就一起往前走', '不同就尝试插入、删除、替换', '三种操作取最小值再加一', '大量前缀/后缀状态会重复出现'],
    'median-of-two-sorted-arrays': ['先把两个有序数组合并', '合并过程中保持整体有序', '总长度为奇数取中间一个', '总长度为偶数取中间两个的平均值', '这样是 O(m+n)，还没达到题目要求'],
    'find-the-duplicate-number': ['用 set 记录见过的数字', '遍历 nums 中每个数', '如果已经出现过就返回它', '没出现过就加入 set', '这个做法简单但用了额外空间'],
    'hamming-distance': ['把两个整数写成二进制', '从低位到高位逐位比较', '不同就把计数加一', '所有位比较完返回计数', '可以用异或一次性标出不同位'],
    'product-of-array-except-self': ['先准备 prefix 数组，prefix[i] 表示 i 左边所有数的乘积', '再准备 suffix 数组，suffix[i] 表示 i 右边所有数的乘积', '样例 nums=[1,2,3,4] 时，prefix=[1,1,2,6]', 'suffix=[24,12,4,1]', '最后 output[i] = prefix[i] × suffix[i]'],
    'search-in-rotated-sorted-array': ['从左到右扫描 nums', '每个位置都和 target 比较', '相等就返回当前下标', '扫描完整个数组还没找到就返回 -1', '这个做法没有利用旋转数组局部有序的特点'],
    'search-in-rotated-sorted-array-ii': ['从左到右扫描 nums', '每个元素都和 target 比较', '只要命中就返回 true', '扫描结束仍未命中就返回 false', '重复元素不会影响正确性，但线性扫描没有优化'],
    'counting-bits': ['遍历 0 到 n 的每个整数 i', '直接调用 i.bit_count() 统计二进制 1 的个数', '把结果写进 ans[i]', '所有数字都处理完后返回 ans', '这个写法简单，但没有展示动态规划递推关系'],
    'longest-palindromic-substring': ['枚举每个子串 s[i..j]', '检查这个子串是不是回文', '如果是回文就和当前最长答案比较', '问题是大量子串会重复比较内部字符'],
    'palindromic-substrings': ['枚举每个子串 s[i..j]', '逐个判断它是否为回文', '是回文就把计数加一', '问题是判断回文会重复扫描很多字符'],
    'validate-binary-search-tree': ['中序遍历 BST 应该得到严格递增序列', '先把中序结果收进数组', '再检查相邻元素是否严格递增', '这个做法直观但额外保存了整棵树的值'],
    'convert-bst-to-greater-tree': ['BST 中序是升序，反中序就是从大到小', 'sum 保存已经访问过的更大节点之和', '先递归右子树，再更新当前节点', '最后递归左子树'],
    'serialize-and-deserialize-binary-tree': ['序列化按前序写节点值', '空节点也写成 # 占位', '反序列化按同样顺序读 token', '遇到 # 就还原成 None'],
    'best-time-to-buy-and-sell-stock': ['枚举买入日 i', '枚举卖出日 j，且 j 必须在 i 之后', '计算 prices[j] - prices[i]', '用这个利润更新最大值', '所有买卖组合扫完后返回最大利润'],
    'daily-temperatures': ['固定某一天 i', '从 i+1 开始向右找', '遇到第一个更高温度的日期 j', 'answer[i] = j - i', '如果后面都没有更高温，就保持 0'],
    'decode-string': ['从左到右读取字符', '读到数字先解析重复次数', '读到 [ 就递归解析内部字符串', '读到 ] 返回当前层字符串', '外层把子串重复后拼回结果'],
    'find-all-anagrams-in-a-string': ['先把 p 排序成目标签名', '枚举 s 中每个长度为 len(p) 的窗口', '对窗口排序后比较签名', '相等就记录窗口起点', '每个窗口都排序会重复工作'],
    'find-all-numbers-disappeared-in-an-array': ['先把 nums 放进 set', '从 1 到 n 逐个检查', '不在 set 里的数字就是消失数字', '把消失数字加入答案', '这个做法需要 O(n) 额外空间'],
    'intersection-of-two-linked-lists': ['先遍历 A 链表，把每个节点对象放进 set', '再遍历 B 链表', '第一个出现在 set 里的节点就是交点', 'B 走完还没命中就返回 None', '空间花在保存 A 的节点'],
    'jump-game': ['dp[0] 先标记为可达', '对每个可达位置 i 枚举能跳到的下标 j', '把这些 j 标记为可达', '最后检查 dp[n-1]', '同一段可达区间会被反复枚举'],
    'kth-largest-element-in-an-array': ['先把整个数组排序', '第 k 大对应排序后下标 n-k', '直接返回这个位置的元素', '排序会把所有元素都排完整', '但题目其实只需要第 k 大'],
    'linked-list-cycle-ii': ['cur 从 head 出发', '每个节点先查是否在 seen 中', '第一次重复遇到的节点就是入环点', '没见过就加入 seen 并继续走', '走到 None 说明无环，返回 null'],
    'longest-substring-without-repeating-characters': ['固定左端点 left', '从 left 向右扩展子串', '用 set 检查是否出现重复字符', '遇到重复就停止当前起点', '更新最长长度后换下一个 left'],
    'longest-valid-parentheses': ['定义 dp[i] 为以 i 结尾的最长有效括号长度', '只在 s[i] 是右括号时尝试匹配', '如果前一个是左括号，就接上 dp[i-2]', '如果前面已有有效串，就跳到它前面找左括号', '每次更新全局最长长度'],
    'majority-element': ['遍历数组统计每个数出现次数', '某个数计数超过 n/2 就可以返回', '也可以遍历完哈希表再找答案', '逻辑很直观', '但需要 O(n) 额外空间'],
    'maximal-rectangle': ['枚举矩形上边界 top', '枚举下边界 bottom', '把每列在 top 到 bottom 是否全为 1 压成数组', '在压缩数组里找最长连续 1', '用高度乘宽度更新最大面积'],
    'binary-tree-inorder-traversal': ['递归函数接收当前节点 root', '空节点直接返回', '先递归遍历左子树', '再把 root.val 加入结果', '最后递归遍历右子树'],
    'binary-tree-level-order-traversal': ['队列初始只放 root', '每一轮先记录当前队列长度 size', '连续弹出 size 个节点，正好是一整层', '把这一层的左右孩子加入队列', '下一轮再处理下一层'],
    'construct-binary-tree-from-preorder-and-inorder-traversal': ['preorder 的第一个数就是当前根', '在 inorder 中线性查找根的位置', '根左边属于左子树，根右边属于右子树', '按左子树大小切分 preorder', '递归构造左右子树并接回根节点'],
    'flatten-binary-tree-to-linked-list': ['先做一次前序遍历收集所有节点', '按收集顺序逐个重连 right 指针', '每个节点的 left 都置为 None', '最后一个节点的 right 也置为 None', '这样直观但需要保存整条前序列表'],
    'maximum-subarray': ['固定左端点 left', '向右累加当前子数组和', '每扩展一次就更新最大值', '换下一个 left 后重新累加', '相邻子数组的公共部分会被重复计算'],
    'merge-intervals': ['维护一个已合并区间列表', '每来一个新区间就和已有区间逐个比较', '能重叠就合并端点', '不能重叠就插入列表', '每个新区间都可能扫一遍已有结果'],
    'merge-two-sorted-lists': ['比较 l1.val 和 l2.val', '较小节点作为当前返回头', '递归合并这个节点的 next 和另一条链表', '有一个链表为空就返回另一个', '递归栈会占 O(m+n) 空间'],
    'min-stack': ['主栈只保存所有元素', 'push、pop、top 都按普通栈处理', 'getMin 时遍历整个栈找最小值', '返回扫描得到的最小值', '频繁 getMin 会让操作变慢'],
    'minimum-window-substring': ['枚举左端点', '枚举右端点形成子串', '统计这个子串是否覆盖 t', '覆盖就更新最短答案', '每个窗口都重新统计会很慢'],
    'next-permutation': ['从右往左找一个可以增大的位置 i', '在右侧找比 nums[i] 大的候选', '交换后把右侧后缀排序成最小', '这样得到下一个更大排列', '排序后缀需要 O(n log n)'],
    'number-of-islands': ['从左上到右下扫描网格', '遇到 1 说明发现新岛', '岛屿数量加一', '立刻 DFS/BFS 标记相连陆地', '后续扫描不会重复统计同一座岛'],
    'palindrome-linked-list': ['遍历链表，把节点值放入数组', 'left 和 right 从数组两端向中间比较', '遇到不同就返回 false', '全部相同返回 true', '数组保存所有值需要 O(n) 空间'],
    'queue-reconstruction-by-height': ['从空队列开始尝试插入每个人', '每个位置都临时放入并检查约束', '找到可行位置就保留', '继续放下一个人', '大量尝试和校验导致 O(n³)'],
    'remove-nth-node-from-end-of-list': ['第一次遍历链表统计长度 L', '要删除的位置是 L-n+1', '第二次从 dummy 走到待删节点前一个', '把 prev.next 指向 prev.next.next', '需要走两趟链表'],
    'reverse-linked-list': ['递归到链表尾部', '尾节点成为新的头', '回溯时让 head.next.next 指向 head', '再把 head.next 置空', '递归栈需要 O(n) 空间'],
    'shortest-unsorted-continuous-subarray': ['复制 nums 并排序', '从左往右找第一个不同位置', '从右往左找最后一个不同位置', '两个位置之间就是需要排序的子数组', '排序带来 O(n log n) 时间'],
    'single-number': ['用哈希表统计每个数字出现次数', '再次遍历计数字典', '出现次数为 1 的数字就是答案', '逻辑直观', '但需要 O(n) 额外空间'],
    'sort-colors': ['先统计 0、1、2 各出现多少次', '再按计数把数组前段写 0', '中段写 1', '后段写 2', '需要两趟扫描'],
    'sort-list': ['把链表节点值收集到数组', '对数组排序', '再按排序结果写回链表或重建链表', '返回新的有序链表', '空间需要 O(n)'],
    'task-scheduler': ['统计每个任务剩余次数', '每一轮优先执行剩余次数最多且不在冷却中的任务', '执行后把它放入冷却队列', '没有可执行任务就空转', '模拟过程比公式更繁琐'],
    'top-k-frequent-elements': ['先统计每个元素频率', '把频率项按次数降序排序', '取前 k 个元素', '排序会处理所有频率项的完整顺序', '但题目只需要前 k 个'],
    'find-minimum-in-rotated-sorted-array': ['先把 nums[0] 当作当前最小值', '从左到右遍历整个数组', '每遇到一个更小的数就更新答案', '遍历结束返回最小值', '这个做法没有利用旋转数组仍然局部有序的特点'],
    'generate-parentheses': ['长度一共是 2n，每个位置都尝试放左括号或右括号', '生成完整字符串后再检查是否合法', '检查时左括号计数不能为负', '最终左右括号数量都要等于 n', '大量非法前缀也被生成出来'],
    'longest-consecutive-sequence': ['先把 nums 排序', '从左到右扫描排序后的数组', '相邻数字差 1 就延长当前连续长度', '遇到重复数字跳过', '断开时用当前长度更新最大值'],
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  const directStepFixes = {
    'best-time-to-buy-and-sell-stock-with-cooldown': ['定义 hold、sold、rest 三个状态', '每天根据买入、卖出、冷冻关系转移', '卖出后的下一天只能进入冷冻状态', '最后答案取不持股状态里的最大值'],
    'burst-balloons': ['把区间两端补成虚拟气球 1', '定义 dp[l][r] 表示开区间内能拿到的最多硬币', '枚举最后一个被戳破的气球 k', '左右区间先算好，再加 nums[l] * nums[k] * nums[r]'],
    'climbing-stairs': ['定义 dp[i] 表示爬到第 i 阶的方法数', '第 i 阶只能从 i-1 或 i-2 来', '所以 dp[i] = dp[i-1] + dp[i-2]', '用 1、2、3 阶的小例子先把初始值对齐'],
    'coin-change': ['定义 dp[x] 表示凑出金额 x 的最少硬币数', 'dp[0] 初始化为 0，其余先设为无穷大', '枚举每个金额时尝试所有硬币', '如果 x-coin 可达，就用 dp[x-coin]+1 更新 dp[x]'],
    'house-robber': ['定义 dp[i] 表示偷到第 i 间房的最大金额', '当前房子偷或不偷二选一', '偷当前就加 dp[i-2]', '不偷当前就继承 dp[i-1]'],
    'longest-increasing-subsequence': ['定义 dp[i] 表示以 nums[i] 结尾的最长递增长度', '枚举 i 前面的每个 j', '只有 nums[j] < nums[i] 才能接到 i 后面', '用 dp[j]+1 更新 dp[i]'],
    'maximal-square': ['定义 dp[i][j] 表示以当前格为右下角的最大正方形边长', '只有当前格是 1 才能扩展', '看左、上、左上三个格子的最小值', '边长加一后更新最大面积'],
    'maximum-product-subarray': ['同时维护当前位置结尾的最大乘积和最小乘积', '遇到负数时最大和最小会互换角色', '每一步都用当前数、当前数乘最大、当前数乘最小取新值', '全局答案记录出现过的最大乘积'],
    'minimum-path-sum': ['定义 dp[i][j] 表示走到当前格子的最小路径和', '当前格只能从上方或左方来', '取两者较小值再加 grid[i][j]', '第一行和第一列只能单方向累加'],
    'move-zeroes': ['slow 指向下一个非零数应该写入的位置', '从左到右扫描 nums', '遇到非零就写到 slow，并让 slow 前进', '扫描结束后把 slow 之后的位置补 0'],
    'partition-equal-subset-sum': ['先判断总和是否为偶数', '目标变成能否选出和为 sum/2 的子集', '定义背包状态记录每个容量能否被装满', '每个数字只能用一次，所以容量要倒序更新'],
    'perfect-squares': ['定义 dp[i] 表示组成 i 的最少完全平方数个数', '初始化 dp[0]=0，其余为无穷大', '枚举每个 i，再枚举不超过 i 的平方数', '用 dp[i-square]+1 更新 dp[i]'],
    'target-sum': ['把加号集合记为 P，减号集合记为 N', '由 P-N=target 和 P+N=sum 推出 P=(sum+target)/2', '问题转成选若干数凑出 P 的方案数', '按 0/1 背包倒序累计方案数'],
    'unique-paths': ['定义 dp[i][j] 表示到达当前格子的路径数', '机器人只能从上方或左方来到这里', '所以当前格等于上方加左方', '第一行和第一列都只有一条路径'],
    'word-break': ['定义 dp[i] 表示 s[:i] 能否被词典拆分', '枚举最后一段单词的起点 j', '如果 dp[j] 为真且 s[j:i] 在词典里', '就把 dp[i] 标记为真'],
  };
  Object.assign(directStepFixes, {
    'coin-change': ['dfs(rest) 表示凑出 rest 还需要的最少硬币数', '枚举最后选哪一枚 coin，转到 dfs(rest-coin)+1', 'rest=0 返回 0，rest<0 记为不可达', '同一个 rest 会反复出现，所以用 memo 记住结果'],
    'binary-tree-maximum-path-sum': ['left = max(gain(node.left), 0)，负贡献直接丢掉', 'right = max(gain(node.right), 0)，只保留能让路径变大的分支', '用 node.val + left + right 更新全局答案 ans', '返回给父节点时只能选一边：node.val + max(left, right)'],
  });
  if (directStepFixes[problem.slug]) return directStepFixes[problem.slug];
  if (problem.slug === 'linked-list-cycle') {
    return ['cur 从 head 出发', '每到一个节点先查 seen', '没见过就放进 seen', '再次遇到同一节点返回 true', '走到 None 返回 false'];
  }
  if (problem.slug === 'add-two-numbers') {
    return ['把 l1、l2 还原成整数', '两个整数相加', '再把结果拆成链表', '问题是长链表不适合转整数'];
  }
  if (problem.slug === 'valid-parentheses') {
    return ['不断删除 ()、[]、{}', '删完一轮再从头扫描', '最终空串返回 true', '每轮重复扫描，时间会变慢'];
  }
  const items = sentenceItems(brute?.idea || problem.bruteForceIdea, 5);
  if (items.length >= 3) return items;
  if (problem.category.includes('动态规划')) {
    return ['按定义递归枚举选择', '子问题会反复出现', '先保证答案正确', '再把重复子问题存起来'];
  }
  if (problem.category.includes('二叉树')) {
    return ['从 root 开始递归', '先处理左子树', '再处理右子树', '最后合并当前节点答案'];
  }
  if (problem.category.includes('回溯')) {
    return ['枚举当前位置的所有选择', '选择一个就向下一层递归', '递归回来撤销选择', '不合法分支直接跳过'];
  }
  if (problem.category.includes('矩阵')) {
    return ['新建同尺寸矩阵', '按坐标关系把旧值放到新位置', '再把新矩阵写回原矩阵', '问题是多用一份矩阵空间'];
  }
  if (problem.category.includes('图论')) {
    return ['遍历每个点或格子', '遇到目标就启动 DFS/BFS', '把连通部分标记已访问', '避免同一块区域重复计数'];
  }
  if (problem.category.includes('栈') || problem.category.includes('队列')) {
    return ['从左到右扫描输入', '把暂时无法结算的信息放进栈或队列', '当前元素能解决旧信息时就弹出并结算', '剩余信息按题目规则收尾'];
  }
  if (problem.category.includes('滑动窗口')) {
    return ['固定窗口左右边界含义', '右指针把新元素纳入窗口', '窗口不满足条件时移动左指针', '每次窗口合法时更新答案'];
  }
  if (problem.category.includes('双指针')) {
    return ['先确定左右指针分别站在哪里', '根据当前和、面积或大小关系移动一侧', '移动前更新候选答案', '重复值或边界位置要单独处理'];
  }
  if (problem.category.includes('二分')) {
    return ['把答案或下标放进一个搜索区间', '每次取 mid 做条件判断', '根据判断丢掉不可能的一半', '循环结束时返回收缩后的边界'];
  }
  if (problem.category.includes('哈希') || problem.category.includes('前缀和')) {
    return ['遍历输入并维护记录表', '先查询当前元素需要的 key', '如果命中就更新答案', '再把当前状态写入记录表'];
  }
  if (problem.category.includes('堆')) {
    return ['先确定堆顶要代表最大还是最小', '遍历元素并放入堆', '堆大小超过限制时弹出堆顶', '最后从堆或统计结果得到答案'];
  }
  if (problem.category.includes('贪心')) {
    return ['先定义当前最优选择规则', '按规则扫描或排序输入', '每一步只保留当前必要状态', '遇到更优选择时更新答案'];
  }
  return ['按下标扫描输入', '把当前元素转成题目需要的状态', '根据状态更新候选答案', '最后返回题目要求的结果'];
}

function optimizationSteps(problem, recommended, model, refinement) {
  const bySlug = {
    'search-a-2d-matrix-ii': ['从右上角元素开始', '如果当前值等于 target，直接返回 true', '如果当前值大于 target，当前列往下只会更大，所以左移一列', '如果当前值小于 target，当前行往左只会更小，所以下移一行', '越界还没找到就返回 false'],
    'course-schedule': ['先把每条依赖建成 b -> a 的有向边', '统计每门课还有多少前置课没有学，也就是入度', '把入度为 0 的课程放进队列', '每学完一门课，就把它指向的课程入度减一', '最后学完数量等于 numCourses 才返回 true'],
    'evaluate-division': ['把等式建成带权有向图', '查询 a/c 时从 a 开始 DFS 或 BFS', '路径上每走一条边就把当前乘积乘上边权', '走到目标点就返回这个乘积', '起点或终点不存在、路径不连通就返回 -1.0'],
    'implement-trie-prefix-tree': ['每个 Trie 节点保存 children 字典', 'insert 时按字符向下走，没有节点就创建', '单词结束位置标记 isEnd', 'search 必须走完整个单词并且 isEnd 为真', 'startsWith 只要前缀路径能走完就返回 true'],
    'unique-binary-search-trees': ['定义 dp[i] 表示 i 个连续数字能组成多少棵 BST', '初始化 dp[0]=1，空子树也算一种方案', '枚举节点数 i，再枚举 root 作为根的位置', '左边 root-1 个节点，右边 i-root 个节点', 'dp[i] 累加 dp[left] * dp[right]'],
    'sliding-window-maximum': ['队列里保存下标，且对应值从大到小', '窗口右移时先移除过期下标', '新元素进队前，把队尾比它小的元素弹掉', '当前下标入队', '窗口形成后，队首就是当前最大值'],
    'largest-rectangle-in-histogram': ['栈里保存高度递增的柱子下标', '遇到更矮的柱子，说明栈顶高度的右边界确定了', '弹出栈顶并用当前下标计算宽度', '面积等于弹出高度乘宽度', '末尾补 0，把栈里剩余柱子统一结算'],
    'word-search': ['先用字符频次判断 board 是否可能拼出 word', '从每个等于首字母的格子出发', '匹配当前字符后把原格子临时改成占位符，不再另开 visited', '递归只走上下左右四个方向，越界或字符不等立即失败', '四个方向任一成功就返回 true，失败则恢复原字符'],
    'lru-cache': ['哈希表负责 key 到节点的 O(1) 查找', '双向链表负责维护最近使用顺序', 'get 命中后把节点移动到链表头部', 'put 已存在就改值并移到头部', '容量超出时删除尾部节点，并同步删除哈希表 key'],
    'regular-expression-matching': ['定义 dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符', '空串匹配要先初始化第一行', '普通字符或 . 看左上角 dp[i-1][j-1]', '* 有两种选择：匹配 0 个或继续匹配多个', '按行列顺序填完整张表，答案在 dp[m][n]'],
    'edit-distance': ['定义 dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作', '第一行表示从空串插入，第一列表示删成空串', '字符相同就继承左上角', '字符不同就在插入、删除、替换里取最小值加一', '从左到右、从上到下填表'],
    'median-of-two-sorted-arrays': ['只在较短数组上二分切分位置', '让左半边元素总数等于右半边或多一个', '检查 maxLeftA <= minRightB 且 maxLeftB <= minRightA', '不满足就移动 A 的切分线', '切分合法后直接算中位数'],
    'find-the-duplicate-number': ['把 nums[i] 看成从下标 i 指向下一个下标的边', '因为有重复数，这张函数图一定有环', 'slow 每次走一步，fast 每次走两步，先在环内相遇', '把一个指针放回起点，两者再同步走', '再次相遇的位置就是重复数'],
    'hamming-distance': ['先计算 xor = x ^ y', 'xor 的 1 表示这一位不同', '不断检查最低位是否为 1', '每轮右移一位继续数', '最后 1 的个数就是汉明距离'],
    'product-of-array-except-self': ['第一遍从左到右，ans[i] 先存 i 左边所有数的乘积', '用 prefix 滚动维护左侧乘积', '第二遍从右到左维护 suffix', 'ans[i] 再乘上 i 右边所有数的乘积', '不使用除法，也只用 O(1) 额外变量'],
    'best-time-to-buy-and-sell-stock': ['min_price 记录遍历到今天之前的最低买入价', '今天卖出的利润是 price - min_price', '用这个利润更新 max_profit', '再用当前 price 更新 min_price', '一趟扫描结束后 max_profit 就是答案'],
    'jump-game': ['farthest 记录当前能到达的最远下标', '遍历到 i 时，先判断 i 是否已经超过 farthest', '超过就说明前面跳不到这里，直接返回 false', '否则用 i + nums[i] 更新 farthest', 'farthest 覆盖最后一个下标时就可以成功'],
    'next-permutation': ['从右往左找第一个 nums[i] < nums[i+1] 的位置', '这个位置就是还能变大的 pivot', '再从右往左找第一个大于 nums[i] 的数', '交换这两个数', '把 pivot 右侧后缀反转成升序'],
    'palindrome-linked-list': ['快慢指针先找到链表中点', '从中点开始反转后半段链表', '一个指针从头走，一个指针从后半段头走', '逐个比较节点值', '全部相等就是回文'],
    'merge-two-sorted-lists': ['dummy 节点统一处理新链表头', 'l1 和 l2 分别指向两个链表当前节点', '每次把较小节点接到 cur 后面', 'cur 和被选中的链表指针一起前进', '其中一个链表空了就接上另一个剩余部分'],
    'remove-nth-node-from-end-of-list': ['dummy 指向 head，统一处理删除头节点', 'fast 先走 n 步拉开距离', 'fast 和 slow 再同步向后走', 'fast 到尾部时 slow 正好在待删节点前一个', '改 slow.next 完成删除'],
    'reverse-linked-list': ['prev 表示已经反转好的前一段头部', 'cur 表示当前正在处理的节点', '先保存 nxt = cur.next 防止断链', '再把 cur.next 指向 prev', 'prev 和 cur 同时向后移动'],
    'sort-colors': ['left 左边全是 0', 'right 右边全是 2', 'i 扫描中间未知区', '遇到 0 就和 left 交换并前进', '遇到 2 就和 right 交换，i 暂时不动'],
    'min-stack': ['主栈保存所有元素', '辅助栈保存当前最小值历史', 'push 时如果新值不大于当前最小值，辅助栈也入栈', 'pop 时如果弹出的是当前最小值，辅助栈同步弹出', 'getMin 直接返回辅助栈栈顶'],
    'top-k-frequent-elements': ['先统计每个元素出现次数', '创建下标为频率的 buckets', '出现次数为 freq 的元素放入 buckets[freq]', '从高频桶往低频桶收集元素', '收集到 k 个就返回'],
    'task-scheduler': ['最高频任务决定冷却框架数量', 'max_count - 1 个完整间隔块，每块长度 n + 1', '最后一块加上同为最高频的任务种类数', '公式结果还要和任务总数取最大值', '因为其他任务足够多时可以填满所有空位'],
    'queue-reconstruction-by-height': ['先按身高降序排序', '同身高按 k 升序排序', '高个子先入队，后来的矮个子不会影响他们的 k', '每个人直接插入下标 k', '插完所有人就是合法队列'],
    'majority-element': ['candidate 保存当前候选多数元素', 'count 表示候选相对其他元素的票数', 'count 为 0 时换当前数做候选', '遇到相同数 count 加一，不同数 count 减一', '多数元素超过一半，抵消后一定留下'],
    'single-number': ['ans 初始为 0', '遍历每个数并执行 ans ^= x', '相同数字异或会抵消成 0', '0 和目标数字异或仍是目标数字', '最终 ans 就是只出现一次的数'],
    'maximum-subarray': ['cur 表示必须以当前元素结尾的最大子数组和', '如果 cur 加当前数还不如当前数，就从当前数重新开始', '否则把当前数接到前一段后面', '每一步用 cur 更新 ans', 'ans 保存全局最大子数组和'],
    'merge-intervals': ['先按区间左端点排序', 'merged 保存已经合并好的区间', '当前区间起点小于等于最后区间终点时合并', '合并只需要扩展右端点', '不重叠就直接追加新区间'],
    'find-all-numbers-disappeared-in-an-array': ['数组值都在 1 到 n，可以映射到下标 x-1', '遍历每个数字 x 时取 abs(x)', '把 nums[x-1] 标记为负数表示 x 出现过', '最后仍为正数的位置说明对应数字没出现', '整个过程只借用原数组做标记'],
    'intersection-of-two-linked-lists': ['pA 先走 A 链表，走完后切到 B', 'pB 先走 B 链表，走完后切到 A', '两个指针最终都走 m+n 的长度', '如果有交点，会在交点相遇', '如果没有交点，会同时变成 None'],
    'shortest-unsorted-continuous-subarray': ['从左到右维护历史最大值', '如果 nums[i] 小于历史最大值，右边界至少到 i', '从右到左维护历史最小值', '如果 nums[i] 大于历史最小值，左边界至少到 i', '两个边界之间就是最短无序子数组'],
    'sort-list': ['快慢指针找到链表中点', '从中点把链表断成两半', '递归排序左右两段', '再合并两个有序链表', '链表适合归并，因为合并只改 next 指针'],
    'minimum-window-substring': ['右指针扩张窗口并统计字符', 'formed 记录已经满足频次要求的字符种类数', '窗口覆盖 t 后尝试移动 left 收缩', '每次收缩前更新最短答案', '左右指针都只向右移动'],
    'find-all-anagrams-in-a-string': ['窗口长度固定为 len(p)', 'need 记录 p 的字符频率', 'window 记录当前窗口频率', '每次右移加入新字符并移出左侧旧字符', 'window 等于 need 时记录左端点'],
    'longest-substring-without-repeating-characters': ['窗口内始终保持无重复字符', 'right 加入新字符前先判断是否重复', '重复时不断移除 s[left] 并右移 left', '加入 s[right] 后更新最大长度', '每个字符最多进出窗口一次'],
    'daily-temperatures': ['栈里保存还没等到更暖日的下标', '当前温度大于栈顶那天温度时，栈顶答案确定', '弹出栈顶并计算 i - prev', '继续弹出所有被当前温度解决的日期', '当前日期最后入栈等待未来更高温'],
    'decode-string': ['cur 保存当前层已经解析出的字符串', 'num 保存当前读到的重复次数', '遇到 [ 时把上一层 cur 和 num 入栈', '遇到 ] 时弹出上一层并拼接 cur * times', '普通字母直接追加到 cur'],
    'longest-valid-parentheses': ['栈底保存上一个无法匹配的位置', '初始放入 -1 作为长度基准', '遇到左括号就压入下标', '遇到右括号先弹出一个下标', '栈不空时用 i - stack[-1] 更新答案，栈空则放入当前下标'],
    'maximal-rectangle': ['把每一行当成柱状图底边', 'heights[j] 记录这一列向上连续 1 的高度', '遇到 0 就把 heights[j] 清零', '每更新完一行就套柱状图最大矩形', '所有行的最大值就是答案'],
    'binary-tree-inorder-traversal': ['cur 指针从 root 开始', '一路向左走，沿途节点全部入栈', '不能再向左时弹出栈顶并访问它', '访问后把 cur 转向这个节点的右子树', 'while cur or stack 保证所有节点都按左、根、右访问'],
    'binary-tree-level-order-traversal': ['队列初始只放 root', '每一轮先记录当前队列长度 size', '连续弹出 size 个节点，正好是一整层', '把这一层的左右孩子加入队列，留给下一轮处理', '每轮收集一个 level 列表放入答案'],
    'construct-binary-tree-from-preorder-and-inorder-traversal': ['用哈希表记录 inorder 中 value 到下标的映射', 'pre_pos 永远指向 preorder 中下一个根节点', '递归函数只传 inorder 的左右边界，不切新数组', '取 preorder[pre_pos] 建根并推进 pre_pos', '用根在 inorder 的位置递归构造左右子树'],
    'flatten-binary-tree-to-linked-list': ['按右、左、根的顺序反向遍历', 'prev 保存已经展开好的链表头', '处理当前节点时让 node.right 指向 prev', '同时把 node.left 置为 None', '最后把 prev 更新成当前节点'],
    'find-minimum-in-rotated-sorted-array': ['left 和 right 表示最小值仍可能存在的区间', '取 mid 和 nums[right] 比较', '如果 nums[mid] 大于 nums[right]，最小值一定在 mid 右侧', '否则最小值在 left 到 mid 之间', '区间收缩到一个位置时就是最小值'],
    'generate-parentheses': ['left 记录已经放了多少个左括号', 'right 记录已经放了多少个右括号', 'left 小于 n 时才可以继续放左括号', 'right 小于 left 时才可以放右括号', '长度达到 2n 时记录当前合法组合'],
    'longest-consecutive-sequence': ['先把所有数字放进 set', '只有 num-1 不在 set 中时，num 才是连续序列起点', '从起点开始不断检查 num+1 是否存在', '计算这一段连续长度', '只从起点扩展，避免从序列中间重复计数'],
    'add-two-numbers': ['同时遍历 l1 和 l2 的当前节点', 'total 等于两个节点值加 carry', '当前位写 total % 10', '新的 carry 等于 total // 10', '链表走完后如果 carry 还在，要再补一个节点'],
    'word-break': ['dp[i] 表示 s[:i] 能否被词典拆出', '枚举切分点 j', '如果 dp[j] 为真，并且 s[j:i] 在词典中', '就把 dp[i] 标记为真', '最后返回 dp[len(s)]'],
    'regular-expression-matching': ['dp[i][j] 表示 s[:i] 能否匹配 p[:j]', '普通字符或点号看 dp[i-1][j-1]', '星号可以让前一个字符出现 0 次', '星号也可以继续吃掉当前字符', '最终答案是 dp[m][n]'],
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  if (['linked-list-cycle', 'linked-list-cycle-ii', 'remove-nth-node-from-end-of-list'].includes(problem.slug)) {
    return reasoningSteps(problem, refinement, model, recommended).slice(0, 5).map(cleanStep);
  }
  const directIdea = ideaActions(recommended?.idea || problem.optimizedIdea || refinement?.coreIdea, 5);
  if (directIdea.length >= 3) return directIdea;
  if (problem.category.includes('动态规划')) return ['定义状态代表什么', '找到旧状态如何推出新状态', '初始化最小规模', '按依赖方向遍历', '用小样例推一遍表格'];
  if (problem.category.includes('二叉树')) return ['确定递归函数返回值', '空节点先返回边界答案', '左右子树递归拿结果', '当前节点只做合并'];
  if (problem.category.includes('栈') || problem.category.includes('队列')) return ['栈里只放未解决的信息', '当前元素能解决栈顶就弹出', '弹出时结算答案', '不能解决就入栈等待'];
  if (problem.category.includes('滑动窗口')) return ['右指针扩张窗口', '窗口不合法就移动左指针', '每轮维护窗口含义', '在合法时更新答案'];
  if (problem.category.includes('双指针')) return ['先确定两个指针的含义', '根据大小或条件移动一侧', '移动后不漏掉可能答案', '命中时更新结果并处理重复'];
  if (problem.category.includes('二分')) return ['定义搜索区间含义', '取 mid 做判断', '丢掉不可能的一半', '循环结束返回边界'];
  if (problem.category.includes('矩阵') && /转置|反转|旋转/.test(problem.optimizedIdea || '')) return ['沿主对角线转置矩阵', '再把每一行左右反转', '两个动作合起来就是顺时针 90 度', '1×1 和 2×2 用来检查边界'];
  if (problem.category.includes('图论') || problem.category.includes('矩阵')) return ['把格子看成图上的点', '从未访问点开始搜索', '访问时立刻标记', '四方向或邻接表继续扩展'];
  if (problem.category.includes('哈希') || problem.category.includes('前缀和')) return ['先确定 key 存什么', 'value 存需要快速查到的信息', '遍历时先查表', '再写入当前状态'];
  const items = sentenceItems(recommended?.idea || problem.optimizedIdea || problem.whyThisPattern, 5);
  return items.length >= 3 ? items : model.steps;
}

function bottleneckText(problem, brute, recommended) {
  const bySlug = {
    'lowest-common-ancestor-of-a-binary-tree': '这题不是比较节点值大小，而是看左右子树有没有命中 p 或 q；如果左右都命中，当前节点就是最近公共祖先。',
    'number-of-islands': '扫描到一个未访问的 1 就发现一座新岛；马上用 DFS/BFS 把连通的陆地全部标记掉，后面才不会重复计数。',
    'serialize-and-deserialize-binary-tree': '只写节点值不够还原结构；必须把空节点也写进序列，反序列化时才能按同一顺序把左右子树接回来。',
    'symmetric-tree': '对称不是看同一侧，而是外侧对外侧、内侧对内侧；每一层都比较 left.val 和 right.val，再递归比较交叉子树。',
    'search-a-2d-matrix-ii': '逐行查找没有同时利用“行升序”和“列升序”；从右上角走可以每一步排除一整行或一整列。',
    'course-schedule': '反复扫描依赖会把同一条先修关系看很多遍；拓扑排序用入度队列把“当前能学的课”一次性维护住。',
    'evaluate-division': '这题的关键成本在于模型没建好；把等式变成带权边以后，查询就是找一条路径并累乘权重。',
    'implement-trie-prefix-tree': '列表逐词比较会反复扫描相同前缀；Trie 把公共前缀合并成一条路径。',
    'unique-binary-search-trees': '递归枚举根会重复计算同样规模的左右子树；dp 按节点数量复用结果。',
    'sliding-window-maximum': '每个窗口都重新扫描会重复比较；单调队列让最大值一直停在队首。',
    'largest-rectangle-in-histogram': '向左右扩展会反复寻找边界；单调栈在“遇到更矮”时一次结算右边界。',
    'word-search': '这题不是摆一个网格就结束；关键是减少不可能的起点，并用原地标记把 visited 空间省掉。',
    'lru-cache': '普通列表 get 和 put 都要线性找 key；哈希表加双向链表才能同时做到快速查找和快速调整顺序。',
    'regular-expression-matching': '递归会反复计算同一组 i、j；二维 dp 把每个匹配状态只算一次。',
    'edit-distance': '暴力递归会反复比较同一对前缀；二维 dp 把每个前缀转换成本固定下来。',
    'median-of-two-sorted-arrays': '合并数组没有利用“只要中位数”这个目标；二分切分只找左右半边的边界。',
    'find-the-duplicate-number': 'set 做法用了额外空间；快慢指针把数组看成链表环，在 O(1) 空间里找入口。',
    'hamming-distance': '逐位比较可以做，但异或能一次标出所有不同位，后面只需要数 1。',
    'product-of-array-except-self': '左右乘积数组已经把关系讲清楚了；进一步优化时，可以把左侧乘积直接写进 output，再用一个 suffix 变量从右往左乘回来。',
    'binary-tree-inorder-traversal': '递归和迭代本质都是左、根、右；迭代写法不是更快，而是用栈把递归调用过程显式写出来。',
    'binary-tree-level-order-traversal': 'DFS 能按层收集，但层序输出本质就是一层一层弹出；队列每轮固定 size，正好切出当前层。',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '每次都在 inorder 里线性找根会重复扫描；哈希表把根位置定位降成 O(1)，递归时只传边界。',
    'flatten-binary-tree-to-linked-list': '前序数组能做但会保存所有节点；反向后序用 prev 保存已经展开好的链表头，就能原地改 left 和 right。',
    'min-stack': '普通栈的 getMin 需要扫描所有元素；辅助栈同步保存历史最小值，getMin 只看辅助栈栈顶。',
    'decode-string': '递归和栈都能处理嵌套；关键是遇到 [ 保存上一层上下文，遇到 ] 再结算当前层并拼回上一层。',
    'longest-valid-parentheses': 'DP 和栈都能线性完成；栈底哨兵保存无法匹配的位置，可以把有效长度直接转成下标差。',
    'perfect-squares': '暴力拆分会反复计算同一个剩余值；dp[i] 保存凑出 i 的最少平方数，后面直接复用。',
    'word-break': '暴力切分会重复判断同一段前缀；dp[i] 表示前 i 个字符能否拆分，字典只负责验证最后一段。',
    'remove-nth-node-from-end-of-list': '两趟扫描先求长度再删除；快慢指针保持 n 的距离，一趟就能让 slow 停在待删节点前面。',
    'sort-colors': '计数排序能做但要两趟写回；三指针把 0 区、1 区、2 区在一次扫描中维护出来。',
    'longest-substring-without-repeating-characters': '固定左端点会重复检查很多子串；滑动窗口让 left 只向右走，每个字符最多进出窗口一次。',
    'container-with-most-water': '枚举两条线会重复试很多没必要的组合；双指针每次移动短板，因为面积只可能被更高的短板改善。',
    'valid-parentheses': '逐个找配对会丢失嵌套顺序；栈天然保存“最近还没匹配的左括号”，右括号只需要检查栈顶。',
    'trapping-rain-water': '逐格向左右找最高墙会重复扫描；双指针提前维护左右最高墙，短边能直接确定当前格水量。',
    'maximum-subarray': '枚举所有子数组会重复求和；Kadane 只保留“以当前位置结尾的最好和”，负担太重的前缀直接丢掉。',
    'jump-game': '逐条路径搜索会爆炸；贪心只维护当前能到达的最远位置，扫描到的位置如果超过最远就说明断开。',
    'daily-temperatures': '每一天都向后找会重复比较；单调栈保存还没等到更高温的日期，当前温度一升高就批量结算。',
    'single-number': '哈希表能记录次数，但异或可以让成对数字自己抵消；最后剩下的就是只出现一次的数。',
    'linked-list-cycle': '用 seen 集合能判断重复节点，但快慢指针不需要额外空间；有环时两者速度不同，最终会在环内相遇。',
    'majority-element': '计数表能统计次数，但多数元素可以用投票抵消掉非多数；候选值最后会留下来。',
    'reverse-linked-list': '新建链表能反转但浪费空间；原地反转只需要 prev、cur、next 三个指针维护连接方向。',
    'palindrome-linked-list': '把链表复制到数组能比较，但反转后半段可以在 O(1) 额外空间里完成两端对照。',
    'move-zeroes': '额外数组能收集非零，但 slow 指针直接指向下一个写入位置，一趟就能把非零数稳定前移。',
    'burst-balloons': '这题的难点不是把时间复杂度降一个量级，而是把“先戳谁”改成“最后戳谁”；这样左右区间已经算好，状态转移才不会乱。',
    'letter-combinations-of-a-phone-number': '这题输出规模本来就很大；回溯的重点是每一层只处理一个数字，path 到达长度后再收一个字符串。',
    'coin-change': '自底向上 DP 不是为了换一个漂亮写法，而是把每个金额的最优答案固定在 dp[amount] 里，避免反复问同一个剩余金额。',
    'partition-equal-subset-sum': '时间主要由 n 和 target 决定；真正的改进是把二维“选到第几个数、能否凑出某个和”压成一维容量状态。',
    'permutations': '全排列必须输出所有结果；讲清楚 visited、选择、递归、撤销，比说“优化时间”更重要。',
    'subsets': '子集数量固定是 2^n；这里要讲的是每个数字只有“选”和“不选”两条路，不能漏也不能重复。',
    'sort-list': '链表归并和数组排序时间同阶；推荐它是因为能用快慢指针切半、再用指针合并，避免把链表硬转成数组。',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  const bruteTime = normalizeComplexityText(brute?.time || '');
  const recommendedTime = normalizeComplexityText(recommended?.time || '');
  const bruteSpace = normalizeComplexityText(brute?.space || '');
  const recommendedSpace = normalizeComplexityText(recommended?.space || '');
  if (bruteTime !== recommendedTime && bruteTime && recommendedTime) {
    return `直接做法能做对，但时间从 ${bruteTime} 优化到 ${recommendedTime}。`;
  }
  if (bruteSpace !== recommendedSpace && bruteSpace && recommendedSpace) {
    return `直接做法能做对，但空间从 ${bruteSpace} 优化到 ${recommendedSpace}。`;
  }
  return `先抓住这题真正变化的关系：${compact(problem.optimizedIdea || problem.whyThisPattern || recommended?.idea || problem.summary, 150)}`;
}

function isModelingOnly(problem) {
  return problem.slug === 'evaluate-division';
}

function isSameMethod(brute, recommended) {
  if (!brute || !recommended) return false;
  if (variantKey(brute) && variantKey(brute) === variantKey(recommended)) return true;
  return brute.name === recommended.name && brute.time === recommended.time && brute.space === recommended.space;
}

function isConceptualTransition(problem, brute, recommended) {
  const slugs = new Set([
    'binary-tree-inorder-traversal',
    'binary-tree-level-order-traversal',
    'decode-string',
    'longest-valid-parentheses',
    'sort-colors',
  ]);
  if (slugs.has(problem.slug)) return true;
  if (!brute || !recommended) return false;
  return (
    normalizeComplexityText(brute.time || '') === normalizeComplexityText(recommended.time || '') &&
    normalizeComplexityText(brute.space || '') === normalizeComplexityText(recommended.space || '')
  );
}

function bottleneckSlideTitle(problem, sameMethodMode = false) {
  if (sameMethodMode) return '为什么这样做';
  return isModelingOnly(problem) ? '为什么要建成图' : '哪里可以优化';
}

function directTitle(problem, sameMethodMode, directMeta) {
  const bySlug = {
    'course-schedule': '反复扫描依赖',
    'number-of-islands': '扫描网格 DFS',
    'binary-tree-level-order-traversal': '队列按层遍历',
    'word-break': '递归枚举切分',
    'decode-string': '递归解析括号',
    'longest-valid-parentheses': 'DP 逐位匹配',
    'sort-colors': '计数后写回',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  if (directMeta?.name) return directMeta.name;
  return sameMethodMode ? '直接做法拆解' : '最直接做法';
}

function bottleneckCaption(problem, brute, recommended, sameMethodMode = false) {
  const text = bottleneckText(problem, brute, recommended);
  if (sameMethodMode) return compact(text, 92);
  if (isModelingOnly(problem)) return `${compact(text, 84)} 重点是路径乘积。`;
  return compact(text, 92);
}

function patternEyebrow(problem, sameMethodMode = false) {
  if (sameMethodMode) return 'CORE STEPS';
  return isModelingOnly(problem) ? 'MODELING STEPS' : 'OPTIMIZED IDEA';
}

function patternCaption(problem, recommendedName, coreIdea, sameMethodMode = false) {
  if (sameMethodMode) return compact(coreIdea, 82);
  if (isModelingOnly(problem)) return `建模成图后，查询就是沿边累乘。`;
  if (recommendedName === '面试推荐写法') return compact(coreIdea, 86);
  return `${recommendedName}：${compact(coreIdea, 78)}`;
}

function walkCaption(problem, recommendedName, steps = []) {
  const first = shortLine(String(steps[0] || '').replace(/^\d+[.、\s]*/, ''), 54);
  const second = shortLine(String(steps[1] || '').replace(/^\d+[.、\s]*/, ''), 54);
  const category = problem.category || '';
  const bySlug = {
    'group-anagrams': '每个 word 先变成稳定签名：eat 和 tea 排序后都是 aet，所以进入同一个桶；不同签名就开不同分组。',
    'longest-consecutive-sequence': '先把数字放进 set；只从 num-1 不存在的位置开跑，这样每条连续段只会被数一次。',
    '3sum': '先排序，再固定 i；left 和 right 从两端夹逼，sum 小了 left 右移，sum 大了 right 左移，命中后两边都跳过重复值。',
    'trapping-rain-water': '左右指针不是随便移动：哪边的最高墙更矮，就先结算哪边，因为那一侧的水位已经确定。',
    'find-all-anagrams-in-a-string': '窗口长度固定为 p 的长度；每右移一格，就删掉左边字符、加入右边字符，计数相同才记录起点。',
    'sliding-window-maximum': '队列存下标并保持对应值递减；先踢掉过期下标，再弹掉队尾更小值，队首就是当前窗口最大值。',
    'subarray-sum-equals-k': '遍历时维护当前前缀和 cur；答案增加 count[cur-k]，然后再把 cur 记录进 count。',
    'top-k-frequent-elements': '先统计每个数字的频次，再把数字放进对应频次的桶；从高频桶往低频桶取，取满 k 个就结束。',
    'kth-largest-element-in-an-array': '小顶堆始终只保留 k 个较大的数；堆顶就是这 k 个数里最小的，也就是全数组第 k 大。',
    'valid-parentheses': '遇到左括号就把它压栈；遇到右括号必须和栈顶成对，任何不匹配或最后栈不空都返回 false。',
    'decode-string': '遇到数字累计倍数，遇到左括号保存旧字符串和倍数，遇到右括号把当前片段展开后接回上一层。',
    'course-schedule': '把每条先修关系变成一条边；入度为 0 的课先入队，学完一门课就把后续课程的入度减一。',
    'evaluate-division': '把 a/b=2.0 画成 a→b 权重 2.0，同时补 b→a 权重 0.5；查询 a/c 时沿路径累乘边权。',
    'maximal-square': '当前格如果是 1，就看左、上、左上三个格子的正方形边长；取最小值加一，才不会越过任何一边。',
    'maximum-product-subarray': '每个位置同时维护最大乘积和最小乘积；遇到负数时它们会互换角色，所以两个状态都不能丢。',
    'perfect-squares': 'dp[i] 表示组成 i 最少要几个平方数；枚举每个 j*j，用 dp[i-j*j]+1 更新当前答案。',
    'longest-palindromic-substring': '枚举每一个中心，分别处理奇数中心和偶数中心；左右字符相等就继续外扩，不等就停。',
    'palindromic-substrings': '每个中心向两边扩展；每成功扩出一个回文，就把计数加一。',
    'product-of-array-except-self': '按样例先填左侧乘积，再从右往左补右侧乘积；看清 ans[i] 永远不乘 nums[i] 自己。',
    'remove-nth-node-from-end-of-list': 'dummy 先接到 head 前面；fast 先走 n 步拉开距离，再和 slow 同步走，最后让 slow.next 跳过待删节点。',
    'move-zeroes': 'slow 永远指向下一个非零数应该写入的位置；扫描到非零就写到 slow，扫描结束后把 slow 后面统一补 0。',
    'longest-increasing-subsequence': 'tails 不是最终子序列，而是每个长度的最小结尾；当前数用二分放到第一个大于等于它的位置，tails 越小越容易接长。',
    'flatten-binary-tree-to-linked-list': '按右、左、根的反向后序处理；prev 保存已经展开好的右链，当前节点的 right 指向 prev，left 立刻置空。',
    'linked-list-cycle': '让 slow 每次走一步、fast 每次走两步；如果链表有环，两个指针一定会在环里相遇。',
    'linked-list-cycle-ii': '先让快慢指针在环里相遇，再让一个指针回到 head；两个指针同步走，相遇点就是环入口。',
    'number-of-islands': '从一个 1 出发，把上下左右连着的 1 全部标记掉；一次 DFS/BFS 只对应一座岛。',
    'minimum-path-sum': '每个格子的最小路径和只来自上方或左方；把当前值加上两者较小值继续往右下角推。',
    'unique-paths': '每个格子的路径数来自上方加左方；第一行和第一列只有一种走法，其余格子逐个相加。',
    'longest-substring-without-repeating-characters': '右指针加入字符前先处理重复；窗口重新变成无重复后，再更新最长长度。',
    'add-two-numbers': '两个链表从低位开始同步走；每一位先加 l1、l2 和 carry，再把新 carry 带到下一位。',
    'merge-two-sorted-lists': 'dummy 后面一直接更小的节点；谁被接上，谁的指针就往后移动一步。',
    'lru-cache': 'get 和 put 都要把节点挪到链表头；容量超了就从尾部删掉最久没使用的节点。',
    'sort-list': '快慢指针先把链表切成两半；左右分别排好后，再按 merge two lists 的方式接回去。',
    'intersection-of-two-linked-lists': '两个指针分别从 A、B 出发；走到尾就换到另一条链，路程补齐后会在交点同步相遇。',
    'regular-expression-matching': '看 dp[i][j] 时先判断 p[j-1] 是否是星号；星号要分成匹配 0 次和继续匹配多次。',
    'word-break': 'dp[i] 表示前 i 个字符能否拆开；枚举最后一段 word，只要前半段可拆且 word 在字典里就成立。',
    'burst-balloons': '区间 DP 先枚举长度，再枚举最后戳破的 k；k 左右两个区间必须已经算完。',
    'coin-change': '从金额 1 推到 amount；每个金额尝试所有硬币，用 dp[i-coin]+1 更新最少枚数。',
    'house-robber': '每间房只有偷或不偷；偷当前就接 dp[i-2]，不偷当前就沿用 dp[i-1]。',
    'counting-bits': '每个数的 1 个数来自更小状态；看最低位或 i>>1，就能复用已经算好的答案。',
    'binary-tree-inorder-traversal': 'cur 一路向左入栈；弹出时访问节点，再转向它的右子树。',
    'binary-tree-level-order-traversal': '队列每轮先固定 size；这一轮只弹当前层节点，弹完后再收下一层。',
    'validate-binary-search-tree': '每个节点都带着祖先传下来的下界和上界；值必须严格落在这个开区间里。',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '前序第一个值确定根；中序位置把数组切成左子树和右子树。',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  if (category.includes('动态规划')) return `看当前状态从哪里来：先标出依赖的旧格，再把候选值写进当前格，最后更新答案。`;
  if (category.includes('链表')) return `看指针身份：谁负责探路、谁负责停在改链位置、哪一条 next 要被改掉，按这个顺序推。`;
  if (category.includes('二叉树')) return `看当前节点：左子树给什么、右子树给什么、当前节点把结果合成什么，再继续向上返回。`;
  if (category.includes('回溯')) return `每一层只做一件事：选择一个候选、递归进入下一层、回来后撤销这个选择。`;
  if (category.includes('滑动窗口')) return `窗口先扩张，再按条件收缩；每次更新答案前，都要保证窗口含义仍然成立。`;
  if (category.includes('双指针')) return `看两个指针各自代表什么位置；每移动一步，都要让数组里的已处理区和未处理区保持清楚。`;
  if (category.includes('哈希') || category.includes('前缀和')) return `遍历时先查已经记录的信息，再写入当前信息；顺序错了就可能把自己当成答案。`;
  if (category.includes('二分')) return `每次比较 mid 后，只保留仍可能包含答案的一半；边界含义要从头到尾保持一致。`;
  if (first && second) return `${first}；接着${second}。`;
  return `${recommendedName} 的重点是把关键变量更新顺序讲清楚，再对照样例一步步推进。`;
}

function reviewCaption(problem, recommendedName, variants = []) {
  const preciseCaptionOverrides = {
    'linked-list-cycle': '复盘只看 Floyd 判环：fast 必须检查 fast.next，slow/fast 相遇返回 true，走到 None 返回 false；哈希集合只是空间换理解。',
    'add-two-numbers': '复盘只看竖式加法：不同长度补 0、carry 不能漏、最后一位进位也要进链表。',
    'merge-two-sorted-lists': '复盘只看合并过程：每次接较小头节点，剩余链表直接接上；递归写法要注意栈空间。',
    'validate-binary-search-tree': '复盘只看祖先边界：每个节点必须落在 low 和 high 中间，不能只比较父子节点。',
    'flatten-binary-tree-to-linked-list': '复盘只看原地展开：顺序必须是前序，所有 left 置空，right 串成同一条链。',
    'sort-colors': '计数排序易懂，三指针一趟原地；重点检查遇到 2 后 i 不前进。',
    'top-k-frequent-elements': '桶排序按频次从高到低取满 k 个；堆写法是追问方案，不要把两套代码混在一起。',
    'maximal-rectangle': '复盘只看两步：每行先更新 heights，再用柱状图单调栈结算最大矩形。',
  };
  if (preciseCaptionOverrides[problem.slug]) return preciseCaptionOverrides[problem.slug];
  const captionOverrides = {
    'lru-cache': '复盘只看三件事：cache 是否同步增删，节点是否先 remove 再 add_to_front，容量满时是否淘汰 tail.prev。',
    'generate-parentheses': '复盘只看 left、right、path：左括号不能超过 n，右括号不能超过左括号，递归返回后必须撤销选择。',
    'valid-parentheses': '复盘只看栈顶匹配：右括号来时栈不能为空，类型必须对应，扫描结束栈必须为空。',
    'remove-nth-node-from-end-of-list': '复盘只看 fast/slow 的距离：fast 先走 n 步，同步走到尾后，slow 正好停在待删节点前面。',
    'binary-tree-maximum-path-sum': '复盘只看两个值：返回给父节点的是单边 gain，全局答案 ans 可以在当前节点把左右两边接起来。',
  };
  if (captionOverrides[problem.slug]) return captionOverrides[problem.slug];
  const names = variants.map((item) => item.name).filter(Boolean);
  const alt = names.find((name) => name !== recommendedName) || names[1] || '备用写法';
  const bySlug = {
    'group-anagrams': '复盘只看三件事：签名是否稳定、同签名是否进同一个桶、输出分组顺序是否不做额外假设。',
    'longest-consecutive-sequence': '复盘重点是只从连续段起点扩展；重复数字用 set 去重，空数组直接返回 0。',
    'sliding-window-maximum': '主解是单调队列：存下标、删过期、弹小值、读队首；不要把它讲成普通滑动窗口或前缀和。',
    'top-k-frequent-elements': '桶排序写法要讲清“频次当桶下标”；堆写法是追问方案，两者不要混成一个代码思路。',
    'kth-largest-element-in-an-array': '这题只关心第 k 大，不关心频率；复盘堆容量 k、堆顶含义和重复数也按元素个数计算。',
    'valid-parentheses': '括号题只看栈顶匹配：右括号来时栈不能为空、类型必须对应、最后栈必须清空。',
    'decode-string': '复杂度按展开后的输出长度算；栈模拟和递归解析都要处理多位数字、嵌套括号和字符串拼接。',
    'move-zeroes': '复盘 slow 的含义：非零写入位置；非零相对顺序不能乱，slow 后面的格子再统一补 0。',
    'product-of-array-except-self': '面试优先讲左右乘积；能说清 prefix/suffix 后，再补充如何用一个 suffix 变量省空间。',
    'two-sum': '暴力用来建模，哈希表用于提交；排序双指针只适合追问，因为它要保留原下标。',
    'linked-list-cycle': '哈希集合容易理解，快慢指针更省空间；这题最终要能解释为什么一定会相遇。',
    'linked-list-cycle-ii': '哈希集合能找入口，快慢指针能做到 O(1) 空间；重点是解释第二次相遇为什么在入口。',
    'group-anagrams': '排序字符串做 key 最稳，计数 key 更快但写起来更长；面试时先保证分组依据不会冲突。',
    'maximum-subarray': 'Kadane 最适合提交；分治能讲思想，但代码更长，重点还是解释为什么负前缀可以丢掉。',
    'subarray-sum-equals-k': '前缀和加哈希是主线；暴力只用来说明“重复求区间和”是瓶颈。',
    'binary-tree-maximum-path-sum': '主解必须在递归里同时处理“向上贡献”和“全局答案”；只返回路径和会漏掉拐弯路径。',
    'symmetric-tree': '递归写法最直观；队列写法适合追问，本质都是成对比较镜像节点。',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  if (recommendedName === '面试推荐写法') return '按样例一步步推演';
  const category = problem.category || '';
  if (category.includes('动态规划')) return `主解要讲清状态定义和遍历顺序；${alt} 只用于对照递归记忆化或空间压缩。`;
  if (category.includes('链表')) return `主解要讲清每个指针的职责和移动时机；${alt} 用来对照是否多用了空间或多扫了一趟。`;
  if (category.includes('二叉树')) return `主解要讲清递归函数返回什么；${alt} 用来对照遍历顺序或迭代写法。`;
  if (category.includes('滑动窗口')) return `主解要讲清窗口什么时候合法；${alt} 用来对照为什么不能每个起点重新扫。`;
  if (category.includes('哈希') || category.includes('前缀和')) return `主解的关键是 key/value 设计；${alt} 用来对照重复查找为什么会慢。`;
  if (category.includes('双指针')) return `主解要讲清移动哪一侧不会漏答案；${alt} 用来对照枚举法的重复工作。`;
  return `${recommendedName} 用来提交；${alt} 用来说明建模过程、复杂度差异和可能的追问点。`;
}

function reviewItems(problem, pitfalls) {
  const preciseItemOverrides = {
    'linked-list-cycle': ['fast 和 fast.next 都要先检查。', 'slow 每次一步，fast 每次两步；相遇说明有环。', '哈希写法存的是节点对象，不是节点值。'],
    'add-two-numbers': ['while 条件必须包含 carry。', 'l1/l2 长度不同用 0 补齐。', 'total 拆成 digit 和下一轮 carry。'],
    'merge-two-sorted-lists': ['cur 永远接较小的当前头节点。', '某条链表为空后，剩余部分可以直接接上。', '递归写法返回较小头节点并接递归结果。'],
    'validate-binary-search-tree': ['不要只比较父子节点。', '左子树上界变成 node.val。', '右子树下界变成 node.val。'],
    'flatten-binary-tree-to-linked-list': ['必须原地修改节点。', '每个节点 left 都要置空。', 'right 链顺序必须是前序遍历。'],
    'linked-list-cycle-ii': ['第一次相遇只证明有环。', '一个指针回 head 后同速走。', '第二次相遇才是入口。'],
    'path-sum-iii': ['进入节点时 prefix[cur]++。', '答案来自 prefix[cur-target]。', '离开节点时 prefix[cur]--，避免串到其他分支。'],
    'invert-binary-tree': ['当前节点先交换左右孩子。', '递归/BFS 只是继续处理子节点。', '不要讲成合并左右返回值。'],
    'serialize-and-deserialize-binary-tree': ['空节点必须写成 #。', '反序列化按同一 token 顺序消费。', '前序递归读到 # 就返回 None。'],
    'top-k-frequent-elements': ['Counter 先统计频率。', '桶下标就是频次。', '从高频桶往低频桶收集到 k 个。'],
    'sort-colors': ['0 放左边，2 放右边。', '遇到 2 交换后 i 不前进。', '计数排序是两趟，三指针是一趟原地。'],
    'maximal-rectangle': ['每行先把连续 1 高度累加成 heights。', '每一行都当作柱状图求最大矩形。', '弹栈时用当前下标和新栈顶算宽度。'],
  };
  if (preciseItemOverrides[problem.slug]) return preciseItemOverrides[problem.slug];
  const itemOverrides = {
    'lru-cache': ['cache[key] 必须永远指向链表里的真实节点。', 'get 或更新已有 key 后，要先 remove 再 add_to_front。', '容量满时淘汰 tail.prev，同时从 cache 删除对应 key。'],
    'generate-parentheses': ['left < n 才能继续放左括号。', 'right < left 才能继续放右括号。', '每次 push 到 path 后，递归返回必须 pop 撤销。'],
    'valid-parentheses': ['遇到左括号就入栈。', '遇到右括号时，栈不能为空且栈顶类型必须匹配。', '扫描结束后，栈为空才返回 true。'],
    'remove-nth-node-from-end-of-list': ['dummy.next 指向 head，统一删除头节点。', 'fast 先走 n 步，制造 fast 和 slow 的距离。', 'fast 到尾后，slow.next 就是要跳过的节点。'],
    'binary-tree-maximum-path-sum': ['空节点返回 0，但全局答案不能初始化为 0。', '负贡献要用 max(gain, 0) 丢掉。', '返回父节点只能选一边，更新 ans 时才可以同时接左右两边。'],
  };
  if (itemOverrides[problem.slug]) return itemOverrides[problem.slug];
  const bySlug = {
    'group-anagrams': ['签名必须稳定：eat 和 tea 要得到同一个 key。', '不要假设输出分组顺序，题目通常只看分组内容。', '空字符串也要进入一个合法分组。'],
    'longest-consecutive-sequence': ['只从 num-1 不存在的数字开始扩展。', '重复数字先用 set 去掉。', '空数组返回 0。'],
    'subarray-sum-equals-k': ['count[0]=1 必须先放进去，表示空前缀。', '先查 cur-k 再记录 cur，避免把当前前缀提前算进去。', '数组有负数，所以不能用普通滑动窗口。'],
    'sliding-window-maximum': ['队列里存下标，方便判断是否过期。', '新元素进入前弹掉队尾更小的值。', '窗口形成后才把队首对应值加入答案。'],
    'top-k-frequent-elements': ['桶排序按频次倒序取数，桶下标就是出现次数。', '堆写法要固定容量 k，不要和桶排序代码混在一起。', '频率相同的元素通常不要求固定顺序。'],
    'kth-largest-element-in-an-array': ['小顶堆容量保持 k。', '重复数按元素个数计算，不按频率分组。', '堆顶含义是当前 k 个大数里最小的那个。'],
    'valid-parentheses': ['右括号来时栈不能为空。', '右括号必须和栈顶左括号类型匹配。', '扫完后栈必须为空。'],
    'decode-string': ['多位数字要连续累积。', '遇到右括号时展开当前层并接回上一层。', '复杂度按展开后的输出长度计算。'],
    'move-zeroes': ['slow 表示下一个非零写入位置。', '非零元素相对顺序不能改变。', '扫描结束后再把 slow 后面补 0。'],
    'daily-temperatures': ['栈里存还没找到更高温的下标。', '当前温度更高时弹栈并计算等待天数。', '相等温度不能弹出，因为题目要更高温。'],
    'largest-rectangle-in-histogram': ['栈保持高度递增。', '遇到更矮柱子时结算被弹柱子的面积。', '末尾补 0 用来清空栈。'],
    'longest-valid-parentheses': ['栈里存下标，不是只存括号。', '栈底哨兵用于计算当前合法长度。', '右括号不匹配时更新新的哨兵下标。'],
    'min-stack': ['辅助栈同步保存当前最小值。', 'pop 时最小值也要一起恢复。', 'getMin 必须 O(1)。'],
    'maximal-rectangle': ['每一行先更新柱状图高度。', '再用单调栈求这一行的最大矩形。', '矩阵宽高边界不要写反。'],
  };
  return bySlug[problem.slug] || pitfalls;
}

function focusCodeLine(line = '') {
  const trimmed = line.trim();
  if (/^(from|import)\s+/.test(trimmed)) return '';
  if (!trimmed.startsWith('def ')) return line;
  return line
    .replace(/\)\s*->\s*[^:]+:/, '):')
    .replace(/:\s*[^,)=]+/g, '');
}

function codeFocusLines(code = '') {
  return codeText(code)
    .split('\n')
    .map(focusCodeLine)
    .filter((line) => !line.trim().startsWith('#'))
    .filter((line) => line.trim())
    .slice(0, 10);
}

function codeReadNote(problem) {
  const preciseNoteOverrides = {
    'linked-list-cycle': '先看 slow 和 fast 的移动速度，再看 while fast and fast.next 如何保护空指针；slow == fast 就说明有环',
    'linked-list-cycle-ii': '先找 slow/fast 的相遇点，再让一个指针回 head，同速前进，第二次相遇就是入口',
    'add-two-numbers': '先看 l1/l2/carry/total/digit，循环条件必须覆盖两条链表和最后进位',
    'merge-two-sorted-lists': '迭代版看 dummy、cur、list1、list2；递归版看较小头节点如何接递归合并结果',
    'reverse-linked-list': '迭代版看 nxt 保存下一跳、cur.next 指回 prev、prev/cur 同步后移；递归版看回程改指针',
    'intersection-of-two-linked-lists': '先看 p 和 q 如何分别走 A+B、B+A；同速走到同一节点就是交点，同时为 None 就无交点',
    'palindrome-linked-list': '先用 fast/slow 找中点，再反转后半段，最后 left/right 同步比较',
    'validate-binary-search-tree': '先看 dfs(node, low, high) 的上下界如何从祖先传下来，当前值必须严格落在区间内',
    'flatten-binary-tree-to-linked-list': '先看右-左-根的反向前序，再看 node.right=prev 和 node.left=None 这两行',
    'binary-tree-maximum-path-sum': '先看 gain(node) 返回给父节点的单边贡献，再看 ans 如何用 left + node.val + right 更新拐弯路径',
    'path-sum-iii': '先看 cur 前缀和、prefix[cur-target] 计数，再看进入节点和离开节点时哈希表如何增减',
    'invert-binary-tree': '先看当前节点左右孩子交换，再继续递归或队列处理子节点',
    'serialize-and-deserialize-binary-tree': '先看 # 如何表示空节点，再看 deserialize 按前序 token 逐个消费',
    'convert-bst-to-greater-tree': '先看反中序右-根-左，再看 total 如何累加并写回当前节点',
    'top-k-frequent-elements': '先看 Counter 统计频率，再看 buckets[freq] 如何按频次分桶并从高到低取满 k 个',
    'sort-colors': '先看 left、i、right 三个指针；遇到 0 换到左边，遇到 2 换到右边且 i 暂时不前进',
    'group-anagrams': '先看 key 如何让异位词落到同一组；排序 key 稳定，计数 tuple key 更快但代码更长',
    'maximal-rectangle': '先看每一行如何更新 heights，再看单调栈如何在柱状图上弹栈结算面积',
    'course-schedule': '先看 graph、indegree、queue、learned 四个变量；每弹出一门课就让后继课程入度减一',
    'evaluate-division': '先看 a/b 和 b/a 如何建成双向带权边，再看 DFS/BFS 查询时 acc 如何沿路径相乘',
    'search-a-2d-matrix-ii': '先看右上角当前格；太大左移排除一列，太小下移排除一行',
  };
  if (preciseNoteOverrides[problem.slug]) return preciseNoteOverrides[problem.slug];
  const noteOverrides = {
    'remove-nth-node-from-end-of-list': '先看 dummy 如何统一删除头节点，再看 fast 先走 n 步、fast/slow 同步走，最后由 slow.next 跳过待删节点',
    'generate-parentheses': '先看 path、left、right 三个变量：left<n 才能放左括号，right<left 才能放右括号，长度到 2n 就收集答案',
    'valid-parentheses': '先看栈里只保存还没匹配的左括号；右括号到来时必须和栈顶配对，最后栈为空才合法',
    'lru-cache': '先看 cache、head、tail 三件事，再看 get/put 如何调用 remove(node) 和 add_to_front(node) 保持最近使用顺序',
    'binary-tree-maximum-path-sum': '先看 gain(node) 返回给父节点的单边贡献，再看 ans 如何用 left + node.val + right 更新拐弯路径',
  };
  if (noteOverrides[problem.slug]) return noteOverrides[problem.slug];
  const bySlug = {
    'search-a-2d-matrix-ii': '先看 row、col 如何从右上角移动，每次比较都要能排除一整行或一整列',
    'course-schedule': '先看 graph、indegree、queue、learned 四个变量，确认每条边只被处理一次',
    'evaluate-division': '先看 graph 如何同时存 a/b 和 b/a，再看查询时乘积 acc 如何沿路径传下去',
    'implement-trie-prefix-tree': '对照 insert、search、startsWith 三个函数，重点看 search("app") 为什么必须检查 is_end',
    'unique-binary-search-trees': '先看 dp[0]=1，再看 root 枚举时 left 和 right 的节点数如何相乘',
    'sliding-window-maximum': '先看队列里存的是下标，再看过期下标和队尾较小元素分别什么时候弹出',
    'largest-rectangle-in-histogram': '先看单调栈里保存下标，弹出柱子时用当前 i 和新栈顶计算宽度',
    'word-search': '先看 dfs(i,j,k) 的含义，再看 board 原地标记和恢复现场这两行',
    'lru-cache': '先看 cache 字典、虚拟头尾、_remove、_add_to_front，再看 get 后为什么要移到头部',
    'regular-expression-matching': '先看 dp[i][j] 的含义，再看星号匹配 0 次和多次两个分支',
    'edit-distance': '先看第一行第一列初始化，再看插入、删除、替换三方向如何取最小值',
    'longest-palindromic-substring': '先看 expand(left,right) 如何向两侧扩展，再看奇数中心和偶数中心都要枚举',
    'median-of-two-sorted-arrays': '先看较短数组上的切分线，再看 maxLeft 和 minRight 的合法条件',
    'find-the-duplicate-number': '先看 nums[i] 作为 next 指针，再看相遇后为什么一个指针回到起点',
    'hamming-distance': '先看 xor 标出不同位，再看如何统计 xor 中 1 的个数',
    'product-of-array-except-self': '先看 ans 第一遍存左侧乘积，第二遍再乘右侧 suffix',
    'palindromic-substrings': '先看 expand(left,right) 每扩成功一次就计数，再看奇数中心和偶数中心都要跑',
    'validate-binary-search-tree': '先看 lower 和 upper 如何从祖先传下来，再看当前节点必须严格落在区间内',
    'convert-bst-to-greater-tree': '先看遍历顺序是右、根、左，再看 total 如何累加并写回当前节点',
    'serialize-and-deserialize-binary-tree': '先看空节点如何写成 #，再看 deserialize 为什么按同样的前序 token 递归读取',
    'binary-tree-inorder-traversal': '先看 cur 如何一路向左入栈，再看弹栈访问后为什么转向右子树',
    'binary-tree-level-order-traversal': '先看 queue 每一轮的长度 size，确认这一轮只处理当前层节点',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '先看 pre_pos 如何取根，再看 inorder 边界如何切出左右子树',
    'flatten-binary-tree-to-linked-list': '先看 dfs 的顺序是右、左、根，再看 node.right=prev 和 node.left=None 这两句',
    'min-stack': '先看主栈和辅助栈分别存什么，再看 push/pop 时两个栈什么时候同步',
    'decode-string': '先看 num、cur、stack 三个变量，再看左括号保存现场、右括号结算现场',
    'longest-valid-parentheses': '先看栈底 -1 的哨兵含义，再看右括号弹栈后如何用 i-stack[-1] 计算长度',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  const category = problem.category || '';
  if (category.includes('动态规划')) return '先看状态定义、初始化位置和遍历顺序，再对照转移公式读代码';
  if (category.includes('链表')) return '先看 dummy、prev、cur、next 这些指针什么时候保存、什么时候移动';
  if (category.includes('二叉树')) return '先看递归函数返回什么，再看空节点边界和当前节点如何合并左右结果';
  if (category.includes('回溯')) return '先看 path、start、remain 或 visited，再看选择、递归、撤销三步是否对称';
  if (category.includes('滑动窗口')) return '先看 left/right 维护的窗口含义，再看窗口何时扩张、收缩和更新答案';
  if (category.includes('双指针')) return '先看两个指针各自代表什么，再看每个分支为什么移动这一侧';
  if (category.includes('栈') || category.includes('队列')) return '先看容器里保存的是值还是下标，再看入栈、出栈和结算答案的时机';
  if (category.includes('哈希') || category.includes('前缀和')) return '先看哈希表的 key 和 value 分别存什么，再看遍历时先查还是先写';
  if (category.includes('二分')) return '先看搜索区间含义，再看 mid 判断后哪一半可以丢掉';
  if (category.includes('堆')) return '先看堆里维护的元素和容量 k，再看 push/pop 的触发条件';
  return '先看核心变量如何表达题意，再按循环顺序检查答案更新和边界返回';
}

function prepareCode(problem, code = '') {
  const text = codeText(code);
  if (problem.slug === 'lru-cache' && /OrderedDict|move_to_end|popitem/.test(text)) {
    const note = '# 手撕重点：OrderedDict 版本只看两个动作：get 后 move_to_end 标记最近使用，容量满时 popitem(last=False) 淘汰最久未使用。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'two-sum' && /for i in range\(n\):[\s\S]*for j in range\(i \+ 1, n\):/.test(text)) {
    const note = '# 手撕重点：暴力版固定 i，再枚举 i 后面的 j；只要 nums[i] + nums[j] == target 就返回两个下标。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'two-sum' && /arr = sorted\(\(x, i\) for i, x in enumerate\(nums\)\)/.test(text)) {
    const note = '# 手撕重点：排序版必须把数值和原下标绑在一起；left/right 按和的大小移动，命中后返回原下标。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'linked-list-cycle' && /slow|fast/.test(text)) {
    const note = decodeUnicodeEscapes('# \\u624b\\u5199\\u91cd\\u70b9\\uff1a\\u5feb\\u6162\\u6307\\u9488\\u7248\\u53ea\\u770b\\u4e09\\u4e2a\\u70b9\\uff1a\\u5faa\\u73af\\u6761\\u4ef6\\u5fc5\\u987b\\u4fdd\\u8bc1 fast \\u548c fast.next \\u5b58\\u5728\\uff1bslow \\u6bcf\\u6b21\\u4e00\\u6b65\\uff0cfast \\u6bcf\\u6b21\\u4e24\\u6b65\\uff1b\\u4e24\\u8005\\u76f8\\u9047\\u5c31\\u8bf4\\u660e\\u94fe\\u8868\\u6709\\u73af\\u3002');
    if (text.startsWith('# ')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'linked-list-cycle' && /seen|set\(\)|cur/.test(text)) {
    const note = decodeUnicodeEscapes('# \\u624b\\u5199\\u91cd\\u70b9\\uff1a\\u54c8\\u5e0c\\u96c6\\u7248\\u5b58\\u7684\\u662f\\u8282\\u70b9\\u5bf9\\u8c61\\u672c\\u8eab\\uff0c\\u4e0d\\u662f\\u8282\\u70b9\\u503c\\uff1bcur \\u6bcf\\u8d70\\u5230\\u4e00\\u4e2a\\u8282\\u70b9\\u5148\\u5224\\u65ad\\u662f\\u5426\\u89c1\\u8fc7\\uff0c\\u91cd\\u590d\\u51fa\\u73b0\\u5c31\\u8fd4\\u56de True\\uff0c\\u8d70\\u5230 None \\u5c31\\u8fd4\\u56de False\\u3002');
    if (text.startsWith('# ')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'add-two-numbers' && /carry|total|divmod|ListNode/.test(text) && !/to_number|base \*= 10/.test(text)) {
    const note = decodeUnicodeEscapes('# \\u624b\\u5199\\u91cd\\u70b9\\uff1a\\u8fd9\\u4e00\\u9898\\u9010\\u4f4d\\u76f8\\u52a0\\uff0c\\u4e0d\\u8981\\u8f6c\\u6574\\u6570\\uff1b\\u6bcf\\u4e00\\u8f6e\\u53d6 l1\\u3001l2 \\u5f53\\u524d\\u4f4d\\uff0c\\u52a0\\u4e0a carry\\uff0cdigit \\u63a5\\u5230\\u7ed3\\u679c\\u94fe\\u8868\\u5c3e\\u90e8\\uff0ccarry \\u7559\\u7ed9\\u4e0b\\u4e00\\u4f4d\\u3002');
    if (text.startsWith('# ')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'merge-two-sorted-lists' && /dummy|cur|list1|list2/.test(text) && !/self\.mergeTwoLists|list1\.next|list2\.next/.test(text)) {
    const note = decodeUnicodeEscapes('# \\u624b\\u5199\\u91cd\\u70b9\\uff1a\\u8fed\\u4ee3\\u7248\\u53ea\\u7ef4\\u62a4 dummy \\u548c cur\\uff1b\\u6bcf\\u8f6e\\u6bd4\\u8f83 list1\\u3001list2 \\u7684\\u5934\\u8282\\u70b9\\uff0c\\u628a\\u8f83\\u5c0f\\u8282\\u70b9\\u63a5\\u5230 cur.next\\uff0c\\u518d\\u79fb\\u52a8\\u5bf9\\u5e94\\u94fe\\u8868\\u548c cur\\u3002');
    if (text.startsWith('# ')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'valid-parentheses' && /replace\('\(\)'/.test(text)) {
    const note = '# 手撕重点：替换法每轮删除相邻合法括号；如果一轮后字符串不再变化，就看最后是否为空。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'remove-nth-node-from-end-of-list' && /length\s*=|steps\s*=|for _ in range\(steps\)/.test(text)) {
    const note = '# 手撕重点：两次遍历版先统计 length，再走 length-n 步停在待删节点前一个，最后改 slow.next。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'add-two-numbers' && /to_number|base \*= 10|total % 10/.test(text)) {
    const note = '# 手撕重点：链表数字相加要盯住 total、digit、carry；不要把链表整体转整数作为面试推荐写法。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'merge-two-sorted-lists' && /self\.mergeTwoLists|list1\.next|list2\.next/.test(text) && !/dummy/.test(text)) {
    const note = '# 手撕重点：递归版每次返回较小头节点，并让它的 next 接上递归合并后的剩余链表。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'flatten-binary-tree-to-linked-list' && /nodes\s*=\s*\[\]|preorder\(root\)|for i in range/.test(text)) {
    const note = '# 手撕重点：数组收集版先按前序拿到节点顺序，再逐个改 left=None、right=next；它清楚但额外占空间。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'top-k-frequent-elements' && /sorted\(cnt\.items\(\)|most_common|lambda item: item\[1\]/.test(text)) {
    const note = '# 手撕重点：排序版先 Counter 统计频率，再按频率降序取前 k 个；它直观但会把所有频次排完。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'sort-colors' && /count|cnt0|cnt1|cnt2|nums\[:/.test(text) && !/while i <= right/.test(text)) {
    const note = '# 手撕重点：计数排序先统计 0、1、2 的个数，再按区间写回；它清楚但需要两趟扫描。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'lru-cache' && /OrderedDict|move_to_end|popitem/.test(text)) {
    const note = '# 手撕重点：OrderedDict 版只看 move_to_end 和 popitem(last=False)，不要再讲手写 head/tail 指针。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'binary-tree-inorder-traversal' && /def inorder|self\.inorderTraversal|dfs\(root\.left\)/.test(text)) {
    const note = '# 手撕重点：递归版就是左、根、右；和迭代栈是同一个遍历顺序，但实现方式不同。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'validate-binary-search-tree' && /inorder|prev|vals|append/.test(text) && !/low|high|lower|upper/.test(text)) {
    const note = '# 手撕重点：中序版利用 BST 中序严格递增；只要当前值不大于前一个值，就返回 false。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'path-sum-iii' && /prefix|cur_sum|cur \+=|count\[cur/.test(text)) {
    const note = '# 手撕重点：进入节点先更新 cur，答案加 prefix[cur-target]；递归离开前必须把当前前缀计数减回去。';
    if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
    return `${note}\n${text}`;
  }
  if (problem.slug === 'subarray-sum-equals-k' && /for i in range\(len\(nums\)\):[\s\S]*for j in range\(i, len\(nums\)\):/.test(text)) {
    const note = '手写重点：枚举子数组版固定左端点 i，再向右扩展 j 并累加 total；total == k 就把答案加一。';
    if (text.startsWith('# ')) return text.replace('\n', `\n# ${note}\n`);
    return `# ${note}\n${text}`;
  }
  const note = `# 手撕重点：${codeReadNote(problem)}。`;
  if (/^# 手撕重点：.*$/m.test(text)) return text.replace(/^# 手撕重点：.*$/m, note);
  if (text.startsWith('# 核心思路：')) return text.replace('\n', `\n${note}\n`);
  return `${note}\n${text}`;
}

function codeFocusCaption(problem, recommended) {
  const cost = normalizeComplexityText(
    recommended ? `${recommended.time}，${recommended.space}` : `${problem.complexity?.time || ''}，${problem.complexity?.space || ''}`
  );
  return `${compact(codeReadNote(problem), 68)}。复杂度 ${cost}。`;
}

function codeFocusItems(problem, handwriteSteps) {
  if (problem.slug === 'validate-binary-search-tree') {
    return [
      '定义 dfs(node, low, high)',
      '当前值必须满足 low < val < high',
      '递归左右子树时更新上下界',
    ];
  }
  const bySlug = {
    'linked-list-cycle': ['循环条件 fast 和 fast.next', 'slow 走一步，fast 走两步', 'slow == fast 立即返回 True'],
    'add-two-numbers': ['取 l1 / l2 当前位，没有就当 0', 'total = v1 + v2 + carry', 'digit 接尾部，carry 进下一轮'],
    'merge-two-sorted-lists': ['dummy 固定结果头', 'cur 指向结果尾部', '比较 list1 / list2 后移动较小链表'],
    'course-schedule': ['建图 graph 与入度 indegree', '入度为 0 的课先进队列', '出队后删除边并统计学过课程数'],
    'evaluate-division': ['把 a/b 写成 a->b 权重', 'DFS/BFS 沿边累计乘积', '未知点或不连通返回 -1.0'],
    'search-a-2d-matrix-ii': ['从右上角开始', '当前值大于 target 就左移', '当前值小于 target 就下移'],
    permutations: ['path 是当前排列', 'used 防止同一元素重复使用', '递归返回后撤销选择'],
    subsets: ['path 当前子集随时收集', 'start 保证只往后选', '选完一个数后递归，再撤销'],
    'target-sum': ['先判断 sum 与 target 是否可转化', '转成选若干数凑 P', 'dp[j] 表示凑出 j 的方案数'],
    'coin-change': ['dp[i] 表示金额 i 的最少硬币数', '枚举 coin 更新 dp[i]', '不可达保持无穷大，最后转 -1'],
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  return handwriteSteps.slice(0, 3);
}

function makeVariantReview(variants) {
  const seen = new Set();
  const unique = variants.filter((item) => {
    const codeKey = item.code ? variantCodeShape(item.code) : '';
    const key = codeKey || variantKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.slice(0, 4).map((item) => ({
    name: item.name,
    badge: item.badge,
    cost: normalizeComplexityText(item.time),
    note: compact(item.idea, 58),
  }));
}

function problemPrompt(problem, problemText) {
  const bySlug = {
    'daily-temperatures': '给定每天温度，计算每一天距离下一个更高温度还有几天。',
    'longest-palindromic-substring': '给定字符串 s，返回最长回文子串。',
    'palindromic-substrings': '给定字符串 s，统计所有回文子串。',
    'course-schedule': '给定课程依赖关系，判断有向图里是否存在环。',
    'implement-trie-prefix-tree': '实现 Trie，支持插入单词、查完整单词、查前缀。',
    'combination-sum': '给定候选数字和 target，找出所有和为 target 的组合。',
    '3sum': '给定整数数组，找出所有和为 0 的不重复三元组。',
    'lru-cache': '设计 LRU 缓存，get 读取值，put 写入值并淘汰最久未使用项。',
    'coin-change': '给定硬币面额和目标金额 amount，求凑出金额所需的最少硬币数。',
    'trapping-rain-water': '给定柱子高度数组，计算雨后能接住多少水。',
    'merge-intervals': '给定若干区间，把有重叠的区间合并起来。',
    'queue-reconstruction-by-height': '按身高和 k 值重建队列，让每个人前面满足对应人数。',
    'container-with-most-water': '给定高度数组，选择两条竖线，让它们和横轴围成的水最多。',
    'counting-bits': '给定整数 n，返回 0 到 n 每个数字二进制中 1 的个数。',
    'find-all-numbers-disappeared-in-an-array': '给定长度为 n 的数组，返回 1 到 n 中没有出现过的数字。',
    'next-permutation': '原地改成下一个字典序更大的排列；如果不存在，就改成最小排列。',
    'shortest-unsorted-continuous-subarray': '找出最短连续子数组，排序后能让整个数组变成升序。',
    'generate-parentheses': '给定括号对数 n，生成所有由 n 对括号组成的合法括号字符串。',
    'maximal-rectangle': '给定一个只包含 0 和 1 的矩阵，找只包含 1 的最大矩形面积。',
    'min-stack': '设计一个栈，支持 push、pop、top，并且 getMin 能在常数时间返回最小值。',
    'decode-string': '给定形如 k[encoded_string] 的编码字符串，按嵌套规则还原出原字符串。',
    'binary-tree-inorder-traversal': '给定二叉树根节点 root，返回它的中序遍历结果：左、根、右。',
    'binary-tree-level-order-traversal': '给定二叉树根节点 root，按层从左到右返回节点值。',
    'word-break': '给定字符串 s 和词典，判断 s 能否拆成词典里的单词。',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '给定同一棵树的前序和中序遍历数组，构造并返回这棵二叉树。',
    'flatten-binary-tree-to-linked-list': '给定二叉树根节点 root，原地把它展开成前序顺序的单链表。',
  };
  return bySlug[problem.slug] || problem.hints?.level1 || problemText;
}

function readCaption(problem, problemText, edge) {
  if (problem.slug === 'linked-list-cycle') {
    return '给定链表头节点 head，判断沿着 next 一直走，会不会再次回到已经走过的节点。';
  }
  if (problem.slug === 'linked-list-cycle-ii') {
    return '给定链表头节点 head，如果链表有环，返回环开始的第一个节点；没有环就返回 null。';
  }
  const base = shortLine(problemPrompt(problem, problemText), 56);
  return edge ? `${base} 例：${shortLine(edge.input, 24)} -> ${shortLine(edge.expected, 18)}。` : base;
}

function readChips(problem) {
  if (problem.slug === 'linked-list-cycle') return [];
  if (problem.slug === 'linked-list-cycle-ii') return [];
  return [problem.difficulty, problem.category, ...(problem.tags || []).slice(0, 2)];
}

function readCards(problem, returnText, edge) {
  const prompt = problemPrompt(problem, cleanProblemText(problem.summary));
  if (problem.slug === 'longest-substring-without-repeating-characters') {
    return [
      { label: '目标', value: '找最长连续子串' },
      { label: '限制', value: '子串内不能有重复字符' },
      { label: '返回', value: '返回最大长度' },
      { label: edge ? '样例' : '边界', value: edge ? shortLine(`${edge.input} -> ${edge.expected}`, 40) : '空串返回 0' },
    ];
  }
  if (problem.slug === 'linked-list-cycle') {
    return [
      { label: 'head', value: '[3, 2, 0, -4]' },
      { label: 'pos = 1', value: '尾节点 -4 指回下标 1 的节点 2' },
      { label: '返回', value: '有环 true；无环 false' },
      { label: '注意', value: 'pos 只是题目图示，不是函数参数' },
    ];
  }
  if (problem.slug === 'linked-list-cycle-ii') {
    return [
      { label: 'head', value: '[3, 2, 0, -4]' },
      { label: 'pos = 1', value: '尾节点 -4 指回节点 2，入口就是 2' },
      { label: '返回', value: '返回入环的那个节点' },
      { label: '没有环', value: '返回 null' },
    ];
  }
  return [
    { label: '目标', value: shortLine(prompt, 58) },
    { label: '输入对象', value: shortLine(problemObject(problem), 46) },
    { label: '样例输入', value: edge ? shortLine(edge.input, 72) : '用最小样例确认' },
    { label: edge ? '示例输出' : '输出', value: shortLine(edge ? edge.expected : returnText, 72) },
  ];
}

function sampleSlideTitle(problem) {
  const bySlug = {
    'add-two-numbers': '逐位相加样例',
    'longest-substring-without-repeating-characters': '无重复窗口样例',
    'median-of-two-sorted-arrays': '中位数切分样例',
    'regular-expression-matching': '正则 DP 样例',
    'product-of-array-except-self': '按 prefix / suffix 填表',
    'container-with-most-water': '左右高度样例',
    '3sum': '排序双指针样例',
    'letter-combinations-of-a-phone-number': '电话按键选择树',
    'remove-nth-node-from-end-of-list': '倒数删除指针样例',
    'valid-parentheses': '括号入栈出栈样例',
    'merge-two-sorted-lists': '双链表合并样例',
    'generate-parentheses': '合法括号生成树',
    'next-permutation': '下一个排列样例',
    'longest-valid-parentheses': '括号下标栈样例',
    'search-in-rotated-sorted-array': '旋转数组查找样例',
    'find-first-and-last-position-of-element-in-sorted-array': '左右边界样例',
    'combination-sum': '组合回溯样例',
    'trapping-rain-water': '柱子接水样例',
    permutations: '全排列选择树',
    'word-search': '网格路径样例',
    'course-schedule': '课程依赖样例',
    'rotate-image': '矩阵旋转样例',
    'group-anagrams': '异位词分组样例',
    'maximum-subarray': '连续和更新样例',
    'jump-game': '最远可达样例',
    'merge-intervals': '区间合并样例',
    'unique-paths': '路径计数样例',
    'minimum-path-sum': '最小路径表样例',
    'climbing-stairs': '爬楼递推样例',
    'edit-distance': '编辑距离表样例',
    'sort-colors': '三指针分区样例',
    'minimum-window-substring': '最小覆盖窗口样例',
    subsets: '子集选择树',
    'search-in-rotated-sorted-array-ii': '重复旋转查找样例',
    'largest-rectangle-in-histogram': '柱状图边界样例',
    'maximal-rectangle': '矩阵转柱状图样例',
    'binary-tree-inorder-traversal': '中序遍历样例',
    'unique-binary-search-trees': 'BST 数量递推样例',
    'validate-binary-search-tree': 'BST 上下界样例',
    'symmetric-tree': '镜像比较样例',
    'binary-tree-level-order-traversal': '层序队列样例',
    'maximum-depth-of-binary-tree': '树深度样例',
    'construct-binary-tree-from-preorder-and-inorder-traversal': '前序中序建树样例',
    'flatten-binary-tree-to-linked-list': '展开为右链样例',
    'best-time-to-buy-and-sell-stock': '最低买价样例',
    'binary-tree-maximum-path-sum': '最大路径样例',
    'longest-consecutive-sequence': '连续序列样例',
    'single-number': '异或抵消样例',
    'word-break': '单词拆分 DP 样例',
    'linked-list-cycle': '链表成环样例',
    'linked-list-cycle-ii': '入环点样例',
    'lru-cache': 'LRU 操作样例',
    'sort-list': '链表归并样例',
    'maximum-product-subarray': '最大最小乘积样例',
    'find-minimum-in-rotated-sorted-array': '旋转最小值样例',
    'find-minimum-in-rotated-sorted-array-ii': '重复旋转最小值样例',
    'min-stack': '辅助最小栈样例',
    'intersection-of-two-linked-lists': '相交节点样例',
    'majority-element': '多数投票样例',
    'house-robber': '打家劫舍状态样例',
    'number-of-islands': '岛屿 DFS 样例',
    'reverse-linked-list': '反转指针样例',
    'implement-trie-prefix-tree': 'Trie 前缀路径样例',
    'kth-largest-element-in-an-array': '第 K 大堆样例',
    'maximal-square': '最大正方形样例',
    'invert-binary-tree': '左右翻转样例',
    'palindrome-linked-list': '回文链表样例',
    'lowest-common-ancestor-of-a-binary-tree': '最近公共祖先样例',
    'sliding-window-maximum': '单调队列窗口样例',
    'search-a-2d-matrix-ii': '右上角查找样例',
    'perfect-squares': '完全平方 DP 样例',
    'move-zeroes': '非零前移样例',
    'find-the-duplicate-number': '数组成环样例',
    'serialize-and-deserialize-binary-tree': '树和字符串互转样例',
    'longest-increasing-subsequence': '递增子序列样例',
    'best-time-to-buy-and-sell-stock-with-cooldown': '冷冻期状态样例',
    'burst-balloons': '区间戳气球样例',
    'coin-change': '金额 DP 样例',
    'house-robber-iii': '树形偷取样例',
    'counting-bits': '比特递推样例',
    'top-k-frequent-elements': '频率桶样例',
    'decode-string': '嵌套解码样例',
    'evaluate-division': '带权路径样例',
    'queue-reconstruction-by-height': '队列插入样例',
    'partition-equal-subset-sum': '等和子集样例',
    'path-sum-iii': '路径前缀和样例',
    'find-all-anagrams-in-a-string': '异位词窗口样例',
    'find-all-numbers-disappeared-in-an-array': '原地标记样例',
    'hamming-distance': '异或位差样例',
    'target-sum': '正负号转背包样例',
    'convert-bst-to-greater-tree': '反中序累加样例',
    'diameter-of-binary-tree': '树直径样例',
    'subarray-sum-equals-k': '前缀和计数样例',
    'shortest-unsorted-continuous-subarray': '无序边界样例',
    'merge-two-binary-trees': '逐点合并树样例',
    'task-scheduler': '冷却调度样例',
    'longest-palindromic-substring': '中心扩展样例',
    'palindromic-substrings': '中心计数样例',
    'daily-temperatures': '等待升温样例',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  const category = problem.category || '';
  if (category.includes('链表')) return '指针样例';
  if (category.includes('二叉树')) return '树结构样例';
  if (category.includes('动态规划')) return '状态样例';
  if (category.includes('回溯')) return '选择树样例';
  if (category.includes('滑动窗口')) return '窗口样例';
  if (category.includes('双指针')) return '双指针样例';
  if (category.includes('二分')) return '二分样例';
  if (category.includes('栈') || category.includes('队列')) return '栈变化样例';
  if (category.includes('矩阵')) return '矩阵样例';
  if (category.includes('哈希') || category.includes('前缀和')) return '记录表样例';
  if (category.includes('贪心')) return '贪心选择样例';
  if (category.includes('堆')) return '堆维护样例';
  return '数组样例';
}

function sampleSlideCaption(problem, example, exampleEdge) {
  if (problem.slug === 'product-of-array-except-self') {
    return '以 i=2 为例，prefix[2]=2 表示左边 1×2，suffix[2]=4 表示右边 4，所以 ans[2]=8；其他列同理。';
  }
  const bySlug = {
    'minimum-path-sum': '样例 grid 第一行是 1,3,1；最短路径沿 1→3→1→1→1 走到右下角，累计和为 7。',
    'unique-paths': '样例是 3×7 网格；第一行和第一列都只有 1 条路，其余格子由上方和左方相加，右下角得到 28。',
    'maximal-square': '样例矩阵里右下区域能组成 2×2 的全 1 正方形，所以最大面积是 4。',
    'maximal-rectangle': '样例 4×5 矩阵要逐行转成柱状图；在连续 1 的高度里找到高 2、宽 3 的矩形，面积是 6。',
    'rotate-image': '样例 3×3 矩阵先沿主对角线转置，再反转每一行，得到顺时针旋转 90 度的结果。',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  return `样例：${shortLine(example.input, 72)} -> ${shortLine(example.output, 72)}。检查：${shortLine(example.why, 68)}`;
}

function sampleSlideCards(problem, exampleEdge, returnText, edge) {
  if (problem.slug === 'product-of-array-except-self') {
    return [
      { label: '输入', value: 'nums=[1,2,3,4]' },
      { label: '公式', value: 'ans[i] = prefix[i] × suffix[i]' },
      { label: '例子', value: 'i=2: 2 × 4 = 8' },
      { label: '输出', value: '[24,12,8,6]' },
    ];
  }
  return exampleEdge
    ? [
        { label: '输入', value: shortLine(exampleEdge.input, 82) },
        { label: '期望输出', value: shortLine(exampleEdge.expected, 82) },
        { label: '检查点', value: shortLine(exampleEdge.why, 76) },
      ]
    : [
        { label: '输入', value: compact(problem.hints?.level1 || cleanProblemText(problem.summary), 76) },
        { label: '期望输出', value: shortLine(returnText, 72) },
        { label: '检查点', value: shortLine(boundaryLine(problem, edge), 76) },
      ];
}

function graphicCaption(slide, problem) {
  const first = shortLine(String(slide.caption || '').split(/[。；;]/)[0], 46);
  const detail = compact(clean(slide.caption || '').replace(/\s+/g, ' '), 110).replace(/[。；;]+$/g, '');
  const byVisual = {
    read: `先看图里的题目对象、输入和返回值：${detail}。`,
    io: `看清输入、输出和边界三件事：${detail}。`,
    sample: `跟着样例图走一遍：${detail}。`,
    direct: `先看直接做法怎么跑：${detail}。`,
    bottleneck: `看图里重复发生的那一步：${detail}。`,
    pattern: `按图里的主线执行：${detail}。`,
    walk: `按图一步一步执行：${detail}。`,
    edge: `最后看边界图：${detail}。`,
    codeFocus: `代码只看和图对应的关键几行，检查变量含义和更新顺序。`,
    code: `最后对照 Python 代码，把图里的动作落到循环和判断里。`,
    review: `最后比较几种写法，面试提交优先选图中高亮的主解。`,
  };
  return byVisual[slide.visual] || `${problem.title} 这一页先看图，再听结论：${first}。`;
}

function walkTitle(problem, recommendedName) {
  if (problem.slug === 'best-time-to-buy-and-sell-stock') return '一趟扫描更新最低买价';
  const bySlug = {
    'number-of-islands': 'DFS 标记整座岛',
    'product-of-array-except-self': '一格一格算清楚',
    'unique-binary-search-trees': '按根节点拆方案',
    'group-anagrams': '按签名放入桶',
    '3sum': '固定一个数再夹逼',
    'sliding-window-maximum': '维护单调队列',
    'subarray-sum-equals-k': '前缀和计数',
    'linked-list-cycle': '快慢指针追赶',
    'linked-list-cycle-ii': '从相遇点找入口',
    'lru-cache': '移动到链表头',
    'maximal-square': '看三邻格转移',
    'longest-palindromic-substring': '从中心向外扩',
    'palindromic-substrings': '每个中心都计数',
  };
  if (bySlug[problem.slug]) return bySlug[problem.slug];
  const category = problem.category || '';
  if (category.includes('动态规划')) return '按状态转移推进';
  if (category.includes('回溯')) return '选择、递归、撤销';
  if (category.includes('链表')) return '看指针怎么移动';
  if (category.includes('二叉树')) return '看当前节点怎么返回';
  if (category.includes('滑动窗口')) return '移动窗口并更新答案';
  if (category.includes('双指针')) return '移动指针不漏答案';
  if (category.includes('栈') || category.includes('队列')) return '入栈出栈结算答案';
  if (category.includes('哈希') || category.includes('前缀和')) return '记录表怎样更新';
  return recommendedName || '核心过程拆解';
}

function finalizeSlides(problem, slides) {
  return slides.map((slide, index) => ({
    ...slide,
    slug: problem.slug,
    leetcodeId: problem.leetcodeId,
    caption: slide.lockCaption || slide.visual === 'code' || slide.visual === 'codeFocus' || slide.visual === 'review'
      ? clean(slide.caption)
      : graphicCaption(slide, problem),
    audio: `${problem.slug}/${index + 1}.wav`,
  }));
}

function b(eyebrow, title, caption, scene, extra = {}) {
  return {
    eyebrow,
    title,
    caption,
    visual: extra.visual || 'benchmark',
    scene,
    kind: extra.kind || scene,
    lockCaption: true,
    cards: extra.cards || [],
    items: extra.items || [],
    metrics: extra.metrics || [],
    code: extra.code,
    variants: extra.variants,
  };
}

function codeSlideCaption(problem, variant, role = 'main') {
  const name = variant?.name || '推荐写法';
  const code = variant?.code || '';
  const cost = variant ? normalizeComplexityText(`${variant.time}，${variant.space}`) : '';
  if (problem.slug === 'lru-cache' && /OrderedDict/i.test(`${name}\n${code}`)) {
    return `这一版用 OrderedDict：get 后 move_to_end 标记最近使用，容量满时 popitem(last=False) 淘汰最久未使用项。复杂度 ${cost}。`;
  }
  if (problem.slug === 'lru-cache') {
    return `这一版是手写哈希表加双向链表：哈希表负责 O(1) 找节点，链表负责把节点移到头部和淘汰尾部。复杂度 ${cost}。`;
  }
  if (role === 'brute') {
    return `这一版是 ${name}，用来对照最直接的做法和瓶颈。复杂度 ${cost}。`;
  }
  if (role === 'alternate') {
    return `这一版是 ${name}，重点看它和推荐写法的变量、更新顺序有什么不同。复杂度 ${cost}。`;
  }
  return `对照 Python 代码：${compact(codeReadNote(problem), 72)}`;
}

function benchmarkSlides(problem, ctx) {
  const code = ctx.mainCode;
  const variantSlide = (variant, role = 'alternate') =>
    variant
      ? b('CODE', variant.name, codeSlideCaption(problem, variant, role), 'code', {
          visual: 'code',
          code: prepareCode(problem, variant.code),
        })
      : null;
  const bruteVariant = ctx.variants.find((item) => item.badge === '暴力' || /暴力/.test(item.name));
  const sortVariant = ctx.variants.find((item) => /排序|双指针/.test(`${item.name} ${item.idea || ''}`));
  const review = (text) => b('REVIEW', '最后取舍', text, 'review-choice', {
    cards: [
      { label: '推荐', value: ctx.recommendedName },
      { label: '代码', value: 'Python，保留缩进' },
      { label: '检查', value: '图、字幕、代码同一件事' },
    ],
  });
  const codeSlide = (caption) => b('CODE', 'Python 代码', caption, 'code', { visual: 'code', code });
  const defs = {
    'two-sum': [
      b('READ', '两数之和', '给定 nums 和 target，找两个不同下标，让 nums[i] + nums[j] 等于 target。', 'two-sum-read', { cards: [{ label: '输入', value: 'nums, target' }, { label: '输出', value: '两个下标' }, { label: '边界', value: '同一个元素不能用两次' }] }),
      b('EXAMPLE', '样例先跑通', 'nums=[2,7,11,15]，target=9。2 需要 7，7 正好在后面，所以返回 [0,1]。', 'two-sum-sample'),
      b('DIRECT', '暴力两层循环', '先固定 i，再扫描 i 后面的 j；每一对都试一遍，能做对，但重复比较太多。', 'two-sum-brute'),
      b('BOTTLENECK', '重复寻找另一个数', '真正慢的是：每次看到一个数，都要重新去后面找 complement。', 'two-sum-bottleneck'),
      b('HASH', '用哈希表记住过去', '遍历到 x 时，只查 target-x 以前有没有出现过；没出现，再把 x 和下标存进去。', 'two-sum-hash'),
      b('WALK', '一格一格查 complement', '先看 2：需要 7，表里没有，于是记录 2 的下标 0。再看 7：需要 2，命中，返回 [0,1]。', 'two-sum-walk'),
      b('EDGE', '边界不要踩坑', 'target=6，nums=[3,3] 时，第二个 3 才能和第一个 3 配对；不能自己配自己。', 'two-sum-edge'),
      codeSlide('代码里 seen 存 value 到 index；先查 complement，再写当前值，顺序不能反。'),
      review('暴力用于理解题意，哈希表用于提交；排序双指针会打乱原下标，只适合追问。'),
    ],
    'linked-list-cycle-ii': [
      b('READ', '环形链表 II', '给定 head，如果链表有环，返回环入口节点；没有环返回 null。', 'cycle-entry-read'),
      b('EXAMPLE', '先看环长什么样', '输入链表 3 -> 2 -> 0 -> -4，-4 指回 2。输出入口节点 2，检查点是第二次相遇后同步走。', 'cycle-entry-sample'),
      b('DIRECT', '哈希集合能直接找入口', '样例 3->2->0->-4->2：从 head 往后走，每个节点先查 seen；第一次重复出现节点 2，就返回入口 2。', 'cycle-entry-set'),
      b('BOTTLENECK', '哈希表多用了空间', '集合做法很好理解，但每个节点都要额外存一份；快慢指针可以把空间降到 O(1)。', 'cycle-entry-bottleneck'),
      b('MEET', '先让 slow 和 fast 相遇', 'slow 每次一步，fast 每次两步；如果有环，它们一定会在环内某个点相遇。', 'cycle-entry-meet'),
      b('ENTRY', '再同步走到入口', '相遇后，一个指针回 head，另一个留在 meet；两个都每次一步，再次相遇就是入口。', 'cycle-entry-walk'),
      b('EDGE', '无环要能停住', '如果 fast 或 fast.next 走到 null，说明链表没有环，直接返回 null。', 'cycle-entry-edge'),
      codeSlide('代码分两段：第一段找 meet，第二段从 head 和 meet 同步找入口。'),
      review('这题最重要的不是记公式，而是讲清第二次相遇为什么一定在入口。'),
    ],
    'product-of-array-except-self': [
      b('READ', '除自身以外数组的乘积', '返回 output，其中 output[i] 等于 nums 里除了 nums[i] 以外所有数的乘积。', 'product-read'),
      b('EXAMPLE', '先看 i=2 怎么算', 'nums=[1,2,3,4]；i=2 时当前数 3 不参与，左边 1×2，右边 4，所以答案是 8。', 'product-sample'),
      b('DIRECT', '每个位置重新乘一遍', '样例 nums=[1,2,3,4]：固定 i 后，从头到尾乘所有 j != i 的数；能得到输出 [24,12,8,6]，但每格都重复扫。', 'product-direct'),
      b('BOTTLENECK', '重复乘了同一批数', '相邻位置的左边乘积、右边乘积有大量重叠；这些结果应该被复用。', 'product-bottleneck'),
      b('PREFIX', '左积和右积分开算', '第一遍让 ans[i] 先存左边所有数的乘积；第二遍从右往左，用 suffix 乘上右边所有数。', 'product-prefix'),
      b('WALK', '一格一格填表', '看 i=2：左积是 2，右积是 4，所以 ans[2]=8；其他格按同样规则填。', 'product-walk'),
      b('EDGE', '有 0 也不能用除法', 'nums=[1,0,3,4] 时，只有 0 的位置能得到非零乘积；两个 0 时所有位置都是 0。', 'product-edge'),
      codeSlide('代码不要写除法；ans 先放左积，再用一个 suffix 从右往左补右积。'),
      review('推荐写法是 O(n) 时间、O(1) 额外空间；核心是 ans[i] 永远不乘 nums[i]。'),
    ],
    'number-of-islands': [
      b('READ', '岛屿数量', '网格里 1 是陆地、0 是水；上下左右连在一起的陆地算同一座岛。', 'islands-read'),
      b('EXAMPLE', '样例里有两座岛', '左上四个 1 连成第一座岛，右下单独一个 1 是第二座岛，所以答案是 2。', 'islands-sample'),
      b('DIRECT', '扫描每个格子', '样例网格输出 2：从左上到右下扫描；遇到没访问过的 1，答案加一，并检查整座相连陆地。', 'islands-direct'),
      b('BOTTLENECK', '同一座岛不能重复数', '如果只看到 1 就加一，左上那一整片会被重复计数；必须一次搜索把整座岛标记掉。', 'islands-bottleneck'),
      b('DFS', 'DFS/BFS 吃掉整座岛', '从当前 1 出发，向四个方向扩散；走过的陆地立刻标记为 visited 或改成 0。', 'islands-dfs'),
      b('WALK', '标记整座岛', '扫描到左上角 1，ans=1；DFS 标掉相连的四个 1；继续扫描到右下角 1，ans=2。', 'islands-walk'),
      b('EDGE', '全水和边界网格', '全是 0 时答案是 0；只有一个 1 时答案是 1；不要越界访问上下左右。', 'islands-edge'),
      codeSlide('代码关键是 dfs(r,c)：越界、水、已访问都返回；否则标记当前格，再递归四个方向。'),
      review('这题图上要看见“发现新岛”和“把整座岛标记掉”是两件连续动作。'),
    ],
    'unique-binary-search-trees': [
      b('READ', '不同的二叉搜索树', '给定 n，问 1 到 n 能组成多少种结构不同的 BST。', 'bst-count-read'),
      b('EXAMPLE', 'n=3 的 5 种结构', '输入 n=3，输出 5。检查每个 root：左边节点数和右边节点数确定后，方案数相乘再累加。', 'bst-count-sample'),
      b('DIRECT', '递归枚举根', '每次选一个 root，左边数字只能放左子树，右边数字只能放右子树，再递归计算。', 'bst-count-direct'),
      b('BOTTLENECK', '同样规模反复计算', '不管数字具体是 1..2 还是 4..5，只要节点数量相同，BST 结构数就相同。', 'bst-count-bottleneck'),
      b('DP', 'dp[i] 只看节点数量', 'dp[i] 表示 i 个连续数字能组成多少棵 BST；枚举 root，把 dp[left] × dp[right] 累加。', 'bst-count-dp'),
      b('WALK', '按根节点拆方案', 'n=3：root=1 得 2 种，root=2 得 1 种，root=3 得 2 种，总共 5 种。', 'bst-count-walk'),
      b('EDGE', '空树也算一种方案', 'dp[0]=1 是为了让“某边没有节点”也能参与乘法；dp[1]=1。', 'bst-count-edge'),
      codeSlide('代码两层循环：外层节点数 i，内层枚举 root；dp[i] 累加 dp[root-1] * dp[i-root]。'),
      review('不要画成普通遍历树题；这题本质是 Catalan DP，图要画“选根拆左右规模”。'),
    ],
    'sliding-window-maximum': [
      b('READ', '滑动窗口最大值', '给定 nums 和窗口大小 k，窗口每右移一步，输出当前窗口里的最大值。', 'window-max-read'),
      b('EXAMPLE', '窗口一个个滑过去', 'nums=[1,3,-1,-3,5,3,6,7]，k=3；输出 [3,3,5,5,6,7]。', 'window-max-sample'),
      b('DIRECT', '每个窗口扫一遍', '样例 k=3 输出 [3,3,5,5,6,7]：固定窗口后扫描 k 个元素找最大值；窗口重叠很多，仍然反复比较旧元素。', 'window-max-direct'),
      b('BOTTLENECK', '最大值候选没有维护住', '进入新元素时，很多比它小的旧元素永远不可能再成为最大值，应该及时丢掉。', 'window-max-bottleneck'),
      b('DEQUE', '单调队列保存下标', '队列里下标对应的值从大到小；过期下标从队首删，比当前小的从队尾删。', 'window-max-deque'),
      b('WALK', '窗口形成后读队首', '处理到下标 2 时，窗口 [1,3,-1] 形成，队首是值 3；后面每一窗都读队首。', 'window-max-walk'),
      b('EDGE', 'k=1 和重复值', 'k=1 时输出原数组；相等元素可以保留较新的下标，过期判断必须靠下标。', 'window-max-edge'),
      codeSlide('代码里 deque 存的是下标，不是值；每轮先删过期，再维护递减，最后读队首。'),
      review('这题不要讲成普通滑动窗口；核心是“单调队列让最大值一直在队首”。'),
    ],
    'word-search': [
      b('READ', '单词搜索', '给定字符网格和 word，判断能否从相邻格子连成这个单词；同一格不能重复用。', 'word-search-read'),
      b('EXAMPLE', 'ABCCED 路径', '从 A 出发，按 B、C、C、E、D 连起来，路径只能上下左右走。', 'word-search-sample'),
      b('DIRECT', '从每个起点 DFS', '找到等于首字母的格子后，递归尝试四个方向；当前字符不匹配就立刻失败。', 'word-search-direct'),
      b('BOTTLENECK', '不能走回刚用过的格子', '如果不标记 visited，路径可能回到同一个格子，把一个字符重复使用。', 'word-search-bottleneck'),
      b('BACKTRACK', '选择、递归、撤销', '进入格子后先临时标记；四个方向试完如果失败，就恢复原字符，回到上一层。', 'word-search-backtrack'),
      b('WALK', '一格一格走路径', 'A 命中后找 B，再找 C；走错方向就撤销，换下一个方向继续试。', 'word-search-walk'),
      b('EDGE', '单格和越界', 'board 只有一个 a、word 也是 a 时返回 true；越界、字符不等、重复访问都返回 false。', 'word-search-edge'),
      codeSlide('代码关键是 dfs(r,c,i)：匹配 word[i] 后标记当前格，递归四方向，最后恢复现场。'),
      review('这题要看见 visited 和恢复现场；只画最终路径不够。'),
    ],
    'edit-distance': [
      b('READ', '编辑距离', '给定 word1 和 word2，允许插入、删除、替换，求最少几步把 word1 变成 word2。', 'edit-distance-read'),
      b('EXAMPLE', 'horse 到 ros', '输入 horse 和 ros，输出 3。检查一条可行路径：horse -> rorse -> rose -> ros，共 3 次操作。', 'edit-distance-sample'),
      b('DIRECT', '递归尝试三种操作', '样例 horse -> ros 输出 3：如果末尾字符不同，就尝试插入、删除、替换三条路；取最小值再加一。', 'edit-distance-direct'),
      b('BOTTLENECK', '同一前缀反复出现', '暴力递归会反复求 word1 前 i 个字符到 word2 前 j 个字符的距离。', 'edit-distance-bottleneck'),
      b('DP', 'dp[i][j] 的含义', 'dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数。', 'edit-distance-dp'),
      b('WALK', '看当前格依赖谁', '如果两个末尾字符相同，看左上；不同就看左、上、左上三格的最小值再加一。', 'edit-distance-walk'),
      b('EDGE', '空字符串初始化', '空串变成长度 j 的字符串要插入 j 次；长度 i 的字符串变空要删除 i 次。', 'edit-distance-edge'),
      codeSlide('代码先初始化第一行第一列，再按行列填表；当前格只依赖左、上、左上。'),
      review('这题必须按五步讲：dp 含义、递推公式、初始化、遍历顺序、举例填表。'),
    ],
  };
  return defs[problem.slug] || null;
}

function buildSlides(problem, refinement, variants) {
  const model = categoryModel(problem.category);
  const brute = chooseDirectMethod(variants, problem);
  const recommended =
    pickVariant(variants, (item) => item.badge === '推荐') ||
    variants.find((item) => item.code === problem.solutionCode) ||
    null;
  const used = new Set([variantKey(brute), variantKey(recommended)]);
  const alternatives = variants.filter((item) => !used.has(variantKey(item)));
  const firstAlt = alternatives[0] || null;
  const edgeCases = refinement?.edgeCases || [];
  const firstEdge = edgeCases[0] || null;
  const edge = chooseBoundaryEdge(edgeCases) || firstEdge;
  const exampleEdge = exampleOverride(problem) || chooseExampleEdge(edgeCases) || firstEdge;
  const example = parseExampleParts(exampleEdge);
  const coreIdea = refinement?.coreIdea || recommended?.idea || problem.whyThisPattern;
  const direct = directSteps(problem, brute);
  const handwriteSteps = optimizationSteps(problem, recommended, model, refinement);
  const pitfalls = reviewItems(problem, refinement?.commonPitfalls?.length ? refinement.commonPitfalls : problem.commonMistakes || []);
  const mainCode = prepareCode(problem, recommended?.code || refinement?.annotatedCode || problem.solutionCode);
  const problemText = cleanProblemText(problem.summary);
  const promptText = problemPrompt(problem, problemText);
  const title = problem.title;
  const returnText = inferReturn(problem);
  const visualKind = categoryVisual(problem);
  const recommendedName = recommended?.name || '推荐写法';
  const usedCode = new Set([variantCodeShape(mainCode)]);
  const directMeta = directMethodMeta(problem, brute);
  const sameMethodMode = isSameMethod(brute, recommended) || isConceptualTransition(problem, brute, recommended);
  const directSlideTitle = directTitle(problem, sameMethodMode, directMeta);
  const benchmark = benchmarkSlides(problem, {
    refinement,
    variants,
    recommended,
    recommendedName,
    mainCode,
    edge,
    returnText,
  });
  if (benchmark) {
    if (problem.slug === 'two-sum') {
      const extras = [brute, firstAlt].filter(Boolean);
      for (const item of extras) {
        const itemCode = prepareCode(problem, item.code || '');
        const shape = variantCodeShape(itemCode);
        if (itemCode && shape && !usedCode.has(shape)) {
          usedCode.add(shape);
          benchmark.splice(Math.max(benchmark.length - 1, 0), 0, {
            eyebrow: 'ALTERNATIVE CODE',
            title: item.name,
            caption: codeSlideCaption(problem, item, item === brute ? 'brute' : 'alternate'),
            visual: 'code',
            code: itemCode,
            codeLines: codeLines(itemCode),
          });
        }
      }
    }
    return finalizeSlides(problem, benchmark);
  }

  const slides = [
    {
      eyebrow: 'READ THE PROBLEM',
      title,
      caption: readCaption(problem, problemText, exampleEdge),
      visual: 'read',
      kind: visualKind,
      chips: readChips(problem),
      cards: readCards(problem, returnText, exampleEdge),
    },
    {
      eyebrow: 'INPUT / OUTPUT',
      title: '输入、输出、边界',
      caption: `输入：${shortLine(promptText, 52)}。输出：${shortLine(returnText, 52)}。边界：${shortLine(boundaryLine(problem, edge), 52)}。`,
      visual: 'io',
      kind: visualKind,
      cards: problem.slug === 'longest-substring-without-repeating-characters' ? [
        { label: '输入', value: '字符串 s' },
        { label: '输出', value: '最长无重复子串长度' },
        { label: '边界', value: 's="" -> 0；s="bbbbb" -> 1' },
      ] : [
        { label: '输入', value: shortLine(promptText, 72) },
        { label: '返回值', value: shortLine(returnText, 72) },
        { label: '边界', value: shortLine(boundaryLine(problem, edge), 72) },
      ],
    },
    {
      eyebrow: 'EXAMPLE TRACE',
      title: sampleSlideTitle(problem),
      caption: sampleSlideCaption(problem, example, exampleEdge),
      visual: 'sample',
      kind: visualKind,
      cards: sampleSlideCards(problem, exampleEdge, returnText, edge),
    },
    {
      eyebrow: 'DIRECT METHOD',
      title: directSlideTitle,
      caption: sameMethodMode
        ? `核心关系：${direct.slice(0, 2).join('，')}。`
        : `${directMeta.name || '直接做法'}：${direct.slice(0, 2).join('，')}。`,
      visual: 'direct',
      kind: visualKind,
      items: direct,
      metrics: [
        { label: '时间', value: normalizeComplexityText(directMeta.time || '看实现') },
        { label: '空间', value: normalizeComplexityText(directMeta.space || '看实现') },
      ],
    },
    {
      eyebrow: 'BOTTLENECK',
      title: bottleneckSlideTitle(problem, sameMethodMode),
      caption: bottleneckCaption(problem, brute, recommended, sameMethodMode),
      visual: 'bottleneck',
      kind: visualKind,
      cards: sameMethodMode
        ? [
            { label: directMeta.name || recommendedName, value: methodCost(recommended || directMeta) },
            { label: '执行抓手', value: handwriteSteps.slice(0, 2).join('；') },
          ]
        : [
            { label: directMeta.name || '直接做法', value: methodCost(directMeta) },
            { label: recommendedName, value: methodCost(recommended) },
          ],
    },
    {
      eyebrow: patternEyebrow(problem, sameMethodMode),
      title: sameMethodMode ? '执行步骤' : isModelingOnly(problem) ? '带权图建模' : recommendedName,
      caption: patternCaption(problem, recommendedName, coreIdea, sameMethodMode),
      visual: 'pattern',
      kind: visualKind,
      items: handwriteSteps.slice(0, 5),
    },
    {
      eyebrow: 'WALK THROUGH',
      title: walkTitle(problem, recommendedName),
      caption: walkCaption(problem, recommendedName, handwriteSteps),
      visual: 'walk',
      kind: visualKind,
      items: handwriteSteps.slice(0, 5),
    },
    {
      eyebrow: 'EDGE CHECK',
      title: '再压一个边界',
      caption: edge
        ? `${shortLine(edge.input, 72)} -> ${shortLine(edge.expected, 72)}。检查：${shortLine(edge.why, 68)}`
        : `边界：${shortLine(boundaryLine(problem, edge), 78)}。`,
      visual: 'edge',
      kind: visualKind,
      cards: edge
        ? [
            { label: '输入', value: shortLine(edge.input, 82) },
            { label: '期望', value: shortLine(edge.expected, 82) },
            { label: '为什么测', value: shortLine(edge.why, 76) },
          ]
        : [
            { label: '检查 1', value: '空值或极小输入' },
            { label: '检查 2', value: '重复元素或边界位置' },
            { label: '检查 3', value: '答案更新时机' },
          ],
    },
    {
      eyebrow: 'CODE FOCUS',
      title: '关键代码骨架',
      caption: codeFocusCaption(problem, recommended),
      visual: 'codeFocus',
      kind: visualKind,
      codeLines: codeFocusLines(mainCode),
      items: codeFocusItems(problem, handwriteSteps),
    },
    {
      eyebrow: 'MAIN CODE',
      title: recommended?.name || 'Python 代码',
      caption: codeSlideCaption(problem, recommended, 'main'),
      visual: 'code',
      code: mainCode,
      codeLines: codeLines(mainCode),
    },
  ];

  const bruteCode = brute?.code ? prepareCode(problem, brute.code) : '';
  const bruteShape = variantCodeShape(bruteCode);
  if (bruteCode && bruteShape && !usedCode.has(bruteShape)) {
    usedCode.add(bruteShape);
    slides.push({
      eyebrow: 'ALTERNATIVE CODE',
      title: brute.name,
      caption: codeSlideCaption(problem, brute, 'brute'),
      visual: 'code',
      code: bruteCode,
      codeLines: codeLines(brute.code),
    });
  }

  const firstAltCode = firstAlt?.code ? prepareCode(problem, firstAlt.code) : '';
  const firstAltShape = variantCodeShape(firstAltCode);
  if (firstAltCode && firstAltShape && !usedCode.has(firstAltShape) && !shouldSkipVariantCode(problem, firstAlt, 'alternate')) {
    usedCode.add(firstAltShape);
    slides.push({
      eyebrow: 'ALTERNATIVE CODE',
      title: firstAlt.name,
      caption: codeSlideCaption(problem, firstAlt, 'alternate'),
      visual: 'code',
      code: firstAltCode,
      codeLines: codeLines(firstAlt.code),
    });
  }

  slides.push({
    eyebrow: 'CHOICE',
    title: '多解法取舍',
    caption: reviewCaption(problem, recommendedName, variants),
    visual: 'review',
    variants: makeVariantReview(variants.filter((item) => !shouldSkipVariantCode(problem, item, 'alternate'))),
    items: pitfalls.slice(0, 3),
  });

  if (problem.slug === 'product-of-array-except-self') {
    slides[2] = {
      ...slides[2],
      title: '按 prefix / suffix 填表',
      caption: '以 i=2 为例，prefix[2]=2 表示左边 1×2，suffix[2]=4 表示右边 4，所以 ans[2]=8；其他列同理。',
      cards: [
        { label: '输入', value: 'nums=[1,2,3,4]' },
        { label: '公式', value: 'ans[i] = prefix[i] × suffix[i]' },
        { label: '例子', value: 'i=2: 2 × 4 = 8' },
        { label: '输出', value: '[24,12,8,6]' },
      ],
    };
  }

  for (let i = 1; i < slides.length; i += 1) {
    if (slides[i].visual !== 'code' && slides[i - 1].visual !== 'code' && slides[i].title === slides[i - 1].title) {
      slides[i] = { ...slides[i], title: '按样例一步步推演' };
    }
  }

  return finalizeSlides(problem, slides);
}

function createAudioSegments(problem, slides) {
  return slides.map((slide, index) => ({
    chapter: problem.slug,
    step: index + 1,
    text: speechText(slide.caption),
  }));
}

function createArticle(problem, source) {
  return clean(`# ${problem.title} / LeetCode ${problem.leetcodeId}

## 题目定位

- 难度：${problem.difficulty}
- 题型：${problem.category}
- 标签：${(problem.tags || []).join('、')}

## 题目理解

${problem.summary}

## 学习目标

${problem.learningGoal}

## 核心模式

${problem.whyThisPattern}

## 资料补充

${source ? `${source.pdf} 第 ${source.page} 页材料用于校准本题的专题讲法。` : '本题使用 Hot100 精修题库和同专题拆题流程校准讲法。'}
`);
}

function createScript(problem, slides) {
  return clean(`# ${problem.title} 口播稿

> 声音设定：甜美女声，自然讲课语气，像认真带同学刷题，不要机器人播报感。英文变量名按英文读。

${slides.map((slide, index) => `## ${String(index + 1).padStart(2, '0')} ${slide.title}\n\n${slide.caption}`).join('\n\n')}
`);
}

function createOutline(problem, slides) {
  return clean(`# ${problem.title} Web Video Presentation Outline

- 画幅：16:9
- 交互：点击 / 方向键推进
- 讲法：先展示暴力，再定位瓶颈，再讲专题优化，最后给推荐代码和备选代码

${slides.map((slide, index) => `## ${index + 1}. ${slide.title}\n\n- 口播：${slide.caption}\n- 视觉：${slide.visual}`).join('\n\n')}
`);
}

function jsonScript(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

function createIndex(problem, slides) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${problem.title} 解析动画</title>
    <link rel="stylesheet" href="./styles.css?v=${ASSET_VERSION}" />
  </head>
  <body>
    <div class="viewport">
      <section id="stage" class="stage" aria-label="${problem.title} 解析动画">
        <div class="grid-bg"></div>
        <header class="hud">
          <div>
            <span class="kicker">HOT100 VIDEO</span>
            <strong>${problem.title} / LeetCode ${problem.leetcodeId}</strong>
          </div>
          <div class="step-counter"><span id="stepNow">01</span><span>/</span><span id="stepTotal">${String(slides.length).padStart(2, '0')}</span></div>
        </header>
        <main id="scene" class="scene"></main>
        <footer class="subtitle"><p id="caption"></p></footer>
        <div class="progress-shell"><div id="progressBar" class="progress-bar"></div></div>
        <nav class="controls" aria-label="播放控制">
          <button id="prevBtn" type="button">上一幕</button>
          <button id="audioBtn" type="button">声音关闭</button>
          <button id="autoBtn" type="button">自动播放</button>
          <button id="nextBtn" type="button">下一幕</button>
        </nav>
      </section>
    </div>
    <script src="./app.js?v=${ASSET_VERSION}"></script>
  </body>
</html>`;
}

function createStyles() {
  return `:root{--bg:#081321;--panel:#101a2d;--panel2:#07111f;--line:rgba(56,189,248,.16);--text:#eaf4ff;--muted:#a9bfdc;--cyan:#38d5ff;--mint:#2dd4bf;--amber:#fbbf24;--rose:#fb7185}*{box-sizing:border-box}body{margin:0;overflow:hidden;background:#06101d;color:var(--text);font-family:Inter,"Microsoft YaHei","PingFang SC",system-ui,sans-serif}.viewport{width:100vw;height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 78% 20%,rgba(45,212,191,.12),transparent 30%),linear-gradient(135deg,#06111f,#0f172a 58%,#05251f)}.stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform:translate(-50%,-50%) scale(.66);transform-origin:center;background:#081321;overflow:hidden}.grid-bg{position:absolute;inset:0;background:linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/96px 96px,linear-gradient(0deg,var(--line) 1px,transparent 1px) 0 0/96px 96px,radial-gradient(circle at 70% 64%,rgba(45,212,191,.11),transparent 38%);pointer-events:none}.hud{position:absolute;left:58px;right:58px;top:42px;z-index:5;display:flex;align-items:flex-start;justify-content:space-between}.kicker,.eyebrow{display:block;color:var(--cyan);font-size:20px;font-weight:900;letter-spacing:.08em}.hud strong{display:block;margin-top:8px;font-size:27px}.step-counter{display:flex;gap:10px;align-items:center;border:1px solid rgba(56,213,255,.28);background:rgba(8,18,33,.72);padding:13px 18px;font-size:23px;font-weight:900}.controls{position:absolute;right:58px;top:104px;z-index:6;display:flex;gap:12px}.controls button{border:1px solid rgba(56,213,255,.35);background:rgba(8,18,33,.78);color:#e6f7ff;font-size:18px;font-weight:900;padding:12px 18px;cursor:pointer}.scene{position:absolute;left:58px;right:58px;top:150px;bottom:178px;z-index:2}.subtitle{position:absolute;left:58px;right:58px;bottom:86px;z-index:4;border-left:5px solid var(--cyan);background:rgba(2,8,23,.78);padding:18px 26px;min-height:76px}.subtitle p{margin:0;font-size:25px;line-height:1.45;color:#e4f7ff}.progress-shell{position:absolute;left:58px;right:58px;bottom:72px;height:5px;background:rgba(148,163,184,.18);z-index:4}.progress-bar{height:100%;background:linear-gradient(90deg,var(--cyan),var(--mint));width:0}.layout{height:100%;display:grid;grid-template-columns:500px minmax(0,1fr);gap:46px;align-items:center}.layout.code-layout{grid-template-columns:390px minmax(0,1fr)}.copy{display:grid;gap:20px;align-content:center;min-width:0}.title{margin:0;font-size:62px;line-height:1.08;letter-spacing:0}.code-layout .title{font-size:48px}.lead{margin:0;color:var(--muted);font-size:24px;line-height:1.48;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.board{height:620px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.7);box-shadow:0 28px 90px rgba(0,0,0,.34);border-radius:8px;padding:30px;display:grid;gap:24px;align-content:center;overflow:hidden}.scene-stack{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:26px;align-items:center}.scene-stack.single{grid-template-columns:1fr}.diagram{min-height:330px;border:1px solid rgba(56,213,255,.2);background:rgba(2,8,23,.45);display:grid;place-items:center;padding:28px;position:relative}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%}.cards.two{grid-template-columns:repeat(2,1fr)}.card{min-height:124px;border:1px solid rgba(56,213,255,.24);background:rgba(2,8,23,.54);padding:18px;display:grid;align-content:center;gap:10px}.card b{color:#9eeaff;font-size:18px}.card p{margin:0;font-size:22px;line-height:1.35}.chips{display:flex;gap:12px;flex-wrap:wrap}.chip{border:1px solid rgba(56,213,255,.28);background:rgba(56,213,255,.08);padding:12px 16px;color:#dff8ff;font-size:22px;font-weight:900}.chip.hot{border-color:rgba(45,212,191,.75);background:rgba(45,212,191,.18)}.flow{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}.flow-card{min-width:155px;min-height:86px;border:1px solid rgba(56,213,255,.28);background:rgba(2,8,23,.55);display:grid;place-items:center;text-align:center;padding:14px;font-size:23px;font-weight:900}.flow-card.hot{border-color:var(--mint);background:rgba(45,212,191,.2)}.arrow{font-size:40px;color:var(--cyan);font-weight:900}.array-row,.tree-row,.stack-row,.node-row{display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap}.cell,.node,.stack-cell{min-width:92px;min-height:70px;border:1px solid rgba(56,213,255,.3);background:rgba(2,8,23,.62);display:grid;place-items:center;text-align:center;font-size:23px;font-weight:900;position:relative}.node{border-radius:50%;min-width:76px;min-height:76px}.hot{border-color:var(--mint)!important;background:rgba(45,212,191,.2)!important}.dim{opacity:.54}.mini-label{font-size:14px;color:#9fb6d9;margin-top:6px}.pointer{position:absolute;top:-32px;left:50%;transform:translateX(-50%);color:var(--amber);font-size:16px;font-weight:1000}.loop-arrow{position:absolute;right:72px;bottom:74px;color:var(--cyan);font-size:58px;transform:rotate(18deg)}.trace-list{display:grid;gap:12px;width:100%}.trace-item{border:1px solid rgba(56,213,255,.22);background:rgba(2,8,23,.56);padding:14px 18px;font-size:22px;font-weight:900;line-height:1.3}.trace-item.hot{border-color:var(--mint);background:rgba(45,212,191,.18)}.metrics{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}.metric{border:1px solid rgba(56,213,255,.25);background:rgba(56,213,255,.08);padding:12px 15px;font-size:20px;font-weight:900}.compare{display:grid;grid-template-columns:1fr 90px 1fr;gap:18px;align-items:center;width:100%}.compare-card{min-height:270px;border:1px solid rgba(148,163,184,.24);background:rgba(2,8,23,.52);padding:24px;display:grid;align-content:center;justify-items:center;gap:18px;text-align:center}.compare-card strong{font-size:34px}.big-o{font-size:44px;font-weight:1000;color:#eaffff;line-height:1.15}.compare-arrow{font-size:52px;color:var(--cyan);text-align:center;font-weight:1000}.grid-demo{display:grid;grid-template-columns:repeat(5,56px);gap:10px}.grid-cell{width:56px;height:56px;border:1px solid rgba(56,213,255,.26);background:rgba(2,8,23,.68);display:grid;place-items:center;font-size:22px;font-weight:900}.grid-cell.land{background:rgba(45,212,191,.2);border-color:var(--mint)}.dp-demo{display:grid;grid-template-columns:repeat(5,74px);gap:10px}.dp-cell{height:70px;border:1px solid rgba(56,213,255,.26);display:grid;place-items:center;background:rgba(2,8,23,.6);font-size:21px;font-weight:900}.code-focus{display:grid;grid-template-columns:.78fr 1.22fr;gap:20px;width:100%;height:100%}.code-list,.code-board{border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.7);box-shadow:0 28px 90px rgba(0,0,0,.34);border-radius:8px;padding:22px;overflow:hidden}.code-list{display:grid;align-content:center;gap:12px}.code-line{border:1px solid rgba(56,213,255,.2);background:rgba(2,8,23,.58);padding:11px 14px;color:#d1fae5;font-family:Consolas,"SFMono-Regular",monospace;font-size:20px;line-height:1.32;white-space:pre;text-align:left}.code-line.hot{border-color:var(--mint)}.code-board{height:620px;width:100%}.code-board pre{height:100%;margin:0;overflow:hidden;border:1px solid rgba(56,213,255,.18);background:rgba(2,8,23,.74);padding:18px 22px;color:#d1fae5;font-family:Consolas,"SFMono-Regular",monospace;font-size:18px;line-height:1.46;white-space:pre;text-align:left}.code-board.tiny pre{font-size:15px;line-height:1.36}.code-board.micro pre{font-size:12px;line-height:1.25}.code-board.cols2,.code-board.cols3{display:grid;gap:14px}.code-board.cols2{grid-template-columns:repeat(2,minmax(0,1fr))}.code-board.cols3{grid-template-columns:repeat(3,minmax(0,1fr))}.code-board.cols2 pre{font-size:12px;line-height:1.24;padding:15px}.code-board.cols3 pre{font-size:10px;line-height:1.18;padding:12px}.variant-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;width:100%}.variant{min-height:180px;border:1px solid rgba(148,163,184,.24);background:rgba(2,8,23,.56);padding:20px;display:grid;align-content:center;text-align:center;gap:10px}.variant strong{font-size:28px}.variant .cost{font-size:32px;font-weight:1000;color:#9eeaff}.variant p{margin:0;font-size:18px;line-height:1.35;color:#b9cbe6}.variant.hot{border-color:var(--mint);background:rgba(45,212,191,.16)}.fade{animation:rise .36s ease both}@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`;
}

function createCodeLayoutStyles() {
  return `.title{font-size:54px}.layout.long-title .title{font-size:44px}.layout.very-long-title .title{font-size:38px}.layout.top-layout{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:20px;align-items:stretch}.top-layout .copy{align-content:start;justify-items:center;text-align:center;gap:9px;max-width:1320px;margin:0 auto}.top-layout .title{font-size:50px;line-height:1.08}.top-layout.long-title .title{font-size:42px}.top-layout.very-long-title .title{font-size:36px}.top-layout .lead{font-size:22px;line-height:1.38;-webkit-line-clamp:2;max-width:1320px}.top-layout .board{height:540px;padding:24px}.layout.teach-layout{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:20px}.teach-layout .copy{align-content:start;justify-items:center;text-align:center}.teach-layout .title{font-size:48px;line-height:1.08}.teach-layout.long-title .title{font-size:40px}.teach-layout.very-long-title .title{font-size:34px}.teach-layout .lead{font-size:22px;line-height:1.42;-webkit-line-clamp:2}.code-board pre{overflow:hidden}.code-board.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.code-board.cols pre{font-size:13px;line-height:1.3;padding:16px}.trace-list>.grid-demo{grid-template-columns:repeat(3,56px)}.sample-stack{grid-template-columns:minmax(0,1fr) 460px;grid-template-rows:1fr;gap:24px;align-items:stretch}.sample-stack .diagram{min-height:0;height:100%;padding:24px}.sample-stack>div:last-child{display:grid;gap:12px;align-content:center}.sample-stack .chips{justify-content:flex-start}.sample-stack .cards{grid-template-columns:1fr}.sample-stack .card{min-height:86px;padding:14px 16px}.sample-stack .card b{font-size:16px}.sample-stack .card p{font-size:18px;line-height:1.32;overflow-wrap:anywhere;word-break:break-word}.relation-diagram{min-height:390px;padding:30px}.relation-flow{display:flex;align-items:stretch;justify-content:center;gap:14px;flex-wrap:wrap;width:100%}.relation-card{width:220px;min-height:142px;border:1px solid rgba(56,213,255,.28);background:rgba(2,8,23,.58);display:grid;align-content:center;justify-items:center;text-align:center;gap:10px;padding:17px}.relation-card.hot{border-color:var(--mint);background:rgba(45,212,191,.18)}.relation-card b{font-size:17px;color:#9eeaff}.relation-card span{font-size:20px;line-height:1.3;color:#eaf4ff;word-break:break-word;overflow-wrap:anywhere}.relation-arrow{display:grid;place-items:center;color:var(--cyan);font-size:30px;font-weight:1000;min-width:28px}.read-diagram .relation-card{width:225px;min-height:144px}.read-diagram .relation-flow{gap:14px}.prefix-table{display:grid;gap:10px;width:100%;max-width:700px}.prefix-row{display:grid;grid-template-columns:90px repeat(4,1fr);gap:10px;align-items:center}.prefix-row .cell{min-width:0;min-height:58px}.prefix-note{border:1px solid rgba(56,213,255,.22);background:rgba(2,8,23,.48);padding:14px 18px;color:#b9d4f4;font-size:19px;line-height:1.35}.cycle-read{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:24px;align-items:center}.cycle-read .diagram{min-height:420px}.cycle-read .cards{grid-template-columns:repeat(2,1fr)}.cycle-read .card{min-height:106px}`;
}

function createLayoutFixStyles() {
  return `.layout.code-layout{grid-template-columns:410px minmax(0,1fr);gap:34px}.code-layout .lead{display:none}.relation-card span{font-size:18px!important;line-height:1.25!important;display:-webkit-box!important;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.code-focus-board{height:620px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.7);box-shadow:0 28px 90px rgba(0,0,0,.34);border-radius:8px;padding:22px;overflow:hidden}.code-focus-board .code-focus{height:100%;grid-template-columns:minmax(360px,.86fr) minmax(0,1.14fr);gap:18px}.code-focus-board .code-list{min-height:0;overflow:hidden;padding:18px;gap:8px}.code-focus-board .trace-item{font-size:19px;line-height:1.28;padding:12px 14px}.code-focus-board .code-line{font-size:15px;line-height:1.2;min-height:36px;padding:8px 12px;white-space:pre-wrap;overflow:hidden;overflow-wrap:anywhere;text-align:left;align-content:center}.edge-diagram{padding:40px}.edge-flow{width:min(1080px,100%);display:flex;align-items:stretch;justify-content:center;gap:20px;flex-wrap:nowrap}.edge-flow .flow-card{width:300px;min-height:150px;display:grid;align-content:center;justify-items:center;gap:12px}.edge-flow .flow-card b{font-size:20px;color:#9eeaff}.edge-flow .flow-card span{font-size:24px;line-height:1.28;color:#eaf4ff;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.visual-stage{display:grid!important;grid-template-rows:auto minmax(0,1fr) auto;gap:14px;align-content:stretch;padding:26px 34px}.visual-stage>.stage-title{position:static;text-align:center;color:#9eeaff;font-size:22px;font-weight:1000;letter-spacing:.05em}.visual-stage-figure{min-height:0;display:grid;place-items:center}.visual-stage-figure>.diagram{width:100%;height:100%;min-height:0;border:0;background:transparent;padding:8px}.visual-stage-figure>.diagram svg{width:100%;height:100%;display:block}.visual-stage-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.visual-point{min-height:74px;border:1px solid rgba(56,213,255,.26);background:rgba(2,8,23,.58);display:grid;align-content:center;gap:5px;padding:12px 16px}.visual-point.hot{border-color:var(--mint);background:rgba(45,212,191,.18)}.visual-point b{font-size:15px;color:#9eeaff}.visual-point span{font-size:18px;line-height:1.25;color:#eaf4ff;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.sample-stack .cards{grid-template-columns:1fr}.sample-stack .card{min-height:76px}.sample-stack .diagram{overflow:hidden}.sample-stack .diagram .trace-list{justify-items:center;align-content:center}.sample-stack .diagram .trace-list>.flow-card{width:min(900px,100%)}.prefix-row .cell{min-height:50px}.prefix-note{padding:10px 14px;font-size:17px}.code-board{overflow:auto}.code-board pre{white-space:pre;overflow:auto;tab-size:4}.code-board:not(.cols2):not(.cols3){max-width:980px;margin:0 auto}.code-board.micro:not(.cols2):not(.cols3) pre{font-size:14px;line-height:1.32}.code-board.tiny:not(.cols2):not(.cols3) pre{font-size:16px;line-height:1.38}.variant-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}.variant{min-height:150px;padding:16px}.variant strong{font-size:24px}.variant .cost{font-size:26px}.variant p{font-size:16px}.top-layout .flow-card{min-width:132px;min-height:72px;font-size:20px;padding:10px}.top-layout .node-row,.top-layout .flow{justify-content:center}.grid-demo{justify-content:center}.grid-cell{font-size:20px}.dp-demo{grid-template-columns:repeat(5,minmax(112px,1fr));width:min(820px,100%)}.dp-cell{min-width:0;padding:0 10px;white-space:nowrap}.catalan-demo{display:block;padding:22px 26px}.catalan-visual{height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:18px;align-content:stretch}.catalan-head{display:grid;grid-template-columns:repeat(5,minmax(100px,1fr));gap:10px}.catalan-cell{min-height:54px;border:1px solid rgba(56,213,255,.3);background:rgba(2,8,23,.64);display:grid;place-items:center;text-align:center;font-size:20px;font-weight:900}.catalan-cell.hot,.catalan-case.hot,.catalan-result.hot{border-color:var(--mint);background:rgba(45,212,191,.2)}.catalan-cases{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:stretch}.catalan-case{border:1px solid rgba(56,213,255,.26);background:rgba(2,8,23,.58);padding:18px 14px;display:grid;align-content:center;justify-items:center;text-align:center;gap:8px;min-height:148px}.catalan-case b{font-size:24px}.catalan-case span{font-size:19px;color:#cfe6ff;line-height:1.35}.catalan-result{border:1px solid rgba(56,213,255,.26);background:rgba(2,8,23,.58);min-height:76px;display:flex;align-items:center;justify-content:center;gap:20px;font-size:25px;font-weight:1000}.catalan-result strong{font-size:32px;color:#9eeaff}.catalan-note{color:#a9bfdc;font-size:18px;text-align:center}.graphic-board{height:620px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.7);box-shadow:0 28px 90px rgba(0,0,0,.34);border-radius:8px;padding:22px;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:16px;overflow:hidden}.graphic-board .diagram{height:100%;min-height:0;width:100%;padding:26px}.graphic-board .diagram svg{max-width:100%;height:100%;display:block}.graphic-main{min-height:0;display:grid}.graphic-main .diagram{place-items:stretch}.graphic-info{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.graphic-pill{min-height:66px;border:1px solid rgba(56,213,255,.22);background:rgba(2,8,23,.52);padding:12px 14px;display:grid;align-content:center;gap:5px}.graphic-pill.hot{border-color:var(--mint);background:rgba(45,212,191,.16)}.graphic-pill b{font-size:15px;color:#9eeaff}.graphic-pill span{font-size:17px;line-height:1.25;color:#eaf4ff;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.graphic-board.big-only{grid-template-rows:1fr}.graphic-board.big-only .graphic-info{display:none}.graphic-board .trace-list{align-content:center}.graphic-board .flow-card{min-width:150px}.graphic-board .node{min-width:92px;min-height:92px;font-size:28px}.graphic-board .cell{min-width:100px;min-height:78px;font-size:25px}.graphic-board .grid-cell{width:70px;height:70px;font-size:24px}.graphic-board .grid-demo{grid-template-columns:repeat(5,70px);gap:12px}.graphic-board .dp-cell{height:78px;font-size:23px}.stage-diagram{padding:32px}.stage-title{position:absolute;top:28px;left:36px;color:#9eeaff;font-size:22px;font-weight:1000;letter-spacing:.05em}.direct-flow,.walk-rail{display:flex;align-items:stretch;justify-content:space-evenly;gap:20px;width:100%;flex-wrap:nowrap}.direct-node,.walk-step,.pattern-row,.compare-card{border:1px solid rgba(56,213,255,.28);background:rgba(2,8,23,.58);box-shadow:none}.direct-node{flex:1;max-width:260px;min-height:150px;padding:18px;display:grid;align-content:center;justify-items:center;text-align:center;gap:10px}.direct-node b,.walk-step i,.pattern-row b,.compare-card b{color:#9eeaff;font-weight:1000}.direct-node span,.walk-step span,.pattern-row span,.compare-card span{font-size:19px;line-height:1.35;color:#eaf4ff}.rail-arrow{display:grid;place-items:center;color:var(--cyan);font-size:34px;font-weight:1000;min-width:24px}.walk-step{flex:1;max-width:225px;min-height:170px;padding:18px;display:grid;grid-template-rows:auto 1fr;align-content:center;text-align:center;gap:10px}.walk-step i{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;margin:0 auto;background:rgba(56,213,255,.12);font-style:normal}.pattern-stack{width:min(1120px,100%);display:grid;gap:13px}.pattern-row{min-height:78px;padding:14px 20px;display:grid;grid-template-columns:minmax(150px,.32fr) 1fr;align-items:center;gap:20px}.compare-lanes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;width:min(1080px,100%)}.stage-diagram .compare-card{min-height:155px;padding:20px;display:grid;align-content:center;text-align:left;gap:8px}.relation-flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;width:100%;align-items:stretch}.relation-card{width:auto;min-height:150px}.relation-arrow{display:none}.top-layout .lead{display:none}`;
}

const EXTRA_DIAGRAM_JS = `function extraDiagram(kind){if(kind==='addListDigits')return '<div class="diagram"><div class="trace-list"><div class="node-row"><div class="cell hot">2</div><div class="cell">4</div><div class="cell">3</div></div><div class="node-row"><div class="cell hot">5</div><div class="cell">6</div><div class="cell">4</div></div><div class="flow"><div class="flow-card hot">2+5+carry=7</div><div class="arrow">→</div><div class="flow-card">写 7</div><div class="arrow">→</div><div class="flow-card hot">carry 进下一位</div></div></div></div>';if(kind==='noRepeatWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['a','b','c','a','b','c','b','b'],[0,1,2])+'<div class="flow"><div class="flow-card hot">窗口 abc</div><div class="arrow">→</div><div class="flow-card">遇到重复 a</div><div class="arrow">→</div><div class="flow-card hot">left 右移</div></div></div></div>';if(kind==='palindromeCenter')return '<div class="diagram"><div class="trace-list">'+nodeRow(['b','a','b','a','d'],[0,1,2])+'<div class="flow"><div class="flow-card hot">中心 a</div><div class="arrow">↔</div><div class="flow-card hot">向两侧扩展</div><div class="arrow">→</div><div class="flow-card">bab</div></div></div></div>';if(kind==='waterBars')return '<div class="diagram"><svg viewBox="0 0 640 330" width="100%" height="330"><g fill="rgba(56,213,255,.2)" stroke="#38d5ff" stroke-width="2"><rect x="80" y="95" width="48" height="190"/><rect x="160" y="170" width="48" height="115"/><rect x="240" y="125" width="48" height="160"/><rect x="320" y="70" width="48" height="215"/><rect x="400" y="150" width="48" height="135"/></g><path d="M104 95 L344 70 L344 285 L104 285 Z" fill="rgba(45,212,191,.16)" stroke="#2dd4bf" stroke-width="3"/><text x="320" y="38" fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle">面积 = min(left,right) × 距离</text></svg></div>';if(kind==='threeSumPointers')return '<div class="diagram"><div class="trace-list">'+nodeRow(['-4','-1','-1','0','1','2'],[1,4,5])+'<div class="flow"><div class="flow-card hot">固定 -1</div><div class="arrow">+</div><div class="flow-card">left 1</div><div class="arrow">+</div><div class="flow-card">right 2</div><div class="arrow">=</div><div class="flow-card hot">0</div></div></div></div>';if(kind==='phoneChoices')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">23</div></div><div class="tree-row"><div class="node hot">a</div><div class="node">b</div><div class="node">c</div></div><div class="tree-row"><div class="node hot">ad</div><div class="node">ae</div><div class="node">af</div></div><div class="flow-card hot">每一层处理一个数字</div></div></div>';if(kind==='removeNthList')return '<div class="diagram"><div class="trace-list">'+nodeRow(['dummy','1','2','3','4','5'],[0,2,4])+'<div class="flow"><div class="flow-card hot">fast 先走 n</div><div class="arrow">→</div><div class="flow-card">slow 停在待删前</div><div class="arrow">→</div><div class="flow-card hot">改 next</div></div></div></div>';if(kind==='bracketStack')return '<div class="diagram"><div class="trace-list"><div class="stack-row"><div class="stack-cell hot">(</div><div class="stack-cell">[</div><div class="stack-cell">{</div></div><div class="flow"><div class="flow-card">遇到右括号</div><div class="arrow">→</div><div class="flow-card hot">必须匹配栈顶</div></div></div></div>';if(kind==='mergeLists')return '<div class="diagram"><div class="trace-list"><div class="node-row"><div class="cell hot">1</div><div class="cell">2</div><div class="cell">4</div></div><div class="node-row"><div class="cell hot">1</div><div class="cell">3</div><div class="cell">4</div></div><div class="flow"><div class="flow-card hot">dummy</div><div class="arrow">→</div><div class="flow-card">每次接更小节点</div></div></div></div>';if(kind==='rotatedSearch'||kind==='rotatedSearchDup')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','5','6','7','0','1','2'],[0,3,4])+'<div class="flow"><div class="flow-card hot">mid=7</div><div class="arrow">→</div><div class="flow-card">左半有序</div><div class="arrow">→</div><div class="flow-card hot">判断 target 在哪边</div></div></div></div>';if(kind==='rangeBinary')return '<div class="diagram"><div class="trace-list">'+nodeRow(['5','7','7','8','8','10'],[3,4])+'<div class="flow"><div class="flow-card hot">找左边界</div><div class="arrow">+</div><div class="flow-card hot">找右边界</div><div class="arrow">→</div><div class="flow-card">[3,4]</div></div></div></div>';if(kind==='combinationTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">target 7</div></div><div class="tree-row"><div class="node hot">2</div><div class="node">3</div><div class="node">6</div><div class="node">7</div></div><div class="tree-row"><div class="node hot">2,2,3</div><div class="node hot">7</div></div><div class="flow-card hot">同一数字可以重复选，remain 归零就收答案</div></div></div>';if(kind==='rainBars')return '<div class="diagram"><svg viewBox="0 0 640 330" width="100%" height="330"><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="80" y="230" width="40" height="55"/><rect x="140" y="120" width="40" height="165"/><rect x="200" y="230" width="40" height="55"/><rect x="260" y="175" width="40" height="110"/><rect x="320" y="230" width="40" height="55"/><rect x="380" y="95" width="40" height="190"/></g><rect x="200" y="175" width="40" height="55" fill="rgba(45,212,191,.28)" stroke="#2dd4bf"/><rect x="320" y="175" width="40" height="55" fill="rgba(45,212,191,.28)" stroke="#2dd4bf"/><text x="320" y="54" fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle">水位由左右最高墙的较小值决定</text></svg></div>';if(kind==='permuteTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">[]</div></div><div class="tree-row"><div class="node hot">[1]</div><div class="node">[2]</div><div class="node">[3]</div></div><div class="tree-row"><div class="node hot">[1,2]</div><div class="node">[1,3]</div></div><div class="flow-card hot">visited 防止同一层重复使用数字</div></div></div>';if(kind==='rotateMatrix')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','2','3','4','5','6','7','8','9'],[0,4,8],3)+'<div class="flow"><div class="flow-card hot">先转置</div><div class="arrow">→</div><div class="flow-card hot">再反转每一行</div><div class="arrow">→</div><div class="flow-card">顺时针 90°</div></div></div></div>';if(kind==='anagramBuckets')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">eat</div><div class="arrow">→</div><div class="flow-card">aet</div><div class="arrow">→</div><div class="flow-card hot">[eat, tea, ate]</div></div><div class="flow"><div class="flow-card">tan</div><div class="arrow">→</div><div class="flow-card">ant</div><div class="arrow">→</div><div class="flow-card">[tan, nat]</div></div></div></div>';if(kind==='kadaneTrace')return '<div class="diagram"><div class="trace-list">'+nodeRow(['-2','1','-3','4','-1','2','1','-5','4'],[3,4,5,6])+'<div class="flow"><div class="flow-card hot">cur=max(x,cur+x)</div><div class="arrow">→</div><div class="flow-card hot">ans=6</div></div></div></div>';if(kind==='jumpReach')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','3','1','1','4'],[0,1,4])+'<div class="flow"><div class="flow-card hot">farthest</div><div class="arrow">→</div><div class="flow-card">覆盖到终点</div><div class="arrow">→</div><div class="flow-card hot">true</div></div></div></div>';if(kind==='intervalMerge')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">[1,3]</div><div class="flow-card hot">[2,6]</div><div class="arrow">→</div><div class="flow-card hot">[1,6]</div></div><div class="flow"><div class="flow-card">[8,10]</div><div class="flow-card">[15,18]</div></div></div></div>';if(kind==='pathGrid'||kind==='minPathGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['S','→','→','↓','dp','→','↓','↓','E'],[0,4,8],3)+'<div class="flow-card hot">只能向右或向下，当前格来自上方和左方</div></div></div>';if(kind==='stairsDP')return '<div class="diagram"><div class="trace-list"><div class="dp-demo">'+['1','2','3','5','8'].map((x,i)=>'<div class="dp-cell '+(i>1?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="flow-card hot">到第 i 阶 = 到 i-1 阶 + 到 i-2 阶</div></div></div>';if(kind==='coverWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['A','D','O','B','E','C','O','D','E','B','A','N','C'],[9,10,11,12])+'<div class="flow"><div class="flow-card hot">覆盖 ABC</div><div class="arrow">→</div><div class="flow-card">收缩 left</div><div class="arrow">→</div><div class="flow-card hot">BANC</div></div></div></div>';if(kind==='subsetTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">[]</div></div><div class="tree-row"><div class="node hot">选 1</div><div class="node">不选 1</div></div><div class="tree-row"><div class="node hot">[1,2]</div><div class="node">[1]</div></div><div class="flow-card hot">每个数都有选或不选两条路</div></div></div>';if(kind==='bstBounds')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">5</div></div><div class="tree-row"><div class="node">1</div><div class="node hot">7</div></div><div class="flow"><div class="flow-card hot">左子树 < root</div><div class="flow-card hot">右子树 > root</div></div></div></div>';if(kind==='mirrorTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1</div></div><div class="tree-row"><div class="node hot">2</div><div class="node hot">2</div></div><div class="tree-row"><div class="node">3</div><div class="node">4</div><div class="node">4</div><div class="node">3</div></div><div class="flow-card hot">外侧对外侧，内侧对内侧</div></div></div>';if(kind==='depthTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">3</div></div><div class="tree-row"><div class="node">9</div><div class="node hot">20</div></div><div class="tree-row"><div class="node hot">15</div><div class="node hot">7</div></div><div class="flow-card hot">max(left,right)+1</div></div></div>';if(kind==='treeMaxPath')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node">-10</div></div><div class="tree-row"><div class="node">9</div><div class="node hot">20</div></div><div class="tree-row"><div class="node hot">15</div><div class="node hot">7</div></div><div class="flow-card hot">过当前节点的路径 = left + node + right</div></div></div>';if(kind==='wordBreakDP')return '<div class="diagram"><div class="trace-list">'+nodeRow(['leet','code'],[0,1])+'<div class="flow"><div class="flow-card hot">dp[0]=true</div><div class="arrow">→</div><div class="flow-card">dp[4]</div><div class="arrow">→</div><div class="flow-card hot">dp[8]=true</div></div></div></div>';if(kind==='mergeSortList')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','2','1','3'],[1,2])+'<div class="flow"><div class="flow-card hot">快慢指针切半</div><div class="arrow">→</div><div class="flow-card">递归排序</div><div class="arrow">→</div><div class="flow-card hot">合并链表</div></div></div></div>';if(kind==='maxMinProduct')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','3','-2','4'],[0,1,2])+'<div class="flow"><div class="flow-card hot">max_prod</div><div class="arrow">↔</div><div class="flow-card hot">min_prod</div><div class="arrow">遇负数交换</div></div></div></div>';if(kind==='robberLine')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','7','9','3','1'],[0,2,4])+'<div class="flow"><div class="flow-card hot">偷当前 + dp[i-2]</div><div class="arrow">vs</div><div class="flow-card">不偷当前 dp[i-1]</div></div></div></div>';if(kind==='islandGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','1','0','0','1','1','0','0','0','0','1','0'],[0,1,4,5,10],4)+'<div class="flow-card hot">遇到 1 就 DFS 把整座岛标记掉</div></div></div>';if(kind==='reverseList')return '<div class="diagram"><div class="trace-list">'+nodeRow(['prev','cur','next','3','4'],[0,1,2])+'<div class="flow"><div class="flow-card hot">保存 next</div><div class="arrow">→</div><div class="flow-card">cur.next=prev</div><div class="arrow">→</div><div class="flow-card hot">整体右移</div></div></div></div>';if(kind==='heapK')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">堆顶</div></div><div class="tree-row"><div class="node">k 个最大值</div><div class="node">新元素</div></div><div class="flow-card hot">小顶堆容量保持 k，堆顶就是第 k 大</div></div></div>';if(kind==='squareDP')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','0','1','1','1','1','1','1','1'],[3,4,6,7],3)+'<div class="flow-card hot">dp[i][j] = min(左,上,左上)+1</div></div></div>';if(kind==='invertTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">4</div></div><div class="tree-row"><div class="node">2</div><div class="node">7</div></div><div class="flow"><div class="flow-card hot">交换 left/right</div><div class="arrow">→</div><div class="flow-card">递归子树</div></div></div></div>';if(kind==='palindromeList')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','2','1'],[0,3])+'<div class="flow"><div class="flow-card hot">找中点</div><div class="arrow">→</div><div class="flow-card">反转后半</div><div class="arrow">→</div><div class="flow-card hot">两端比较</div></div></div></div>';if(kind==='lcaTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">3</div></div><div class="tree-row"><div class="node hot">5</div><div class="node hot">1</div></div><div class="flow-card hot">左右子树分别找到 p 和 q，当前节点就是祖先</div></div></div>';if(kind==='intersectionList')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card">A: a1→a2</div><div class="arrow">→</div><div class="flow-card hot">c1→c2</div></div><div class="flow"><div class="flow-card">B: b1</div><div class="arrow">→</div><div class="flow-card hot">c1→c2</div></div><div class="flow-card hot">两个指针交换链表后同步相遇</div></div></div>';if(kind==='majorityVote')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','2','1','1','1','2','2'],[0,1,5,6])+'<div class="flow"><div class="flow-card hot">candidate</div><div class="arrow">+</div><div class="flow-card">count 抵消</div><div class="arrow">→</div><div class="flow-card hot">留下多数</div></div></div></div>';if(kind==='squaresDP')return '<div class="diagram"><div class="trace-list"><div class="dp-demo">'+['0','1','2','3','4'].map((x,i)=>'<div class="dp-cell '+(i===4?'hot':'')+'">dp['+i+']='+x+'</div>').join('')+'</div><div class="flow-card hot">枚举平方数 j*j，dp[i]=min(dp[i-j*j]+1)</div></div></div>';if(kind==='moveZeroes')return '<div class="diagram"><div class="trace-list">'+nodeRow(['0','1','0','3','12'],[1,3,4])+'<div class="flow"><div class="flow-card hot">slow 指向写入位置</div><div class="arrow">→</div><div class="flow-card">非零前移</div><div class="arrow">→</div><div class="flow-card hot">0 留后面</div></div></div></div>';if(kind==='serializeTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1</div></div><div class="tree-row"><div class="node">2</div><div class="node">3</div></div><div class="flow"><div class="flow-card hot">前序写值</div><div class="arrow">+</div><div class="flow-card">None 也写</div><div class="arrow">→</div><div class="flow-card hot">可还原结构</div></div></div></div>';if(kind==='lisDP')return '<div class="diagram"><div class="trace-list">'+nodeRow(['10','9','2','5','3','7','101','18'],[2,4,5,7])+'<div class="flow-card hot">tails[len] 保存长度 len 的最小结尾</div></div></div>';if(kind==='stockCooldown')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">持有</div><div class="arrow">→</div><div class="flow-card">卖出</div><div class="arrow">→</div><div class="flow-card hot">冷冻</div><div class="arrow">→</div><div class="flow-card">空仓</div></div></div></div>';if(kind==='balloonInterval')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','3','1','5','8','1'],[1,3,4])+'<div class="flow-card hot">区间 dp：最后戳 k，左右区间先算好</div></div></div>';if(kind==='coinDP')return '<div class="diagram"><div class="trace-list"><div class="dp-demo">'+['0','1','2','3','4'].map((x,i)=>'<div class="dp-cell '+(i>1?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="flow-card hot">每枚硬币尝试更新后面的金额</div></div></div>';if(kind==='robberTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">3</div></div><div class="tree-row"><div class="node">2</div><div class="node">3</div></div><div class="flow"><div class="flow-card hot">偷当前</div><div class="arrow">vs</div><div class="flow-card">不偷当前</div></div></div></div>';if(kind==='partitionDP')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','5','11','5'],[1,2])+'<div class="flow-card hot">总和一半是 11，转成 0/1 背包能否装满</div></div></div>';if(kind==='pathPrefixTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">10</div></div><div class="tree-row"><div class="node">5</div><div class="node">-3</div></div><div class="flow-card hot">当前前缀 cur，查 cur-target 出现过几次</div></div></div>';if(kind==='targetSigns')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','1','1','1','1'],[0,1,2,3,4])+'<div class="flow"><div class="flow-card hot">加号和减号</div><div class="arrow">→</div><div class="flow-card">转成子集和</div></div></div></div>';if(kind==='bstGreater')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">4</div></div><div class="tree-row"><div class="node">1</div><div class="node hot">6</div></div><div class="flow-card hot">反中序：右、根、左，用累加和改节点值</div></div></div>';if(kind==='diameterTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1</div></div><div class="tree-row"><div class="node hot">2</div><div class="node">3</div></div><div class="tree-row"><div class="node hot">4</div><div class="node hot">5</div></div><div class="flow-card hot">直径候选 = 左深度 + 右深度</div></div></div>';if(kind==='prefixSumK')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','1','1'],[0,1])+'<div class="flow"><div class="flow-card hot">prefix=2</div><div class="arrow">查</div><div class="flow-card">prefix-k=0</div><div class="arrow">→</div><div class="flow-card hot">答案 +1</div></div></div></div>';if(kind==='unsortedWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','6','4','8','10','9','15'],[1,2,3,4,5])+'<div class="flow"><div class="flow-card hot">从左找右边界</div><div class="arrow">+</div><div class="flow-card hot">从右找左边界</div></div></div></div>';if(kind==='mergeTrees')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1+2</div></div><div class="tree-row"><div class="node">3+1</div><div class="node">2+3</div></div><div class="flow-card hot">两个节点都在就相加，缺一边就接另一边</div></div></div>';if(kind==='palindromeExpand')return '<div class="diagram"><div class="trace-list">'+nodeRow(['a','b','a','a'],[0,1,2])+'<div class="flow"><div class="flow-card hot">枚举中心</div><div class="arrow">↔</div><div class="flow-card">向外扩</div><div class="arrow">→</div><div class="flow-card hot">计数 +1</div></div></div></div>';if(kind==='bitsDP')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">i</div><div class="arrow">→</div><div class="flow-card">i >> 1</div><div class="arrow">+</div><div class="flow-card hot">i & 1</div></div><div class="flow-card hot">bits[i] = bits[i>>1] + (i&1)</div></div></div>';return ''}`;

const TREE_SPECIFIC_DIAGRAM_JS = `function treeSpecificDiagram(kind){if(kind==='inorderTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1</div></div><div class="tree-row"><div class="node dim">null</div><div class="node hot">2</div></div><div class="tree-row"><div class="node hot">3</div></div><div class="flow"><div class="flow-card hot">左</div><div class="arrow">→</div><div class="flow-card hot">根</div><div class="arrow">→</div><div class="flow-card hot">右</div><div class="arrow">=</div><div class="flow-card hot">[1,3,2]</div></div></div></div>';if(kind==='levelOrderTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">3</div></div><div class="tree-row"><div class="node hot">9</div><div class="node hot">20</div></div><div class="tree-row"><div class="node">15</div><div class="node">7</div></div><div class="flow"><div class="flow-card hot">queue 当前层: 9,20</div><div class="arrow">→</div><div class="flow-card">下一层: 15,7</div></div></div></div>';if(kind==='buildTree')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">preorder[0] = 3</div><div class="arrow">→</div><div class="flow-card hot">root</div></div><div class="flow"><div class="flow-card">inorder 左: [9]</div><div class="flow-card hot">3</div><div class="flow-card">inorder 右: [15,20,7]</div></div><div class="flow-card hot">前序负责找根，中序负责切左右子树</div></div></div>';if(kind==='flattenTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">1</div></div><div class="tree-row"><div class="node">2</div><div class="node">5</div></div><div class="tree-row"><div class="node">3</div><div class="node">4</div><div class="node">6</div></div>'+nodeRow(['1','2','3','4','5','6'],[0,5])+'<div class="flow-card hot">展开后所有 left = None，只沿 right 往后走</div></div></div>';if(kind==='prefixSuffix')return '<div class="diagram"><div class="prefix-table"><div class="prefix-row"><div class="cell hot">nums</div><div class="cell">1</div><div class="cell">2</div><div class="cell">3</div><div class="cell">4</div></div><div class="prefix-row"><div class="cell">prefix</div><div class="cell">1</div><div class="cell">1</div><div class="cell">2</div><div class="cell">6</div></div><div class="prefix-row"><div class="cell">suffix</div><div class="cell">24</div><div class="cell">12</div><div class="cell">4</div><div class="cell">1</div></div><div class="prefix-row"><div class="cell hot">output</div><div class="cell hot">24</div><div class="cell hot">12</div><div class="cell hot">8</div><div class="cell hot">6</div></div><div class="prefix-note">每格只看自己左边的 prefix 和右边的 suffix：output[i] = prefix[i] × suffix[i]</div></div></div>';return ''}`;

const PATCHED_DIAGRAM_JS = `function patchedDiagram(kind){if(kind==='regexDP')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">s="aab"</div><div class="arrow">×</div><div class="flow-card hot">p="c*a*b"</div></div><div class="flow"><div class="flow-card">c* 取 0 个</div><div class="arrow">→</div><div class="flow-card hot">a* 匹配 aa</div><div class="arrow">→</div><div class="flow-card hot">b 匹配 b</div></div><div class="flow-card hot">dp[i][j] 表示 s[:i] 是否能匹配 p[:j]</div></div></div>';if(kind==='coinDP')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">coins=[1,2,5]</div><div class="arrow">→</div><div class="flow-card">amount=11</div><div class="arrow">→</div><div class="flow-card hot">dp[11]=3</div></div><div class="dp-demo">'+['0','1','2','5','10','11'].map((x,i)=>'<div class="dp-cell '+(i>=3?'hot':'')+'">dp['+x+']</div>').join('')+'</div><div class="flow-card hot">5 + 5 + 1，用 3 枚硬币凑出 11</div></div></div>';if(kind==='queueTrace')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">排序后</div><div class="flow-card">[7,0]</div><div class="flow-card">[7,1]</div><div class="flow-card">[6,1]</div><div class="flow-card">[5,0]</div><div class="flow-card">[5,2]</div><div class="flow-card">[4,4]</div></div><div class="flow"><div class="flow-card hot">按 k 插入</div><div class="arrow">→</div><div class="flow-card hot">[5,0] [7,0] [5,2]</div><div class="flow-card hot">[6,1] [4,4] [7,1]</div></div><div class="flow-card hot">插入后，每个人前面身高不低于自己的人数 = k</div></div></div>';return ''}`;

const MISSING_DIAGRAM_JS = `function missingDiagram(kind){if(kind==='decodeStack')return '<div class="diagram"><div class="trace-list"><div class="flow">'+['3','[','a','2','[','c',']',']'].map((x,i)=>'<div class="flow-card '+(i===3||i===5||i===6?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="flow"><div class="flow-card">2[c]</div><div class="arrow">→</div><div class="flow-card hot">cc</div><div class="arrow">→</div><div class="flow-card">a + cc</div><div class="arrow">→</div><div class="flow-card hot">accaccacc</div></div><div class="flow-card hot">遇到 ] 先展开最近一层，再回到外层重复</div></div></div>';if(kind==='anagramWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['c','b','a','e','b','a','b','a','c','d'],[0,1,2,6,7,8])+'<div class="flow"><div class="flow-card hot">窗口 cba</div><div class="arrow">=</div><div class="flow-card">abc 计数</div><div class="arrow">→</div><div class="flow-card hot">记录 0</div><div class="flow-card hot">窗口 bac 记录 6</div></div></div></div>';if(kind==='indexMark')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','3','2','7','8','2','3','1'],[0,1,2,3,5,6,7])+'<div class="flow"><div class="flow-card hot">看到 x</div><div class="arrow">→</div><div class="flow-card">标记 index=x-1</div><div class="arrow">→</div><div class="flow-card hot">没被标记的位置: 5,6</div></div></div></div>';if(kind==='parenBuild')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">""</div></div><div class="tree-row"><div class="node hot">(</div></div><div class="tree-row"><div class="node hot">((</div><div class="node">()</div></div><div class="tree-row"><div class="node hot">((()))</div><div class="node hot">(()())</div><div class="node hot">(())()</div></div><div class="flow-card hot">能放左括号就扩展；右括号数量必须小于左括号数量</div></div></div>';if(kind==='numberLine')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','3','4','100','200'],[0,1,2,3])+'<div class="flow"><div class="flow-card">只从没有前驱的数开始</div><div class="arrow">→</div><div class="flow-card hot">1→2→3→4</div><div class="arrow">→</div><div class="flow-card hot">长度 4</div></div></div></div>';if(kind==='parenIndexStack')return '<div class="diagram"><div class="trace-list">'+nodeRow(['0:(','1:(','2:)'],[0,1,2])+'<div class="flow"><div class="flow-card hot">栈底 -1</div><div class="arrow">→</div><div class="flow-card">遇 ( 压下标</div><div class="arrow">→</div><div class="flow-card hot">遇 ) 弹出并算长度 2</div></div><div class="flow-card hot">最后还剩一个左括号，所以最长有效长度是 2</div></div></div>';return ''}`;

const OVERRIDE_DIAGRAM_JS = `function overrideDiagram(kind){
if(kind==='islandGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','1','0','1','0','0','0','0','1'],[0,1,3,8],3)+'<div class="flow-card hot">3×3 网格：左上连通块是一座岛，右下单独是一座岛</div></div></div>';
if(kind==='maximalRect')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','0','1','0','0','1','0','1','1','1','1','1','1','1','1','1','0','0','1','0'],[7,8,9,12,13,14],5)+'<div class="flow"><div class="flow-card">4×5 矩阵逐行变柱状图</div><div class="arrow">→</div><div class="flow-card hot">高 2、宽 3</div><div class="arrow">→</div><div class="flow-card hot">面积 6</div></div></div></div>';
if(kind==='squareDP')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','0','1','0','1','1','1','1','1','1','1','1'],[6,7,10,11],4)+'<div class="flow-card hot">样例矩阵里右下区域能组成边长 2 的正方形</div></div></div>';
if(kind==='noRepeatWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['b','b','b','b','b'],[0])+'<div class="flow"><div class="flow-card hot">窗口只能留 1 个 b</div><div class="arrow">→</div><div class="flow-card">再次遇到 b</div><div class="arrow">→</div><div class="flow-card hot">left 右移</div></div></div></div>';
if(kind==='waterBars')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','8','6','2','5','4','8','3','7'],[1,8],9)+'<div class="flow"><div class="flow-card hot">下标 1 高 8</div><div class="arrow">×</div><div class="flow-card">宽 7</div><div class="arrow">→</div><div class="flow-card hot">面积 49</div></div></div></div>';
if(kind==='rainBars')return '<div class="diagram"><div class="trace-list">'+smallGrid(['0','1','0','2','1','0','1','3','2','1','2','1'],[2,4,5,6,9],12)+'<div class="flow-card hot">每格水量 = min(左最高, 右最高) - 当前高度，总水量 6</div></div></div>';
if(kind==='bracketStack')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">( )</div><div class="flow-card hot">[ ]</div><div class="flow-card hot">{ }</div></div><div class="flow"><div class="flow-card">左括号入栈</div><div class="arrow">→</div><div class="flow-card hot">右括号匹配栈顶</div><div class="arrow">→</div><div class="flow-card hot">最后空栈 true</div></div></div></div>';
if(kind==='rotateBinary')return '<div class="diagram"><div class="trace-list">'+nodeRow(['3','4','5','1','2'],[2,3])+'<div class="flow"><div class="flow-card hot">mid=5</div><div class="arrow">></div><div class="flow-card">right=2</div><div class="arrow">→</div><div class="flow-card hot">最小值在右半边</div></div></div></div>';
if(kind==='rotateBinaryDup')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','2','2','0','1'],[0,2,3])+'<div class="flow"><div class="flow-card">重复值挡住方向</div><div class="arrow">→</div><div class="flow-card hot">right-- 缩边界</div><div class="arrow">→</div><div class="flow-card hot">定位最小值 0</div></div></div></div>';
if(kind==='rotatedSearchDup')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','5','6','0','0','1','2'],[0,3,4,6])+'<div class="flow"><div class="flow-card">target=0</div><div class="arrow">→</div><div class="flow-card hot">重复值先收缩</div><div class="arrow">→</div><div class="flow-card hot">命中 0</div></div></div></div>';
if(kind==='permutationPivot')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','3'],[1,2])+'<div class="flow"><div class="flow-card hot">pivot=2</div><div class="arrow">→</div><div class="flow-card">右侧找 3</div><div class="arrow">→</div><div class="flow-card hot">[1,3,2]</div></div></div></div>';
if(kind==='pathGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','1','1','1','1','1','1','1','2','3','4','5','6','7','1','3','6','10','15','21','28'],[20],7)+'<div class="flow-card hot">3×7 网格：每格路径数 = 上方 + 左方，右下角得到 28</div></div></div>';
if(kind==='minPathGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','3','1','1','5','1','4','2','1'],[0,1,2,5,8],3)+'<div class="flow"><div class="flow-card">路径 1→3→1→1→1</div><div class="arrow">→</div><div class="flow-card hot">最小和 7</div></div></div></div>';
if(kind==='bstBounds')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">2</div></div><div class="tree-row"><div class="node">1</div><div class="node">3</div></div><div class="flow-card hot">左子树 < 2 < 右子树，所以样例是合法 BST</div></div></div>';
if(kind==='robberTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">3</div></div><div class="tree-row"><div class="node">2</div><div class="node">3</div></div><div class="tree-row"><div class="node hot">3</div><div class="node hot">1</div></div><div class="flow-card hot">偷 root + 孙子：3 + 3 + 1 = 7</div></div></div>';
if(kind==='pathPrefixTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">10</div></div><div class="tree-row"><div class="node hot">5</div><div class="node">-3</div></div><div class="tree-row"><div class="node hot">3</div><div class="node">2</div><div class="node hot">11</div></div><div class="flow"><div class="flow-card hot">5→3</div><div class="flow-card hot">5→2→1</div><div class="flow-card hot">-3→11</div></div></div></div>';
if(kind==='palindromeExpand')return '<div class="diagram"><div class="trace-list">'+nodeRow(['a','a','a'],[0,1,2])+'<div class="flow"><div class="flow-card hot">3 个单字符</div><div class="arrow">+</div><div class="flow-card hot">2 个 aa</div><div class="arrow">+</div><div class="flow-card hot">1 个 aaa = 6</div></div></div></div>';
if(kind==='catalanDP')return '<div class="diagram"><svg viewBox="0 0 1180 420" width="100%" height="100%" role="img" aria-label="n=3 时依次选择 1、2、3 做根节点，左右子树方案数相乘再相加"><defs><marker id="treeArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><text x="590" y="28" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">固定根节点：左子树方案数 × 右子树方案数，最后相加得到 dp[3] = 5</text><g fill="rgba(2,8,23,.42)" stroke="rgba(56,213,255,.32)" stroke-width="2"><rect x="38" y="54" width="330" height="230" rx="8"/><rect x="425" y="54" width="330" height="230" rx="8"/><rect x="812" y="54" width="330" height="230" rx="8"/></g><g stroke="#38d5ff" stroke-width="3" fill="none"><path d="M205 126 L265 176"/><path d="M265 214 L315 258"/><path d="M590 126 L535 186"/><path d="M590 126 L645 186"/><path d="M975 126 L915 176"/><path d="M915 214 L865 258"/></g><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="205" cy="102" r="36"/><circle cx="265" cy="198" r="36"/><circle cx="315" cy="282" r="36"/><circle cx="590" cy="102" r="36"/><circle cx="535" cy="210" r="36"/><circle cx="645" cy="210" r="36"/><circle cx="975" cy="102" r="36"/><circle cx="915" cy="198" r="36"/><circle cx="865" cy="282" r="36"/></g><g fill="#eaf4ff" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="205" y="102">1</text><text x="265" y="198">2</text><text x="315" y="282">3</text><text x="590" y="102">2</text><text x="535" y="210">1</text><text x="645" y="210">3</text><text x="975" y="102">3</text><text x="915" y="198">2</text><text x="865" y="282">1</text></g><g fill="#9eeaff" font-size="24" font-weight="900" text-anchor="middle"><text x="203" y="342">root=1：左空，右边 2 个节点</text><text x="590" y="342">root=2：左 1 个，右 1 个</text><text x="977" y="342">root=3：左边 2 个节点，右空</text></g><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle"><text x="203" y="382">1 × 2 = 2</text><text x="590" y="382">1 × 1 = 1</text><text x="977" y="382">2 × 1 = 2</text></g></svg></div>';
return ''}`;


const FIXUP_DIAGRAM_JS = `function fixupDiagram(s,mode){const k=s.kind;const svg=(body)=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+body+'</svg></div>';const tx=(x,y,t,size=23,color='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false,size=22)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.66)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,size);const defs='<defs><marker id="fx" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#fx)"/>';const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="34" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.7)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,22);const cell=(x,y,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="68" height="50" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.66)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="2"/>'+tx(x+34,y+25,t,18);if(k==='treeMaxPath'&&mode==='direct')return svg(defs+node(590,72,'20',true)+node(470,205,'15',true)+node(710,205,'7',true)+arrow(470,170,555,103)+arrow(710,170,625,103)+box(95,90,320,64,'left=max(gain(15),0)=15',true,20)+box(765,90,320,64,'right=max(gain(7),0)=7',true,20)+box(230,300,300,62,'ans=max(ans,15+20+7)',true,20)+box(650,300,300,62,'return 20 + max(15,7)',false,20));if(k==='partitionDP'&&(mode==='pattern'||mode==='walk'))return svg(defs+box(80,70,260,62,'target = sum(nums) / 2',true)+box(400,70,260,62,'dp[0] = true')+box(720,70,300,62,'每个数只能用一次')+['0','1','2','3','4','5'].map((v,i)=>cell(240+i*82,205,v,i===0||i===5)).join('')+arrow(730,230,330,230)+tx(590,330,'容量从右往左更新，避免同一个数字在本轮被重复使用。',24,'#fbbf24'));if(k==='targetSigns'&&(mode==='direct'||mode==='pattern'))return svg(defs+box(95,85,300,66,'正数集合 P，负数集合 N',true)+box(455,85,260,66,'P - N = target')+box(775,85,260,66,'P + N = sum')+arrow(585,155,585,225)+box(390,225,390,70,'P = (sum + target) / 2',true)+tx(590,335,'先把加减号问题变成：选一些数凑出 P 的方案数。',24,'#fbbf24'));if(k==='stockCooldown'&&(mode==='pattern'||mode==='walk'))return svg(defs+['day','hold','sold','rest'].map((r,j)=>['0','1','2','3'].map((c,i)=>cell(250+i*105,70+j*62,j===0?c:(j===1?'持有':j===2?'卖出':'休息'),i===2&&j>0)).join('')).join('')+box(735,105,270,62,'sold -> 下一天 cooldown',true)+box(735,205,270,62,'rest 才能再次买入')+tx(590,355,'三种状态分开画，才能看清卖出后的冷冻日。',24,'#fbbf24'));if(k==='balloonInterval'&&(mode==='direct'||mode==='pattern'||mode==='walk'))return svg(defs+box(90,72,160,58,'1')+box(275,72,160,58,'3')+box(460,72,160,58,'1',true)+box(645,72,160,58,'5')+box(830,72,160,58,'8')+box(260,225,300,66,'枚举最后戳破的 k',true)+box(620,225,350,66,'dp[l][k] + nums[l]*nums[k]*nums[r] + dp[k][r]')+tx(590,350,'关键不是先戳谁，而是假设区间里最后剩下谁。',24,'#fbbf24'));if(k==='combinationTree'&&(mode==='pattern'||mode==='walk'))return svg(defs+box(90,70,230,62,'path=[2,2]',true)+box(395,70,230,62,'remain=3')+box(700,70,230,62,'start=0')+node(590,175,'7')+node(455,285,'5')+node(590,285,'3',true)+node(725,285,'2')+tx(590,365,'选择当前数、递归、撤销；start 控制可以重复选但不能回头乱序。',23,'#fbbf24'));if(k==='phoneChoices'&&(mode==='pattern'||mode==='walk'))return svg(defs+box(90,60,210,60,'digit 2: a b c',true)+box(365,60,210,60,'digit 3: d e f')+box(640,60,210,60,'path')+node(235,190,'a',true)+node(395,190,'b')+node(555,190,'c')+node(355,300,'ad',true)+node(515,300,'ae')+node(675,300,'af')+tx(590,370,'每一层对应一个数字，path 追加一个字母后进入下一层。',24,'#fbbf24'));if(k==='islandGrid'&&(mode==='sample'||mode==='walk'||mode==='pattern'))return svg(defs+['1','1','0','1','0','0','0','1','0'].map((v,i)=>cell(350+(i%3)*80,70+Math.floor(i/3)*64,v,v==='1'&&(i===0||i===1))).join('')+box(660,95,300,62,'扫描到未访问的 1：ans++',true)+box(660,195,300,62,'DFS 把相邻陆地标记 visited')+tx(590,335,'这里是 3x3 样例；每发现一座新岛，就先扩散标记完再继续扫描。',24,'#fbbf24'));if(k==='lisDP'&&(mode==='pattern'||mode==='walk'))return svg(defs+['10','9','2','5','3','7'].map((v,i)=>cell(230+i*84,80,v,i===3||i===5)).join('')+box(220,205,250,62,'tails[len] = 最小结尾',true)+box(560,205,290,62,'用二分替换第一个 >= x')+tx(590,330,'tails 不是最终子序列，而是让每个长度的结尾尽量小。',24,'#fbbf24'));if(k==='maximalRect'&&(mode==='pattern'||mode==='walk'))return svg(defs+['1','0','1','1','1','1','1','1','0'].map((v,i)=>cell(190+(i%3)*64,70+Math.floor(i/3)*58,v,v==='1')).join('')+arrow(420,155,560,155)+['2','1','3'].map((v,i)=>box(590+i*105,190-Number(v)*35,72,Number(v)*35,v,true)).join('')+box(830,110,240,62,'每行转成柱状图',true)+tx(590,345,'先累计每列连续 1 的高度，再把这一行交给柱状图最大矩形。',24,'#fbbf24'));if(k==='medianPartition'&&(mode==='pattern'||mode==='walk'))return svg(defs+box(120,85,310,62,'A 左半 <= B 右半',true)+box(500,85,310,62,'B 左半 <= A 右半',true)+box(290,220,170,58,'A_left')+box(470,220,170,58,'| cut |')+box(650,220,170,58,'A_right')+box(250,315,210,58,'B_left')+box(650,315,210,58,'B_right')+tx(590,385,'二分找的是切分线，不是直接找某个元素。',24,'#fbbf24'));return ''}`;
const SUPERFOCUSED_DIAGRAM_JS = `function superFocusedDiagram(s,mode){const k=s.kind,scene=s.scene||k;const svg=b=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+b+'</svg></div>';const tx=(x,y,t,sz=24,c='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+sz+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false,sz=22)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.65)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,sz);const defs='<defs><marker id="sf" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const ar=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#sf)"/>';const cell=(x,y,t,hot=false)=>box(x,y,86,58,t,hot,21);const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="34" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.68)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,22);const row=(vals,x,y,hot=[])=>vals.map((v,i)=>cell(x+i*112,y,v,hot.includes(i))+(i<vals.length-1?ar(x+i*112+86,y+29,x+(i+1)*112,y+29):'')).join('');if(scene.startsWith('two-sum')){if(scene.includes('hash'))return svg(defs+row(['0:2','1:7','2:11','3:15'],125,95,[0])+box(420,235,240,64,'先查 need',true)+ar(545,145,545,235)+box(710,235,260,64,'没命中，再写 seen')+box(430,330,340,56,'seen[value] = index',true,24));if(scene.includes('walk'))return svg(defs+row(['0:2','1:7','2:11','3:15'],110,82,[0,1])+box(670,70,320,62,'i=0, x=2, need=7')+box(670,155,320,62,'seen 还没有 7，写 {2:0}',true)+box(670,240,320,62,'i=1, x=7, need=2')+box(670,325,320,62,'命中 seen[2]，返回 [0,1]',true));}if(k==='coinDP'){if(mode==='pattern')return svg(defs+['0','1','2','3','4','5','6','7','8','9','10','11'].map((v,i)=>cell(75+i*88,115,v,i===0)).join('')+box(220,245,280,62,'dp[0]=0：金额 0 不用硬币',true)+box(595,245,360,62,'每个 dp[i] 从所有 coin 里取最小'));if(mode==='walk')return svg(defs+['0','1','2','3','4','5','6'].map((v,i)=>cell(225+i*88,80,v,i===1||i===6)).join('')+box(260,210,240,62,'算 dp[6]',true)+box(555,210,260,62,'试 coin=5')+box(845,210,260,62,'dp[1]+1 = 2',true)+tx(590,335,'当前格只看更小金额的结果，所以从左到右填表。',24,'#fbbf24'));}if(k==='parenBuild'){if(mode==='pattern')return svg(defs+box(150,90,230,64,'path 当前串',true)+box(455,90,240,64,'left < n 放 (')+box(775,90,270,64,'right < left 放 )',true)+box(360,245,430,66,'不满足条件的分支直接不画下去'));if(mode==='walk')return svg(defs+node(590,65,'')+node(455,160,'(' ,true)+node(720,160,') 剪枝',true)+node(380,275,'((')+node(540,275,'()')+node(690,275,'()) 剪枝',true)+tx(590,370,'递归树里只保留合法前缀，返回时撤销最后一次选择。',23,'#fbbf24'));}if(k==='lruCache'){if(mode==='pattern')return svg(defs+box(90,80,270,66,'哈希表：key -> node',true)+box(455,80,285,66,'双向链表：记录新旧')+box(830,80,220,66,'O(1) 查找/移动',true)+box(240,240,130,58,'HEAD',true)+ar(370,269,500,269)+box(500,240,130,58,'最新')+ar(630,269,760,269)+box(760,240,130,58,'最旧')+ar(890,269,1010,269)+box(1010,240,130,58,'TAIL',true));if(mode==='walk')return svg(defs+box(145,80,160,58,'prev')+box(390,80,160,58,'node',true)+box(635,80,160,58,'next')+ar(305,109,390,109)+ar(550,109,635,109)+box(150,235,310,62,'1. prev.next = next',true)+box(520,235,310,62,'2. next.prev = prev')+box(875,235,240,62,'3. 插到 HEAD 后',true));}if(k==='removeNthList'){if(mode==='pattern')return svg(defs+row(['dummy','1','2','3','4','5'],55,125,[0])+box(760,80,270,62,'fast 先走 n 步',true)+box(760,175,270,62,'fast/slow 一起走')+box(760,270,270,62,'slow 停在待删前驱',true));if(mode==='walk')return svg(defs+row(['dummy','1','2','3','4','5'],55,125,[3,4])+box(730,80,320,62,'slow 在 3，待删是 4',true)+box(730,180,320,62,'slow.next = slow.next.next')+box(730,280,320,62,'结果 1->2->3->5',true));}if(k==='islandGrid'){const grid=['1','1','0','0','1','0','0','0','1'].map((v,i)=>box(315+(i%3)*74,70+Math.floor(i/3)*64,62,52,v,v==='1'&&(i===0||i===1),20)).join('');if(mode==='sample'||mode==='read'||mode==='io')return svg(defs+grid+box(670,90,270,62,'3 x 3 网格')+box(670,185,270,62,'1 是陆地，0 是水')+box(670,280,270,62,'输出岛屿数量',true));if(mode==='pattern'||mode==='walk')return svg(defs+grid+box(645,75,330,62,'扫描到未访问 1：ans++',true)+box(645,170,330,62,'DFS/BFS 扩散标记整座岛')+box(645,265,330,62,'继续找下一座岛',true));}return ''}`;
const FOCUSED_DIAGRAM_JS = `function focusedDiagram(s,mode){const k=s.kind,scene=s.scene||k;const svg=(body)=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+body+'</svg></div>';const tx=(x,y,t,size=23,color='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false,size=22)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.68)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,size);const defs='<defs><marker id="fd" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#fd)"/>';const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="34" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.7)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,22);const cell=(x,y,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="74" height="52" rx="4" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.66)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="2"/>'+tx(x+37,y+26,t,18);const arr=(vals,x,y,hot=[])=>vals.map((v,i)=>box(x+i*105,y,82,58,v,hot.includes(i),22)+(i<vals.length-1?arrow(x+i*105+82,y+29,x+(i+1)*105,y+29):'')).join('');if(scene.startsWith('two-sum')){if(scene.includes('read'))return svg(defs+arr(['0:2','1:7','2:11','3:15'],170,120,[])+box(780,118,220,62,'target = 9',true)+tx(590,280,'目标：找两个不同下标，让两个数相加正好等于 target。',27,'#fbbf24'));if(scene.includes('sample'))return svg(defs+arr(['0:2','1:7','2:11','3:15'],135,120,[0,1])+box(750,75,250,62,'2 + 7 = 9',true)+box(750,180,250,62,'返回 [0, 1]')+tx(590,310,'样例先把输入、输出和“不能用同一个元素两次”说清楚。',24,'#fbbf24'));if(scene.includes('brute'))return svg(defs+box(120,90,170,62,'固定 i=0',true)+arrow(290,121,385,121)+box(385,90,170,62,'j 扫 1..n-1')+arrow(555,121,650,121)+box(650,90,230,62,'逐对检查 sum')+box(395,230,390,70,'能做对，但重复比较太多',true)+tx(590,350,'这里直接展示暴力算法怎么做，再看它慢在哪里。',24,'#fbbf24'));if(scene.includes('hash')||scene.includes('walk'))return svg(defs+arr(['0:2','1:7','2:11','3:15'],110,105,[0,1])+box(660,70,310,66,'i=0, x=2, need=7')+box(660,165,310,66,'seen = {2:0}',true)+box(660,260,310,66,'i=1, x=7, need=2 命中',true)+tx(590,375,'先查 need，再写当前 x；这样 target=2*x 时不会把自己配给自己。',23,'#fbbf24'));if(scene.includes('edge'))return svg(defs+arr(['0:3','1:3'],390,120,[0,1])+box(480,235,240,62,'target = 6',true)+box(760,235,260,62,'第二个 3 命中第一个 3')+tx(590,350,'边界检查的是：同值可以配对，但必须是两个不同下标。',24,'#fbbf24'))}if(k==='coinDP'){if(mode==='read'||mode==='io')return svg(defs+box(150,100,230,70,'coins=[1,2,5]',true)+box(475,100,210,70,'amount=11')+box(780,100,210,70,'返回 3',true)+tx(590,280,'输入是硬币面额和目标金额，输出是最少硬币数；凑不出返回 -1。',25,'#fbbf24'));if(mode==='sample')return svg(defs+box(240,110,150,70,'5',true)+box(465,110,150,70,'5',true)+box(690,110,150,70,'1',true)+arrow(390,145,465,145)+arrow(615,145,690,145)+box(430,245,320,62,'5 + 5 + 1 = 11，最少 3 枚',true));if(mode==='direct')return svg(defs+node(590,70,'dfs(11)',true)+node(390,190,'dfs(10)')+node(590,190,'dfs(9)')+node(790,190,'dfs(6)',true)+arrow(560,100,410,160)+arrow(590,105,590,155)+arrow(620,100,770,160)+box(390,300,390,64,'记忆化避免同一个 rest 反复算',true));if(mode==='pattern'||mode==='walk')return svg(defs+['0','1','2','3','4','5','6','7','8','9','10','11'].map((v,i)=>cell(92+i*82,130,v,[0,5,10,11].includes(i))).join('')+box(260,250,260,62,'dp[0]=0')+box(590,250,320,62,'dp[i]=min(dp[i-coin]+1)',true)+tx(590,345,'从小金额推到 amount；每个金额尝试所有硬币，留下最少枚数。',24,'#fbbf24'));if(mode==='edge')return svg(defs+box(250,110,260,70,'amount=0 -> 0',true)+box(670,110,260,70,'凑不出 -> -1')+tx(590,285,'初始化和无解标记必须单独检查。',26,'#fbbf24'))}if(k==='parenBuild'){if(mode==='read'||mode==='io')return svg(defs+box(170,100,230,70,'n 对括号',true)+box(475,100,230,70,'生成所有合法串')+box(780,100,230,70,'前缀不能先多出 )',true));if(mode==='sample')return svg(defs+node(590,70,'\"\"',true)+node(470,180,'(')+node(710,180,'剪掉 )',true)+node(390,300,'((')+node(550,300,'()')+node(710,300,'非法前缀')+tx(590,370,'从空串开始，每一层只放一个括号；非法前缀当场不再往下走。',23,'#fbbf24'));if(mode==='direct')return svg(defs+box(185,90,270,70,'每个位置都试 ( 或 )',true)+box(545,90,250,70,'生成 2^(2n) 个串')+box(845,90,200,70,'最后过滤')+tx(590,270,'暴力能理解题意，但大部分分支一开始就已经非法。',25,'#fbbf24'));if(mode==='pattern'||mode==='walk')return svg(defs+box(130,90,220,70,'path',true)+box(450,90,220,70,'left < n 才放 (')+box(770,90,250,70,'right < left 才放 )',true)+box(360,240,450,70,'递归返回后撤销最后一个选择',true));if(mode==='edge')return svg(defs+box(420,130,340,80,'n=1 -> [()]',true)+tx(590,280,'最小规模检查收集答案的时机。',25,'#fbbf24'))}if(k==='removeNthList'){if(mode==='read'||mode==='io')return svg(defs+arr(['1','2','3','4','5'],125,125,[])+box(780,95,240,62,'n=2')+box(780,185,240,62,'删除倒数第 2 个',true));if(mode==='sample')return svg(defs+arr(['1','2','3','4','5'],110,110,[3])+box(780,70,260,62,'删除 4',true)+box(780,170,260,62,'输出 1->2->3->5')+arrow(532,190,635,190));if(mode==='direct')return svg(defs+box(130,95,260,70,'第一次遍历求长度 L',true)+box(460,95,260,70,'位置 = L-n+1')+box(790,95,220,70,'第二次走到前驱')+tx(590,280,'两次遍历清楚但多走一遍链表。',25,'#fbbf24'));if(mode==='pattern'||mode==='walk')return svg(defs+arr(['dummy','1','2','3','4','5'],55,125,[0,3,4])+box(710,72,310,62,'fast 先走 n 步',true)+box(710,170,310,62,'slow 停在待删前一个')+box(710,268,310,62,'slow.next 跳过 4',true));if(mode==='edge')return svg(defs+arr(['dummy','1'],380,120,[0,1])+box(450,240,280,62,'删除头节点也由 dummy 统一处理',true))}if(k==='treeMaxPath'){if(mode==='read'||mode==='io')return svg(defs+node(590,80,'-10')+node(455,190,'9')+node(725,190,'20')+node(650,300,'15')+node(800,300,'7')+tx(590,370,'路径可以从任意节点开始、到任意节点结束，但中间必须连续。',24,'#fbbf24'));if(mode==='sample')return svg(defs+node(590,80,'-10')+node(455,190,'9')+node(725,190,'20',true)+node(650,300,'15',true)+node(800,300,'7',true)+arrow(650,266,710,215)+arrow(800,266,740,215)+box(850,105,210,62,'15+20+7=42',true));if(mode==='direct'||mode==='pattern'||mode==='walk')return svg(defs+node(590,80,'20',true)+node(460,210,'15',true)+node(720,210,'7',true)+box(120,95,300,62,'返回给父亲：20+max(15,7)',true,20)+box(755,95,320,62,'更新答案：15+20+7',true,20)+tx(590,335,'单边贡献向上返回；左右两边只用于更新全局答案。',24,'#fbbf24'));if(mode==='edge')return svg(defs+node(590,140,'-3',true)+box(430,250,320,62,'答案初始化不能写 0',true))}if(k==='lruCache'){if(mode==='read'||mode==='io')return svg(defs+box(150,90,240,70,'get(key)')+box(470,90,240,70,'put(key,value)',true)+box(790,90,240,70,'满了淘汰最旧')+tx(590,280,'LRU 的核心不是存值，而是每次访问后更新“最近使用顺序”。',25,'#fbbf24'));if(mode==='sample')return svg(defs+box(150,90,170,62,'put 1')+box(365,90,170,62,'put 2')+box(580,90,170,62,'get 1',true)+box(795,90,170,62,'put 3')+box(455,230,270,62,'顺序：1 最新，2 最旧')+box(760,230,250,62,'淘汰 2',true));if(mode==='direct')return svg(defs+box(130,100,300,70,'用列表维护使用顺序',true)+box(520,100,260,70,'get 时线性查找')+box(820,100,210,70,'O(n) 慢'));if(mode==='pattern'||mode==='walk')return svg(defs+box(110,90,260,70,'cache: key -> node',true)+box(460,90,260,70,'双向链表改顺序')+box(810,90,230,70,'head 最近 / tail 最旧',true)+box(260,245,260,62,'remove(node)')+box(610,245,300,62,'add_to_front(node)',true));if(mode==='edge')return svg(defs+box(320,120,260,70,'get 不存在 -> -1',true)+box(650,120,260,70,'链表顺序不改变'))}return ''}`;
const CRITICAL_DIAGRAM_JS = `function criticalDiagram(s,mode){const k=s.kind,scene=s.scene||k;const svg=(body)=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+body+'</svg></div>';const tx=(x,y,t,size=24,color='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false,size=22)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.68)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,size);const defs='<defs><marker id="cr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const ar=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#cr)"/>';const cell=(x,y,t,hot=false,w=74,h=54)=>box(x,y,w,h,t,hot,20);const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="36" fill="'+(hot?'rgba(45,212,191,.26)':'rgba(2,8,23,.72)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,22);const arr=(vals,x,y,hot=[])=>vals.map((v,i)=>cell(x+i*96,y,v,hot.includes(i),72,54)).join('');if(k==='removeNthList'&&(mode==='pattern'||mode==='walk')){const walk=mode==='walk';const xs=[120,270,420,570,720,870];const vals=['dummy','1','2','3','4','5'];const nodes=vals.map((v,i)=>box(xs[i]-48,155,96,64,v,i===0||(walk&&i===3)||(walk&&i===4),22)).join('');const links=xs.slice(0,-1).map((x,i)=>ar(x+48,187,xs[i+1]-48,187)).join('');const slowX=walk?570:120;const fastX=walk?870:420;return svg(defs+links+nodes+tx(slowX,120,'slow',24,'#fbbf24')+tx(fastX,120,'fast',24,'#fbbf24')+'<path d="M'+slowX+' 132 L'+slowX+' 152" stroke="#fbbf24" stroke-width="5" marker-end="url(#cr)"/><path d="M'+fastX+' 132 L'+fastX+' 152" stroke="#fbbf24" stroke-width="5" marker-end="url(#cr)"/>'+box(235,270,260,62,walk?'slow 在待删前驱 3':'fast 先和 slow 拉开 n 步',true,22)+box(540,270,260,62,walk?'fast 到尾，准备改链':'fast / slow 一起向后走',false,22)+box(845,270,260,62,walk?'slow.next 跳过 4':'保持 n 个节点距离',true,22)+tx(590,370,walk?'删除倒数第 2 个：把 3 直接连到 5。':'关键是让 fast 和 slow 之间始终隔着 n 个节点。',24,'#fbbf24'))}if(k==='graphDAG'){if(mode==='edge')return svg(defs+node(470,140,'0',true)+node(650,140,'1',true)+ar(506,140,614,140)+ar(650,176,470,176)+box(390,270,300,62,'有回边，队列清不完',true));return svg(defs+node(290,120,'0',true)+node(470,120,'1')+node(650,120,'2')+node(830,120,'3')+ar(326,120,434,120)+ar(506,120,614,120)+ar(686,120,794,120)+box(210,245,230,62,'indegree[0]=0',true)+box(495,245,210,62,'queue=[0]')+box(760,245,260,62,'出队后删掉依赖边',true)+tx(590,360,'能学完 ⇔ 每门课最终都能被入度清零。',25,'#fbbf24'))}if(k==='weightedGraph'){return svg(defs+node(270,130,'a',true)+node(500,130,'b')+node(730,130,'c',true)+ar(306,130,464,130)+ar(536,130,694,130)+tx(385,95,'2.0',22,'#9eeaff')+tx(615,95,'3.0',22,'#9eeaff')+box(250,260,250,62,'query: a / c',true)+box(570,260,260,62,'沿路径累计乘积')+box(880,260,170,62,'2 × 3 = 6',true)+tx(590,365,'变量不存在或两个点不连通时，答案就是 -1.0。',24,'#fbbf24'))}if(k==='matrixSearch'){const vals=[1,4,7,11,2,5,8,12,3,6,9,16];const grid=vals.map((v,i)=>cell(270+(i%4)*88,70+Math.floor(i/4)*64,String(v),v===11||v===5,70,52)).join('');return svg(defs+grid+box(690,75,260,62,'从右上角开始',true)+box(690,165,260,62,'11 > 5：左移')+box(690,255,260,62,'5 命中 target',true)+tx(590,365,'右上角同时控制一行和一列：太大删列，太小删行。',24,'#fbbf24'))}if(k==='permuteTree'){return svg(defs+node(590,55,'[]',true)+node(390,160,'[1]')+node(590,160,'[2]')+node(790,160,'[3]')+ar(565,82,415,135)+ar(590,91,590,124)+ar(615,82,765,135)+node(310,285,'[1,2]')+node(470,285,'[1,3]')+ar(380,192,320,255)+ar(400,192,460,255)+box(735,260,260,62,'used 防止重复选',true)+tx(590,380,'每一层选一个还没用过的数，返回时撤销 used 和 path。',24,'#fbbf24'))}if(k==='subsetTree'){return svg(defs+node(590,55,'[]',true)+node(430,160,'选 1')+node(750,160,'不选 1')+ar(565,82,455,135)+ar(615,82,725,135)+node(340,285,'[1,2]')+node(520,285,'[1]')+node(700,285,'[2]')+node(880,285,'[]')+box(455,350,320,56,'start 只往后走，避免重复子集',true,21))}if(k==='targetSigns'){if(mode==='direct'||mode==='sample')return svg(defs+node(590,55,'0',true)+node(430,165,'+1')+node(750,165,'-1')+ar(565,82,455,135)+ar(615,82,725,135)+node(330,295,'+1+1')+node(510,295,'+1-1')+node(690,295,'-1+1')+node(870,295,'-1-1')+tx(590,375,'每个数都有 + / - 两条分支，暴力会形成二叉选择树。',24,'#fbbf24'));return svg(defs+box(170,95,260,62,'P - N = target',true)+box(490,95,240,62,'P + N = sum')+box(780,95,260,62,'P=(sum+target)/2',true)+arr(['0','1','2','3','4'],320,235,[0,4])+tx(590,350,'转成：从 nums 里选一些数凑出 P 的方案数。',24,'#fbbf24'))}if(k==='prefixSumK'){return svg(defs+arr(['1','1','1'],250,85,[0,1])+box(250,215,230,62,'prefix=2',true)+box(550,215,270,62,'查 prefix-k = 0')+box(870,215,220,62,'count[0]=1',true)+tx(590,345,'当前前缀和减去 k，等于某个旧前缀和，就找到一个连续子数组。',24,'#fbbf24'))}if(k==='anagramBuckets'){return svg(defs+box(120,95,160,58,'eat')+ar(280,124,390,124)+box(390,95,160,58,'aet',true)+ar(550,124,670,124)+box(670,75,260,58,'bucket[aet]',true)+box(670,155,260,58,'eat / tea / ate')+box(120,255,160,58,'tan')+ar(280,284,390,284)+box(390,255,160,58,'ant',true)+ar(550,284,670,284)+box(670,255,260,58,'tan / nat',true))}if(k==='freqBucket'){return svg(defs+box(120,90,190,58,'Counter')+ar(310,119,430,119)+box(430,90,210,58,'1:3, 2:2, 3:1',true)+ar(640,119,760,119)+box(760,90,240,58,'bucket[3]=[1]',true)+box(760,190,240,58,'从高频往低频取 k 个'))}return ''}`;
const REMOVE_NTH_FIX_DIAGRAM_JS = `function removeNthFixDiagram(s,mode){if(s.kind!=='removeNthList'||(mode!=='pattern'&&mode!=='walk'))return '';const svg=(body)=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+body+'</svg></div>';const tx=(x,y,t,size=24,color='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false,size=22)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.25)':'rgba(2,8,23,.68)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,size);const defs='<defs><marker id="rn" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker><marker id="rnY" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto"><path d="M0,0 L10,0 L5,9 Z" fill="#fbbf24"/></marker></defs>';const ar=(x1,y1,x2,y2,c='#38d5ff')=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+c+'" stroke-width="4" fill="none" marker-end="url(#rn)"/>';const walk=mode==='walk';const xs=[120,270,420,570,720,870];const vals=['dummy','1','2','3','4','5'];const nodes=vals.map((v,i)=>box(xs[i]-52,160,104,68,v,i===0||(walk&&i===3)||(walk&&i===4),24)).join('');const links=xs.slice(0,-1).map((x,i)=>ar(x+52,194,xs[i+1]-52,194)).join('');const slowX=walk?570:120;const fastX=walk?870:420;return svg(defs+links+nodes+tx(slowX,92,'slow',26,'#fbbf24')+tx(fastX,92,'fast',26,'#fbbf24')+'<path d="M'+slowX+' 110 L'+slowX+' 154" stroke="#fbbf24" stroke-width="5" fill="none" marker-end="url(#rnY)"/><path d="M'+fastX+' 110 L'+fastX+' 154" stroke="#fbbf24" stroke-width="5" fill="none" marker-end="url(#rnY)"/>'+box(205,280,290,62,walk?'slow 停在 3：待删前驱':'先让 fast 走 n 步',true,22)+box(520,280,300,62,walk?'fast 到尾，距离刚好对齐':'fast / slow 同步向后走',false,22)+box(850,280,260,62,walk?'3.next 跳过 4':'保持 n 个节点距离',true,22)+tx(590,382,walk?'删除倒数第 2 个：3 直接连到 5。':'fast 和 slow 始终隔着 n 个节点，fast 到尾时 slow 就在待删节点前。',24,'#fbbf24'))}`;
const QUALITY_DIAGRAM_JS = `function qualityDiagram(s,mode){return ''}`;
const CHAIN_QUALITY_DIAGRAM_JS = `function chainQualityDiagram(s,mode){const k=s.kind;const svg=(body)=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+body+'</svg></div>';const tx=(x,y,t,size=24,color='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.65)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,22);const defs='<defs><marker id="cq" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#cq)"/>';const link=(vals,x,y,hot=[])=>vals.map((v,i)=>box(x+i*118,y,86,58,v,hot.includes(i))+(i<vals.length-1?arrow(x+i*118+86,y+29,x+(i+1)*118,y+29):'')).join('');if(k==='addListDigits'){if(mode==='read'||mode==='io')return svg(defs+link(['2','4','3'],130,85,[])+link(['5','6','4'],130,185,[])+box(760,98,240,64,'低位在链表头',true)+box(760,190,240,64,'逐位相加返回链表'));if(mode==='pattern'||mode==='walk')return svg(defs+box(115,75,180,62,'dummy',true)+box(360,75,180,62,'cur')+box(605,75,180,62,'carry')+box(850,75,180,62,'l1 / l2')+box(260,230,300,68,'total=v1+v2+carry',true)+box(650,230,270,68,'digit=total%10'))}if(k==='mergeLists'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['1','2','4'],120,85,[])+link(['1','3','4'],120,185,[])+box(760,98,240,64,'比较两个头节点',true)+box(760,190,240,64,'小的接到结果尾部'));if(mode==='pattern'||mode==='walk')return svg(defs+box(105,82,180,60,'dummy',true)+box(340,82,180,60,'cur')+box(575,82,180,60,'list1')+box(810,82,180,60,'list2')+box(355,230,390,70,'cur.next 接较小节点',true))}if(k==='cycleList'){if(mode==='read'||mode==='sample'||mode==='io')return svg(defs+link(['3','2','0','-4'],160,125,[1])+arrow(548,154,280,154)+box(690,122,250,64,'尾节点指回旧节点',true));if(mode==='pattern'||mode==='walk')return svg(defs+link(['3','2','0','-4'],110,100,[1,3])+box(645,70,230,62,'slow 每次一步',true)+box(645,160,230,62,'fast 每次两步')+box(645,250,250,62,'相遇说明有环',true))}if(k==='removeNthList'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['1','2','3','4','5'],110,115,[3])+box(760,95,260,64,'n=2 删除节点 4',true)+box(760,185,260,64,'输出 1->2->3->5'));if(mode==='pattern'||mode==='walk')return svg(defs+link(['dummy','1','2','3','4','5'],55,110,[0,3,4])+box(775,72,270,62,'fast 先走 n 步',true)+box(775,170,270,62,'slow 停在待删前'))}if(k==='reverseList'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['1','2','3','4','5'],130,110,[])+arrow(580,139,700,139)+link(['5','4','3','2','1'],720,110,[]));if(mode==='pattern'||mode==='walk')return svg(defs+link(['prev','cur','next'],220,90,[0,1,2])+box(300,230,220,66,'cur.next -> prev',true)+arrow(420,148,260,148)+box(650,230,260,66,'prev=cur, cur=next'))}if(k==='palindromeList'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['1','2','2','1'],260,110,[0,3])+box(720,105,260,70,'正读反读相同',true));if(mode==='pattern'||mode==='walk')return svg(defs+box(130,85,230,66,'fast/slow 找中点')+box(430,85,260,66,'反转后半段',true)+box(760,85,250,66,'前后两段比较'))}if(k==='mergeSortList'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['4','2','1','3'],210,110,[])+arrow(640,139,750,139)+link(['1','2','3','4'],760,110,[]));if(mode==='pattern'||mode==='walk')return svg(defs+box(100,80,240,64,'fast/slow 切半',true)+box(420,80,220,64,'断链')+box(700,80,260,64,'递归排序')+box(455,230,250,64,'合并有序链',true))}if(k==='intersectionList'){if(mode==='read'||mode==='io'||mode==='sample')return svg(defs+link(['A:4','1'],80,80,[])+link(['B:5','6','1'],80,190,[])+link(['8','4','5'],650,135,[0])+box(475,300,330,58,'交点是同一个节点对象',true));if(mode==='pattern'||mode==='walk')return svg(defs+box(120,80,240,64,'pA 走 A 再走 B',true)+box(460,80,240,64,'pB 走 B 再走 A')+box(780,80,230,64,'路程补齐后相遇',true))}return ''}`;

function createApp(problem, slides) {
  const app = `const slides=${jsonScript(slides)};
const stage=document.getElementById('stage'),scene=document.getElementById('scene'),caption=document.getElementById('caption'),stepNow=document.getElementById('stepNow'),stepTotal=document.getElementById('stepTotal'),progressBar=document.getElementById('progressBar'),prevBtn=document.getElementById('prevBtn'),nextBtn=document.getElementById('nextBtn'),audioBtn=document.getElementById('audioBtn'),autoBtn=document.getElementById('autoBtn');let step=Math.max(0,Math.min(slides.length-1,Number(new URLSearchParams(location.search).get('step')||1)-1)),audioMode='manual',audioTimer=null;const audio=new Audio();stepTotal.textContent=String(slides.length).padStart(2,'0');
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function cards(items=[],two=false){return '<div class="cards '+(two?'two':'')+'">'+(items||[]).map((item,index)=>'<div class="card '+(index===0?'hot':'')+'"><b>'+esc(item.label)+'</b><p>'+esc(item.value)+'</p></div>').join('')+'</div>'}
function chips(items=[]){return '<div class="chips">'+(items||[]).map((item,index)=>'<div class="chip '+(index<2?'hot':'')+'">'+esc(item)+'</div>').join('')+'</div>'}
function metrics(items=[]){return '<div class="metrics">'+(items||[]).map(item=>'<div class="metric">'+esc(item.label)+'：'+esc(item.value)+'</div>').join('')+'</div>'}
function trace(items=[]){return '<div class="trace-list">'+(items||[]).map((item,index)=>'<div class="trace-item '+(index===0||index===items.length-1?'hot':'')+'">'+esc(String(item).replace(/^\\\\d+[.、]\\\\s*/,''))+'</div>').join('')+'</div>'}
function nodeRow(values,hot=[]){return '<div class="node-row">'+values.map((v,i)=>'<div class="cell '+(hot.includes(i)?'hot':'')+'">'+esc(v)+'</div>').join('<div class="arrow">→</div>')+'</div>'}
function smallGrid(values,hot=[],cols=3){return '<div class="grid-demo" style="grid-template-columns:repeat('+cols+',56px)">'+values.map((v,i)=>'<div class="grid-cell '+(hot.includes(i)?'land':'')+'">'+esc(v)+'</div>').join('')+'</div>'}
function algorithmDiagram(kind){if(kind==='tempStack')return '<div class="diagram"><div class="trace-list">'+nodeRow(['73','74','75','71','69','72','76','73'],[2,6])+'<div class="flow"><div class="flow-card">栈里放下标 2,3,4,5</div><div class="arrow">→</div><div class="flow-card hot">当前 76</div><div class="arrow">→</div><div class="flow-card hot">弹出并写等待天数</div></div></div></div>';if(kind==='decodeStack')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">3</div><div class="flow-card">[</div><div class="flow-card hot">a</div><div class="flow-card">]</div></div><div class="flow"><div class="flow-card">prev = ""</div><div class="flow-card hot">times = 3</div><div class="flow-card hot">cur = "aaa"</div></div></div></div>';if(kind==='anagramWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['c','b','a','e','b','a','b','a','c','d'],[0,1,2])+'<div class="flow"><div class="flow-card hot">窗口 cba</div><div class="arrow">→</div><div class="flow-card">计数等于 abc</div><div class="arrow">→</div><div class="flow-card hot">记录起点 0</div></div></div></div>';if(kind==='indexMark')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','3','2','7','8','2','3','1'],[3,2])+'<div class="flow"><div class="flow-card">看到 x</div><div class="arrow">→</div><div class="flow-card hot">把下标 x-1 标负</div><div class="arrow">→</div><div class="flow-card">最后正数位置是缺失值</div></div></div></div>';if(kind==='rotateBinary')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','5','6','7','0','1','2'],[3,6])+'<div class="flow"><div class="flow-card hot">mid = 7</div><div class="arrow">></div><div class="flow-card">right = 2</div><div class="arrow">→</div><div class="flow-card hot">最小值在右半</div></div></div></div>';if(kind==='parenBuild')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">""</div></div><div class="tree-row"><div class="node hot">(</div><div class="node dim">)</div></div><div class="tree-row"><div class="node hot">( )</div><div class="node">( (</div></div><div class="flow-card hot">left 不能超过 n，right 不能超过 left</div></div></div>';if(kind==='numberLine')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','3','4','100','200'],[0,1,2,3])+'<div class="flow"><div class="flow-card">只从没有前驱的 1 开始</div><div class="arrow">→</div><div class="flow-card hot">连续数到 4</div><div class="arrow">→</div><div class="flow-card hot">长度 4</div></div></div></div>';if(kind==='parenIndexStack')return '<div class="diagram"><div class="trace-list">'+nodeRow(['(',')','(',')',')'],[2,3])+'<div class="flow"><div class="flow-card hot">栈底 -1</div><div class="flow-card">左括号下标入栈</div><div class="flow-card hot">i - stack[-1] 算长度</div></div></div></div>';if(kind==='maximalRect')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','0','1','0','0','1','0','1','1','1','1','1','1','1','1'],[5,7,8,9,10,11,12,13,14],5)+'<div class="flow"><div class="flow-card">每一行变柱状图</div><div class="arrow">→</div><div class="flow-card hot">heights = [3,1,3,2,2]</div><div class="arrow">→</div><div class="flow-card hot">单调栈求矩形</div></div></div></div>';if(kind==='minStack')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">data: -2</div><div class="flow-card">0</div><div class="flow-card hot">-3</div></div><div class="flow"><div class="flow-card hot">min: -2</div><div class="flow-card hot">-3</div><div class="arrow">→</div><div class="flow-card hot">getMin = -3</div></div></div></div>';if(kind==='permutationPivot')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','4','3'],[1,3])+'<div class="flow"><div class="flow-card hot">pivot = 2</div><div class="arrow">→</div><div class="flow-card">右侧找 3</div><div class="arrow">→</div><div class="flow-card hot">交换并反转后缀</div></div></div></div>';if(kind==='queueTrace')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">[7,0]</div><div class="flow-card">[7,1]</div><div class="flow-card">[6,1]</div><div class="flow-card">[5,0]</div></div><div class="flow"><div class="flow-card">按身高降序</div><div class="arrow">→</div><div class="flow-card hot">按 k 插入位置</div><div class="arrow">→</div><div class="flow-card">前面高个数量正好等于 k</div></div></div></div>';if(kind==='xorCancel')return '<div class="diagram"><div class="trace-list">'+nodeRow(['4','1','2','1','2'],[0])+'<div class="flow"><div class="flow-card">1 xor 1 = 0</div><div class="flow-card">2 xor 2 = 0</div><div class="arrow">→</div><div class="flow-card hot">剩下 4</div></div></div></div>';if(kind==='dutchFlag')return '<div class="diagram"><div class="trace-list">'+nodeRow(['2','0','2','1','1','0'],[0,1,5])+'<div class="flow"><div class="flow-card hot">left 管 0 区</div><div class="flow-card">i 扫未知区</div><div class="flow-card hot">right 管 2 区</div></div></div></div>';if(kind==='taskFrame')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">A</div><div class="flow-card">_</div><div class="flow-card">_</div><div class="flow-card hot">A</div><div class="flow-card">_</div><div class="flow-card">_</div><div class="flow-card hot">A</div></div><div class="flow"><div class="flow-card">最高频任务先摆骨架</div><div class="arrow">→</div><div class="flow-card hot">空位填 B、C 或 idle</div></div></div></div>';if(kind==='freqBucket')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">1 出现 3 次</div><div class="flow-card">2 出现 2 次</div><div class="flow-card">3 出现 1 次</div></div><div class="flow"><div class="flow-card hot">bucket[3] = [1]</div><div class="flow-card">bucket[2] = [2]</div><div class="arrow">→</div><div class="flow-card hot">从高频往低频拿 k 个</div></div></div></div>';if(kind==='stockProfit')return '<div class="diagram"><div class="trace-list">'+nodeRow(['7','1','5','3','6','4'],[1,4])+'<div class="flow"><div class="flow-card hot">历史最低价 1</div><div class="arrow">→</div><div class="flow-card">今天卖出 6</div><div class="arrow">→</div><div class="flow-card hot">利润 5</div></div></div></div>';return ''}
function specialDiagram(kind){const extra=algorithmDiagram(kind);if(extra)return extra;if(kind==='matrixSearch')return '<div class="diagram"><div class="trace-list">'+smallGrid(['1','4','7','11','2','5','8','12','3','6','9','16'],[3,5],4)+'<div class="flow"><div class="flow-card hot">右上角 11</div><div class="arrow">←</div><div class="flow-card">太大左移</div><div class="arrow">↓</div><div class="flow-card hot">找到 5</div></div></div></div>';if(kind==='graphDAG')return '<div class="diagram"><svg viewBox="0 0 620 330" width="100%" height="330"><defs><marker id="gArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="110" cy="165" r="42"/><circle cx="280" cy="92" r="42"/><circle cx="280" cy="238" r="42"/><circle cx="460" cy="165" r="42"/></g><g fill="#eaf4ff" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="110" y="165">0</text><text x="280" y="92">1</text><text x="280" y="238">2</text><text x="460" y="165">3</text></g><g stroke="#38d5ff" stroke-width="3" fill="none" marker-end="url(#gArrow)"><path d="M148 150 L238 110"/><path d="M148 180 L238 222"/><path d="M322 102 L420 146"/><path d="M322 230 L420 182"/></g><text x="305" y="308" fill="#a9bfdc" font-size="22" text-anchor="middle">入度为 0 的课先进入队列，学完再解锁后续课程</text></svg></div>';if(kind==='weightedGraph')return '<div class="diagram"><svg viewBox="0 0 620 330" width="100%" height="330"><defs><marker id="wArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="130" cy="165" r="46"/><circle cx="310" cy="165" r="46"/><circle cx="490" cy="165" r="46"/></g><g fill="#eaf4ff" font-size="30" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="130" y="165">a</text><text x="310" y="165">b</text><text x="490" y="165">c</text></g><g stroke="#38d5ff" stroke-width="3" marker-end="url(#wArrow)" fill="none"><path d="M176 155 H260"/><path d="M356 155 H440"/></g><text x="220" y="132" fill="#fbbf24" font-size="22" text-anchor="middle">2.0</text><text x="400" y="132" fill="#fbbf24" font-size="22" text-anchor="middle">3.0</text><text x="310" y="270" fill="#a9bfdc" font-size="24" text-anchor="middle">a / c = 2.0 × 3.0 = 6.0</text></svg></div>';if(kind==='trieTrace')return '<div class="diagram"><div class="flow"><div class="flow-card hot">root</div><div class="arrow">→</div><div class="flow-card">a</div><div class="arrow">→</div><div class="flow-card">p</div><div class="arrow">→</div><div class="flow-card">p</div><div class="arrow">→</div><div class="flow-card">l</div><div class="arrow">→</div><div class="flow-card hot">e / isEnd</div></div></div>';if(kind==='catalanDP')return '<div class="diagram"><div class="trace-list"><div class="dp-demo">'+['dp[0]=1','dp[1]=1','dp[2]=2','dp[3]=5','dp[n]'].map((x,i)=>'<div class="dp-cell '+(i===3?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="flow"><div class="flow-card">选根 root</div><div class="arrow">→</div><div class="flow-card hot">左子树数 × 右子树数</div><div class="arrow">→</div><div class="flow-card hot">累加</div></div></div></div>';if(kind==='dequeWindow')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','3','-1','-3','5','3','6','7'],[1,2])+'<div class="flow"><div class="flow-card">窗口 k=3</div><div class="arrow">→</div><div class="flow-card hot">单调队列 [3,-1]</div><div class="arrow">→</div><div class="flow-card hot">最大值 3</div></div></div></div>';if(kind==='histogramStack')return '<div class="diagram"><svg viewBox="0 0 640 330" width="100%" height="330"><g fill="rgba(56,213,255,.18)" stroke="#38d5ff" stroke-width="2"><rect x="70" y="210" width="58" height="70"/><rect x="150" y="245" width="58" height="35"/><rect x="230" y="105" width="58" height="175"/><rect x="310" y="70" width="58" height="210"/><rect x="390" y="210" width="58" height="70"/><rect x="470" y="175" width="58" height="105"/></g><g fill="#eaf4ff" font-size="20" font-weight="900" text-anchor="middle"><text x="99" y="305">2</text><text x="179" y="305">1</text><text x="259" y="305">5</text><text x="339" y="305">6</text><text x="419" y="305">2</text><text x="499" y="305">3</text></g><rect x="230" y="70" width="138" height="210" fill="rgba(45,212,191,.18)" stroke="#2dd4bf" stroke-width="3"/><text x="320" y="45" fill="#fbbf24" font-size="24" text-anchor="middle">高度 5，宽度 2，面积 10</text></svg></div>';if(kind==='wordGrid')return '<div class="diagram"><div class="trace-list">'+smallGrid(['A','B','C','E','S','F','C','S','A','D','E','E'],[0,1,2,6,10,9],4)+'<div class="flow"><div class="flow-card hot">A</div><div class="arrow">→</div><div class="flow-card hot">B</div><div class="arrow">→</div><div class="flow-card hot">C C E D</div></div></div></div>';if(kind==='lruCache')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card hot">hash: key → node</div><div class="arrow">↔</div><div class="flow-card">双向链表</div></div><div class="flow"><div class="flow-card hot">head</div><div class="arrow">↔</div><div class="flow-card hot">key 1</div><div class="arrow">↔</div><div class="flow-card">key 2</div><div class="arrow">↔</div><div class="flow-card">tail</div></div></div></div>';if(kind==='dp2D')return '<div class="diagram"><div class="trace-list">'+smallGrid(['Ø','r','o','s','Ø','0','1','2','h','1','↖','←','o','2','↑','dp'],[5,10,15],4)+'<div class="flow"><div class="flow-card">左</div><div class="flow-card">上</div><div class="flow-card hot">左上</div><div class="arrow">→</div><div class="flow-card hot">当前格</div></div></div></div>';if(kind==='medianPartition')return '<div class="diagram"><div class="trace-list"><div class="flow"><div class="flow-card">A 左</div><div class="flow-card hot">|</div><div class="flow-card">A 右</div></div><div class="flow"><div class="flow-card">B 左</div><div class="flow-card hot">|</div><div class="flow-card">B 右</div></div><div class="flow-card hot">maxLeft ≤ minRight，切分合法就能算中位数</div></div></div>';if(kind==='functionalCycle')return '<div class="diagram"><svg viewBox="0 0 620 330" width="100%" height="330"><defs><marker id="fArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="110" cy="165" r="40"/><circle cx="250" cy="95" r="40"/><circle cx="390" cy="165" r="40"/><circle cx="250" cy="235" r="40"/></g><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="110" y="165">1</text><text x="250" y="95">3</text><text x="390" y="165">2</text><text x="250" y="235">4</text></g><g stroke="#38d5ff" stroke-width="3" fill="none" marker-end="url(#fArrow)"><path d="M146 148 L214 112"/><path d="M286 112 L354 148"/><path d="M354 182 L286 218"/><path d="M250 195 C224 160 224 130 250 135"/></g><text x="390" y="280" fill="#a9bfdc" font-size="24" text-anchor="middle">重复值让路径进入同一个环</text></svg></div>';if(kind==='bitTrace')return '<div class="diagram"><div class="trace-list">'+smallGrid(['0','0','1','x','1','0','0','y','1','0','1','xor'],[0,2,4,8,10],4)+'<div class="flow"><div class="flow-card hot">xor 中的 1</div><div class="arrow">→</div><div class="flow-card hot">不同位数量</div></div></div></div>';if(kind==='prefixSuffix')return '<div class="diagram"><div class="trace-list">'+nodeRow(['1','2','3','4'],[0,3])+'<div class="flow"><div class="flow-card hot">左侧乘积</div><div class="arrow">×</div><div class="flow-card hot">右侧乘积</div><div class="arrow">→</div><div class="flow-card">ans[i]</div></div></div></div>';return ''}
function diagram(kind){const special=specialDiagram(kind);if(special)return special;if(kind==='cycleList')return '<div class="diagram"><svg viewBox="0 0 760 330" width="100%" height="330" role="img" aria-label="head=[3,2,0,-4], pos=1，尾节点指回第二个节点"><defs><marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><text x="54" y="52" fill="#fbbf24" font-size="20" font-weight="900">head</text><text x="216" y="52" fill="#38d5ff" font-size="20" font-weight="900">pos = 1</text><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="88" cy="105" r="44"/><circle cx="248" cy="105" r="44"/><circle cx="408" cy="105" r="44"/><circle cx="568" cy="105" r="44"/></g><g fill="#eaf4ff" font-size="32" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="88" y="105">3</text><text x="248" y="105">2</text><text x="408" y="105">0</text><text x="568" y="105">-4</text></g><g stroke="#eaf4ff" stroke-width="2.5" marker-end="url(#arrowHead)" fill="none"><path d="M132 105 H198"/><path d="M292 105 H358"/><path d="M452 105 H518"/></g><path d="M568 150 C555 262 286 262 248 152" stroke="#eaf4ff" stroke-width="2.5" marker-end="url(#arrowHead)" fill="none"/><text x="382" y="276" fill="#a9bfdc" font-size="22" text-anchor="middle">尾节点 -4 的 next 指回节点 2，所以形成环</text></svg></div>';if(kind==='linkedList')return '<div class="diagram"><div class="trace-list"><div class="node-row"><div class="cell hot">l1</div><div class="arrow">→</div><div class="cell">2</div><div class="arrow">→</div><div class="cell">4</div><div class="arrow">→</div><div class="cell">3</div></div><div class="node-row"><div class="cell hot">l2</div><div class="arrow">→</div><div class="cell">5</div><div class="arrow">→</div><div class="cell">6</div><div class="arrow">→</div><div class="cell">4</div></div></div></div>';if(kind==='dpTable')return '<div class="diagram"><div class="dp-demo">'+['dp[0]','dp[1]','dp[2]','dp[i-1]','dp[i]'].map((x,i)=>'<div class="dp-cell '+(i>2?'hot':'')+'">'+x+'</div>').join('')+'</div></div>';if(kind==='treeTrace')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">root</div></div><div class="tree-row"><div class="node">left</div><div class="node">right</div></div><div class="tree-row"><div class="node hot">return</div></div></div></div>';if(kind==='choiceTree')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">path</div></div><div class="tree-row"><div class="node">选择A</div><div class="node hot">选择B</div><div class="node">选择C</div></div><div class="tree-row"><div class="node">撤销</div><div class="node hot">递归</div></div></div></div>';if(kind==='stackTrace')return '<div class="diagram"><div class="stack-row"><div class="stack-cell hot">(</div><div class="stack-cell">{</div><div class="stack-cell">[</div><div class="arrow">←</div><div class="stack-cell hot">当前右括号</div></div></div>';if(kind==='windowTrace')return '<div class="diagram">'+nodeRow(['left','a','b','c','right'],[0,4])+'</div>';if(kind==='pointerTrace')return '<div class="diagram">'+nodeRow(['i','left','...','right','ans'],[0,1,3])+'</div>';if(kind==='binaryTrace')return '<div class="diagram">'+nodeRow(['left','低区间','mid','高区间','right'],[0,2,4])+'</div>';if(kind==='matrixTrace')return '<div class="diagram"><div class="trace-list"><div class="grid-demo">'+['1','2','3','4','5','6','7','8','9'].map((x,i)=>'<div class="grid-cell '+(i===0||i===4||i===8?'land':'')+'">'+x+'</div>').join('')+'</div><div class="flow"><div class="flow-card hot">转置</div><div class="arrow">→</div><div class="flow-card hot">反转每行</div></div></div></div>';if(kind==='gridTrace')return '<div class="diagram"><div class="grid-demo">'+['1','1','0','0','0','1','1','0','1','0','0','0','1','1','0'].map((x,i)=>'<div class="grid-cell '+(x==='1'?'land':'')+'">'+x+'</div>').join('')+'</div></div>';if(kind==='hashTrace')return '<div class="diagram"><div class="flow"><div class="flow-card hot">当前值</div><div class="arrow">→</div><div class="flow-card">查询 key</div><div class="arrow">→</div><div class="flow-card hot">记录 value</div></div></div>';if(kind==='heapTrace')return '<div class="diagram"><div class="trace-list"><div class="tree-row"><div class="node hot">top</div></div><div class="tree-row"><div class="node">2</div><div class="node">3</div></div><div class="tree-row"><div class="node hot">pop / push</div></div></div></div>';if(kind==='greedyTrace')return '<div class="diagram">'+nodeRow(['当前最优','下一段','交换/选择','覆盖范围','答案'],[0,3])+'</div>';return '<div class="diagram">'+nodeRow(['输入','枚举','检查','更新','返回'],[0,3])+'</div>'}
function splitCode(lines,count){const size=Math.ceil(lines.length/count);return Array.from({length:count},(_,i)=>lines.slice(i*size,(i+1)*size))}
function renderCode(s){const nl=String.fromCharCode(10);const raw=String(s.code||'').split(nl);const lines=raw.filter((line,index)=>!(index<2&&line.trim().startsWith('#')));const maxLen=Math.max(0,...lines.map(line=>line.length));if(lines.length>54||maxLen>118){return '<div class="code-board cols3 micro">'+splitCode(lines,3).map(part=>'<pre>'+esc(part.join(nl))+'</pre>').join('')+'</div>'}if(lines.length>30||maxLen>88){return '<div class="code-board cols2 micro">'+splitCode(lines,2).map(part=>'<pre>'+esc(part.join(nl))+'</pre>').join('')+'</div>'}const cls=lines.length>23?'micro':lines.length>17?'tiny':'';return '<div class="code-board '+cls+'"><pre>'+esc(lines.join(nl))+'</pre></div>'}
function renderFocus(s){const lines=Array.isArray(s.codeLines)?s.codeLines:[];return '<div class="code-focus-board"><div class="code-focus"><div class="code-list">'+trace(s.items||[])+'</div><div class="code-list">'+lines.map((line,index)=>'<div class="code-line '+(index>1?'hot':'')+'">'+esc(line)+'</div>').join('')+'</div></div></div>'}
function compact(value,limit){const text=String(value||'');return text.length>limit?text.slice(0,limit)+'...':text}
function extractArray(value){const match=String(value||'').match(/\\[([^\\]]*)\\]/);if(!match)return[];return match[1].split(',').map(x=>x.trim()).filter(Boolean).slice(0,8)}
function labelRow(label,items,hot=[]){return '<div class="trace-list"><div class="flow-card hot">'+esc(label)+'</div>'+nodeRow(items.length?items:['empty'],hot)+'</div>'}
function stepFlow(items=[]){const list=(items||[]).slice(0,4);return '<div class="diagram relation-diagram"><div class="relation-flow">'+list.map((item,index)=>'<div class="relation-card '+(index===0||index===list.length-1?'hot':'')+'"><b>'+esc('Step '+(index+1))+'</b><span>'+esc(compact(String(item).replace(/^\\\\d+[.、]\\\\s*/,''),68))+'</span></div>'+((index<list.length-1)?'<div class="relation-arrow">→</div>':'')).join('')+'</div></div>'}
function arrayTeachingDiagram(s){const list=s.cards||[];const input=extractArray(list[0]?.value);const output=extractArray(list[1]?.value);if(!input.length&&!output.length)return '';return '<div class="diagram"><div class="trace-list">'+(input.length?labelRow('input',input,[0]):'')+(output.length?labelRow('output',output,output.map((_,i)=>i)):'')+(list[2]?'<div class="flow-card hot">'+esc(compact(list[2].label+': '+list[2].value,86))+'</div>':'')+'</div></div>'}
function prefixSuffixTeaching(){const hot=2;const row=(label,items)=>'<div class="prefix-row"><div class="cell '+(label==='ans'?'hot':'')+'">'+label+'</div>'+items.map((x,i)=>'<div class="cell '+(i===hot?'hot':'')+'">'+x+'</div>').join('')+'</div>';return '<div class="diagram"><div class="prefix-table">'+row('index',['0','1','2','3'])+row('nums',['1','2','3','4'])+row('prefix',['1','1','2','6'])+row('suffix',['24','12','4','1'])+row('ans',['24','12','8','6'])+'<div class="prefix-note">看第 2 列：prefix[2]=2，suffix[2]=4，所以 ans[2]=2×4=8。</div></div></div>'}
function courseTeaching(){return '<div class="diagram"><svg viewBox="0 0 760 360" width="100%" height="360" role="img" aria-label="numCourses=2 prerequisites=[[1,0]]"><defs><marker id="courseArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="250" cy="170" r="48"/><circle cx="510" cy="170" r="48"/></g><g fill="#eaf4ff" font-size="34" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="250" y="170">0</text><text x="510" y="170">1</text></g><path d="M300 170 H452" stroke="#38d5ff" stroke-width="4" marker-end="url(#courseArrow)" fill="none"/><text x="380" y="126" fill="#9eeaff" font-size="24" font-weight="900" text-anchor="middle">先学 0</text><text x="380" y="244" fill="#a9bfdc" font-size="24" text-anchor="middle">prerequisites=[[1,0]] 表示学 1 前必须完成 0</text></svg></div>'}
function serializeTeaching(){return '<div class="diagram"><svg viewBox="0 0 760 360" width="100%" height="360" role="img" aria-label="tree to string and back"><defs><marker id="serArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="95" cy="86" r="34"/><circle cx="55" cy="170" r="34"/><circle cx="150" cy="170" r="34"/><circle cx="120" cy="250" r="30"/><circle cx="205" cy="250" r="30"/></g><g stroke="#38d5ff" stroke-width="3" fill="none"><path d="M82 118 L66 138"/><path d="M108 118 L138 140"/><path d="M142 202 L128 224"/><path d="M162 202 L193 224"/></g><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="95" y="86">1</text><text x="55" y="170">2</text><text x="150" y="170">3</text><text x="120" y="250">4</text><text x="205" y="250">5</text></g><path d="M250 178 H334" stroke="#38d5ff" stroke-width="4" marker-end="url(#serArrow)"/><rect x="350" y="118" width="190" height="108" fill="rgba(45,212,191,.16)" stroke="#2dd4bf" stroke-width="2"/><text x="445" y="155" fill="#9eeaff" font-size="22" font-weight="900" text-anchor="middle">serialize</text><text x="445" y="190" fill="#eaf4ff" font-size="20" font-weight="900" text-anchor="middle">1,2,#,#,3,4,#,#,5</text><path d="M560 178 H638" stroke="#38d5ff" stroke-width="4" marker-end="url(#serArrow)"/><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="690" cy="86" r="34"/><circle cx="650" cy="170" r="34"/><circle cx="725" cy="170" r="34"/></g><g stroke="#38d5ff" stroke-width="3" fill="none"><path d="M677 118 L662 140"/><path d="M703 118 L716 140"/></g><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="690" y="86">1</text><text x="650" y="170">2</text><text x="725" y="170">3</text></g><text x="380" y="318" fill="#a9bfdc" font-size="24" text-anchor="middle">空节点也写入，才能按同样顺序还原结构</text></svg></div>'}
function benchmarkDiagramV4(s){const sc=s.scene||'';if(sc==='two-sum-sample')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">样例：2 和 7 正好凑成 target 9</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2" font-size="26" font-weight="900" text-anchor="middle" dominant-baseline="middle"><rect x="210" y="120" width="110" height="72"/><rect x="350" y="120" width="110" height="72"/><rect x="490" y="120" width="110" height="72"/><rect x="630" y="120" width="110" height="72"/></g><g fill="rgba(45,212,191,.25)" stroke="#2dd4bf" stroke-width="4"><rect x="210" y="120" width="110" height="72"/><rect x="350" y="120" width="110" height="72"/></g><g fill="#eaf4ff" font-size="26" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="265" y="156">0:2</text><text x="405" y="156">1:7</text><text x="545" y="156">2:11</text><text x="685" y="156">3:15</text></g><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="270" y="255" width="210" height="70" rx="8"/><rect x="530" y="255" width="210" height="70" rx="8"/><rect x="790" y="255" width="210" height="70" rx="8"/></g><g fill="#eaf4ff" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="375" y="290">2 + 7 = 9</text><text x="635" y="290">target = 9</text><text x="895" y="290">返回 [0,1]</text></g></svg></div>';if(sc==='two-sum-brute')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">暴力：固定一个数，再逐个试后面的数</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><rect x="145" y="115" width="98" height="68"/><rect x="285" y="115" width="98" height="68"/><rect x="425" y="115" width="98" height="68"/><rect x="565" y="115" width="98" height="68"/></g><rect x="145" y="115" width="98" height="68" fill="rgba(45,212,191,.28)" stroke="#2dd4bf" stroke-width="4"/><rect x="285" y="115" width="98" height="68" fill="rgba(251,191,36,.20)" stroke="#fbbf24" stroke-width="4"/><g fill="#eaf4ff" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="194" y="149">i:2</text><text x="334" y="149">j:7</text><text x="474" y="149">11</text><text x="614" y="149">15</text></g><g stroke="#38d5ff" stroke-width="4" fill="none"><path d="M245 149 H282"/><path d="M245 149 C330 235 455 235 520 184"/><path d="M245 149 C370 285 575 285 642 184"/></g><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="760" y="90" width="270" height="70" rx="8"/><rect x="760" y="190" width="270" height="70" rx="8"/><rect x="760" y="290" width="270" height="70" rx="8"/></g><g fill="#eaf4ff" font-size="24" font-weight="900"><text x="790" y="132">先试 2+7，命中</text><text x="790" y="232">没命中就继续试</text><text x="790" y="332">最坏会试很多对</text></g></svg></div>';if(sc==='two-sum-bottleneck')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">瓶颈：每换一个 i，都要重新找另一个数</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><rect x="150" y="105" width="96" height="60"/><rect x="270" y="105" width="96" height="60"/><rect x="390" y="105" width="96" height="60"/><rect x="510" y="105" width="96" height="60"/><rect x="150" y="230" width="96" height="60"/><rect x="270" y="230" width="96" height="60"/><rect x="390" y="230" width="96" height="60"/><rect x="510" y="230" width="96" height="60"/></g><rect x="150" y="105" width="96" height="60" fill="rgba(45,212,191,.25)" stroke="#2dd4bf" stroke-width="4"/><rect x="270" y="105" width="96" height="60" fill="rgba(251,191,36,.18)" stroke="#fbbf24" stroke-width="4"/><rect x="270" y="230" width="96" height="60" fill="rgba(45,212,191,.25)" stroke="#2dd4bf" stroke-width="4"/><rect x="150" y="230" width="96" height="60" fill="rgba(248,113,113,.16)" stroke="#f87171" stroke-width="4"/><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="198" y="135">2</text><text x="318" y="135">7</text><text x="438" y="135">11</text><text x="558" y="135">15</text><text x="198" y="260">2</text><text x="318" y="260">7</text><text x="438" y="260">11</text><text x="558" y="260">15</text></g><g fill="#fbbf24" font-size="25" font-weight="1000"><text x="690" y="137">i=0：找 7，扫后面</text><text x="690" y="262">i=1：又要重新找 2</text><text x="690" y="332">重复扫描太多，所以要记住过去</text></g></svg></div>';if(sc==='two-sum-hash')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">哈希表：先查 need，再记录当前数</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="105" y="110" width="185" height="74" rx="8"/><rect x="370" y="110" width="185" height="74" rx="8"/><rect x="635" y="110" width="185" height="74" rx="8"/><rect x="885" y="110" width="185" height="74" rx="8"/><rect x="305" y="270" width="360" height="78" rx="8"/><rect x="740" y="270" width="280" height="78" rx="8"/></g><rect x="105" y="110" width="185" height="74" fill="rgba(45,212,191,.22)" stroke="#2dd4bf" stroke-width="4"/><rect x="370" y="110" width="185" height="74" fill="rgba(45,212,191,.22)" stroke="#2dd4bf" stroke-width="4"/><g fill="#eaf4ff" font-size="24" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="197" y="147">x=2，need=7</text><text x="462" y="147">x=7，need=2</text><text x="727" y="147">先查 seen</text><text x="977" y="147">再写当前</text><text x="485" y="309">seen = { 2:0 }</text><text x="880" y="309">命中 seen[2]</text></g><path d="M290 147 H370" stroke="#38d5ff" stroke-width="4"/><path d="M555 147 H635" stroke="#38d5ff" stroke-width="4"/><path d="M820 147 H885" stroke="#38d5ff" stroke-width="4"/><text x="590" y="392" fill="#fbbf24" font-size="26" font-weight="1000" text-anchor="middle">时间从 O(n²) 降到 O(n)，因为“找另一个数”变成一次哈希查询</text></svg></div>';if(sc==='two-sum-walk')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">逐步推演：第二步命中答案</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><rect x="125" y="115" width="112" height="68"/><rect x="260" y="115" width="112" height="68"/><rect x="395" y="115" width="112" height="68"/><rect x="530" y="115" width="112" height="68"/></g><rect x="125" y="115" width="112" height="68" fill="rgba(45,212,191,.24)" stroke="#2dd4bf" stroke-width="4"/><rect x="260" y="115" width="112" height="68" fill="rgba(45,212,191,.30)" stroke="#2dd4bf" stroke-width="4"/><g fill="#eaf4ff" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="181" y="149">0:2</text><text x="316" y="149">1:7</text><text x="451" y="149">2:11</text><text x="586" y="149">3:15</text></g><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="745" y="90" width="300" height="78" rx="8"/><rect x="745" y="205" width="300" height="96" rx="8"/></g><g fill="#eaf4ff" font-size="23" font-weight="900"><text x="775" y="123">i=0，x=2，需要 7</text><text x="775" y="151">未命中，记录 2 的下标 0</text><text x="775" y="240">i=1，x=7，需要 2</text><text x="775" y="268">命中，返回 [0,1]</text></g><text x="455" y="285" fill="#fbbf24" font-size="29" font-weight="1000" text-anchor="middle">seen = { 2 : 0 }</text></svg></div>';if(sc==='two-sum-edge')return '<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img"><text x="590" y="46" fill="#9eeaff" font-size="27" font-weight="1000" text-anchor="middle">边界：两个相同数字，也不能用同一个位置两次</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle"><rect x="260" y="130" width="135" height="82"/><rect x="455" y="130" width="135" height="82"/></g><rect x="260" y="130" width="135" height="82" fill="rgba(45,212,191,.22)" stroke="#2dd4bf" stroke-width="4"/><rect x="455" y="130" width="135" height="82" fill="rgba(45,212,191,.30)" stroke="#2dd4bf" stroke-width="4"/><g fill="#eaf4ff" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="327" y="171">0:3</text><text x="522" y="171">1:3</text></g><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="700" y="100" width="300" height="80" rx="8"/><rect x="700" y="220" width="300" height="80" rx="8"/></g><g fill="#eaf4ff" font-size="24" font-weight="900"><text x="730" y="145">先记录第一个 3</text><text x="730" y="265">第二个 3 才能命中</text></g><text x="590" y="360" fill="#fbbf24" font-size="27" font-weight="1000" text-anchor="middle">先查再写，就不会让 nums[i] 和自己配对</text></svg></div>';return ''}
function benchmarkDiagramV5(s){const sc=s.scene||'';const panel=(title,inner)=>'<div class="diagram"><div class="trace-list"><div class="flow-card hot">'+esc(title)+'</div>'+inner+'</div></div>';const row=(items,hot=[])=>nodeRow(items,hot);const flow=(items,hot=[])=>'<div class="flow">'+items.map((x,i)=>'<div class="flow-card '+(hot.includes(i)?'hot':'')+'">'+esc(x)+'</div>'+((i<items.length-1)?'<div class="arrow">→</div>':'')).join('')+'</div>';const two=(a,b)=>'<div class="flow"><div class="flow-card hot">'+esc(a)+'</div><div class="arrow">→</div><div class="flow-card">'+esc(b)+'</div></div>';if(sc==='cycle-entry-read')return panel('目标：返回环的入口节点',row(['head','3','2','0','-4','回到 2'],[0,2,5]));if(sc==='cycle-entry-sample')return panel('样例：尾节点指回 2',row(['3','2','0','-4','next=2'],[1,4])+two('输入有环','输出节点 2'));if(sc==='cycle-entry-set')return panel('哈希集合：第一次重复就是入口',flow(['访问 3','访问 2','访问 0','访问 -4','再次遇到 2'],[1,4]));if(sc==='cycle-entry-bottleneck')return panel('集合能做对，但空间是 O(n)',flow(['每个节点入 seen','节点越多表越大','改用快慢指针'],[0,2]));if(sc==='cycle-entry-meet')return panel('第一阶段：slow 和 fast 在环内相遇',flow(['slow 一步','fast 两步','环内相遇 meet'],[2]));if(sc==='cycle-entry-walk')return panel('第二阶段：head 和 meet 同步走',flow(['p=head','q=meet','一起一步一步走','相遇在入口'],[0,3]));if(sc==='cycle-entry-edge')return panel('无环：fast 走到 null',flow(['fast','fast.next','null','返回 null'],[2,3]));
if(sc==='product-read')return panel('目标：每格都不乘自己',row(['nums[i]','左边乘积','右边乘积','ans[i]'],[0,3]));if(sc==='product-sample')return panel('i=2：当前 3 不参与',flow(['左边 1×2=2','跳过 3','右边 4','ans[2]=8'],[0,3]));if(sc==='product-direct')return panel('直接法：每个位置重新扫一遍',flow(['固定 i','扫描所有 j!=i','乘出 ans[i]','换下一个 i'],[0,3]));if(sc==='product-bottleneck')return panel('瓶颈：左右乘积反复算',flow(['ans[1] 用右边 3×4','ans[2] 又用左边 1×2','大量重叠','需要复用'],[2,3]));if(sc==='product-prefix')return panel('优化：先左积，再右积',flow(['第一遍写左积','ans=[1,1,2,6]','第二遍乘 suffix','得到 [24,12,8,6]'],[1,3]));if(sc==='product-walk')return panel('逐格算：看 i=2',flow(['prefix[2]=2','suffix=4','ans[2]=2×4','结果 8'],[0,3]));if(sc==='product-edge')return panel('有 0 也不用除法',flow(['nums=[1,0,3,4]','0 的位置可非零','两个 0 全为 0','prefix/suffix 仍成立'],[1,3]));
if(sc==='islands-read')return panel('目标：数连通的陆地块',smallGrid(['1','1','0','0','1','1','0','0','0','0','1','0'],[0,1,4,5,10],4));if(sc==='islands-sample')return panel('样例：两座岛',smallGrid(['1','1','0','0','1','1','0','0','0','0','1','0'],[0,1,4,5,10],4)+flow(['左上是一座','右下是一座','答案 2'],[0,1,2]));if(sc==='islands-direct')return panel('扫描：遇到新 1 才计数',flow(['从左上扫描','遇到未访问 1','ans + 1','启动 DFS'],[1,2]));if(sc==='islands-bottleneck')return panel('瓶颈：同一座岛会被重复数',smallGrid(['1','1','0','0','1','1','0','0','0'],[0,1,3,4],3)+two('只看到 1 就加一','会把同一岛数多次'));if(sc==='islands-dfs')return panel('DFS：把整座岛标记掉',flow(['进入 1','标记 visited','扩散四方向','水/越界停止'],[1,3]));if(sc==='islands-walk')return panel('推演：第一座标完再找下一座',flow(['ans=1','标掉左上四格','继续扫描','ans=2'],[0,3]));if(sc==='islands-edge')return panel('边界：全水、单陆地、越界',flow(['全 0 -> 0','一个 1 -> 1','越界直接返回'],[0,1,2]));
if(sc==='bst-count-read')return panel('目标：数 BST 结构，不是遍历节点',flow(['n 个连续数字','选择 root','左边进左子树','右边进右子树'],[1]));if(sc==='bst-count-sample')return panel('n=3：root 分别选 1、2、3',flow(['root=1 得 2','root=2 得 1','root=3 得 2','总数 5'],[0,1,2,3]));if(sc==='bst-count-direct')return panel('递归：枚举每个 root',flow(['选 root','递归左规模','递归右规模','左右方案相乘'],[0,3]));if(sc==='bst-count-bottleneck')return panel('瓶颈：同规模重复算',flow(['1..2 有 2 种','4..5 也有 2 种','只和节点数有关','用 dp 记'],[2,3]));if(sc==='bst-count-dp')return panel('dp[i]：i 个节点能组成几棵 BST',flow(['dp[0]=1','枚举 root','dp[left]×dp[right]','累加到 dp[i]'],[0,3]));if(sc==='bst-count-walk')return panel('填 dp[3]',flow(['dp[0]×dp[2]=2','dp[1]×dp[1]=1','dp[2]×dp[0]=2','dp[3]=5'],[3]));if(sc==='bst-count-edge')return panel('空树也算一种方案',flow(['左边为空','dp[0]=1','右边为空','乘法才能成立'],[1]));
if(sc==='window-max-read')return panel('目标：每个窗口输出最大值',row(['1','3','-1','-3','5','3','6','7'],[0,1,2]));if(sc==='window-max-sample')return panel('样例：窗口 k=3',flow(['[1,3,-1] -> 3','[3,-1,-3] -> 3','[-1,-3,5] -> 5','输出继续'],[0,2]));if(sc==='window-max-direct')return panel('直接法：每个窗口扫 k 个数',flow(['固定窗口','扫描 k 个元素','找最大值','窗口右移重扫'],[0,3]));if(sc==='window-max-bottleneck')return panel('瓶颈：小值留着也没用',flow(['新值进入','队尾小值出队','过期下标出队','队首就是最大'],[1,3]));if(sc==='window-max-deque')return panel('单调队列保存下标',flow(['值递减','下标可判过期','队首最大','每步 O(1) 均摊'],[0,2]));if(sc==='window-max-walk')return panel('推演：处理到下标 2',row(['1','3','-1','-3','5'],[0,1,2])+two('deque=[1,2]','队首 nums[1]=3'));if(sc==='window-max-edge')return panel('边界：k=1 和重复值',flow(['k=1 输出原数组','重复值保留下标','用下标判断过期'],[0,2]));
if(sc==='word-search-read')return panel('目标：相邻格连成 word',smallGrid(['A','B','C','E','S','F','C','S','A','D','E','E'],[0,1,2,6,10,9],4));if(sc==='word-search-sample')return panel('样例路径 ABCCED',smallGrid(['A','B','C','E','S','F','C','S','A','D','E','E'],[0,1,2,6,10,9],4));if(sc==='word-search-direct')return panel('直接法：每个首字母都试 DFS',flow(['找 A','匹配当前字符','试四方向','直到 word 结束'],[0,3]));if(sc==='word-search-bottleneck')return panel('瓶颈：不能重复用格子',flow(['进入格子','标记 visited','避免走回头路','失败要恢复'],[1,3]));if(sc==='word-search-backtrack')return panel('回溯三步：选择、递归、撤销',flow(['选择当前格','递归四方向','失败返回','恢复现场'],[0,3]));if(sc==='word-search-walk')return panel('推演：走错就撤销换方向',flow(['A 命中','找 B','找 C','错路撤销','继续试'],[0,3,4]));if(sc==='word-search-edge')return panel('边界：单格、越界、重复访问',flow(['单格 a -> true','越界 false','重复访问 false'],[0,1,2]));
if(sc==='edit-distance-read')return panel('目标：最少编辑操作数',flow(['插入','删除','替换','把 word1 变 word2'],[3]));if(sc==='edit-distance-sample')return panel('horse 到 ros：输出 3',flow(['horse','rorse','rose','ros'],[0,3]));if(sc==='edit-distance-direct')return panel('递归：末尾不同试三种操作',flow(['插入','删除','替换','取最小 + 1'],[3]));if(sc==='edit-distance-bottleneck')return panel('瓶颈：同一前缀反复算',flow(['word1 前 i 个','word2 前 j 个','重复子问题','用 dp 记住'],[2,3]));if(sc==='edit-distance-dp')return panel('dp[i][j] 的含义',flow(['word1 前 i 个','变成','word2 前 j 个','最少操作数'],[0,2,3]));if(sc==='edit-distance-walk')return panel('当前格看三个邻居',smallGrid(['左上','上','-','左','当前','-','-','-','-'],[0,1,3,4],3)+flow(['相同看左上','不同取三者最小+1'],[0,1]));if(sc==='edit-distance-edge')return panel('初始化：空串只能插入或删除',flow(['dp[0][j]=j','dp[i][0]=i','第一行第一列先填'],[0,1]));if(sc==='review-choice')return panel('最后取舍：推荐写法 + 代码检查',flow(['推荐写法','复杂度','代码缩进','边界复盘'],[0,3]));return ''}
function benchmarkDiagramV6(s){const sc=s.scene||'',slug=s.slug||'';const svg=b=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+b+'</svg></div>';const tx=(x,y,t,sz=24,c='#eaf4ff',a='middle')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+sz+'" font-weight="900" text-anchor="'+a+'" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.62)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,24);const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' H'+x2+'" stroke="#38d5ff" stroke-width="4" marker-end="url(#a)"/>';const defs='<defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arr=(vals,hot=[])=>vals.map((v,i)=>box(170+i*135,115,96,68,v,hot.includes(i))+(i<vals.length-1?arrow(266+i*135,149,303+i*135,149):'')).join('');const grid=(vals,cols,hot=[],x=230,y=90,size=58)=>vals.map((v,i)=>{const cx=x+(i%cols)*size,cy=y+Math.floor(i/cols)*size;return '<rect x="'+cx+'" y="'+cy+'" width="'+(size-8)+'" height="'+(size-8)+'" fill="'+(hot.includes(i)?'rgba(45,212,191,.28)':'rgba(2,8,23,.68)')+'" stroke="'+(hot.includes(i)?'#2dd4bf':'#38d5ff')+'" stroke-width="2"/>'+tx(cx+(size-8)/2,cy+(size-8)/2,v,20)}).join('');const table=(rows,hotRow=-1,hotCol=-1)=>{let out='';rows.forEach((r,ri)=>r.forEach((v,ci)=>{const hot=ri===hotRow||ci===hotCol;out+=box(260+ci*118,70+ri*58,104,46,v,hot)}));return out};const ring=(meet=false,walk=false)=>defs+'<path d="M260 210 H410 H560 H710" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#a)"/><path d="M710 240 C705 355 430 355 410 240" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#a)"/>'+box(210,176,90,68,'3')+box(380,176,90,68,'2',walk)+box(550,176,90,68,'0',meet)+box(700,176,90,68,'-4')+tx(255,130,'head',18,'#fbbf24')+(meet?tx(595,130,'slow / fast meet',18,'#fbbf24'):'')+(walk?tx(425,130,'入口：p 和 q 相遇',18,'#fbbf24'):'');if(sc==='two-sum-read')return svg(defs+arr(['0:2','1:7','2:11','3:15'],[])+box(780,95,210,80,'target = 9',true)+box(760,220,250,82,'返回两个不同下标')+tx(590,365,'同一个元素不能用两次；答案要返回下标，不是返回数值',25,'#fbbf24'));if(sc==='cycle-entry-meet')return svg(ring(true,false)+tx(590,360,'fast 每次两步，slow 每次一步；有环时一定会在环内追上',25,'#9eeaff'));if(sc==='cycle-entry-walk')return svg(ring(false,true)+tx(590,360,'一个指针回到 head，另一个留在 meet，同速前进，第一次相遇就是入口',25,'#9eeaff'));if(sc==='product-direct'||sc==='product-prefix'||sc==='product-walk')return svg(table([['index','0','1','2','3'],['nums','1','2','3','4'],['prefix','1','1','2','6'],['suffix','24','12','4','1'],['ans','24','12','8','6']],sc==='product-walk'?4:2,sc==='product-walk'?3:2)+tx(590,385,sc==='product-direct'?'每个位置 = 左边所有数乘积 × 右边所有数乘积':'以 i=2 为例：左边 1×2=2，右边只有 4，所以 ans[2]=8',25,'#fbbf24'));if(sc==='islands-direct'||sc==='islands-dfs'||sc==='islands-walk')return svg(grid(['1','1','0','0','1','1','0','0','0'],3,[0,1,3,4],260,80,70)+arrow(520,185,650,185)+grid(['0','0','0','0','0','0','0','0','1'],3,[8],700,80,70)+tx(590,350,sc==='islands-direct'?'扫描到一块新陆地，马上把整座连通岛标记掉':'DFS 只向上下左右扩散；标记后，后面扫描不会重复计数',25,'#fbbf24'));if(sc==='bst-count-sample'||sc==='bst-count-dp'||sc==='bst-count-walk')return svg(defs+tx(590,42,'n=3：按 root 拆成左规模 × 右规模',25,'#9eeaff')+box(110,95,130,58,'root=1',true)+box(265,95,130,58,'左空')+box(420,95,130,58,'右 2 节点')+tx(330,190,'1 × 2 = 2',25,'#fbbf24')+box(110,240,130,58,'root=2',true)+box(265,240,130,58,'左 1 节点')+box(420,240,130,58,'右 1 节点')+tx(330,335,'1 × 1 = 1',25,'#fbbf24')+box(650,95,130,58,'root=3',true)+box(805,95,130,58,'左 2 节点')+box(960,95,130,58,'右空')+tx(875,190,'2 × 1 = 2',25,'#fbbf24')+box(760,270,240,70,'dp[3]=2+1+2=5',true));if(sc==='window-max-bottleneck')return svg(defs+arr(['1','3','-1','-3','5'],[0,1,2])+box(230,245,250,68,'窗口 1：扫描 1,3,-1')+box(520,245,250,68,'窗口 2：又扫描 3,-1,-3',true)+box(810,245,230,68,'重叠元素被反复比较')+tx(590,370,'瓶颈不是窗口不会滑，而是每个窗口都重新找最大值',25,'#fbbf24'));if(sc==='window-max-deque'||sc==='window-max-walk')return svg(defs+arr(['0:1','1:3','2:-1','3:-3','4:5'],[1,4])+box(250,250,150,70,'deque: [1]',true)+box(440,250,150,70,'队首最大')+box(630,250,190,70,'新值 5 进来')+box(850,250,190,70,'弹掉队尾小值',true)+tx(590,370,'队列存下标，并保持对应值从大到小；队首就是当前窗口最大值',25,'#fbbf24'));if(sc==='word-search-read')return svg(grid(['A','B','C','E','S','F','C','S','A','D','E','E'],4,[],260,70,68)+box(760,110,250,70,'word = ABCCED',true)+box(760,220,250,70,'上下左右走')+box(760,330,250,70,'同一格不能重复用'));if(sc==='word-search-sample'||sc==='word-search-backtrack'||sc==='word-search-walk')return svg(grid(['A','B','C','E','S','F','C','S','A','D','E','E'],4,[0,1,2,6,10,9],260,70,68)+box(760,125,260,72,'A → B → C → C → E → D',true)+box(760,245,260,72,'走错就撤销 visited')+tx(590,380,'路径必须连续相邻；回溯负责选择、递归、撤销',25,'#fbbf24'));if(sc==='edit-distance-direct')return svg(defs+box(145,72,220,68,'horse → ros',true)+box(75,190,170,68,'插入')+box(285,190,170,68,'删除')+box(495,190,170,68,'替换')+arrow(255,106,580,106)+box(730,72,260,68,'同一前缀反复出现')+box(730,205,260,68,'改用 dp 记住状态',true)+tx(590,360,'暴力递归会把同一对前缀算很多次，所以转成二维 dp',25,'#fbbf24'));if(sc==='edit-distance-dp'||sc==='edit-distance-walk')return svg(table([['','r','o','s'],['h','1','2','3'],['o','2','1','2'],['r','2','2','2'],['s','3','3','2']],sc==='edit-distance-walk'?3:1,sc==='edit-distance-walk'?2:0)+box(760,105,260,72,'dp[i][j]：前 i 个变前 j 个',true)+box(760,215,260,72,'看左、上、左上')+box(760,315,260,72,'不同字符取最小 + 1') );if(sc==='review-choice'){const m={ 'two-sum':['哈希表','先查 need，再写 x'], 'linked-list-cycle-ii':['快慢指针','相遇后同步找入口'], 'product-of-array-except-self':['前后缀乘积','当前位置不能乘自己'], 'number-of-islands':['DFS 标记','一座岛只数一次'], 'unique-binary-search-trees':['Catalan DP','按 root 拆左右规模'], 'sliding-window-maximum':['单调队列','队首保存最大值'], 'word-search':['回溯','选择、递归、撤销'], 'edit-distance':['二维 DP','当前格看三个邻居'] }[slug]||['推荐写法','复盘边界'];return svg(box(250,115,260,84,m[0],true)+box(620,115,320,84,m[1])+box(250,250,260,84,'检查代码缩进')+box(620,250,320,84,'边界再过一遍',true)+tx(590,385,'最后只保留可提交的 Python 写法，并确认边界不会漏',24,'#fbbf24'))}return ''}
function benchmarkDiagramV7(s){const sc=s.scene||'';const svg=b=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+b+'</svg></div>';const tx=(x,y,t,sz=23,c='#eaf4ff',a='middle')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+sz+'" font-weight="900" text-anchor="'+a+'" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.62)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,22);const defs='<defs><marker id="v7a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#v7a)"/>';const grid=(vals,cols,hot=[],x=210,y=72,size=62)=>vals.map((v,i)=>{const cx=x+(i%cols)*size,cy=y+Math.floor(i/cols)*size;return '<rect x="'+cx+'" y="'+cy+'" width="'+(size-9)+'" height="'+(size-9)+'" fill="'+(hot.includes(i)?'rgba(45,212,191,.28)':'rgba(2,8,23,.68)')+'" stroke="'+(hot.includes(i)?'#2dd4bf':'#38d5ff')+'" stroke-width="2"/>'+tx(cx+(size-9)/2,cy+(size-9)/2,v,20)}).join('');const cell=(x,y,t,hot=false)=>box(x,y,95,50,t,hot);const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="27" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.62)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,20);if(sc==='product-direct')return svg(defs+box(150,85,105,62,'1')+box(285,85,105,62,'2',true)+box(420,85,105,62,'3')+box(555,85,105,62,'4')+box(185,230,180,64,'固定 i=1',true)+arrow(365,262,455,262)+box(455,230,220,64,'乘 j≠i 的数')+arrow(675,262,760,262)+box(760,230,230,64,'1×3×4 = 12',true)+tx(590,360,'直接法每个位置都重新扫一遍；这页不使用 prefix/suffix，只展示朴素枚举。',24,'#fbbf24'));if(sc==='islands-dfs')return svg(defs+grid(['1','1','0','1','1','0','0','0','1'],3,[0],250,80,68)+arrow(284,114,352,114)+arrow(284,114,284,182)+box(650,90,240,64,'从第一个 1 出发',true)+box(650,185,240,64,'只扩上下左右')+box(650,280,240,64,'访问过就改成 0')+tx(590,375,'DFS/BFS 的画面重点是扩散和标记，不是只说“吃掉整座岛”',24,'#fbbf24'));if(sc==='islands-walk')return svg(defs+grid(['0','0','0','0','0','0','0','0','1'],3,[8],250,80,68)+box(610,80,160,64,'ans = 1')+arrow(790,112,900,112)+box(910,80,160,64,'遇到新 1',true)+box(610,210,160,64,'DFS 标记')+arrow(790,242,900,242)+box(910,210,160,64,'ans = 2',true)+tx(590,360,'第一座岛标完以后继续扫描；右下角的新 1 才让计数从 1 变成 2',24,'#fbbf24'));if(sc==='bst-count-sample')return svg(defs+tx(590,38,'n=3 一共有 5 棵 BST：下面按根节点分组看',24,'#9eeaff')+node(145,115,'1',true)+node(205,185,'2')+node(265,255,'3')+node(345,115,'1',true)+node(425,185,'3')+node(385,255,'2')+node(590,115,'2',true)+node(530,200,'1')+node(650,200,'3')+node(835,115,'3',true)+node(755,185,'1')+node(815,255,'2')+node(1035,115,'3',true)+node(975,185,'2')+node(915,255,'1')+tx(245,338,'root=1：2 种',22,'#fbbf24')+tx(590,338,'root=2：1 种',22,'#fbbf24')+tx(925,338,'root=3：2 种',22,'#fbbf24'));if(sc==='bst-count-dp')return svg(cell(240,70,'dp[0]=1',true)+cell(350,70,'dp[1]=1')+cell(460,70,'dp[2]=2')+cell(570,70,'dp[3]=5',true)+box(250,185,230,64,'dp[i]：i 个节点能组多少 BST',true)+box(525,185,230,64,'枚举 root')+box(800,185,230,64,'左规模 × 右规模')+tx(590,320,'状态只关心节点数量，不关心具体值；因为 1..i 的相对大小关系固定',24,'#fbbf24'));if(sc==='bst-count-walk')return svg(defs+box(120,90,180,60,'root=1',true)+box(330,90,180,60,'左 0 个')+box(540,90,180,60,'右 2 个')+box(750,90,180,60,'1×2=2',true)+box(120,200,180,60,'root=2',true)+box(330,200,180,60,'左 1 个')+box(540,200,180,60,'右 1 个')+box(750,200,180,60,'1×1=1',true)+box(120,310,180,60,'root=3',true)+box(330,310,180,60,'左 2 个')+box(540,310,180,60,'右 0 个')+box(750,310,180,60,'2×1=2',true)+tx(1020,210,'合计 5',34,'#fbbf24'));if(sc==='window-max-deque')return svg(defs+box(115,95,190,70,'队列存下标',true)+box(370,95,230,70,'值保持递减')+box(665,95,230,70,'队首就是最大')+box(115,235,220,70,'先删过期下标')+box(410,235,250,70,'再弹掉队尾小值',true)+box(735,235,250,70,'最后把 i 入队')+tx(590,365,'这页讲规则：队列不是普通队列，它维护的是“可能成为最大值”的候选下标',24,'#fbbf24'));if(sc==='window-max-walk')return svg(defs+box(180,90,115,64,'0:1')+box(315,90,115,64,'1:3',true)+box(450,90,115,64,'2:-1')+box(585,90,115,64,'3:-3')+box(720,90,115,64,'4:5')+box(300,225,230,70,'i=2，窗口 [0..2]',true)+box(590,225,230,70,'deque=[1,2]')+box(880,225,190,70,'输出 nums[1]=3',true)+tx(590,360,'首个窗口形成后，不重新扫描三个数，直接读队首下标 1',24,'#fbbf24'));if(sc==='word-search-sample')return svg(defs+grid(['A','B','C','E','S','F','C','S','A','D','E','E'],4,[0,1,2,6,10,9],260,58,66)+arrow(292,90,358,90)+arrow(424,90,424,156)+arrow(424,222,358,222)+arrow(358,222,292,222)+box(760,110,270,70,'路径：A-B-C-C-E-D',true)+box(760,230,270,70,'输出 true')+tx(590,365,'样例页只负责看清这条合法路径怎么连起来',24,'#fbbf24'));if(sc==='word-search-backtrack')return svg(defs+box(120,80,210,64,'path = A',true)+arrow(330,112,455,112)+box(455,80,210,64,'选择 B')+arrow(665,112,790,112)+box(790,80,210,64,'递归下一格')+box(240,225,230,70,'visited 标记当前格',true)+box(525,225,230,70,'四方向逐个试')+box(810,225,230,70,'失败就撤销 visited',true)+tx(590,360,'回溯不是一次展示最终路径，而是选择、递归、撤销三件事循环发生',24,'#fbbf24'));if(sc==='word-search-walk')return svg(defs+grid(['A','B','C','E','S','F','C','S','A','D','E','E'],4,[0,1,2],230,58,66)+box(650,80,170,62,'step 1: A',true)+box(850,80,170,62,'step 2: B',true)+box(650,178,170,62,'step 3: C',true)+box(850,178,170,62,'下一步试四方向')+box(735,286,250,70,'错路撤销，再换方向',true)+tx(590,380,'逐格走时，屏幕只高亮当前已经确认的前缀，不提前把完整答案全亮完',24,'#fbbf24'));return ''}
function processDiagramOverride(s,mode){if(s.scene){const bench=benchmarkDiagramV7(s)||benchmarkDiagramV6(s)||benchmarkDiagramV5(s)||benchmarkDiagramV4(s);if(bench)return bench;}if(mode==='edge'){const cards=(s.cards&&s.cards.length?s.cards:[{label:'输入',value:'边界输入'},{label:'期望',value:'边界输出'},{label:'检查',value:'确认特殊情况'}]).slice(0,3);return '<div class="diagram edge-diagram"><div class="flow edge-flow">'+cards.map((item,index)=>'<div class="flow-card '+(index===0||index===cards.length-1?'hot':'')+'"><b>'+esc(item.label||('点 '+(index+1)))+'</b><span>'+esc(compact(item.value||'',46))+'</span></div>'+((index<cards.length-1)?'<div class="arrow">→</div>':'')).join('')+'</div></div>'}return ''}
function processDiagram(s,mode){const precise=processDiagramOverride(s,mode);if(precise)return precise;const k=s.kind;if(k==='removeNthList')return '<div class="diagram"><svg viewBox="0 0 980 430" width="100%" height="100%" role="img" aria-label="fast 先走 n 步，slow 停在待删节点前"><defs><marker id="lnkArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g stroke="#38d5ff" stroke-width="3" fill="none" marker-end="url(#lnkArrow)"><path d="M145 185 H225"/><path d="M325 185 H405"/><path d="M505 185 H585"/><path d="M685 185 H765"/></g><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><rect x="55" y="145" width="90" height="80" rx="8"/><rect x="235" y="145" width="90" height="80" rx="8"/><rect x="415" y="145" width="90" height="80" rx="8"/><rect x="595" y="145" width="90" height="80" rx="8"/><rect x="775" y="145" width="90" height="80" rx="8"/></g><rect x="595" y="145" width="90" height="80" rx="8" fill="rgba(45,212,191,.18)" stroke="#2dd4bf" stroke-width="4"/><g fill="#eaf4ff" font-size="30" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="100" y="185">1</text><text x="280" y="185">2</text><text x="460" y="185">3</text><text x="640" y="185">4</text><text x="820" y="185">5</text></g><g fill="#fbbf24" font-size="24" font-weight="1000" text-anchor="middle"><text x="460" y="118">slow / prev</text><text x="820" y="118">fast 到尾</text><text x="640" y="270">删除倒数第 2 个：4</text></g><path d="M505 255 C590 330 710 330 775 255" stroke="#2dd4bf" stroke-width="5" fill="none" marker-end="url(#lnkArrow)"/><text x="640" y="355" fill="#9eeaff" font-size="28" font-weight="900" text-anchor="middle">改链：slow.next = slow.next.next，3 直接连到 5</text></svg></div>';if(k==='moveZeroes')return '<div class="diagram"><svg viewBox="0 0 980 430" width="100%" height="100%" role="img" aria-label="slow 写入非零元素，末尾补零"><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="160" y="120" width="96" height="82" rx="8"/><rect x="274" y="120" width="96" height="82" rx="8"/><rect x="388" y="120" width="96" height="82" rx="8"/><rect x="502" y="120" width="96" height="82" rx="8"/><rect x="616" y="120" width="96" height="82" rx="8"/></g><g fill="#eaf4ff" font-size="31" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="208" y="161">0</text><text x="322" y="161">1</text><text x="436" y="161">0</text><text x="550" y="161">3</text><text x="664" y="161">12</text></g><rect x="160" y="250" width="96" height="82" rx="8" fill="rgba(45,212,191,.2)" stroke="#2dd4bf" stroke-width="4"/><rect x="274" y="250" width="96" height="82" rx="8" fill="rgba(45,212,191,.2)" stroke="#2dd4bf" stroke-width="4"/><rect x="388" y="250" width="96" height="82" rx="8" fill="rgba(45,212,191,.2)" stroke="#2dd4bf" stroke-width="4"/><rect x="502" y="250" width="96" height="82" rx="8" fill="#07111f" stroke="#38d5ff" stroke-width="2"/><rect x="616" y="250" width="96" height="82" rx="8" fill="#07111f" stroke="#38d5ff" stroke-width="2"/><g fill="#eaf4ff" font-size="31" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="208" y="291">1</text><text x="322" y="291">3</text><text x="436" y="291">12</text><text x="550" y="291">0</text><text x="664" y="291">0</text></g><g fill="#9eeaff" font-size="25" font-weight="1000" text-anchor="middle"><text x="436" y="70">扫描原数组，非零按顺序写到 slow</text><text x="436" y="380">slow 后面的格子统一补 0，非零相对顺序不变</text></g><path d="M322 210 V242" stroke="#38d5ff" stroke-width="4"/><path d="M550 210 V242" stroke="#38d5ff" stroke-width="4"/><text x="322" y="236" fill="#fbbf24" font-size="22" font-weight="900" text-anchor="middle">写入</text><text x="550" y="236" fill="#fbbf24" font-size="22" font-weight="900" text-anchor="middle">写入</text></svg></div>';if(k==='lisDP')return '<div class="diagram"><svg viewBox="0 0 980 430" width="100%" height="100%" role="img" aria-label="tails 数组二分替换过程"><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="90" y="92" width="86" height="66"/><rect x="190" y="92" width="86" height="66"/><rect x="290" y="92" width="86" height="66"/><rect x="390" y="92" width="86" height="66"/><rect x="490" y="92" width="86" height="66"/><rect x="590" y="92" width="86" height="66"/><rect x="690" y="92" width="86" height="66"/><rect x="790" y="92" width="86" height="66"/></g><g fill="#eaf4ff" font-size="25" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="133" y="125">10</text><text x="233" y="125">9</text><text x="333" y="125">2</text><text x="433" y="125">5</text><text x="533" y="125">3</text><text x="633" y="125">7</text><text x="733" y="125">101</text><text x="833" y="125">18</text></g><text x="490" y="55" fill="#9eeaff" font-size="28" font-weight="1000" text-anchor="middle">当前数 3：在 tails=[2,5] 中二分，替换第一个 >=3 的 5</text><g fill="#07111f" stroke="#38d5ff" stroke-width="2"><rect x="250" y="235" width="116" height="78"/><rect x="392" y="235" width="116" height="78"/><rect x="534" y="235" width="116" height="78"/></g><rect x="392" y="235" width="116" height="78" fill="rgba(45,212,191,.2)" stroke="#2dd4bf" stroke-width="4"/><g fill="#eaf4ff" font-size="31" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="308" y="274">2</text><text x="450" y="274">3</text><text x="592" y="274">7</text></g><text x="450" y="350" fill="#fbbf24" font-size="25" font-weight="900" text-anchor="middle">tails 越小，后面越容易接长；长度看 tails 的格子数</text></svg></div>';if(k==='flattenTree')return '<div class="diagram"><svg viewBox="0 0 980 430" width="100%" height="100%" role="img" aria-label="反向后序用 prev 展开二叉树"><defs><marker id="flatArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs><g stroke="#38d5ff" stroke-width="3" fill="none"><path d="M210 100 L140 180"/><path d="M210 100 L315 180"/><path d="M140 180 L105 270"/><path d="M140 180 L180 270"/><path d="M315 180 L390 270"/></g><g fill="#07111f" stroke="#eaf4ff" stroke-width="3"><circle cx="210" cy="82" r="38"/><circle cx="140" cy="180" r="38"/><circle cx="315" cy="180" r="38"/><circle cx="105" cy="282" r="34"/><circle cx="180" cy="282" r="34"/><circle cx="390" cy="282" r="34"/></g><g fill="#eaf4ff" font-size="26" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="210" y="82">1</text><text x="140" y="180">2</text><text x="315" y="180">5</text><text x="105" y="282">3</text><text x="180" y="282">4</text><text x="390" y="282">6</text></g><path d="M480 210 H555" stroke="#38d5ff" stroke-width="4" marker-end="url(#flatArrow)"/><g fill="#07111f" stroke="#2dd4bf" stroke-width="3"><rect x="590" y="170" width="62" height="62" rx="8"/><rect x="682" y="170" width="62" height="62" rx="8"/><rect x="774" y="170" width="62" height="62" rx="8"/><rect x="866" y="170" width="62" height="62" rx="8"/></g><g stroke="#38d5ff" stroke-width="3" marker-end="url(#flatArrow)"><path d="M652 201 H678"/><path d="M744 201 H770"/><path d="M836 201 H862"/></g><g fill="#eaf4ff" font-size="26" font-weight="900" text-anchor="middle" dominant-baseline="middle"><text x="621" y="201">1</text><text x="713" y="201">2</text><text x="805" y="201">3</text><text x="897" y="201">4...</text></g><text x="490" y="60" fill="#9eeaff" font-size="28" font-weight="1000" text-anchor="middle">右 → 左 → 根：prev 保存已经展开好的右链</text><text x="740" y="300" fill="#fbbf24" font-size="25" font-weight="900" text-anchor="middle">node.right = prev，node.left = None</text></svg></div>';return ''}
function stageDiagram(s,mode){const labels={direct:'直接做法',bottleneck:'问题卡点',pattern:'优化结构',walk:'执行推演'};const raw=s.items&&s.items.length?s.items.map((v,i)=>({label:'步骤 '+(i+1),value:String(v).replace(/^\\d+[.、]\\s*/, '')})):(s.cards&&s.cards.length?s.cards:(s.metrics&&s.metrics.length?s.metrics:[]));const list=raw.slice(0,3);const points=list.map((item,index)=>'<div class="visual-point '+(index===0?'hot':'')+'"><b>'+esc(item.label||('点 '+(index+1)))+'</b><span>'+esc(compact(item.value||item.name||'',34))+'</span></div>').join('');return '<div class="diagram stage-diagram visual-stage '+mode+'-stage"><div class="stage-title">'+esc(labels[mode]||'讲解')+'</div><div class="visual-stage-figure">'+diagram(s.kind)+'</div><div class="visual-stage-points">'+points+'</div></div>'}
function priorityDiagram(s,mode){const k=s.kind;const svg=b=>'<div class="diagram"><svg viewBox="0 0 1180 430" width="100%" height="100%" role="img">'+b+'</svg></div>';const tx=(x,y,t,sz=22,c='#eaf4ff')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+sz+'" font-weight="900" text-anchor="middle" dominant-baseline="middle">'+esc(t)+'</text>';const box=(x,y,w,h,t,hot=false)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.62)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x+w/2,y+h/2,t,21);const defs='<defs><marker id="pa" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L9,3 L0,6 Z" fill="#38d5ff"/></marker></defs>';const arrow=(x1,y1,x2,y2)=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="#38d5ff" stroke-width="4" fill="none" marker-end="url(#pa)"/>';const link=(vals,x,y,hot=[])=>vals.map((v,i)=>box(x+i*112,y,84,56,v,hot.includes(i))+(i<vals.length-1?arrow(x+i*112+84,y+28,x+(i+1)*112,y+28):'')).join('');const node=(x,y,t,hot=false)=>'<circle cx="'+x+'" cy="'+y+'" r="30" fill="'+(hot?'rgba(45,212,191,.24)':'rgba(2,8,23,.62)')+'" stroke="'+(hot?'#2dd4bf':'#38d5ff')+'" stroke-width="'+(hot?'4':'2')+'"/>'+tx(x,y,t,21);if(k==='addListDigits'){if(mode==='sample')return svg(defs+link(['2','4','3'],120,95,[0])+link(['5','6','4'],120,195,[0])+box(590,92,210,62,'2+5+0=7',true)+link(['dummy','7'],830,150,[1])+tx(590,340,'样例先只演个位：从链表头开始相加，写出第一位 7',23,'#fbbf24'));if(mode==='pattern')return svg(defs+box(100,80,190,64,'dummy')+box(340,80,190,64,'cur')+box(580,80,190,64,'carry')+box(820,80,190,64,'l1 / l2')+box(250,220,260,70,'while l1 or l2 or carry',true)+box(630,220,260,70,'cur.next = ListNode(digit)',true)+tx(590,360,'推荐写法的核心是 dummy 固定头，cur 负责追加节点',24,'#fbbf24'));if(mode==='walk')return svg(defs+link(['2','4','3'],90,70,[1])+link(['5','6','4'],90,170,[1])+box(505,90,250,64,'第二位：4+6+0=10',true)+box(505,185,250,64,'写 0，carry=1')+link(['dummy','7','0'],810,130,[2])+box(430,295,320,62,'第三位：3+4+1=8',true)+tx(590,380,'walk 页只看当前轮：先算 total，再写 digit，再移动 cur/l1/l2',22,'#fbbf24'))}if(k==='lruCache'){if(mode==='sample')return svg(defs+box(110,95,170,62,'put(1,1)',true)+box(330,95,170,62,'put(2,2)')+box(550,95,170,62,'get(1)',true)+box(770,95,170,62,'put(3,3)')+box(990,95,120,62,'淘汰 2',true)+box(250,240,120,58,'HEAD',true)+arrow(370,269,520,269)+box(520,240,120,58,'1')+arrow(640,269,790,269)+box(790,240,120,58,'3')+arrow(910,269,1020,269)+box(1020,240,120,58,'TAIL',true)+tx(590,365,'样例讲的是最近使用顺序：get(1) 后 1 移到头部，容量满时淘汰尾前节点',22,'#fbbf24'));if(mode==='pattern')return svg(defs+box(115,80,220,70,'hash: key -> node',true)+box(440,80,260,70,'双向链表：新在头，旧在尾')+box(805,80,220,70,'O(1) 找 + O(1) 移动',true)+box(170,230,220,62,'head/tail 哨兵')+box(480,230,220,62,'remove(node)')+box(790,230,220,62,'add_to_front(node)',true)+tx(590,360,'推荐结构不是列表，而是哈希表配双向链表',24,'#fbbf24'));if(mode==='walk')return svg(defs+box(170,70,120,58,'A.prev')+box(340,70,120,58,'node',true)+box(510,70,120,58,'A.next')+arrow(290,99,340,99)+arrow(460,99,510,99)+box(170,200,220,62,'断开：prev.next=next',true)+box(480,200,260,62,'断开：next.prev=prev',true)+box(800,200,220,62,'插到 HEAD 后')+tx(590,350,'移动到头部不是换值，是先 remove 四周指针，再 add 到 head 后面',23,'#fbbf24'))}if(k==='mergeSortList'){if(mode==='sample')return svg(defs+link(['4','2','1','3'],180,95,[0,1,2,3])+box(395,220,390,70,'输出：1 -> 2 -> 3 -> 4',true)+tx(590,350,'样例目标只是把链表节点按值排好，不能丢节点身份',23,'#fbbf24'));if(mode==='pattern')return svg(defs+box(170,80,220,70,'快慢指针切半',true)+box(480,80,220,70,'pre.next=None 断链')+box(790,80,220,70,'递归排序两段')+box(455,230,270,70,'merge 两条有序链',true)+tx(590,350,'链表归并排序由切半、断链、合并组成',24,'#fbbf24'));if(mode==='walk')return svg(defs+link(['4','2'],180,90,[1])+link(['1','3'],180,190,[0])+arrow(520,118,650,118)+arrow(520,218,650,218)+link(['1','2','3','4'],680,145,[0,1,2,3])+tx(590,350,'walk 页展示最后合并：每次从两段头部接更小的节点',23,'#fbbf24'))}if(k==='palindromeList'){if(mode==='sample')return svg(defs+link(['1','2','2','1'],330,95,[0,3])+box(420,230,340,70,'正读反读都一样 -> true',true));if(mode==='pattern')return svg(defs+box(140,85,220,70,'fast/slow 找中点')+box(460,85,220,70,'反转后半段',true)+box(780,85,220,70,'前后两段比较')+tx(590,300,'推荐写法用链表本身完成比较，不把所有值复制到数组',24,'#fbbf24'));if(mode==='walk')return svg(defs+link(['1','2'],270,90,[0])+link(['1','2'],670,90,[0])+box(390,225,160,62,'left=1',true)+box(630,225,160,62,'right=1',true)+tx(590,350,'每一轮比较 left.val 和 right.val，然后两个指针同时后移',23,'#fbbf24'))}if(k==='treeMaxPath'){if(mode==='sample')return svg(defs+'<path d="M590 90 L455 185"/><path d="M590 90 L725 185"/><path d="M725 215 L650 295"/><path d="M725 215 L800 295" stroke="#38d5ff" stroke-width="3" fill="none"/>'+node(590,90,'-10')+node(455,185,'9')+node(725,185,'20',true)+node(650,295,'15',true)+node(800,295,'7',true)+tx(590,360,'样例最大路径是 15 -> 20 -> 7，路径和 42',24,'#fbbf24'));if(mode==='pattern')return svg(defs+box(150,100,300,72,'返回给父节点：node + max(left,right)',true)+box(620,100,330,72,'更新全局：left + node + right')+tx(590,270,'一个节点有两种角色：向上只能给一条边，自己结算时可以接两边',24,'#fbbf24'));if(mode==='walk')return svg(defs+node(590,110,'20',true)+node(480,240,'15',true)+node(700,240,'7',true)+box(120,185,260,70,'return = 20 + max(15,7) = 35')+box(800,185,260,70,'global = 15 + 20 + 7 = 42',true)+tx(590,350,'这就是“返回值”和“全局答案”不一样的地方',24,'#fbbf24'))}if(k==='robberTree'){if(mode==='sample')return svg(defs+node(590,90,'3',true)+node(455,185,'2')+node(725,185,'3')+node(500,285,'3',true)+node(770,285,'1',true)+tx(590,360,'样例选择 root 和两个孙子：3 + 3 + 1 = 7',24,'#fbbf24'));if(mode==='pattern')return svg(defs+box(180,120,300,72,'rob = node + left.not + right.not',true)+box(640,120,330,72,'not = max(left) + max(right)')+tx(590,285,'每个节点返回二元组，而不是一个数字',24,'#fbbf24'));if(mode==='walk')return svg(defs+node(590,110,'2',true)+node(520,235,'3')+box(680,200,300,70,'当前节点返回 (rob=2, not=3)',true)+tx(590,340,'父节点只需要子节点的两个选择，不需要知道下面怎么偷',23,'#fbbf24'))}if(k==='pathPrefixTree'){if(mode==='sample')return svg(defs+node(510,80,'10')+node(405,170,'5',true)+node(320,275,'3',true)+box(700,105,260,70,'路径 5 -> 3 = 8',true)+box(700,215,260,70,'target = 8'));if(mode==='pattern')return svg(defs+box(150,85,250,70,'cur += node.val',true)+box(465,85,250,70,'答案 += count[cur-target]')+box(780,85,250,70,'进入加，离开减',true)+tx(590,280,'前缀和表只记录当前根到当前节点路径上的前缀',23,'#fbbf24'));if(mode==='walk')return svg(defs+box(160,90,260,70,'cur=18，target=8',true)+box(500,90,260,70,'查 count[10]')+box(820,90,220,70,'命中一条路径',true)+box(420,230,340,70,'回溯离开节点：count[18]--')+tx(590,350,'walk 页重点是表的增减时机，避免串到别的分支',23,'#fbbf24'))}if(k==='bstBounds'){if(mode==='sample')return svg(defs+node(590,90,'5',true)+node(455,185,'1')+node(725,185,'4')+node(650,285,'3',true)+node(805,285,'6')+tx(590,360,'样例陷阱：3 在 5 的右子树里，所以必须大于 5',24,'#fbbf24'));if(mode==='pattern')return svg(defs+box(160,90,260,70,'左子树范围：(low, node.val)')+box(520,90,260,70,'右子树范围：(node.val, high)',true)+box(410,230,360,70,'每递归一层都带上下界')+tx(590,350,'推荐写法用祖先边界，而不是只比较左右孩子',24,'#fbbf24'));if(mode==='walk')return svg(defs+box(190,90,250,70,'到节点 3')+box(500,90,250,70,'low = 5',true)+box(810,90,250,70,'3 <= 5 -> false',true)+tx(590,300,'这里正好解释为什么只比父节点会错',24,'#fbbf24'))}if(k==='buildTree'){if(mode==='sample')return svg(defs+box(90,75,430,62,'preorder: 3, 9, 20, 15, 7',true)+box(90,165,430,62,'inorder: 9, 3, 15, 20, 7')+node(790,120,'3',true)+node(690,230,'9')+node(900,230,'20')+tx(590,350,'样例先拿 3 做根，中序里 3 左边是左子树，右边是右子树',23,'#fbbf24'));if(mode==='pattern')return svg(defs+box(150,90,260,70,'pre_pos 指向当前根',true)+box(485,90,260,70,'index[root] 切中序')+box(820,90,220,70,'递归左右区间',true)+tx(590,285,'优化点是不用切片，只传 inorder 边界',24,'#fbbf24'));if(mode==='walk')return svg(defs+node(590,80,'3',true)+node(455,185,'9')+node(725,185,'20',true)+node(655,295,'15')+node(805,295,'7')+tx(590,370,'walk 页展示树逐层长出：先根，再左区间，再右区间',24,'#fbbf24'))}return ''}
function teachingDiagram(s,mode){const exact=processDiagramOverride(s,mode);if(exact)return exact;const priority=priorityDiagram(s,mode);if(priority)return priority;if(mode==='direct'||mode==='bottleneck'||mode==='pattern'||mode==='walk')return stageDiagram(s,mode);const process=processDiagram(s,mode);if(process&&(mode==='benchmark'||mode==='read'||mode==='io'||mode==='sample'||mode==='edge'))return process;if(s.kind==='cycleList'&&(mode==='read'||mode==='sample'||mode==='io'||mode==='edge'))return diagram(s.kind);if(s.kind==='prefixSuffix'&&mode==='sample')return prefixSuffixTeaching();if(s.kind==='graphDAG'&&mode==='sample')return courseTeaching();if(s.kind==='serializeTree'&&mode==='sample')return serializeTeaching();const sampleKinds=new Set(['wordGrid','rotateMatrix','rotatedSearch','rotatedSearchDup','rotateBinary','rotateBinaryDup','tempStack','matrixSearch','addListDigits','noRepeatWindow','palindromeCenter','waterBars','threeSumPointers','phoneChoices','removeNthList','bracketStack','mergeLists','rangeBinary','combinationTree','rainBars','permuteTree','anagramBuckets','kadaneTrace','jumpReach','intervalMerge','pathGrid','minPathGrid','stairsDP','coverWindow','subsetTree','bstBounds','mirrorTree','depthTree','treeMaxPath','wordBreakDP','mergeSortList','maxMinProduct','robberLine','islandGrid','reverseList','heapK','squareDP','invertTree','palindromeList','lcaTree','intersectionList','majorityVote','squaresDP','moveZeroes','lisDP','stockCooldown','balloonInterval','coinDP','robberTree','partitionDP','pathPrefixTree','targetSigns','bstGreater','diameterTree','prefixSumK','unsortedWindow','mergeTrees','palindromeExpand','bitsDP','weightedGraph','trieTrace','catalanDP','dequeWindow','histogramStack','lruCache','regexDP','dp2D','medianPartition','functionalCycle','bitTrace','maximalRect','minStack','permutationPivot','queueTrace','xorCancel','dutchFlag','taskFrame','freqBucket','stockProfit','inorderTree','levelOrderTree','buildTree','flattenTree','arrayTrace','linkedList','dpTable','treeTrace','choiceTree','stackTrace','windowTrace','pointerTrace','binaryTrace','matrixTrace','gridTrace','hashTrace','heapTrace','greedyTrace']);if((mode==='read'||mode==='io'||mode==='sample'||mode==='edge')&&sampleKinds.has(s.kind))return diagram(s.kind);const arrayView=arrayTeachingDiagram(s);if(arrayView)return arrayView;return relationBoard(s,mode)}
function relationBoard(s,mode){const fallback=mode==='read'?[{label:'target',value:s.title||''},{label:'input',value:s.caption||''},{label:'return',value:'check the required result'}]:[{label:'input',value:'example input'},{label:'output',value:'expected answer'},{label:'check',value:'boundary or reason'}];const list=((s.cards&&s.cards.length)?s.cards:fallback).slice(0,3);return '<div class="diagram relation-diagram '+(mode==='read'?'read-diagram':'')+'"><div class="relation-flow">'+list.map((item,index)=>'<div class="relation-card '+(index<2?'hot':'')+'"><b>'+esc(item.label||('step '+(index+1)))+'</b><span>'+esc(compact(item.value||'',82))+'</span></div>'+((index<list.length-1)?'<div class="relation-arrow">→</div>':'')).join('')+'</div></div>'}
function infoPills(items=[]){const list=(items||[]).slice(0,4);return '<div class="graphic-info">'+list.map((item,index)=>{const obj=typeof item==='string'?{label:'步骤 '+(index+1),value:item}:item;return '<div class="graphic-pill '+(index===0?'hot':'')+'"><b>'+esc(obj.label||('步骤 '+(index+1)))+'</b><span>'+esc(compact(obj.value||obj.name||'',72))+'</span></div>'}).join('')+'</div>'}
function slideInfo(s){if(s.cards&&s.cards.length)return s.cards;if(s.items&&s.items.length)return s.items.slice(0,4).map((item,index)=>({label:'步骤 '+(index+1),value:String(item).replace(/^\\d+[.、]\\s*/,'')}));if(s.metrics&&s.metrics.length)return s.metrics;return[]}
function graphicBoard(s,visual,showInfo=false){const info=slideInfo(s);const hasInfo=showInfo&&info.length>0;return '<div class="graphic-board '+(!hasInfo?'big-only':'')+'"><div class="graphic-main">'+visual+'</div>'+(hasInfo?infoPills(info):'')+'</div>'}
function readBoard(s){return graphicBoard(s,teachingDiagram(s,'read'),true)}
function teachingBoard(s,mode){const showInfo=!['direct','bottleneck','pattern','walk'].includes(mode);return graphicBoard(s,teachingDiagram(s,mode),showInfo)}
function renderVisual(s){if(s.visual==='code')return renderCode(s);if(s.visual==='codeFocus')return renderFocus(s);if(s.visual==='review')return '<div class="board"><div class="variant-grid">'+(s.variants||[]).map(item=>'<div class="variant '+(item.badge==='推荐'?'hot':'')+'"><strong>'+esc(item.name)+'</strong><div class="cost">'+esc(item.cost)+'</div><p>'+esc(item.note)+'</p></div>').join('')+'</div></div>';if(s.visual==='benchmark')return teachingBoard(s,'benchmark');if(s.visual==='bottleneck'||s.visual==='direct'||s.visual==='pattern'||s.visual==='walk')return teachingBoard(s,s.visual);if(s.visual==='read')return readBoard(s);if(s.visual==='io'||s.visual==='sample'||s.visual==='edge')return teachingBoard(s,s.visual);return graphicBoard(s,diagram(s.kind),true)}
function render(){const s=slides[step];stepNow.textContent=String(step+1).padStart(2,'0');progressBar.style.width=((step+1)/slides.length*100)+'%';caption.textContent=s.caption;const isCode=s.visual==='code'||s.visual==='codeFocus';const isTeach=s.visual==='read'||s.visual==='io'||s.visual==='sample'||s.visual==='edge';const isTop=!isCode;const titleLen=String(s.title||'').length;const titleClass=titleLen>30?'very-long-title ':titleLen>20?'long-title ':'';scene.innerHTML='<div class="layout '+(isCode?'code-layout ':'')+(isTop?'top-layout ':'')+(isTeach?'teach-layout ':'')+titleClass+'fade"><section class="copy"><span class="eyebrow">'+esc(s.eyebrow)+'</span><h1 class="title">'+esc(s.title)+'</h1><p class="lead">'+esc(s.caption)+'</p></section>'+renderVisual(s)+'</div>';document.title=s.title+' | ${problem.title}';playAudio()}
function src(){return './audio/${problem.slug}/'+(step+1)+'.wav'}function estimate(t){return Math.max(3500,Math.min(12000,String(t||'').length*220))}function clearTimer(){if(audioTimer){clearTimeout(audioTimer);audioTimer=null}}function stopAudio(){audio.pause();audio.removeAttribute('src');audio.load();clearTimer()}function fallback(){clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<slides.length-1)go(1)},estimate(slides[step]?.caption))}function playAudio(){stopAudio();if(audioMode==='manual')return;audio.src=src();audio.onended=()=>{clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<slides.length-1)go(1)},200)};audio.onerror=fallback;audio.play().catch(fallback)}function refresh(){audioBtn.textContent=audioMode==='manual'?'声音关闭':'声音开启';autoBtn.textContent=audioMode==='auto'?'停止自动':'自动播放'}function go(d){step=Math.max(0,Math.min(slides.length-1,step+d));render()}function stopAuto(){if(audioMode==='auto')audioMode='audio';stopAudio();refresh()}function toggleAudio(){if(audioMode==='manual'){audioMode='audio';refresh();playAudio()}else{audioMode='manual';stopAudio();refresh()}}function toggleAuto(){audioMode=audioMode==='auto'?'audio':'auto';refresh();playAudio()}prevBtn.onclick=()=>{stopAuto();go(-1)};nextBtn.onclick=()=>{stopAuto();go(1)};audioBtn.onclick=toggleAudio;autoBtn.onclick=toggleAuto;stage.onclick=e=>{if(e.target.closest('button'))return;stopAuto();go(1)};window.onkeydown=e=>{if(e.key==='ArrowLeft'){stopAuto();go(-1)}if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();stopAuto();go(1)}if(e.key.toLowerCase()==='m')toggleAudio();if(e.key.toLowerCase()==='a')toggleAuto()};function fit(){stage.style.transform='translate(-50%,-50%) scale('+Math.min(innerWidth/1920,innerHeight/1080)+')'}addEventListener('resize',fit);fit();refresh();render();`;
  return app
    .replace('function specialDiagram(kind){', OVERRIDE_DIAGRAM_JS + '\n' + PATCHED_DIAGRAM_JS + '\n' + MISSING_DIAGRAM_JS + '\n' + EXTRA_DIAGRAM_JS + '\n' + TREE_SPECIFIC_DIAGRAM_JS + '\n' + FIXUP_DIAGRAM_JS + '\n' + SUPERFOCUSED_DIAGRAM_JS + '\n' + FOCUSED_DIAGRAM_JS + '\n' + CRITICAL_DIAGRAM_JS + '\n' + REMOVE_NTH_FIX_DIAGRAM_JS + '\n' + QUALITY_DIAGRAM_JS + '\n' + CHAIN_QUALITY_DIAGRAM_JS + '\nfunction specialDiagram(kind){')
    .replace('function teachingDiagram(s,mode){const exact=processDiagramOverride(s,mode);', 'function teachingDiagram(s,mode){const removeNth=removeNthFixDiagram(s,mode);if(removeNth)return removeNth;const critical=criticalDiagram(s,mode);if(critical)return critical;const superFocused=superFocusedDiagram(s,mode);if(superFocused)return superFocused;const focused=focusedDiagram(s,mode);if(focused)return focused;const fix=fixupDiagram(s,mode);if(fix)return fix;const chain=chainQualityDiagram(s,mode);if(chain)return chain;const quality=qualityDiagram(s,mode);if(quality)return quality;const exact=processDiagramOverride(s,mode);')
    .replace('function diagram(kind){const special=specialDiagram(kind);if(special)return special;', 'function diagram(kind){const override=overrideDiagram(kind);if(override)return override;const patched=patchedDiagram(kind);if(patched)return patched;const missing=missingDiagram(kind);if(missing)return missing;const extra=extraDiagram(kind);if(extra)return extra;const tree=treeSpecificDiagram(kind);if(tree)return tree;const special=specialDiagram(kind);if(special)return special;')
    .replace("if(s.kind==='serializeTree'&&mode==='sample')return serializeTeaching();", "if(s.kind==='serializeTree'&&mode==='sample')return serializeTeaching();if((mode==='read'||mode==='sample')&&missingDiagram(s.kind))return missingDiagram(s.kind);");
}

async function createExistingManifestEntry(targetRoot, problem) {
  const entry = { slug: problem.slug, title: problem.title, leetcodeId: problem.leetcodeId, segments: 0, custom: true };
  try {
    const app = await readFile(join(targetRoot, problem.slug, 'presentation', 'app.js'), 'utf8');
    const match = app.match(/^const slides=(\[[\s\S]*?\]);\nconst stage=/);
    if (match) entry.segments = JSON.parse(match[1]).length;
  } catch {
    // Custom pages can be edited by hand; keep manifest generation tolerant.
  }
  return entry;
}

async function main() {
  const targetRoot = resolve(process.argv[2] || DEFAULT_TARGET_ROOT);
  const problems = extractJsonArray(await readFile('src/data/problems.ts', 'utf8'), 'export const problems: Problem[] = ');
  const refinements = extractJsonObject(await readFile('src/data/problemRefinements.ts', 'utf8'), 'export const problemRefinements: Record<number, ProblemRefinement> = ');
  const solutionVariants = extractJsonObject(await readFile('src/data/solutionVariants.ts', 'utf8'), 'export const solutionVariants: Record<number, SolutionVariant[]> = ');
  const sources = JSON.parse(await readFile('scripts/hot100_pdf_sources.json', 'utf8'));
  const sourceBySlug = new Map(sources.map((item) => [item.slug, item.source]));
  const generated = [];
  let regenerated = 0;

  for (const problem of problems) {
    if (SKIP_SLUGS.has(problem.slug)) {
      generated.push(await createExistingManifestEntry(targetRoot, problem));
      continue;
    }
    const refinement = refinements[String(problem.leetcodeId)];
    const variants = solutionVariants[String(problem.leetcodeId)] || [];
    const slides = buildSlides(problem, refinement, variants);
    const source = sourceBySlug.get(problem.slug);
    const root = join(targetRoot, problem.slug);
    const presentation = join(root, 'presentation');

    await mkdir(presentation, { recursive: true });
    await writeFile(join(root, 'article.md'), createArticle(problem, source), 'utf8');
    await writeFile(join(root, 'script.md'), createScript(problem, slides), 'utf8');
    await writeFile(join(root, 'outline.md'), createOutline(problem, slides), 'utf8');
    await writeFile(join(root, 'audio-segments.json'), JSON.stringify(createAudioSegments(problem, slides), null, 2), 'utf8');
    await writeFile(join(root, '.generated-hot100'), 'generated by scripts/generate_hot100_case_videos.mjs\n', 'utf8');
    await writeFile(join(presentation, 'index.html'), createIndex(problem, slides), 'utf8');
    await writeFile(join(presentation, 'styles.css'), createStyles() + createCodeLayoutStyles() + createLayoutFixStyles(), 'utf8');
    await writeFile(join(presentation, 'app.js'), createApp(problem, slides), 'utf8');
    generated.push({ slug: problem.slug, title: problem.title, leetcodeId: problem.leetcodeId, segments: slides.length });
    regenerated += 1;
  }

  await writeFile(join(targetRoot, 'hot100-video-manifest.json'), JSON.stringify(generated, null, 2), 'utf8');
  console.log(`Regenerated ${regenerated} Hot100 case videos and wrote ${generated.length} manifest entries in ${targetRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
