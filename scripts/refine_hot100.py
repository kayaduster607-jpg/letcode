# -*- coding: utf-8 -*-
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def code(s: str) -> str:
    return s.strip('\n')

BANK = {
    1: dict(slug='two-sum', core='遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。', time='O(n)', space='O(n)', detail='数组只遍历一次；哈希表最多存 n 个数值到下标的映射。', edge=[('nums=[3,3], target=6', '[0,1]', '重复数字要存下标，且必须先查再存，不能同一个元素用两次。'), ('nums=[-1,-2,-3,-4,-5], target=-8', '[2,4]', '负数和正常整数一样可以作为哈希表 key。'), ('nums=[2,7,11,15], target=9', '[0,1]', '最基础样例，验证返回的是下标不是数值。')], code=code('''
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # seen[value] = value 第一次出现的下标
        seen = {}

        for i, x in enumerate(nums):
            need = target - x  # 当前数 x 需要搭配的另一个数

            # 先查再存，避免 target=2*x 时把自己匹配给自己
            if need in seen:
                return [seen[need], i]

            # 没找到搭档，记录当前数，留给后面的元素匹配
            seen[x] = i

        # 题目保证有且只有一个答案，正常不会走到这里
        return []
''')),
    2: dict(slug='add-two-numbers', core='把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。', time='O(max(m,n))', space='O(max(m,n))', detail='最多遍历两个链表中较长的长度；返回链表本身需要同等数量的新节点。', edge=[('l1=[9,9,9], l2=[1]', '[0,0,0,1]', '链表结束后 carry 仍然存在，必须继续生成新节点。'), ('l1=[2,4,3], l2=[5,6,4]', '[7,0,8]', '标准竖式加法 342+465=807。'), ('l1=[0], l2=[0]', '[0]', '零值链表不能返回空链表。')], code=code('''
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)  # 虚拟头节点，避免单独处理第一个节点
        cur = dummy
        carry = 0            # 进位，只可能是 0 或 1

        # 只要任意链表没走完，或最后还有进位，就继续处理
        while l1 or l2 or carry:
            x = l1.val if l1 else 0
            y = l2.val if l2 else 0
            total = x + y + carry

            carry = total // 10          # 十位作为下一轮进位
            cur.next = ListNode(total % 10)  # 个位成为当前答案节点
            cur = cur.next

            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next

        return dummy.next
''')),
    3: dict(slug='longest-substring-without-repeating-characters', core='用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。', time='O(n)', space='O(min(n,字符集大小))', detail='right 线性扫描，left 只向右移动；哈希表记录字符最近出现位置。', edge=[('s="abba"', '2', '不能把 left 往回移；第二个 a 出现时 left 已经在 2。'), ('s="bbbbb"', '1', '全重复时窗口长度始终最多为 1。'), ('s=""', '0', '空字符串答案为 0。')], code=code('''
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}   # last[ch] = 字符 ch 最近一次出现的下标
        left = 0    # 当前无重复窗口的左边界
        ans = 0

        for right, ch in enumerate(s):
            # ch 在窗口内重复出现，left 必须跳到上次 ch 的后一位
            if ch in last and last[ch] >= left:
                left = last[ch] + 1

            last[ch] = right
            ans = max(ans, right - left + 1)

        return ans
''')),
    4: dict(slug='median-of-two-sorted-arrays', core='在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。', time='O(log(min(m,n)))', space='O(1)', detail='只在较短数组上二分；每次根据边界大小排除一半切分位置。', edge=[('nums1=[], nums2=[1]', '1.0', '一个数组为空时，哨兵值能自然处理。'), ('nums1=[1,2], nums2=[3,4]', '2.5', '总长度为偶数，需要取左右边界平均值。'), ('nums1=[0,0], nums2=[0,0]', '0.0', '大量重复值也应满足 <= 判断。')], code=code('''
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        # 始终在较短数组上二分，保证复杂度是 log(min(m,n))
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        total_left = (m + n + 1) // 2  # 左半边需要放多少个元素
        left, right = 0, m

        while left <= right:
            i = (left + right) // 2       # nums1 左边取 i 个
            j = total_left - i            # nums2 左边取 j 个

            a_left = nums1[i - 1] if i > 0 else float('-inf')
            a_right = nums1[i] if i < m else float('inf')
            b_left = nums2[j - 1] if j > 0 else float('-inf')
            b_right = nums2[j] if j < n else float('inf')

            # 找到合法切分：左半边所有数 <= 右半边所有数
            if a_left <= b_right and b_left <= a_right:
                if (m + n) % 2 == 1:
                    return float(max(a_left, b_left))
                return (max(a_left, b_left) + min(a_right, b_right)) / 2

            # nums1 左边取太多了，i 往左收
            if a_left > b_right:
                right = i - 1
            else:
                left = i + 1

        return 0.0
''')),
    5: dict(slug='longest-palindromic-substring', core='回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。', time='O(n²)', space='O(1)', detail='一共有 2n-1 个中心，每个中心最坏向外扩展 O(n)。', edge=[('s="babad"', '"bab" 或 "aba"', '奇数长度回文，存在多个正确答案。'), ('s="cbbd"', '"bb"', '偶数长度回文中心在两个字符之间。'), ('s="a"', '"a"', '长度为 1 时直接返回自身。')], code=code('''
class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""

        start = end = 0  # 当前最长回文子串的左右边界

        def expand(left: int, right: int) -> None:
            nonlocal start, end
            # 只要左右字符相同，就继续向两边扩张
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1

            # 跳出循环时 [left+1, right-1] 才是真正回文区间
            if right - left - 2 > end - start:
                start, end = left + 1, right - 1

        for i in range(len(s)):
            expand(i, i)       # 奇数长度中心
            expand(i, i + 1)   # 偶数长度中心

        return s[start:end + 1]
''')),
    6: dict(slug='regular-expression-matching', core='dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。', time='O(mn)', space='O(mn)', detail='m=len(s), n=len(p)，二维 DP 每个状态 O(1) 转移。', edge=[('s="aa", p="a*"', 'true', '* 可以让前一个字符重复多次。'), ('s="ab", p=".*"', 'true', '. 可以匹配任意字符，* 可以重复。'), ('s="mississippi", p="mis*is*p*."', 'false', '星号只能作用于前一个字符，不能随意跨段匹配。')], code=code('''
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True  # 空串匹配空模式

        # 初始化：s 为空时，只有 a*b*c* 这种模式可能匹配空串
        for j in range(2, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                elif p[j - 1] == '*':
                    # 情况1：x* 出现 0 次，直接删掉 p[j-2:j]
                    dp[i][j] = dp[i][j - 2]

                    # 情况2：x* 至少出现 1 次，前提是 x 能匹配 s[i-1]
                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                        dp[i][j] = dp[i][j] or dp[i - 1][j]

        return dp[m][n]
''')),
    7: dict(slug='container-with-most-water', core='容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。', time='O(n)', space='O(1)', detail='左右指针每次移动一个，总共最多移动 n-1 次。', edge=[('height=[1,1]', '1', '最小长度数组。'), ('height=[1,8,6,2,5,4,8,3,7]', '49', '经典样例。'), ('height=[2,3,4,5,18,17,6]', '17', '最高柱子不一定参与最大面积。')], code=code('''
class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        ans = 0

        while left < right:
            width = right - left
            ans = max(ans, width * min(height[left], height[right]))

            # 面积受短板限制，移动长板不会提高当前短板
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return ans
''')),
    8: dict(slug='3sum', core='先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。', time='O(n²)', space='O(1)', detail='排序后外层枚举 n 次，内层双指针线性移动；不计答案空间时额外空间 O(1)。', edge=[('nums=[-1,0,1,2,-1,-4]', '[[-1,-1,2],[-1,0,1]]', '需要排序和去重。'), ('nums=[0,0,0,0]', '[[0,0,0]]', '重复答案只能保留一次。'), ('nums=[1,2,-2,-1]', '[]', '不存在三元组时返回空数组。')], code=code('''
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        ans = []
        n = len(nums)

        for i in range(n - 2):
            # 固定数去重：相同 nums[i] 只处理第一次
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            # 排序后最小固定数已大于 0，后面不可能凑成 0
            if nums[i] > 0:
                break

            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    ans.append([nums[i], nums[left], nums[right]])
                    left += 1
                    right -= 1

                    # 双指针去重：跳过相同的第二、第三个数
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1

        return ans
''')),
    9: dict(slug='letter-combinations-of-a-phone-number', core='每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。', time='O(4^n·n)', space='O(n)', detail='最多每位 4 个选择，生成每个答案需要拷贝长度 n 的字符串；递归栈深度为 n。', edge=[('digits=""', '[]', '空输入不能返回 [""]。'), ('digits="2"', '["a","b","c"]', '单个数字对应三个字母。'), ('digits="79"', '16 个组合', '7 和 9 都有 4 个字母，组合数最多。')], code=code('''
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        phone = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
        }
        ans = []
        path = []

        def backtrack(index: int) -> None:
            # index 表示正在决定 digits[index]
            if index == len(digits):
                ans.append(''.join(path))
                return

            for ch in phone[digits[index]]:
                path.append(ch)          # 选择一个字母
                backtrack(index + 1)     # 递归决定下一个数字
                path.pop()               # 撤销选择，尝试同层其他字母

        backtrack(0)
        return ans
''')),
    10: dict(slug='remove-nth-node-from-end-of-list', core='快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。', time='O(L)', space='O(1)', detail='链表只被双指针线性扫描一次；只使用常数个指针变量。', edge=[('head=[1], n=1', '[]', '删除唯一节点，dummy 能统一处理。'), ('head=[1,2], n=2', '[2]', '删除头节点时不能直接用 head 前驱，必须用 dummy。'), ('head=[1,2,3,4,5], n=2', '[1,2,3,5]', '标准样例。')], code=code('''
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)  # 处理删除头节点的情况
        fast = slow = dummy

        # fast 先走 n 步，制造 n 个节点的间距
        for _ in range(n):
            fast = fast.next

        # fast 到最后一个节点时，slow 在待删除节点前一个
        while fast.next:
            fast = fast.next
            slow = slow.next

        slow.next = slow.next.next
        return dummy.next
''')),
    11: dict(slug='valid-parentheses', core='遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。', time='O(n)', space='O(n)', detail='每个括号最多入栈或出栈一次；最坏全是左括号，栈大小为 n。', edge=[('s="()[]{}"', 'true', '多种括号顺序匹配。'), ('s="([)]"', 'false', '数量对但嵌套顺序错。'), ('s="]"', 'false', '右括号出现时栈为空。')], code=code('''
class Solution:
    def isValid(self, s: str) -> bool:
        pair = {')': '(', ']': '[', '}': '{'}
        stack = []

        for ch in s:
            if ch in pair:  # ch 是右括号，需要匹配栈顶
                if not stack or stack[-1] != pair[ch]:
                    return False
                stack.pop()
            else:           # ch 是左括号，等待后续右括号匹配
                stack.append(ch)

        return not stack
''')),
    12: dict(slug='merge-two-sorted-lists', core='两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。', time='O(m+n)', space='O(1)', detail='每个节点只接入结果链表一次；迭代写法只使用常数指针。', edge=[('list1=[], list2=[]', '[]', '两个空链表返回空。'), ('list1=[], list2=[0]', '[0]', '一边为空时直接接另一边。'), ('list1=[1,2,4], list2=[1,3,4]', '[1,1,2,3,4,4]', '标准合并。')], code=code('''
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        cur = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                cur.next = list1
                list1 = list1.next
            else:
                cur.next = list2
                list2 = list2.next
            cur = cur.next

        # 剩余链表本身已经有序，直接接上即可
        cur.next = list1 if list1 else list2
        return dummy.next
''')),
    13: dict(slug='generate-parentheses', core='回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。', time='O(Cn·n)', space='O(n)', detail='答案数量是第 n 个卡特兰数 Cn；递归路径长度为 2n，拷贝答案需要 O(n)。', edge=[('n=1', '["()"]', '最小非零规模。'), ('n=3', '5 个结果', '经典样例。'), ('任意前缀右括号数 > 左括号数', '不允许生成', '这是核心剪枝条件。')], code=code('''
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        path = []

        def backtrack(left_count: int, right_count: int) -> None:
            # path 长度达到 2n，说明得到一个完整合法组合
            if len(path) == 2 * n:
                ans.append(''.join(path))
                return

            # 只要左括号还没用完，就可以加左括号
            if left_count < n:
                path.append('(')
                backtrack(left_count + 1, right_count)
                path.pop()

            # 右括号不能超过左括号，否则前缀会非法
            if right_count < left_count:
                path.append(')')
                backtrack(left_count, right_count + 1)
                path.pop()

        backtrack(0, 0)
        return ans
''')),
    14: dict(slug='next-permutation', core='从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。', time='O(n)', space='O(1)', detail='最多从右向左扫描两次并原地反转后缀。', edge=[('nums=[1,2,3]', '[1,3,2]', '普通升序数组。'), ('nums=[3,2,1]', '[1,2,3]', '已经是最大排列，需要变成最小排列。'), ('nums=[1,1,5]', '[1,5,1]', '重复元素也按字典序处理。')], code=code('''
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        n = len(nums)
        i = n - 2

        # 找到第一个 nums[i] < nums[i+1]，说明 i 可以被增大
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1

        if i >= 0:
            j = n - 1
            # 从右侧找第一个比 nums[i] 大的数，它是“刚好更大”的交换对象
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]

        # i 右侧原本是降序，反转后变成最小升序后缀
        left, right = i + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
''')),
    15: dict(slug='longest-valid-parentheses', core='栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。', time='O(n)', space='O(n)', detail='每个下标最多入栈出栈一次；最坏栈保存所有下标。', edge=[('s="(()"', '2', '最后一个左括号无法匹配。'), ('s=")()())"', '4', '哨兵能处理前缀非法右括号。'), ('s=""', '0', '空串没有有效括号。')], code=code('''
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]  # 栈底哨兵：最后一个无法匹配的右括号位置
        ans = 0

        for i, ch in enumerate(s):
            if ch == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    # 当前 ')' 没有左括号匹配，成为新的分割点
                    stack.append(i)
                else:
                    # i - stack[-1] 是当前合法段长度
                    ans = max(ans, i - stack[-1])

        return ans
''')),
    16: dict(slug='search-in-rotated-sorted-array', core='旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。', time='O(log n)', space='O(1)', detail='无重复元素时每次都能确定一半区间无答案。', edge=[('nums=[4,5,6,7,0,1,2], target=0', '4', 'target 在右侧有序区间。'), ('nums=[4,5,6,7,0,1,2], target=3', '-1', '不存在时返回 -1。'), ('nums=[1], target=0', '-1', '单元素边界。')], code=code('''
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid

            # 左半边 [left, mid] 有序
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            # 右半边 [mid, right] 有序
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1
''')),
    17: dict(slug='find-first-and-last-position-of-element-in-sorted-array', core='用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。', time='O(log n)', space='O(1)', detail='二分两次，每次区间减半。', edge=[('nums=[5,7,7,8,8,10], target=8', '[3,4]', '标准样例。'), ('nums=[5,7,7,8,8,10], target=6', '[-1,-1]', 'target 不存在。'), ('nums=[], target=0', '[-1,-1]', '空数组。')], code=code('''
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(x: int) -> int:
            left, right = 0, len(nums)
            # 在 [left, right) 中找第一个 >= x 的位置
            while left < right:
                mid = (left + right) // 2
                if nums[mid] < x:
                    left = mid + 1
                else:
                    right = mid
            return left

        start = lower_bound(target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]

        end = lower_bound(target + 1) - 1
        return [start, end]
''')),
    18: dict(slug='combination-sum', core='回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。', time='O(S)', space='O(target/min(candidates))', detail='S 为搜索树节点数，受 target 和候选数影响；递归深度最多 target/min(candidates)。', edge=[('candidates=[2,3,6,7], target=7', '[[2,2,3],[7]]', '同一数字可重复使用。'), ('candidates=[2], target=1', '[]', '所有候选都超过 target。'), ('candidates=[2,3,5], target=8', '多组答案', '需要继续搜索而不是找到一组就停止。')], code=code('''
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        ans = []
        path = []

        def backtrack(start: int, remain: int) -> None:
            if remain == 0:
                ans.append(path[:])
                return

            for i in range(start, len(candidates)):
                x = candidates[i]
                if x > remain:  # 排序后后面更大，直接剪枝
                    break
                path.append(x)
                backtrack(i, remain - x)  # i 不是 i+1，因为可以重复选 x
                path.pop()

        backtrack(0, target)
        return ans
''')),
    19: dict(slug='trapping-rain-water', core='双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。', time='O(n)', space='O(1)', detail='左右指针各只向中间移动，常数变量记录 left_max/right_max。', edge=[('height=[0,1,0,2,1,0,1,3,2,1,2,1]', '6', '经典样例。'), ('height=[4,2,0,3,2,5]', '9', '多段凹槽。'), ('height=[1,2,3]', '0', '单调递增不能接水。')], code=code('''
class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = 0
        ans = 0

        while left < right:
            left_max = max(left_max, height[left])
            right_max = max(right_max, height[right])

            # 左侧最高墙更矮，当前位置水量由 left_max 决定
            if left_max < right_max:
                ans += left_max - height[left]
                left += 1
            else:
                ans += right_max - height[right]
                right -= 1

        return ans
''')),
    20: dict(slug='permutations', core='回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。', time='O(n!·n)', space='O(n)', detail='共有 n! 个排列，每个答案拷贝长度 n；递归栈和 used/path 为 O(n)。', edge=[('nums=[1,2,3]', '6 个排列', '标准全排列。'), ('nums=[0,1]', '[[0,1],[1,0]]', '两个元素。'), ('nums=[1]', '[[1]]', '单元素。')], code=code('''
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        ans = []
        path = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                ans.append(path[:])
                return

            for i, x in enumerate(nums):
                if used[i]:
                    continue
                used[i] = True
                path.append(x)
                backtrack()
                path.pop()
                used[i] = False

        backtrack()
        return ans
''')),
    21: dict(slug='rotate-image', core='顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。', time='O(n²)', space='O(1)', detail='原地处理 n×n 矩阵中每个元素常数次。', edge=[('matrix=[[1]]', '[[1]]', '1×1 不变。'), ('3×3 矩阵', '顺时针旋转', '标准样例。'), ('4×4 矩阵', '顺时针旋转', '偶数阶也适用。')], code=code('''
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)

        # 第一步：沿主对角线转置，matrix[i][j] 与 matrix[j][i] 交换
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        # 第二步：每一行左右反转
        for row in matrix:
            row.reverse()
''')),
    22: dict(slug='group-anagrams', core='字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。', time='O(n·klogk)', space='O(nk)', detail='n 是字符串数量，k 是单词最大长度；排序每个字符串需要 O(klogk)。', edge=[('strs=[""]', '[[""]]', '空字符串也是合法 key。'), ('strs=["a"]', '[["a"]]', '单元素。'), ('strs=["eat","tea","tan","ate","nat","bat"]', '三组', '标准异位词分组。')], code=code('''
from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)

        for word in strs:
            # 异位词排序后的字符序列完全相同
            key = ''.join(sorted(word))
            groups[key].append(word)

        return list(groups.values())
''')),
    23: dict(slug='maximum-subarray', core='dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。', time='O(n)', space='O(1)', detail='Kadane 算法线性扫描，只维护当前最优和全局最优。', edge=[('nums=[-2,1,-3,4,-1,2,1,-5,4]', '6', '[4,-1,2,1]。'), ('nums=[-1]', '-1', '全负数不能初始化为 0。'), ('nums=[5,4,-1,7,8]', '23', '整个数组最优。')], code=code('''
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = ans = nums[0]  # 必须用 nums[0] 初始化，防止全负数错误

        for x in nums[1:]:
            # 如果 cur 为负，接上它只会拖累 x，所以从 x 重新开始
            cur = max(x, cur + x)
            ans = max(ans, cur)

        return ans
''')),
    24: dict(slug='jump-game', core='维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。', time='O(n)', space='O(1)', detail='每个位置只扫描一次，只维护最远覆盖范围。', edge=[('nums=[2,3,1,1,4]', 'true', '最远覆盖能越过终点。'), ('nums=[3,2,1,0,4]', 'false', '会卡在下标 3 的 0。'), ('nums=[0]', 'true', '起点就是终点。')], code=code('''
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0

        for i, jump in enumerate(nums):
            if i > farthest:
                return False  # 当前下标都到不了，后面更不可能
            farthest = max(farthest, i + jump)
            if farthest >= len(nums) - 1:
                return True

        return True
''')),
    25: dict(slug='merge-intervals', core='先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。', time='O(nlogn)', space='O(n)', detail='排序是主要成本；结果数组最坏保存 n 个区间。', edge=[('intervals=[[1,3],[2,6],[8,10],[15,18]]', '[[1,6],[8,10],[15,18]]', '标准重叠合并。'), ('intervals=[[1,4],[4,5]]', '[[1,5]]', '端点相等也算重叠。'), ('intervals=[[1,4],[2,3]]', '[[1,4]]', '被包含区间不能缩短右端点。')], code=code('''
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []

        for start, end in intervals:
            if not merged or start > merged[-1][1]:
                merged.append([start, end])
            else:
                # 当前区间与最后一个区间重叠，右端点取更大值
                merged[-1][1] = max(merged[-1][1], end)

        return merged
''')),
    26: dict(slug='unique-paths', core='到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。', time='O(mn)', space='O(n)', detail='滚动数组 dp[j] 表示当前行第 j 列路径数。', edge=[('m=3, n=7', '28', '标准样例。'), ('m=1, n=10', '1', '只有一行，只能一直向右。'), ('m=10, n=1', '1', '只有一列，只能一直向下。')], code=code('''
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # 第一行每个格子都只有 1 种走法
        dp = [1] * n

        for _ in range(1, m):
            for j in range(1, n):
                # dp[j] 是上方，dp[j-1] 是左方
                dp[j] += dp[j - 1]

        return dp[-1]
''')),
    27: dict(slug='minimum-path-sum', core='dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。', time='O(mn)', space='O(n)', detail='每个格子处理一次；滚动数组只保留一行。', edge=[('grid=[[1,3,1],[1,5,1],[4,2,1]]', '7', '路径 1→3→1→1→1。'), ('grid=[[1,2,3]]', '6', '只有一行。'), ('grid=[[1],[2],[3]]', '6', '只有一列。')], code=code('''
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [0] * n
        dp[0] = grid[0][0]

        # 初始化第一行：只能从左边来
        for j in range(1, n):
            dp[j] = dp[j - 1] + grid[0][j]

        for i in range(1, m):
            dp[0] += grid[i][0]  # 第一列只能从上方来
            for j in range(1, n):
                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]

        return dp[-1]
''')),
    28: dict(slug='climbing-stairs', core='到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。', time='O(n)', space='O(1)', detail='只需要前两阶答案，滚动变量即可。', edge=[('n=1', '1', '一阶只有一种。'), ('n=2', '2', '1+1 或 2。'), ('n=3', '3', '从前两个状态递推。')], code=code('''
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n

        prev2, prev1 = 1, 2  # f(1), f(2)
        for _ in range(3, n + 1):
            cur = prev1 + prev2
            prev2, prev1 = prev1, cur

        return prev1
''')),
    29: dict(slug='edit-distance', core='dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。', time='O(mn)', space='O(mn)', detail='二维表有 (m+1)(n+1) 个状态，每个状态常数转移。', edge=[('word1="horse", word2="ros"', '3', '标准样例。'), ('word1="", word2="abc"', '3', '空串变目标串只能插入。'), ('word1="abc", word2="abc"', '0', '完全相同无需操作。')], code=code('''
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        # word1 前 i 个字符变成空串：删除 i 次
        for i in range(m + 1):
            dp[i][0] = i
        # 空串变成 word2 前 j 个字符：插入 j 次
        for j in range(n + 1):
            dp[0][j] = j

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],     # 删除 word1[i-1]
                        dp[i][j - 1],     # 插入 word2[j-1]
                        dp[i - 1][j - 1]  # 替换 word1[i-1]
                    )

        return dp[m][n]
''')),
    30: dict(slug='sort-colors', core='荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。', time='O(n)', space='O(1)', detail='每个元素最多被交换到所属区域一次，原地排序。', edge=[('nums=[2,0,2,1,1,0]', '[0,0,1,1,2,2]', '标准样例。'), ('nums=[0]', '[0]', '单元素。'), ('nums=[2,2,1,0,0]', '[0,0,1,2,2]', '2 换到右侧后，i 不能立刻加一，要继续检查换来的数。')], code=code('''
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        left, i, right = 0, 0, len(nums) - 1

        while i <= right:
            if nums[i] == 0:
                nums[left], nums[i] = nums[i], nums[left]
                left += 1
                i += 1
            elif nums[i] == 2:
                nums[i], nums[right] = nums[right], nums[i]
                right -= 1
                # 注意：这里 i 不加一，因为换过来的元素还没检查
            else:
                i += 1
''')),
    31: dict(slug='minimum-window-substring', core='滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。', time='O(|s|+|t|)', space='O(字符集大小)', detail='左右指针都只向右移动；计数字典大小受字符集限制。', edge=[('s="ADOBECODEBANC", t="ABC"', '"BANC"', '标准最小覆盖。'), ('s="a", t="aa"', '""', '窗口无法满足重复字符需求。'), ('s="aa", t="aa"', '"aa"', 't 中重复字符需要足够次数。')], code=code('''
from collections import Counter, defaultdict

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        window = defaultdict(int)
        required = len(need)  # 有多少种字符需要满足频次
        formed = 0            # 当前有多少种字符已经满足频次
        left = 0
        best_len = float('inf')
        best_start = 0

        for right, ch in enumerate(s):
            window[ch] += 1
            if ch in need and window[ch] == need[ch]:
                formed += 1

            # 当前窗口已经覆盖 t，尝试收缩到最短
            while formed == required:
                if right - left + 1 < best_len:
                    best_len = right - left + 1
                    best_start = left

                out = s[left]
                window[out] -= 1
                if out in need and window[out] < need[out]:
                    formed -= 1
                left += 1

        return '' if best_len == float('inf') else s[best_start:best_start + best_len]
''')),
    32: dict(slug='subsets', core='子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。', time='O(2^n·n)', space='O(n)', detail='共有 2^n 个子集，拷贝每个子集最坏 O(n)；递归深度 n。', edge=[('nums=[1,2,3]', '8 个子集', '标准样例。'), ('nums=[]', '[[]]', '空集也是子集。'), ('nums=[0]', '[[],[0]]', '单元素。')], code=code('''
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        ans = []
        path = []

        def backtrack(start: int) -> None:
            # 子集题：树上的每一个节点都是答案
            ans.append(path[:])

            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return ans
''')),
    33: dict(slug='word-search', core='从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。', time='O(mn·3^L)', space='O(L)', detail='每个起点 DFS，除第一步外最多 3 个方向可走；L 为单词长度，递归深度 L。', edge=[('board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED"', 'true', '标准路径。'), ('word 长度 > m*n', 'false', '格子不能重复使用。'), ('board=[["a"]], word="a"', 'true', '单格匹配。')], code=code('''
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        if len(word) > m * n:
            return False

        def dfs(i: int, j: int, k: int) -> bool:
            # k 表示正在匹配 word[k]
            if k == len(word):
                return True
            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:
                return False

            saved = board[i][j]
            board[i][j] = '#'  # 标记已访问，防止同一路径重复使用
            found = (
                dfs(i + 1, j, k + 1) or
                dfs(i - 1, j, k + 1) or
                dfs(i, j + 1, k + 1) or
                dfs(i, j - 1, k + 1)
            )
            board[i][j] = saved  # 回溯恢复现场
            return found

        for i in range(m):
            for j in range(n):
                if dfs(i, j, 0):
                    return True
        return False
''')),
    34: dict(slug='search-in-rotated-sorted-array-ii', core='有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。', time='平均 O(log n)，最坏 O(n)', space='O(1)', detail='重复值极端情况下每次只能缩小一格，例如全是 1。', edge=[('nums=[2,5,6,0,0,1,2], target=0', 'true', '标准样例。'), ('nums=[1,0,1,1,1], target=0', 'true', '重复值会干扰有序半边判断。'), ('nums=[1,1,1,1], target=2', 'false', '最坏退化为线性收缩。')], code=code('''
class Solution:
    def search(self, nums: List[int], target: int) -> bool:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return True

            # 重复值挡住判断，只能安全收缩
            if nums[left] == nums[mid] == nums[right]:
                left += 1
                right -= 1
            elif nums[left] <= nums[mid]:  # 左半边有序
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:                          # 右半边有序
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return False
''')),
    35: dict(slug='largest-rectangle-in-histogram', core='单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。', time='O(n)', space='O(n)', detail='每个柱子最多入栈、出栈一次；哨兵 0 负责清空栈。', edge=[('heights=[2,1,5,6,2,3]', '10', '标准样例。'), ('heights=[2,4]', '4', '两根柱子。'), ('heights=[1,1,1]', '3', '相等高度要能累积宽度。')], code=code('''
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        # 两端加 0 哨兵，方便所有柱子最终都出栈
        heights = [0] + heights + [0]
        stack = []  # 栈中下标对应的高度单调递增
        ans = 0

        for i, h in enumerate(heights):
            while stack and h < heights[stack[-1]]:
                mid = stack.pop()
                height = heights[mid]
                width = i - stack[-1] - 1  # 左右第一个更矮柱子之间的宽度
                ans = max(ans, height * width)
            stack.append(i)

        return ans
''')),
    36: dict(slug='maximal-rectangle', core='把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。', time='O(mn)', space='O(n)', detail='每行更新一次高度并在线性时间求柱状图最大面积。', edge=[('matrix 全是 "0"', '0', '没有矩形。'), ('matrix=[["1"]]', '1', '单个 1。'), ('经典 4×5 样例', '6', '连续多行高度累积。')], code=code('''
class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        if not matrix or not matrix[0]:
            return 0

        m, n = len(matrix), len(matrix[0])
        heights = [0] * n
        ans = 0

        def largest_rectangle() -> int:
            arr = [0] + heights + [0]
            stack = []
            best = 0
            for i, h in enumerate(arr):
                while stack and h < arr[stack[-1]]:
                    mid = stack.pop()
                    best = max(best, arr[mid] * (i - stack[-1] - 1))
                stack.append(i)
            return best

        for i in range(m):
            for j in range(n):
                # 如果当前位置是 1，高度加一；遇到 0，高度断开归零
                heights[j] = heights[j] + 1 if matrix[i][j] == '1' else 0
            ans = max(ans, largest_rectangle())

        return ans
''')),
    37: dict(slug='binary-tree-inorder-traversal', core='中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。', time='O(n)', space='O(h)', detail='每个节点入栈出栈一次；栈深度等于树高 h，最坏 O(n)。', edge=[('root=[]', '[]', '空树。'), ('root=[1,null,2,3]', '[1,3,2]', '标准样例。'), ('只有左链', '从叶子到根', '验证左-根-右顺序。')], code=code('''
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        stack = []
        cur = root

        while cur or stack:
            # 先一路走到最左边
            while cur:
                stack.append(cur)
                cur = cur.left

            cur = stack.pop()
            ans.append(cur.val)  # 左子树访问完后访问根
            cur = cur.right      # 再处理右子树

        return ans
''')),
    38: dict(slug='unique-binary-search-trees', core='以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。', time='O(n²)', space='O(n)', detail='dp[i] 需要枚举 i 个根位置，i 从 1 到 n。', edge=[('n=1', '1', '单节点只有一种。'), ('n=3', '5', '卡特兰数经典样例。'), ('n=0（理论边界）', '1', '空树作为组合乘法单位。')], code=code('''
class Solution:
    def numTrees(self, n: int) -> int:
        # dp[i] = i 个不同节点能组成多少种 BST
        dp = [0] * (n + 1)
        dp[0] = 1
        dp[1] = 1

        for nodes in range(2, n + 1):
            for left_count in range(nodes):
                right_count = nodes - 1 - left_count
                dp[nodes] += dp[left_count] * dp[right_count]

        return dp[n]
''')),
    39: dict(slug='validate-binary-search-tree', core='BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。', time='O(n)', space='O(h)', detail='每个节点访问一次；递归栈深度为树高 h。', edge=[('root=[2,1,3]', 'true', '标准合法 BST。'), ('root=[5,1,4,null,null,3,6]', 'false', '3 在 5 的右子树中却小于 5。'), ('存在重复值', 'false', 'BST 通常要求严格小于/大于。')], code=code('''
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:
            if not node:
                return True
            if not (low < node.val < high):
                return False
            # 左子树上界变成 node.val；右子树下界变成 node.val
            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

        return dfs(root, float('-inf'), float('inf'))
''')),
    40: dict(slug='symmetric-tree', core='判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。', time='O(n)', space='O(h)', detail='每个节点最多比较一次；递归栈为树高。', edge=[('root=[1,2,2,3,4,4,3]', 'true', '标准对称。'), ('root=[1,2,2,null,3,null,3]', 'false', '值类似但结构不对称。'), ('root=[]', 'true', '空树可视为对称。')], code=code('''
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
            if not a and not b:
                return True
            if not a or not b:
                return False
            if a.val != b.val:
                return False
            return mirror(a.left, b.right) and mirror(a.right, b.left)

        return True if not root else mirror(root.left, root.right)
''')),
    41: dict(slug='binary-tree-level-order-traversal', core='层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。', time='O(n)', space='O(w)', detail='每个节点入队出队一次；w 是树最大层宽，最坏 O(n)。', edge=[('root=[]', '[]', '空树。'), ('root=[3,9,20,null,null,15,7]', '[[3],[9,20],[15,7]]', '标准样例。'), ('只有一条链', '每层一个元素', '队列宽度为 1。')], code=code('''
from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []

        ans = []
        queue = deque([root])

        while queue:
            level = []
            for _ in range(len(queue)):  # 当前队列长度就是当前层节点数
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            ans.append(level)

        return ans
''')),
    42: dict(slug='maximum-depth-of-binary-tree', core='树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。', time='O(n)', space='O(h)', detail='每个节点访问一次；递归栈深度为树高。', edge=[('root=[]', '0', '空树深度为 0。'), ('root=[3,9,20,null,null,15,7]', '3', '标准样例。'), ('单节点', '1', '只有根节点。')], code=code('''
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        left_depth = self.maxDepth(root.left)
        right_depth = self.maxDepth(root.right)
        return max(left_depth, right_depth) + 1
''')),
    43: dict(slug='construct-binary-tree-from-preorder-and-inorder-traversal', core='前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。', time='O(n)', space='O(n)', detail='哈希表 O(1) 查询根在中序的位置；每个节点递归构造一次。', edge=[('preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]', '原树', '标准样例。'), ('preorder=[-1], inorder=[-1]', '单节点', '最小树。'), ('左/右子树为空', '正常构造', '区间边界不能写错。')], code=code('''
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        index = {val: i for i, val in enumerate(inorder)}
        pre_pos = 0

        def build(in_left: int, in_right: int) -> Optional[TreeNode]:
            nonlocal pre_pos
            if in_left > in_right:
                return None

            root_val = preorder[pre_pos]
            pre_pos += 1
            root = TreeNode(root_val)
            mid = index[root_val]

            # 前序顺序是 根-左-右，所以必须先构造左子树
            root.left = build(in_left, mid - 1)
            root.right = build(mid + 1, in_right)
            return root

        return build(0, len(inorder) - 1)
''')),
    44: dict(slug='flatten-binary-tree-to-linked-list', core='按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。', time='O(n)', space='O(h)', detail='每个节点改指针一次；递归栈为树高。', edge=[('root=[1,2,5,3,4,null,6]', '[1,null,2,null,3,null,4,null,5,null,6]', '标准前序展开。'), ('root=[]', '[]', '空树。'), ('只有左子树', '全部接到右指针', '左指针必须置空。')], code=code('''
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        prev = None

        def dfs(node: Optional[TreeNode]) -> None:
            nonlocal prev
            if not node:
                return
            # 反向前序：先右后左，最后处理根
            dfs(node.right)
            dfs(node.left)

            node.right = prev
            node.left = None
            prev = node

        dfs(root)
''')),
    45: dict(slug='best-time-to-buy-and-sell-stock', core='遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。', time='O(n)', space='O(1)', detail='只需一次扫描和两个变量。', edge=[('prices=[7,1,5,3,6,4]', '5', '1 买 6 卖。'), ('prices=[7,6,4,3,1]', '0', '一直下跌不交易。'), ('prices=[1,2]', '1', '最小有效长度。')], code=code('''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        ans = 0

        for price in prices:
            min_price = min(min_price, price)      # 到今天为止最低买入价
            ans = max(ans, price - min_price)      # 今天卖出能赚多少

        return ans
''')),
    46: dict(slug='binary-tree-maximum-path-sum', core='对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。', time='O(n)', space='O(h)', detail='每个节点后序遍历一次；递归栈为树高。', edge=[('root=[1,2,3]', '6', '路径 2→1→3。'), ('root=[-10,9,20,null,null,15,7]', '42', '路径 15→20→7。'), ('root=[-3]', '-3', '全负数不能把答案初始化为 0。')], code=code('''
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        ans = float('-inf')

        def gain(node: Optional[TreeNode]) -> int:
            nonlocal ans
            if not node:
                return 0

            # 负贡献不如不要，所以与 0 取 max
            left = max(gain(node.left), 0)
            right = max(gain(node.right), 0)

            # 以当前节点为最高点的路径，可以同时接左右两边
            ans = max(ans, node.val + left + right)

            # 返回给父节点时只能选一边，不能分叉
            return node.val + max(left, right)

        gain(root)
        return ans
''')),
    47: dict(slug='longest-consecutive-sequence', core='把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。', time='O(n)', space='O(n)', detail='每个数最多作为连续序列的一部分被访问一次。', edge=[('nums=[100,4,200,1,3,2]', '4', '序列 1,2,3,4。'), ('nums=[]', '0', '空数组。'), ('nums=[1,2,0,1]', '3', '重复数字用集合去重。')], code=code('''
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        ans = 0

        for x in num_set:
            # 只有 x 是序列起点时才开始数，避免从中间重复数
            if x - 1 not in num_set:
                cur = x
                length = 1
                while cur + 1 in num_set:
                    cur += 1
                    length += 1
                ans = max(ans, length)

        return ans
''')),
    48: dict(slug='single-number', core='异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。', time='O(n)', space='O(1)', detail='线性扫描数组，常数变量保存异或结果。', edge=[('nums=[2,2,1]', '1', '基础样例。'), ('nums=[4,1,2,1,2]', '4', '顺序不影响异或结果。'), ('nums=[-1]', '-1', '负数也能异或。')], code=code('''
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x  # 成对的数会被异或抵消
        return ans
''')),
    49: dict(slug='word-break', core='dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。', time='O(n²)', space='O(n)', detail='枚举 i 和 j 两层；哈希集合查询单词平均 O(1)，Python3.9 切片有额外成本但思路复杂度按 O(n²) 记。', edge=[('s="leetcode", wordDict=["leet","code"]', 'true', '标准样例。'), ('s="catsandog", wordDict=["cats","dog","sand","and","cat"]', 'false', '局部能拆不代表整体能拆。'), ('s="aaaaaaa", wordDict=["aaaa","aaa"]', 'true', '需要不同长度组合。')], code=code('''
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        n = len(s)
        dp = [False] * (n + 1)
        dp[0] = True  # 空串可以被拆分

        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break

        return dp[n]
''')),
    50: dict(slug='linked-list-cycle', core='快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。', time='O(n)', space='O(1)', detail='快慢指针访问节点次数线性；不需要额外集合。', edge=[('head=[3,2,0,-4], pos=1', 'true', '标准有环。'), ('head=[1,2], pos=0', 'true', '环连回头节点。'), ('head=[1], pos=-1', 'false', '单节点无环。')], code=code('''
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True

        return False
''')),
    51: dict(slug='linked-list-cycle-ii', core='快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。', time='O(n)', space='O(1)', detail='Floyd 判环加入口定位，均为线性步数。', edge=[('head=[3,2,0,-4], pos=1', '节点 2', '标准入口。'), ('head=[1,2], pos=0', '节点 1', '入口是头节点。'), ('head=[1], pos=-1', 'null', '无环返回 null。')], code=code('''
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                # 相遇后，一个从头出发，一个从相遇点出发
                p = head
                while p != slow:
                    p = p.next
                    slow = slow.next
                return p

        return None
''')),
    52: dict(slug='lru-cache', core='哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。', time='get/put 均摊 O(1)', space='O(capacity)', detail='字典保存 key 到链表节点；链表最多 capacity 个真实节点。', edge=[('capacity=1，连续 put 两个 key', '只保留最新 key', '容量极小时要正确淘汰。'), ('get 不存在的 key', '-1', '不能改变链表。'), ('put 已存在 key', '更新值并移动到最近使用', '不是新增容量。')], code=code('''
class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}  # key -> Node
        self.head = Node()  # 虚拟头：最近使用端
        self.tail = Node()  # 虚拟尾：最久使用端
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node: Node) -> None:
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)  # 访问后变成最近使用
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self._remove(node)
            self._add_to_front(node)
            return

        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)

        if len(self.cache) > self.capacity:
            old = self.tail.prev  # 虚拟尾前一个是真正最久未使用节点
            self._remove(old)
            del self.cache[old.key]
''')),
    53: dict(slug='sort-list', core='链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。', time='O(nlogn)', space='O(logn)', detail='每层合并 O(n)，共 logn 层；递归栈 O(logn)。', edge=[('head=[4,2,1,3]', '[1,2,3,4]', '标准样例。'), ('head=[]', '[]', '空链表。'), ('head=[-1,5,3,4,0]', '[-1,0,3,4,5]', '含负数。')], code=code('''
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head

        # 快慢指针找中点，同时 pre 用于断开前半段
        slow = fast = head
        pre = None
        while fast and fast.next:
            pre = slow
            slow = slow.next
            fast = fast.next.next
        pre.next = None

        left = self.sortList(head)
        right = self.sortList(slow)
        return self.merge(left, right)

    def merge(self, a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:
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
        cur.next = a if a else b
        return dummy.next
''')),
    54: dict(slug='maximum-product-subarray', core='乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。', time='O(n)', space='O(1)', detail='线性扫描，只维护 max_prod/min_prod/ans。', edge=[('nums=[2,3,-2,4]', '6', '2×3。'), ('nums=[-2,0,-1]', '0', '0 会截断乘积。'), ('nums=[-2,3,-4]', '24', '两个负数相乘变最大。')], code=code('''
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        max_prod = min_prod = ans = nums[0]

        for x in nums[1:]:
            if x < 0:
                max_prod, min_prod = min_prod, max_prod
            max_prod = max(x, max_prod * x)
            min_prod = min(x, min_prod * x)
            ans = max(ans, max_prod)

        return ans
''')),
    55: dict(slug='find-minimum-in-rotated-sorted-array', core='无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。', time='O(log n)', space='O(1)', detail='每次比较 mid 和 right 都能排除一半。', edge=[('nums=[3,4,5,1,2]', '1', '标准旋转。'), ('nums=[11,13,15,17]', '11', '没有旋转。'), ('nums=[2,1]', '1', '两个元素。')], code=code('''
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid

        return nums[left]
''')),
    56: dict(slug='find-minimum-in-rotated-sorted-array-ii', core='有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。', time='平均 O(log n)，最坏 O(n)', space='O(1)', detail='重复值极端情况下会退化，例如 [1,1,1,1]。', edge=[('nums=[2,2,2,0,1]', '0', '标准重复旋转。'), ('nums=[1,3,5]', '1', '无重复也能处理。'), ('nums=[1,1,1,0,1]', '0', '重复值挡住二分判断。')], code=code('''
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            elif nums[mid] < nums[right]:
                right = mid
            else:
                right -= 1  # 无法判断，安全丢掉一个重复右端点

        return nums[left]
''')),
    57: dict(slug='min-stack', core='一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。', time='push/pop/top/getMin 均 O(1)', space='O(n)', detail='辅助栈与数据栈同长度，便于 pop 后恢复历史最小值。', edge=[('push(-2),push(0),push(-3),getMin()', '-3', '标准样例。'), ('pop 后 getMin', '恢复上一个最小值', '辅助栈必须同步弹出。'), ('重复最小值', '仍正确', '辅助栈每次都记录当前最小值。')], code=code('''
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        # 当前最小值 = min(新值, 之前最小值)
        if not self.min_stack:
            self.min_stack.append(val)
        else:
            self.min_stack.append(min(val, self.min_stack[-1]))

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
''')),
    58: dict(slug='intersection-of-two-linked-lists', core='两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。', time='O(m+n)', space='O(1)', detail='每个指针最多遍历两条链表。', edge=[('A=[4,1,8,4,5], B=[5,6,1,8,4,5]', '节点 8', '标准相交。'), ('不相交', 'null', '两个指针最终同时为 None。'), ('交点是头节点', '头节点', '两链表完全相同。')], code=code('''
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        p, q = headA, headB

        while p != q:
            p = p.next if p else headB
            q = q.next if q else headA

        return p
''')),
    59: dict(slug='majority-element', core='摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。', time='O(n)', space='O(1)', detail='一次扫描维护 candidate 和 count。', edge=[('nums=[3,2,3]', '3', '标准样例。'), ('nums=[2,2,1,1,1,2,2]', '2', '抵消后剩下 2。'), ('nums=[1]', '1', '单元素。')], code=code('''
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate = None
        count = 0

        for x in nums:
            if count == 0:
                candidate = x
            count += 1 if x == candidate else -1

        return candidate
''')),
    60: dict(slug='house-robber', core='每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。', time='O(n)', space='O(1)', detail='滚动维护 dp[i-2] 和 dp[i-1]。', edge=[('nums=[1,2,3,1]', '4', '偷 1 和 3。'), ('nums=[2,7,9,3,1]', '12', '偷 2、9、1。'), ('nums=[5]', '5', '单间房。')], code=code('''
class Solution:
    def rob(self, nums: List[int]) -> int:
        prev2 = 0  # dp[i-2]
        prev1 = 0  # dp[i-1]

        for money in nums:
            cur = max(prev1, prev2 + money)
            prev2, prev1 = prev1, cur

        return prev1
''')),
    61: dict(slug='number-of-islands', core='遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。', time='O(mn)', space='O(mn)', detail='每个格子最多访问一次；递归栈最坏覆盖整张网格。', edge=[('全是 0', '0', '没有岛。'), ('全是 1', '1', '整片连通。'), ('对角线相邻的 1', '不连通', '只算上下左右。')], code=code('''
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        ans = 0

        def dfs(i: int, j: int) -> None:
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
                return
            grid[i][j] = '0'  # 标记已访问，也可以理解为淹掉陆地
            dfs(i + 1, j)
            dfs(i - 1, j)
            dfs(i, j + 1)
            dfs(i, j - 1)

        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    ans += 1
                    dfs(i, j)

        return ans
''')),
    62: dict(slug='reverse-linked-list', core='遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。', time='O(n)', space='O(1)', detail='每个节点指针反转一次，只用三个指针。', edge=[('head=[1,2,3,4,5]', '[5,4,3,2,1]', '标准样例。'), ('head=[]', '[]', '空链表。'), ('head=[1]', '[1]', '单节点。')], code=code('''
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        cur = head

        while cur:
            nxt = cur.next      # 先保存原来的下一个节点
            cur.next = prev     # 反转指针
            prev = cur          # prev 前进
            cur = nxt           # cur 前进

        return prev
''')),
    63: dict(slug='course-schedule', core='课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。', time='O(V+E)', space='O(V+E)', detail='V 是课程数，E 是先修关系数；建图和 BFS 都是线性。', edge=[('numCourses=2, prerequisites=[[1,0]]', 'true', '0 后可学 1。'), ('numCourses=2, prerequisites=[[1,0],[0,1]]', 'false', '存在环。'), ('prerequisites=[]', 'true', '没有依赖都能学。')], code=code('''
from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses

        for course, pre in prerequisites:
            graph[pre].append(course)
            indegree[course] += 1

        queue = deque(i for i in range(numCourses) if indegree[i] == 0)
        learned = 0

        while queue:
            cur = queue.popleft()
            learned += 1
            for nxt in graph[cur]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        return learned == numCourses
''')),
    64: dict(slug='implement-trie-prefix-tree', core='Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。', time='insert/search/startsWith 均 O(L)', space='O(总字符数)', detail='L 为操作字符串长度；每个新字符最多创建一个节点。', edge=[('insert("apple"), search("apple")', 'true', '完整单词存在。'), ('search("app") 未插入 app', 'false', '前缀不等于完整单词。'), ('startsWith("app")', 'true', '前缀存在即可。')], code=code('''
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
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
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
''')),
    65: dict(slug='kth-largest-element-in-an-array', core='维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。', time='O(nlogk)', space='O(k)', detail='每个元素最多入堆一次，堆大小不超过 k。', edge=[('nums=[3,2,1,5,6,4], k=2', '5', '标准样例。'), ('nums=[3,2,3,1,2,4,5,5,6], k=4', '4', '重复值按出现次数计。'), ('k=1', '最大值', '堆顶就是最大值。')], code=code('''
import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)  # 弹掉当前 k+1 个数中最小的

        return heap[0]
''')),
    66: dict(slug='maximal-square', core='dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。', time='O(mn)', space='O(n)', detail='滚动数组按行更新，每个格子处理一次。', edge=[('matrix 全是 0', '0', '没有正方形。'), ('matrix=[["1"]]', '1', '单个 1 面积为 1。'), ('经典样例', '4', '边长 2 的正方形。')], code=code('''
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [0] * (n + 1)
        max_side = 0

        for i in range(1, m + 1):
            prev_diag = 0  # 保存上一行左上角 dp[j-1]
            for j in range(1, n + 1):
                temp = dp[j]
                if matrix[i - 1][j - 1] == '1':
                    dp[j] = min(dp[j], dp[j - 1], prev_diag) + 1
                    max_side = max(max_side, dp[j])
                else:
                    dp[j] = 0
                prev_diag = temp

        return max_side * max_side
''')),
    67: dict(slug='invert-binary-tree', core='对每个节点交换左右孩子，再递归翻转左右子树。', time='O(n)', space='O(h)', detail='每个节点访问一次；递归栈为树高。', edge=[('root=[]', '[]', '空树。'), ('root=[4,2,7,1,3,6,9]', '[4,7,2,9,6,3,1]', '标准样例。'), ('单节点', '不变', '无左右孩子。')], code=code('''
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        root.left, root.right = root.right, root.left
        self.invertTree(root.left)
        self.invertTree(root.right)
        return root
''')),
    68: dict(slug='palindrome-linked-list', core='快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。', time='O(n)', space='O(1)', detail='找中点、反转、比较都为线性；只用常数指针。', edge=[('head=[1,2,2,1]', 'true', '偶数长度回文。'), ('head=[1,2,3,2,1]', 'true', '奇数长度回文。'), ('head=[1,2]', 'false', '不回文。')], code=code('''
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # 反转后半段
        prev = None
        cur = slow
        while cur:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt

        # prev 是后半段反转后的头
        p1, p2 = head, prev
        while p2:
            if p1.val != p2.val:
                return False
            p1 = p1.next
            p2 = p2.next

        return True
''')),
    69: dict(slug='lowest-common-ancestor-of-a-binary-tree', core='后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。', time='O(n)', space='O(h)', detail='每个节点最多访问一次；递归栈为树高。', edge=[('p=5, q=1', '3', '分别在根的两侧。'), ('p=5, q=4', '5', '一个节点是另一个节点祖先。'), ('p/q 都存在', '返回节点对象', '不是返回值。')], code=code('''
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root

        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        if left and right:
            return root
        return left if left else right
''')),
    70: dict(slug='product-of-array-except-self', core='答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。', time='O(n)', space='O(1)', detail='不计输出数组，额外只用 right_product 一个变量。', edge=[('nums=[1,2,3,4]', '[24,12,8,6]', '标准样例。'), ('nums=[-1,1,0,-3,3]', '[0,0,9,0,0]', '有一个 0 时只有 0 位置非零。'), ('nums=[0,0]', '[0,0]', '两个 0 时全为 0。')], code=code('''
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [1] * n

        # ans[i] 先存 nums[i] 左侧所有数的乘积
        left_product = 1
        for i in range(n):
            ans[i] = left_product
            left_product *= nums[i]

        # 再从右往左乘上右侧所有数的乘积
        right_product = 1
        for i in range(n - 1, -1, -1):
            ans[i] *= right_product
            right_product *= nums[i]

        return ans
''')),
    71: dict(slug='sliding-window-maximum', core='单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。', time='O(n)', space='O(k)', detail='每个下标最多进队出队一次；队列最多保存 k 个下标。', edge=[('nums=[1,3,-1,-3,5,3,6,7], k=3', '[3,3,5,5,6,7]', '标准样例。'), ('k=1', '原数组', '窗口大小为 1。'), ('nums=[1], k=1', '[1]', '单元素。')], code=code('''
from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        q = deque()  # 存下标，且 nums[q] 单调递减
        ans = []

        for i, x in enumerate(nums):
            # 移除窗口左侧过期下标
            if q and q[0] <= i - k:
                q.popleft()

            # 新元素更大时，队尾较小元素不可能再成为最大值
            while q and nums[q[-1]] <= x:
                q.pop()
            q.append(i)

            if i >= k - 1:
                ans.append(nums[q[0]])

        return ans
''')),
    72: dict(slug='search-a-2d-matrix-ii', core='从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。', time='O(m+n)', space='O(1)', detail='行号最多增加 m 次，列号最多减少 n 次。', edge=[('target=5 在矩阵中', 'true', '标准样例。'), ('target=20 不在矩阵中', 'false', '会越界退出。'), ('1×1 矩阵', '按值判断', '最小矩阵。')], code=code('''
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        row, col = 0, n - 1  # 右上角

        while row < m and col >= 0:
            if matrix[row][col] == target:
                return True
            elif matrix[row][col] > target:
                col -= 1  # 当前列下面更大，整列可排除
            else:
                row += 1  # 当前行左边更小，整行可排除

        return False
''')),
    73: dict(slug='perfect-squares', core='完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。', time='O(n√n)', space='O(n)', detail='平方数有 √n 个，每个更新 n 个容量。', edge=[('n=12', '3', '4+4+4。'), ('n=13', '2', '4+9。'), ('n=1', '1', '1。')], code=code('''
class Solution:
    def numSquares(self, n: int) -> int:
        dp = [float('inf')] * (n + 1)
        dp[0] = 0

        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
        for square in squares:
            for amount in range(square, n + 1):
                dp[amount] = min(dp[amount], dp[amount - square] + 1)

        return dp[n]
''')),
    74: dict(slug='move-zeroes', core='用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。', time='O(n)', space='O(1)', detail='原地扫描数组，最多写入两遍。', edge=[('nums=[0,1,0,3,12]', '[1,3,12,0,0]', '标准样例。'), ('nums=[0,0]', '[0,0]', '全零。'), ('nums=[1,2]', '[1,2]', '无零保持相对顺序。')], code=code('''
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        slow = 0

        # 先把所有非零元素按原相对顺序放到前面
        for x in nums:
            if x != 0:
                nums[slow] = x
                slow += 1

        # 剩下的位置补 0
        for i in range(slow, len(nums)):
            nums[i] = 0
''')),
    75: dict(slug='find-the-duplicate-number', core='把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。', time='O(n)', space='O(1)', detail='Floyd 快慢指针两阶段定位入口。', edge=[('nums=[1,3,4,2,2]', '2', '标准样例。'), ('nums=[3,1,3,4,2]', '3', '重复数可能在前面。'), ('nums=[1,1]', '1', '最小规模。')], code=code('''
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = fast = nums[0]

        # 第一阶段：快慢指针在环内相遇
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break

        # 第二阶段：从起点和相遇点同步走，入口就是重复数
        finder = nums[0]
        while finder != slow:
            finder = nums[finder]
            slow = nums[slow]

        return finder
''')),
    76: dict(slug='serialize-and-deserialize-binary-tree', core='前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。', time='O(n)', space='O(n)', detail='每个真实节点和空指针标记各处理一次；字符串/队列存储 O(n)。', edge=[('root=[]', '"#"', '空树。'), ('root=[1,2,3,null,null,4,5]', '可还原', '标准树。'), ('含负数节点', '可还原', '字符串转 int。')], code=code('''
from collections import deque

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
        vals = deque(data.split(','))

        def dfs():
            val = vals.popleft()
            if val == '#':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node

        return dfs()
''')),
    77: dict(slug='longest-increasing-subsequence', core='tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。', time='O(nlogn)', space='O(n)', detail='每个数二分一次 tails，tails 最长 n。', edge=[('nums=[10,9,2,5,3,7,101,18]', '4', '[2,3,7,101]。'), ('nums=[0,1,0,3,2,3]', '4', '重复和回落。'), ('nums=[7,7,7,7]', '1', '严格递增，重复不能增长。')], code=code('''
import bisect

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []

        for x in nums:
            # 严格递增：找第一个 >= x 的位置替换
            pos = bisect.bisect_left(tails, x)
            if pos == len(tails):
                tails.append(x)
            else:
                tails[pos] = x

        return len(tails)
''')),
    78: dict(slug='best-time-to-buy-and-sell-stock-with-cooldown', core='三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。', time='O(n)', space='O(1)', detail='每天只更新三个状态变量。', edge=[('prices=[1,2,3,0,2]', '3', '卖出后冷冻一天。'), ('prices=[1]', '0', '一天无法获利。'), ('prices=[6,1,3,2,4,7]', '6', '多次交易但有冷冻限制。')], code=code('''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        hold = -prices[0]  # 手里持有股票的最大收益
        sold = 0           # 今天刚卖出后的最大收益
        rest = 0           # 不持股且不处于刚卖出状态的最大收益

        for price in prices[1:]:
            prev_hold, prev_sold, prev_rest = hold, sold, rest
            hold = max(prev_hold, prev_rest - price)
            sold = prev_hold + price
            rest = max(prev_rest, prev_sold)

        return max(sold, rest)
''')),
    79: dict(slug='burst-balloons', core='区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。', time='O(n³)', space='O(n²)', detail='区间长度 O(n)，左右端点 O(n)，每个区间枚举 k。', edge=[('nums=[3,1,5,8]', '167', '标准样例。'), ('nums=[1,5]', '10', '两只气球。'), ('包含 0', '可处理', '0 作为气球值会影响乘积但不影响状态定义。')], code=code('''
class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        arr = [1] + nums + [1]
        n = len(arr)
        dp = [[0] * n for _ in range(n)]

        # length 是开区间 (left, right) 的跨度
        for length in range(2, n):
            for left in range(0, n - length):
                right = left + length
                for k in range(left + 1, right):
                    coins = arr[left] * arr[k] * arr[right]
                    dp[left][right] = max(dp[left][right], dp[left][k] + coins + dp[k][right])

        return dp[0][n - 1]
''')),
    80: dict(slug='coin-change', core='完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。', time='O(amount·len(coins))', space='O(amount)', detail='每个硬币更新 amount 个容量。', edge=[('coins=[1,2,5], amount=11', '3', '5+5+1。'), ('coins=[2], amount=3', '-1', '无法凑出。'), ('amount=0', '0', '凑 0 元需要 0 枚。')], code=code('''
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0

        for coin in coins:
            for x in range(coin, amount + 1):
                dp[x] = min(dp[x], dp[x - coin] + 1)

        return -1 if dp[amount] == amount + 1 else dp[amount]
''')),
    81: dict(slug='house-robber-iii', core='树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。', time='O(n)', space='O(h)', detail='每个节点后序计算一次；递归栈为树高。', edge=[('root=[3,2,3,null,3,null,1]', '7', '偷根和两个孙子。'), ('root=[3,4,5,1,3,null,1]', '9', '不偷根更优。'), ('root=[]', '0', '空树收益为 0。')], code=code('''
class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def dfs(node: Optional[TreeNode]):
            if not node:
                return (0, 0)

            left_rob, left_not = dfs(node.left)
            right_rob, right_not = dfs(node.right)

            rob_cur = node.val + left_not + right_not
            not_rob_cur = max(left_rob, left_not) + max(right_rob, right_not)
            return (rob_cur, not_rob_cur)

        return max(dfs(root))
''')),
    82: dict(slug='counting-bits', core='利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。', time='O(n)', space='O(n)', detail='从 0 到 n 每个数 O(1) 递推。', edge=[('n=2', '[0,1,1]', '0,1,2。'), ('n=5', '[0,1,1,2,1,2]', '标准样例。'), ('n=0', '[0]', '只返回 0。')], code=code('''
class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)

        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)

        return ans
''')),
    83: dict(slug='top-k-frequent-elements', core='先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。', time='O(n)', space='O(n)', detail='统计和扫桶都是线性；桶总容量 n+1。', edge=[('nums=[1,1,1,2,2,3], k=2', '[1,2]', '标准样例。'), ('nums=[1], k=1', '[1]', '单元素。'), ('频率相同', '任意顺序可接受', '题目通常不要求固定顺序。')], code=code('''
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]

        for num, freq in count.items():
            buckets[freq].append(num)

        ans = []
        for freq in range(len(buckets) - 1, 0, -1):
            for num in buckets[freq]:
                ans.append(num)
                if len(ans) == k:
                    return ans

        return ans
''')),
    84: dict(slug='decode-string', core='遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。', time='O(输出字符串长度)', space='O(嵌套深度+输出长度)', detail='每个输出字符最终都会生成；栈保存嵌套上下文。', edge=[('s="3[a]2[bc]"', '"aaabcbc"', '标准样例。'), ('s="3[a2[c]]"', '"accaccacc"', '嵌套括号。'), ('s="10[a]"', '10 个 a', '多位数字。')], code=code('''
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
''')),
    85: dict(slug='evaluate-division', core='把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。', time='O(E+Q·(V+E))', space='O(V+E)', detail='建图线性；每个查询最坏 DFS/BFS 一遍图。', edge=[('a/b=2,b/c=3, 查询 a/c', '6.0', '路径乘积。'), ('查询未知变量', '-1.0', '节点不存在。'), ('查询 a/a 且 a 存在', '1.0', '自己除自己。')], code=code('''
from collections import defaultdict

class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(list)
        for (a, b), val in zip(equations, values):
            graph[a].append((b, val))
            graph[b].append((a, 1.0 / val))

        def dfs(cur: str, target: str, product: float, visited: set) -> float:
            if cur == target:
                return product
            visited.add(cur)
            for nxt, weight in graph[cur]:
                if nxt not in visited:
                    res = dfs(nxt, target, product * weight, visited)
                    if res != -1.0:
                        return res
            return -1.0

        ans = []
        for a, b in queries:
            if a not in graph or b not in graph:
                ans.append(-1.0)
            else:
                ans.append(dfs(a, b, 1.0, set()))
        return ans
''')),
    86: dict(slug='queue-reconstruction-by-height', core='先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。', time='O(n²)', space='O(n)', detail='排序 O(nlogn)，列表中间插入最坏 O(n)，总 O(n²)。', edge=[('people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]', '[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]', '标准样例。'), ('相同身高不同 k', 'k 小的先插入', '排序第二关键字升序。'), ('单人', '原样返回', '最小规模。')], code=code('''
class Solution:
    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:
        # 高个先排；同身高 k 小的先排
        people.sort(key=lambda x: (-x[0], x[1]))
        ans = []

        for person in people:
            ans.insert(person[1], person)

        return ans
''')),
    87: dict(slug='partition-equal-subset-sum', core='问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。', time='O(n·target)', space='O(target)', detail='target=sum(nums)/2；每个数只能用一次，所以容量倒序遍历。', edge=[('nums=[1,5,11,5]', 'true', '可以分成 11 和 11。'), ('nums=[1,2,3,5]', 'false', '无法凑半和。'), ('总和为奇数', 'false', '不可能平分。')], code=code('''
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2 == 1:
            return False

        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True

        for num in nums:
            # 0/1 背包必须倒序，防止同一个 num 被重复使用
            for cap in range(target, num - 1, -1):
                dp[cap] = dp[cap] or dp[cap - num]

        return dp[target]
''')),
    88: dict(slug='path-sum-iii', core='树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。', time='O(n)', space='O(h)', detail='每个节点访问一次；哈希表维护当前根到节点路径上的前缀和。', edge=[('root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8', '3', '标准样例。'), ('含负数', '可处理', '前缀和比滑动窗口更适合。'), ('路径不一定从根开始', '能统计', '任意祖先到当前节点。')], code=code('''
from collections import defaultdict

class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix = defaultdict(int)
        prefix[0] = 1
        ans = 0

        def dfs(node: Optional[TreeNode], cur_sum: int) -> None:
            nonlocal ans
            if not node:
                return

            cur_sum += node.val
            ans += prefix[cur_sum - targetSum]

            prefix[cur_sum] += 1
            dfs(node.left, cur_sum)
            dfs(node.right, cur_sum)
            prefix[cur_sum] -= 1  # 回溯，离开当前路径

        dfs(root, 0)
        return ans
''')),
    89: dict(slug='find-all-anagrams-in-a-string', core='固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。', time='O(|s|+|p|)', space='O(字符集大小)', detail='每个字符进出窗口一次；计数表大小固定。', edge=[('s="cbaebabacd", p="abc"', '[0,6]', '标准样例。'), ('s="abab", p="ab"', '[0,1,2]', '重叠异位词。'), ('len(p)>len(s)', '[]', '窗口都形成不了。')], code=code('''
from collections import Counter

class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        m, n = len(s), len(p)
        if n > m:
            return []

        need = Counter(p)
        window = Counter(s[:n])
        ans = []

        if window == need:
            ans.append(0)

        for right in range(n, m):
            left = right - n
            out = s[left]
            window[out] -= 1
            if window[out] == 0:
                del window[out]

            window[s[right]] += 1
            if window == need:
                ans.append(left + 1)

        return ans
''')),
    90: dict(slug='find-all-numbers-disappeared-in-an-array', core='数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。', time='O(n)', space='O(1)', detail='原地标记，不计返回数组只用常数空间。', edge=[('nums=[4,3,2,7,8,2,3,1]', '[5,6]', '标准样例。'), ('nums=[1,1]', '[2]', '重复导致缺失。'), ('nums=[1,2,3]', '[]', '没有缺失。')], code=code('''
class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        for x in nums:
            idx = abs(x) - 1
            if nums[idx] > 0:
                nums[idx] = -nums[idx]

        ans = []
        for i, x in enumerate(nums):
            if x > 0:
                ans.append(i + 1)

        return ans
''')),
    91: dict(slug='hamming-distance', core='两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。', time='O(1)', space='O(1)', detail='整数位数固定；也可用 Brian Kernighan 算法按 1 的个数循环。', edge=[('x=1, y=4', '2', '001 与 100 有两位不同。'), ('x=0, y=0', '0', '完全相同。'), ('x=3, y=1', '1', '011 与 001。')], code=code('''
class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        z = x ^ y  # 不同的位置为 1
        count = 0
        while z:
            z &= z - 1  # 每次消掉最低位的 1
            count += 1
        return count
''')),
    92: dict(slug='target-sum', core='给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。', time='O(n·bag)', space='O(bag)', detail='bag=(sum+target)/2；0/1 背包计数，容量倒序。', edge=[('nums=[1,1,1,1,1], target=3', '5', '标准样例。'), ('abs(target)>sum(nums)', '0', '不可能达到。'), ('nums 含 0', '方案数会翻倍', '0 取正负都不改变和。')], code=code('''
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 == 1:
            return 0

        bag = (total + target) // 2
        dp = [0] * (bag + 1)
        dp[0] = 1

        for num in nums:
            for cap in range(bag, num - 1, -1):
                dp[cap] += dp[cap - num]

        return dp[bag]
''')),
    93: dict(slug='convert-bst-to-greater-tree', core='BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。', time='O(n)', space='O(h)', detail='每个节点访问一次；递归栈为树高。', edge=[('root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]', '累加树', '标准样例。'), ('单节点', '不变', '只有自己。'), ('右斜树', '从大到小累加', '验证反向中序。')], code=code('''
class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0

        def reverse_inorder(node: Optional[TreeNode]) -> None:
            nonlocal total
            if not node:
                return
            reverse_inorder(node.right)
            total += node.val
            node.val = total
            reverse_inorder(node.left)

        reverse_inorder(root)
        return root
''')),
    94: dict(slug='diameter-of-binary-tree', core='每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。', time='O(n)', space='O(h)', detail='每个节点访问一次；递归栈为树高。', edge=[('root=[1,2,3,4,5]', '3', '路径 4→2→1→3 或 5→2→1→3。'), ('root=[1,2]', '1', '两个节点一条边。'), ('单节点', '0', '直径按边数计算。')], code=code('''
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        ans = 0

        def depth(node: Optional[TreeNode]) -> int:
            nonlocal ans
            if not node:
                return 0
            left = depth(node.left)
            right = depth(node.right)
            ans = max(ans, left + right)
            return max(left, right) + 1

        depth(root)
        return ans
''')),
    95: dict(slug='subarray-sum-equals-k', core='前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。', time='O(n)', space='O(n)', detail='一次扫描，哈希表记录前缀和出现次数。', edge=[('nums=[1,1,1], k=2', '2', '标准样例。'), ('nums=[1,-1,0], k=0', '3', '有负数，不能用滑动窗口。'), ('nums=[0,0], k=0', '3', '前缀和次数累加。')], code=code('''
from collections import defaultdict

class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = defaultdict(int)
        count[0] = 1
        cur = 0
        ans = 0

        for x in nums:
            cur += x
            ans += count[cur - k]
            count[cur] += 1

        return ans
''')),
    96: dict(slug='shortest-unsorted-continuous-subarray', core='从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。', time='O(n)', space='O(1)', detail='左右各扫描一次。', edge=[('nums=[2,6,4,8,10,9,15]', '5', '排序 [6,4,8,10,9]。'), ('nums=[1,2,3,4]', '0', '已经有序。'), ('nums=[1]', '0', '单元素有序。')], code=code('''
class Solution:
    def findUnsortedSubarray(self, nums: List[int]) -> int:
        n = len(nums)
        right = -1
        max_seen = float('-inf')

        for i in range(n):
            if nums[i] < max_seen:
                right = i
            else:
                max_seen = nums[i]

        left = n
        min_seen = float('inf')
        for i in range(n - 1, -1, -1):
            if nums[i] > min_seen:
                left = i
            else:
                min_seen = nums[i]

        return 0 if right == -1 else right - left + 1
''')),
    97: dict(slug='merge-two-binary-trees', core='两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。', time='O(min(m,n)) 或 O(m+n)', space='O(h)', detail='若直接复用节点，只递归两树重叠部分；递归栈取决于树高。', edge=[('root1=[1,3,2,5], root2=[2,1,3,null,4,null,7]', '[3,4,5,5,4,null,7]', '标准样例。'), ('一棵树为空', '返回另一棵树', '空树边界。'), ('两个节点都为空', 'null', '递归终止。')], code=code('''
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
''')),
    98: dict(slug='task-scheduler', core='先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。', time='O(N)', space='O(1)', detail='任务种类固定为大写字母，计数空间常数；扫描任务一次。', edge=[('tasks=["A","A","A","B","B","B"], n=2', '8', 'A B idle A B idle A B。'), ('n=0', 'len(tasks)', '没有冷却时间。'), ('多个最高频任务', '最后一列加 cnt', '如 A、B 同频。')], code=code('''
from collections import Counter

class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        freq = Counter(tasks)
        max_count = max(freq.values())
        max_kinds = sum(1 for v in freq.values() if v == max_count)

        # 先用最高频任务撑开框架，再与任务总数取最大值
        frame = (max_count - 1) * (n + 1) + max_kinds
        return max(frame, len(tasks))
''')),
    99: dict(slug='palindromic-substrings', core='每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。', time='O(n²)', space='O(1)', detail='2n-1 个中心，每个中心最坏扩展 O(n)。', edge=[('s="abc"', '3', '每个单字符都是回文。'), ('s="aaa"', '6', 'a,a,a,aa,aa,aaa。'), ('s=""', '0', '空串为 0。')], code=code('''
class Solution:
    def countSubstrings(self, s: str) -> int:
        ans = 0

        def expand(left: int, right: int) -> None:
            nonlocal ans
            while left >= 0 and right < len(s) and s[left] == s[right]:
                ans += 1
                left -= 1
                right += 1

        for i in range(len(s)):
            expand(i, i)       # 奇数长度回文
            expand(i, i + 1)   # 偶数长度回文

        return ans
''')),
    100: dict(slug='daily-temperatures', core='单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。', time='O(n)', space='O(n)', detail='每个下标最多入栈出栈一次。', edge=[('temperatures=[73,74,75,71,69,72,76,73]', '[1,1,4,2,1,1,0,0]', '标准样例。'), ('temperatures=[30,40,50,60]', '[1,1,1,0]', '单调递增。'), ('temperatures=[30,30,30]', '[0,0,0]', '相等不是更暖和。')], code=code('''
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        ans = [0] * len(temperatures)
        stack = []  # 存下标，且对应温度单调递减

        for i, temp in enumerate(temperatures):
            while stack and temp > temperatures[stack[-1]]:
                prev = stack.pop()
                ans[prev] = i - prev
            stack.append(i)

        return ans
''')),
}

