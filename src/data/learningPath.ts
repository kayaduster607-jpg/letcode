import { LearningStage } from '@/types';

export const learningPath: LearningStage[] = [
  {
    id: 'array-hash',
    name: '数组与哈希',
    description: '理解哈希表的 O(1) 查找思想，学会用空间换时间',
    order: 1,
    problemIds: [1, 22, 47], // 两数之和, 字母异位词分组, 最长连续序列
    templates: ['哈希表查配对', '哈希表去重/计数'],
    commonMistakes: ['忘记处理同一个元素被用两次的情况', '先存再查导致找到自己'],
    tips: '哈希表的核心价值是 O(1) 查找。遇到"快速判断某个值是否存在"的需求，第一时间想到哈希表。',
  },
  {
    id: 'two-pointer',
    name: '双指针',
    description: '掌握对撞指针和快慢指针两种模式',
    order: 2,
    problemIds: [7, 8, 19, 74], // 盛最多水的容器, 三数之和, 接雨水, 移动零
    templates: ['快慢指针（同向）', '对撞指针（相向）'],
    commonMistakes: ['快慢指针搞混谁快谁慢', '对撞指针的终止条件写错'],
    tips: '双指针的核心是"两个指针各司其职"。快慢指针一个探路一个记录，对撞指针从两端逼近。',
  },
  {
    id: 'sliding-window',
    name: '滑动窗口',
    description: '理解窗口的扩大与收缩逻辑',
    order: 3,
    problemIds: [3, 31, 89], // 无重复字符的最长子串, 最小覆盖子串, 找到所有字母异位词
    templates: ['滑动窗口框架：right 扩大，满足条件时 left 收缩'],
    commonMistakes: ['收缩窗口时只收缩一步就跳出循环', '忘记在每次扩展后更新结果'],
    tips: '滑动窗口的关键是想清楚两个问题：① 什么时候扩大窗口？② 什么时候收缩窗口？',
  },
  {
    id: 'substring',
    name: '窗口、单调队列与前缀和',
    description: '处理连续区间统计：窗口最大值、子数组和与前缀和计数',
    order: 4,
    problemIds: [71, 95], // 滑动窗口最大值, 和为K的子数组
    templates: ['单调队列维护窗口最值', '前缀和 + 哈希表计数'],
    commonMistakes: ['把子数组/子串的连续性和子序列混淆', '前缀和初始化 {0:1} 漏写', '单调队列忘记移除过期下标'],
    tips: '连续区间问题先判断维护什么：窗口最大/最小常用单调队列；统计区间和常用前缀和 + 哈希表。',
  },
  {
    id: 'array',
    name: '普通数组',
    description: '区间操作和原地算法思想',
    order: 5,
    problemIds: [23, 25, 70], // 最大子数组和, 合并区间, 除自身以外数组的乘积
    templates: ['区间合并', '原地修改'],
    commonMistakes: ['区间边界处理出错', '原地操作时丢失数据'],
    tips: '数组题的关键是下标管理和边界处理。画图标注每个下标的含义是避免出错的最好方法。',
  },
  {
    id: 'matrix',
    name: '矩阵',
    description: '二维数组的遍历技巧',
    order: 6,
    problemIds: [21, 72], // 旋转图像, 搜索二维矩阵II
    templates: ['螺旋遍历', '对角线遍历', '原地标记'],
    commonMistakes: ['螺旋矩阵的边界收缩搞混', '旋转图像的转置+翻转顺序搞反'],
    tips: '矩阵题的本质是二维数组的遍历顺序设计。先想清楚"按什么顺序访问每个格子"。',
  },
  {
    id: 'linked-list',
    name: '链表',
    description: '虚拟头节点、双指针在链表中的应用',
    order: 7,
    problemIds: [2, 10, 12, 50, 51, 52, 53, 58, 62, 68], // 两数相加, 删除倒数第N个, 合并有序链表, 环形链表, 环形链表II, LRU缓存, 排序链表, 相交链表, 反转链表, 回文链表
    templates: ['虚拟头节点', '快慢指针找中点/环', '迭代反转', '递归反转'],
    commonMistakes: ['断链后丢失后续节点', '忘记处理空链表', '返回值搞错'],
    tips: '链表题一定要画图！每一步指针的变化都要在图上标注清楚。',
  },
  {
    id: 'binary-tree',
    name: '二叉树',
    description: '递归思维、DFS/BFS 遍历',
    order: 8,
    problemIds: [37, 38, 39, 40, 41, 42, 43, 44, 46, 67, 69, 76, 81, 88, 93, 94, 97],
    templates: ['递归三要素', '前序/中序/后序遍历', '层序遍历(BFS)'],
    commonMistakes: ['递归终止条件写错', '混淆前中后序的处理位置', '忘记 return'],
    tips: '二叉树的核心是递归。90% 的二叉树题都可以用递归解决。想清楚"当前节点做什么、左右子树返回什么"就够了。',
  },
  {
    id: 'graph',
    name: '图论与前缀树',
    description: 'BFS/DFS、拓扑排序，以及字符串前缀结构 Trie',
    order: 9,
    problemIds: [61, 63, 64, 85], // 岛屿数量, 课程表, 实现Trie, 除法求值
    templates: ['DFS/BFS 遍历图', '拓扑排序', 'Trie 前缀树'],
    commonMistakes: ['忘记标记已访问节点导致死循环', '拓扑排序的入度计算搞错'],
    tips: '图论题先建点和边，再选 DFS/BFS/拓扑；Trie 题则把字符串拆成字符路径，用 isEnd 区分完整单词。',
  },
  {
    id: 'backtracking',
    name: '回溯',
    description: '回溯三部曲：选择、约束、撤销',
    order: 10,
    problemIds: [9, 13, 18, 20, 32, 33], // 电话号码, 括号生成, 组合总和, 全排列, 子集, 单词搜索
    templates: ['回溯模板：选择→递归→撤销', '剪枝优化'],
    commonMistakes: ['忘记撤销选择', '剪枝条件写错导致漏解', '收集结果的时机搞错'],
    tips: '回溯的本质是在决策树上做 DFS。想清楚三个问题：① 每层做什么选择 ② 什么时候结束 ③ 什么时候剪枝。',
  },
  {
    id: 'binary-search',
    name: '二分查找',
    description: '左闭右开 vs 左闭右闭的边界处理',
    order: 11,
    problemIds: [4, 16, 17, 34, 55, 56], // 寻找中位数, 搜索旋转数组, 查找第一个和最后一个, 搜索旋转II, 寻找最小值, 寻找最小值II
    templates: ['标准二分', '左边界二分', '右边界二分'],
    commonMistakes: ['区间定义不一致导致死循环', '边界条件写错'],
    tips: '二分查找的关键是确定区间定义（左闭右闭 or 左闭右开），然后始终遵守这个定义。',
  },
  {
    id: 'stack',
    name: '栈',
    description: '单调栈思想',
    order: 12,
    problemIds: [11, 15, 35, 36, 57, 84, 100], // 有效的括号, 最长有效括号, 柱状图最大矩形, 最大矩形, 最小栈, 字符串解码, 每日温度
    templates: ['括号匹配', '单调栈', '栈模拟'],
    commonMistakes: ['单调栈的比较方向搞反', '栈为空时没有特殊处理'],
    tips: '栈的经典应用：括号匹配、表达式求值、单调栈求下一个更大/更小元素。',
  },
  {
    id: 'heap',
    name: '堆',
    description: '优先队列、Top-K 问题',
    order: 13,
    problemIds: [65, 83], // 第K个最大元素, 前K个高频元素
    templates: ['Top-K 用小顶堆', '求中位数用大顶堆+小顶堆'],
    commonMistakes: ['大顶堆和小顶堆用混', '堆的大小搞错'],
    tips: '堆的核心应用是动态求最大/最小值。Top-K 问题用大小为 K 的堆。',
  },
  {
    id: 'greedy',
    name: '贪心',
    description: '局部最优推出全局最优',
    order: 14,
    problemIds: [24, 45, 86, 98], // 跳跃游戏, 买卖股票, 根据身高重建队列, 任务调度器
    templates: ['排序 + 贪心', '区间贪心'],
    commonMistakes: ['没有证明贪心的正确性就用贪心', '把应该用 DP 的题用了贪心'],
    tips: '贪心没有固定模板，关键是找到"局部最优策略"并证明它能推出全局最优。',
  },
  {
    id: 'dp',
    name: '动态规划',
    description: 'dp 数组定义、状态转移方程',
    order: 15,
    problemIds: [28, 49, 54, 60, 73, 77, 78, 80, 82, 87, 92], // 爬楼梯, 单词拆分, 最长递增子序列, 打家劫舍, 完全平方数, 含冷冻期, 零钱兑换, 比特位计数, 乘积最大子数组, 分割等和子集, 目标和
    templates: ['动规五步曲', '记忆化搜索'],
    commonMistakes: ['dp 数组含义没想清楚就开始写代码', '初始化搞错', '遍历顺序搞反'],
    tips: 'DP 的核心是"状态定义"和"状态转移"。先把 dp[i] 的含义想清楚，递推公式自然就出来了。',
  },
  {
    id: 'multi-dp',
    name: '多维动态规划',
    description: '二维 dp 的遍历顺序',
    order: 16,
    problemIds: [5, 6, 26, 27, 29, 66, 79, 99], // 最长回文子串, 正则匹配, 不同路径, 最小路径和, 编辑距离, 最大正方形, 戳气球, 回文子串
    templates: ['二维 dp 数组', '滚动数组优化'],
    commonMistakes: ['遍历顺序搞错导致依赖值还没算', 'dp 数组大小多开或少开一格'],
    tips: '二维 DP 的关键是确定遍历顺序：dp[i][j] 依赖哪些格子，就先算那些格子。',
  },
  {
    id: 'techniques',
    name: '技巧',
    description: '位运算、数学技巧',
    order: 17,
    problemIds: [14, 30, 48, 59, 75, 90, 91, 96], // 下一个排列, 颜色分类, 只出现一次的数字, 多数元素, 寻找重复数, 汉明距离, 消失的数字, 最短无序子数组
    templates: ['异或去重', '摩尔投票'],
    commonMistakes: ['位运算优先级搞错', '异或的性质记混'],
    tips: '技巧题需要积累。异或的性质（a^a=0, a^0=a）是位运算题的基础。',
  },
];

export function getStageByProblemId(problemId: number): LearningStage | undefined {
  return learningPath.find((stage) => stage.problemIds.includes(problemId));
}

export function getOrderedProblemIds(): number[] {
  return learningPath.flatMap((stage) => stage.problemIds);
}

export function getNextProblem(currentProblemId: number): number | null {
  const orderedProblemIds = getOrderedProblemIds();
  const idx = orderedProblemIds.indexOf(currentProblemId);
  if (idx === -1 || idx + 1 >= orderedProblemIds.length) {
    return null;
  }
  return orderedProblemIds[idx + 1];
}

export function getPreviousProblem(currentProblemId: number): number | null {
  const orderedProblemIds = getOrderedProblemIds();
  const idx = orderedProblemIds.indexOf(currentProblemId);
  if (idx <= 0) {
    return null;
  }
  return orderedProblemIds[idx - 1];
}
