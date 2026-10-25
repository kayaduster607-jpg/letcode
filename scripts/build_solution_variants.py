#!/usr/bin/env python3
"""Generate the Hot100 multi-solution catalog used by the teaching UI."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_problems():
    text = (ROOT / 'src/data/problems.ts').read_text(encoding='utf-8')
    match = re.search(r'export const problems: Problem\[\] = (\[[\s\S]*?\n\]);', text)
    if not match:
        raise RuntimeError('Cannot parse problems.ts')
    return json.loads(match.group(1))


def v(name: str, badge: str, idea: str, time: str, space: str, detail: str, code: str, notes: list[str] | None = None):
    return {
        'name': name,
        'badge': badge,
        'idea': idea,
        'time': time,
        'space': space,
        'complexityDetail': detail,
        'code': code.strip('\n'),
        'notes': notes or [],
    }


BASIC: dict[int, dict] = {
1: v('暴力双循环', '暴力', '枚举第一个下标 i，再枚举它后面的下标 j，检查两数之和。', 'O(n^2)', 'O(1)', '两层循环最多检查 n(n-1)/2 对元素，不使用额外数据结构。', r'''
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []
''', ['适合读题建模，不适合面试最终提交。']),
2: v('转整数再相加', '基础', '把逆序链表还原成整数，相加后再拆成链表；Python3.9 不溢出，但这个思路不能迁移到定长整数语言。', 'O(m+n+L)', 'O(L)', 'm、n 是两个链表长度，L 是答案位数；需要新建答案链表。', r'''
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        def to_number(node):
            base = 1
            num = 0
            while node:
                num += node.val * base
                base *= 10
                node = node.next
            return num

        total = to_number(l1) + to_number(l2)
        dummy = ListNode(0)
        cur = dummy
        if total == 0:
            return ListNode(0)
        while total:
            cur.next = ListNode(total % 10)
            cur = cur.next
            total //= 10
        return dummy.next
''', ['能帮助理解逆序链表含义，但面试推荐逐位相加。']),
3: v('枚举起点并扩展', '暴力', '固定左端点，从左往右扩展，遇到重复字符就停止。', 'O(n^2)', 'O(min(n,字符集大小))', '每个起点最多向右扫描 n 次，集合保存当前子串字符。', r'''
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        ans = 0
        for left in range(len(s)):
            seen = set()
            for right in range(left, len(s)):
                if s[right] in seen:
                    break
                seen.add(s[right])
                ans = max(ans, right - left + 1)
        return ans
'''),
4: v('合并后取中位数', '基础', '像归并排序一样合并两个有序数组，再直接取中位数。', 'O(m+n)', 'O(m+n)', '需要完整合并数组，总长度为 m+n。', r'''
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        merged = []
        i = j = 0
        while i < len(nums1) or j < len(nums2):
            if j == len(nums2) or (i < len(nums1) and nums1[i] <= nums2[j]):
                merged.append(nums1[i])
                i += 1
            else:
                merged.append(nums2[j])
                j += 1
        n = len(merged)
        if n % 2:
            return float(merged[n // 2])
        return (merged[n // 2 - 1] + merged[n // 2]) / 2
'''),
5: v('暴力枚举所有子串', '暴力', '枚举每个子串，判断它是否为回文，记录最长长度。', 'O(n^3)', 'O(1)', '子串数量 O(n^2)，每次判断回文最坏 O(n)。', r'''
class Solution:
    def longestPalindrome(self, s: str) -> str:
        def is_pal(left, right):
            while left < right:
                if s[left] != s[right]:
                    return False
                left += 1
                right -= 1
            return True

        ans = ''
        for i in range(len(s)):
            for j in range(i, len(s)):
                if j - i + 1 > len(ans) and is_pal(i, j):
                    ans = s[i:j + 1]
        return ans
'''),
6: v('递归记忆化匹配', '备选', '定义 dfs(i,j) 表示 s[i:] 能否匹配 p[j:]，遇到 * 时分“使用 0 次”和“使用至少 1 次”。', 'O(mn)', 'O(mn)', '状态是 i、j 的组合，记忆化后每个状态只计算一次。', r'''
from functools import lru_cache

class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        @lru_cache(None)
        def dfs(i, j):
            if j == len(p):
                return i == len(s)

            first = i < len(s) and (p[j] == s[i] or p[j] == '.')
            if j + 1 < len(p) and p[j + 1] == '*':
                return dfs(i, j + 2) or (first and dfs(i + 1, j))
            return first and dfs(i + 1, j + 1)

        return dfs(0, 0)
'''),
7: v('暴力枚举两条边', '暴力', '枚举所有左右边界，面积由短板高度乘宽度决定。', 'O(n^2)', 'O(1)', '所有边界对数量是 O(n^2)。', r'''
class Solution:
    def maxArea(self, height: List[int]) -> int:
        ans = 0
        for i in range(len(height)):
            for j in range(i + 1, len(height)):
                ans = max(ans, min(height[i], height[j]) * (j - i))
        return ans
'''),
8: v('三重循环去重', '暴力', '枚举三个下标并用集合去重，能保证正确但复杂度太高。', 'O(n^3)', 'O(k)', 'k 是不同三元组数量，三重循环枚举所有组合。', r'''
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = set()
        for i in range(n):
            for j in range(i + 1, n):
                for k in range(j + 1, n):
                    if nums[i] + nums[j] + nums[k] == 0:
                        ans.add(tuple(sorted((nums[i], nums[j], nums[k]))))
        return [list(item) for item in sorted(ans)]
'''),
9: v('队列逐层扩展', '基础', '把当前答案列表看成队列，读到一个数字就给已有字符串追加该数字对应的每个字母。', 'O(4^n)', 'O(4^n)', '最终答案本身最多 4^n 个，空间主要来自结果集。', r'''
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        mp = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
        ans = ['']
        for d in digits:
            ans = [prefix + ch for prefix in ans for ch in mp[d]]
        return ans
'''),
10: v('两次遍历求长度', '基础', '第一次遍历得到链表长度，第二次走到倒数第 n 个结点的前一个结点并删除。', 'O(L)', 'O(1)', '虽然遍历两次，但总访问次数仍然是线性的。', r'''
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        length = 0
        cur = head
        while cur:
            length += 1
            cur = cur.next

        cur = dummy
        for _ in range(length - n):
            cur = cur.next
        cur.next = cur.next.next
        return dummy.next
'''),
11: v('反复消除相邻括号', '暴力', '不断删除字符串里的 "()"、"[]"、"{}"，最后为空则合法。', 'O(n^2)', 'O(n)', '每轮替换要扫描字符串，最坏需要 O(n) 轮。', r'''
class Solution:
    def isValid(self, s: str) -> bool:
        old = None
        while old != s:
            old = s
            s = s.replace('()', '').replace('[]', '').replace('{}', '')
        return s == ''
'''),
12: v('递归合并', '备选', '每次取两个链表头中较小的一个，剩余部分递归合并。', 'O(m+n)', 'O(m+n)', '每个节点处理一次，递归栈深度最多 m+n。', r'''
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if not list1:
            return list2
        if not list2:
            return list1
        if list1.val <= list2.val:
            list1.next = self.mergeTwoLists(list1.next, list2)
            return list1
        list2.next = self.mergeTwoLists(list1, list2.next)
        return list2
'''),
13: v('生成全部再过滤', '暴力', '先生成所有长度为 2n 的括号串，再检查是否合法。', 'O(2^(2n) * n)', 'O(n)', '共有 2^(2n) 个候选串，每个校验需要 O(n)。', r'''
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        def valid(path):
            bal = 0
            for ch in path:
                bal += 1 if ch == '(' else -1
                if bal < 0:
                    return False
            return bal == 0

        def dfs(path):
            if len(path) == 2 * n:
                if valid(path):
                    ans.append(path)
                return
            dfs(path + '(')
            dfs(path + ')')

        dfs('')
        return ans
'''),
14: v('找下一个更大排列并排序后缀', '基础', '找到第一个可增大的位置，交换后把右侧后缀升序排列。', 'O(n log n)', 'O(n)', '排序后缀的成本是 O(n log n)，Python3.9 切片会产生额外空间。', r'''
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = len(nums) - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        nums[i + 1:] = sorted(nums[i + 1:])
'''),
15: v('动态规划', '备选', 'dp[i] 表示以下标 i 结尾的最长有效括号长度，遇到右括号时向前找能匹配的左括号。', 'O(n)', 'O(n)', '每个位置只计算一次，dp 数组保存状态。', r'''
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        dp = [0] * len(s)
        ans = 0
        for i in range(1, len(s)):
            if s[i] == ')':
                pre = i - dp[i - 1] - 1
                if pre >= 0 and s[pre] == '(':
                    dp[i] = dp[i - 1] + 2
                    if pre > 0:
                        dp[i] += dp[pre - 1]
                    ans = max(ans, dp[i])
        return ans
'''),
16: v('线性扫描', '基础', '从左到右找 target，不利用旋转数组的有序结构。', 'O(n)', 'O(1)', '最坏情况下要看完所有元素。', r'''
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i, x in enumerate(nums):
            if x == target:
                return i
        return -1
'''),
17: v('线性查找左右边界', '基础', '扫描数组，第一次遇到 target 记左边界，之后不断更新右边界。', 'O(n)', 'O(1)', '没有利用数组有序性，因此最坏扫描完整数组。', r'''
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        left = right = -1
        for i, x in enumerate(nums):
            if x == target:
                if left == -1:
                    left = i
                right = i
        return [left, right]
'''),
18: v('选/不选递归', '基础', '对每个候选数做选或不选；选中后因为可以重复使用，所以递归仍停在当前下标。', '指数级', 'O(target/min(candidates))', '递归树规模与 target 和候选数组相关，最坏为指数级。', r'''
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        ans = []
        path = []

        def dfs(i, rest):
            if rest == 0:
                ans.append(path[:])
                return
            if i == len(candidates) or rest < 0:
                return
            dfs(i + 1, rest)
            path.append(candidates[i])
            dfs(i, rest - candidates[i])
            path.pop()

        dfs(0, target)
        return ans
'''),
19: v('每格向两边找最高墙', '暴力', '对每个位置分别扫描左侧最高墙和右侧最高墙，能接的水由较矮墙决定。', 'O(n^2)', 'O(1)', '每个位置都可能向左右各扫描一遍。', r'''
class Solution:
    def trap(self, height: List[int]) -> int:
        ans = 0
        n = len(height)
        for i in range(n):
            left_max = max(height[:i + 1])
            right_max = max(height[i:])
            ans += min(left_max, right_max) - height[i]
        return ans
'''),
20: v('交换法回溯', '备选', '把当前位置与后面的每个位置交换，递归确定下一位。', 'O(n! * n)', 'O(n)', '有 n! 个排列，复制每个排列需要 O(n)。', r'''
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        ans = []
        def dfs(start):
            if start == len(nums):
                ans.append(nums[:])
                return
            for i in range(start, len(nums)):
                nums[start], nums[i] = nums[i], nums[start]
                dfs(start + 1)
                nums[start], nums[i] = nums[i], nums[start]
        dfs(0)
        return ans
'''),
21: v('额外矩阵', '基础', '新建矩阵，把原矩阵 (i,j) 放到旋转后 (j,n-1-i)。', 'O(n^2)', 'O(n^2)', '每个格子移动一次，但使用了额外矩阵。', r'''
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        rotated = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                rotated[j][n - 1 - i] = matrix[i][j]
        for i in range(n):
            matrix[i][:] = rotated[i]
'''),
22: v('排序字符串作为 key', '推荐', '把每个字符串排序，异位词排序后结果相同，因此能分到同一组。', 'O(NKlogK)', 'O(NK)', 'N 是字符串数量，K 是平均长度；每个字符串排序成本 KlogK。', r'''
from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for s in strs:
            key = ''.join(sorted(s))
            groups[key].append(s)
        return list(groups.values())
'''),
23: v('枚举所有子数组', '暴力', '固定左端点，向右累计子数组和并更新最大值。', 'O(n^2)', 'O(1)', '子数组数量是 O(n^2)，滚动累加避免第三层求和。', r'''
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        ans = nums[0]
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                ans = max(ans, total)
        return ans
'''),
24: v('动态规划可达性', '基础', 'dp[i] 表示能否到达下标 i，再用前面的每个可达位置转移。', 'O(n^2)', 'O(n)', '每个位置都可能检查前面所有位置。', r'''
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        n = len(nums)
        dp = [False] * n
        dp[0] = True
        for i in range(n):
            if not dp[i]:
                continue
            for j in range(i + 1, min(n, i + nums[i] + 1)):
                dp[j] = True
        return dp[-1]
'''),
25: v('逐个插入并合并', '基础', '维护一个已合并区间列表，每来一个区间就和已有区间比较并合并。', 'O(n^2)', 'O(n)', '每插入一个区间都可能扫描当前结果列表。', r'''
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        ans = []
        for start, end in intervals:
            cur = [start, end]
            next_ans = []
            for a, b in ans:
                if b < cur[0] or cur[1] < a:
                    next_ans.append([a, b])
                else:
                    cur[0] = min(cur[0], a)
                    cur[1] = max(cur[1], b)
            next_ans.append(cur)
            ans = next_ans
        return ans
'''),
26: v('二维 DP', '基础', 'dp[i][j] 表示走到第 i 行第 j 列的路径数，只能从上方或左方转移。', 'O(mn)', 'O(mn)', '每个格子计算一次，保存整张 DP 表。', r'''
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
        return dp[-1][-1]
'''),
27: v('额外 DP 表', '基础', 'dp[i][j] 表示从左上角到当前位置的最小路径和。', 'O(mn)', 'O(mn)', '每个格子计算一次，额外保存 m*n 张表。', r'''
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [[0] * n for _ in range(m)]
        dp[0][0] = grid[0][0]
        for i in range(1, m):
            dp[i][0] = dp[i - 1][0] + grid[i][0]
        for j in range(1, n):
            dp[0][j] = dp[0][j - 1] + grid[0][j]
        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
        return dp[-1][-1]
'''),
28: v('递归记忆化', '基础', 'f(n)=f(n-1)+f(n-2)，用缓存避免重复递归。', 'O(n)', 'O(n)', '每个 n 只计算一次，递归栈和缓存都为 O(n)。', r'''
from functools import lru_cache

class Solution:
    def climbStairs(self, n: int) -> int:
        @lru_cache(None)
        def dfs(k):
            if k <= 2:
                return k
            return dfs(k - 1) + dfs(k - 2)
        return dfs(n)
'''),
29: v('递归记忆化', '基础', 'dfs(i,j) 表示 word1[i:] 到 word2[j:] 的编辑距离，尝试插入、删除、替换。', 'O(mn)', 'O(mn)', '状态数量为 m*n，每个状态常数次转移。', r'''
from functools import lru_cache

class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        @lru_cache(None)
        def dfs(i, j):
            if i == len(word1):
                return len(word2) - j
            if j == len(word2):
                return len(word1) - i
            if word1[i] == word2[j]:
                return dfs(i + 1, j + 1)
            return 1 + min(dfs(i + 1, j), dfs(i, j + 1), dfs(i + 1, j + 1))
        return dfs(0, 0)
'''),
30: v('计数排序', '基础', '统计 0、1、2 出现次数，再按顺序覆盖数组。', 'O(n)', 'O(1)', '只需要三个计数器，不依赖额外数组。', r'''
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        cnt0 = cnt1 = cnt2 = 0
        for x in nums:
            if x == 0:
                cnt0 += 1
            elif x == 1:
                cnt1 += 1
            else:
                cnt2 += 1
        nums[:cnt0] = [0] * cnt0
        nums[cnt0:cnt0 + cnt1] = [1] * cnt1
        nums[cnt0 + cnt1:] = [2] * cnt2
'''),
31: v('枚举所有窗口', '暴力', '枚举所有子串并检查是否覆盖 t。', 'O(n^2 * C)', 'O(C)', 'C 是字符集大小；每个窗口都要比较频次。', r'''
from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        best = ''
        for i in range(len(s)):
            window = Counter()
            for j in range(i, len(s)):
                window[s[j]] += 1
                if all(window[c] >= need[c] for c in need):
                    if not best or j - i + 1 < len(best):
                        best = s[i:j + 1]
                    break
        return best
'''),
32: v('位掩码枚举', '基础', '用二进制位表示每个元素选或不选，一共 2^n 种状态。', 'O(n * 2^n)', 'O(n * 2^n)', '每个子集复制最多 n 个元素，结果集本身也是指数级。', r'''
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []
        for mask in range(1 << n):
            cur = []
            for i in range(n):
                if mask & (1 << i):
                    cur.append(nums[i])
            ans.append(cur)
        return ans
'''),
33: v('DFS + 额外 visited', '基础', '从每个格子出发 DFS，用 visited 集合记录当前路径已经使用的格子。', 'O(mn * 4^L)', 'O(L)', 'L 是单词长度，每一步最多向四个方向扩展。', r'''
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        def dfs(i, j, k, visited):
            if k == len(word):
                return True
            if i < 0 or i >= m or j < 0 or j >= n:
                return False
            if (i, j) in visited or board[i][j] != word[k]:
                return False
            visited.add((i, j))
            ok = dfs(i + 1, j, k + 1, visited) or dfs(i - 1, j, k + 1, visited) or dfs(i, j + 1, k + 1, visited) or dfs(i, j - 1, k + 1, visited)
            visited.remove((i, j))
            return ok

        for i in range(m):
            for j in range(n):
                if dfs(i, j, 0, set()):
                    return True
        return False
'''),
34: v('线性扫描', '基础', '有重复值时二分会退化，最稳妥的基础做法是直接扫描。', 'O(n)', 'O(1)', '最坏需要看完整个数组。', r'''
class Solution:
    def search(self, nums: List[int], target: int) -> bool:
        for x in nums:
            if x == target:
                return True
        return False
'''),
35: v('以每根柱子为最矮柱扩展', '暴力', '固定每根柱子为矩形最矮高度，向左右扩到第一个更矮位置。', 'O(n^2)', 'O(1)', '每根柱子都可能向两侧扫描 O(n)。', r'''
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        ans = 0
        n = len(heights)
        for i, h in enumerate(heights):
            left = i
            while left - 1 >= 0 and heights[left - 1] >= h:
                left -= 1
            right = i
            while right + 1 < n and heights[right + 1] >= h:
                right += 1
            ans = max(ans, h * (right - left + 1))
        return ans
'''),
36: v('枚举上下边界压缩列', '基础', '枚举矩形上边界和下边界，把每列是否全为 1 压成数组，再找最长连续 1。', 'O(m^2n)', 'O(n)', '上下边界 O(m^2)，每次线性扫描列。', r'''
class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        if not matrix:
            return 0
        m, n = len(matrix), len(matrix[0])
        ans = 0
        for top in range(m):
            ok = [1] * n
            for bottom in range(top, m):
                for col in range(n):
                    ok[col] &= matrix[bottom][col] == '1'
                width = 0
                for val in ok:
                    width = width + 1 if val else 0
                    ans = max(ans, width * (bottom - top + 1))
        return ans
'''),
37: v('递归中序遍历', '基础', '按照左子树、根、右子树的顺序递归访问节点。', 'O(n)', 'O(h)', '每个节点访问一次，递归栈高度为树高 h。', r'''
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            ans.append(node.val)
            dfs(node.right)
        dfs(root)
        return ans
'''),
38: v('递归记忆化 Catalan', '基础', '以每个值作为根，左子树数量乘右子树数量，累加所有根的选择。', 'O(n^2)', 'O(n)', '状态 n 有 n 种根选择，缓存后共有 n 个状态。', r'''
from functools import lru_cache

class Solution:
    def numTrees(self, n: int) -> int:
        @lru_cache(None)
        def count(k):
            if k <= 1:
                return 1
            total = 0
            for left_size in range(k):
                total += count(left_size) * count(k - 1 - left_size)
            return total
        return count(n)
'''),
39: v('中序遍历后检查递增', '基础', 'BST 的中序遍历必须严格递增，先保存遍历结果再检查。', 'O(n)', 'O(n)', '每个节点访问一次，数组保存 n 个值。', r'''
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        vals = []
        def inorder(node):
            if not node:
                return
            inorder(node.left)
            vals.append(node.val)
            inorder(node.right)
        inorder(root)
        return all(vals[i] < vals[i + 1] for i in range(len(vals) - 1))
'''),
40: v('递归比较镜像节点', '推荐', '左子树的左边要和右子树的右边相等，左子树的右边要和右子树的左边相等。', 'O(n)', 'O(h)', '每个节点最多比较一次，递归栈深度为树高。', r'''
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def same(a, b):
            if not a or not b:
                return a is b
            return a.val == b.val and same(a.left, b.right) and same(a.right, b.left)
        return same(root.left, root.right) if root else True
'''),
41: v('DFS 按层收集', '备选', '递归时携带 depth，第一次到某一层就创建对应列表。', 'O(n)', 'O(h)', '每个节点访问一次，递归栈深度为树高；结果集不计入额外空间时为 O(h)。', r'''
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        ans = []
        def dfs(node, depth):
            if not node:
                return
            if depth == len(ans):
                ans.append([])
            ans[depth].append(node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return ans
'''),
42: v('BFS 层数统计', '备选', '按层遍历二叉树，遍历完一层深度加一。', 'O(n)', 'O(w)', 'w 是二叉树最大宽度，队列最多保存一层节点。', r'''
from collections import deque

class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        q = deque([root])
        depth = 0
        while q:
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            depth += 1
        return depth
'''),
43: v('递归切片构造', '基础', '每次用 preorder[0] 做根，在 inorder 中切出左右子树。', 'O(n^2)', 'O(n^2)', '每层查找根和切片都可能产生线性成本。', r'''
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder:
            return None
        root_val = preorder[0]
        idx = inorder.index(root_val)
        root = TreeNode(root_val)
        root.left = self.buildTree(preorder[1:1 + idx], inorder[:idx])
        root.right = self.buildTree(preorder[1 + idx:], inorder[idx + 1:])
        return root
'''),
44: v('前序收集再改指针', '基础', '先得到前序遍历节点列表，再按列表顺序把每个节点接到右指针。', 'O(n)', 'O(n)', '遍历一次，额外列表保存所有节点。', r'''
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        nodes = []
        def preorder(node):
            if not node:
                return
            nodes.append(node)
            preorder(node.left)
            preorder(node.right)
        preorder(root)
        for i in range(len(nodes) - 1):
            nodes[i].left = None
            nodes[i].right = nodes[i + 1]
'''),
45: v('暴力枚举买卖日', '暴力', '枚举买入日和卖出日，取最大利润。', 'O(n^2)', 'O(1)', '所有买卖日组合数量为 O(n^2)。', r'''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        ans = 0
        for buy in range(len(prices)):
            for sell in range(buy + 1, len(prices)):
                ans = max(ans, prices[sell] - prices[buy])
        return ans
'''),
46: v('递归求每个节点向下最大贡献', '推荐', '一个节点作为路径最高点时，只能从左右贡献中取正值；向父节点返回单边最大贡献。', 'O(n)', 'O(h)', '每个节点访问一次，递归栈深度为树高。', r'''
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        ans = float('-inf')
        def gain(node):
            nonlocal ans
            if not node:
                return 0
            left = max(gain(node.left), 0)
            right = max(gain(node.right), 0)
            ans = max(ans, node.val + left + right)
            return node.val + max(left, right)
        gain(root)
        return ans
'''),
47: v('排序后扫描', '基础', '排序后相邻的连续数字会挨在一起，跳过重复值并统计最长连续段。', 'O(n log n)', 'O(1) 或 O(n)', '排序是主要成本；Python3.9 排序可能使用额外空间。', r'''
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        if not nums:
            return 0
        nums.sort()
        ans = cur = 1
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                continue
            if nums[i] == nums[i - 1] + 1:
                cur += 1
            else:
                cur = 1
            ans = max(ans, cur)
        return ans
'''),
48: v('哈希计数', '基础', '统计每个数字出现次数，返回次数为 1 的数字。', 'O(n)', 'O(n)', '哈希表最多保存 n 个不同数字。', r'''
from collections import Counter

class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        cnt = Counter(nums)
        for x, c in cnt.items():
            if c == 1:
                return x
        return -1
'''),
49: v('DFS 记忆化', '备选', 'dfs(i) 表示 s[i:] 能否拆分，枚举下一个单词边界。', 'O(n^2)', 'O(n)', '有 n 个起点，每个起点枚举后续边界。', r'''
from functools import lru_cache

class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        @lru_cache(None)
        def dfs(i):
            if i == len(s):
                return True
            for j in range(i + 1, len(s) + 1):
                if s[i:j] in words and dfs(j):
                    return True
            return False
        return dfs(0)
'''),
50: v('哈希集合记录节点', '基础', '遍历链表，把访问过的节点对象放入集合；再次遇到说明有环。', 'O(n)', 'O(n)', '每个节点最多访问一次，集合最多保存 n 个节点。', r'''
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        seen = set()
        cur = head
        while cur:
            if cur in seen:
                return True
            seen.add(cur)
            cur = cur.next
        return False
'''),
51: v('哈希集合找入口', '基础', '第一次遇到已经访问过的节点，它就是环入口。', 'O(n)', 'O(n)', '集合保存访问过的节点。', r'''
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        seen = set()
        cur = head
        while cur:
            if cur in seen:
                return cur
            seen.add(cur)
            cur = cur.next
        return None
'''),
52: v('OrderedDict 实现', '基础', 'Python3.9 内置有序字典可以移动 key 到末尾，用来维护最近使用顺序。', 'O(1)', 'O(capacity)', 'get、put、move_to_end、popitem 都是均摊 O(1)。', r'''
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
'''),
53: v('数组排序后重建链表', '基础', '把链表值收集到数组，排序后重新写回链表。', 'O(n log n)', 'O(n)', '排序是主成本，数组保存 n 个值。', r'''
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        cur = head
        while cur:
            vals.append(cur.val)
            cur = cur.next
        vals.sort()
        cur = head
        for x in vals:
            cur.val = x
            cur = cur.next
        return head
'''),
54: v('枚举所有子数组乘积', '暴力', '固定左端点，向右累乘并更新最大乘积。', 'O(n^2)', 'O(1)', '子数组数量是 O(n^2)。', r'''
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        ans = nums[0]
        for i in range(len(nums)):
            prod = 1
            for j in range(i, len(nums)):
                prod *= nums[j]
                ans = max(ans, prod)
        return ans
'''),
55: v('线性找最小值', '基础', '直接扫描数组并记录最小值，不利用旋转有序性质。', 'O(n)', 'O(1)', '每个元素都要看一次。', r'''
class Solution:
    def findMin(self, nums: List[int]) -> int:
        ans = nums[0]
        for x in nums:
            ans = min(ans, x)
        return ans
'''),
56: v('线性找最小值', '基础', '有重复元素时，最简单稳妥的做法是直接扫描。', 'O(n)', 'O(1)', '每个元素都访问一次。', r'''
class Solution:
    def findMin(self, nums: List[int]) -> int:
        ans = nums[0]
        for x in nums:
            ans = min(ans, x)
        return ans
'''),
57: v('栈中存二元组', '基础', '每个元素入栈时，同时保存当前最小值。', 'O(1)', 'O(n)', '每次操作常数时间，栈额外保存 n 个当前最小值。', r'''
class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, val: int) -> None:
        cur_min = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, cur_min))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]
'''),
58: v('哈希集合记录 A 链表', '基础', '先把 A 链表所有节点放入集合，再遍历 B 找第一个出现过的节点。', 'O(m+n)', 'O(m)', 'A 链表节点都存入集合，B 链表线性扫描。', r'''
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        seen = set()
        cur = headA
        while cur:
            seen.add(cur)
            cur = cur.next
        cur = headB
        while cur:
            if cur in seen:
                return cur
            cur = cur.next
        return None
'''),
59: v('哈希计数', '基础', '统计每个数出现次数，超过 n/2 的就是多数元素。', 'O(n)', 'O(n)', '计数表最多保存 n 个不同元素。', r'''
from collections import Counter

class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        cnt = Counter(nums)
        for x, c in cnt.items():
            if c > len(nums) // 2:
                return x
        return nums[0]
'''),
60: v('二维含义 DP', '基础', 'dp[i] 表示偷到第 i 间房为止的最大金额，可选偷或不偷第 i 间。', 'O(n)', 'O(n)', '每个位置一次转移，数组保存所有状态。', r'''
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        if len(nums) == 1:
            return nums[0]
        dp = [0] * len(nums)
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])
        for i in range(2, len(nums)):
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
        return dp[-1]
'''),
61: v('DFS 淹岛', '推荐', '遇到陆地就 DFS 把整座岛标记为水，岛屿数量加一。', 'O(mn)', 'O(mn)', '每个格子最多访问一次，递归栈最坏为格子总数。', r'''
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        def dfs(i, j):
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
                return
            grid[i][j] = '0'
            dfs(i + 1, j)
            dfs(i - 1, j)
            dfs(i, j + 1)
            dfs(i, j - 1)

        ans = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    ans += 1
                    dfs(i, j)
        return ans
'''),
62: v('递归反转', '备选', '先反转 head.next 之后的链表，再把 head 接到尾部。', 'O(n)', 'O(n)', '每个节点处理一次，递归栈深度 n。', r'''
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        new_head = self.reverseList(head.next)
        head.next.next = head
        head.next = None
        return new_head
'''),
63: v('BFS 拓扑排序', '推荐', '统计每门课入度，先学入度为 0 的课，每学一门课就降低后继入度。', 'O(V+E)', 'O(V+E)', 'V 是课程数，E 是先修关系数。', r'''
from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        q = deque([i for i in range(numCourses) if indeg[i] == 0])
        learned = 0
        while q:
            cur = q.popleft()
            learned += 1
            for nxt in graph[cur]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return learned == numCourses
'''),
64: v('字典节点 Trie', '推荐', '每个节点用字典保存子节点，插入和查询都按字符逐层向下走。', 'O(L)', 'O(总字符数)', '单次操作 L 为单词或前缀长度；空间由插入的总字符数决定。', r'''
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True
'''),
65: v('排序取第 k 个', '基础', '直接排序数组，倒数第 k 个就是第 k 大。', 'O(n log n)', 'O(1) 或 O(n)', '排序是主要成本。', r'''
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        nums.sort()
        return nums[-k]
'''),
66: v('暴力枚举边长', '暴力', '把每个 1 当作正方形左上角，尝试扩大边长并检查区域是否全是 1。', 'O(mn * min(m,n)^3)', 'O(1)', '枚举起点和边长，并检查正方形内部。', r'''
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        best = 0
        for i in range(m):
            for j in range(n):
                max_len = min(m - i, n - j)
                for size in range(1, max_len + 1):
                    ok = True
                    for r in range(i, i + size):
                        for c in range(j, j + size):
                            if matrix[r][c] == '0':
                                ok = False
                    if ok:
                        best = max(best, size * size)
        return best
'''),
67: v('BFS 迭代翻转', '备选', '用队列遍历每个节点，访问到就交换左右孩子。', 'O(n)', 'O(w)', '每个节点交换一次，队列最多保存一层节点。', r'''
from collections import deque

class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        q = deque([root])
        while q:
            node = q.popleft()
            node.left, node.right = node.right, node.left
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        return root
'''),
68: v('复制到数组后双指针', '基础', '把链表值复制到数组，用左右指针判断数组是否回文。', 'O(n)', 'O(n)', '遍历链表一次，数组保存所有值。', r'''
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        vals = []
        while head:
            vals.append(head.val)
            head = head.next
        return vals == vals[::-1]
'''),
69: v('递归后序返回命中节点', '推荐', '如果左右子树都找到目标，当前节点就是最近公共祖先；否则把找到的一侧向上传。', 'O(n)', 'O(h)', '最坏访问所有节点，递归栈高度为树高。', r'''
class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left or right
'''),
70: v('左右乘积数组', '基础', '分别保存每个位置左边所有数乘积和右边所有数乘积，答案为二者相乘。', 'O(n)', 'O(n)', '两个辅助数组各长 n。', r'''
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        left = [1] * n
        right = [1] * n
        for i in range(1, n):
            left[i] = left[i - 1] * nums[i - 1]
        for i in range(n - 2, -1, -1):
            right[i] = right[i + 1] * nums[i + 1]
        return [left[i] * right[i] for i in range(n)]
'''),
71: v('暴力扫描每个窗口', '暴力', '对每个长度为 k 的窗口直接求最大值。', 'O(nk)', 'O(1)', '共有约 n 个窗口，每个窗口求最大值 O(k)。', r'''
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        for i in range(len(nums) - k + 1):
            ans.append(max(nums[i:i + k]))
        return ans
'''),
72: v('逐行二分', '基础', '每一行都是有序的，对每行分别二分查找 target。', 'O(m log n)', 'O(1)', 'm 行，每行二分 O(log n)。', r'''
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        for row in matrix:
            left, right = 0, len(row) - 1
            while left <= right:
                mid = (left + right) // 2
                if row[mid] == target:
                    return True
                if row[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1
        return False
'''),
73: v('BFS 最短路', '备选', '把数字 n 看成起点，每次减去一个完全平方数，第一次到 0 的层数就是答案。', 'O(n√n)', 'O(n)', '每个剩余值最多入队一次，每次枚举平方数。', r'''
from collections import deque

class Solution:
    def numSquares(self, n: int) -> int:
        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
        q = deque([(n, 0)])
        seen = {n}
        while q:
            cur, step = q.popleft()
            if cur == 0:
                return step
            for sq in squares:
                if sq > cur:
                    break
                nxt = cur - sq
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, step + 1))
        return n
'''),
74: v('额外数组', '基础', '先收集所有非零元素，再补零，最后覆盖原数组。', 'O(n)', 'O(n)', '额外数组保存非零元素。', r'''
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        arr = [x for x in nums if x != 0]
        arr += [0] * (len(nums) - len(arr))
        nums[:] = arr
'''),
75: v('哈希集合查重', '基础', '遍历数组，第一个第二次出现的数字就是重复数。', 'O(n)', 'O(n)', '集合最多保存 n 个数字，但不符合题目常见的 O(1) 空间进阶要求。', r'''
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        seen = set()
        for x in nums:
            if x in seen:
                return x
            seen.add(x)
        return -1
'''),
76: v('DFS 前序序列化', '推荐', '用前序遍历输出节点值，空节点用 # 占位，反序列化时按同样顺序递归读取。', 'O(n)', 'O(n)', '每个节点和空指针各处理一次，字符串和递归栈占空间。', r'''
class Codec:
    def serialize(self, root):
        vals = []
        def dfs(node):
            if not node:
                vals.append('#')
                return
            vals.append(str(node.val))
            dfs(node.left)
            dfs(node.right)
        dfs(root)
        return ','.join(vals)

    def deserialize(self, data):
        vals = iter(data.split(','))
        def dfs():
            val = next(vals)
            if val == '#':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()
'''),
77: v('O(n^2) 动态规划', '基础', 'dp[i] 表示以 nums[i] 结尾的最长递增子序列长度。', 'O(n^2)', 'O(n)', '每个 i 都要枚举前面的 j。', r'''
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1] * len(nums)
        for i in range(len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)
'''),
78: v('三状态 DP 数组', '基础', 'hold 表示持股，sold 表示今天卖出，rest 表示不持股且不在卖出当天。', 'O(n)', 'O(n)', '每天三个状态，数组保存完整过程。', r'''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        hold = [0] * n
        sold = [0] * n
        rest = [0] * n
        hold[0] = -prices[0]
        for i in range(1, n):
            hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])
            sold[i] = hold[i - 1] + prices[i]
            rest[i] = max(rest[i - 1], sold[i - 1])
        return max(sold[-1], rest[-1])
'''),
79: v('递归记忆化区间 DP', '备选', 'dfs(left,right) 表示只戳开区间内气球的最大收益，枚举最后戳破的气球。', 'O(n^3)', 'O(n^2)', '区间状态 O(n^2)，每个状态枚举最后气球 O(n)。', r'''
from functools import lru_cache

class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        arr = [1] + nums + [1]
        @lru_cache(None)
        def dfs(left, right):
            if left + 1 >= right:
                return 0
            best = 0
            for k in range(left + 1, right):
                best = max(best, dfs(left, k) + arr[left] * arr[k] * arr[right] + dfs(k, right))
            return best
        return dfs(0, len(arr) - 1)
'''),
80: v('递归记忆化', '备选', 'dfs(rest) 表示凑出 rest 所需最少硬币数，枚举最后使用哪一枚硬币。', 'O(amount * n)', 'O(amount)', '每个金额状态计算一次，每次枚举 n 种硬币。', r'''
from functools import lru_cache

class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = 10 ** 9
        @lru_cache(None)
        def dfs(rest):
            if rest == 0:
                return 0
            if rest < 0:
                return INF
            return min(dfs(rest - coin) + 1 for coin in coins)
        ans = dfs(amount)
        return -1 if ans >= INF else ans
'''),
81: v('记忆化 DFS', '基础', '对每个节点分别计算偷它和不偷它的收益，用哈希表缓存节点结果。', 'O(n)', 'O(n)', '每个节点状态计算一次，缓存和递归栈占空间。', r'''
class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        memo = {}
        def dfs(node):
            if not node:
                return 0
            if node in memo:
                return memo[node]
            rob_it = node.val
            if node.left:
                rob_it += dfs(node.left.left) + dfs(node.left.right)
            if node.right:
                rob_it += dfs(node.right.left) + dfs(node.right.right)
            skip_it = dfs(node.left) + dfs(node.right)
            memo[node] = max(rob_it, skip_it)
            return memo[node]
        return dfs(root)
'''),
82: v('直接调用 bit_count', '基础', 'Python3.9 整数自带 bit_count，可直接计算每个数字二进制 1 的个数。', 'O(n log n)', 'O(1) 额外', '从 0 到 n 每个数字都要统计二进制位；结果数组不计入额外空间。', r'''
class Solution:
    def countBits(self, n: int) -> List[int]:
        return [i.bit_count() for i in range(n + 1)]
'''),
83: v('排序频次', '基础', '统计频次后按出现次数降序排序，取前 k 个。', 'O(n log n)', 'O(n)', '排序不同元素的频次是主要成本。', r'''
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        cnt = Counter(nums)
        return [x for x, _ in sorted(cnt.items(), key=lambda item: item[1], reverse=True)[:k]]
'''),
84: v('递归解析', '备选', '遇到数字读倍数，遇到 [ 递归解析子串，遇到 ] 返回当前层结果。', 'O(n)', 'O(n)', '每个字符处理一次，递归栈和构造字符串占空间。', r'''
class Solution:
    def decodeString(self, s: str) -> str:
        def parse(i):
            ans = ''
            num = 0
            while i < len(s):
                ch = s[i]
                if ch.isdigit():
                    num = num * 10 + int(ch)
                elif ch == '[':
                    inner, i = parse(i + 1)
                    ans += inner * num
                    num = 0
                elif ch == ']':
                    return ans, i
                else:
                    ans += ch
                i += 1
            return ans, i
        return parse(0)[0]
'''),
85: v('BFS 图搜索', '备选', '把等式建成带权图，每个查询用 BFS 寻找从起点到终点的路径乘积。', 'O(Q(V+E))', 'O(V+E)', '每个查询最坏遍历整张图。', r'''
from collections import defaultdict, deque

class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(list)
        for (a, b), val in zip(equations, values):
            graph[a].append((b, val))
            graph[b].append((a, 1.0 / val))

        def bfs(a, b):
            if a not in graph or b not in graph:
                return -1.0
            q = deque([(a, 1.0)])
            seen = {a}
            while q:
                cur, prod = q.popleft()
                if cur == b:
                    return prod
                for nxt, w in graph[cur]:
                    if nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, prod * w))
            return -1.0

        return [bfs(a, b) for a, b in queries]
'''),
86: v('暴力插入并校验', '基础', '尝试把人插入到当前队列的所有位置，选择能让已放入队列暂时合法的位置。', 'O(n^3)', 'O(n)', '教学用来理解 k 的含义，真实面试使用排序插入贪心。', r'''
class Solution:
    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:
        people.sort(key=lambda x: (-x[0], x[1]))
        ans = []
        for person in people:
            ans.insert(person[1], person)
        return ans
'''),
87: v('二维 0/1 背包', '基础', 'dp[i][j] 表示使用前 i 个数能否凑出和 j。', 'O(n*target)', 'O(n*target)', 'target 是总和的一半，二维表保存所有前缀状态。', r'''
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        n = len(nums)
        dp = [[False] * (target + 1) for _ in range(n + 1)]
        dp[0][0] = True
        for i, num in enumerate(nums, 1):
            for j in range(target + 1):
                dp[i][j] = dp[i - 1][j] or (j >= num and dp[i - 1][j - num])
        return dp[n][target]
'''),
88: v('双重 DFS', '基础', '枚举每个节点作为路径起点，再向下统计以它开头的路径数量。', 'O(n^2)', 'O(h)', '每个起点都可能向下遍历大量节点，退化链表时为 O(n^2)。', r'''
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        def count_from(node, rest):
            if not node:
                return 0
            hit = 1 if node.val == rest else 0
            return hit + count_from(node.left, rest - node.val) + count_from(node.right, rest - node.val)

        if not root:
            return 0
        return count_from(root, targetSum) + self.pathSum(root.left, targetSum) + self.pathSum(root.right, targetSum)
'''),
89: v('排序每个窗口', '暴力', '把 p 排序，再对 s 的每个等长窗口排序比较。', 'O(n*klogk)', 'O(k)', 'k=len(p)，每个窗口排序成本 klogk。', r'''
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        k = len(p)
        target = sorted(p)
        ans = []
        for i in range(len(s) - k + 1):
            if sorted(s[i:i + k]) == target:
                ans.append(i)
        return ans
'''),
90: v('哈希集合', '基础', '把出现过的数字放入集合，再枚举 1 到 n 找没出现的数字。', 'O(n)', 'O(n)', '集合最多保存 n 个数字。', r'''
class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        seen = set(nums)
        return [x for x in range(1, len(nums) + 1) if x not in seen]
'''),
91: v('bin 字符串计数', '基础', '先异或找不同位，再把二进制字符串里的 1 计数。', 'O(log C)', 'O(log C)', 'C 是整数大小，二进制字符串长度为 logC。', r'''
class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        return bin(x ^ y).count('1')
'''),
92: v('DFS 记忆化正负号', '基础', '对每个数选择加号或减号，缓存当前位置和当前和。', 'O(n*S)', 'O(n*S)', 'S 是可能出现的和的范围，缓存避免指数级重复计算。', r'''
from functools import lru_cache

class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        @lru_cache(None)
        def dfs(i, total):
            if i == len(nums):
                return 1 if total == target else 0
            return dfs(i + 1, total + nums[i]) + dfs(i + 1, total - nums[i])
        return dfs(0, 0)
'''),
93: v('递归反中序', '推荐', 'BST 从大到小遍历并维护前缀和，当前节点更新为已经访问过的大值之和。', 'O(n)', 'O(h)', '每个节点访问一次，递归栈高度为树高。', r'''
class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0
        def dfs(node):
            nonlocal total
            if not node:
                return
            dfs(node.right)
            total += node.val
            node.val = total
            dfs(node.left)
        dfs(root)
        return root
'''),
94: v('暴力计算每个节点左右深度', '基础', '把每个节点当作最高点，分别计算左右子树深度并更新直径。', 'O(n^2)', 'O(h)', '每个节点都可能重新计算子树深度，退化时为 O(n^2)。', r'''
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def depth(node):
            if not node:
                return 0
            return 1 + max(depth(node.left), depth(node.right))
        if not root:
            return 0
        through = depth(root.left) + depth(root.right)
        return max(through, self.diameterOfBinaryTree(root.left), self.diameterOfBinaryTree(root.right))
'''),
95: v('枚举所有子数组', '暴力', '固定左端点，向右累计和，等于 k 就计数。', 'O(n^2)', 'O(1)', '所有子数组数量为 O(n^2)。', r'''
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        ans = 0
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                if total == k:
                    ans += 1
        return ans
'''),
96: v('排序后比较', '基础', '将数组排序，原数组和排序数组第一个/最后一个不同位置之间就是需要排序的区间。', 'O(n log n)', 'O(n)', '排序是主成本，排序数组占 O(n) 空间。', r'''
class Solution:
    def findUnsortedSubarray(self, nums: List[int]) -> int:
        sorted_nums = sorted(nums)
        left, right = 0, len(nums) - 1
        while left < len(nums) and nums[left] == sorted_nums[left]:
            left += 1
        while right >= 0 and nums[right] == sorted_nums[right]:
            right -= 1
        return 0 if left >= right else right - left + 1
'''),
97: v('递归原地合并', '推荐', '两个节点都存在时相加并继续合并左右子树；某一边为空时直接返回另一边。', 'O(n)', 'O(h)', 'n 是两棵树重叠部分加非空节点数；递归栈高度为树高。', r'''
class Solution:
    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root1:
            return root2
        if not root2:
            return root1
        root1.val += root2.val
        root1.left = self.mergeTrees(root1.left, root2.left)
        root1.right = self.mergeTrees(root1.right, root2.right)
        return root1
'''),
98: v('最大堆模拟 CPU', '备选', '每个冷却周期取当前剩余次数最多的任务执行，未做完的任务下一轮再入堆。', 'O(T log A)', 'O(A)', 'T 是总调度长度，A 是任务种类数。', r'''
from collections import Counter, deque
import heapq

class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        heap = [-c for c in Counter(tasks).values()]
        heapq.heapify(heap)
        cool = deque()
        time = 0
        while heap or cool:
            time += 1
            if heap:
                cnt = heapq.heappop(heap) + 1
                if cnt:
                    cool.append((time + n, cnt))
            if cool and cool[0][0] == time:
                heapq.heappush(heap, cool.popleft()[1])
        return time
'''),
99: v('枚举所有子串', '暴力', '枚举每个子串并判断是否回文。', 'O(n^3)', 'O(1)', '子串 O(n^2)，每次回文检查 O(n)。', r'''
class Solution:
    def countSubstrings(self, s: str) -> int:
        def is_pal(left, right):
            while left < right:
                if s[left] != s[right]:
                    return False
                left += 1
                right -= 1
            return True
        ans = 0
        for i in range(len(s)):
            for j in range(i, len(s)):
                if is_pal(i, j):
                    ans += 1
        return ans
'''),
100: v('暴力向右找更暖日', '暴力', '对每一天向后扫描，找到第一个温度更高的日子。', 'O(n^2)', 'O(1)', '每一天最坏都要向右扫到末尾。', r'''
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        ans = [0] * n
        for i in range(n):
            for j in range(i + 1, n):
                if temperatures[j] > temperatures[i]:
                    ans[i] = j - i
                    break
        return ans
'''),
}

EXTRAS: dict[int, list[dict]] = {
1: [v('排序 + 双指针保留下标', '备选', '把数值和原下标一起排序，再用左右指针找和；能做但比哈希慢。', 'O(n log n)', 'O(n)', '排序是主要成本，需要保存原下标。', r'''
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        arr = sorted((x, i) for i, x in enumerate(nums))
        left, right = 0, len(arr) - 1
        while left < right:
            total = arr[left][0] + arr[right][0]
            if total == target:
                return [arr[left][1], arr[right][1]]
            if total < target:
                left += 1
            else:
                right -= 1
        return []
''')],
3: [v('滑动窗口 + 集合', '推荐', '窗口内始终不含重复字符；右边加入重复字符前，左边不断移出。', 'O(n)', 'O(min(n,字符集大小))', '左右指针都只向右移动，集合保存窗口字符。', r'''
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        left = 0
        ans = 0
        for right, ch in enumerate(s):
            while ch in seen:
                seen.remove(s[left])
                left += 1
            seen.add(ch)
            ans = max(ans, right - left + 1)
        return ans
''')],
4: [v('找第 k 小元素', '进阶', '每次丢掉两个数组中较小的一批前缀，直到找到第 k 小。', 'O(log(m+n))', 'O(log(m+n))', '递归每次至少丢掉 k/2 个元素，递归深度对数级。', r'''
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        def kth(a_start, b_start, k):
            if a_start == len(nums1):
                return nums2[b_start + k - 1]
            if b_start == len(nums2):
                return nums1[a_start + k - 1]
            if k == 1:
                return min(nums1[a_start], nums2[b_start])
            half = k // 2
            a_key = nums1[a_start + half - 1] if a_start + half - 1 < len(nums1) else float('inf')
            b_key = nums2[b_start + half - 1] if b_start + half - 1 < len(nums2) else float('inf')
            if a_key <= b_key:
                return kth(a_start + half, b_start, k - half)
            return kth(a_start, b_start + half, k - half)

        total = len(nums1) + len(nums2)
        if total % 2:
            return float(kth(0, 0, total // 2 + 1))
        return (kth(0, 0, total // 2) + kth(0, 0, total // 2 + 1)) / 2
''')],
5: [v('中心扩展', '推荐', '回文串一定有中心，枚举每个字符和字符间隙为中心向两侧扩展。', 'O(n^2)', 'O(1)', '共有 2n-1 个中心，每次最坏扩展 O(n)。', r'''
class Solution:
    def longestPalindrome(self, s: str) -> str:
        start = end = 0
        def expand(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return left + 1, right - 1

        for i in range(len(s)):
            l1, r1 = expand(i, i)
            l2, r2 = expand(i, i + 1)
            if r1 - l1 > end - start:
                start, end = l1, r1
            if r2 - l2 > end - start:
                start, end = l2, r2
        return s[start:end + 1]
'''), v('动态规划判断回文', '备选', 'dp[i][j] 表示 s[i:j+1] 是否为回文，由内部子串状态转移。', 'O(n^2)', 'O(n^2)', '枚举所有左右边界，二维表保存回文状态。', r'''
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        dp = [[False] * n for _ in range(n)]
        ans = ''
        for length in range(1, n + 1):
            for left in range(n - length + 1):
                right = left + length - 1
                if s[left] == s[right] and (length <= 2 or dp[left + 1][right - 1]):
                    dp[left][right] = True
                    if length > len(ans):
                        ans = s[left:right + 1]
        return ans
''')],
7: [v('双指针短板移动', '推荐', '左右边界向中间收缩，每次移动较短边，因为面积上限受短板限制。', 'O(n)', 'O(1)', '两个指针总共移动 n 次。', r'''
class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        ans = 0
        while left < right:
            ans = max(ans, min(height[left], height[right]) * (right - left))
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return ans
''')],
8: [v('排序 + 双指针', '推荐', '先排序，固定第一个数，再用双指针找另外两个数并跳过重复值。', 'O(n^2)', 'O(1) 或 O(n)', '固定一个数 O(n)，双指针线性扫描 O(n)。', r'''
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        ans = []
        n = len(nums)
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            if nums[i] > 0:
                break
            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    ans.append([nums[i], nums[left], nums[right]])
                    left += 1
                    right -= 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1
        return ans
''')],
14: [v('标准原地反转后缀', '推荐', '后缀本身已经降序，交换后只需反转后缀即可变为最小升序。', 'O(n)', 'O(1)', '从右向左扫描、交换、反转后缀都为线性。', r'''
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = len(nums) - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        left, right = i + 1, len(nums) - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
''')],
15: [v('栈保存下标', '推荐', '栈底保存上一个无法匹配的位置，遇到匹配成功就用当前下标减栈顶得到长度。', 'O(n)', 'O(n)', '每个下标最多入栈出栈一次。', r'''
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]
        ans = 0
        for i, ch in enumerate(s):
            if ch == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    ans = max(ans, i - stack[-1])
        return ans
'''), v('左右两遍计数', '备选', '从左到右和从右到左各扫一遍，用左右括号数量相等时更新答案。', 'O(n)', 'O(1)', '两次线性扫描，不需要栈。', r'''
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        ans = 0
        left = right = 0
        for ch in s:
            left += ch == '('
            right += ch == ')'
            if left == right:
                ans = max(ans, 2 * right)
            elif right > left:
                left = right = 0
        left = right = 0
        for ch in reversed(s):
            left += ch == '('
            right += ch == ')'
            if left == right:
                ans = max(ans, 2 * left)
            elif left > right:
                left = right = 0
        return ans
''')],
19: [v('前后缀最大值', '基础', '预处理每个位置左侧最高墙和右侧最高墙，再计算当前位置接水量。', 'O(n)', 'O(n)', '三次线性遍历，两个辅助数组。', r'''
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        if n == 0:
            return 0
        left_max = [0] * n
        right_max = [0] * n
        left_max[0] = height[0]
        for i in range(1, n):
            left_max[i] = max(left_max[i - 1], height[i])
        right_max[-1] = height[-1]
        for i in range(n - 2, -1, -1):
            right_max[i] = max(right_max[i + 1], height[i])
        return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))
'''), v('双指针', '推荐', '较矮一侧的最大墙决定当前接水量，因此每次移动较矮的一边。', 'O(n)', 'O(1)', '左右指针各移动至多 n 次。', r'''
class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = 0
        ans = 0
        while left < right:
            if height[left] < height[right]:
                left_max = max(left_max, height[left])
                ans += left_max - height[left]
                left += 1
            else:
                right_max = max(right_max, height[right])
                ans += right_max - height[right]
                right -= 1
        return ans
''')],
22: [v('26 字母计数 key', '进阶', '用长度为 26 的计数元组作为 key，避免对每个字符串排序。', 'O(NK)', 'O(NK)', '每个字符串只统计字符一次。', r'''
from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for s in strs:
            cnt = [0] * 26
            for ch in s:
                cnt[ord(ch) - ord('a')] += 1
            groups[tuple(cnt)].append(s)
        return list(groups.values())
''')],
23: [v('Kadane 动态规划', '推荐', 'cur 表示以当前元素结尾的最大子数组和，要么接上前面，要么从当前重新开始。', 'O(n)', 'O(1)', '每个元素只更新一次状态。', r'''
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = ans = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            ans = max(ans, cur)
        return ans
'''), v('前缀和 + 最小前缀', '备选', '当前前缀和减去之前最小前缀和，就是以当前位置结尾的最大子数组和。', 'O(n)', 'O(1)', '线性维护 prefix 和 min_prefix。', r'''
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        prefix = 0
        min_prefix = 0
        ans = nums[0]
        for x in nums:
            prefix += x
            ans = max(ans, prefix - min_prefix)
            min_prefix = min(min_prefix, prefix)
        return ans
''')],
26: [v('滚动数组 DP', '推荐', '一行一行更新，dp[j] 表示当前行第 j 列路径数。', 'O(mn)', 'O(n)', '每个格子计算一次，只保留一行状态。', r'''
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1]
        return dp[-1]
'''), v('组合数学', '进阶', '总共走 m+n-2 步，其中选择 m-1 步向下即可。', 'O(min(m,n))', 'O(1)', '计算组合数 C(m+n-2, m-1)。', r'''
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        a = min(m - 1, n - 1)
        b = m + n - 2
        ans = 1
        for i in range(1, a + 1):
            ans = ans * (b - a + i) // i
        return ans
''')],
27: [v('原地 DP', '推荐', '直接把 grid[i][j] 改成到达该格子的最小路径和。', 'O(mn)', 'O(1)', '复用输入矩阵，不再开额外 DP 表。', r'''
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    continue
                up = grid[i - 1][j] if i > 0 else float('inf')
                left = grid[i][j - 1] if j > 0 else float('inf')
                grid[i][j] += min(up, left)
        return grid[-1][-1]
''')],
28: [v('滚动变量 DP', '推荐', '只需要前两级台阶的方案数，用两个变量滚动更新。', 'O(n)', 'O(1)', '每个台阶计算一次，只保存两个状态。', r'''
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b
''')],
30: [v('荷兰国旗三指针', '推荐', 'left 前面全是 0，right 后面全是 2，i 扫描未知区间。', 'O(n)', 'O(1)', '每个元素最多被交换常数次。', r'''
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        left, i, right = 0, 0, len(nums) - 1
        while i <= right:
            if nums[i] == 0:
                nums[left], nums[i] = nums[i], nums[left]
                left += 1
                i += 1
            elif nums[i] == 2:
                nums[right], nums[i] = nums[i], nums[right]
                right -= 1
            else:
                i += 1
''')],
32: [v('迭代扩展子集', '备选', '每读到一个新数，就把它追加到已有所有子集后面，形成一批新子集。', 'O(n * 2^n)', 'O(n * 2^n)', '结果集本身包含 2^n 个子集。', r'''
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        ans = [[]]
        for x in nums:
            ans += [cur + [x] for cur in ans]
        return ans
''')],
35: [v('单调栈', '推荐', '维护递增栈，遇到更矮柱子时弹出栈顶并以它为高度计算最大宽度。', 'O(n)', 'O(n)', '每根柱子最多入栈、出栈一次。', r'''
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        arr = [0] + heights + [0]
        stack = []
        ans = 0
        for i, h in enumerate(arr):
            while stack and h < arr[stack[-1]]:
                mid = stack.pop()
                ans = max(ans, arr[mid] * (i - stack[-1] - 1))
            stack.append(i)
        return ans
''')],
37: [v('迭代栈中序', '推荐', '一路向左入栈，弹出时访问节点，再转向右子树。', 'O(n)', 'O(h)', '每个节点入栈出栈一次。', r'''
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        stack = []
        cur = root
        while cur or stack:
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()
            ans.append(cur.val)
            cur = cur.right
        return ans
'''), v('Morris 中序遍历', '进阶', '利用空右指针建立临时线索，做到 O(1) 额外空间。', 'O(n)', 'O(1)', '每条边最多走两次，不使用显式栈。', r'''
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        cur = root
        while cur:
            if not cur.left:
                ans.append(cur.val)
                cur = cur.right
            else:
                pre = cur.left
                while pre.right and pre.right is not cur:
                    pre = pre.right
                if not pre.right:
                    pre.right = cur
                    cur = cur.left
                else:
                    pre.right = None
                    ans.append(cur.val)
                    cur = cur.right
        return ans
''')],
39: [v('递归上下界', '推荐', '每个节点必须落在祖先节点限定的开区间内。', 'O(n)', 'O(h)', '每个节点检查一次，递归栈高度为 h。', r'''
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def dfs(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)
        return dfs(root, float('-inf'), float('inf'))
''')],
40: [v('队列迭代比较', '备选', '每次从队列中取出两个应该镜像相等的节点进行比较。', 'O(n)', 'O(w)', '队列最多保存一层镜像节点对。', r'''
from collections import deque

class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        q = deque([(root.left, root.right)]) if root else deque()
        while q:
            a, b = q.popleft()
            if not a or not b:
                if a is not b:
                    return False
                continue
            if a.val != b.val:
                return False
            q.append((a.left, b.right))
            q.append((a.right, b.left))
        return True
''')],
48: [v('异或运算', '推荐', '相同数字异或为 0，0 和任何数异或仍是该数，所有数字异或后剩下单独出现的数。', 'O(n)', 'O(1)', '只遍历一次，只用一个变量。', r'''
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x
        return ans
''')],
53: [v('归并排序链表', '推荐', '用快慢指针拆分链表，递归排序两半，再合并两个有序链表。', 'O(n log n)', 'O(log n)', '每层合并 O(n)，共有 logn 层；递归栈 O(logn)。', r'''
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head

        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        mid = slow.next
        slow.next = None

        left = self.sortList(head)
        right = self.sortList(mid)
        return self.merge(left, right)

    def merge(self, a, b):
        dummy = ListNode(0)
        cur = dummy
        while a and b:
            if a.val <= b.val:
                cur.next = a
                a = a.next
            else:
                cur.next = b
                b = b.next
            cur = cur.next
        cur.next = a or b
        return dummy.next
''')],
54: [v('最大最小乘积 DP', '推荐', '负数会让最大变最小、最小变最大，所以同时维护以当前位置结尾的最大/最小乘积。', 'O(n)', 'O(1)', '每个元素常数次更新。', r'''
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        cur_max = cur_min = ans = nums[0]
        for x in nums[1:]:
            if x < 0:
                cur_max, cur_min = cur_min, cur_max
            cur_max = max(x, cur_max * x)
            cur_min = min(x, cur_min * x)
            ans = max(ans, cur_max)
        return ans
''')],
57: [v('辅助最小栈', '推荐', '主栈存所有元素，辅助栈只在新值不大于当前最小时入栈，弹出同步维护。', 'O(1)', 'O(n)', '所有操作常数时间，最坏辅助栈也保存 n 个值。', r'''
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)

    def pop(self) -> None:
        val = self.stack.pop()
        if val == self.min_stack[-1]:
            self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
''')],
58: [v('双指针换头', '推荐', '两个指针分别走 A+B 和 B+A，如果相交会在入口相遇，否则一起到 None。', 'O(m+n)', 'O(1)', '两个指针最多各走 m+n 步。', r'''
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        a, b = headA, headB
        while a is not b:
            a = a.next if a else headB
            b = b.next if b else headA
        return a
''')],
59: [v('排序取中间', '基础', '多数元素出现超过一半，排序后中间位置一定是多数元素。', 'O(n log n)', 'O(1) 或 O(n)', '排序是主要成本。', r'''
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        nums.sort()
        return nums[len(nums) // 2]
'''), v('Boyer-Moore 投票', '推荐', '不同元素两两抵消，最后留下的候选一定是多数元素。', 'O(n)', 'O(1)', '一次扫描维护候选和票数。', r'''
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate = None
        votes = 0
        for x in nums:
            if votes == 0:
                candidate = x
            votes += 1 if x == candidate else -1
        return candidate
''')],
61: [v('BFS 淹岛', '备选', '遇到陆地后用队列把连通的陆地全部标记为水。', 'O(mn)', 'O(min(mn))', '每个格子最多入队一次。', r'''
from collections import deque

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        ans = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    ans += 1
                    grid[i][j] = '0'
                    q = deque([(i, j)])
                    while q:
                        x, y = q.popleft()
                        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':
                                grid[nx][ny] = '0'
                                q.append((nx, ny))
        return ans
''')],
63: [v('DFS 三色标记', '备选', '0 未访问、1 当前路径中、2 已确认安全；DFS 遇到 1 表示有环。', 'O(V+E)', 'O(V+E)', '邻接表和递归栈占空间。', r'''
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            graph[b].append(a)
        color = [0] * numCourses

        def dfs(x):
            if color[x] == 1:
                return False
            if color[x] == 2:
                return True
            color[x] = 1
            for nxt in graph[x]:
                if not dfs(nxt):
                    return False
            color[x] = 2
            return True

        return all(dfs(i) for i in range(numCourses))
''')],
65: [v('大小为 k 的小根堆', '推荐', '维护 k 个最大元素的小根堆，堆顶就是第 k 大。', 'O(n log k)', 'O(k)', '每个元素最多入堆或替换一次。', r'''
import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            if len(heap) < k:
                heapq.heappush(heap, x)
            elif x > heap[0]:
                heapq.heapreplace(heap, x)
        return heap[0]
'''), v('快速选择', '进阶', '按快排分区思想，每次只递归包含第 k 大的那一边。', '平均 O(n)，最坏 O(n^2)', 'O(1)', '随机分区平均线性，但极端分区会退化。', r'''
import random

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        target = len(nums) - k
        left, right = 0, len(nums) - 1
        while True:
            pivot_idx = random.randint(left, right)
            nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
            pivot = nums[right]
            store = left
            for i in range(left, right):
                if nums[i] < pivot:
                    nums[store], nums[i] = nums[i], nums[store]
                    store += 1
            nums[store], nums[right] = nums[right], nums[store]
            if store == target:
                return nums[store]
            if store < target:
                left = store + 1
            else:
                right = store - 1
''')],
66: [v('二维 DP', '推荐', 'dp[i][j] 表示以该格为右下角的最大正方形边长。', 'O(mn)', 'O(mn)', '每个格子一次转移，二维表保存状态。', r'''
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        best = 0
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if matrix[i - 1][j - 1] == '1':
                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
                    best = max(best, dp[i][j])
        return best * best
''')],
70: [v('常数空间前后缀', '推荐', '先把左乘积写入答案，再从右往左乘右乘积。', 'O(n)', 'O(1) 额外', '输出数组不计入额外空间，只用一个 right 变量。', r'''
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        ans = [1] * len(nums)
        prefix = 1
        for i, x in enumerate(nums):
            ans[i] = prefix
            prefix *= x
        suffix = 1
        for i in range(len(nums) - 1, -1, -1):
            ans[i] *= suffix
            suffix *= nums[i]
        return ans
''')],
71: [v('堆', '备选', '堆中存负值和下标，窗口滑动时弹出已经离开窗口的元素。', 'O(n log n)', 'O(n)', '每个元素入堆一次，可能延迟删除。', r'''
import heapq

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        heap = []
        ans = []
        for i, x in enumerate(nums):
            heapq.heappush(heap, (-x, i))
            while heap[0][1] <= i - k:
                heapq.heappop(heap)
            if i >= k - 1:
                ans.append(-heap[0][0])
        return ans
'''), v('单调队列', '推荐', '队列中下标对应的值单调递减，队首永远是当前窗口最大值。', 'O(n)', 'O(k)', '每个下标最多入队、出队一次。', r'''
from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        q = deque()
        ans = []
        for i, x in enumerate(nums):
            while q and q[0] <= i - k:
                q.popleft()
            while q and nums[q[-1]] <= x:
                q.pop()
            q.append(i)
            if i >= k - 1:
                ans.append(nums[q[0]])
        return ans
''')],
72: [v('右上角阶梯搜索', '推荐', '从右上角开始，大于 target 就左移，小于 target 就下移。', 'O(m+n)', 'O(1)', '每步排除一行或一列。', r'''
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        i, j = 0, n - 1
        while i < m and j >= 0:
            if matrix[i][j] == target:
                return True
            if matrix[i][j] > target:
                j -= 1
            else:
                i += 1
        return False
''')],
73: [v('完全背包 DP', '推荐', 'dp[i] 表示凑出 i 的最少完全平方数个数。', 'O(n√n)', 'O(n)', '每个金额枚举不超过 √n 个平方数。', r'''
class Solution:
    def numSquares(self, n: int) -> int:
        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
        dp = [0] + [float('inf')] * n
        for i in range(1, n + 1):
            for sq in squares:
                if sq > i:
                    break
                dp[i] = min(dp[i], dp[i - sq] + 1)
        return dp[n]
''')],
74: [v('稳定双指针', '推荐', 'slow 指向下一个非零元素应该放的位置，fast 扫描数组。', 'O(n)', 'O(1)', '一次扫描后补零，保持非零元素相对顺序。', r'''
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow] = nums[fast]
                slow += 1
        for i in range(slow, len(nums)):
            nums[i] = 0
''')],
75: [v('二分答案计数', '进阶', '对值域二分，统计小于等于 mid 的元素个数，用抽屉原理判断重复数在哪半边。', 'O(n log n)', 'O(1)', '值域大小为 n，每轮统计数组一次。', r'''
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        left, right = 1, len(nums) - 1
        while left < right:
            mid = (left + right) // 2
            cnt = sum(x <= mid for x in nums)
            if cnt > mid:
                right = mid
            else:
                left = mid + 1
        return left
'''), v('快慢指针找环入口', '推荐', '把 nums[i] 看成 i 指向 nums[i] 的链表，重复数就是环入口。', 'O(n)', 'O(1)', '两个阶段的快慢指针都是线性。', r'''
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        finder = nums[0]
        while finder != slow:
            finder = nums[finder]
            slow = nums[slow]
        return finder
''')],
76: [v('BFS 层序序列化', '备选', '按层输出节点，空节点也记录为 #，反序列化时依次恢复左右孩子。', 'O(n)', 'O(n)', '队列和序列都为线性规模。', r'''
from collections import deque

class Codec:
    def serialize(self, root):
        if not root:
            return ''
        vals = []
        q = deque([root])
        while q:
            node = q.popleft()
            if node:
                vals.append(str(node.val))
                q.append(node.left)
                q.append(node.right)
            else:
                vals.append('#')
        return ','.join(vals)

    def deserialize(self, data):
        if not data:
            return None
        vals = data.split(',')
        root = TreeNode(int(vals[0]))
        q = deque([root])
        i = 1
        while q:
            node = q.popleft()
            if vals[i] != '#':
                node.left = TreeNode(int(vals[i]))
                q.append(node.left)
            i += 1
            if vals[i] != '#':
                node.right = TreeNode(int(vals[i]))
                q.append(node.right)
            i += 1
        return root
''')],
77: [v('贪心 + 二分', '推荐', 'tails[len] 保存长度为 len+1 的递增子序列最小结尾，越小越容易接后续元素。', 'O(n log n)', 'O(n)', '每个元素在 tails 中二分一次。', r'''
from bisect import bisect_left

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []
        for x in nums:
            i = bisect_left(tails, x)
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        return len(tails)
''')],
80: [v('完全背包 DP', '推荐', 'dp[x] 表示凑成金额 x 的最少硬币数，枚举每个金额和每枚硬币。', 'O(amount*n)', 'O(amount)', '金额状态 amount 个，每个状态枚举 n 枚硬币。', r'''
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1
        dp = [0] + [INF] * amount
        for x in range(1, amount + 1):
            for coin in coins:
                if x >= coin:
                    dp[x] = min(dp[x], dp[x - coin] + 1)
        return -1 if dp[amount] == INF else dp[amount]
''')],
81: [v('树形 DP 二元组', '推荐', 'dfs 返回两个值：偷当前节点的最大收益、不偷当前节点的最大收益。', 'O(n)', 'O(h)', '每个节点只计算一次，不需要哈希缓存。', r'''
class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def dfs(node):
            if not node:
                return (0, 0)
            left_rob, left_skip = dfs(node.left)
            right_rob, right_skip = dfs(node.right)
            rob_it = node.val + left_skip + right_skip
            skip_it = max(left_rob, left_skip) + max(right_rob, right_skip)
            return rob_it, skip_it
        return max(dfs(root))
''')],
82: [v('DP：i >> 1', '推荐', 'i 的 1 个数等于 i//2 的 1 个数加上最低位。', 'O(n)', 'O(1) 额外', '从 0 到 n 一次递推，结果数组不计入额外空间。', r'''
class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)
        return ans
'''), v('DP：去掉最低位的 1', '备选', 'i & (i-1) 会去掉 i 最低位的 1。', 'O(n)', 'O(1) 额外', '每个 i 由更小状态转移而来。', r'''
class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i & (i - 1)] + 1
        return ans
''')],
83: [v('最小堆', '推荐', '维护大小为 k 的最小堆，堆中保留当前频率最高的 k 个元素。', 'O(n log k)', 'O(n)', '计数表 O(n)，堆大小为 k。', r'''
from collections import Counter
import heapq

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        cnt = Counter(nums)
        heap = []
        for x, c in cnt.items():
            heapq.heappush(heap, (c, x))
            if len(heap) > k:
                heapq.heappop(heap)
        return [x for _, x in heap]
'''), v('桶排序', '进阶', '频率最大不超过 n，用频率作为桶下标，从高频桶往低频桶收集。', 'O(n)', 'O(n)', '计数和桶数组都是线性规模。', r'''
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        cnt = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]
        for x, c in cnt.items():
            buckets[c].append(x)
        ans = []
        for freq in range(len(buckets) - 1, -1, -1):
            ans.extend(buckets[freq])
            if len(ans) >= k:
                return ans[:k]
        return ans
''')],
84: [v('栈模拟', '推荐', '遇到 [ 保存之前的字符串和倍数，遇到 ] 弹栈并拼接。', 'O(n)', 'O(n)', '每个字符处理一次，栈保存嵌套层。', r'''
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        cur = ''
        num = 0
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch == '[':
                stack.append((cur, num))
                cur = ''
                num = 0
            elif ch == ']':
                prev, times = stack.pop()
                cur = prev + cur * times
            else:
                cur += ch
        return cur
''')],
87: [v('一维 0/1 背包', '推荐', '从大到小更新容量，保证每个数只使用一次。', 'O(n*target)', 'O(target)', 'target 是总和一半，只保存一维状态。', r'''
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True
        for num in nums:
            for j in range(target, num - 1, -1):
                dp[j] = dp[j] or dp[j - num]
        return dp[target]
'''), v('整数 bitset', '进阶', '用整数的二进制位表示可达和，左移 num 位表示加上 num。', 'O(n*target/word)', 'O(1) 代码层面', 'Python3.9 大整数内部仍占 target 位，但写法非常简洁。', r'''
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        bits = 1
        for num in nums:
            bits |= bits << num
        return ((bits >> target) & 1) == 1
''')],
88: [v('前缀和 DFS', '推荐', '当前路径和为 cur，若之前有 cur-target 的前缀，就能组成一条目标路径。', 'O(n)', 'O(h)', '每个节点访问一次，哈希表保存当前根到节点路径上的前缀和。', r'''
from collections import defaultdict

class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix = defaultdict(int)
        prefix[0] = 1
        ans = 0
        def dfs(node, cur):
            nonlocal ans
            if not node:
                return
            cur += node.val
            ans += prefix[cur - targetSum]
            prefix[cur] += 1
            dfs(node.left, cur)
            dfs(node.right, cur)
            prefix[cur] -= 1
        dfs(root, 0)
        return ans
''')],
89: [v('滑动窗口计数', '推荐', '维护长度为 len(p) 的窗口频次，窗口频次等于 p 的频次时记录起点。', 'O(n)', 'O(字符集大小)', '每个字符入窗出窗一次。', r'''
from collections import Counter

class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        k = len(p)
        if len(s) < k:
            return []
        need = Counter(p)
        window = Counter(s[:k])
        ans = []
        if window == need:
            ans.append(0)
        for right in range(k, len(s)):
            left_char = s[right - k]
            window[left_char] -= 1
            if window[left_char] == 0:
                del window[left_char]
            window[s[right]] += 1
            if window == need:
                ans.append(right - k + 1)
        return ans
''')],
90: [v('原地负号标记', '推荐', '数字 x 出现过，就把下标 x-1 的位置标记为负数；最后仍为正的位置就是缺失数字。', 'O(n)', 'O(1)', '只修改原数组，不开集合。', r'''
class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        for x in nums:
            idx = abs(x) - 1
            nums[idx] = -abs(nums[idx])
        return [i + 1 for i, x in enumerate(nums) if x > 0]
''')],
91: [v('Brian Kernighan 位运算', '推荐', '每次 x &= x-1 去掉最低位的 1，循环次数就是 1 的个数。', 'O(1)', 'O(1)', '整数位数固定时为常数；更一般可写 O(logC)。', r'''
class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        z = x ^ y
        ans = 0
        while z:
            z &= z - 1
            ans += 1
        return ans
''')],
92: [v('转化为子集和 DP', '推荐', '设正数和为 P，负数和为 N，有 P-N=target 且 P+N=sum，所以 P=(sum+target)/2。', 'O(n*P)', 'O(P)', 'P 是要凑出的正数和，按 0/1 背包计数。', r'''
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2:
            return 0
        bag = (total + target) // 2
        dp = [0] * (bag + 1)
        dp[0] = 1
        for num in nums:
            for j in range(bag, num - 1, -1):
                dp[j] += dp[j - num]
        return dp[bag]
''')],
93: [v('迭代反中序', '备选', '用栈模拟从大到小遍历，边遍历边维护累计和。', 'O(n)', 'O(h)', '每个节点入栈出栈一次。', r'''
class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0
        stack = []
        cur = root
        while cur or stack:
            while cur:
                stack.append(cur)
                cur = cur.right
            cur = stack.pop()
            total += cur.val
            cur.val = total
            cur = cur.left
        return root
''')],
94: [v('后序一次求高度和直径', '推荐', 'DFS 返回子树高度，同时用左右高度之和更新答案。', 'O(n)', 'O(h)', '每个节点只访问一次。', r'''
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        ans = 0
        def depth(node):
            nonlocal ans
            if not node:
                return 0
            left = depth(node.left)
            right = depth(node.right)
            ans = max(ans, left + right)
            return max(left, right) + 1
        depth(root)
        return ans
''')],
95: [v('前缀和 + 哈希表', '推荐', '当前前缀和为 cur，如果之前出现过 cur-k，则这些位置到当前形成和为 k 的子数组。', 'O(n)', 'O(n)', '每个位置只处理一次，哈希表保存前缀和出现次数。', r'''
from collections import defaultdict

class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        cnt = defaultdict(int)
        cnt[0] = 1
        cur = 0
        ans = 0
        for x in nums:
            cur += x
            ans += cnt[cur - k]
            cnt[cur] += 1
        return ans
''')],
96: [v('单调栈', '备选', '从左到右找被更小元素破坏的右边界，从右到左找被更大元素破坏的左边界。', 'O(n)', 'O(n)', '每个下标最多入栈出栈一次。', r'''
class Solution:
    def findUnsortedSubarray(self, nums: List[int]) -> int:
        n = len(nums)
        left, right = n, -1
        stack = []
        for i, x in enumerate(nums):
            while stack and nums[stack[-1]] > x:
                left = min(left, stack.pop())
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and nums[stack[-1]] < nums[i]:
                right = max(right, stack.pop())
            stack.append(i)
        return 0 if right == -1 else right - left + 1
'''), v('一次扫描维护边界', '推荐', '从左到右维护最大值确定右边界，从右到左维护最小值确定左边界。', 'O(n)', 'O(1)', '两次线性扫描，只用常数变量。', r'''
class Solution:
    def findUnsortedSubarray(self, nums: List[int]) -> int:
        n = len(nums)
        max_seen = float('-inf')
        min_seen = float('inf')
        right = -1
        left = n
        for i in range(n):
            max_seen = max(max_seen, nums[i])
            if nums[i] < max_seen:
                right = i
        for i in range(n - 1, -1, -1):
            min_seen = min(min_seen, nums[i])
            if nums[i] > min_seen:
                left = i
        return 0 if right == -1 else right - left + 1
''')],
99: [v('中心扩展', '推荐', '每个回文子串都有中心，枚举单中心和双中心向外扩展。', 'O(n^2)', 'O(1)', '共有 2n-1 个中心，每个中心最坏扩展 O(n)。', r'''
class Solution:
    def countSubstrings(self, s: str) -> int:
        ans = 0
        def expand(left, right):
            nonlocal ans
            while left >= 0 and right < len(s) and s[left] == s[right]:
                ans += 1
                left -= 1
                right += 1
        for i in range(len(s)):
            expand(i, i)
            expand(i, i + 1)
        return ans
'''), v('DP 判断回文', '备选', 'dp[i][j] 表示 s[i:j+1] 是否为回文，成立就计数。', 'O(n^2)', 'O(n^2)', '枚举所有子串并保存回文状态。', r'''
class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        dp = [[False] * n for _ in range(n)]
        ans = 0
        for length in range(1, n + 1):
            for left in range(n - length + 1):
                right = left + length - 1
                if s[left] == s[right] and (length <= 2 or dp[left + 1][right - 1]):
                    dp[left][right] = True
                    ans += 1
        return ans
''')],
100: [v('单调栈', '推荐', '栈中保存还没找到更暖日的下标；当前温度更高时结算栈顶。', 'O(n)', 'O(n)', '每个下标最多入栈出栈一次。', r'''
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        ans = [0] * len(temperatures)
        stack = []
        for i, t in enumerate(temperatures):
            while stack and t > temperatures[stack[-1]]:
                j = stack.pop()
                ans[j] = i - j
            stack.append(i)
        return ans
''')],
}


def main() -> None:
    problems = load_problems()
    out: dict[int, list[dict]] = {}
    for p in problems:
        problem_order_id = int(p['id'])
        pid = problem_order_id
        lcid = int(p['leetcodeId'])
        items = []
        if pid in BASIC:
            items.append(BASIC[pid])
        else:
            raise RuntimeError(f'Missing BASIC solution for problem id {pid} / LC {lcid} {p["title"]}')
        # Use the existing refined answer as the recommended canonical solution unless the manual basic is already recommended.
        canonical = v(
            '面试推荐写法',
            '推荐',
            p.get('optimizedIdea') or p.get('whyThisPattern') or '这是本题面试最常见的主解法。',
            p.get('complexity', {}).get('time') or '见代码分析',
            p.get('complexity', {}).get('space') or '见代码分析',
            '这是当前题目精修数据中的主解法，适合作为手撕标准答案。',
            p.get('solutionCode') or p.get('hints', {}).get('level6') or 'class Solution:\n    pass',
            ['优先掌握这一版；其他解法用于理解取舍和应对追问。'],
        )
        # Avoid exact duplicate when BASIC is already the same recommended code by still keeping the canonical for consistency.
        items.append(canonical)
        items.extend(EXTRAS.get(pid, []))
        out[lcid] = items

    ts = """export interface SolutionVariant {\n  name: string;\n  badge: '暴力' | '基础' | '推荐' | '备选' | '进阶';\n  idea: string;\n  time: string;\n  space: string;\n  complexityDetail: string;\n  code: string;\n  notes: string[];\n}\n\nexport const solutionVariants: Record<number, SolutionVariant[]> = """
    ts += json.dumps(out, ensure_ascii=False, indent=2)
    ts += ";\n\nexport function getSolutionVariants(leetcodeId: number): SolutionVariant[] {\n  return solutionVariants[leetcodeId] ?? [];\n}\n"
    (ROOT / 'src/data/solutionVariants.ts').write_text(ts, encoding='utf-8')
    print(f'Generated solutionVariants.ts for {len(out)} problems, {sum(len(v) for v in out.values())} solution variants.')


if __name__ == '__main__':
    main()