# Category-specific scaffolding for hand-written interview steps and pitfalls.
CATEGORY_STEPS = {
    '哈希': ['先说暴力解的重复查找在哪里。', '定义哈希表 key/value 分别保存什么。', '遍历时先查询再更新哈希表，避免自匹配或漏算。', '用重复值、负数、空/极小输入检查边界。'],
    '双指针': ['先明确两个指针分别代表什么边界。', '证明每次移动哪一个指针不会漏答案。', '在循环内先更新答案，再移动指针。', '用最小长度、单调数组、重复值样例检查。'],
    '滑动窗口': ['明确窗口内维护的条件是什么。', '右指针扩张并更新窗口状态。', '当窗口不满足/已经满足条件时移动左指针。', '每次更新答案时确认窗口左右边界是否闭区间。'],
    '链表': ['先画 dummy、prev、cur、next 等指针位置。', '明确循环结束条件，避免空指针访问。', '每次改 next 前先保存后续节点。', '用删除头节点、单节点、长度不一致样例检查。'],
    '栈': ['明确栈里存值还是下标，以及栈的单调性/匹配意义。', '遇到触发条件时持续弹栈并结算答案。', '加入哨兵或初始化边界，统一处理空栈。', '用空输入、重复值、完全单调样例检查。'],
    '回溯': ['画出搜索树：每层做什么选择。', '写终止条件，并在终止时拷贝 path。', 'for 循环横向枚举，递归纵向深入。', '递归回来必须撤销选择，必要时排序剪枝。'],
    '动态规划': ['定义 dp 数组含义，必须能用一句话解释。', '推导递推公式：当前状态从哪些旧状态来。', '确定初始化和遍历顺序。', '用最小规模手推 dp 表验证。'],
    '多维动态规划': ['定义二维/区间状态，明确下标是否表示前 i 个。', '写出状态转移依赖哪些方向或子区间。', '先初始化空串、第一行/列或长度边界。', '按依赖关系确定遍历顺序，手推小样例。'],
    '二分查找': ['明确二分区间是闭区间还是左闭右开。', '写出 mid 后判断哪一半一定无答案。', '更新 left/right 时保证区间收缩。', '用单元素、无答案、重复/旋转边界检查。'],
    '普通数组': ['先找数组结构：前缀、区间、排序或原地标记。', '定义扫描过程中维护的不变量。', '每次更新前确认是否破坏原相对顺序或边界。', '用空/单元素、重复值、全有序样例检查。'],
    '矩阵': ['先明确坐标含义和行列边界。', '利用矩阵的排序、层次或方向性质排除范围。', '更新坐标时保证不会越界和重复访问。', '用 1×1、单行、单列样例检查。'],
    '二叉树': ['先判断应该前序、中序、后序还是层序。', '写递归函数的返回值含义。', '处理空节点作为终止条件。', '在单层逻辑里组合左右子树结果。'],
    '贪心': ['先说明局部最优选择是什么。', '证明这个选择不会损失全局最优。', '遍历中维护覆盖范围、最优候选或排序结构。', '用反例尝试推翻贪心，确认边界。'],
    '图论': ['先把问题翻译成点和边。', '选择 DFS/BFS/拓扑排序/并查集。', '维护 visited、入度或父节点等状态。', '用不连通、有环、单点图样例检查。'],
    '堆': ['先说明为什么只需要维护前 k 个或当前最优。', '确定用小顶堆还是大顶堆。', '保持堆大小或弹出规则。', '用 k=1、重复值、频率相同样例检查。'],
    '子串': ['先判断是前缀和、滑动窗口还是单调队列。', '明确连续区间的左右边界。', '维护窗口/前缀哈希中的计数含义。', '用负数、重复、空窗口样例检查。'],
    '技巧': ['先识别题目的特殊性质或数学不变量。', '把性质落实为变量或原地操作。', '每一步都保持不变量不被破坏。', '用极端值、重复值、已排序样例检查。'],
}

