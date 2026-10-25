// Shared difficulty config — single source of truth
export const difficultyConfig = {
  '简单': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '中等': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '困难': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
} as const;

export const categoryIcons: Record<string, string> = {
  '哈希': '#',
  '双指针': '↔',
  '滑动窗口': '□',
  '链表': '→',
  '二叉树': '🌲',
  '动态规划': '📊',
  '回溯': '🔄',
  '贪心': '💰',
  '栈': '📚',
  '堆': '⛰️',
  '图论': '🗺️',
  '前缀树': '🌿',
  '二分查找': '🔍',
  '普通数组': '▦',
  '矩阵': '🔲',
  '子串': '🔤',
  '前缀和': '➕',
  '单调队列': '🚃',
  '多维动态规划': '🧮',
  '技巧': '🧠',
};
