'use client';

import { Problem } from '@/types';

interface MethodologyCardProps {
  problem: Problem;
}

type Methodology = {
  icon: string;
  title: string;
  subtitle: string;
  items: { title: string; desc: string }[];
};

export default function MethodologyCard({ problem }: MethodologyCardProps) {
  if (problem.category === '动态规划' && problem.dpSteps) {
    return <DPMethodology steps={problem.dpSteps} />;
  }

  return <GeneralMethodology problem={problem} />;
}

function DPMethodology({ steps }: { steps: NonNullable<Problem['dpSteps']> }) {
  const stepItems = [
    { num: 1, title: '确定 dp 数组含义', content: steps.dpDefinition, icon: '📐' },
    { num: 2, title: '确定递推公式', content: steps.recurrence, icon: '📝' },
    { num: 3, title: 'dp 数组初始化', content: steps.initialization, icon: '🏁' },
    { num: 4, title: '确定遍历顺序', content: steps.traversalOrder, icon: '➡️' },
    { num: 5, title: '举例推导 dp 数组', content: steps.exampleDerivation, icon: '📊' },
  ];

  return (
    <div className="study-card methodology-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-black text-slate-950">动规五步曲</h3>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">按照代码随想录的方法，系统分析动态规划问题。</p>
      </div>

      <div className="methodology-body grid gap-4 p-6">
        {stepItems.map((step) => (
          <div key={step.num} className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
                {step.num}
              </div>
              <span className="text-sm font-black text-slate-950">{step.icon} {step.title}</span>
            </div>
            <div className="whitespace-pre-wrap px-4 py-3 text-sm leading-7 text-slate-600">
              {step.content}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-amber-600">💡</span>
            <span className="text-sm font-black text-amber-800">调试技巧</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-amber-700">{steps.debugTip}</p>
        </div>
      </div>
    </div>
  );
}

function GeneralMethodology({ problem }: { problem: Problem }) {
  const methodology = getMethodologyForCategory(problem.category);

  return (
    <div className="study-card methodology-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{methodology.icon}</span>
          <h3 className="font-black text-slate-950">{methodology.title}</h3>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{methodology.subtitle}</p>
      </div>

      <div className="methodology-body grid gap-4 p-6">
        {methodology.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-600 ring-1 ring-slate-200">
              {idx + 1}
            </div>
            <div>
              <div className="mb-1 text-sm font-black text-slate-950">{item.title}</div>
              <div className="text-sm leading-7 text-slate-600">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getMethodologyForCategory(category: string): Methodology {
  const methodologies: Record<string, Methodology> = {
    '哈希': {
      icon: '#',
      title: '哈希表方法论',
      subtitle: '用空间换时间，核心是快速查找、计数和去重。',
      items: [
        { title: '先问：我要快速查什么？', desc: '常见需求是判断某个值是否存在、某个值出现几次、某个值对应哪个下标。' },
        { title: '确定 key 和 value', desc: 'key 通常放“被查找的对象”，value 放下标、次数或附加状态。不要只写 map，要说清楚 map 的含义。' },
        { title: '决定先查还是先存', desc: '找“之前出现过的”通常先查再存；统计全局频次通常先整体计数。顺序错了容易把当前元素自己匹配掉。' },
        { title: '复盘迁移', desc: '看到配对、去重、频次、快速存在性判断，就优先联想到哈希表。' },
      ],
    },
    '双指针': {
      icon: '↔',
      title: '双指针方法论',
      subtitle: '两个指针分工明确，用移动规则排除不可能答案。',
      items: [
        { title: '先确定指针类型', desc: '同向快慢指针常用于原地覆盖、链表中点和环；相向指针常用于有序数组、两端收缩和面积问题。' },
        { title: '写清楚每个指针的含义', desc: 'left/right/slow/fast 不只是变量名，要说明它们维护的区间或职责。' },
        { title: '指针为什么能移动', desc: '移动某个指针必须能排除一批不可能答案，不能靠直觉。' },
        { title: '边界条件单独验证', desc: '空数组、一个元素、两个元素、重复元素，都是双指针常见出错点。' },
      ],
    },
    '滑动窗口': {
      icon: '▣',
      title: '滑动窗口方法论',
      subtitle: '连续子串/子数组问题，重点是窗口扩大和收缩。',
      items: [
        { title: '窗口表示什么', desc: '明确窗口 [left, right] 或 [left, right) 里保存的是当前候选子串/子数组。' },
        { title: 'right 什么时候扩', desc: '通常每轮纳入一个新元素，并同步更新窗口内的计数、和或集合。' },
        { title: 'left 什么时候缩', desc: '当窗口不满足条件，或已经满足条件且要找最短答案时，移动 left 并维护窗口状态。' },
        { title: '答案何时更新', desc: '求最长多在窗口合法时更新；求最短多在窗口满足条件后边收缩边更新。' },
      ],
    },
    '链表': {
      icon: '→',
      title: '链表方法论',
      subtitle: '画图、虚拟头节点、保存 next，避免断链。',
      items: [
        { title: '先画节点和指针', desc: '链表题不要只在脑中想。把 prev、cur、next、dummy 的位置都画出来。' },
        { title: '考虑 dummy 节点', desc: '头节点可能被删除、插入或改变时，用 dummy 统一处理头部边界。' },
        { title: '改指针前先存 next', desc: '反转、删除、交换节点时，先保存后续节点，否则链表会断。' },
        { title: '返回哪个节点', desc: '最后返回 head、dummy.next、prev 还是 slow，需要和题目目标对应起来。' },
      ],
    },
    '二叉树': {
      icon: '🌲',
      title: '二叉树递归三部曲',
      subtitle: '确定函数含义、终止条件、单层递归逻辑。',
      items: [
        { title: '确定递归函数参数和返回值', desc: '先说清楚函数处理哪棵子树，返回什么信息。返回值不清楚，代码一定会乱。' },
        { title: '确定终止条件', desc: '空节点、叶子节点、找到目标等情况要先写出来。' },
        { title: '确定单层递归逻辑', desc: '当前节点要做什么？左右子树分别返回什么？当前层如何合并左右结果？' },
        { title: '选择遍历顺序', desc: '前序适合自顶向下传状态，后序适合自底向上收集信息，层序适合按层处理。' },
      ],
    },
    '回溯': {
      icon: '🔄',
      title: '回溯三部曲',
      subtitle: '把问题抽象成树：参数、终止条件、单层搜索。',
      items: [
        { title: '确定回溯函数参数', desc: 'path 表示当前路径，start/used/index 控制下一层能选什么。参数就是递归状态。' },
        { title: '确定终止条件', desc: '什么时候收集答案？是 path 长度够了、目标和为 0，还是已经遍历完？' },
        { title: '确定单层搜索逻辑', desc: 'for 循环横向遍历选择，递归纵向深入，递归回来撤销选择。' },
        { title: '考虑剪枝', desc: '排序、剩余和、重复元素、非法路径都可以剪枝，但剪枝条件不能漏掉正确答案。' },
      ],
    },
    '贪心': {
      icon: '💰',
      title: '贪心方法论',
      subtitle: '找到局部最优，并说明为什么能推出全局最优。',
      items: [
        { title: '定义局部最优', desc: '每一步到底贪什么？最大、最小、最早结束、覆盖最远，必须具体。' },
        { title: '尝试推出全局最优', desc: '说明每一步局部选择不会损失最终最优解，必要时用交换论证。' },
        { title: '检查反例', desc: '如果局部最优可能被未来选择推翻，就不能直接贪心，可能要 DP 或搜索。' },
        { title: '实现时关注排序', desc: '很多贪心题先排序，排序规则就是贪心策略的一部分。' },
      ],
    },
    '动态规划': {
      icon: '📊',
      title: '动规五步曲',
      subtitle: '状态定义比代码更重要，先推清楚再实现。',
      items: [
        { title: '确定 dp 数组以及下标含义', desc: 'dp[i] 或 dp[i][j] 表示什么必须一句话说清，不能只写“记录结果”。' },
        { title: '确定递推公式', desc: '当前状态从哪些历史状态转移而来？选择与不选择分别对应什么？' },
        { title: 'dp 数组初始化', desc: '初始化是递推的起点，尤其注意 0、1、空字符串、第一行第一列。' },
        { title: '确定遍历顺序', desc: '必须保证依赖的状态已经算过。背包问题尤其要区分正序和倒序。' },
        { title: '举例推导 dp 数组', desc: '用小样例手推一遍，检查递推公式和初始化是否一致。' },
      ],
    },
    '多维动态规划': {
      icon: '🧮',
      title: '二维 / 多维 DP 方法论',
      subtitle: '先定状态维度，再看依赖方向。',
      items: [
        { title: '状态维度来自什么', desc: '两个字符串、二维网格、左右区间、两个约束，通常会自然形成二维或多维状态。' },
        { title: '画出依赖方向', desc: 'dp[i][j] 依赖左、上、左上，还是依赖更短区间？依赖方向决定遍历顺序。' },
        { title: '处理边界行列', desc: '第一行、第一列、空串、长度为 1 的区间最容易漏。' },
        { title: '再谈空间优化', desc: '先写二维表保证正确，再根据依赖关系考虑滚动数组。' },
      ],
    },
    '二分查找': {
      icon: '🔍',
      title: '二分查找方法论',
      subtitle: '统一区间定义，保持循环不变量。',
      items: [
        { title: '先确认单调性', desc: '二分不是只用于有序数组，本质是答案空间或判断函数具有单调性。' },
        { title: '统一区间定义', desc: '左闭右闭 [left,right] 或左闭右开 [left,right)，选一种后全程不变。' },
        { title: '写出收缩规则', desc: 'mid 满足条件时，到底保留 mid 还是排除 mid，取决于找的是目标值、左边界还是右边界。' },
        { title: '防止死循环', desc: '更新 left/right 必须让区间变小；找右边界时 mid 取法要特别小心。' },
      ],
    },
    '栈': {
      icon: '📚',
      title: '栈 / 单调栈方法论',
      subtitle: '栈保存“还没解决的问题”，当前元素负责结算。',
      items: [
        { title: '栈里存什么', desc: '可能存值、下标、节点或状态。单调栈通常存下标，因为要计算距离或面积。' },
        { title: '保持什么单调性', desc: '递增栈还是递减栈，要根据“找下一个更大/更小”决定。' },
        { title: '何时弹栈', desc: '当前元素能解决栈顶元素时弹栈，并在弹栈时更新答案。' },
        { title: '边界哨兵', desc: '柱状图、括号类题常用哨兵简化边界，例如 -1 下标或末尾补 0。' },
      ],
    },
    '堆': {
      icon: '⛰️',
      title: '堆方法论',
      subtitle: '动态维护最大/最小值，尤其适合 Top-K。',
      items: [
        { title: '明确要动态取什么', desc: '如果过程中反复要最大值或最小值，堆就是候选工具。' },
        { title: 'Top-K 用反向堆', desc: '求前 K 大常维护大小为 K 的小顶堆；求前 K 小常维护大顶堆。' },
        { title: '控制堆大小', desc: '堆大小决定空间和每次调整成本。Top-K 不一定要把所有元素都放进堆。' },
        { title: '注意 Python3.9 写法', desc: 'Python3.9 heapq 是小顶堆，大顶堆通常存负数或自定义比较。' },
      ],
    },
    '图论': {
      icon: '🗺️',
      title: '图论方法论',
      subtitle: '先建图，再遍历；visited 是防止重复访问的核心。',
      items: [
        { title: '先明确节点和边', desc: '题目里的字符串、课程、岛屿格子、变量都可能是节点；关系就是边。' },
        { title: '选择 DFS / BFS', desc: 'DFS 适合连通性和深度搜索，BFS 适合最短步数和按层扩散。' },
        { title: '维护 visited', desc: '图有环时必须标记访问状态，否则会死循环或重复计算。' },
        { title: '拓扑排序看入度', desc: '有依赖关系且要判断能否完成/给出顺序时，优先想到拓扑排序。' },
      ],
    },
    '前缀树': {
      icon: '🌿',
      title: 'Trie 前缀树方法论',
      subtitle: '把字符串拆成字符路径，用节点标记完整单词。',
      items: [
        { title: '节点字段先设计清楚', desc: 'children 保存下一层字符边，is_end / isWord 标记是否是完整单词结束。' },
        { title: 'insert 是逐字符下钻', desc: '每读一个字符，如果不存在子节点就创建，然后移动到该子节点；最后设置 is_end。' },
        { title: 'search 和 startsWith 要区分', desc: 'search 走完路径后必须检查 is_end；startsWith 只需要确认前缀路径存在。' },
        { title: '用前缀样例防错', desc: '插入 apple 后，search(app) 应为 false，startsWith(app) 应为 true，除非 app 也被插入。' },
      ],
    },
    '前缀和': {
      icon: '➕',
      title: '前缀和方法论',
      subtitle: '把区间和转成两个前缀和的差，再用哈希表加速统计。',
      items: [
        { title: '定义 prefix 的含义', desc: 'prefix[i] 表示前 i 个元素的和，还是到下标 i 为止的和，必须统一。' },
        { title: '把区间条件改写成差值', desc: '子数组和为 k 等价于 currentPrefix - previousPrefix = k。' },
        { title: '哈希表记录出现次数', desc: '统计数量时 map[prefix] 存次数；判断存在性时可以存最早下标或布尔值。' },
        { title: '初始化很关键', desc: 'count[0] = 1 表示空前缀，能覆盖从下标 0 开始的子数组。' },
      ],
    },
    '单调队列': {
      icon: '🚃',
      title: '单调队列方法论',
      subtitle: '用双端队列维护窗口内仍有机会成为最值的候选下标。',
      items: [
        { title: '队列里通常存下标', desc: '存下标才能判断是否过期，也能回到原数组取值。' },
        { title: '先移除过期元素', desc: '窗口左边界右移后，队首如果已经不在窗口内，必须先弹出。' },
        { title: '再维护单调性', desc: '求最大值维护递减队列；新元素进入时，从队尾弹出所有更小或不更优的候选。' },
        { title: '队首就是当前答案', desc: '窗口形成后，队首下标对应的值就是当前窗口最大/最小值。' },
      ],
    },
    '普通数组': {
      icon: '▦',
      title: '数组方法论',
      subtitle: '下标、区间和原地修改是数组题核心。',
      items: [
        { title: '定义下标含义', desc: 'i、j、left、right、write 分别表示什么，要和区间含义绑定。' },
        { title: '先处理边界', desc: '空数组、单元素、首尾元素、区间闭合方式都会影响代码。' },
        { title: '区间问题先排序', desc: '合并区间、插入区间、重叠判断，通常先按左端点或右端点排序。' },
        { title: '原地修改防覆盖', desc: '如果题目要求原地，使用写指针或从后往前写，避免覆盖未处理数据。' },
      ],
    },
    '矩阵': {
      icon: '🔲',
      title: '矩阵方法论',
      subtitle: '二维遍历顺序和边界收缩最重要。',
      items: [
        { title: '坐标含义先统一', desc: 'row/col、i/j、m/n 不要混用。先写清楚行数和列数。' },
        { title: '选择遍历方向', desc: '按行、按列、对角线、四方向扩散、螺旋遍历，都要先画路径。' },
        { title: '边界收缩要同步', desc: '上下左右边界变动时，注意是否会重复访问同一行或同一列。' },
        { title: '原地标记要避开冲突', desc: '矩阵题常用原地标记，但要避免标记值和原始值混淆。' },
      ],
    },
    '子串': {
      icon: '🔤',
      title: '子串问题方法论',
      subtitle: '先确认连续性，再选滑动窗口、前缀和或 DP。',
      items: [
        { title: '区分子串和子序列', desc: '子串必须连续；子序列可以不连续。选错模型会直接做错。' },
        { title: '连续且有窗口性质', desc: '最长/最短连续区间满足某条件，多数考虑滑动窗口。' },
        { title: '连续且看区间和', desc: '和为 K、区间统计类题，经常用前缀和 + 哈希表。' },
        { title: '回文子串常用中心扩展或 DP', desc: '回文问题要关注左右两端是否相等，以及内部子串状态。' },
      ],
    },
    '技巧': {
      icon: '🧠',
      title: '技巧题方法论',
      subtitle: '识别隐藏性质：异或、投票、原地交换、数学规律。',
      items: [
        { title: '先找特殊限制', desc: '只出现一次、数字范围 1..n、只能 O(1) 空间，这些限制往往暗示技巧。' },
        { title: '位运算看异或性质', desc: 'a ^ a = 0，a ^ 0 = a，适合成对抵消。' },
        { title: '多数元素看摩尔投票', desc: '如果某元素超过一半，可以用抵消思想维护候选人。' },
        { title: '原地技巧先保证不丢信息', desc: '交换、取负标记、环形替换都要检查是否会覆盖尚未处理的数据。' },
      ],
    },
  };

  return methodologies[category] || {
    icon: '💡',
    title: '通用解题方法论',
    subtitle: '先暴力、再观察、后优化。',
    items: [
      { title: '先写暴力解法', desc: '不要急着套模板，先用最直觉的方式保证能解出来。' },
      { title: '观察性能瓶颈', desc: '找重复计算、重复查找、无效枚举和边界混乱。' },
      { title: '选择优化工具', desc: '根据瓶颈选择哈希、双指针、DP、栈、堆或搜索。' },
      { title: '复盘迁移条件', desc: '总结下次看到什么特征，能联想到同一套方法。' },
    ],
  };
}