PITFALLS = {
    '哈希': ['哈希表 key/value 含义写反，导致返回数值而不是下标。', '更新哈希表的先后顺序错误，可能把当前元素和自己配对。', '没有考虑重复值或负数。'],
    '双指针': ['不知道为什么移动左指针或右指针，靠猜会漏答案。', '循环边界写成 <= 或 < 时没有配合题意。', '更新答案和移动指针的顺序写反。'],
    '滑动窗口': ['窗口收缩条件写错，导致窗口里仍然不合法。', '字符频次只判断种类，不判断数量。', '答案更新时机不对，最短/最长窗口混淆。'],
    '链表': ['改指针前没有保存 next，导致链表断开。', '删除或合并头节点时没用 dummy，边界很容易崩。', 'while 条件没有保护 None.next。'],
    '栈': ['栈里到底存下标还是值没有想清楚。', '弹栈后没有重新判断栈是否为空。', '相等元素的处理规则和题目要求不一致。'],
    '回溯': ['忘记 path.pop() 回溯，导致结果互相污染。', '终止条件没有拷贝 path，而是直接引用。', 'start、used、剪枝条件混用。'],
    '动态规划': ['dp 含义没有定义清楚就写公式。', '初始化边界漏掉，导致小样例错误。', '遍历顺序和状态依赖方向相反。'],
    '多维动态规划': ['i/j 表示前 i 个还是下标 i 混淆。', '第一行第一列或空区间初始化错误。', '区间 DP 没按长度枚举，依赖状态还没算出来。'],
    '二分查找': ['边界是闭区间还是左闭右开混用。', 'left/right 更新不收缩，死循环。', '重复元素或旋转数组中无法判断有序半边时处理不当。'],
    '普通数组': ['排序后忘记原题是否要求保持原顺序。', '原地修改数组后还用原值做判断。', '边界样例空数组/单元素没有处理。'],
    '矩阵': ['行列下标写反。', '边界判断漏掉单行单列。', '原地标记后忘记恢复或影响后续搜索。'],
    '二叉树': ['递归返回值含义不清，左右子树结果不会合并。', '空节点终止条件漏写。', '把“节点值相等”和“节点对象相等”混淆。'],
    '贪心': ['只会写代码但说不出局部最优为什么成立。', '需要排序的贪心忘记排序规则。', '把“能不能到达”和“最少几步到达”混成一题。'],
    '图论': ['建边方向写反。', 'visited 标记时机错误，导致重复搜索或死循环。', '拓扑排序忘记统计最终取出的节点数。'],
    '堆': ['小顶堆/大顶堆方向选反。', '堆大小没有限制，复杂度退化。', '重复值和频率相同的情况没有想清楚。'],
    '子串': ['连续子数组/子串和子序列混淆。', '有负数时误用滑动窗口。', '前缀和计数没有先初始化 0。'],
    '技巧': ['只记结论不记不变量，面试官换问法就不会。', '原地操作覆盖了还要用的信息。', '极端样例没有验证。'],
}

CHECKLIST_DEFAULT = ['能用自己的话讲出暴力解和优化瓶颈。', '能写出核心不变量，并解释每个变量的含义。', '能手推至少一个普通样例和一个边界样例。', '能准确说出时间复杂度和空间复杂度。']


def with_comment_header(src: str, core: str, edge_cases) -> str:
    """为每道题统一补一层面试讲解注释，保证页面展示的代码不是裸代码。"""
    src = src.strip('\n')
    if src.startswith('# 核心思路：'):
        return src
    first_edge = edge_cases[0][0] if edge_cases else '常规输入'
    header = (
        f"# 核心思路：{core}\n"
        f"# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 {first_edge} 检查代码。\n"
    )
    return header + src

# Parse current problems.ts by asking node/typescript to transpile and print JSON.
node_script = r'''
const ts = require('typescript');
const fs = require('fs');
const vm = require('vm');
const text = fs.readFileSync('src/data/problems.ts','utf8');
const out = ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const sandbox = {exports:{}};
vm.createContext(sandbox);
vm.runInContext(out,sandbox);
console.log(JSON.stringify(sandbox.exports.problems));
'''
problems = json.loads(subprocess.check_output(['node', '-e', node_script], cwd=ROOT, text=True))

if len(problems) != 100:
    raise SystemExit(f'Expected 100 problems, got {len(problems)}')
if set(BANK) != {p['id'] for p in problems}:
    missing = {p['id'] for p in problems} - set(BANK)
    extra = set(BANK) - {p['id'] for p in problems}
    raise SystemExit(f'Coverage mismatch missing={missing} extra={extra}')

refinements = {}
for p in problems:
    b = BANK[p['id']]
    slug = b['slug']
    category = p['category']
    annotated_code = with_comment_header(b['code'], b['core'], b['edge'])
    ref = {
        'leetcodeId': p['leetcodeId'],
        'title': p['title'],
        'slug': slug,
        'coreIdea': b['core'],
        'handwriteSteps': CATEGORY_STEPS.get(category, CHECKLIST_DEFAULT),
        'edgeCases': [{'input': e[0], 'expected': e[1], 'why': e[2]} for e in b['edge']],
        'annotatedCode': annotated_code,
        'complexity': {'time': b['time'], 'space': b['space'], 'detail': b['detail']},
        'commonPitfalls': PITFALLS.get(category, ['边界条件没有覆盖。', '变量含义没有说清楚。', '复杂度分析不准确。']),
        'interviewChecklist': CHECKLIST_DEFAULT,
    }
    refinements[p['leetcodeId']] = ref

    # Patch core problem data so old components also show exact, polished content.
    p['slug'] = slug
    p['externalUrl'] = f'https://leetcode.cn/problems/{slug}/'
    p['solutionCode'] = annotated_code
    p['hints']['level6'] = annotated_code
    p['complexity'] = {'time': b['time'], 'space': b['space']}
    p['commonMistakes'] = ref['commonPitfalls']
    p['reviewQuestions'] = [
        f'这道题的核心不变量是什么？请结合「{p["title"]}」手推一遍。',
        '如果输入命中边界样例，代码会走到哪一行？',
        '为什么时间复杂度和空间复杂度分别是当前结论？',
        '面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？',
    ]
    p['pseudocode'] = '\n'.join(f'{i+1}. {step}' for i, step in enumerate(ref['handwriteSteps']))
    if '通过选择合适的数据结构或算法策略' in p.get('optimizedIdea','') or '详见' in p.get('optimizedIdea',''):
        p['optimizedIdea'] = b['core'] + ' ' + b['detail']

# Write patched problems.ts
problems_ts = "import { Problem } from '@/types';\n\n"
problems_ts += 'export const problems: Problem[] = '
problems_ts += json.dumps(problems, ensure_ascii=False, indent=2)
problems_ts += ';\n\n'
problems_ts += "export function getProblemBySlug(slug: string): Problem | undefined {\n  return problems.find((p) => p.slug === slug);\n}\n\n"
problems_ts += "export function getProblemsByCategory(category: string): Problem[] {\n  return problems.filter((p) => p.category === category);\n}\n"
(ROOT / 'src/data/problems.ts').write_text(problems_ts, encoding='utf-8')

# Write problemRefinements.ts
ref_ts = "export interface RefinedEdgeCase {\n  input: string;\n  expected: string;\n  why: string;\n}\n\n"
ref_ts += "export interface RefinedComplexity {\n  time: string;\n  space: string;\n  detail: string;\n}\n\n"
ref_ts += "export interface ProblemRefinement {\n  leetcodeId: number;\n  title: string;\n  slug: string;\n  coreIdea: string;\n  handwriteSteps: string[];\n  edgeCases: RefinedEdgeCase[];\n  annotatedCode: string;\n  complexity: RefinedComplexity;\n  commonPitfalls: string[];\n  interviewChecklist: string[];\n}\n\n"
ref_ts += 'export const problemRefinements: Record<number, ProblemRefinement> = '
ref_ts += json.dumps(refinements, ensure_ascii=False, indent=2)
ref_ts += ';\n\n'
ref_ts += "export function getProblemRefinement(leetcodeId: number): ProblemRefinement | undefined {\n  return problemRefinements[leetcodeId];\n}\n"
(ROOT / 'src/data/problemRefinements.ts').write_text(ref_ts, encoding='utf-8')

# Add a validation document.
report = f"""# Hot100 逐题精修完成报告\n\n本次已对 Hot100 共 100 道题完成逐题精修，覆盖：\n\n- 每题一个面试可手撕的 Python3.9 参考解法；\n- 每题代码均加入关键注释，强调变量含义、循环不变量和边界处理；\n- 每题补充精确时间复杂度、空间复杂度及复杂度来源；\n- 每题补充 3 个边界/典型样例，包含输入、期望结果和为什么要测；\n- 每题补充小白手撕步骤、常见坑和面试复盘清单；\n- 修复第 28～35 题 slug 被学习目标覆盖的问题；\n- 修复“括号生成” slug 和 LeetCode 链接拼写错误。\n\n## 覆盖校验\n\n- 题目总数：100\n- 精修数据条数：{len(refinements)}\n- 每题边界样例数：3\n- 每题复杂度：已补齐\n- 每题注释代码：已补齐\n\n## 数据文件\n\n- `src/data/problems.ts`：修复 slug/链接，并把参考代码、复杂度、常见坑替换成精修版本。\n- `src/data/problemRefinements.ts`：新增完整精修数据，包括边界样例、注释代码、手撕步骤、复杂度解释。\n- `src/components/SolutionWalkthrough.tsx`：题目详情页会展示逐题精修内容。\n- `src/components/GuidedStepCard.tsx`：六步学习最后一步使用精修注释代码。\n"""
(ROOT / 'docs/Hot100逐题精修完成报告.md').write_text(report, encoding='utf-8')

print('Patched problems:', len(problems))
print('Refinements:', len(refinements))
