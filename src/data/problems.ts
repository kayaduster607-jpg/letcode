import { Problem } from '@/types';

export const problems: Problem[] = [
  {
    "id": 1,
    "leetcodeId": 1,
    "title": "两数之和",
    "titleEn": "Two Sum",
    "slug": "two-sum",
    "difficulty": "简单",
    "category": "哈希",
    "tags": [
      "哈希表",
      "数组"
    ],
    "order": 1,
    "externalUrl": "https://leetcode.cn/problems/two-sum/",
    "summary": "给定一个整数数组nums和一个整数目标值target，请你在该数组中找出和为目标值target的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "学会用哈希表将两层循环降为一层循环，建立\"空间换时间\"的核心思想。这是哈希表最基础的应用，理解它之后很多哈希表题都能举一反三。",
    "whyThisPattern": "暴力做法是两层for循环，外层固定第一个数，内层找第二个数，时间复杂度O(n²)。但如果我们能用O(1)的时间快速查找\"某个值是否存在\"，就能把内层循环降为O(1)。哈希表正是提供O(1)查找的数据结构。这道题的本质是：遍历到nums[i]时，我需要快速知道target-nums[i]之前有没有出现过——这就是哈希表的经典应用场景。",
    "hints": {
      "level1": "题目要求找两个数的下标，使得它们的和等于target。注意：同一个元素不能用两次，比如[3,2,4] target=6，不能用nums[0]+nums[0]=6。",
      "level2": "暴力是两层循环O(n²)。想想：遍历到nums[i]时，另一个数应该是target-nums[i]。问题变成：怎么快速知道target-nums[i]之前有没有出现过？",
      "level3": "暴力法：两层for循环，外层i从0到n-1，内层j从i+1到n-1，检查nums[i]+nums[j]==target。时间O(n²)，空间O(1)。这是正确的，但太慢了。",
      "level4": "优化关键：用哈希表记录已经遍历过的数。遍历到nums[i]时，查哈希表中有没有target-nums[i]。如果有，返回两个下标；如果没有，把nums[i]存入哈希表。注意必须先查再存！",
      "level5": "创建空哈希表map; for i = 0 to n-1: complement = target - nums[i]; if complement 在 map 中: return [map[complement], i]; map[nums[i]] = i",
      "level6": "# 核心思路：遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,3], target=6 检查代码。\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # seen[value] = index：value 第一次出现的下标\n        seen = {}\n\n        for i, x in enumerate(nums):\n            need = target - x  # 当前数 x 需要搭配的另一个数\n\n            # 先查再存，避免 target=2*x 时把自己匹配给自己\n            if need in seen:\n                return [seen[need], i]\n\n            # 没找到搭档，记录当前数，留给后面的元素匹配\n            seen[x] = i\n\n        # 题目保证有且只有一个答案，正常不会走到这里\n        return []"
    },
    "bruteForceIdea": "两层for循环：外层i从0到n-1，内层j从i+1到n-1，检查nums[i]+nums[j]==target。找到就返回[i,j]。时间复杂度O(n²)，空间复杂度O(1)。这是最直觉的做法，但效率太低——对于每个数，我们都在重复扫描后面的数来找配对。",
    "optimizedIdea": "核心观察：遍历到nums[i]时，我只需要知道\"target-nums[i]之前有没有出现过\"。如果用哈希表记录已经遍历过的数和它们的下标，就能O(1)完成这个查找。具体做法：遍历数组，对于当前数nums[i]，先查哈希表中有没有target-nums[i]——如果有，直接返回两个下标；如果没有，把nums[i]存入哈希表（key是值，value是下标），继续遍历。注意：必须\"先查再存\"，否则会找到自己。时间O(n)，空间O(n)。",
    "pseudocode": "1. 先说暴力解的重复查找在哪里。\n2. 定义哈希表 key/value 分别保存什么。\n3. 遍历时先查询再更新哈希表，避免自匹配或漏算。\n4. 用重复值、负数、空/极小输入检查边界。",
    "solutionCode": "# 核心思路：遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,3], target=6 检查代码。\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # seen[value] = index：value 第一次出现的下标\n        seen = {}\n\n        for i, x in enumerate(nums):\n            need = target - x  # 当前数 x 需要搭配的另一个数\n\n            # 先查再存，避免 target=2*x 时把自己匹配给自己\n            if need in seen:\n                return [seen[need], i]\n\n            # 没找到搭档，记录当前数，留给后面的元素匹配\n            seen[x] = i\n\n        # 题目保证有且只有一个答案，正常不会走到这里\n        return []",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「两数之和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 2,
    "leetcodeId": 2,
    "title": "两数相加",
    "titleEn": "Add Two Numbers",
    "slug": "add-two-numbers",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "链表",
      "数学"
    ],
    "order": 2,
    "externalUrl": "https://leetcode.cn/problems/add-two-numbers/",
    "summary": "给你两个非空的链表，表示两个非负的整数。它们每位数字都是按逆序存储的，每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握链表模拟加法运算的核心技巧：逐位相加并处理进位。这道题是链表操作的经典练习，需要熟练掌握dummy节点和指针操作。",
    "whyThisPattern": "这道题的本质是竖式加法。两个数从最低位开始逐位相加，每位的和可能是0-19（两个一位数相加最大9+9=18，再加上进位1就是19）。我们需要：①逐位相加 ②处理进位 ③处理两个链表长度不同 ④处理最后可能的进位。链表天然从头到尾遍历，正好对应从低位到高位的顺序。",
    "hints": {
      "level1": "两个链表表示两个逆序的整数，比如2→4→3表示342。返回它们相加的链表。",
      "level2": "这就是竖式加法！从最低位开始逐位相加，维护进位carry。关键是处理好三个情况：两个链表都还有节点、只有一个还有、都没有但有进位。",
      "level3": "转成数字相加再转回来——但会溢出。所以必须逐位处理。",
      "level4": "逐位相加：while l1 or l2 or carry: sum = (l1?.val||0) + (l2?.val||0) + carry; carry = sum / 10; 新节点 = sum % 10; l1=l1?.next; l2=l2?.next",
      "level5": "dummy=ListNode(0); curr=dummy; carry=0; while l1 or l2 or carry: sum=(l1.val if l1 else 0)+(l2.val if l2 else 0)+carry; carry=sum//10; curr.next=ListNode(sum%10); curr=curr.next; l1=l1.next if l1 else None; l2=l2.next if l2 else None; return dummy.next",
      "level6": "# 核心思路：把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 l1=[9,9,9], l2=[1] 检查代码。\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)  # 虚拟头节点，避免单独处理第一个节点\n        cur = dummy\n        carry = 0            # 进位，只可能是 0 或 1\n\n        # 只要任意链表没走完，或最后还有进位，就继续处理\n        while l1 or l2 or carry:\n            x = l1.val if l1 else 0\n            y = l2.val if l2 else 0\n            total = x + y + carry\n\n            carry = total // 10          # 十位作为下一轮进位\n            cur.next = ListNode(total % 10)  # 个位成为当前答案节点\n            cur = cur.next\n\n            if l1:\n                l1 = l1.next\n            if l2:\n                l2 = l2.next\n\n        return dummy.next"
    },
    "bruteForceIdea": "先把两个链表转成数字，相加后再转回链表。但问题是：链表可能很长，转成数字会溢出（超过整数范围）。所以这个方法不可行，必须逐位处理。",
    "optimizedIdea": "模拟竖式加法：用一个指针分别遍历两个链表，逐位相加。关键点：①用carry变量记录进位 ②当前位的值=(l1.val + l2.val + carry) % 10 ③进位=(l1.val + l2.val + carry) / 10 ④用dummy节点简化头节点处理 ⑤当两个链表都遍历完且carry=0时结束。时间O(max(m,n))，空间O(max(m,n))。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 l1=[9,9,9], l2=[1] 检查代码。\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)  # 虚拟头节点，避免单独处理第一个节点\n        cur = dummy\n        carry = 0            # 进位，只可能是 0 或 1\n\n        # 只要任意链表没走完，或最后还有进位，就继续处理\n        while l1 or l2 or carry:\n            x = l1.val if l1 else 0\n            y = l2.val if l2 else 0\n            total = x + y + carry\n\n            carry = total // 10          # 十位作为下一轮进位\n            cur.next = ListNode(total % 10)  # 个位成为当前答案节点\n            cur = cur.next\n\n            if l1:\n                l1 = l1.next\n            if l2:\n                l2 = l2.next\n\n        return dummy.next",
    "complexity": {
      "time": "O(max(m,n))",
      "space": "O(max(m,n))"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「两数相加」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 3,
    "leetcodeId": 3,
    "title": "无重复字符的最长子串",
    "titleEn": "Longest Substring Without Repeating Characters",
    "slug": "longest-substring-without-repeating-characters",
    "difficulty": "中等",
    "category": "滑动窗口",
    "tags": [
      "滑动窗口",
      "哈希表"
    ],
    "order": 3,
    "externalUrl": "https://leetcode.cn/problems/longest-substring-without-repeating-characters/",
    "summary": "给定一个字符串s，请你找出其中不含有重复字符的最长子串的长度。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握滑动窗口的核心框架：确定窗口的扩大条件和收缩条件。这道题是滑动窗口的入门经典，理解它之后很多滑动窗口题都能套用这个框架。",
    "whyThisPattern": "我们要找的是\"满足条件的最长连续子串\"，这是滑动窗口的典型场景。滑动窗口的核心思想是：用两个指针left和right维护一个窗口，right负责扩大探索，left负责收缩排除不满足条件的元素。对于这道题，窗口内不能有重复字符——当right遇到重复时，left收缩直到重复消失。关键观察：每个字符最多被left和right各访问一次，所以总时间是O(n)。",
    "hints": {
      "level1": "关键词：\"最长\"+\"不含重复\"+\"子串（连续）\"。子串是连续的，所以可以用一个\"窗口\"来表示当前考察的范围。",
      "level2": "用一个集合记录当前窗口内有哪些字符。当右指针要加入的字符已经在集合中时，说明出现重复了——这时需要收缩左指针直到重复消失。",
      "level3": "暴力解法：枚举所有子串（两层循环确定起点和终点），对每个子串检查是否有重复字符。时间O(n^3)。",
      "level4": "滑动窗口优化：右指针不断扩展窗口，当发现重复时，左指针收缩直到重复消失。用哈希集合O(1)判断是否重复。每个字符最多被左指针和右指针各访问一次，所以总时间O(n)。",
      "level5": "left=0, maxLen=0, set=空集合; for right in 0..n-1: while s[right]在set中: 移除s[left], left++; 将s[right]加入set; maxLen=max(maxLen, right-left+1); return maxLen",
      "level6": "# 核心思路：用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abba\" 检查代码。\nclass Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}   # last[ch] = 字符 ch 最近一次出现的下标\n        left = 0    # 当前无重复窗口的左边界\n        ans = 0\n\n        for right, ch in enumerate(s):\n            # ch 在窗口内重复出现，left 必须跳到上次 ch 的后一位\n            if ch in last and last[ch] >= left:\n                left = last[ch] + 1\n\n            last[ch] = right\n            ans = max(ans, right - left + 1)\n\n        return ans"
    },
    "bruteForceIdea": "暴力法：枚举所有子串（两层循环确定起点和终点），对每个子串用集合检查是否有重复字符。时间复杂度O(n^3)——枚举子串O(n^2)，检查重复O(n)。",
    "optimizedIdea": "滑动窗口优化：维护一个不重复的窗口[left, right]。right不断向右扩展，当s[right]已经在窗口中时，left向右收缩直到重复消失。用哈希集合O(1)判断是否重复。每个字符最多被left和right各访问一次，所以总时间O(n)。具体做法：用一个集合记录当前窗口内的字符。right右移时，如果s[right]已在集合中，就不断移除s[left]并left++，直到s[right]不在集合中。然后把s[right]加入集合，更新最大长度。",
    "pseudocode": "1. 明确窗口内维护的条件是什么。\n2. 右指针扩张并更新窗口状态。\n3. 当窗口不满足/已经满足条件时移动左指针。\n4. 每次更新答案时确认窗口左右边界是否闭区间。",
    "solutionCode": "# 核心思路：用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abba\" 检查代码。\nclass Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}   # last[ch] = 字符 ch 最近一次出现的下标\n        left = 0    # 当前无重复窗口的左边界\n        ans = 0\n\n        for right, ch in enumerate(s):\n            # ch 在窗口内重复出现，left 必须跳到上次 ch 的后一位\n            if ch in last and last[ch] >= left:\n                left = last[ch] + 1\n\n            last[ch] = right\n            ans = max(ans, right - left + 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(min(n,字符集大小))"
    },
    "commonMistakes": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「无重复字符的最长子串」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 4,
    "leetcodeId": 4,
    "title": "寻找两个正序数组的中位数",
    "titleEn": "Median of Two Sorted Arrays",
    "slug": "median-of-two-sorted-arrays",
    "difficulty": "困难",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 4,
    "externalUrl": "https://leetcode.cn/problems/median-of-two-sorted-arrays/",
    "summary": "给定两个大小分别为m和n的正序数组nums1和nums2，请你找出并返回这两个正序数组的中位数。算法的时间复杂度应该为O(log(m+n))。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二分查找在两个数组中的应用——找第k小的元素。这道题是二分查找的进阶应用，需要理解如何在两个有序数组中高效定位。",
    "whyThisPattern": "要求O(log(m+n))时间，意味着不能合并数组（O(m+n)）。中位数的本质是\"第k小的数\"——如果总长度是奇数，中位数是第(m+n+1)/2小的数；如果是偶数，是第(m+n)/2小和第(m+n)/2+1小的平均值。所以问题转化为：如何在两个有序数组中找第k小的数？二分每次排除k/2个元素，时间O(log(m+n))。",
    "hints": {
      "level1": "两个正序数组找中位数，要求O(log(m+n))时间。中位数=排序后中间位置的数。",
      "level2": "不能合并（O(m+n)不满足要求）。中位数本质是\"第k小的数\"。如何在两个有序数组中找第k小？",
      "level3": "合并后取中位数，O(m+n)时间。简单但不满足要求。",
      "level4": "优化关键：不要真的合并数组，而是在较短数组 nums1 上二分切分点 i。令 nums2 的切分点 j=(m+n+1)//2-i，只要左半边最大值 <= 右半边最小值，就找到了中位数位置。",
      "level5": "确保 nums1 是较短数组；left=0,right=m；循环中 i=(left+right)//2, j=(m+n+1)//2-i；取 a_left/a_right/b_left/b_right；若 a_left<=b_right 且 b_left<=a_right，按奇偶返回中位数；否则调整 i。",
      "level6": "# 核心思路：在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums1=[], nums2=[1] 检查代码。\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # 始终在较短数组上二分，保证复杂度是 log(min(m,n))\n        if len(nums1) > len(nums2):\n            nums1, nums2 = nums2, nums1\n\n        m, n = len(nums1), len(nums2)\n        total_left = (m + n + 1) // 2  # 左半边需要放多少个元素\n        left, right = 0, m\n\n        while left <= right:\n            i = (left + right) // 2       # nums1 左边取 i 个\n            j = total_left - i            # nums2 左边取 j 个\n\n            a_left = nums1[i - 1] if i > 0 else float('-inf')\n            a_right = nums1[i] if i < m else float('inf')\n            b_left = nums2[j - 1] if j > 0 else float('-inf')\n            b_right = nums2[j] if j < n else float('inf')\n\n            # 找到合法切分：左半边所有数 <= 右半边所有数\n            if a_left <= b_right and b_left <= a_right:\n                if (m + n) % 2 == 1:\n                    return float(max(a_left, b_left))\n                return (max(a_left, b_left) + min(a_right, b_right)) / 2\n\n            # nums1 左边取太多了，i 往左收\n            if a_left > b_right:\n                right = i - 1\n            else:\n                left = i + 1\n\n        return 0.0"
    },
    "bruteForceIdea": "合并两个有序数组（归并排序的merge步骤），然后直接取中位数。时间O(m+n)，空间O(m+n)。虽然简单，但不满足O(log(m+n))的要求。",
    "optimizedIdea": "在较短数组上二分切分点。设 nums1 左边取 i 个，nums2 左边取 j 个，并让 i+j 等于总左半区元素个数。合法切分必须满足 nums1[i-1] <= nums2[j] 且 nums2[j-1] <= nums1[i]，此时左半边所有元素都小于等于右半边所有元素，中位数只由边界四个值决定。每次根据边界大小调整 i，时间 O(log(min(m,n)))，空间 O(1)。",
    "pseudocode": "1. 先保证在较短数组 nums1 上二分，避免 j 越界。\n2. total_left=(m+n+1)//2，枚举 nums1 左半区元素个数 i。\n3. 由 j=total_left-i 得到 nums2 的切分点。\n4. 取四个边界：a_left、a_right、b_left、b_right；空边界用 -inf/inf。\n5. 如果 a_left<=b_right 且 b_left<=a_right，说明切分合法，按总长度奇偶返回中位数。\n6. 如果 a_left>b_right，说明 nums1 左边取多了，right=i-1；否则 left=i+1。",
    "solutionCode": "# 核心思路：在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums1=[], nums2=[1] 检查代码。\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # 始终在较短数组上二分，保证复杂度是 log(min(m,n))\n        if len(nums1) > len(nums2):\n            nums1, nums2 = nums2, nums1\n\n        m, n = len(nums1), len(nums2)\n        total_left = (m + n + 1) // 2  # 左半边需要放多少个元素\n        left, right = 0, m\n\n        while left <= right:\n            i = (left + right) // 2       # nums1 左边取 i 个\n            j = total_left - i            # nums2 左边取 j 个\n\n            a_left = nums1[i - 1] if i > 0 else float('-inf')\n            a_right = nums1[i] if i < m else float('inf')\n            b_left = nums2[j - 1] if j > 0 else float('-inf')\n            b_right = nums2[j] if j < n else float('inf')\n\n            # 找到合法切分：左半边所有数 <= 右半边所有数\n            if a_left <= b_right and b_left <= a_right:\n                if (m + n) % 2 == 1:\n                    return float(max(a_left, b_left))\n                return (max(a_left, b_left) + min(a_right, b_right)) / 2\n\n            # nums1 左边取太多了，i 往左收\n            if a_left > b_right:\n                right = i - 1\n            else:\n                left = i + 1\n\n        return 0.0",
    "complexity": {
      "time": "O(log(min(m,n)))",
      "space": "O(1)"
    },
    "commonMistakes": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「寻找两个正序数组的中位数」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 5,
    "leetcodeId": 5,
    "title": "最长回文子串",
    "titleEn": "Longest Palindromic Substring",
    "slug": "longest-palindromic-substring",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划",
      "字符串"
    ],
    "order": 5,
    "externalUrl": "https://leetcode.cn/problems/longest-palindromic-substring/",
    "summary": "给你一个字符串s，找到s中最长的回文子串。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回文子串的两种经典解法：动态规划和中心扩展。这道题是字符串DP的入门题，理解dp[i][j]的含义是关键。",
    "whyThisPattern": "回文子串的核心性质：如果s[i..j]是回文，那么s[i+1..j-1]也是回文，且s[i]==s[j]。这天然就是一个递推关系，适合用动态规划。另一种思路是中心扩展：以每个字符为中心向两边扩展，检查是否是回文。两种方法都是O(n^2)时间。",
    "hints": {
      "level1": "找最长回文子串。回文=正读反读相同，比如\"aba\"是回文，\"abc\"不是。",
      "level2": "dp[i][j]=s[i..j]是否是回文。转移：如果s[i]==s[j]且内部s[i+1..j-1]也是回文，则s[i..j]是回文。",
      "level3": "枚举所有子串检查回文，O(n^3)。",
      "level4": "DP：dp[i][j]=s[i]==s[j] && (j-i<=2 || dp[i+1][j-1])。注意i要倒序遍历！中心扩展：以每个字符为中心向两边扩展。",
      "level5": "方法一DP：dp[n][n]=False; for i=n-2到0: for j=i+1到n-1: if s[i]==s[j] and (j-i<=2 or dp[i+1][j-1]): dp[i][j]=True; 更新最长。方法二中心扩展：for center in 0..2n-2: l=center//2; r=l+center%2; while l>=0 and r<n and s[l]==s[r]: 更新最长; l--; r++",
      "level6": "# 核心思路：回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"babad\" 检查代码。\nclass Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s:\n            return \"\"\n\n        start = end = 0  # 当前最长回文子串的左右边界\n\n        def expand(left: int, right: int) -> None:\n            nonlocal start, end\n            # 只要左右字符相同，就继续向两边扩张\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                left -= 1\n                right += 1\n\n            # 跳出循环时 [left+1, right-1] 才是真正回文区间\n            if right - left - 2 > end - start:\n                start, end = left + 1, right - 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度中心\n            expand(i, i + 1)   # 偶数长度中心\n\n        return s[start:end + 1]"
    },
    "bruteForceIdea": "枚举所有子串（O(n^2)个），对每个子串检查是否是回文（O(n)时间）。总时间O(n^3)。",
    "optimizedIdea": "方法一DP：dp[i][j]表示s[i..j]是否是回文。转移：dp[i][j]=s[i]==s[j] && (j-i<=2 || dp[i+1][j-1])。i必须倒序遍历（因为dp[i][j]依赖dp[i+1][j-1]）。方法二中心扩展：以每个字符（或两个字符之间）为中心向两边扩展，时间O(n^2)空间O(1)。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"babad\" 检查代码。\nclass Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s:\n            return \"\"\n\n        start = end = 0  # 当前最长回文子串的左右边界\n\n        def expand(left: int, right: int) -> None:\n            nonlocal start, end\n            # 只要左右字符相同，就继续向两边扩张\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                left -= 1\n                right += 1\n\n            # 跳出循环时 [left+1, right-1] 才是真正回文区间\n            if right - left - 2 > end - start:\n                start, end = left + 1, right - 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度中心\n            expand(i, i + 1)   # 偶数长度中心\n\n        return s[start:end + 1]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最长回文子串」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 6,
    "leetcodeId": 10,
    "title": "正则表达式匹配",
    "titleEn": "Regular Expression Matching",
    "slug": "regular-expression-matching",
    "difficulty": "困难",
    "category": "多维动态规划",
    "tags": [
      "动态规划",
      "字符串"
    ],
    "order": 6,
    "externalUrl": "https://leetcode.cn/problems/regular-expression-matching/",
    "summary": "给你一个字符串s和一个字符规律p，请实现一个支持\".\"和\"*\"的正则表达式匹配。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二维动态规划处理字符串匹配问题。这道题是字符串DP的经典难题，需要仔细分析\"*\"的两种匹配情况。",
    "whyThisPattern": "暴力递归会有很多重复子问题。DP的核心是定义dp[i][j]=p的前i个字符能否匹配s的前j个字符。关键是\"*\"的处理：如果p[i-1]==\"*\"，可以匹配0次（dp[i-2][j]）或多次（如果p[i-2]匹配s[j-1]，则dp[i][j-1]）。",
    "hints": {
      "level1": "正则表达式匹配：.匹配任意单个字符，*匹配零个或多个前面的元素。",
      "level2": "dp[i][j]=p的前i个字符能否匹配s的前j个字符。关键是*的两种情况：匹配0次或多次。",
      "level3": "递归暴力，指数时间。",
      "level4": "DP：*匹配0次=dp[i-2][j]；匹配多次=match and dp[i][j-1]。",
      "level5": "dp[0][0]=True; 处理dp[i][0]; for i,j: if p[i-1]==*: dp[i][j]=dp[i-2][j] or (match and dp[i][j-1]); else: dp[i][j]=match and dp[i-1][j-1]",
      "level6": "# 核心思路：dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"aa\", p=\"a*\" 检查代码。\nclass Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True  # 空串匹配空模式\n\n        # 初始化：s 为空时，只有 a*b*c* 这种模式可能匹配空串\n        for j in range(2, n + 1):\n            if p[j - 1] == '*':\n                dp[0][j] = dp[0][j - 2]\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                elif p[j - 1] == '*':\n                    # 情况1：x* 出现 0 次，直接删掉 p[j-2:j]\n                    dp[i][j] = dp[i][j - 2]\n\n                    # 情况2：x* 至少出现 1 次，前提是 x 能匹配 s[i-1]\n                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:\n                        dp[i][j] = dp[i][j] or dp[i - 1][j]\n\n        return dp[m][n]"
    },
    "bruteForceIdea": "递归：对于每个位置，看p的当前字符后面有没有*。没有*则匹配一个字符递归；有*则尝试匹配0次、1次、多次。最坏时间指数级。",
    "optimizedIdea": "二维DP：dp[i][j]=p的前i个字符能否匹配s的前j个字符。如果p[i-1]==\"*\"：dp[i][j]=dp[i-2][j](匹配0次)或(match(s[j-1],p[i-2]) and dp[i][j-1])(匹配多次)。否则：dp[i][j]=match and dp[i-1][j-1]。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"aa\", p=\"a*\" 检查代码。\nclass Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True  # 空串匹配空模式\n\n        # 初始化：s 为空时，只有 a*b*c* 这种模式可能匹配空串\n        for j in range(2, n + 1):\n            if p[j - 1] == '*':\n                dp[0][j] = dp[0][j - 2]\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                elif p[j - 1] == '*':\n                    # 情况1：x* 出现 0 次，直接删掉 p[j-2:j]\n                    dp[i][j] = dp[i][j - 2]\n\n                    # 情况2：x* 至少出现 1 次，前提是 x 能匹配 s[i-1]\n                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:\n                        dp[i][j] = dp[i][j] or dp[i - 1][j]\n\n        return dp[m][n]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「正则表达式匹配」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 7,
    "leetcodeId": 11,
    "title": "盛最多水的容器",
    "titleEn": "Container With Most Water",
    "slug": "container-with-most-water",
    "difficulty": "中等",
    "category": "双指针",
    "tags": [
      "双指针",
      "数组"
    ],
    "order": 7,
    "externalUrl": "https://leetcode.cn/problems/container-with-most-water/",
    "summary": "给定一个长度为n的整数数组height。有n条垂线，找出其中的两条线，使得它们与x轴共同构成的容器可以容纳最多的水。返回容器可以储存的最大水量。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握贪心双指针的思想：每次移动较短的那根线。这道题的关键是理解为什么移动较短的线不会错过最优解。",
    "whyThisPattern": "暴力是O(n^2)枚举所有线对。双指针O(n)：left和right从两端出发，面积=min(h[left],h[right])*(right-left)。关键观察：移动较长的线，面积一定不会增大（因为宽度减小，高度受限于较短的线）。所以应该移动较短的线——这样虽然宽度减小，但高度有可能增大。",
    "hints": {
      "level1": "找两条线使得盛水最多。面积=min(h[left],h[right])*(right-left)。",
      "level2": "为什么移动较短的线？因为移动较长的线，宽度减小且高度受限于较短的线，面积一定不会增大。",
      "level3": "两层循环枚举所有线对，O(n^2)。",
      "level4": "双指针从两端出发，每次移动较短的那根。",
      "level5": "left=0, right=n-1, maxArea=0; while left<right: area=min(h[left],h[right])*(right-left); maxArea=max(maxArea,area); if h[left]<h[right]: left++; else: right--",
      "level6": "# 核心思路：容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[1,1] 检查代码。\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        ans = 0\n\n        while left < right:\n            width = right - left\n            ans = max(ans, width * min(height[left], height[right]))\n\n            # 面积受短板限制，移动长板不会提高当前短板\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n\n        return ans"
    },
    "bruteForceIdea": "两层循环枚举所有线对，计算面积取最大值。时间O(n^2)。",
    "optimizedIdea": "双指针：left=0, right=n-1。面积=min(h[left],h[right])*(right-left)。移动较短的那根指针（因为移动较长的线面积一定不会增大）。时间O(n)。",
    "pseudocode": "1. 先明确两个指针分别代表什么边界。\n2. 证明每次移动哪一个指针不会漏答案。\n3. 在循环内先更新答案，再移动指针。\n4. 用最小长度、单调数组、重复值样例检查。",
    "solutionCode": "# 核心思路：容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[1,1] 检查代码。\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        ans = 0\n\n        while left < right:\n            width = right - left\n            ans = max(ans, width * min(height[left], height[right]))\n\n            # 面积受短板限制，移动长板不会提高当前短板\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「盛最多水的容器」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 8,
    "leetcodeId": 15,
    "title": "三数之和",
    "titleEn": "3Sum",
    "slug": "3sum",
    "difficulty": "中等",
    "category": "双指针",
    "tags": [
      "双指针",
      "数组",
      "排序"
    ],
    "order": 8,
    "externalUrl": "https://leetcode.cn/problems/3sum/",
    "summary": "给你一个整数数组nums，判断是否存在三元组[nums[i], nums[j], nums[k]]满足i!=j!=k且nums[i]+nums[j]+nums[k]==0。返回所有不重复的三元组。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握排序+双指针去重的技巧。这道题是双指针的经典应用，需要仔细处理去重逻辑。",
    "whyThisPattern": "暴力O(n^3)三层循环。优化：排序后固定nums[i]，用双指针在[i+1,n-1]中找两个数使得和为-nums[i]。去重是关键：①i去重：跳过相同的nums[i] ②left去重：找到解后跳过相同的nums[left] ③right去重：找到解后跳过相同的nums[right]。",
    "hints": {
      "level1": "找所有和为0的不重复三元组。注意去重！",
      "level2": "排序后固定一个数，双指针找另外两个。去重是关键。",
      "level3": "三层循环O(n^3)。",
      "level4": "排序+双指针：固定nums[i]，left和right找-nums[i]。注意三处去重。",
      "level5": "排序; for i: if i>0 and nums[i]==nums[i-1] continue; l=i+1,r=n-1; while l<r: sum=nums[i]+nums[l]+nums[r]; if sum==0: 记录,l++,r--跳过重复; elif sum<0: l++; else: r--",
      "level6": "# 核心思路：先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-1,0,1,2,-1,-4] 检查代码。\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        n = len(nums)\n\n        for i in range(n - 2):\n            # 固定数去重：相同 nums[i] 只处理第一次\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            # 排序后最小固定数已大于 0，后面不可能凑成 0\n            if nums[i] > 0:\n                break\n\n            left, right = i + 1, n - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    ans.append([nums[i], nums[left], nums[right]])\n                    left += 1\n                    right -= 1\n\n                    # 双指针去重：跳过相同的第二、第三个数\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return ans"
    },
    "bruteForceIdea": "三层循环枚举所有三元组，检查和是否为0，用集合去重。时间O(n^3)。",
    "optimizedIdea": "排序后双指针：for i in 0..n-3: if i>0 and nums[i]==nums[i-1] continue; left=i+1, right=n-1; while left<right: sum=nums[i]+nums[left]+nums[right]; if sum==0: 记录，left++跳过重复，right--跳过重复; if sum<0: left++; if sum>0: right--。时间O(n^2)。",
    "pseudocode": "1. 先明确两个指针分别代表什么边界。\n2. 证明每次移动哪一个指针不会漏答案。\n3. 在循环内先更新答案，再移动指针。\n4. 用最小长度、单调数组、重复值样例检查。",
    "solutionCode": "# 核心思路：先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-1,0,1,2,-1,-4] 检查代码。\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        n = len(nums)\n\n        for i in range(n - 2):\n            # 固定数去重：相同 nums[i] 只处理第一次\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            # 排序后最小固定数已大于 0，后面不可能凑成 0\n            if nums[i] > 0:\n                break\n\n            left, right = i + 1, n - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    ans.append([nums[i], nums[left], nums[right]])\n                    left += 1\n                    right -= 1\n\n                    # 双指针去重：跳过相同的第二、第三个数\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「三数之和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 9,
    "leetcodeId": 17,
    "title": "电话号码的字母组合",
    "titleEn": "Letter Combinations of a Phone Number",
    "slug": "letter-combinations-of-a-phone-number",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯"
    ],
    "order": 9,
    "externalUrl": "https://leetcode.cn/problems/letter-combinations-of-a-phone-number/",
    "summary": "给定一个仅包含数字2-9的字符串，返回所有它能表示的字母组合。答案可以按任意顺序返回。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回溯的基本框架：选择→递归→撤销。这道题是回溯的入门题，每个位置有多个选择。",
    "whyThisPattern": "每个数字对应3-4个字母，我们需要枚举所有可能的组合。这是一个典型的回溯问题：每个位置选择一个字母，递归处理下一个位置，到达末尾时记录结果。",
    "hints": {
      "level1": "数字到字母的映射：2->abc, 3->def, 4->ghi, 5->jkl, 6->mno, 7->pqrs, 8->tuv, 9->wxyz。",
      "level2": "每个位置有多个选择，递归处理下一个位置。回溯框架。",
      "level3": "递归枚举所有组合。",
      "level4": "回溯：path记录当前组合，到达末尾时记录。for c in mapping[digit]: path+=c; backtrack(pos+1); path-=c",
      "level5": "mapping={2:\"abc\",3:\"def\",...}; def bt(pos,path): if pos==len(digits): res.append(path); return; for c in mapping[digits[pos]]: bt(pos+1,path+c)",
      "level6": "# 核心思路：每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 digits=\"\" 检查代码。\nclass Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits:\n            return []\n\n        phone = {\n            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',\n            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'\n        }\n        ans = []\n        path = []\n\n        def backtrack(index: int) -> None:\n            # index 表示正在决定 digits[index]\n            if index == len(digits):\n                ans.append(''.join(path))\n                return\n\n            for ch in phone[digits[index]]:\n                path.append(ch)          # 选择一个字母\n                backtrack(index + 1)     # 递归决定下一个数字\n                path.pop()               # 撤销选择，尝试同层其他字母\n\n        backtrack(0)\n        return ans"
    },
    "bruteForceIdea": "暴力思路：BFS或递归枚举所有组合。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "回溯：path记录当前组合，当path长度等于digits长度时加入结果。for循环遍历当前数字对应的所有字母，选择→递归→撤销。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 digits=\"\" 检查代码。\nclass Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits:\n            return []\n\n        phone = {\n            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',\n            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'\n        }\n        ans = []\n        path = []\n\n        def backtrack(index: int) -> None:\n            # index 表示正在决定 digits[index]\n            if index == len(digits):\n                ans.append(''.join(path))\n                return\n\n            for ch in phone[digits[index]]:\n                path.append(ch)          # 选择一个字母\n                backtrack(index + 1)     # 递归决定下一个数字\n                path.pop()               # 撤销选择，尝试同层其他字母\n\n        backtrack(0)\n        return ans",
    "complexity": {
      "time": "O(4^n·n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「电话号码的字母组合」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 10,
    "leetcodeId": 19,
    "title": "删除链表的倒数第N个结点",
    "titleEn": "Remove Nth Node From End of List",
    "slug": "remove-nth-node-from-end-of-list",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "链表",
      "双指针"
    ],
    "order": 10,
    "externalUrl": "https://leetcode.cn/problems/remove-nth-node-from-end-of-list/",
    "summary": "给你一个链表，删除链表的倒数第n个结点，并且返回链表的头结点。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握双指针找倒数第n个节点的技巧：快指针先走n步。这道题是链表双指针的经典应用。",
    "whyThisPattern": "如果先遍历求长度L，再遍历到第L-n个节点，需要两次遍历。双指针一次遍历：fast先走n步，然后fast和slow同步走，fast到末尾时slow就在倒数第n个节点的前一个。用dummy节点处理删除头节点的情况。",
    "hints": {
      "level1": "删除倒数第n个节点。倒数第n个=正数第L-n+1个。",
      "level2": "快指针先走n步，然后同步走。fast到末尾时slow在待删节点前一个。",
      "level3": "两次遍历：先求长度再定位。",
      "level4": "dummy->next=head; fast先走n步; while fast.next: fast,slow=fast.next,slow.next; slow.next=slow.next.next",
      "level5": "dummy=ListNode(0,head); fast=slow=dummy; for _ in range(n): fast=fast.next; while fast.next: fast=fast.next; slow=slow.next; slow.next=slow.next.next; return dummy.next",
      "level6": "# 核心思路：快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1], n=1 检查代码。\nclass Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)  # 处理删除头节点的情况\n        fast = slow = dummy\n\n        # fast 先走 n 步，制造 n 个节点的间距\n        for _ in range(n):\n            fast = fast.next\n\n        # fast 到最后一个节点时，slow 在待删除节点前一个\n        while fast.next:\n            fast = fast.next\n            slow = slow.next\n\n        slow.next = slow.next.next\n        return dummy.next"
    },
    "bruteForceIdea": "先遍历求长度L，再遍历到第L-n个节点的前一个，修改next指针。两次遍历。",
    "optimizedIdea": "双指针一次遍历：创建dummy节点指向head。fast先走n步，然后fast和slow同步走，fast到末尾时slow在待删节点前一个。slow.next=slow.next.next。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1], n=1 检查代码。\nclass Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)  # 处理删除头节点的情况\n        fast = slow = dummy\n\n        # fast 先走 n 步，制造 n 个节点的间距\n        for _ in range(n):\n            fast = fast.next\n\n        # fast 到最后一个节点时，slow 在待删除节点前一个\n        while fast.next:\n            fast = fast.next\n            slow = slow.next\n\n        slow.next = slow.next.next\n        return dummy.next",
    "complexity": {
      "time": "O(L)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「删除链表的倒数第N个结点」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 11,
    "leetcodeId": 20,
    "title": "有效的括号",
    "titleEn": "Valid Parentheses",
    "slug": "valid-parentheses",
    "difficulty": "简单",
    "category": "栈",
    "tags": [
      "栈",
      "字符串"
    ],
    "order": 11,
    "externalUrl": "https://leetcode.cn/problems/valid-parentheses/",
    "summary": "给定一个只包括\"(\"，\")\"，\"{\"，\"}\"，\"[\"，\"]\"的字符串s，判断字符串是否有效。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握栈的基本应用：括号匹配。这道题是栈的入门经典，理解LIFO特性如何解决嵌套匹配问题。",
    "whyThisPattern": "括号匹配的核心：遇到左括号入栈，遇到右括号时检查栈顶是否是对应的左括号。用哈希表存储括号对映射可以简化代码。遍历结束后栈为空说明有效。",
    "hints": {
      "level1": "括号匹配：每个左括号必须有对应的右括号，且顺序正确。",
      "level2": "栈的LIFO特性天然适合处理嵌套结构。",
      "level3": "不断消除相邻匹配括号。",
      "level4": "栈：左括号入栈，右括号检查栈顶并出栈。",
      "level5": "stack=[]; map={\")\":\"(\",\"]\":\"[\",\"}\":\"{\"}; for c in s: if c in map: if not stack or stack[-1]!=map[c]: return False; stack.pop(); else: stack.append(c); return len(stack)==0",
      "level6": "# 核心思路：遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"()[]{}\" 检查代码。\nclass Solution:\n    def isValid(self, s: str) -> bool:\n        pair = {')': '(', ']': '[', '}': '{'}\n        stack = []\n\n        for ch in s:\n            if ch in pair:  # ch 是右括号，需要匹配栈顶\n                if not stack or stack[-1] != pair[ch]:\n                    return False\n                stack.pop()\n            else:           # ch 是左括号，等待后续右括号匹配\n                stack.append(ch)\n\n        return not stack"
    },
    "bruteForceIdea": "不断消除相邻的匹配括号，直到无法消除。如果最终字符串为空则有效。时间O(n^2)。",
    "optimizedIdea": "栈：遍历字符串，遇到左括号入栈，遇到右括号时检查栈顶是否匹配——匹配则出栈，不匹配则返回false。遍历结束后栈为空则有效。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"()[]{}\" 检查代码。\nclass Solution:\n    def isValid(self, s: str) -> bool:\n        pair = {')': '(', ']': '[', '}': '{'}\n        stack = []\n\n        for ch in s:\n            if ch in pair:  # ch 是右括号，需要匹配栈顶\n                if not stack or stack[-1] != pair[ch]:\n                    return False\n                stack.pop()\n            else:           # ch 是左括号，等待后续右括号匹配\n                stack.append(ch)\n\n        return not stack",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「有效的括号」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 12,
    "leetcodeId": 21,
    "title": "合并两个有序链表",
    "titleEn": "Merge Two Sorted Lists",
    "slug": "merge-two-sorted-lists",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 12,
    "externalUrl": "https://leetcode.cn/problems/merge-two-sorted-lists/",
    "summary": "将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握链表合并的基本技巧：dummy节点+逐个比较。这道题是很多链表题的基础（比如归并排序）。",
    "whyThisPattern": "逐一比较两个链表的当前节点，取较小的接到结果链表后面。用dummy节点简化头节点处理。当一个链表遍历完后，直接接到另一个链表的剩余部分。",
    "hints": {
      "level1": "合并两个有序链表。逐一比较取较小的。",
      "level2": "dummy节点简化头节点处理。",
      "level3": "存数组排序重建。",
      "level4": "dummy+指针：比较→拼接→前进。",
      "level5": "dummy=ListNode(); p=dummy; while l1 and l2: if l1.val<l2.val: p.next=l1; l1=l1.next; else: p.next=l2; l2=l2.next; p=p.next; p.next=l1 or l2; return dummy.next",
      "level6": "# 核心思路：两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 list1=[], list2=[] 检查代码。\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n\n        while list1 and list2:\n            if list1.val <= list2.val:\n                cur.next = list1\n                list1 = list1.next\n            else:\n                cur.next = list2\n                list2 = list2.next\n            cur = cur.next\n\n        # 剩余链表本身已经有序，直接接上即可\n        cur.next = list1 if list1 else list2\n        return dummy.next"
    },
    "bruteForceIdea": "把两个链表的值都存到数组，排序后重建链表。O(n)空间。",
    "optimizedIdea": "迭代合并：dummy节点，p指针。while l1 and l2: 取较小的接到p后面，p前进。循环结束后接到剩余部分。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 list1=[], list2=[] 检查代码。\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n\n        while list1 and list2:\n            if list1.val <= list2.val:\n                cur.next = list1\n                list1 = list1.next\n            else:\n                cur.next = list2\n                list2 = list2.next\n            cur = cur.next\n\n        # 剩余链表本身已经有序，直接接上即可\n        cur.next = list1 if list1 else list2\n        return dummy.next",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「合并两个有序链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 13,
    "leetcodeId": 22,
    "title": "括号生成",
    "titleEn": "Generate Parentheses",
    "slug": "generate-parentheses",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯"
    ],
    "order": 13,
    "externalUrl": "https://leetcode.cn/problems/generate-parentheses/",
    "summary": "数字n代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且有效的括号组合。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回溯+剪枝：只在合法时才添加括号。这道题的关键是理解什么时候可以加\"(\"什么时候可以加\")\"。",
    "whyThisPattern": "暴力：生成所有2^(2n)种括号组合，检查有效性。回溯剪枝：只生成合法的——左括号数<n时可以加\"(\"，右括号数<左括号数时可以加\")\"。",
    "hints": {
      "level1": "生成n对有效括号的所有组合。",
      "level2": "约束：(数量<n时可加(，)数量<(数量时可加)。",
      "level3": "生成所有组合检查有效性。",
      "level4": "回溯+剪枝：只在合法时添加括号。",
      "level5": "def bt(path,left,right): if len(path)==2*n: res.append(path); if left<n: bt(path+\"(\",left+1,right); if right<left: bt(path+\")\",left,right+1)",
      "level6": "# 核心思路：回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        path = []\n\n        def backtrack(left_count: int, right_count: int) -> None:\n            # path 长度达到 2n，说明得到一个完整合法组合\n            if len(path) == 2 * n:\n                ans.append(''.join(path))\n                return\n\n            # 只要左括号还没用完，就可以加左括号\n            if left_count < n:\n                path.append('(')\n                backtrack(left_count + 1, right_count)\n                path.pop()\n\n            # 右括号不能超过左括号，否则前缀会非法\n            if right_count < left_count:\n                path.append(')')\n                backtrack(left_count, right_count + 1)\n                path.pop()\n\n        backtrack(0, 0)\n        return ans"
    },
    "bruteForceIdea": "生成所有可能的括号组合（2^(2n)种），逐一检查是否有效。",
    "optimizedIdea": "回溯剪枝：left记录已用的(数，right记录已用的)数。if left<n: 加(递归; if right<left: 加)递归。当长度=2n时记录结果。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        path = []\n\n        def backtrack(left_count: int, right_count: int) -> None:\n            # path 长度达到 2n，说明得到一个完整合法组合\n            if len(path) == 2 * n:\n                ans.append(''.join(path))\n                return\n\n            # 只要左括号还没用完，就可以加左括号\n            if left_count < n:\n                path.append('(')\n                backtrack(left_count + 1, right_count)\n                path.pop()\n\n            # 右括号不能超过左括号，否则前缀会非法\n            if right_count < left_count:\n                path.append(')')\n                backtrack(left_count, right_count + 1)\n                path.pop()\n\n        backtrack(0, 0)\n        return ans",
    "complexity": {
      "time": "O(Cn·n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「括号生成」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 14,
    "leetcodeId": 31,
    "title": "下一个排列",
    "titleEn": "Next Permutation",
    "slug": "next-permutation",
    "difficulty": "中等",
    "category": "技巧",
    "tags": [
      "数组"
    ],
    "order": 14,
    "externalUrl": "https://leetcode.cn/problems/next-permutation/",
    "summary": "整数数组的一个排列就是将其所有成员以序列或线性顺序排列。请找出给定数组的下一个字典序排列。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握下一个排列的算法：从右找第一个下降位，交换，反转。这道题需要理解字典序的概念。",
    "whyThisPattern": "字典序：比如[1,2,3]的下一个排列是[1,3,2]。算法：①从右往左找第一个nums[i]<nums[i+1]的位置i（下降位）②从右往左找第一个>nums[i]的位置j ③swap(i,j) ④反转i+1到末尾。如果没找到下降位，说明是最大排列，反转整个数组。",
    "hints": {
      "level1": "下一个字典序排列。比如[1,2,3]->[1,3,2]->[2,1,3]->[2,3,1]->[3,1,2]->[3,2,1]->[1,2,3]。",
      "level2": "从右往左找第一个下降位，然后找比它大的最小数交换，最后反转后面的部分。",
      "level3": "生成所有排列排序。",
      "level4": "三步：找下降位→交换→反转。",
      "level5": "i=n-2; while i>=0 and nums[i]>=nums[i+1]: i--; if i>=0: j=n-1; while nums[j]<=nums[i]: j--; swap(i,j); reverse(i+1)",
      "level6": "# 核心思路：从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        n = len(nums)\n        i = n - 2\n\n        # 找到第一个 nums[i] < nums[i+1]，说明 i 可以被增大\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            # 从右侧找第一个比 nums[i] 大的数，它是“刚好更大”的交换对象\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        # i 右侧原本是降序，反转后变成最小升序后缀\n        left, right = i + 1, n - 1\n        while left < right:\n            nums[left], nums[right] = nums[right], nums[left]\n            left += 1\n            right -= 1"
    },
    "bruteForceIdea": "暴力思路：生成所有排列，排序，找下一个。O(n!*n)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "三步法：①从右找下降位i ②从右找第一个>nums[i]的j ③swap(i,j) ④reverse(i+1)。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        n = len(nums)\n        i = n - 2\n\n        # 找到第一个 nums[i] < nums[i+1]，说明 i 可以被增大\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            # 从右侧找第一个比 nums[i] 大的数，它是“刚好更大”的交换对象\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        # i 右侧原本是降序，反转后变成最小升序后缀\n        left, right = i + 1, n - 1\n        while left < right:\n            nums[left], nums[right] = nums[right], nums[left]\n            left += 1\n            right -= 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「下一个排列」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 15,
    "leetcodeId": 32,
    "title": "最长有效括号",
    "titleEn": "Longest Valid Parentheses",
    "slug": "longest-valid-parentheses",
    "difficulty": "困难",
    "category": "栈",
    "tags": [
      "栈",
      "动态规划"
    ],
    "order": 15,
    "externalUrl": "https://leetcode.cn/problems/longest-valid-parentheses/",
    "summary": "给你一个只包含\"(\"和\")\"的字符串，找出最长有效（格式正确且连续）括号子串的长度。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握栈存下标处理括号匹配的技巧。这道题需要理解如何用栈高效计算匹配长度。",
    "whyThisPattern": "栈中存下标。遍历时：遇到(入栈下标；遇到)时弹栈，如果栈为空说明当前)无法匹配，把当前下标入栈作为新的基准；如果栈不为空，当前下标-栈顶下标就是当前有效长度。栈底始终放一个基准下标（初始为-1）。",
    "hints": {
      "level1": "最长有效括号子串长度。有效括号=每个(都有对应的)。",
      "level2": "栈存下标，栈底放-1。弹栈后如果栈不空，i-stack[-1]就是当前有效长度。",
      "level3": "枚举子串检查有效性。",
      "level4": "栈+下标：遇到)弹栈，栈空则入栈新基准，否则更新长度。",
      "level5": "stack=[-1]; for i,c: if c==\"(\": stack.append(i); else: stack.pop(); if not stack: stack.append(i); else: maxLen=max(maxLen,i-stack[-1])",
      "level6": "# 核心思路：栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"(()\" 检查代码。\nclass Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        stack = [-1]  # 栈底哨兵：最后一个无法匹配的右括号位置\n        ans = 0\n\n        for i, ch in enumerate(s):\n            if ch == '(':\n                stack.append(i)\n            else:\n                stack.pop()\n                if not stack:\n                    # 当前 ')' 没有左括号匹配，成为新的分割点\n                    stack.append(i)\n                else:\n                    # i - stack[-1] 是当前合法段长度\n                    ans = max(ans, i - stack[-1])\n\n        return ans"
    },
    "bruteForceIdea": "枚举所有子串检查是否有效括号，记录最长的。O(n^3)。",
    "optimizedIdea": "栈存下标，栈底放-1作为基准。遇到(入栈；遇到)弹栈，如果栈空则入栈当前下标作为新基准，否则更新最大长度=i-stack[-1]。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"(()\" 检查代码。\nclass Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        stack = [-1]  # 栈底哨兵：最后一个无法匹配的右括号位置\n        ans = 0\n\n        for i, ch in enumerate(s):\n            if ch == '(':\n                stack.append(i)\n            else:\n                stack.pop()\n                if not stack:\n                    # 当前 ')' 没有左括号匹配，成为新的分割点\n                    stack.append(i)\n                else:\n                    # i - stack[-1] 是当前合法段长度\n                    ans = max(ans, i - stack[-1])\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最长有效括号」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 16,
    "leetcodeId": 33,
    "title": "搜索旋转排序数组",
    "titleEn": "Search in Rotated Sorted Array",
    "slug": "search-in-rotated-sorted-array",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 16,
    "externalUrl": "https://leetcode.cn/problems/search-in-rotated-sorted-array/",
    "summary": "给定一个经过旋转的升序数组 nums 和目标值 target，数组元素互不相同，请在数组中搜索 target 的下标；如果不存在，返回 -1。题目要求尽量达到 O(log n)。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握旋转数组二分查找：每次先判断哪一半是有序的，再判断 target 是否落在有序半边，从而安全丢弃另一半。",
    "whyThisPattern": "普通二分依赖整体有序，但旋转数组不是整体有序。关键观察是：无重复旋转数组任意取 mid 后，左半和右半至少有一半仍然有序。先判断有序半边，再看 target 是否在这半边的范围内；如果在，就保留这半边，否则丢弃它。这样每次仍然能排除一半候选区间，保持 O(log n)。",
    "hints": {
      "level1": "在旋转后的升序数组中找 target 的下标；不存在返回 -1。例如 nums=[4,5,6,7,0,1,2], target=0，答案是 4。",
      "level2": "普通二分会被旋转点打断，但每次切一刀后，左右两半至少有一半是有序的。先判断哪半有序，再判断 target 在不在这半。",
      "level3": "暴力法：从左到右扫描数组，遇到 target 就返回下标；扫完没找到返回 -1。时间 O(n)，空间 O(1)。",
      "level4": "优化关键：二分。若 nums[left] <= nums[mid]，左半有序；否则右半有序。target 落在有序半边就保留，否则去另一边。",
      "level5": "left=0,right=n-1; while left<=right: mid=(left+right)//2; if nums[mid]==target return mid; if 左半有序: 根据 target 是否在 [nums[left],nums[mid]) 调整边界; else: 根据 target 是否在 (nums[mid],nums[right]] 调整边界; return -1",
      "level6": "# 核心思路：旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,5,6,7,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return mid\n\n            # 左半边 [left, mid] 有序\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            # 右半边 [mid, right] 有序\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return -1"
    },
    "bruteForceIdea": "从左到右线性扫描 nums，逐个比较 nums[i] 是否等于 target；找到就返回 i，扫描结束还没找到就返回 -1。这个做法正确且容易写，但没有利用“旋转前有序”的结构，时间复杂度是 O(n)。",
    "optimizedIdea": "使用二分查找。每次计算 mid 后，先判断 nums[left..mid] 还是 nums[mid..right] 有序，再根据 target 是否落在有序区间内决定保留哪一半。由于每轮都能排除约一半候选元素，时间复杂度降为 O(log n)，空间复杂度 O(1)。",
    "pseudocode": "1. 明确二分区间是闭区间还是左闭右开。\n2. 写出 mid 后判断哪一半一定无答案。\n3. 更新 left/right 时保证区间收缩。\n4. 用单元素、无答案、重复/旋转边界检查。",
    "solutionCode": "# 核心思路：旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,5,6,7,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return mid\n\n            # 左半边 [left, mid] 有序\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            # 右半边 [mid, right] 有序\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return -1",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "把本题写成寻找最小值，忽略了 target 和返回下标。",
      "判断哪一半有序后，target 的边界范围没有写成左闭右开/左开右闭，导致漏掉 mid。",
      "while 条件和 left/right 更新不一致，可能死循环或跳过答案。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「搜索旋转排序数组」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 17,
    "leetcodeId": 34,
    "title": "在排序数组中查找元素的第一个和最后一个位置",
    "titleEn": "Find First and Last Position of Element in Sorted Array",
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 17,
    "externalUrl": "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "summary": "给定一个按照升序排列的整数数组nums，和一个目标值target。找出给定目标值在数组中的开始位置和结束位置。如果数组中不存在目标值target，返回[-1, -1]。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握左边界和右边界二分查找。这道题是二分查找的经典变体，需要理解如何找到第一个和最后一个位置。",
    "whyThisPattern": "两次二分查找：一次找左边界（第一个等于target的位置），一次找右边界（最后一个等于target的位置）。左边界二分：nums[mid]>=target时right=mid。右边界二分：nums[mid]<=target时left=mid。",
    "hints": {
      "level1": "找target的起始和结束位置。如果不存在返回[-1,-1]。",
      "level2": "两次二分查找：一次找左边界，一次找右边界。",
      "level3": "线性扫描O(n)。",
      "level4": "左边界：nums[mid]>=target时right=mid; 右边界：nums[mid]<=target时left=mid",
      "level5": "左边界二分找第一个>=target的位置; 右边界二分找最后一个<=target的位置; 检查是否越界且值等于target",
      "level6": "# 核心思路：用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[5,7,7,8,8,10], target=8 检查代码。\nclass Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        def lower_bound(x: int) -> int:\n            left, right = 0, len(nums)\n            # 在 [left, right) 中找第一个 >= x 的位置\n            while left < right:\n                mid = (left + right) // 2\n                if nums[mid] < x:\n                    left = mid + 1\n                else:\n                    right = mid\n            return left\n\n        start = lower_bound(target)\n        if start == len(nums) or nums[start] != target:\n            return [-1, -1]\n\n        end = lower_bound(target + 1) - 1\n        return [start, end]"
    },
    "bruteForceIdea": "线性扫描找第一个和最后一个target。时间O(n)。",
    "optimizedIdea": "两次二分：左边界-找第一个>=target的位置；右边界-找最后一个<=target的位置。时间O(logn)。",
    "pseudocode": "1. 明确二分区间是闭区间还是左闭右开。\n2. 写出 mid 后判断哪一半一定无答案。\n3. 更新 left/right 时保证区间收缩。\n4. 用单元素、无答案、重复/旋转边界检查。",
    "solutionCode": "# 核心思路：用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[5,7,7,8,8,10], target=8 检查代码。\nclass Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        def lower_bound(x: int) -> int:\n            left, right = 0, len(nums)\n            # 在 [left, right) 中找第一个 >= x 的位置\n            while left < right:\n                mid = (left + right) // 2\n                if nums[mid] < x:\n                    left = mid + 1\n                else:\n                    right = mid\n            return left\n\n        start = lower_bound(target)\n        if start == len(nums) or nums[start] != target:\n            return [-1, -1]\n\n        end = lower_bound(target + 1) - 1\n        return [start, end]",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「在排序数组中查找元素的第一个和最后一个位置」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 18,
    "leetcodeId": 39,
    "title": "组合总和",
    "titleEn": "Combination Sum",
    "slug": "combination-sum",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯"
    ],
    "order": 18,
    "externalUrl": "https://leetcode.cn/problems/combination-sum/",
    "summary": "给你一个无重复元素的整数数组candidates和一个目标数target，找出candidates中可以使数字和为目标数target的所有不同组合。同一个数字可以无限制重复被选取。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回溯+剪枝：排序后剪枝避免重复组合。这道题是组合问题的经典应用。",
    "whyThisPattern": "每个数字可以选择多次（无限制重复），所以递归时下一个起点还是当前位置（不是i+1）。排序后可以剪枝：如果当前数字已经大于target，后面的数字更大，直接break。",
    "hints": {
      "level1": "组合总和，数字可以重复使用。比如[2,3,6,7] target=7，结果是[[2,2,3],[7]]。",
      "level2": "每个数字可以选多次，所以递归时传i（不是i+1）。排序后可以剪枝。",
      "level3": "枚举所有组合。",
      "level4": "回溯：排序后从start选择，可重复选（传i），>target就break。",
      "level5": "排序; def bt(start,path,target): if target==0: res.append(path); return; for i in range(start,n): if nums[i]>target: break; bt(i,path+[nums[i]],target-nums[i])",
      "level6": "# 核心思路：回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 candidates=[2,3,6,7], target=7 检查代码。\nclass Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        candidates.sort()\n        ans = []\n        path = []\n\n        def backtrack(start: int, remain: int) -> None:\n            if remain == 0:\n                ans.append(path[:])\n                return\n\n            for i in range(start, len(candidates)):\n                x = candidates[i]\n                if x > remain:  # 排序后后面更大，直接剪枝\n                    break\n                path.append(x)\n                backtrack(i, remain - x)  # i 不是 i+1，因为可以重复选 x\n                path.pop()\n\n        backtrack(0, target)\n        return ans"
    },
    "bruteForceIdea": "暴力思路：枚举所有可能的组合，检查和是否为target。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "回溯+排序剪枝：排序后从start开始选择，每个数字可以选择多次（递归时传i而不是i+1）。如果当前数字>target就break。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 candidates=[2,3,6,7], target=7 检查代码。\nclass Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        candidates.sort()\n        ans = []\n        path = []\n\n        def backtrack(start: int, remain: int) -> None:\n            if remain == 0:\n                ans.append(path[:])\n                return\n\n            for i in range(start, len(candidates)):\n                x = candidates[i]\n                if x > remain:  # 排序后后面更大，直接剪枝\n                    break\n                path.append(x)\n                backtrack(i, remain - x)  # i 不是 i+1，因为可以重复选 x\n                path.pop()\n\n        backtrack(0, target)\n        return ans",
    "complexity": {
      "time": "O(S)",
      "space": "O(target/min(candidates))"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「组合总和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 19,
    "leetcodeId": 42,
    "title": "接雨水",
    "titleEn": "Trapping Rain Water",
    "slug": "trapping-rain-water",
    "difficulty": "困难",
    "category": "双指针",
    "tags": [
      "双指针",
      "栈",
      "动态规划"
    ],
    "order": 19,
    "externalUrl": "https://leetcode.cn/problems/trapping-rain-water/",
    "summary": "给定n个非负整数表示每个宽度为1的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握双指针从两端向中间的思想。这道题需要理解每个位置能接多少水取决于左右两边最高柱子的较小值。",
    "whyThisPattern": "对每个位置i，能接的水量=min(left_max[i], right_max[i]) - height[i]（如果为正）。暴力：对每个位置分别向左右扫描找最高柱子。优化：双指针，从两端出发，维护left_max和right_max。",
    "hints": {
      "level1": "接雨水。每个位置能接的水量=min(左边最高,右边最高)-当前高度。",
      "level2": "双指针：移动较矮的那一端。因为较矮的那端的水量已经确定了。",
      "level3": "对每个位置扫描左右最高O(n^2)。",
      "level4": "双指针从两端出发，维护left_max和right_max。移动较矮的那端。",
      "level5": "left=0,right=n-1,left_max=right_max=0,res=0; while left<right: if h[left]<h[right]: if h[left]>=left_max: left_max=h[left]; else: res+=left_max-h[left]; left++; else: 同理处理right",
      "level6": "# 核心思路：双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[0,1,0,2,1,0,1,3,2,1,2,1] 检查代码。\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max = right_max = 0\n        ans = 0\n\n        while left < right:\n            left_max = max(left_max, height[left])\n            right_max = max(right_max, height[right])\n\n            # 左侧最高墙更矮，当前位置水量由 left_max 决定\n            if left_max < right_max:\n                ans += left_max - height[left]\n                left += 1\n            else:\n                ans += right_max - height[right]\n                right -= 1\n\n        return ans"
    },
    "bruteForceIdea": "对每个位置i，分别向左和向右扫描找最高柱子，计算min(left_max,right_max)-height[i]。时间O(n^2)。",
    "optimizedIdea": "双指针：left=0, right=n-1, left_max=0, right_max=0。当height[left]<height[right]时，如果height[left]>=left_max则更新left_max，否则接水left_max-height[left]。left++。另一边同理。",
    "pseudocode": "1. 先明确两个指针分别代表什么边界。\n2. 证明每次移动哪一个指针不会漏答案。\n3. 在循环内先更新答案，再移动指针。\n4. 用最小长度、单调数组、重复值样例检查。",
    "solutionCode": "# 核心思路：双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[0,1,0,2,1,0,1,3,2,1,2,1] 检查代码。\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max = right_max = 0\n        ans = 0\n\n        while left < right:\n            left_max = max(left_max, height[left])\n            right_max = max(right_max, height[right])\n\n            # 左侧最高墙更矮，当前位置水量由 left_max 决定\n            if left_max < right_max:\n                ans += left_max - height[left]\n                left += 1\n            else:\n                ans += right_max - height[right]\n                right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「接雨水」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 20,
    "leetcodeId": 46,
    "title": "全排列",
    "titleEn": "Permutations",
    "slug": "permutations",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯"
    ],
    "order": 20,
    "externalUrl": "https://leetcode.cn/problems/permutations/",
    "summary": "给定一个不含重复数字的数组nums，返回其所有可能的全排列。可以按任意顺序返回答案。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回溯生成全排列的框架。这道题是回溯的经典应用，需要理解used数组的作用。",
    "whyThisPattern": "全排列：每个位置可以放任何一个还没用过的数字。用used数组标记哪些数字已经用了。当path长度等于nums长度时记录结果。",
    "hints": {
      "level1": "全排列：n个数字的所有排列方式。",
      "level2": "每个位置选一个未使用的数字，用used数组标记。",
      "level3": "递归枚举。",
      "level4": "回溯+used：选→标记→递归→撤销标记。",
      "level5": "def bt(path,used): if len(path)==n: res.append(path[:]); return; for i in range(n): if not used[i]: used[i]=True; path.append(nums[i]); bt(path,used); path.pop(); used[i]=False",
      "level6": "# 核心思路：回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n        used = [False] * len(nums)\n\n        def backtrack() -> None:\n            if len(path) == len(nums):\n                ans.append(path[:])\n                return\n\n            for i, x in enumerate(nums):\n                if used[i]:\n                    continue\n                used[i] = True\n                path.append(x)\n                backtrack()\n                path.pop()\n                used[i] = False\n\n        backtrack()\n        return ans"
    },
    "bruteForceIdea": "暴力思路：递归枚举所有排列。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "回溯+used数组：for每个数字，如果没用过就选择它（标记used），递归下一层，撤销选择（取消标记）。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n        used = [False] * len(nums)\n\n        def backtrack() -> None:\n            if len(path) == len(nums):\n                ans.append(path[:])\n                return\n\n            for i, x in enumerate(nums):\n                if used[i]:\n                    continue\n                used[i] = True\n                path.append(x)\n                backtrack()\n                path.pop()\n                used[i] = False\n\n        backtrack()\n        return ans",
    "complexity": {
      "time": "O(n!·n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「全排列」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 21,
    "leetcodeId": 48,
    "title": "旋转图像",
    "titleEn": "Rotate Image",
    "slug": "rotate-image",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "矩阵"
    ],
    "order": 21,
    "externalUrl": "https://leetcode.cn/problems/rotate-image/",
    "summary": "给定一个n×n的矩阵matrix，请你将矩阵顺时针旋转90度。你必须在原地旋转矩阵，不能使用另一个矩阵。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握矩阵转置+翻转的技巧。这道题需要理解旋转90度等于先转置再水平翻转。",
    "whyThisPattern": "顺时针旋转90度=先沿主对角线转置（swap(matrix[i][j], matrix[j][i])），再水平翻转（每行reverse）。逆时针旋转90度=先转置再垂直翻转。",
    "hints": {
      "level1": "顺时针旋转90度。原地操作。",
      "level2": "两步：转置+水平翻转。",
      "level3": "新矩阵O(n^2)空间。",
      "level4": "转置+水平翻转。",
      "level5": "for i in range(n): for j in range(i+1,n): swap(matrix[i][j],matrix[j][i]); for row in matrix: row.reverse()",
      "level6": "# 核心思路：顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix=[[1]] 检查代码。\nclass Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n\n        # 第一步：沿主对角线转置，matrix[i][j] 与 matrix[j][i] 交换\n        for i in range(n):\n            for j in range(i + 1, n):\n                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n\n        # 第二步：每一行左右反转\n        for row in matrix:\n            row.reverse()"
    },
    "bruteForceIdea": "创建新矩阵，新[i][j]=旧[n-1-j][i]。O(n^2)空间。",
    "optimizedIdea": "原地旋转：先转置（swap(matrix[i][j], matrix[j][i])），再水平翻转（每行reverse）。O(1)空间。",
    "pseudocode": "1. 先明确坐标含义和行列边界。\n2. 利用矩阵的排序、层次或方向性质排除范围。\n3. 更新坐标时保证不会越界和重复访问。\n4. 用 1×1、单行、单列样例检查。",
    "solutionCode": "# 核心思路：顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix=[[1]] 检查代码。\nclass Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n\n        # 第一步：沿主对角线转置，matrix[i][j] 与 matrix[j][i] 交换\n        for i in range(n):\n            for j in range(i + 1, n):\n                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n\n        # 第二步：每一行左右反转\n        for row in matrix:\n            row.reverse()",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "行列下标写反。",
      "边界判断漏掉单行单列。",
      "原地标记后忘记恢复或影响后续搜索。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「旋转图像」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 22,
    "leetcodeId": 49,
    "title": "字母异位词分组",
    "titleEn": "Group Anagrams",
    "slug": "group-anagrams",
    "difficulty": "中等",
    "category": "哈希",
    "tags": [
      "哈希表"
    ],
    "order": 22,
    "externalUrl": "https://leetcode.cn/problems/group-anagrams/",
    "summary": "给你一个字符串数组，请你将字母异位词组合在一起。可以按任意顺序返回答案列表。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握用排序后的字符串作为哈希键。这道题是哈希表的经典应用。",
    "whyThisPattern": "字母异位词：字母相同但顺序不同的字符串。排序后相同。所以用排序后的字符串作为key，相同key的分为一组。",
    "hints": {
      "level1": "字母异位词分组。比如\"eat\",\"tea\",\"ate\"是一组。",
      "level2": "排序后的字符串作为key。",
      "level3": "对每对字符串排序比较。",
      "level4": "哈希表：key=sorted(s)。",
      "level5": "from collections import defaultdict; map=defaultdict(list); for s in strs: key=str(sorted(s)); map[key].append(s); return list(map.values())",
      "level6": "# 核心思路：字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 strs=[\"\"] 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n\n        for word in strs:\n            # 异位词排序后的字符序列完全相同\n            key = ''.join(sorted(word))\n            groups[key].append(word)\n\n        return list(groups.values())"
    },
    "bruteForceIdea": "对每对字符串检查是否是异位词（排序比较）。O(n^2*mlogm)。",
    "optimizedIdea": "哈希表：key=sorted(s)，相同key的分为一组。O(n*mlogm)时间。",
    "pseudocode": "1. 先说暴力解的重复查找在哪里。\n2. 定义哈希表 key/value 分别保存什么。\n3. 遍历时先查询再更新哈希表，避免自匹配或漏算。\n4. 用重复值、负数、空/极小输入检查边界。",
    "solutionCode": "# 核心思路：字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 strs=[\"\"] 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n\n        for word in strs:\n            # 异位词排序后的字符序列完全相同\n            key = ''.join(sorted(word))\n            groups[key].append(word)\n\n        return list(groups.values())",
    "complexity": {
      "time": "O(n·klogk)",
      "space": "O(nk)"
    },
    "commonMistakes": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「字母异位词分组」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 23,
    "leetcodeId": 53,
    "title": "最大子数组和",
    "titleEn": "Maximum Subarray",
    "slug": "maximum-subarray",
    "difficulty": "中等",
    "category": "普通数组",
    "tags": [
      "数组",
      "动态规划"
    ],
    "order": 23,
    "externalUrl": "https://leetcode.cn/problems/maximum-subarray/",
    "summary": "给你一个整数数组nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握Kadane算法：动态规划维护以当前位置结尾的最大子数组和。这道题是动态规划的入门题。",
    "whyThisPattern": "dp[i]=以nums[i]结尾的最大子数组和。dp[i]=max(nums[i], dp[i-1]+nums[i])。如果前面的和<0，就重新开始。最终答案=max(dp[i])。空间可优化为一个变量。",
    "hints": {
      "level1": "最大子数组和。连续子数组。",
      "level2": "dp[i]=max(nums[i], dp[i-1]+nums[i])。前面的和<0就重新开始。",
      "level3": "枚举所有子数组O(n^2)。",
      "level4": "Kadane：curr=max(num, curr+num)。",
      "level5": "curr=nums[0]; res=nums[0]; for i in 1..n-1: curr=max(nums[i],curr+nums[i]); res=max(res,curr); return res",
      "level6": "# 核心思路：dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-2,1,-3,4,-1,2,1,-5,4] 检查代码。\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        cur = ans = nums[0]  # 必须用 nums[0] 初始化，防止全负数错误\n\n        for x in nums[1:]:\n            # 如果 cur 为负，接上它只会拖累 x，所以从 x 重新开始\n            cur = max(x, cur + x)\n            ans = max(ans, cur)\n\n        return ans"
    },
    "bruteForceIdea": "暴力思路：枚举所有子数组求和。O(n^2)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "Kadane算法：curr=max(nums[i], curr+nums[i])。如果curr+nums[i]<nums[i]，说明前面的和是负数，重新开始。",
    "pseudocode": "1. 先找数组结构：前缀、区间、排序或原地标记。\n2. 定义扫描过程中维护的不变量。\n3. 每次更新前确认是否破坏原相对顺序或边界。\n4. 用空/单元素、重复值、全有序样例检查。",
    "solutionCode": "# 核心思路：dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-2,1,-3,4,-1,2,1,-5,4] 检查代码。\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        cur = ans = nums[0]  # 必须用 nums[0] 初始化，防止全负数错误\n\n        for x in nums[1:]:\n            # 如果 cur 为负，接上它只会拖累 x，所以从 x 重新开始\n            cur = max(x, cur + x)\n            ans = max(ans, cur)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最大子数组和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 24,
    "leetcodeId": 55,
    "title": "跳跃游戏",
    "titleEn": "Jump Game",
    "slug": "jump-game",
    "difficulty": "中等",
    "category": "贪心",
    "tags": [
      "贪心"
    ],
    "order": 24,
    "externalUrl": "https://leetcode.cn/problems/jump-game/",
    "summary": "给定一个非负整数数组nums，你最初位于数组的第一个下标。数组中的每个元素代表在该位置可以跳跃的最大长度。判断你是否能够到达最后一个下标。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握贪心维护最远可达位置。这道题的关键是理解不需要考虑所有路径，只需要维护最远能到达哪里。",
    "whyThisPattern": "贪心：遍历数组，维护max_i=当前能到达的最远位置。如果当前位置i>max_i，说明无法到达i，返回false。否则更新max_i=max(max_i, i+nums[i])。如果max_i>=n-1，返回true。",
    "hints": {
      "level1": "跳跃游戏。从位置0出发，每个位置可以跳1到nums[i]步。",
      "level2": "贪心：只需要维护最远能到达的位置。不需要考虑所有路径。",
      "level3": "DFS所有路径。",
      "level4": "贪心：max_i=max(max_i, i+nums[i])。i>max_i则不可达。",
      "level5": "max_i=0; for i,jump in enumerate(nums): if max_i<i: return False; max_i=max(max_i,i+jump); return True",
      "level6": "# 核心思路：维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,1,1,4] 检查代码。\nclass Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        farthest = 0\n\n        for i, jump in enumerate(nums):\n            if i > farthest:\n                return False  # 当前下标都到不了，后面更不可能\n            farthest = max(farthest, i + jump)\n            if farthest >= len(nums) - 1:\n                return True\n\n        return True"
    },
    "bruteForceIdea": "暴力思路：DFS尝试所有跳跃路径。O(2^n)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "贪心：维护max_i。遍历时如果i>max_i返回false，否则更新max_i。",
    "pseudocode": "1. 先说明局部最优选择是什么。\n2. 证明这个选择不会损失全局最优。\n3. 遍历中维护覆盖范围、最优候选或排序结构。\n4. 用反例尝试推翻贪心，确认边界。",
    "solutionCode": "# 核心思路：维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,1,1,4] 检查代码。\nclass Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        farthest = 0\n\n        for i, jump in enumerate(nums):\n            if i > farthest:\n                return False  # 当前下标都到不了，后面更不可能\n            farthest = max(farthest, i + jump)\n            if farthest >= len(nums) - 1:\n                return True\n\n        return True",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「跳跃游戏」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 25,
    "leetcodeId": 56,
    "title": "合并区间",
    "titleEn": "Merge Intervals",
    "slug": "merge-intervals",
    "difficulty": "中等",
    "category": "普通数组",
    "tags": [
      "数组",
      "排序"
    ],
    "order": 25,
    "externalUrl": "https://leetcode.cn/problems/merge-intervals/",
    "summary": "以数组intervals表示若干个区间的集合，其中单个区间为intervals[i]=[starti, endi]。请你合并所有重叠的区间，并返回一个不重叠的区间数组。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握排序+线性扫描合并区间。这道题是区间问题的经典应用。",
    "whyThisPattern": "排序后逐个合并：按起点排序。遍历时，如果当前区间的起点<=上一个合并区间的终点，说明重叠，合并（更新终点为两者的较大值）；否则新增一个区间。",
    "hints": {
      "level1": "合并重叠区间。比如[[1,3],[2,6],[8,10],[15,18]]->[[1,6],[8,10],[15,18]]。",
      "level2": "排序后逐个合并。重叠条件：当前起点<=上一个终点。",
      "level3": "检查所有区间对O(n^2)。",
      "level4": "排序+扫描：重叠则合并，不重叠则新增。",
      "level5": "intervals.sort(); merged=[intervals[0]]; for interval in intervals[1:]: if interval[0]<=merged[-1][1]: merged[-1][1]=max(merged[-1][1],interval[1]); else: merged.append(interval)",
      "level6": "# 核心思路：先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 intervals=[[1,3],[2,6],[8,10],[15,18]] 检查代码。\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n\n        for start, end in intervals:\n            if not merged or start > merged[-1][1]:\n                merged.append([start, end])\n            else:\n                # 当前区间与最后一个区间重叠，右端点取更大值\n                merged[-1][1] = max(merged[-1][1], end)\n\n        return merged"
    },
    "bruteForceIdea": "暴力思路：检查所有区间对是否重叠。O(n^2)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "排序后线性扫描：按起点排序。for interval: if merged非空且interval[0]<=merged[-1][1]: 合并; else: 新增。",
    "pseudocode": "1. 先找数组结构：前缀、区间、排序或原地标记。\n2. 定义扫描过程中维护的不变量。\n3. 每次更新前确认是否破坏原相对顺序或边界。\n4. 用空/单元素、重复值、全有序样例检查。",
    "solutionCode": "# 核心思路：先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 intervals=[[1,3],[2,6],[8,10],[15,18]] 检查代码。\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n\n        for start, end in intervals:\n            if not merged or start > merged[-1][1]:\n                merged.append([start, end])\n            else:\n                # 当前区间与最后一个区间重叠，右端点取更大值\n                merged[-1][1] = max(merged[-1][1], end)\n\n        return merged",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「合并区间」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 26,
    "leetcodeId": 62,
    "title": "不同路径",
    "titleEn": "Unique Paths",
    "slug": "unique-paths",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 26,
    "externalUrl": "https://leetcode.cn/problems/unique-paths/",
    "summary": "一个机器人位于m×n网格的左上角，每次只能向下或向右移动一步。机器人试图达到网格的右下角。问总共有多少条不同的路径。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二维动态规划的基本思想：dp[i][j]可以从dp[i-1][j]和dp[i][j-1]两个方向转移过来。这道题是二维DP的入门经典。",
    "whyThisPattern": "机器人只能向右或向下走，所以到达(i,j)的路径数=到达(i-1,j)的路径数+到达(i,j-1)的路径数。这天然就是一个DP递推关系。暴力递归有大量重复子问题，DP可以避免。",
    "hints": {
      "level1": "从左上角到右下角，每次只能向右或向下，有多少条路径。",
      "level2": "到达(i,j)的路径数=到达(i-1,j)+到达(i,j-1)。这是DP递推关系。",
      "level3": "递归暴力，指数时间。",
      "level4": "DP：dp[i][j]=dp[i-1][j]+dp[i][j-1]。初始化第一行第一列为1。",
      "level5": "dp=[1]*n; for i in 1..m-1: for j in 1..n-1: dp[j]+=dp[j-1]; return dp[n-1]",
      "level6": "# 核心思路：到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 m=3, n=7 检查代码。\nclass Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # 第一行每个格子都只有 1 种走法\n        dp = [1] * n\n\n        for _ in range(1, m):\n            for j in range(1, n):\n                # dp[j] 是上方，dp[j-1] 是左方\n                dp[j] += dp[j - 1]\n\n        return dp[-1]"
    },
    "bruteForceIdea": "递归：paths(i,j)=paths(i-1,j)+paths(i,j-1)。终止条件：i==0或j==0时返回1。时间O(2^(m+n))，有大量重复计算。",
    "optimizedIdea": "DP：dp[i][j]=dp[i-1][j]+dp[i][j-1]。初始化：第一行和第一列都是1（只有一种走法）。时间O(mn)，空间可优化为O(n)（滚动数组）。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 m=3, n=7 检查代码。\nclass Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # 第一行每个格子都只有 1 种走法\n        dp = [1] * n\n\n        for _ in range(1, m):\n            for j in range(1, n):\n                # dp[j] 是上方，dp[j-1] 是左方\n                dp[j] += dp[j - 1]\n\n        return dp[-1]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「不同路径」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 27,
    "leetcodeId": 64,
    "title": "最小路径和",
    "titleEn": "Minimum Path Sum",
    "slug": "minimum-path-sum",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 27,
    "externalUrl": "https://leetcode.cn/problems/minimum-path-sum/",
    "summary": "给定一个m×n的整数网格grid，找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。每次只能向下或者向右移动一步。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二维DP的状态转移：dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1])。这道题和\"不同路径\"类似，但需要取最小值。",
    "whyThisPattern": "到达(i,j)的最小路径和=grid[i][j]+min(从上面来的最小路径和,从左边来的最小路径和)。这和\"不同路径\"的思路一样，只是把计数变成取最小值。",
    "hints": {
      "level1": "从左上到右下找最小路径和。只能向右或向下。",
      "level2": "dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1])。",
      "level3": "DFS所有路径。",
      "level4": "DP递推：从上面或从左边取较小值加上当前值。",
      "level5": "初始化第一行第一列（累加）; for i in 1..m-1: for j in 1..n-1: dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1]); return dp[m-1][n-1]",
      "level6": "# 核心思路：dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 grid=[[1,3,1],[1,5,1],[4,2,1]] 检查代码。\nclass Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n\n        # 初始化第一行：只能从左边来\n        for j in range(1, n):\n            dp[j] = dp[j - 1] + grid[0][j]\n\n        for i in range(1, m):\n            dp[0] += grid[i][0]  # 第一列只能从上方来\n            for j in range(1, n):\n                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]\n\n        return dp[-1]"
    },
    "bruteForceIdea": "DFS所有从左上到右下的路径，记录最小路径和。时间O(2^(m+n))。",
    "optimizedIdea": "DP：dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1])。初始化：第一行累加，第一列累加。时间O(mn)。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 grid=[[1,3,1],[1,5,1],[4,2,1]] 检查代码。\nclass Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n\n        # 初始化第一行：只能从左边来\n        for j in range(1, n):\n            dp[j] = dp[j - 1] + grid[0][j]\n\n        for i in range(1, m):\n            dp[0] += grid[i][0]  # 第一列只能从上方来\n            for j in range(1, n):\n                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]\n\n        return dp[-1]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最小路径和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 28,
    "leetcodeId": 70,
    "title": "爬楼梯",
    "titleEn": "Climbing Stairs",
    "slug": "climbing-stairs",
    "difficulty": "简单",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 28,
    "externalUrl": "https://leetcode.cn/problems/climbing-stairs/",
    "summary": "假设你正在爬楼梯。需要n阶你才能到达楼顶。每次你可以爬1或2个台阶。你有多少种不同的方法可以爬到楼顶？",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "理解动态规划核心：dp[i]=dp[i-1]+dp[i-2]。 通过这道题深入理解动态规划类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "递归O(2^n)。DP O(n)。 这是动态规划的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "爬楼梯，每次1或2阶，求到n阶有多少种方法。",
      "level2": "dp[i]=dp[i-1]+dp[i-2]。这就是斐波那契数列！",
      "level3": "递归O(2^n)，有大量重复子问题。",
      "level4": "DP：只需要前两个值，滚动更新。",
      "level5": "if n<=2: return n; prev1=1; prev2=2; for i in 3..n: curr=prev1+prev2; prev1=prev2; prev2=curr; return prev2",
      "level6": "# 核心思路：到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n\n        prev2, prev1 = 1, 2  # f(1), f(2)\n        for _ in range(3, n + 1):\n            cur = prev1 + prev2\n            prev2, prev1 = prev1, cur\n\n        return prev1"
    },
    "bruteForceIdea": "递归：f(n)=f(n-1)+f(n-2)。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。 只需要前两阶答案，滚动变量即可。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n\n        prev2, prev1 = 1, 2  # f(1), f(2)\n        for _ in range(3, n + 1):\n            cur = prev1 + prev2\n            prev2, prev1 = prev1, cur\n\n        return prev1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「爬楼梯」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 29,
    "leetcodeId": 72,
    "title": "编辑距离",
    "titleEn": "Edit Distance",
    "slug": "edit-distance",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 29,
    "externalUrl": "https://leetcode.cn/problems/edit-distance/",
    "summary": "给你两个单词word1和word2，请计算出将word1转换成word2所使用的最少操作数。你可以对一个单词进行三种操作：插入一个字符、删除一个字符、替换一个字符。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二维DP：dp[i][j]=word1前i个字符变成word2前j个字符的最少操作。 通过这道题深入理解多维动态规划类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "递归+记忆化。DP O(mn)。 这是多维动态规划的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "编辑距离：插入、删除、替换三种操作，求最少操作数。",
      "level2": "dp[i][j]=min(删除,插入,替换)。三种操作对应三种转移。",
      "level3": "递归暴力。",
      "level4": "DP：dp[i][j]=min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)",
      "level5": "初始化dp[i][0]=i, dp[0][j]=j; for i,j: if word1[i-1]==word2[j-1]: dp[i][j]=dp[i-1][j-1]; else: dp[i][j]=1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])",
      "level6": "# 核心思路：dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 word1=\"horse\", word2=\"ros\" 检查代码。\nclass Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n\n        # word1 前 i 个字符变成空串：删除 i 次\n        for i in range(m + 1):\n            dp[i][0] = i\n        # 空串变成 word2 前 j 个字符：插入 j 次\n        for j in range(n + 1):\n            dp[0][j] = j\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = 1 + min(\n                        dp[i - 1][j],     # 删除 word1[i-1]\n                        dp[i][j - 1],     # 插入 word2[j-1]\n                        dp[i - 1][j - 1]  # 替换 word1[i-1]\n                    )\n\n        return dp[m][n]"
    },
    "bruteForceIdea": "递归：三种操作取最小。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "DP：dp[i][j]=min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(same?0:1))。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 word1=\"horse\", word2=\"ros\" 检查代码。\nclass Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n\n        # word1 前 i 个字符变成空串：删除 i 次\n        for i in range(m + 1):\n            dp[i][0] = i\n        # 空串变成 word2 前 j 个字符：插入 j 次\n        for j in range(n + 1):\n            dp[0][j] = j\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = 1 + min(\n                        dp[i - 1][j],     # 删除 word1[i-1]\n                        dp[i][j - 1],     # 插入 word2[j-1]\n                        dp[i - 1][j - 1]  # 替换 word1[i-1]\n                    )\n\n        return dp[m][n]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「编辑距离」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 30,
    "leetcodeId": 75,
    "title": "颜色分类",
    "titleEn": "Sort Colors",
    "slug": "sort-colors",
    "difficulty": "中等",
    "category": "技巧",
    "tags": [
      "数组",
      "排序"
    ],
    "order": 30,
    "externalUrl": "https://leetcode.cn/problems/sort-colors/",
    "summary": "给定一个包含红色、白色和蓝色，共n个元素的数组nums，原地对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。我们使用整数0、1和2分别表示红色、白色和蓝色。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握三指针分区：low、mid、high。 通过这道题深入理解技巧类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "计数排序两次遍历。三指针一次遍历。 这是技巧的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "荷兰国旗问题：只包含0、1、2的数组排序。",
      "level2": "三指针：low指向0区域右边界，high指向2区域左边界，mid扫描。",
      "level3": "计数排序两次遍历。",
      "level4": "三指针：0放左边，2放右边，1留中间。",
      "level5": "low=0,mid=0,high=n-1; while mid<=high: if nums[mid]==0: swap(mid,low);low++;mid++; elif nums[mid]==1: mid++; else: swap(mid,high);high--",
      "level6": "# 核心思路：荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,0,2,1,1,0] 检查代码。\nclass Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        left, i, right = 0, 0, len(nums) - 1\n\n        while i <= right:\n            if nums[i] == 0:\n                nums[left], nums[i] = nums[i], nums[left]\n                left += 1\n                i += 1\n            elif nums[i] == 2:\n                nums[i], nums[right] = nums[right], nums[i]\n                right -= 1\n                # 注意：这里 i 不加一，因为换过来的元素还没检查\n            else:\n                i += 1"
    },
    "bruteForceIdea": "计数统计0、1、2的个数再重写。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。 每个元素最多被交换到所属区域一次，原地排序。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,0,2,1,1,0] 检查代码。\nclass Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        left, i, right = 0, 0, len(nums) - 1\n\n        while i <= right:\n            if nums[i] == 0:\n                nums[left], nums[i] = nums[i], nums[left]\n                left += 1\n                i += 1\n            elif nums[i] == 2:\n                nums[i], nums[right] = nums[right], nums[i]\n                right -= 1\n                # 注意：这里 i 不加一，因为换过来的元素还没检查\n            else:\n                i += 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「颜色分类」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 31,
    "leetcodeId": 76,
    "title": "最小覆盖子串",
    "titleEn": "Minimum Window Substring",
    "slug": "minimum-window-substring",
    "difficulty": "困难",
    "category": "滑动窗口",
    "tags": [
      "滑动窗口"
    ],
    "order": 31,
    "externalUrl": "https://leetcode.cn/problems/minimum-window-substring/",
    "summary": "给你一个字符串s、一个字符串t。返回s中涵盖t所有字符的最小子串。如果s中不存在涵盖t所有字符的子串，则返回空字符串。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握变长滑动窗口+字符计数：have/need判断是否满足。 通过这道题深入理解滑动窗口类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "枚举所有子串O(n^2)。滑动窗口O(n)。 这是滑动窗口的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "最小覆盖子串。包含t所有字符的最短子串。",
      "level2": "need统计t的字符频率。have统计满足的字符数。滑动窗口。",
      "level3": "枚举子串检查。",
      "level4": "变长滑动窗口：right扩展满足条件，left收缩找最短。",
      "level5": "need=Counter(t); have=0; left=0; for right: 更新have; while have==len(need): 更新最短; 收缩left更新have",
      "level6": "# 核心思路：滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"ADOBECODEBANC\", t=\"ABC\" 检查代码。\nfrom collections import Counter, defaultdict\n\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        window = defaultdict(int)\n        required = len(need)  # 有多少种字符需要满足频次\n        formed = 0            # 当前有多少种字符已经满足频次\n        left = 0\n        best_len = float('inf')\n        best_start = 0\n\n        for right, ch in enumerate(s):\n            window[ch] += 1\n            if ch in need and window[ch] == need[ch]:\n                formed += 1\n\n            # 当前窗口已经覆盖 t，尝试收缩到最短\n            while formed == required:\n                if right - left + 1 < best_len:\n                    best_len = right - left + 1\n                    best_start = left\n\n                out = s[left]\n                window[out] -= 1\n                if out in need and window[out] < need[out]:\n                    formed -= 1\n                left += 1\n\n        return '' if best_len == float('inf') else s[best_start:best_start + best_len]"
    },
    "bruteForceIdea": "枚举所有包含t的子串取最短。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。 左右指针都只向右移动；计数字典大小受字符集限制。",
    "pseudocode": "1. 明确窗口内维护的条件是什么。\n2. 右指针扩张并更新窗口状态。\n3. 当窗口不满足/已经满足条件时移动左指针。\n4. 每次更新答案时确认窗口左右边界是否闭区间。",
    "solutionCode": "# 核心思路：滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"ADOBECODEBANC\", t=\"ABC\" 检查代码。\nfrom collections import Counter, defaultdict\n\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        window = defaultdict(int)\n        required = len(need)  # 有多少种字符需要满足频次\n        formed = 0            # 当前有多少种字符已经满足频次\n        left = 0\n        best_len = float('inf')\n        best_start = 0\n\n        for right, ch in enumerate(s):\n            window[ch] += 1\n            if ch in need and window[ch] == need[ch]:\n                formed += 1\n\n            # 当前窗口已经覆盖 t，尝试收缩到最短\n            while formed == required:\n                if right - left + 1 < best_len:\n                    best_len = right - left + 1\n                    best_start = left\n\n                out = s[left]\n                window[out] -= 1\n                if out in need and window[out] < need[out]:\n                    formed -= 1\n                left += 1\n\n        return '' if best_len == float('inf') else s[best_start:best_start + best_len]",
    "complexity": {
      "time": "O(|s|+|t|)",
      "space": "O(字符集大小)"
    },
    "commonMistakes": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最小覆盖子串」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 32,
    "leetcodeId": 78,
    "title": "子集",
    "titleEn": "Subsets",
    "slug": "subsets",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯"
    ],
    "order": 32,
    "externalUrl": "https://leetcode.cn/problems/subsets/",
    "summary": "给你一个整数数组nums，数组中的元素互不相同。返回该数组所有可能的子集（幂集）。解集不能包含重复的子集。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握回溯生成子集：每个元素选或不选。 通过这道题深入理解回溯类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "枚举2^n个子集。 这是回溯的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "所有子集。每个元素选或不选。",
      "level2": "回溯：从start开始，每个path都是子集。",
      "level3": "枚举2^n个子集。",
      "level4": "回溯：选→递归→撤销。每个节点都是结果。",
      "level5": "def bt(start,path): res.append(path[:]); for i in range(start,n): path.append(nums[i]); bt(i+1,path); path.pop()",
      "level6": "# 核心思路：子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n\n        def backtrack(start: int) -> None:\n            # 子集题：树上的每一个节点都是答案\n            ans.append(path[:])\n\n            for i in range(start, len(nums)):\n                path.append(nums[i])\n                backtrack(i + 1)\n                path.pop()\n\n        backtrack(0)\n        return ans"
    },
    "bruteForceIdea": "回溯：每个元素选或不选。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。 共有 2^n 个子集，拷贝每个子集最坏 O(n)；递归深度 n。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n\n        def backtrack(start: int) -> None:\n            # 子集题：树上的每一个节点都是答案\n            ans.append(path[:])\n\n            for i in range(start, len(nums)):\n                path.append(nums[i])\n                backtrack(i + 1)\n                path.pop()\n\n        backtrack(0)\n        return ans",
    "complexity": {
      "time": "O(2^n·n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「子集」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 33,
    "leetcodeId": 79,
    "title": "单词搜索",
    "titleEn": "Word Search",
    "slug": "word-search",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "回溯",
      "矩阵"
    ],
    "order": 33,
    "externalUrl": "https://leetcode.cn/problems/word-search/",
    "summary": "给定一个m×n二维字符网格board和一个字符串单词word。如果word存在于网格中，返回true；否则返回false。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握网格DFS+回溯：四个方向搜索，标记已访问。 通过这道题深入理解回溯类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "DFS所有路径。 这是回溯的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "网格单词搜索。四个方向搜索。",
      "level2": "DFS+回溯：标记已访问，回溯恢复。",
      "level3": "DFS所有路径。",
      "level4": "从每个格子出发DFS，匹配则继续，不匹配则回溯。",
      "level5": "def dfs(i,j,k): if k==len(word) return True; if 越界或不匹配 return False; tmp=board[i][j]; board[i][j]=\"#\"; for dx,dy: if dfs(i+dx,j+dy,k+1) return True; board[i][j]=tmp; return False",
      "level6": "# 核心思路：从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 board=[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word=\"ABCCED\" 检查代码。\nclass Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        if len(word) > m * n:\n            return False\n\n        def dfs(i: int, j: int, k: int) -> bool:\n            # k 表示正在匹配 word[k]\n            if k == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:\n                return False\n\n            saved = board[i][j]\n            board[i][j] = '#'  # 标记已访问，防止同一路径重复使用\n            found = (\n                dfs(i + 1, j, k + 1) or\n                dfs(i - 1, j, k + 1) or\n                dfs(i, j + 1, k + 1) or\n                dfs(i, j - 1, k + 1)\n            )\n            board[i][j] = saved  # 回溯恢复现场\n            return found\n\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0):\n                    return True\n        return False"
    },
    "bruteForceIdea": "DFS四个方向搜索，回溯恢复状态。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。 每个起点 DFS，除第一步外最多 3 个方向可走；L 为单词长度，递归深度 L。",
    "pseudocode": "1. 画出搜索树：每层做什么选择。\n2. 写终止条件，并在终止时拷贝 path。\n3. for 循环横向枚举，递归纵向深入。\n4. 递归回来必须撤销选择，必要时排序剪枝。",
    "solutionCode": "# 核心思路：从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 board=[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word=\"ABCCED\" 检查代码。\nclass Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        if len(word) > m * n:\n            return False\n\n        def dfs(i: int, j: int, k: int) -> bool:\n            # k 表示正在匹配 word[k]\n            if k == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:\n                return False\n\n            saved = board[i][j]\n            board[i][j] = '#'  # 标记已访问，防止同一路径重复使用\n            found = (\n                dfs(i + 1, j, k + 1) or\n                dfs(i - 1, j, k + 1) or\n                dfs(i, j + 1, k + 1) or\n                dfs(i, j - 1, k + 1)\n            )\n            board[i][j] = saved  # 回溯恢复现场\n            return found\n\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0):\n                    return True\n        return False",
    "complexity": {
      "time": "O(mn·3^L)",
      "space": "O(L)"
    },
    "commonMistakes": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「单词搜索」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 34,
    "leetcodeId": 81,
    "title": "搜索旋转排序数组 II",
    "titleEn": "Search in Rotated Sorted Array II",
    "slug": "search-in-rotated-sorted-array-ii",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 34,
    "externalUrl": "https://leetcode.cn/problems/search-in-rotated-sorted-array-ii/",
    "summary": "已知存在一个按非降序排列的整数数组nums，数组中的值不必互不相同。传递给函数之前，nums在预先未知的某个下标上进行了旋转。判断给定目标值target是否存在于数组中。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "在旋转数组搜索基础上处理重复元素。 通过这道题深入理解二分查找类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "遍历O(n)。二分最坏O(n)。 这是二分查找的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "旋转数组搜索（有重复）。",
      "level2": "额外处理三者相等的情况。",
      "level3": "遍历。",
      "level4": "二分+当三者相等时right--。",
      "level5": "while l<=r: mid=(l+r)//2; if nums[mid]==target return True; if nums[l]==nums[mid]==nums[right]: l++,r--; elif nums[l]<=nums[mid]: 左半有序判断; else: 右半有序判断",
      "level6": "# 核心思路：有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,5,6,0,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> bool:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return True\n\n            # 重复值挡住判断，只能安全收缩\n            if nums[left] == nums[mid] == nums[right]:\n                left += 1\n                right -= 1\n            elif nums[left] <= nums[mid]:  # 左半边有序\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:                          # 右半边有序\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return False"
    },
    "bruteForceIdea": "遍历。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。 重复值极端情况下每次只能缩小一格，例如全是 1。",
    "pseudocode": "1. 明确二分区间是闭区间还是左闭右开。\n2. 写出 mid 后判断哪一半一定无答案。\n3. 更新 left/right 时保证区间收缩。\n4. 用单元素、无答案、重复/旋转边界检查。",
    "solutionCode": "# 核心思路：有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,5,6,0,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> bool:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return True\n\n            # 重复值挡住判断，只能安全收缩\n            if nums[left] == nums[mid] == nums[right]:\n                left += 1\n                right -= 1\n            elif nums[left] <= nums[mid]:  # 左半边有序\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:                          # 右半边有序\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return False",
    "complexity": {
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「搜索旋转排序数组 II」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 35,
    "leetcodeId": 84,
    "title": "柱状图中最大的矩形",
    "titleEn": "Largest Rectangle in Histogram",
    "slug": "largest-rectangle-in-histogram",
    "difficulty": "困难",
    "category": "栈",
    "tags": [
      "栈",
      "单调栈"
    ],
    "order": 35,
    "externalUrl": "https://leetcode.cn/problems/largest-rectangle-in-histogram/",
    "summary": "给定n个非负整数，用来表示柱状图中各个柱子的高度。求柱状图中能够勾勒出的最大矩形面积。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握单调递增栈：弹栈时计算面积。 通过这道题深入理解栈类型题目的解题套路，掌握从暴力到优化的思维过程。",
    "whyThisPattern": "对每个柱子向左右扩展找边界O(n^2)。单调栈O(n)。 这是栈的经典应用场景。理解为什么这个方法有效，比记住代码更重要。",
    "hints": {
      "level1": "柱状图最大矩形面积。",
      "level2": "单调递增栈：弹栈时计算面积。",
      "level3": "对每个柱子找左右边界O(n^2)。",
      "level4": "单调栈一次遍历O(n)。",
      "level5": "stack=[-1]; maxArea=0; for i,h: while stack[-1]!=-1 and heights[stack[-1]]>h: height=heights[stack.pop()]; width=i-stack[-1]-1; maxArea=max(maxArea,height*width); stack.append(i)",
      "level6": "# 核心思路：单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 heights=[2,1,5,6,2,3] 检查代码。\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # 两端加 0 哨兵，方便所有柱子最终都出栈\n        heights = [0] + heights + [0]\n        stack = []  # 栈中下标对应的高度单调递增\n        ans = 0\n\n        for i, h in enumerate(heights):\n            while stack and h < heights[stack[-1]]:\n                mid = stack.pop()\n                height = heights[mid]\n                width = i - stack[-1] - 1  # 左右第一个更矮柱子之间的宽度\n                ans = max(ans, height * width)\n            stack.append(i)\n\n        return ans"
    },
    "bruteForceIdea": "对每个柱子找左右第一个更矮的。 虽然时间复杂度高，但它是理解问题本质的起点。先想清楚暴力怎么做，才能找到优化方向。",
    "optimizedIdea": "单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。 每个柱子最多入栈、出栈一次；哨兵 0 负责清空栈。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 heights=[2,1,5,6,2,3] 检查代码。\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # 两端加 0 哨兵，方便所有柱子最终都出栈\n        heights = [0] + heights + [0]\n        stack = []  # 栈中下标对应的高度单调递增\n        ans = 0\n\n        for i, h in enumerate(heights):\n            while stack and h < heights[stack[-1]]:\n                mid = stack.pop()\n                height = heights[mid]\n                width = i - stack[-1] - 1  # 左右第一个更矮柱子之间的宽度\n                ans = max(ans, height * width)\n            stack.append(i)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「柱状图中最大的矩形」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 36,
    "leetcodeId": 85,
    "title": "最大矩形",
    "titleEn": "Maximal Rectangle",
    "slug": "maximal-rectangle",
    "difficulty": "困难",
    "category": "栈",
    "tags": [
      "栈",
      "矩阵"
    ],
    "order": 36,
    "externalUrl": "https://leetcode.cn/problems/maximal-rectangle/",
    "summary": "给定一个rows×cols的二进制矩阵matrix，只包含0和1。找到只包含1的最大矩形，并返回其面积。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握将二维问题转化为一维问题的思想：每行看作柱状图的底，转化为\"柱状图中最大的矩形\"问题。",
    "whyThisPattern": "逐行计算每列的高度（连续1的个数），然后对每行用第84题的单调栈方法求最大矩形。这样就把二维问题转化成了一维问题。",
    "hints": {
      "level1": "在0-1矩阵中找最大的全1正方形的面积（注意是矩形不是正方形）。",
      "level2": "逐行看作柱状图的底，转化为柱状图最大矩形问题。",
      "level3": "暴力枚举所有矩形。",
      "level4": "逐行更新heights，对每行用单调栈。",
      "level5": "for each row: 更新heights; 用单调栈求最大矩形; 更新全局最大",
      "level6": "# 核心思路：把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 \"0\" 检查代码。\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        if not matrix or not matrix[0]:\n            return 0\n\n        m, n = len(matrix), len(matrix[0])\n        heights = [0] * n\n        ans = 0\n\n        def largest_rectangle() -> int:\n            arr = [0] + heights + [0]\n            stack = []\n            best = 0\n            for i, h in enumerate(arr):\n                while stack and h < arr[stack[-1]]:\n                    mid = stack.pop()\n                    best = max(best, arr[mid] * (i - stack[-1] - 1))\n                stack.append(i)\n            return best\n\n        for i in range(m):\n            for j in range(n):\n                # 如果当前位置是 1，高度加一；遇到 0，高度断开归零\n                heights[j] = heights[j] + 1 if matrix[i][j] == '1' else 0\n            ans = max(ans, largest_rectangle())\n\n        return ans"
    },
    "bruteForceIdea": "暴力枚举所有可能的矩形（左上角和右下角），检查是否全1。时间O(m^2*n^2)。",
    "optimizedIdea": "逐行更新heights数组：如果matrix[i][j]==1则heights[j]++，否则heights[j]=0。对每行用单调栈求最大矩形。时间O(mn)。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 \"0\" 检查代码。\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        if not matrix or not matrix[0]:\n            return 0\n\n        m, n = len(matrix), len(matrix[0])\n        heights = [0] * n\n        ans = 0\n\n        def largest_rectangle() -> int:\n            arr = [0] + heights + [0]\n            stack = []\n            best = 0\n            for i, h in enumerate(arr):\n                while stack and h < arr[stack[-1]]:\n                    mid = stack.pop()\n                    best = max(best, arr[mid] * (i - stack[-1] - 1))\n                stack.append(i)\n            return best\n\n        for i in range(m):\n            for j in range(n):\n                # 如果当前位置是 1，高度加一；遇到 0，高度断开归零\n                heights[j] = heights[j] + 1 if matrix[i][j] == '1' else 0\n            ans = max(ans, largest_rectangle())\n\n        return ans",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最大矩形」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 37,
    "leetcodeId": 94,
    "title": "二叉树的中序遍历",
    "titleEn": "Binary Tree Inorder Traversal",
    "slug": "binary-tree-inorder-traversal",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "栈"
    ],
    "order": 37,
    "externalUrl": "https://leetcode.cn/problems/binary-tree-inorder-traversal/",
    "summary": "给定一棵二叉树的根节点root，返回它的中序遍历结果。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二叉树中序遍历的递归和迭代两种写法。迭代写法需要理解栈如何模拟递归过程。",
    "whyThisPattern": "中序遍历顺序：左→根→右。递归写法很直观。迭代写法用栈模拟：一直往左走并入栈，到头后弹栈访问，然后转向右子树。",
    "hints": {
      "level1": "中序遍历：左→根→右。",
      "level2": "递归：helper(left), add(root), helper(right)。迭代：栈模拟。",
      "level3": "递归直接写。",
      "level4": "迭代：一直往左入栈，弹栈访问，转向右。",
      "level5": "stack=[],curr=root; while curr or stack: while curr: stack.append(curr); curr=curr.left; curr=stack.pop(); res.append(curr.val); curr=curr.right",
      "level6": "# 核心思路：中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        stack = []\n        cur = root\n\n        while cur or stack:\n            # 先一路走到最左边\n            while cur:\n                stack.append(cur)\n                cur = cur.left\n\n            cur = stack.pop()\n            ans.append(cur.val)  # 左子树访问完后访问根\n            cur = cur.right      # 再处理右子树\n\n        return ans"
    },
    "bruteForceIdea": "递归：helper(left), result.append(root.val), helper(right)。",
    "optimizedIdea": "迭代：用栈模拟递归。curr指针一直往左走并入栈，到null后弹栈访问，然后curr=curr.right。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        stack = []\n        cur = root\n\n        while cur or stack:\n            # 先一路走到最左边\n            while cur:\n                stack.append(cur)\n                cur = cur.left\n\n            cur = stack.pop()\n            ans.append(cur.val)  # 左子树访问完后访问根\n            cur = cur.right      # 再处理右子树\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的中序遍历」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 38,
    "leetcodeId": 96,
    "title": "不同的二叉搜索树",
    "titleEn": "Unique Binary Search Trees",
    "slug": "unique-binary-search-trees",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "动态规划"
    ],
    "order": 38,
    "externalUrl": "https://leetcode.cn/problems/unique-binary-search-trees/",
    "summary": "给你一个整数n，求恰由n个节点组成且节点值从1到n互不相同的二叉搜索树有多少种。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "理解卡特兰数和动态规划的关系。这道题需要理解BST的性质：左子树所有节点<根<右子树所有节点。",
    "whyThisPattern": "以i为根的BST数量=左子树(1..i-1)的BST数量×右子树(i+1..n)的BST数量。这就是卡特兰数的递推公式。",
    "hints": {
      "level1": "n个节点能组成多少种不同的BST。",
      "level2": "以i为根：左子树有i-1个节点，右子树有n-i个节点。dp[n]=sum(dp[j]*dp[n-1-j])。",
      "level3": "递归枚举。",
      "level4": "DP递推：卡特兰数。",
      "level5": "dp=[0]*(n+1); dp[0]=dp[1]=1; for i in 2..n+1: for j in 0..i: dp[i]+=dp[j]*dp[i-1-j]; return dp[n]",
      "level6": "# 核心思路：以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def numTrees(self, n: int) -> int:\n        # dp[i] = i 个不同节点能组成多少种 BST\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        dp[1] = 1\n\n        for nodes in range(2, n + 1):\n            for left_count in range(nodes):\n                right_count = nodes - 1 - left_count\n                dp[nodes] += dp[left_count] * dp[right_count]\n\n        return dp[n]"
    },
    "bruteForceIdea": "递归：以每个节点为根，递归计算左右子树的BST数量。",
    "optimizedIdea": "DP：dp[n]=sum(dp[i-1]*dp[n-i]) for i in 1..n。dp[0]=1, dp[1]=1。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def numTrees(self, n: int) -> int:\n        # dp[i] = i 个不同节点能组成多少种 BST\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        dp[1] = 1\n\n        for nodes in range(2, n + 1):\n            for left_count in range(nodes):\n                right_count = nodes - 1 - left_count\n                dp[nodes] += dp[left_count] * dp[right_count]\n\n        return dp[n]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「不同的二叉搜索树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 39,
    "leetcodeId": 98,
    "title": "验证二叉搜索树",
    "titleEn": "Validate Binary Search Tree",
    "slug": "validate-binary-search-tree",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "BST"
    ],
    "order": 39,
    "externalUrl": "https://leetcode.cn/problems/validate-binary-search-tree/",
    "summary": "给你一个二叉树的根节点root，判断其是否是一个有效的二叉搜索树。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握中序遍历验证BST的方法：中序遍历结果必须严格递增。也可以用递归传递上下界。",
    "whyThisPattern": "BST的性质：中序遍历结果严格递增。所以中序遍历时记录前一个值，当前值必须大于前一个值。",
    "hints": {
      "level1": "验证BST。BST中序遍历严格递增。",
      "level2": "中序遍历+检查prev<curr。或递归传范围。",
      "level3": "递归传范围。",
      "level4": "中序遍历记录前一个值，当前值必须>前一个值。",
      "level5": "def inorder(node): if not node: return True; if not inorder(node.left): return False; if node.val<=self.prev: return False; self.prev=node.val; return inorder(node.right)",
      "level6": "# 核心思路：BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[2,1,3] 检查代码。\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:\n            if not node:\n                return True\n            if not (low < node.val < high):\n                return False\n            # 左子树上界变成 node.val；右子树下界变成 node.val\n            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n\n        return dfs(root, float('-inf'), float('inf'))"
    },
    "bruteForceIdea": "递归传递min和max范围：左子树所有节点必须<root.val，右子树所有节点必须>root.val。",
    "optimizedIdea": "中序遍历：记录prev值，当前值必须>prev。时间O(n)。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[2,1,3] 检查代码。\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:\n            if not node:\n                return True\n            if not (low < node.val < high):\n                return False\n            # 左子树上界变成 node.val；右子树下界变成 node.val\n            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n\n        return dfs(root, float('-inf'), float('inf'))",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「验证二叉搜索树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 40,
    "leetcodeId": 101,
    "title": "对称二叉树",
    "titleEn": "Symmetric Tree",
    "slug": "symmetric-tree",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 40,
    "externalUrl": "https://leetcode.cn/problems/symmetric-tree/",
    "summary": "给定一棵二叉树，检查它是否是镜像对称的。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握递归比较左右子树的方法。这道题是二叉树递归的经典应用。",
    "whyThisPattern": "对称=左子树的左节点==右子树的右节点 && 左子树的右节点==右子树的左节点。递归比较。",
    "hints": {
      "level1": "二叉树是否镜像对称。",
      "level2": "递归比较：左子树的左和右子树的右比较，左子树的右和右子树的左比较。",
      "level3": "层序遍历检查回文。",
      "level4": "递归：isMirror(left,right)。",
      "level5": "def isMirror(l,r): if not l and not r: return True; if not l or not r: return False; return l.val==r.val and isMirror(l.left,r.right) and isMirror(l.right,r.left)",
      "level6": "# 核心思路：判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,2,3,4,4,3] 检查代码。\nclass Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:\n            if not a and not b:\n                return True\n            if not a or not b:\n                return False\n            if a.val != b.val:\n                return False\n            return mirror(a.left, b.right) and mirror(a.right, b.left)\n\n        return True if not root else mirror(root.left, root.right)"
    },
    "bruteForceIdea": "暴力思路：层序遍历检查每一层是否回文。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "递归：isMirror(left, right) = left.val==right.val && isMirror(left.left, right.right) && isMirror(left.right, right.left)。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,2,3,4,4,3] 检查代码。\nclass Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:\n            if not a and not b:\n                return True\n            if not a or not b:\n                return False\n            if a.val != b.val:\n                return False\n            return mirror(a.left, b.right) and mirror(a.right, b.left)\n\n        return True if not root else mirror(root.left, root.right)",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「对称二叉树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 41,
    "leetcodeId": 102,
    "title": "二叉树的层序遍历",
    "titleEn": "Binary Tree Level Order Traversal",
    "slug": "binary-tree-level-order-traversal",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "BFS"
    ],
    "order": 41,
    "externalUrl": "https://leetcode.cn/problems/binary-tree-level-order-traversal/",
    "summary": "给你二叉树的根节点root，返回其节点值的层序遍历（即逐层地，从左到右访问所有节点）。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握BFS层序遍历：用队列，每次处理当前层的所有节点。",
    "whyThisPattern": "BFS天然按层遍历。关键是记录每层的大小size，每次处理size个节点。",
    "hints": {
      "level1": "层序遍历。BFS。",
      "level2": "队列+每层处理size个节点。",
      "level3": "DFS按层记录。",
      "level4": "BFS：while queue: size=len(queue); 处理size个节点。",
      "level5": "queue=[root]; res=[]; while queue: size=len(queue); level=[]; for _ in range(size): node=queue.pop(0); level.append(node.val); 添加子节点; res.append(level)",
      "level6": "# 核心思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        if not root:\n            return []\n\n        ans = []\n        queue = deque([root])\n\n        while queue:\n            level = []\n            for _ in range(len(queue)):  # 当前队列长度就是当前层节点数\n                node = queue.popleft()\n                level.append(node.val)\n                if node.left:\n                    queue.append(node.left)\n                if node.right:\n                    queue.append(node.right)\n            ans.append(level)\n\n        return ans"
    },
    "bruteForceIdea": "暴力思路：递归DFS按层记录（需要传深度参数）。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "优化思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        if not root:\n            return []\n\n        ans = []\n        queue = deque([root])\n\n        while queue:\n            level = []\n            for _ in range(len(queue)):  # 当前队列长度就是当前层节点数\n                node = queue.popleft()\n                level.append(node.val)\n                if node.left:\n                    queue.append(node.left)\n                if node.right:\n                    queue.append(node.right)\n            ans.append(level)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(w)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的层序遍历」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 42,
    "leetcodeId": 104,
    "title": "二叉树的最大深度",
    "titleEn": "Maximum Depth of Binary Tree",
    "slug": "maximum-depth-of-binary-tree",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "DFS"
    ],
    "order": 42,
    "externalUrl": "https://leetcode.cn/problems/maximum-depth-of-binary-tree/",
    "summary": "给定一棵二叉树，找出其最大深度。最大深度是从根节点到最远叶子节点的最长路径上的节点数。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握递归求树的深度：max(depth(left), depth(right))+1。这道题是二叉树递归的基础。",
    "whyThisPattern": "树的深度=左子树深度和右子树深度的较大值+1。递归终止条件：空节点深度为0。",
    "hints": {
      "level1": "二叉树最大深度。",
      "level2": "递归：max(左深度,右深度)+1。",
      "level3": "BFS计数。",
      "level4": "递归一行搞定。",
      "level5": "def depth(root): return 0 if not root else max(depth(root.left),depth(root.right))+1",
      "level6": "# 核心思路：树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root:\n            return 0\n        left_depth = self.maxDepth(root.left)\n        right_depth = self.maxDepth(root.right)\n        return max(left_depth, right_depth) + 1"
    },
    "bruteForceIdea": "暴力思路：BFS层序遍历计数。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "递归：if not root: return 0; return max(depth(left), depth(right))+1。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root:\n            return 0\n        left_depth = self.maxDepth(root.left)\n        right_depth = self.maxDepth(root.right)\n        return max(left_depth, right_depth) + 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的最大深度」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 43,
    "leetcodeId": 105,
    "title": "从前序与中序遍历序列构造二叉树",
    "titleEn": "Construct Binary Tree from Preorder and Inorder Traversal",
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 43,
    "externalUrl": "https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "summary": "给定两个整数数组preorder和inorder，其中preorder是二叉树的前序遍历，inorder是同一棵树的中序遍历，请构造二叉树并返回其根节点。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握递归分治构造二叉树：前序第一个是根，在中序中找到根的位置分割左右子树。",
    "whyThisPattern": "前序遍历的第一个元素是根节点。在中序遍历中，根节点左边是左子树，右边是右子树。递归处理。",
    "hints": {
      "level1": "前序+中序构造二叉树。",
      "level2": "前序[0]是根。中序中根左边是左子树，右边是右子树。",
      "level3": "递归分治。",
      "level4": "哈希表加速中序查找。",
      "level5": "def build(pre,ino): if not pre: return None; root=TreeNode(pre[0]); mid=ino_map[pre[0]]; root.left=build(pre[1:mid+1],ino[:mid]); root.right=build(pre[mid+1:],ino[mid+1:]); return root",
      "level6": "# 核心思路：前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 preorder=[3,9,20,15,7], inorder=[9,3,15,20,7] 检查代码。\nclass Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        index = {val: i for i, val in enumerate(inorder)}\n        pre_pos = 0\n\n        def build(in_left: int, in_right: int) -> Optional[TreeNode]:\n            nonlocal pre_pos\n            if in_left > in_right:\n                return None\n\n            root_val = preorder[pre_pos]\n            pre_pos += 1\n            root = TreeNode(root_val)\n            mid = index[root_val]\n\n            # 前序顺序是 根-左-右，所以必须先构造左子树\n            root.left = build(in_left, mid - 1)\n            root.right = build(mid + 1, in_right)\n            return root\n\n        return build(0, len(inorder) - 1)"
    },
    "bruteForceIdea": "递归：前序第一个是根，在中序中找根的位置，分割左右子树。",
    "optimizedIdea": "用哈希表存中序值到下标的映射，加速查找。时间O(n)。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 preorder=[3,9,20,15,7], inorder=[9,3,15,20,7] 检查代码。\nclass Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        index = {val: i for i, val in enumerate(inorder)}\n        pre_pos = 0\n\n        def build(in_left: int, in_right: int) -> Optional[TreeNode]:\n            nonlocal pre_pos\n            if in_left > in_right:\n                return None\n\n            root_val = preorder[pre_pos]\n            pre_pos += 1\n            root = TreeNode(root_val)\n            mid = index[root_val]\n\n            # 前序顺序是 根-左-右，所以必须先构造左子树\n            root.left = build(in_left, mid - 1)\n            root.right = build(mid + 1, in_right)\n            return root\n\n        return build(0, len(inorder) - 1)",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「从前序与中序遍历序列构造二叉树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 44,
    "leetcodeId": 114,
    "title": "二叉树展开为链表",
    "titleEn": "Flatten Binary Tree to Linked List",
    "slug": "flatten-binary-tree-to-linked-list",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 44,
    "externalUrl": "https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/",
    "summary": "给你二叉树的根结点root，请你将它展开为一个单链表。展开后的单链表应该与二叉树的前序遍历顺序相同。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二叉树原地修改指针的技巧。这道题需要理解如何在不使用额外空间的情况下展开二叉树。",
    "whyThisPattern": "前序遍历：根→左→右。展开后每个节点的right指向下一个节点，left为null。关键：把左子树的最右节点接到当前节点的right前面。",
    "hints": {
      "level1": "展开二叉树为单链表（前序遍历顺序）。",
      "level2": "后序遍历（右→左→根）：当前节点.right=prev。",
      "level3": "前序遍历存节点再连接。",
      "level4": "后序遍历变体：从右到左。",
      "level5": "prev=None; def flatten(root): if not root: return; flatten(root.right); flatten(root.left); root.right=prev; root.left=None; prev=root",
      "level6": "# 核心思路：按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,5,3,4,null,6] 检查代码。\nclass Solution:\n    def flatten(self, root: Optional[TreeNode]) -> None:\n        prev = None\n\n        def dfs(node: Optional[TreeNode]) -> None:\n            nonlocal prev\n            if not node:\n                return\n            # 反向前序：先右后左，最后处理根\n            dfs(node.right)\n            dfs(node.left)\n\n            node.right = prev\n            node.left = None\n            prev = node\n\n        dfs(root)"
    },
    "bruteForceIdea": "前序遍历存所有节点，然后重新连接。O(n)空间。",
    "optimizedIdea": "后序遍历的变体：从右到左遍历，用prev记录上一个节点。当前节点的right=prev, left=null, prev=当前节点。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,5,3,4,null,6] 检查代码。\nclass Solution:\n    def flatten(self, root: Optional[TreeNode]) -> None:\n        prev = None\n\n        def dfs(node: Optional[TreeNode]) -> None:\n            nonlocal prev\n            if not node:\n                return\n            # 反向前序：先右后左，最后处理根\n            dfs(node.right)\n            dfs(node.left)\n\n            node.right = prev\n            node.left = None\n            prev = node\n\n        dfs(root)",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树展开为链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 45,
    "leetcodeId": 121,
    "title": "买卖股票的最佳时机",
    "titleEn": "Best Time to Buy and Sell Stock",
    "slug": "best-time-to-buy-and-sell-stock",
    "difficulty": "简单",
    "category": "贪心",
    "tags": [
      "贪心",
      "数组"
    ],
    "order": 45,
    "externalUrl": "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/",
    "summary": "给定一个数组prices，它的第i个元素prices[i]是一支给定股票第i天的价格。你只能选择某一天买入这只股票，并选择在未来的某一个日子卖出。设计一个算法来计算你所能获取的最大利润。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握贪心维护历史最低价格的思路。这道题是股票问题的基础。",
    "whyThisPattern": "最大利润=max(prices[i]-min_price)。只需要一次遍历，维护历史最低价格。",
    "hints": {
      "level1": "买卖股票，只能买卖一次，求最大利润。",
      "level2": "最大利润=最高价-最低价（买入在卖出之前）。维护历史最低。",
      "level3": "两层循环枚举。",
      "level4": "贪心：min_price和max_profit。",
      "level5": "min_price=inf; max_profit=0; for p in prices: min_price=min(min_price,p); max_profit=max(max_profit,p-min_price)",
      "level6": "# 核心思路：遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[7,1,5,3,6,4] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        ans = 0\n\n        for price in prices:\n            min_price = min(min_price, price)      # 到今天为止最低买入价\n            ans = max(ans, price - min_price)      # 今天卖出能赚多少\n\n        return ans"
    },
    "bruteForceIdea": "暴力思路：两层循环枚举所有买卖组合。O(n^2)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "贪心：维护min_price和max_profit。一次遍历。",
    "pseudocode": "1. 先说明局部最优选择是什么。\n2. 证明这个选择不会损失全局最优。\n3. 遍历中维护覆盖范围、最优候选或排序结构。\n4. 用反例尝试推翻贪心，确认边界。",
    "solutionCode": "# 核心思路：遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[7,1,5,3,6,4] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        ans = 0\n\n        for price in prices:\n            min_price = min(min_price, price)      # 到今天为止最低买入价\n            ans = max(ans, price - min_price)      # 今天卖出能赚多少\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「买卖股票的最佳时机」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 46,
    "leetcodeId": 124,
    "title": "二叉树中的最大路径和",
    "titleEn": "Binary Tree Maximum Path Sum",
    "slug": "binary-tree-maximum-path-sum",
    "difficulty": "困难",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "DFS"
    ],
    "order": 46,
    "externalUrl": "https://leetcode.cn/problems/binary-tree-maximum-path-sum/",
    "summary": "给定一个非空二叉树，返回其最大路径和。路径被定义为一条从任意节点出发，沿父节点-子节点连接，达到任意节点的序列。同一个节点在一条路径序列中至多出现一次。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握后序遍历+全局最大值更新的技巧。这道题需要理解\"路径和\"与\"最大贡献值\"的区别。",
    "whyThisPattern": "后序遍历：对每个节点，计算以它为拐点的最大路径和=左贡献+右贡献+节点值。同时返回以它为端点的最大贡献值=node.val+max(左贡献,右贡献)（只能选一侧，因为路径不能分叉）。",
    "hints": {
      "level1": "二叉树最大路径和。路径可以不经过根。",
      "level2": "每个节点：以它为拐点的最大路径和=左贡献+右贡献+节点值。返回给父节点的是只能选一侧。",
      "level3": "DFS所有路径。",
      "level4": "后序遍历：返回max贡献，更新全局最大路径和。",
      "level5": "def helper(node): if not node: return 0; l=max(0,helper(left)); r=max(0,helper(right)); self.ans=max(self.ans,l+r+node.val); return node.val+max(l,r)",
      "level6": "# 核心思路：对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3] 检查代码。\nclass Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        ans = float('-inf')\n\n        def gain(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n\n            # 负贡献不如不要，所以与 0 取 max\n            left = max(gain(node.left), 0)\n            right = max(gain(node.right), 0)\n\n            # 以当前节点为最高点的路径，可以同时接左右两边\n            ans = max(ans, node.val + left + right)\n\n            # 返回给父节点时只能选一边，不能分叉\n            return node.val + max(left, right)\n\n        gain(root)\n        return ans"
    },
    "bruteForceIdea": "暴力思路：DFS所有可能的路径。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "后序遍历：返回值=以当前节点为端点的最大贡献（只能选一侧）。全局最大值=左贡献+右贡献+节点值（可以拐弯）。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3] 检查代码。\nclass Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        ans = float('-inf')\n\n        def gain(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n\n            # 负贡献不如不要，所以与 0 取 max\n            left = max(gain(node.left), 0)\n            right = max(gain(node.right), 0)\n\n            # 以当前节点为最高点的路径，可以同时接左右两边\n            ans = max(ans, node.val + left + right)\n\n            # 返回给父节点时只能选一边，不能分叉\n            return node.val + max(left, right)\n\n        gain(root)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树中的最大路径和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 47,
    "leetcodeId": 128,
    "title": "最长连续序列",
    "titleEn": "Longest Consecutive Sequence",
    "slug": "longest-consecutive-sequence",
    "difficulty": "中等",
    "category": "哈希",
    "tags": [
      "哈希表"
    ],
    "order": 47,
    "externalUrl": "https://leetcode.cn/problems/longest-consecutive-sequence/",
    "summary": "给定一个未排序的整数数组nums，请找出数字连续的最长序列的长度。请你设计并实现时间复杂度为O(n)的算法。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握哈希集合+只从起点计数的O(n)方法。这道题的关键是理解为什么只从起点开始计数就能保证O(n)。",
    "whyThisPattern": "用哈希集合存所有数。对每个数num，如果num-1不在集合中，说明num是某个序列的起点，从这里开始计数连续长度。每个数最多被访问2次（一次判断起点，一次计数），所以O(n)。",
    "hints": {
      "level1": "最长连续序列。不要求在原数组中连续。",
      "level2": "只从起点（num-1不存在）开始计数，避免重复计算。",
      "level3": "排序后扫描。",
      "level4": "哈希集合+起点判断。",
      "level5": "num_set=set(nums); longest=0; for num in num_set: if num-1 not in num_set: curr=num; length=1; while curr+1 in num_set: curr+=1; length+=1; longest=max(longest,length)",
      "level6": "# 核心思路：把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[100,4,200,1,3,2] 检查代码。\nclass Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        num_set = set(nums)\n        ans = 0\n\n        for x in num_set:\n            # 只有 x 是序列起点时才开始数，避免从中间重复数\n            if x - 1 not in num_set:\n                cur = x\n                length = 1\n                while cur + 1 in num_set:\n                    cur += 1\n                    length += 1\n                ans = max(ans, length)\n\n        return ans"
    },
    "bruteForceIdea": "暴力思路：排序后扫描找最长连续序列。O(nlogn)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "哈希集合+只从起点计数：for num in set: if num-1 not in set: 从num开始计数连续长度。",
    "pseudocode": "1. 先说暴力解的重复查找在哪里。\n2. 定义哈希表 key/value 分别保存什么。\n3. 遍历时先查询再更新哈希表，避免自匹配或漏算。\n4. 用重复值、负数、空/极小输入检查边界。",
    "solutionCode": "# 核心思路：把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[100,4,200,1,3,2] 检查代码。\nclass Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        num_set = set(nums)\n        ans = 0\n\n        for x in num_set:\n            # 只有 x 是序列起点时才开始数，避免从中间重复数\n            if x - 1 not in num_set:\n                cur = x\n                length = 1\n                while cur + 1 in num_set:\n                    cur += 1\n                    length += 1\n                ans = max(ans, length)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最长连续序列」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 48,
    "leetcodeId": 136,
    "title": "只出现一次的数字",
    "titleEn": "Single Number",
    "slug": "single-number",
    "difficulty": "简单",
    "category": "技巧",
    "tags": [
      "位运算"
    ],
    "order": 48,
    "externalUrl": "https://leetcode.cn/problems/single-number/",
    "summary": "给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现一次的元素。你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握异或运算的性质：a^a=0, a^0=a, 异或满足交换律和结合律。这道题是位运算的经典应用。",
    "whyThisPattern": "所有数异或：成对的数异或后为0（a^a=0），剩下的就是只出现一次的数（a^0=a）。异或满足交换律，所以顺序不影响结果。",
    "hints": {
      "level1": "找出唯一出现一次的数字，其他都出现两次。",
      "level2": "异或性质：a^a=0, a^0=a。所有数异或，成对抵消。",
      "level3": "哈希表计数。",
      "level4": "异或一行搞定。",
      "level5": "result=0; for num in nums: result^=num; return result",
      "level6": "# 核心思路：异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,1] 检查代码。\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ans = 0\n        for x in nums:\n            ans ^= x  # 成对的数会被异或抵消\n        return ans"
    },
    "bruteForceIdea": "暴力思路：哈希表统计每个数出现的次数。O(n)空间。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "所有数异或：result^=num for all nums。时间O(n)，空间O(1)。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,1] 检查代码。\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ans = 0\n        for x in nums:\n            ans ^= x  # 成对的数会被异或抵消\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「只出现一次的数字」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 49,
    "leetcodeId": 139,
    "title": "单词拆分",
    "titleEn": "Word Break",
    "slug": "word-break",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 49,
    "externalUrl": "https://leetcode.cn/problems/word-break/",
    "summary": "给你一个字符串s和一个字符串列表wordDict作为字典。如果s可以利用字典中出现的一个或多个单词表示，返回true。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握字符串拆分的DP解法：dp[i]表示前i个字符能否被拆分。这道题是DP在字符串问题中的经典应用。",
    "whyThisPattern": "dp[i]=true当且仅当存在j<i使得dp[j]=true且s[j:i]在字典中。这把问题分解为子问题。",
    "hints": {
      "level1": "单词拆分。判断字符串能否被拆分为字典中的单词。",
      "level2": "dp[i]=前i个字符能否拆分。dp[i]=dp[j] and s[j:i] in dict。",
      "level3": "递归尝试所有拆分。",
      "level4": "DP：dp[0]=true; for i: for j<i: if dp[j] and s[j:i] in dict: dp[i]=true",
      "level5": "dp=[False]*(n+1); dp[0]=True; for i in 1..n+1: for j in 0..i: if dp[j] and s[j:i] in set(wordDict): dp[i]=True; break; return dp[n]",
      "level6": "# 核心思路：dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"leetcode\", wordDict=[\"leet\",\"code\"] 检查代码。\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True  # 空串可以被拆分\n\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n\n        return dp[n]"
    },
    "bruteForceIdea": "递归：从位置0开始，尝试所有可能的前缀，如果在字典中就递归处理剩余部分。指数时间。",
    "optimizedIdea": "DP：dp[0]=true; for i in 1..n: for j in 0..i-1: if dp[j] and s[j:i] in wordDict: dp[i]=true; break。时间O(n^2*m)。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"leetcode\", wordDict=[\"leet\",\"code\"] 检查代码。\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True  # 空串可以被拆分\n\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n\n        return dp[n]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「单词拆分」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 50,
    "leetcodeId": 141,
    "title": "环形链表",
    "titleEn": "Linked List Cycle",
    "slug": "linked-list-cycle",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 50,
    "externalUrl": "https://leetcode.cn/problems/linked-list-cycle/",
    "summary": "给你一个链表，判断链表中是否有环。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握Floyd判圈算法：快慢指针，快指针走两步慢指针走一步，有环必相遇。",
    "whyThisPattern": "快慢指针：fast每次走2步，slow每次走1步。如果有环，fast终会追上slow（因为每轮fast比slow多走1步，差距缩小1）。",
    "hints": {
      "level1": "判断链表是否有环。",
      "level2": "快慢指针：fast走2步slow走1步，有环必相遇。",
      "level3": "哈希表记录已访问节点。",
      "level4": "Floyd判圈O(1)空间。",
      "level5": "slow=fast=head; while fast and fast.next: slow=slow.next; fast=fast.next.next; if slow==fast: return True; return False",
      "level6": "# 核心思路：快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                return True\n\n        return False"
    },
    "bruteForceIdea": "用哈希表记录访问过的节点，遍历时如果遇到已访问节点说明有环。O(n)空间。",
    "optimizedIdea": "Floyd判圈：fast走两步slow走一步，相遇则有环。O(1)空间。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                return True\n\n        return False",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「环形链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 51,
    "leetcodeId": 142,
    "title": "环形链表 II",
    "titleEn": "Linked List Cycle II",
    "slug": "linked-list-cycle-ii",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 51,
    "externalUrl": "https://leetcode.cn/problems/linked-list-cycle-ii/",
    "summary": "给定一个链表，返回链表开始入环的第一个节点。如果链表无环，则返回null。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握Floyd找环入口的算法：相遇后从起点和相遇点同步走，再次相遇即为入口。",
    "whyThisPattern": "数学证明：从head到环入口距离为a，环入口到相遇点距离为b，环长为c。fast走a+b+n*c步，slow走a+b步。fast=2*slow，所以a+b+n*c=2(a+b)，即a=n*c-b=(n-1)*c+(c-b)。c-b就是从相遇点到环入口的距离。所以从head和相遇点同步走，会在环入口相遇。",
    "hints": {
      "level1": "找环的入口节点。",
      "level2": "Floyd判圈：相遇后从head和相遇点同步走。",
      "level3": "哈希表。",
      "level4": "Floyd O(1)空间。",
      "level5": "slow=fast=head; while True: slow=slow.next; fast=fast.next.next; if slow==fast: break; slow=head; while slow!=fast: slow=slow.next; fast=fast.next; return slow",
      "level6": "# 核心思路：快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                # 相遇后，一个从头出发，一个从相遇点出发\n                p = head\n                while p != slow:\n                    p = p.next\n                    slow = slow.next\n                return p\n\n        return None"
    },
    "bruteForceIdea": "暴力思路：哈希表记录第一个重复访问的节点。O(n)空间。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "Floyd：fast/slow相遇后，一个从head出发一个从相遇点出发，同步走，相遇点=入口。O(1)空间。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                # 相遇后，一个从头出发，一个从相遇点出发\n                p = head\n                while p != slow:\n                    p = p.next\n                    slow = slow.next\n                return p\n\n        return None",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「环形链表 II」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 52,
    "leetcodeId": 146,
    "title": "LRU 缓存",
    "titleEn": "LRU Cache",
    "slug": "lru-cache",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "链表",
      "设计"
    ],
    "order": 52,
    "externalUrl": "https://leetcode.cn/problems/lru-cache/",
    "summary": "请你设计并实现一个满足LRU（最近最少使用）缓存约束的数据结构。实现LRUCache类：get(key)和put(key, value)，要求O(1)时间复杂度。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握哈希表+双向链表实现O(1)的LRU缓存。这道题是设计题的经典应用。",
    "whyThisPattern": "LRU的核心需求：O(1)查找+O(1)插入删除+维护访问顺序。哈希表提供O(1)查找，双向链表提供O(1)插入删除。组合：哈希表存key到链表节点的映射，双向链表维护访问顺序（最近使用在头部，最久未使用在尾部）。get时查找并移到头部；put时插入或更新并移到头部；容量满时删除尾部节点。",
    "hints": {
      "level1": "LRU缓存：get和put都要O(1)时间。最近最少使用的在容量满时被淘汰。",
      "level2": "哈希表O(1)查找+双向链表O(1)插入删除。组合实现LRU。",
      "level3": "数组维护顺序O(n)。",
      "level4": "哈希表O(1)查找+双向链表O(1)操作。",
      "level5": "class Node: key,val,prev,next; class LRUCache: dict+双向链表; get: 查找并移到头部; put: 插入/更新并移到头部，满则删尾",
      "level6": "# 核心思路：哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 capacity=1，连续 put 两个 key 检查代码。\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}  # key -> Node\n        self.head = Node()  # 虚拟头：最近使用端\n        self.tail = Node()  # 虚拟尾：最久使用端\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node: Node) -> None:\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node: Node) -> None:\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)  # 访问后变成最近使用\n        return node.val\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            node = self.cache[key]\n            node.val = value\n            self._remove(node)\n            self._add_to_front(node)\n            return\n\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n\n        if len(self.cache) > self.capacity:\n            old = self.tail.prev  # 虚拟尾前一个是真正最久未使用节点\n            self._remove(old)\n            del self.cache[old.key]"
    },
    "bruteForceIdea": "用有序字典或数组维护访问顺序。每次get后将元素移到末尾。时间O(n)。",
    "optimizedIdea": "哈希表+双向链表：get时查找并移到头部；put时插入或更新并移到头部。容量满时删除尾部。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 capacity=1，连续 put 两个 key 检查代码。\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}  # key -> Node\n        self.head = Node()  # 虚拟头：最近使用端\n        self.tail = Node()  # 虚拟尾：最久使用端\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node: Node) -> None:\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node: Node) -> None:\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)  # 访问后变成最近使用\n        return node.val\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            node = self.cache[key]\n            node.val = value\n            self._remove(node)\n            self._add_to_front(node)\n            return\n\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n\n        if len(self.cache) > self.capacity:\n            old = self.tail.prev  # 虚拟尾前一个是真正最久未使用节点\n            self._remove(old)\n            del self.cache[old.key]",
    "complexity": {
      "time": "get/put 均摊 O(1)",
      "space": "O(capacity)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「LRU 缓存」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 53,
    "leetcodeId": 148,
    "title": "排序链表",
    "titleEn": "Sort List",
    "slug": "sort-list",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "链表",
      "排序"
    ],
    "order": 53,
    "externalUrl": "https://leetcode.cn/problems/sort-list/",
    "summary": "给你链表的头结点head，请将其按升序排列并返回排序后的链表。要求时间复杂度O(nlogn)，空间复杂度O(1)。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握归并排序在链表上的应用。链表排序的归并实现比数组更简单（不需要额外空间找中点）。",
    "whyThisPattern": "链表排序的最佳选择是归并排序，因为：①归并排序时间O(n*logn)稳定 ②链表找中点用快慢指针O(n) ③合并两个有序链表O(n) ④不需要额外空间（不像数组归并需要O(n)辅助空间）。三步：快慢指针找中点→递归排序左右半→合并两个有序链表。",
    "hints": {
      "level1": "链表排序O(n*logn)时间O(1)空间。",
      "level2": "归并排序：找中点+递归排序+合并。",
      "level3": "冒泡O(n^2)。",
      "level4": "归并排序O(nlogn)。",
      "level5": "def sortList(head): if not head or not head.next: return head; slow,fast=head,head.next; while fast and fast.next: slow=slow.next; fast=fast.next.next; mid=slow.next; slow.next=None; return merge(sortList(head),sortList(mid))",
      "level6": "# 核心思路：链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[4,2,1,3] 检查代码。\nclass Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n\n        # 快慢指针找中点，同时 pre 用于断开前半段\n        slow = fast = head\n        pre = None\n        while fast and fast.next:\n            pre = slow\n            slow = slow.next\n            fast = fast.next.next\n        pre.next = None\n\n        left = self.sortList(head)\n        right = self.sortList(slow)\n        return self.merge(left, right)\n\n    def merge(self, a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n        while a and b:\n            if a.val <= b.val:\n                cur.next = a\n                a = a.next\n            else:\n                cur.next = b\n                b = b.next\n            cur = cur.next\n        cur.next = a if a else b\n        return dummy.next"
    },
    "bruteForceIdea": "冒泡排序：相邻节点比较交换，多轮遍历。时间O(n^2)。",
    "optimizedIdea": "归并排序：快慢指针找中点，递归排序左右半，合并。O(nlogn)时间O(1)空间。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[4,2,1,3] 检查代码。\nclass Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n\n        # 快慢指针找中点，同时 pre 用于断开前半段\n        slow = fast = head\n        pre = None\n        while fast and fast.next:\n            pre = slow\n            slow = slow.next\n            fast = fast.next.next\n        pre.next = None\n\n        left = self.sortList(head)\n        right = self.sortList(slow)\n        return self.merge(left, right)\n\n    def merge(self, a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n        while a and b:\n            if a.val <= b.val:\n                cur.next = a\n                a = a.next\n            else:\n                cur.next = b\n                b = b.next\n            cur = cur.next\n        cur.next = a if a else b\n        return dummy.next",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(logn)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「排序链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 54,
    "leetcodeId": 152,
    "title": "乘积最大子数组",
    "titleEn": "Maximum Product Subarray",
    "slug": "maximum-product-subarray",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 54,
    "externalUrl": "https://leetcode.cn/problems/maximum-product-subarray/",
    "summary": "给你一个整数数组nums，请你找出数组中乘积最大的非空连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握DP同时维护最大最小值的思想。这道题的关键是理解负数会使最大值变最小值、最小值变最大值。",
    "whyThisPattern": "关键观察：负数会使最大值变最小值、最小值变最大值（两个负数相乘变正数）。所以需要同时维护以i结尾的最大乘积和最小乘积。状态转移：max_dp[i]=max(nums[i], max_dp[i-1]*nums[i], min_dp[i-1]*nums[i])，min_dp同理。每次遇到负数时，最大最小会互换。",
    "hints": {
      "level1": "乘积最大子数组。注意负数：两个负数相乘变正数。",
      "level2": "同时维护最大最小DP。负数使最大最小互换。",
      "level3": "枚举子数组O(n^2)。",
      "level4": "DP同时维护max和min。",
      "level5": "max_dp=min_dp=nums[0]; res=nums[0]; for i: prev_max=max_dp; max_dp=max(nums[i],prev_max*nums[i],prev_min*nums[i]); min_dp=min(nums[i],prev_max*nums[i],prev_min*nums[i]); res=max(res,max_dp)",
      "level6": "# 核心思路：乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,-2,4] 检查代码。\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        max_prod = min_prod = ans = nums[0]\n\n        for x in nums[1:]:\n            if x < 0:\n                max_prod, min_prod = min_prod, max_prod\n            max_prod = max(x, max_prod * x)\n            min_prod = min(x, min_prod * x)\n            ans = max(ans, max_prod)\n\n        return ans"
    },
    "bruteForceIdea": "枚举所有子数组计算乘积取最大值。时间O(n^2)。",
    "optimizedIdea": "DP：max_dp=max(nums[i], max_dp*nums[i], min_dp*nums[i])，min_dp同理。遇到负数时最大最小互换。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,-2,4] 检查代码。\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        max_prod = min_prod = ans = nums[0]\n\n        for x in nums[1:]:\n            if x < 0:\n                max_prod, min_prod = min_prod, max_prod\n            max_prod = max(x, max_prod * x)\n            min_prod = min(x, min_prod * x)\n            ans = max(ans, max_prod)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「乘积最大子数组」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 55,
    "leetcodeId": 153,
    "title": "寻找旋转排序数组中的最小值",
    "titleEn": "Find Minimum in Rotated Sorted Array",
    "slug": "find-minimum-in-rotated-sorted-array",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 55,
    "externalUrl": "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/",
    "summary": "给定一个不含重复元素的升序数组nums在某个下标处进行了旋转，找出其中的最小元素。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二分查找」在「寻找旋转排序数组中的最小值」中的标准建模方式：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "旋转数组的关键性质：将一个有序数组从某处切开后拼接，一定有一半是有序的。最小值在\"无序\"的那一半。二分判断：如果nums[mid]>nums[right]，说明mid在有序的那半（较大的部分），最小值在右半边（mid+1到right）；否则mid在无序的那半或最小值就是mid，最小值在左半边（left到mid）。",
    "hints": {
      "level1": "旋转排序数组找最小值。比如[4,5,6,7,0,1,2]最小值是0。",
      "level2": "二分：比较nums[mid]和nums[right]判断最小值在哪半。",
      "level3": "遍历。",
      "level4": "二分。",
      "level5": "while l<r: mid=(l+r)//2; if nums[mid]>nums[r]: l=mid+1; else: r=mid; return nums[l]",
      "level6": "# 核心思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,4,5,1,2] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            else:\n                right = mid\n\n        return nums[left]"
    },
    "bruteForceIdea": "暴力思路：遍历整个数组找最小值。时间O(n)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "优化思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 明确二分区间是闭区间还是左闭右开。\n2. 写出 mid 后判断哪一半一定无答案。\n3. 更新 left/right 时保证区间收缩。\n4. 用单元素、无答案、重复/旋转边界检查。",
    "solutionCode": "# 核心思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,4,5,1,2] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            else:\n                right = mid\n\n        return nums[left]",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「寻找旋转排序数组中的最小值」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 56,
    "leetcodeId": 154,
    "title": "寻找旋转排序数组中的最小值 II",
    "titleEn": "Find Minimum in Rotated Sorted Array II",
    "slug": "find-minimum-in-rotated-sorted-array-ii",
    "difficulty": "困难",
    "category": "二分查找",
    "tags": [
      "二分查找"
    ],
    "order": 56,
    "externalUrl": "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array-ii/",
    "summary": "给定一个可能包含重复元素的旋转升序数组 nums，返回数组中的最小元素。与 153 题相比，本题允许重复值，因此二分判断会出现无法确定方向的情况。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握含重复值旋转数组的二分变体：当 nums[mid] 与 nums[right] 相等时无法判断最小值在哪边，只能用 right-- 安全缩小范围。",
    "whyThisPattern": "与153题的区别是有重复元素。当nums[left]==nums[mid]==nums[right]时，无法判断最小值在哪半边（比如[1,0,1,1,1]和[1,1,1,0,1]三者都相等）。此时只能缩小边界：right--。最坏情况下（所有元素相等）会退化为O(n)线性扫描。",
    "hints": {
      "level1": "有重复元素的旋转数组找最小值。",
      "level2": "二分+当三者相等时right--缩小范围。",
      "level3": "遍历。",
      "level4": "二分+相等处理。",
      "level5": "while l<r: mid=(l+r)//2; if nums[mid]>nums[r]: l=mid+1; elif nums[mid]<nums[r]: r=mid; else: r-=1; return nums[l]",
      "level6": "# 核心思路：有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,2,0,1] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            elif nums[mid] < nums[right]:\n                right = mid\n            else:\n                right -= 1  # 无法判断，安全丢掉一个重复右端点\n\n        return nums[left]"
    },
    "bruteForceIdea": "线性扫描整个数组，维护当前看到的最小值。这个方法不受重复值影响，时间 O(n)、空间 O(1)，但没有利用旋转有序结构。",
    "optimizedIdea": "二分比较 nums[mid] 和 nums[right]：如果 nums[mid] > nums[right]，最小值一定在右半；如果 nums[mid] < nums[right]，最小值在左半且包含 mid；如果二者相等，无法判断方向，但可以安全地 right-- 去掉一个重复候选。最坏全重复时退化到 O(n)。",
    "pseudocode": "1. 明确二分区间是闭区间还是左闭右开。\n2. 写出 mid 后判断哪一半一定无答案。\n3. 更新 left/right 时保证区间收缩。\n4. 用单元素、无答案、重复/旋转边界检查。",
    "solutionCode": "# 核心思路：有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,2,0,1] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            elif nums[mid] < nums[right]:\n                right = mid\n            else:\n                right -= 1  # 无法判断，安全丢掉一个重复右端点\n\n        return nums[left]",
    "complexity": {
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「寻找旋转排序数组中的最小值 II」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 57,
    "leetcodeId": 155,
    "title": "最小栈",
    "titleEn": "Min Stack",
    "slug": "min-stack",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "栈",
      "设计"
    ],
    "order": 57,
    "externalUrl": "https://leetcode.cn/problems/min-stack/",
    "summary": "设计一个支持push、pop、top操作，并能在常数时间内检索到最小元素的栈。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「栈」在「最小栈」中的标准建模方式：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "辅助栈的核心思想：用一个额外的栈同步记录当前主栈中的最小值。push时：如果新值<=辅助栈栈顶（当前最小值），辅助栈也push。pop时：如果弹出的值等于辅助栈栈顶，辅助栈也弹出。这样辅助栈的栈顶始终是当前主栈的最小值，getMin直接返回辅助栈栈顶即可。所有操作O(1)。",
    "hints": {
      "level1": "最小栈：push、pop、top、getMin都是O(1)。",
      "level2": "辅助栈同步记录最小值。push用<=（不是<）确保重复最小值正确处理。",
      "level3": "遍历找最小O(n)。",
      "level4": "辅助栈O(1)。",
      "level5": "a=[],b=[]; push(v): a.append(v); if not b or v<=b[-1]: b.append(v); pop: if a.pop()==b[-1]: b.pop(); getMin: return b[-1]",
      "level6": "# 核心思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 push(-2),push(0),push(-3),getMin() 检查代码。\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        # 当前最小值 = min(新值, 之前最小值)\n        if not self.min_stack:\n            self.min_stack.append(val)\n        else:\n            self.min_stack.append(min(val, self.min_stack[-1]))\n\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]"
    },
    "bruteForceIdea": "每次getMin遍历整个栈找最小值。时间O(n)。",
    "optimizedIdea": "优化思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 push(-2),push(0),push(-3),getMin() 检查代码。\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        # 当前最小值 = min(新值, 之前最小值)\n        if not self.min_stack:\n            self.min_stack.append(val)\n        else:\n            self.min_stack.append(min(val, self.min_stack[-1]))\n\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]",
    "complexity": {
      "time": "push/pop/top/getMin 均 O(1)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最小栈」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 58,
    "leetcodeId": 160,
    "title": "相交链表",
    "titleEn": "Intersection of Two Linked Lists",
    "slug": "intersection-of-two-linked-lists",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 58,
    "externalUrl": "https://leetcode.cn/problems/intersection-of-two-linked-lists/",
    "summary": "给定两个单链表的头节点headA和headB，请你找出并返回两个单链表相交的起始节点。如果不存在相交节点，返回null。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「链表」在「相交链表」中的标准建模方式：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "双指针消除长度差的数学原理：设headA到交点距离为a，headB到交点距离为b，交点到末尾距离为c。pA走完headA(a+c)后走headB(b)，总路程a+c+b。pB走完headB(b+c)后走headA(a)，总路程b+c+a。两者总路程相同！所以如果存在交点，pA和pB一定会在交点相遇；如果不存在交点，两者都会走到null。",
    "hints": {
      "level1": "找两个链表的交点。不存在交点返回null。",
      "level2": "双指针：pA走完A走B，pB走完B走A。总路程相同，消除长度差。",
      "level3": "哈希表。",
      "level4": "双指针O(1)空间。",
      "level5": "pA=headA,pB=headB; while pA!=pB: pA=pA.next if pA else headB; pB=pB.next if pB else headA; return pA",
      "level6": "# 核心思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 A=[4,1,8,4,5], B=[5,6,1,8,4,5] 检查代码。\nclass Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        p, q = headA, headB\n\n        while p != q:\n            p = p.next if p else headB\n            q = q.next if q else headA\n\n        return p"
    },
    "bruteForceIdea": "用哈希集合存第一个链表的所有节点，遍历第二个链表检查是否有已存在的节点。时间O(m+n)，空间O(m)。",
    "optimizedIdea": "优化思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 A=[4,1,8,4,5], B=[5,6,1,8,4,5] 检查代码。\nclass Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        p, q = headA, headB\n\n        while p != q:\n            p = p.next if p else headB\n            q = q.next if q else headA\n\n        return p",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「相交链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 59,
    "leetcodeId": 169,
    "title": "多数元素",
    "titleEn": "Majority Element",
    "slug": "majority-element",
    "difficulty": "简单",
    "category": "技巧",
    "tags": [
      "数组"
    ],
    "order": 59,
    "externalUrl": "https://leetcode.cn/problems/majority-element/",
    "summary": "给定一个大小为n的数组nums，返回其中的多数元素。多数元素是指在数组中出现次数大于n/2的元素。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「技巧」在「多数元素」中的标准建模方式：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "摩尔投票的核心思想：多数元素出现次数超过一半，所以它和其他元素两两抵消后，最后剩下的一定是多数元素。想象一个擂台：相同元素+1票，不同元素-1票，票数为0时换候选人。因为多数元素的票数比其他所有元素加起来还多，所以最后站在擂台上的一定是它。",
    "hints": {
      "level1": "找出现次数超过一半的元素。注意：假设一定存在多数元素。",
      "level2": "摩尔投票：不同元素互相抵消，剩下的一定是多数元素。为什么？因为多数元素的票数比其他所有元素加起来还多。",
      "level3": "哈希表。",
      "level4": "摩尔投票O(1)。",
      "level5": "candidate=nums[0]; count=1; for num in nums[1:]: if count==0: candidate=num; count=1; elif num==candidate: count+=1; else: count-=1; return candidate",
      "level6": "# 核心思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,3] 检查代码。\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        candidate = None\n        count = 0\n\n        for x in nums:\n            if count == 0:\n                candidate = x\n            count += 1 if x == candidate else -1\n\n        return candidate"
    },
    "bruteForceIdea": "用哈希表统计每个元素出现的次数，遍历哈希表找到出现次数大于n/2的元素。时间O(n)，空间O(n)。这是最直觉的做法，但题目要求O(1)空间。",
    "optimizedIdea": "优化思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,3] 检查代码。\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        candidate = None\n        count = 0\n\n        for x in nums:\n            if count == 0:\n                candidate = x\n            count += 1 if x == candidate else -1\n\n        return candidate",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「多数元素」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 60,
    "leetcodeId": 198,
    "title": "打家劫舍",
    "titleEn": "House Robber",
    "slug": "house-robber",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 60,
    "externalUrl": "https://leetcode.cn/problems/house-robber/",
    "summary": "你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统——如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。求不触动警报的情况下能够偷窃到的最高金额。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握一维动态规划：dp[i]=max(dp[i-1], dp[i-2]+nums[i])。",
    "whyThisPattern": "一维DP的经典入门。状态定义：dp[i]=前i个房屋能偷到的最大金额。对于第i个房屋，两种选择：①偷第i个：金额=dp[i-2]+nums[i]（不能偷相邻的i-1）②不偷第i个：金额=dp[i-1]（保持前i-1个的最大值）。取两者较大值：dp[i]=max(dp[i-1], dp[i-2]+nums[i])。空间可优化为两个变量。",
    "hints": {
      "level1": "打家劫舍。相邻房屋不能同时偷。求最大偷取金额。",
      "level2": "dp[i]=max(不偷dp[i-1], 偷dp[i-2]+nums[i])。",
      "level3": "递归O(2^n)。",
      "level4": "DP两个变量。",
      "level5": "prev2=0; prev1=0; for num: curr=max(prev1,prev2+num); prev2=prev1; prev1=curr; return prev1",
      "level6": "# 核心思路：每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,1] 检查代码。\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        prev2 = 0  # dp[i-2]\n        prev1 = 0  # dp[i-1]\n\n        for money in nums:\n            cur = max(prev1, prev2 + money)\n            prev2, prev1 = prev1, cur\n\n        return prev1"
    },
    "bruteForceIdea": "递归：对于每个房屋，尝试偷和不偷两种选择，取最大值。时间O(2^n)，有大量重复子问题。",
    "optimizedIdea": "DP：dp[i]=max(dp[i-1], dp[i-2]+nums[i])。空间优化为两个变量。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,1] 检查代码。\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        prev2 = 0  # dp[i-2]\n        prev1 = 0  # dp[i-1]\n\n        for money in nums:\n            cur = max(prev1, prev2 + money)\n            prev2, prev1 = prev1, cur\n\n        return prev1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「打家劫舍」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 61,
    "leetcodeId": 200,
    "title": "岛屿数量",
    "titleEn": "Number of Islands",
    "slug": "number-of-islands",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "图",
      "DFS",
      "BFS"
    ],
    "order": 61,
    "externalUrl": "https://leetcode.cn/problems/number-of-islands/",
    "summary": "给你一个由1（陆地）和0（水）组成的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「图论」在「岛屿数量」中的标准建模方式：遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "网格DFS的经典应用。核心思想：遍历整个网格，遇到未访问的陆地(1)时，岛屿数量+1，然后从这个位置开始DFS把整个岛屿\"沉没\"（标记为0或已访问）。DFS递归四个方向（上下左右），把连通的所有1都标记为0。这样每个格子最多被访问两次（一次遍历，一次DFS），时间O(m*n)。",
    "hints": {
      "level1": "网格中1是陆地0是水。计算岛屿数量。岛屿由水平或垂直相邻的1组成。",
      "level2": "遇到1就count++并DFS沉没整个岛屿。每个格子最多访问两次。",
      "level3": "BFS/DFS。",
      "level4": "DFS递归标记。",
      "level5": "count=0; for i,j: if grid[i][j]==\"1\": count+=1; dfs(i,j); def dfs(i,j): if 越界或不是1: return; grid[i][j]=\"0\"; dfs四个方向",
      "level6": "# 核心思路：遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 全是 0 检查代码。\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        ans = 0\n\n        def dfs(i: int, j: int) -> None:\n            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':\n                return\n            grid[i][j] = '0'  # 标记已访问，也可以理解为淹掉陆地\n            dfs(i + 1, j)\n            dfs(i - 1, j)\n            dfs(i, j + 1)\n            dfs(i, j - 1)\n\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    dfs(i, j)\n\n        return ans"
    },
    "bruteForceIdea": "遍历每个格子，遇到1就BFS/DFS标记整个岛屿。时间O(m*n)，空间O(min(m,n))（递归栈）。",
    "optimizedIdea": "遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。 每个格子最多访问一次；递归栈最坏覆盖整张网格。",
    "pseudocode": "1. 先把问题翻译成点和边。\n2. 选择 DFS/BFS/拓扑排序/并查集。\n3. 维护 visited、入度或父节点等状态。\n4. 用不连通、有环、单点图样例检查。",
    "solutionCode": "# 核心思路：遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 全是 0 检查代码。\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        ans = 0\n\n        def dfs(i: int, j: int) -> None:\n            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':\n                return\n            grid[i][j] = '0'  # 标记已访问，也可以理解为淹掉陆地\n            dfs(i + 1, j)\n            dfs(i - 1, j)\n            dfs(i, j + 1)\n            dfs(i, j - 1)\n\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    dfs(i, j)\n\n        return ans",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)"
    },
    "commonMistakes": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「岛屿数量」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 62,
    "leetcodeId": 206,
    "title": "反转链表",
    "titleEn": "Reverse Linked List",
    "slug": "reverse-linked-list",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 62,
    "externalUrl": "https://leetcode.cn/problems/reverse-linked-list/",
    "summary": "给你单链表的头节点head，请你反转链表，并返回反转后的链表。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「链表」在「反转链表」中的标准建模方式：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "链表反转的核心操作：把每个节点的next指针从\"指向后一个\"改为\"指向前一个\"。需要三个指针：prev(前一个)、curr(当前)、next_temp(后一个)。关键步骤：①先用next_temp存住curr.next（否则断链后找不到下一个）②把curr.next指向prev ③prev=curr ④curr=next_temp。循环直到curr为null，此时prev就是新的头节点。",
    "hints": {
      "level1": "反转单链表。1->2->3变成3->2->1。",
      "level2": "三指针迭代：存next→反转→前移。返回prev不是curr。",
      "level3": "数组辅助。",
      "level4": "迭代O(1)空间。",
      "level5": "prev=None; curr=head; while curr: next_temp=curr.next; curr.next=prev; prev=curr; curr=next_temp; return prev",
      "level6": "# 核心思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        cur = head\n\n        while cur:\n            nxt = cur.next      # 先保存原来的下一个节点\n            cur.next = prev     # 反转指针\n            prev = cur          # prev 前进\n            cur = nxt           # cur 前进\n\n        return prev"
    },
    "bruteForceIdea": "把所有节点的值存到数组，反转数组，再重建链表。时间O(n)，空间O(n)。",
    "optimizedIdea": "优化思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        cur = head\n\n        while cur:\n            nxt = cur.next      # 先保存原来的下一个节点\n            cur.next = prev     # 反转指针\n            prev = cur          # prev 前进\n            cur = nxt           # cur 前进\n\n        return prev",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「反转链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 63,
    "leetcodeId": 207,
    "title": "课程表",
    "titleEn": "Course Schedule",
    "slug": "course-schedule",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "图",
      "拓扑排序"
    ],
    "order": 63,
    "externalUrl": "https://leetcode.cn/problems/course-schedule/",
    "summary": "你这个学期必须选修numCourses门课程，记为0到numCourses-1。在选修某些课程之前需要一些先修课程。判断是否可能完成所有课程的学习。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「图论」在「课程表」中的标准建模方式：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "拓扑排序的本质：在有向无环图(DAG)中找到一个线性顺序，使得所有有向边都从前往后。BFS拓扑排序（Kahn算法）：①计算每个节点的入度 ②把入度为0的节点入队 ③每次从队列取出一个节点，把它指向的节点的入度-1 ④如果某个节点入度变为0就入队 ⑤最后检查是否所有节点都被处理了（count==n）。如果count<n说明有环。",
    "hints": {
      "level1": "课程表：判断能否完成所有课程（先修关系构成有向图，无环才能完成）。",
      "level2": "BFS拓扑排序：入度为0的入队，处理后邻居入度-1。count==n则无环。",
      "level3": "DFS判环。",
      "level4": "BFS拓扑排序。",
      "level5": "建图+入度; queue=入度0的节点; while queue: node=queue.pop(0); count++; for nei: indegree[nei]--; if 0: queue.append(nei); return count==n",
      "level6": "# 核心思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 numCourses=2, prerequisites=[[1,0]] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        indegree = [0] * numCourses\n\n        for course, pre in prerequisites:\n            graph[pre].append(course)\n            indegree[course] += 1\n\n        queue = deque(i for i in range(numCourses) if indegree[i] == 0)\n        learned = 0\n\n        while queue:\n            cur = queue.popleft()\n            learned += 1\n            for nxt in graph[cur]:\n                indegree[nxt] -= 1\n                if indegree[nxt] == 0:\n                    queue.append(nxt)\n\n        return learned == numCourses"
    },
    "bruteForceIdea": "DFS三色标记法检测环：白色(未访问)、灰色(正在访问)、黑色(已完成)。遇到灰色节点说明有环。",
    "optimizedIdea": "优化思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先把问题翻译成点和边。\n2. 选择 DFS/BFS/拓扑排序/并查集。\n3. 维护 visited、入度或父节点等状态。\n4. 用不连通、有环、单点图样例检查。",
    "solutionCode": "# 核心思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 numCourses=2, prerequisites=[[1,0]] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        indegree = [0] * numCourses\n\n        for course, pre in prerequisites:\n            graph[pre].append(course)\n            indegree[course] += 1\n\n        queue = deque(i for i in range(numCourses) if indegree[i] == 0)\n        learned = 0\n\n        while queue:\n            cur = queue.popleft()\n            learned += 1\n            for nxt in graph[cur]:\n                indegree[nxt] -= 1\n                if indegree[nxt] == 0:\n                    queue.append(nxt)\n\n        return learned == numCourses",
    "complexity": {
      "time": "O(V+E)",
      "space": "O(V+E)"
    },
    "commonMistakes": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「课程表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 64,
    "leetcodeId": 208,
    "title": "实现 Trie",
    "titleEn": "Implement Trie",
    "slug": "implement-trie-prefix-tree",
    "difficulty": "中等",
    "category": "前缀树",
    "tags": [
      "前缀树",
      "设计",
      "字符串"
    ],
    "order": 64,
    "externalUrl": "https://leetcode.cn/problems/implement-trie-prefix-tree/",
    "summary": "Trie（发音类似\"try\"）或者说前缀树是一种树形数据结构，用于高效地存储和检索字符串。实现Trie类：insert、search、startsWith。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握 Trie 前缀树的节点设计和三种基础操作：insert、search、startsWith。重点区分“前缀存在”和“完整单词存在”。",
    "whyThisPattern": "当需要频繁插入字符串、查询完整单词、查询某个前缀是否存在时，哈希集合只能快速判断完整单词，无法高效复用公共前缀。Trie 把每个字符当作一条边，共享相同前缀路径；节点上的 is_end 标记用于区分“走到这里”只是前缀，还是一个完整单词结束。",
    "hints": {
      "level1": "实现Trie：insert(word)、search(word)、startsWith(prefix)三个操作。",
      "level2": "children字典+isEnd标记。insert逐字符建节点，search逐字符查isEnd。",
      "level3": "哈希集合。",
      "level4": "Trie树。",
      "level5": "class Trie: root={}; insert: 逐字符建; search: 逐字符查+检查isEnd; startsWith: 逐字符查",
      "level6": "# 核心思路：Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 insert(\"apple\"), search(\"apple\") 检查代码。\nclass TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                node.children[ch] = TrieNode()\n            node = node.children[ch]\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True"
    },
    "bruteForceIdea": "用哈希集合保存所有单词。insert 是 O(L)，search 也是 O(L)，但 startsWith(prefix) 需要遍历所有已插入单词并逐个判断前缀，最坏会变成 O(N·L)，不适合大量前缀查询。",
    "optimizedIdea": "使用 Trie。每个节点保存 children 字典和 is_end 标记。insert 逐字符创建/下钻节点；search 逐字符走路径，最后还要检查 is_end；startsWith 只要路径存在即可。单次操作时间 O(L)，L 为单词或前缀长度。",
    "pseudocode": "1. 先把问题翻译成点和边。\n2. 选择 DFS/BFS/拓扑排序/并查集。\n3. 维护 visited、入度或父节点等状态。\n4. 用不连通、有环、单点图样例检查。",
    "solutionCode": "# 核心思路：Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 insert(\"apple\"), search(\"apple\") 检查代码。\nclass TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                node.children[ch] = TrieNode()\n            node = node.children[ch]\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True",
    "complexity": {
      "time": "insert/search/startsWith 均 O(L)",
      "space": "O(总字符数)"
    },
    "commonMistakes": [
      "search 只检查路径存在，没有检查 is_end，导致前缀被误判成完整单词。",
      "insert 时忘记创建缺失的子节点，或者创建后没有把指针移动到下一层。",
      "把 startsWith 写成 search，错误要求 prefix 也必须是完整单词。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「实现 Trie」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 65,
    "leetcodeId": 215,
    "title": "数组中的第K个最大元素",
    "titleEn": "Kth Largest Element in an Array",
    "slug": "kth-largest-element-in-an-array",
    "difficulty": "中等",
    "category": "堆",
    "tags": [
      "堆",
      "快速选择"
    ],
    "order": 65,
    "externalUrl": "https://leetcode.cn/problems/kth-largest-element-in-an-array/",
    "summary": "给定整数数组nums和整数k，请返回数组中第k个最大的元素。请注意，你需要找的是数组排序后的第k个最大的元素，而不是第k个不同的元素。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「堆」在「数组中的第K个最大元素」中的标准建模方式：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "两种经典解法：①快速选择（QuickSelect）：基于快排的partition，每次选一个pivot把数组分成两半，如果pivot位置正好是n-k就找到了。平均O(n)时间，最坏O(n^2)。②最小堆：维护一个大小为k的最小堆，遍历数组，堆满时如果当前元素大于堆顶则替换。时间O(n*logk)。",
    "hints": {
      "level1": "找第k大的元素（不是第k小）。第k大=排序后下标为n-k。",
      "level2": "快速选择平均O(n)或最小堆O(n*logk)。",
      "level3": "排序O(nlogn)。",
      "level4": "快速选择平均O(n)或堆O(nlogk)。",
      "level5": "方法一：heapq.nlargest(k,nums)[-1]; 方法二：快速选择partition",
      "level6": "# 核心思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,1,5,6,4], k=2 检查代码。\nimport heapq\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        heap = []\n\n        for x in nums:\n            heapq.heappush(heap, x)\n            if len(heap) > k:\n                heapq.heappop(heap)  # 弹掉当前 k+1 个数中最小的\n\n        return heap[0]"
    },
    "bruteForceIdea": "排序后取下标n-k的元素。时间O(n*logn)。",
    "optimizedIdea": "优化思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先说明为什么只需要维护前 k 个或当前最优。\n2. 确定用小顶堆还是大顶堆。\n3. 保持堆大小或弹出规则。\n4. 用 k=1、重复值、频率相同样例检查。",
    "solutionCode": "# 核心思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,1,5,6,4], k=2 检查代码。\nimport heapq\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        heap = []\n\n        for x in nums:\n            heapq.heappush(heap, x)\n            if len(heap) > k:\n                heapq.heappop(heap)  # 弹掉当前 k+1 个数中最小的\n\n        return heap[0]",
    "complexity": {
      "time": "O(nlogk)",
      "space": "O(k)"
    },
    "commonMistakes": [
      "小顶堆/大顶堆方向选反。",
      "堆大小没有限制，复杂度退化。",
      "重复值和频率相同的情况没有想清楚。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「数组中的第K个最大元素」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 66,
    "leetcodeId": 221,
    "title": "最大正方形",
    "titleEn": "Maximal Square",
    "slug": "maximal-square",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划",
      "矩阵"
    ],
    "order": 66,
    "externalUrl": "https://leetcode.cn/problems/maximal-square/",
    "summary": "给定一个由0和1组成的二维矩阵，找到只包含1的最大正方形，返回其面积。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握二维DP：dp[i][j]表示以(i,j)为右下角的最大正方形边长。",
    "whyThisPattern": "二维DP的关键洞察：以(i,j)为右下角的最大正方形，取决于它左边、上边、左上角三个方向能扩展的最小边长。如果matrix[i][j]=1，则dp[i][j]=min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])+1。为什么取最小？因为正方形要求三个方向都能扩展，受限于最短的那个。",
    "hints": {
      "level1": "在0-1矩阵中找最大全1正方形的面积。",
      "level2": "dp[i][j]=min(左,上,左上)+1。受限于最短方向。",
      "level3": "暴力枚举。",
      "level4": "DP递推。",
      "level5": "dp[i][j]=min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1 if matrix[i][j]=1",
      "level6": "# 核心思路：dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 0 检查代码。\nclass Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        dp = [0] * (n + 1)\n        max_side = 0\n\n        for i in range(1, m + 1):\n            prev_diag = 0  # 保存上一行左上角 dp[j-1]\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = min(dp[j], dp[j - 1], prev_diag) + 1\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev_diag = temp\n\n        return max_side * max_side"
    },
    "bruteForceIdea": "暴力枚举所有可能的正方形（左上角+边长），检查是否全1。时间O(m*n*min(m,n)^2)。",
    "optimizedIdea": "DP：dp[i][j]=min(左,上,左上)+1。O(mn)时间。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 0 检查代码。\nclass Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        dp = [0] * (n + 1)\n        max_side = 0\n\n        for i in range(1, m + 1):\n            prev_diag = 0  # 保存上一行左上角 dp[j-1]\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = min(dp[j], dp[j - 1], prev_diag) + 1\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev_diag = temp\n\n        return max_side * max_side",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最大正方形」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 67,
    "leetcodeId": 226,
    "title": "翻转二叉树",
    "titleEn": "Invert Binary Tree",
    "slug": "invert-binary-tree",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 67,
    "externalUrl": "https://leetcode.cn/problems/invert-binary-tree/",
    "summary": "给你一棵二叉树的根节点root，翻转这棵二叉树，并返回其根节点。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二叉树」在「翻转二叉树」中的标准建模方式：对每个节点交换左右孩子，再递归翻转左右子树。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "翻转二叉树的本质是递归交换每个节点的左右子树。对于每个节点：①先交换它的左右子树 ②再递归翻转左子树 ③再递归翻转右子树。也可以先递归再交换，顺序不影响结果。这道题是理解二叉树递归操作的基础练习。",
    "hints": {
      "level1": "翻转二叉树：每个节点的左右子树互换。比如左子树是2的节点，翻转后左子树变成原来右子树的值。",
      "level2": "递归：对每个节点，swap(left, right)，然后递归处理left和right。终止条件：空节点返回None。",
      "level3": "BFS。",
      "level4": "递归。",
      "level5": "def invert(root): if not root: return None; root.left,root.right=invert(root.right),invert(root.left); return root",
      "level6": "# 核心思路：对每个节点交换左右孩子，再递归翻转左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root"
    },
    "bruteForceIdea": "BFS层序遍历，对每个节点交换左右子孩子。时间O(n)，空间O(n)（队列）。",
    "optimizedIdea": "递归一行：root.left,root.right=invert(right),invert(left)。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：对每个节点交换左右孩子，再递归翻转左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「翻转二叉树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 68,
    "leetcodeId": 234,
    "title": "回文链表",
    "titleEn": "Palindrome Linked List",
    "slug": "palindrome-linked-list",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "链表"
    ],
    "order": 68,
    "externalUrl": "https://leetcode.cn/problems/palindrome-linked-list/",
    "summary": "给你一个单链表的头节点head，请你判断该链表是否为回文链表。如果是，返回true；否则，返回false。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「链表」在「回文链表」中的标准建模方式：快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "回文链表的核心思路：①用快慢指针找到链表中点 ②反转后半部分链表 ③比较前半部分和后半部分是否相同。这样可以在O(1)空间内完成判断。关键细节：快指针走两步、慢指针走一步，快指针到末尾时慢指针恰好在中点。",
    "hints": {
      "level1": "判断链表是否回文。回文=正读反读相同，比如1->2->2->1是回文。",
      "level2": "找中点+反转后半+比较。三步组合实现O(1)空间。",
      "level3": "数组辅助。",
      "level4": "O(1)空间。",
      "level5": "slow=fast=head; while fast.next: slow=slow.next; fast=fast.next.next; 反转slow; 比较两半",
      "level6": "# 核心思路：快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,2,1] 检查代码。\nclass Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n\n        # 反转后半段\n        prev = None\n        cur = slow\n        while cur:\n            nxt = cur.next\n            cur.next = prev\n            prev = cur\n            cur = nxt\n\n        # prev 是后半段反转后的头\n        p1, p2 = head, prev\n        while p2:\n            if p1.val != p2.val:\n                return False\n            p1 = p1.next\n            p2 = p2.next\n\n        return True"
    },
    "bruteForceIdea": "把链表所有节点的值存到数组中，然后用双指针判断数组是否回文。时间O(n)，空间O(n)。简单但不满足O(1)空间要求。",
    "optimizedIdea": "快慢指针找中点→反转后半→比较→可选恢复。O(1)空间。",
    "pseudocode": "1. 先画 dummy、prev、cur、next 等指针位置。\n2. 明确循环结束条件，避免空指针访问。\n3. 每次改 next 前先保存后续节点。\n4. 用删除头节点、单节点、长度不一致样例检查。",
    "solutionCode": "# 核心思路：快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,2,1] 检查代码。\nclass Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n\n        # 反转后半段\n        prev = None\n        cur = slow\n        while cur:\n            nxt = cur.next\n            cur.next = prev\n            prev = cur\n            cur = nxt\n\n        # prev 是后半段反转后的头\n        p1, p2 = head, prev\n        while p2:\n            if p1.val != p2.val:\n                return False\n            p1 = p1.next\n            p2 = p2.next\n\n        return True",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「回文链表」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 69,
    "leetcodeId": 236,
    "title": "二叉树的最近公共祖先",
    "titleEn": "Lowest Common Ancestor of a Binary Tree",
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 69,
    "externalUrl": "https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/",
    "summary": "给定一个二叉树,找到该树中两个指定节点的最近公共祖先（LCA）。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二叉树」在「二叉树的最近公共祖先」中的标准建模方式：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "后序遍历找LCA的递归逻辑：①如果当前节点是null、p或q，返回当前节点 ②递归得到左子树的结果left和右子树的结果right ③如果left和right都非空，说明p和q分别在左右子树中，当前节点就是LCA ④如果只有一个非空，返回非空的那个（说明p和q都在同一侧）。后序遍历确保我们先处理子节点再处理父节点。",
    "hints": {
      "level1": "找二叉树中两个节点的最近公共祖先（LCA）。",
      "level2": "后序遍历：left和right都非空则当前节点是LCA。",
      "level3": "存父节点。",
      "level4": "递归后序。",
      "level5": "def lca(root): if not root or root==p or root==q: return root; left=lca(left); right=lca(right); if left and right: return root; return left or right",
      "level6": "# 核心思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 p=5, q=1 检查代码。\nclass Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        if not root or root == p or root == q:\n            return root\n\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n\n        if left and right:\n            return root\n        return left if left else right"
    },
    "bruteForceIdea": "存储每个节点的父节点映射，然后从p和q分别向上走记录路径，找两条路径的第一个交点。时间O(n)，空间O(n)。",
    "optimizedIdea": "优化思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 p=5, q=1 检查代码。\nclass Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        if not root or root == p or root == q:\n            return root\n\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n\n        if left and right:\n            return root\n        return left if left else right",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的最近公共祖先」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 70,
    "leetcodeId": 238,
    "title": "除自身以外数组的乘积",
    "titleEn": "Product of Array Except Self",
    "slug": "product-of-array-except-self",
    "difficulty": "中等",
    "category": "普通数组",
    "tags": [
      "数组"
    ],
    "order": 70,
    "externalUrl": "https://leetcode.cn/problems/product-of-array-except-self/",
    "summary": "给你一个整数数组nums，返回数组answer，其中answer[i]等于nums中除nums[i]之外其余各元素的乘积。不能使用除法。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「普通数组」在「除自身以外数组的乘积」中的标准建模方式：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "核心思想：answer[i]=nums[0]*...*nums[i-1] * nums[i+1]*...*nums[n-1]。即\"左边所有数的乘积\"乘以\"右边所有数的乘积\"。不能用除法，所以分别计算前缀积和后缀积。优化：用answer数组先存前缀积（从左到右），然后从右到左遍历同时乘以后缀积。这样只需要O(1)额外空间。",
    "hints": {
      "level1": "answer[i]=除nums[i]外所有数的乘积。不能用除法。",
      "level2": "前缀积乘以后缀积。两次遍历搞定。",
      "level3": "嵌套循环O(n^2)。",
      "level4": "两次遍历O(n)。",
      "level5": "left=1; for i: answer[i]=left; left*=nums[i]; right=1; for i反向: answer[i]*=right; right*=nums[i]",
      "level6": "# 核心思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,4] 检查代码。\nclass Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        n = len(nums)\n        ans = [1] * n\n\n        # ans[i] 先存 nums[i] 左侧所有数的乘积\n        left_product = 1\n        for i in range(n):\n            ans[i] = left_product\n            left_product *= nums[i]\n\n        # 再从右往左乘上右侧所有数的乘积\n        right_product = 1\n        for i in range(n - 1, -1, -1):\n            ans[i] *= right_product\n            right_product *= nums[i]\n\n        return ans"
    },
    "bruteForceIdea": "对每个位置i，遍历其他所有位置求乘积。时间O(n^2)。",
    "optimizedIdea": "优化思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先找数组结构：前缀、区间、排序或原地标记。\n2. 定义扫描过程中维护的不变量。\n3. 每次更新前确认是否破坏原相对顺序或边界。\n4. 用空/单元素、重复值、全有序样例检查。",
    "solutionCode": "# 核心思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,4] 检查代码。\nclass Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        n = len(nums)\n        ans = [1] * n\n\n        # ans[i] 先存 nums[i] 左侧所有数的乘积\n        left_product = 1\n        for i in range(n):\n            ans[i] = left_product\n            left_product *= nums[i]\n\n        # 再从右往左乘上右侧所有数的乘积\n        right_product = 1\n        for i in range(n - 1, -1, -1):\n            ans[i] *= right_product\n            right_product *= nums[i]\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「除自身以外数组的乘积」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 71,
    "leetcodeId": 239,
    "title": "滑动窗口最大值",
    "titleEn": "Sliding Window Maximum",
    "slug": "sliding-window-maximum",
    "difficulty": "困难",
    "category": "单调队列",
    "tags": [
      "滑动窗口",
      "单调队列",
      "队列"
    ],
    "order": 71,
    "externalUrl": "https://leetcode.cn/problems/sliding-window-maximum/",
    "summary": "给你一个整数数组nums和一个大小为k的滑动窗口，从数组的最左端滑动到最右端。返回滑动窗口中的最大值。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握单调队列维护窗口最大值：队列里存下标，既要移除过期元素，也要保持队列对应值单调递减。",
    "whyThisPattern": "单调递减双端队列的核心维护逻辑：队列中存下标，保证对应的值从队首到队尾递减。入队时：从队尾弹出所有比当前值小的元素（因为它们不可能是当前或未来窗口的最大值），然后入队。检查过期：如果队首下标超出窗口范围（等于i-k），从队首弹出。队首始终是当前窗口的最大值下标。",
    "hints": {
      "level1": "滑动窗口大小为k，返回每个窗口的最大值。",
      "level2": "单调递减双端队列：入队弹出比当前小的，检查队首过期。",
      "level3": "遍历O(nk)。",
      "level4": "单调队列O(n)。",
      "level5": "dq=deque(); for i,num: while dq and nums[dq[-1]]<=num: dq.pop(); dq.append(i); if dq[0]==i-k: dq.popleft(); if i>=k-1: res.append(nums[dq[0]])",
      "level6": "# 核心思路：单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,-1,-3,5,3,6,7], k=3 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()  # 存下标，且 nums[q] 单调递减\n        ans = []\n\n        for i, x in enumerate(nums):\n            # 移除窗口左侧过期下标\n            if q and q[0] <= i - k:\n                q.popleft()\n\n            # 新元素更大时，队尾较小元素不可能再成为最大值\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n\n        return ans"
    },
    "bruteForceIdea": "对每个窗口遍历k个元素找最大值。时间O(n*k)。",
    "optimizedIdea": "用单调递减双端队列保存候选最大值下标。遍历每个位置时，先移除窗口左侧过期下标，再从队尾弹出所有不大于当前值的下标，最后把当前下标入队；队首始终是当前窗口最大值。每个下标最多入队出队一次，时间 O(n)。",
    "pseudocode": "1. 先判断是前缀和、滑动窗口还是单调队列。\n2. 明确连续区间的左右边界。\n3. 维护窗口/前缀哈希中的计数含义。\n4. 用负数、重复、空窗口样例检查。",
    "solutionCode": "# 核心思路：单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,-1,-3,5,3,6,7], k=3 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()  # 存下标，且 nums[q] 单调递减\n        ans = []\n\n        for i, x in enumerate(nums):\n            # 移除窗口左侧过期下标\n            if q and q[0] <= i - k:\n                q.popleft()\n\n            # 新元素更大时，队尾较小元素不可能再成为最大值\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(k)"
    },
    "commonMistakes": [
      "连续子数组/子串和子序列混淆。",
      "有负数时误用滑动窗口。",
      "前缀和计数没有先初始化 0。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「滑动窗口最大值」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 72,
    "leetcodeId": 240,
    "title": "搜索二维矩阵 II",
    "titleEn": "Search a 2D Matrix II",
    "slug": "search-a-2d-matrix-ii",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "矩阵"
    ],
    "order": 72,
    "externalUrl": "https://leetcode.cn/problems/search-a-2d-matrix-ii/",
    "summary": "编写一个高效的算法来搜索m×n矩阵matrix中的一个目标值target。矩阵具有以下特性：每行的元素从左到右升序排列，每列的元素从上到下升序排列。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「矩阵」在「搜索二维矩阵 II」中的标准建模方式：从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "从右上角出发的贪心观察：右上角元素是\"当前行最大、当前列最小\"的特殊位置。如果target小于当前元素，说明target不可能在当前列（因为当前列最小值都比target大），左移排除一列。如果target大于当前元素，说明target不可能在当前行（因为当前行最大值都比target小），下移排除一行。每次排除一行或一列，时间O(m+n)。",
    "hints": {
      "level1": "在行列都升序的矩阵中搜索target。",
      "level2": "从右上角出发：大于target左移，小于target下移。O(m+n)。",
      "level3": "遍历。",
      "level4": "贪心搜索O(m+n)。",
      "level5": "i=0,j=n-1; while i<m and j>=0: if matrix[i][j]==target: return True; elif>target: j--; else: i++",
      "level6": "# 核心思路：从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 target=5 在矩阵中 检查代码。\nclass Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        m, n = len(matrix), len(matrix[0])\n        row, col = 0, n - 1  # 右上角\n\n        while row < m and col >= 0:\n            if matrix[row][col] == target:\n                return True\n            elif matrix[row][col] > target:\n                col -= 1  # 当前列下面更大，整列可排除\n            else:\n                row += 1  # 当前行左边更小，整行可排除\n\n        return False"
    },
    "bruteForceIdea": "暴力思路：遍历整个矩阵检查每个元素。时间O(m*n)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。 行号最多增加 m 次，列号最多减少 n 次。",
    "pseudocode": "1. 先明确坐标含义和行列边界。\n2. 利用矩阵的排序、层次或方向性质排除范围。\n3. 更新坐标时保证不会越界和重复访问。\n4. 用 1×1、单行、单列样例检查。",
    "solutionCode": "# 核心思路：从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 target=5 在矩阵中 检查代码。\nclass Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        m, n = len(matrix), len(matrix[0])\n        row, col = 0, n - 1  # 右上角\n\n        while row < m and col >= 0:\n            if matrix[row][col] == target:\n                return True\n            elif matrix[row][col] > target:\n                col -= 1  # 当前列下面更大，整列可排除\n            else:\n                row += 1  # 当前行左边更小，整行可排除\n\n        return False",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "行列下标写反。",
      "边界判断漏掉单行单列。",
      "原地标记后忘记恢复或影响后续搜索。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「搜索二维矩阵 II」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 73,
    "leetcodeId": 279,
    "title": "完全平方数",
    "titleEn": "Perfect Squares",
    "slug": "perfect-squares",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 73,
    "externalUrl": "https://leetcode.cn/problems/perfect-squares/",
    "summary": "给定一个整数n，返回和为n的完全平方数的最少数量。完全平方数是一个整数，其值等于另一个整数的平方。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「动态规划」在「完全平方数」中的标准建模方式：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "完全背包DP：每个完全平方数（1,4,9,16...）可以用无限次，这是完全背包问题。dp[i]=组成i的最少完全平方数数量。对于每个i，尝试所有完全平方数j*j，dp[i]=min(dp[i-j*j]+1)。这和零钱兑换的思路完全一样，只是\"硬币面额\"变成了完全平方数。",
    "hints": {
      "level1": "完全平方数之和等于n的最少个数。比如12=4+4+4，答案是3。",
      "level2": "dp[i]=min(dp[i-j*j]+1)。完全背包，和零钱兑换思路一样。",
      "level3": "递归。",
      "level4": "DP。",
      "level5": "dp=[0]+[inf]*n; for i in 1..n+1: for j: if j*j<=i: dp[i]=min(dp[i],dp[i-j*j]+1)",
      "level6": "# 核心思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=12 检查代码。\nclass Solution:\n    def numSquares(self, n: int) -> int:\n        dp = [float('inf')] * (n + 1)\n        dp[0] = 0\n\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        for square in squares:\n            for amount in range(square, n + 1):\n                dp[amount] = min(dp[amount], dp[amount - square] + 1)\n\n        return dp[n]"
    },
    "bruteForceIdea": "递归：对于n，尝试减去每个完全平方数，递归求剩余部分的最少数量。指数时间。",
    "optimizedIdea": "优化思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=12 检查代码。\nclass Solution:\n    def numSquares(self, n: int) -> int:\n        dp = [float('inf')] * (n + 1)\n        dp[0] = 0\n\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        for square in squares:\n            for amount in range(square, n + 1):\n                dp[amount] = min(dp[amount], dp[amount - square] + 1)\n\n        return dp[n]",
    "complexity": {
      "time": "O(n√n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「完全平方数」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 74,
    "leetcodeId": 283,
    "title": "移动零",
    "titleEn": "Move Zeroes",
    "slug": "move-zeroes",
    "difficulty": "简单",
    "category": "双指针",
    "tags": [
      "双指针",
      "数组"
    ],
    "order": 74,
    "externalUrl": "https://leetcode.cn/problems/move-zeroes/",
    "summary": "给定一个数组nums，编写一个函数将所有0移动到数组末尾，同时保持非零元素的相对顺序。必须原地操作。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「双指针」在「移动零」中的标准建模方式：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "快慢指针的核心思想：慢指针指向\"下一个非零元素应该放的位置\"，快指针负责扫描整个数组。当快指针遇到非零元素时，把它放到慢指针的位置，然后慢指针前进一步。扫描结束后，从慢指针到末尾全部填0。这样每个非零元素只被移动一次，时间O(n)。",
    "hints": {
      "level1": "把所有0移到数组末尾，保持非零元素的相对顺序。必须原地操作。",
      "level2": "快慢指针：slow记录下一个非零该放的位置，fast扫描。遇到非零就放到slow位置。",
      "level3": "新数组。",
      "level4": "快慢指针原地。",
      "level5": "slow=0; for fast: if nums[fast]!=0: nums[slow]=nums[fast]; slow++; 补0",
      "level6": "# 核心思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[0,1,0,3,12] 检查代码。\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        slow = 0\n\n        # 先把所有非零元素按原相对顺序放到前面\n        for x in nums:\n            if x != 0:\n                nums[slow] = x\n                slow += 1\n\n        # 剩下的位置补 0\n        for i in range(slow, len(nums)):\n            nums[i] = 0"
    },
    "bruteForceIdea": "创建一个新数组，先把原数组中所有非零元素按顺序放进去，然后在末尾补0到原数组长度。时间O(n)，空间O(n)。但这不符合\"原地操作\"的要求。",
    "optimizedIdea": "优化思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先明确两个指针分别代表什么边界。\n2. 证明每次移动哪一个指针不会漏答案。\n3. 在循环内先更新答案，再移动指针。\n4. 用最小长度、单调数组、重复值样例检查。",
    "solutionCode": "# 核心思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[0,1,0,3,12] 检查代码。\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        slow = 0\n\n        # 先把所有非零元素按原相对顺序放到前面\n        for x in nums:\n            if x != 0:\n                nums[slow] = x\n                slow += 1\n\n        # 剩下的位置补 0\n        for i in range(slow, len(nums)):\n            nums[i] = 0",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「移动零」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 75,
    "leetcodeId": 287,
    "title": "寻找重复数",
    "titleEn": "Find the Duplicate Number",
    "slug": "find-the-duplicate-number",
    "difficulty": "中等",
    "category": "技巧",
    "tags": [
      "数组",
      "双指针"
    ],
    "order": 75,
    "externalUrl": "https://leetcode.cn/problems/find-the-duplicate-number/",
    "summary": "给定一个包含n+1个整数的数组nums，其数字都在1到n之间（包括1和n），可知至少存在一个重复的整数。假设nums只有一个重复的整数，返回这个重复的数。不能修改数组，只能用O(1)额外空间。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握Floyd判圈算法在数组上的应用：把数组看成隐式链表。",
    "whyThisPattern": "把数组看成隐式链表的巧妙思路：数组下标i指向nums[i]。比如[1,3,4,2,2]，0->1->3->2->4->2->4->2...形成环。因为有两个位置指向同一个值（下标3和4都指向2），所以一定有环，且环的入口就是重复数。用Floyd判圈算法找环入口：①快慢指针找相遇点 ②从起点和相遇点同步走，再次相遇即为入口。",
    "hints": {
      "level1": "n+1个数范围[1,n]，找唯一重复数。不能改数组O(1)空间。",
      "level2": "数组看成链表i->nums[i]，重复数=环入口。Floyd判圈。",
      "level3": "哈希集合。",
      "level4": "Floyd判圈。",
      "level5": "slow=fast=nums[0]; while True: slow=nums[slow]; fast=nums[nums[fast]]; if slow==fast: break; slow=nums[0]; while slow!=fast: slow=nums[slow]; fast=nums[fast]; return slow",
      "level6": "# 核心思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,4,2,2] 检查代码。\nclass Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        slow = fast = nums[0]\n\n        # 第一阶段：快慢指针在环内相遇\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast:\n                break\n\n        # 第二阶段：从起点和相遇点同步走，入口就是重复数\n        finder = nums[0]\n        while finder != slow:\n            finder = nums[finder]\n            slow = nums[slow]\n\n        return finder"
    },
    "bruteForceIdea": "用哈希集合记录已出现的数字，第一个重复的就是答案。时间O(n)，空间O(n)。",
    "optimizedIdea": "优化思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,4,2,2] 检查代码。\nclass Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        slow = fast = nums[0]\n\n        # 第一阶段：快慢指针在环内相遇\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast:\n                break\n\n        # 第二阶段：从起点和相遇点同步走，入口就是重复数\n        finder = nums[0]\n        while finder != slow:\n            finder = nums[finder]\n            slow = nums[slow]\n\n        return finder",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「寻找重复数」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 76,
    "leetcodeId": 297,
    "title": "二叉树的序列化与反序列化",
    "titleEn": "Serialize and Deserialize Binary Tree",
    "slug": "serialize-and-deserialize-binary-tree",
    "difficulty": "困难",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "设计"
    ],
    "order": 76,
    "externalUrl": "https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/",
    "summary": "设计一个算法，实现序列化和反序列化二叉树。序列化是将二叉树转换为字符串，反序列化是将字符串转换为二叉树。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二叉树」在「二叉树的序列化与反序列化」中的标准建模方式：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "序列化：用前序遍历把二叉树转成字符串，空节点用\"#\"标记，节点间用\",\"分隔。比如\"1,2,#,#,3,4,#,#,5,#,#\"。反序列化：把字符串按\",\"分割成数组，然后递归构建：读到一个值就创建节点，递归构建左子树和右子树，读到\"#\"返回null。前序遍历的顺序（根->左->右）和递归构建的顺序天然匹配。",
    "hints": {
      "level1": "实现二叉树的序列化（转字符串）和反序列化（字符串转树）。",
      "level2": "前序遍历序列化+递归反序列化。空节点用#标记。",
      "level3": "层序遍历。",
      "level4": "前序+递归。",
      "level5": "serialize: 前序遍历拼字符串; deserialize: split后递归构建",
      "level6": "# 核心思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Codec:\n    def serialize(self, root):\n        vals = []\n\n        def dfs(node):\n            if not node:\n                vals.append('#')\n                return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n\n        dfs(root)\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        vals = deque(data.split(','))\n\n        def dfs():\n            val = vals.popleft()\n            if val == '#':\n                return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n\n        return dfs()"
    },
    "bruteForceIdea": "暴力思路：层序遍历序列化，用队列反序列化。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "优化思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Codec:\n    def serialize(self, root):\n        vals = []\n\n        def dfs(node):\n            if not node:\n                vals.append('#')\n                return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n\n        dfs(root)\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        vals = deque(data.split(','))\n\n        def dfs():\n            val = vals.popleft()\n            if val == '#':\n                return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n\n        return dfs()",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的序列化与反序列化」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 77,
    "leetcodeId": 300,
    "title": "最长递增子序列",
    "titleEn": "Longest Increasing Subsequence",
    "slug": "longest-increasing-subsequence",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 77,
    "externalUrl": "https://leetcode.cn/problems/longest-increasing-subsequence/",
    "summary": "给你一个整数数组nums，找到其中最长严格递增子序列的长度。子序列是不连续的。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握O(n^2)DP和O(nlogn)贪心+二分两种方法。",
    "whyThisPattern": "DP：dp[i]=以nums[i]结尾的LIS长度。dp[i]=max(dp[j]+1) for j<i and nums[j]<nums[i]。贪心+二分：维护一个数组tail，tail[i]表示长度为i+1的递增子序列的最小末尾。",
    "hints": {
      "level1": "最长递增子序列LIS。",
      "level2": "dp[i]=max(dp[j]+1)。贪心+二分。",
      "level3": "枚举子序列。",
      "level4": "DP或贪心+二分。",
      "level5": "方法一DP: dp=[1]*n; for i: for j<i: if nums[j]<nums[i]: dp[i]=max(dp[i],dp[j]+1); return max(dp)",
      "level6": "# 核心思路：tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[10,9,2,5,3,7,101,18] 检查代码。\nimport bisect\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n\n        for x in nums:\n            # 严格递增：找第一个 >= x 的位置替换\n            pos = bisect.bisect_left(tails, x)\n            if pos == len(tails):\n                tails.append(x)\n            else:\n                tails[pos] = x\n\n        return len(tails)"
    },
    "bruteForceIdea": "暴力思路：枚举所有子序列O(2^n)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "DP O(n^2)或贪心+二分O(nlogn)。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[10,9,2,5,3,7,101,18] 检查代码。\nimport bisect\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n\n        for x in nums:\n            # 严格递增：找第一个 >= x 的位置替换\n            pos = bisect.bisect_left(tails, x)\n            if pos == len(tails):\n                tails.append(x)\n            else:\n                tails[pos] = x\n\n        return len(tails)",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最长递增子序列」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 78,
    "leetcodeId": 309,
    "title": "最佳买卖股票时机含冷冻期",
    "titleEn": "Best Time to Buy and Sell Stock with Cooldown",
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 78,
    "externalUrl": "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    "summary": "给定一个整数数组prices，其中prices[i]是第i天的股票价格。设计一个算法计算最大利润，含冷冻期（卖出后第二天不能买入）。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握状态机DP：用多个状态描述不同的持有/交易状态。",
    "whyThisPattern": "三状态：持有(hold)、冷冻期(cooldown)、非冷冻期(rest)。状态转移：hold=max(hold, rest-price); cooldown=hold+price; rest=max(rest, cooldown)。",
    "hints": {
      "level1": "含冷冻期的股票买卖。",
      "level2": "三状态DP：hold,cooldown,rest。",
      "level3": "DFS。",
      "level4": "状态机DP。",
      "level5": "hold=-prices[0]; cooldown=rest=0; for i: prev=hold; hold=max(hold,rest-prices[i]); cooldown=prev+prices[i]); rest=max(rest,cooldown)",
      "level6": "# 核心思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[1,2,3,0,2] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        hold = -prices[0]  # 手里持有股票的最大收益\n        sold = 0           # 今天刚卖出后的最大收益\n        rest = 0           # 不持股且不处于刚卖出状态的最大收益\n\n        for price in prices[1:]:\n            prev_hold, prev_sold, prev_rest = hold, sold, rest\n            hold = max(prev_hold, prev_rest - price)\n            sold = prev_hold + price\n            rest = max(prev_rest, prev_sold)\n\n        return max(sold, rest)"
    },
    "bruteForceIdea": "暴力思路：DFS搜索所有买卖序列。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "优化思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[1,2,3,0,2] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        hold = -prices[0]  # 手里持有股票的最大收益\n        sold = 0           # 今天刚卖出后的最大收益\n        rest = 0           # 不持股且不处于刚卖出状态的最大收益\n\n        for price in prices[1:]:\n            prev_hold, prev_sold, prev_rest = hold, sold, rest\n            hold = max(prev_hold, prev_rest - price)\n            sold = prev_hold + price\n            rest = max(prev_rest, prev_sold)\n\n        return max(sold, rest)",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最佳买卖股票时机含冷冻期」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 79,
    "leetcodeId": 312,
    "title": "戳气球",
    "titleEn": "Burst Balloons",
    "slug": "burst-balloons",
    "difficulty": "困难",
    "category": "多维动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 79,
    "externalUrl": "https://leetcode.cn/problems/burst-balloons/",
    "summary": "有n个气球，每次戳破一个气球获得nums[left]*nums[i]*nums[right]个硬币。求最多硬币数。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「多维动态规划」在「戳气球」中的标准建模方式：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "正向思考复杂（戳破后相邻关系变化）。逆向：最后戳破k，那么k的左右就是固定的left和right。dp[i][j]=max(dp[i][k]+dp[k][j]+nums[i]*nums[k]*nums[j])。",
    "hints": {
      "level1": "戳气球求最大硬币。",
      "level2": "区间DP逆向：最后戳破哪个？",
      "level3": "枚举顺序O(n!)。",
      "level4": "区间DP O(n^3)。",
      "level5": "首尾加1; for length: for i: for k: dp[i][j]=max(dp[i][k]+dp[k][j]+nums[i]*nums[k]*nums[j])",
      "level6": "# 核心思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,1,5,8] 检查代码。\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        arr = [1] + nums + [1]\n        n = len(arr)\n        dp = [[0] * n for _ in range(n)]\n\n        # length 是开区间 (left, right) 的跨度\n        for length in range(2, n):\n            for left in range(0, n - length):\n                right = left + length\n                for k in range(left + 1, right):\n                    coins = arr[left] * arr[k] * arr[right]\n                    dp[left][right] = max(dp[left][right], dp[left][k] + coins + dp[k][right])\n\n        return dp[0][n - 1]"
    },
    "bruteForceIdea": "暴力思路：枚举所有戳破顺序O(n!)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "优化思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,1,5,8] 检查代码。\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        arr = [1] + nums + [1]\n        n = len(arr)\n        dp = [[0] * n for _ in range(n)]\n\n        # length 是开区间 (left, right) 的跨度\n        for length in range(2, n):\n            for left in range(0, n - length):\n                right = left + length\n                for k in range(left + 1, right):\n                    coins = arr[left] * arr[k] * arr[right]\n                    dp[left][right] = max(dp[left][right], dp[left][k] + coins + dp[k][right])\n\n        return dp[0][n - 1]",
    "complexity": {
      "time": "O(n³)",
      "space": "O(n²)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「戳气球」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 80,
    "leetcodeId": 322,
    "title": "零钱兑换",
    "titleEn": "Coin Change",
    "slug": "coin-change",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划"
    ],
    "order": 80,
    "externalUrl": "https://leetcode.cn/problems/coin-change/",
    "summary": "给你不同面额的硬币coins和一个总金额amount，编写函数计算并返回可以凑成总金额所需的最少的硬币个数。如果无法凑成，返回-1。每种硬币可以用无限次。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「动态规划」在「零钱兑换」中的标准建模方式：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "完全背包DP的经典应用：每种硬币可以用无限次。dp[i]=凑成金额i的最少硬币数。对于每个金额i，尝试每种硬币coin：如果coin<=i，则dp[i]=min(dp[i], dp[i-coin]+1)。这道题和\"完全平方数\"是同一类问题。初始化dp[0]=0（凑成0需要0个硬币），其他为正无穷。",
    "hints": {
      "level1": "零钱兑换：用coins凑成amount的最少硬币数。每种硬币可以用无限次。",
      "level2": "完全背包DP：dp[i]=min(dp[i-coin]+1)。和完全平方数思路一样。",
      "level3": "递归。",
      "level4": "DP。",
      "level5": "dp=[inf]*(amount+1); dp[0]=0; for i: for coin: if coin<=i: dp[i]=min(dp[i],dp[i-coin]+1)",
      "level6": "# 核心思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 coins=[1,2,5], amount=11 检查代码。\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n\n        for coin in coins:\n            for x in range(coin, amount + 1):\n                dp[x] = min(dp[x], dp[x - coin] + 1)\n\n        return -1 if dp[amount] == amount + 1 else dp[amount]"
    },
    "bruteForceIdea": "递归：对于金额amount，尝试每种硬币，递归求剩余金额的最少硬币数。指数时间。",
    "optimizedIdea": "优化思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 coins=[1,2,5], amount=11 检查代码。\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n\n        for coin in coins:\n            for x in range(coin, amount + 1):\n                dp[x] = min(dp[x], dp[x - coin] + 1)\n\n        return -1 if dp[amount] == amount + 1 else dp[amount]",
    "complexity": {
      "time": "O(amount·len(coins))",
      "space": "O(amount)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「零钱兑换」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 81,
    "leetcodeId": 337,
    "title": "打家劫舍 III",
    "titleEn": "House Robber III",
    "slug": "house-robber-iii",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "动态规划"
    ],
    "order": 81,
    "externalUrl": "https://leetcode.cn/problems/house-robber-iii/",
    "summary": "二叉树中的打家劫舍。相邻节点不能同时偷。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握树形DP：后序遍历返回两个状态（偷/不偷）。",
    "whyThisPattern": "树形DP的核心：后序遍历，每个节点返回两个值（偷当前节点的最大值，不偷当前节点的最大值）。偷当前节点：node.val + 左不偷 + 右不偷（子节点不能偷）。不偷当前节点：max(左偷,左不偷) + max(右偷,右不偷)（子节点可偷可不偷，取最大值）。最终答案=max(根偷,根不偷)。",
    "hints": {
      "level1": "二叉树打家劫舍。相邻节点（父子）不能同时偷。",
      "level2": "后序遍历返回(偷,不偷)两个状态。树形DP。",
      "level3": "DFS。",
      "level4": "树形DP。",
      "level5": "def helper(root): if not root: return 0,0; lr,ln=helper(left); rr,rn=helper(right); return root.val+ln+rn, max(lr,ln)+max(rr,rn)",
      "level6": "# 核心思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[3,2,3,null,3,null,1] 检查代码。\nclass Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        def dfs(node: Optional[TreeNode]):\n            if not node:\n                return (0, 0)\n\n            left_rob, left_not = dfs(node.left)\n            right_rob, right_not = dfs(node.right)\n\n            rob_cur = node.val + left_not + right_not\n            not_rob_cur = max(left_rob, left_not) + max(right_rob, right_not)\n            return (rob_cur, not_rob_cur)\n\n        return max(dfs(root))"
    },
    "bruteForceIdea": "DFS枚举所有可能的偷取组合（每个节点偷或不偷）。指数时间。",
    "optimizedIdea": "优化思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[3,2,3,null,3,null,1] 检查代码。\nclass Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        def dfs(node: Optional[TreeNode]):\n            if not node:\n                return (0, 0)\n\n            left_rob, left_not = dfs(node.left)\n            right_rob, right_not = dfs(node.right)\n\n            rob_cur = node.val + left_not + right_not\n            not_rob_cur = max(left_rob, left_not) + max(right_rob, right_not)\n            return (rob_cur, not_rob_cur)\n\n        return max(dfs(root))",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「打家劫舍 III」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 82,
    "leetcodeId": 338,
    "title": "比特位计数",
    "titleEn": "Counting Bits",
    "slug": "counting-bits",
    "difficulty": "简单",
    "category": "动态规划",
    "tags": [
      "动态规划",
      "位运算"
    ],
    "order": 82,
    "externalUrl": "https://leetcode.cn/problems/counting-bits/",
    "summary": "给定一个整数n，返回0到n之间每个数字的二进制表示中1的个数。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握位运算DP：dp[i]=dp[i>>1]+(i&1)。",
    "whyThisPattern": "位运算DP的核心观察：一个数i的二进制中1的个数，等于i右移一位(i>>1)的1的个数，加上最低位是否为1(i&1)。这是因为右移一位去掉最低位，而最低位是1时count加1。递推关系：dp[i]=dp[i>>1]+(i&1)。",
    "hints": {
      "level1": "返回[0,1,...,n]每个数的二进制中1的个数。比如n=5，返回[0,1,1,2,1,2]。",
      "level2": "dp[i]=dp[i>>1]+(i&1)。去掉最低位的1个数+最低位是否为1。",
      "level3": "逐个计算。",
      "level4": "DP。",
      "level5": "dp=[0]*(n+1); for i in 1..n+1: dp[i]=dp[i>>1]+(i&1)",
      "level6": "# 核心思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=2 检查代码。\nclass Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n\n        for i in range(1, n + 1):\n            ans[i] = ans[i >> 1] + (i & 1)\n\n        return ans"
    },
    "bruteForceIdea": "对0到n的每个数，逐一计算其二进制中1的个数（不断除2取余）。时间O(n*logn)，空间O(n)。",
    "optimizedIdea": "优化思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=2 检查代码。\nclass Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n\n        for i in range(1, n + 1):\n            ans[i] = ans[i >> 1] + (i & 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「比特位计数」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 83,
    "leetcodeId": 347,
    "title": "前 K 个高频元素",
    "titleEn": "Top K Frequent Elements",
    "slug": "top-k-frequent-elements",
    "difficulty": "中等",
    "category": "堆",
    "tags": [
      "堆",
      "哈希表"
    ],
    "order": 83,
    "externalUrl": "https://leetcode.cn/problems/top-k-frequent-elements/",
    "summary": "给定一个整数数组nums和一个整数k，返回出现频率前k高的元素。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「堆」在「前 K 个高频元素」中的标准建模方式：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "Top-K问题的两种经典解法：①最小堆：统计频率后，维护一个大小为k的最小堆。遍历频率，堆满时如果当前频率大于堆顶则替换堆顶。时间O(n*logk)。②桶排序：用频率作为下标建桶，从高频到低频收集元素。时间O(n)。堆适合k较小的场景，桶排序适合频率范围不大的场景。",
    "hints": {
      "level1": "返回频率前k高的元素。",
      "level2": "最小堆O(n*logk)或桶排序O(n)。",
      "level3": "排序。",
      "level4": "堆或桶排序。",
      "level5": "import heapq,Counter; c=Counter(nums); return heapq.nlargest(k,c.keys(),key=c.get)",
      "level6": "# 核心思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,2,2,3], k=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n\n        for num, freq in count.items():\n            buckets[freq].append(num)\n\n        ans = []\n        for freq in range(len(buckets) - 1, 0, -1):\n            for num in buckets[freq]:\n                ans.append(num)\n                if len(ans) == k:\n                    return ans\n\n        return ans"
    },
    "bruteForceIdea": "统计频率后按频率排序取前k个。时间O(n*logn)。",
    "optimizedIdea": "优化思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先说明为什么只需要维护前 k 个或当前最优。\n2. 确定用小顶堆还是大顶堆。\n3. 保持堆大小或弹出规则。\n4. 用 k=1、重复值、频率相同样例检查。",
    "solutionCode": "# 核心思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,2,2,3], k=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n\n        for num, freq in count.items():\n            buckets[freq].append(num)\n\n        ans = []\n        for freq in range(len(buckets) - 1, 0, -1):\n            for num in buckets[freq]:\n                ans.append(num)\n                if len(ans) == k:\n                    return ans\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "小顶堆/大顶堆方向选反。",
      "堆大小没有限制，复杂度退化。",
      "重复值和频率相同的情况没有想清楚。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「前 K 个高频元素」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 84,
    "leetcodeId": 394,
    "title": "字符串解码",
    "titleEn": "Decode String",
    "slug": "decode-string",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "栈",
      "递归"
    ],
    "order": 84,
    "externalUrl": "https://leetcode.cn/problems/decode-string/",
    "summary": "给定一个经过编码的字符串，返回它解码后的字符串。编码规则：k[encoded_string]表示方括号中的字符串重复k次。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「栈」在「字符串解码」中的标准建模方式：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "栈的核心思想：遇到右括号]时，需要回溯找到匹配的左括号[，然后获取重复次数。栈天然支持这种\"后进先出\"的回溯操作。具体做法：遍历字符，非]的字符全部入栈；遇到]时，依次弹出字符直到遇到[，得到要重复的字符串；然后继续弹出数字得到重复次数；最后把重复后的字符串重新入栈。",
    "hints": {
      "level1": "解码字符串。3[a2[c]]=\"accaccacc\"。k[encoded]表示encoded重复k次。可以嵌套。",
      "level2": "栈：遇到]弹出到[，获取字符串和数字，重复后入栈。",
      "level3": "递归。",
      "level4": "栈。",
      "level5": "stack=[]; for c: if c!=\"]\": stack.append(c) else: substr=弹出到\"[\"; num=弹出数字; stack.append(substr*num)",
      "level6": "# 核心思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"3[a]2[bc]\" 检查代码。\nclass Solution:\n    def decodeString(self, s: str) -> str:\n        stack = []\n        cur = ''\n        num = 0\n\n        for ch in s:\n            if ch.isdigit():\n                num = num * 10 + int(ch)\n            elif ch == '[':\n                stack.append((cur, num))\n                cur = ''\n                num = 0\n            elif ch == ']':\n                prev, times = stack.pop()\n                cur = prev + cur * times\n            else:\n                cur += ch\n\n        return cur"
    },
    "bruteForceIdea": "递归解析：遇到数字时记录次数，遇到[时递归解析内部字符串，遇到]时返回。需要管理递归的嵌套层级。",
    "optimizedIdea": "优化思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"3[a]2[bc]\" 检查代码。\nclass Solution:\n    def decodeString(self, s: str) -> str:\n        stack = []\n        cur = ''\n        num = 0\n\n        for ch in s:\n            if ch.isdigit():\n                num = num * 10 + int(ch)\n            elif ch == '[':\n                stack.append((cur, num))\n                cur = ''\n                num = 0\n            elif ch == ']':\n                prev, times = stack.pop()\n                cur = prev + cur * times\n            else:\n                cur += ch\n\n        return cur",
    "complexity": {
      "time": "O(输出字符串长度)",
      "space": "O(嵌套深度+输出长度)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「字符串解码」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 85,
    "leetcodeId": 399,
    "title": "除法求值",
    "titleEn": "Evaluate Division",
    "slug": "evaluate-division",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "图"
    ],
    "order": 85,
    "externalUrl": "https://leetcode.cn/problems/evaluate-division/",
    "summary": "给定变量间的除法关系，求查询结果。equations=[[\"a\",\"b\"]], values=[2.0]表示a/b=2.0。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「图论」在「除法求值」中的标准建模方式：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "图建模的巧妙应用：把除法关系建模为有向加权图。a/b=k建两条边：a->b权重k，b->a权重1/k。这样a/c的值就是从a到c的路径上所有权重的乘积。查询时用BFS找路径并累乘权重。如果起点或终点不在图中，或者无法到达，返回-1。",
    "hints": {
      "level1": "除法求值：已知a/b=2, b/c=3，求a/c=6。",
      "level2": "建有向加权图，BFS找路径累乘权重。",
      "level3": "并查集。",
      "level4": "建图+BFS。",
      "level5": "建图; BFS从start到end累乘权重",
      "level6": "# 核心思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 a/b=2,b/c=3, 查询 a/c 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        graph = defaultdict(list)\n        for (a, b), val in zip(equations, values):\n            graph[a].append((b, val))\n            graph[b].append((a, 1.0 / val))\n\n        def dfs(cur: str, target: str, product: float, visited: set) -> float:\n            if cur == target:\n                return product\n            visited.add(cur)\n            for nxt, weight in graph[cur]:\n                if nxt not in visited:\n                    res = dfs(nxt, target, product * weight, visited)\n                    if res != -1.0:\n                        return res\n            return -1.0\n\n        ans = []\n        for a, b in queries:\n            if a not in graph or b not in graph:\n                ans.append(-1.0)\n            else:\n                ans.append(dfs(a, b, 1.0, set()))\n        return ans"
    },
    "bruteForceIdea": "并查集（Union-Find）：维护每个变量到其根节点的比值关系。",
    "optimizedIdea": "优化思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先把问题翻译成点和边。\n2. 选择 DFS/BFS/拓扑排序/并查集。\n3. 维护 visited、入度或父节点等状态。\n4. 用不连通、有环、单点图样例检查。",
    "solutionCode": "# 核心思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 a/b=2,b/c=3, 查询 a/c 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        graph = defaultdict(list)\n        for (a, b), val in zip(equations, values):\n            graph[a].append((b, val))\n            graph[b].append((a, 1.0 / val))\n\n        def dfs(cur: str, target: str, product: float, visited: set) -> float:\n            if cur == target:\n                return product\n            visited.add(cur)\n            for nxt, weight in graph[cur]:\n                if nxt not in visited:\n                    res = dfs(nxt, target, product * weight, visited)\n                    if res != -1.0:\n                        return res\n            return -1.0\n\n        ans = []\n        for a, b in queries:\n            if a not in graph or b not in graph:\n                ans.append(-1.0)\n            else:\n                ans.append(dfs(a, b, 1.0, set()))\n        return ans",
    "complexity": {
      "time": "O(E+Q·(V+E))",
      "space": "O(V+E)"
    },
    "commonMistakes": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「除法求值」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 86,
    "leetcodeId": 406,
    "title": "根据身高重建队列",
    "titleEn": "Queue Reconstruction by Height",
    "slug": "queue-reconstruction-by-height",
    "difficulty": "中等",
    "category": "贪心",
    "tags": [
      "贪心",
      "排序"
    ],
    "order": 86,
    "externalUrl": "https://leetcode.cn/problems/queue-reconstruction-by-height/",
    "summary": "给定一个打乱顺序的队列people，每个people[i]=[hi,ki]表示身高hi前面至少有ki个身高>=hi的人。重建队列。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「贪心」在「根据身高重建队列」中的标准建模方式：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "贪心策略的关键洞察：先安排身高最高的人，因为他们不受其他人的影响（前面不可能有比他们更高的人）。对于相同身高的人，ki小的先安排（因为ki小意味着前面需要的人少，约束更弱）。排序后依次插入：按身高降序、ki升序排序，然后每个人插入到结果数组的第ki个位置。这样后插入的人（更矮）不会影响先插入的人的ki值。",
    "hints": {
      "level1": "根据身高和前面人数重建队列。people[i]=[hi,ki]表示身高hi，前面至少有ki个身高>=hi的人。",
      "level2": "贪心：先排高个子（他们不受影响），再按ki插入到对应位置。",
      "level3": "全排列。",
      "level4": "贪心。",
      "level5": "people.sort(key=lambda x:(-x[0],x[1])); result=[]; for p: result.insert(p[1],p)",
      "level6": "# 核心思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]] 检查代码。\nclass Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        # 高个先排；同身高 k 小的先排\n        people.sort(key=lambda x: (-x[0], x[1]))\n        ans = []\n\n        for person in people:\n            ans.insert(person[1], person)\n\n        return ans"
    },
    "bruteForceIdea": "全排列尝试所有可能的排列顺序，检查每个排列是否满足所有人的ki约束。时间O(n!*n)，完全不可行。",
    "optimizedIdea": "优化思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先说明局部最优选择是什么。\n2. 证明这个选择不会损失全局最优。\n3. 遍历中维护覆盖范围、最优候选或排序结构。\n4. 用反例尝试推翻贪心，确认边界。",
    "solutionCode": "# 核心思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]] 检查代码。\nclass Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        # 高个先排；同身高 k 小的先排\n        people.sort(key=lambda x: (-x[0], x[1]))\n        ans = []\n\n        for person in people:\n            ans.insert(person[1], person)\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「根据身高重建队列」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 87,
    "leetcodeId": 416,
    "title": "分割等和子集",
    "titleEn": "Partition Equal Subset Sum",
    "slug": "partition-equal-subset-sum",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划",
      "背包"
    ],
    "order": 87,
    "externalUrl": "https://leetcode.cn/problems/partition-equal-subset-sum/",
    "summary": "给你一个只包含正整数的非空数组nums。判断是否可以将该数组分割为两个元素和相等的子集。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握0-1背包DP：dp[j]表示能否凑成和j。",
    "whyThisPattern": "这道题的本质是0-1背包问题：从数组中选择一些数，使得它们的和恰好等于sum/2。每个数只能选一次（0-1背包），目标是凑成指定的和。dp[j]表示能否用数组中的数凑成和j。遍历每个数时，从后往前更新dp数组（避免同一个数被重复使用）。",
    "hints": {
      "level1": "能否将数组分成两个和相等的子集。等价于：能否凑成sum/2。",
      "level2": "0-1背包：dp[j]=能否凑成和j。每个数选或不选。",
      "level3": "递归。",
      "level4": "DP背包。",
      "level5": "target=sum//2; dp=[False]*(target+1); dp[0]=True; for num: for j=target..num: dp[j]=dp[j] or dp[j-num]",
      "level6": "# 核心思路：问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,5,11,5] 检查代码。\nclass Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2 == 1:\n            return False\n\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n\n        for num in nums:\n            # 0/1 背包必须倒序，防止同一个 num 被重复使用\n            for cap in range(target, num - 1, -1):\n                dp[cap] = dp[cap] or dp[cap - num]\n\n        return dp[target]"
    },
    "bruteForceIdea": "递归：对每个数，选择或不选择，检查是否存在一种选择使得和等于sum/2。时间O(2^n)。",
    "optimizedIdea": "问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。 target=sum(nums)/2；每个数只能用一次，所以容量倒序遍历。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,5,11,5] 检查代码。\nclass Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2 == 1:\n            return False\n\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n\n        for num in nums:\n            # 0/1 背包必须倒序，防止同一个 num 被重复使用\n            for cap in range(target, num - 1, -1):\n                dp[cap] = dp[cap] or dp[cap - num]\n\n        return dp[target]",
    "complexity": {
      "time": "O(n·target)",
      "space": "O(target)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「分割等和子集」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 88,
    "leetcodeId": 437,
    "title": "路径总和 III",
    "titleEn": "Path Sum III",
    "slug": "path-sum-iii",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "前缀和"
    ],
    "order": 88,
    "externalUrl": "https://leetcode.cn/problems/path-sum-iii/",
    "summary": "给定一棵二叉树和一个整数targetSum，求路径和等于targetSum的路径数目。路径可以从任意节点开始到任意节点结束。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二叉树」在「路径总和 III」中的标准建模方式：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "前缀和+DFS的精妙结合：从根到当前节点的路径上，前缀和为curr_sum。如果存在某个祖先节点的前缀和为prev_sum，使得curr_sum-prev_sum=targetSum，则从该祖先的下一个节点到当前节点的路径和等于targetSum。用哈希表记录每个前缀和出现的次数，O(1)查找满足条件的祖先数量。注意回溯时要减去当前节点的前缀和。",
    "hints": {
      "level1": "路径总和III：路径可以从任意节点开始到任意节点结束，和等于targetSum。",
      "level2": "前缀和+DFS+哈希表：curr-prev=target则有满足条件的路径。",
      "level3": "对每个节点DFS。",
      "level4": "前缀和O(n)。",
      "level5": "dfs(node,curr): curr+=node.val; count=map.get(curr-target,0); map[curr]+=1; count+=dfs(left)+dfs(right); map[curr]-=1; return count",
      "level6": "# 核心思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        prefix = defaultdict(int)\n        prefix[0] = 1\n        ans = 0\n\n        def dfs(node: Optional[TreeNode], cur_sum: int) -> None:\n            nonlocal ans\n            if not node:\n                return\n\n            cur_sum += node.val\n            ans += prefix[cur_sum - targetSum]\n\n            prefix[cur_sum] += 1\n            dfs(node.left, cur_sum)\n            dfs(node.right, cur_sum)\n            prefix[cur_sum] -= 1  # 回溯，离开当前路径\n\n        dfs(root, 0)\n        return ans"
    },
    "bruteForceIdea": "对每个节点，DFS计算以它为起点的所有路径和。时间O(n^2)。",
    "optimizedIdea": "优化思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        prefix = defaultdict(int)\n        prefix[0] = 1\n        ans = 0\n\n        def dfs(node: Optional[TreeNode], cur_sum: int) -> None:\n            nonlocal ans\n            if not node:\n                return\n\n            cur_sum += node.val\n            ans += prefix[cur_sum - targetSum]\n\n            prefix[cur_sum] += 1\n            dfs(node.left, cur_sum)\n            dfs(node.right, cur_sum)\n            prefix[cur_sum] -= 1  # 回溯，离开当前路径\n\n        dfs(root, 0)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「路径总和 III」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 89,
    "leetcodeId": 438,
    "title": "找到字符串中所有字母异位词",
    "titleEn": "Find All Anagrams in a String",
    "slug": "find-all-anagrams-in-a-string",
    "difficulty": "中等",
    "category": "滑动窗口",
    "tags": [
      "滑动窗口"
    ],
    "order": 89,
    "externalUrl": "https://leetcode.cn/problems/find-all-anagrams-in-a-string/",
    "summary": "给定两个字符串s1和s2，找到s2中所有s1的字母异位词的起始下标。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「滑动窗口」在「找到字符串中所有字母异位词」中的标准建模方式：固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "定长滑动窗口的经典应用：窗口大小固定为len(s1)，用字符频率数组判断窗口内容是否是s1的异位词（频率相同=异位词）。窗口每次右移一位：右边加入一个字符，左边移除一个字符，然后比较频率数组。这样每个字符只被处理两次（加入和移除），时间O(n)。",
    "hints": {
      "level1": "在s2中找所有s1的字母异位词的起始下标。异位词=字母相同但顺序不同。",
      "level2": "定长滑动窗口+频率数组。窗口大小=len(s1)，滑动时更新频率。",
      "level3": "排序比较。",
      "level4": "滑动窗口。",
      "level5": "频率数组; 窗口滑动时更新频率; 比较频率数组",
      "level6": "# 核心思路：固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"cbaebabacd\", p=\"abc\" 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        m, n = len(s), len(p)\n        if n > m:\n            return []\n\n        need = Counter(p)\n        window = Counter(s[:n])\n        ans = []\n\n        if window == need:\n            ans.append(0)\n\n        for right in range(n, m):\n            left = right - n\n            out = s[left]\n            window[out] -= 1\n            if window[out] == 0:\n                del window[out]\n\n            window[s[right]] += 1\n            if window == need:\n                ans.append(left + 1)\n\n        return ans"
    },
    "bruteForceIdea": "枚举s2中所有长度为len(s1)的子串，对每个子串排序后和排序后的s1比较。时间O(n*m*logm)。",
    "optimizedIdea": "固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。 每个字符进出窗口一次；计数表大小固定。",
    "pseudocode": "1. 明确窗口内维护的条件是什么。\n2. 右指针扩张并更新窗口状态。\n3. 当窗口不满足/已经满足条件时移动左指针。\n4. 每次更新答案时确认窗口左右边界是否闭区间。",
    "solutionCode": "# 核心思路：固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"cbaebabacd\", p=\"abc\" 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        m, n = len(s), len(p)\n        if n > m:\n            return []\n\n        need = Counter(p)\n        window = Counter(s[:n])\n        ans = []\n\n        if window == need:\n            ans.append(0)\n\n        for right in range(n, m):\n            left = right - n\n            out = s[left]\n            window[out] -= 1\n            if window[out] == 0:\n                del window[out]\n\n            window[s[right]] += 1\n            if window == need:\n                ans.append(left + 1)\n\n        return ans",
    "complexity": {
      "time": "O(|s|+|p|)",
      "space": "O(字符集大小)"
    },
    "commonMistakes": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「找到字符串中所有字母异位词」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 90,
    "leetcodeId": 448,
    "title": "找到所有数组中消失的数字",
    "titleEn": "Find All Numbers Disappeared in an Array",
    "slug": "find-all-numbers-disappeared-in-an-array",
    "difficulty": "简单",
    "category": "技巧",
    "tags": [
      "数组"
    ],
    "order": 90,
    "externalUrl": "https://leetcode.cn/problems/find-all-numbers-disappeared-in-an-array/",
    "summary": "给你一个含n个整数的数组nums，其中所有元素都在[1,n]范围内。找出所有[1,n]范围内没有出现在数组中的数字。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「技巧」在「找到所有数组中消失的数字」中的标准建模方式：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "原地哈希的巧妙利用：数组长度为n，元素范围[1,n]。可以把每个数字放到它\"应该在\"的位置：数字i应该在下标i-1的位置。遍历数组，把每个数字交换到正确位置（nums[nums[i]-1]!=nums[i]时交换）。完成后，下标i-1的值不等于i的那些位置就是缺失的数字。时间O(n)，空间O(1)。",
    "hints": {
      "level1": "找[1,n]中没出现在数组中的数字。比如[4,3,2,7,8,2,3,1]缺失[5,6]。",
      "level2": "原地哈希：把每个数放到正确位置，最后检查。",
      "level3": "集合。",
      "level4": "原地交换。",
      "level5": "for i: while nums[nums[i]-1]!=nums[i]: swap; 检查nums[i]!=i+1",
      "level6": "# 核心思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,3,2,7,8,2,3,1] 检查代码。\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for x in nums:\n            idx = abs(x) - 1\n            if nums[idx] > 0:\n                nums[idx] = -nums[idx]\n\n        ans = []\n        for i, x in enumerate(nums):\n            if x > 0:\n                ans.append(i + 1)\n\n        return ans"
    },
    "bruteForceIdea": "用哈希集合记录出现过的数字，然后检查1到n中哪些不在集合中。时间O(n)，空间O(n)。",
    "optimizedIdea": "优化思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,3,2,7,8,2,3,1] 检查代码。\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for x in nums:\n            idx = abs(x) - 1\n            if nums[idx] > 0:\n                nums[idx] = -nums[idx]\n\n        ans = []\n        for i, x in enumerate(nums):\n            if x > 0:\n                ans.append(i + 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「找到所有数组中消失的数字」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 91,
    "leetcodeId": 461,
    "title": "汉明距离",
    "titleEn": "Hamming Distance",
    "slug": "hamming-distance",
    "difficulty": "简单",
    "category": "技巧",
    "tags": [
      "位运算"
    ],
    "order": 91,
    "externalUrl": "https://leetcode.cn/problems/hamming-distance/",
    "summary": "两个整数之间的汉明距离是两个数字对应二进制位不同的位数。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「技巧」在「汉明距离」中的标准建模方式：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "汉明距离=两个数二进制不同位的个数。核心技巧：先异或(x^y)，异或后不同位为1、相同位为0。然后统计异或结果中1的个数就是汉明距离。统计1的个数可以用n&(n-1)消去最低位的1，或者直接右移逐位检查。",
    "hints": {
      "level1": "两个整数的汉明距离=二进制不同位的个数。比如1(01)和4(10)的距离是2。",
      "level2": "异或后统计1的个数。x^y后不同位为1。",
      "level3": "逐位比较。",
      "level4": "异或。",
      "level5": "z=x^y; cnt=0; while z: cnt+=z&1; z>>=1",
      "level6": "# 核心思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 x=1, y=4 检查代码。\nclass Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        z = x ^ y  # 不同的位置为 1\n        count = 0\n        while z:\n            z &= z - 1  # 每次消掉最低位的 1\n            count += 1\n        return count"
    },
    "bruteForceIdea": "逐位比较x和y的二进制表示：从最低位开始，每次比较最后一位是否相同，然后右移。时间O(logn)。",
    "optimizedIdea": "优化思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 x=1, y=4 检查代码。\nclass Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        z = x ^ y  # 不同的位置为 1\n        count = 0\n        while z:\n            z &= z - 1  # 每次消掉最低位的 1\n            count += 1\n        return count",
    "complexity": {
      "time": "O(1)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「汉明距离」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 92,
    "leetcodeId": 494,
    "title": "目标和",
    "titleEn": "Target Sum",
    "slug": "target-sum",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "动态规划",
      "背包"
    ],
    "order": 92,
    "externalUrl": "https://leetcode.cn/problems/target-sum/",
    "summary": "给你一个整数数组nums和一个整数target。向数组中的每个整数前添加+或-，然后串联起所有整数，返回运算结果等于target的方案数。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「动态规划」在「目标和」中的标准建模方式：给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "转化为0-1背包的数学推导：设正数和为x，负数和绝对值为y。则x+y=sum(所有数之和)，x-y=target。解方程得x=(sum+target)/2。问题转化为：从数组中选一些数使其和等于x的方案数。这是0-1背包计数问题：dp[j]+=dp[j-num]。注意：如果(sum+target)是奇数或为负，直接返回0。",
    "hints": {
      "level1": "每个数前加+或-，使表达式等于target的方案数。",
      "level2": "转化为背包：找子集和为(sum+target)/2的方案数。",
      "level3": "DFS。",
      "level4": "背包DP。",
      "level5": "target=(sum+target)//2; dp[0]=1; for num: for j=target..num: dp[j]+=dp[j-num]",
      "level6": "# 核心思路：给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,1,1], target=3 检查代码。\nclass Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 == 1:\n            return 0\n\n        bag = (total + target) // 2\n        dp = [0] * (bag + 1)\n        dp[0] = 1\n\n        for num in nums:\n            for cap in range(bag, num - 1, -1):\n                dp[cap] += dp[cap - num]\n\n        return dp[bag]"
    },
    "bruteForceIdea": "DFS：对每个数尝试+和-两种选择，统计和等于target的方案数。时间O(2^n)。",
    "optimizedIdea": "给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。 bag=(sum+target)/2；0/1 背包计数，容量倒序。",
    "pseudocode": "1. 定义 dp 数组含义，必须能用一句话解释。\n2. 推导递推公式：当前状态从哪些旧状态来。\n3. 确定初始化和遍历顺序。\n4. 用最小规模手推 dp 表验证。",
    "solutionCode": "# 核心思路：给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,1,1], target=3 检查代码。\nclass Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 == 1:\n            return 0\n\n        bag = (total + target) // 2\n        dp = [0] * (bag + 1)\n        dp[0] = 1\n\n        for num in nums:\n            for cap in range(bag, num - 1, -1):\n                dp[cap] += dp[cap - num]\n\n        return dp[bag]",
    "complexity": {
      "time": "O(n·bag)",
      "space": "O(bag)"
    },
    "commonMistakes": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「目标和」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 93,
    "leetcodeId": 538,
    "title": "把二叉搜索树转换为累加树",
    "titleEn": "Convert BST to Greater Tree",
    "slug": "convert-bst-to-greater-tree",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "二叉树",
      "BST"
    ],
    "order": 93,
    "externalUrl": "https://leetcode.cn/problems/convert-bst-to-greater-tree/",
    "summary": "给定一棵二叉搜索树，将其转换为累加树，使每个节点的新值是原值加上所有大于它的节点值之和。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握BST的反向中序遍历（右->根->左），即降序遍历。",
    "whyThisPattern": "BST的中序遍历是升序序列。如果反过来（右->根->左），就是降序序列。降序遍历时，用一个累加变量记录\"已经遍历过的所有节点值之和\"，每个节点的新值=原值+累加值。这样就实现了\"每个节点的新值=原值+所有大于它的节点值之和\"。",
    "hints": {
      "level1": "BST转累加树：每个节点值=原值+所有大于它的节点值之和。",
      "level2": "反向中序遍历（右->根->左）是降序。降序遍历累加即可。",
      "level3": "中序+回写。",
      "level4": "反向中序一遍。",
      "level5": "self.total=0; def rev(node): rev(right); total+=node.val; node.val=total; rev(left)",
      "level6": "# 核心思路：BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8] 检查代码。\nclass Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n\n        def reverse_inorder(node: Optional[TreeNode]) -> None:\n            nonlocal total\n            if not node:\n                return\n            reverse_inorder(node.right)\n            total += node.val\n            node.val = total\n            reverse_inorder(node.left)\n\n        reverse_inorder(root)\n        return root"
    },
    "bruteForceIdea": "先中序遍历得到升序数组，然后从后往前累加，再回写到树中。需要两次遍历。",
    "optimizedIdea": "BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。 每个节点访问一次；递归栈为树高。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8] 检查代码。\nclass Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n\n        def reverse_inorder(node: Optional[TreeNode]) -> None:\n            nonlocal total\n            if not node:\n                return\n            reverse_inorder(node.right)\n            total += node.val\n            node.val = total\n            reverse_inorder(node.left)\n\n        reverse_inorder(root)\n        return root",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「把二叉搜索树转换为累加树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 94,
    "leetcodeId": 543,
    "title": "二叉树的直径",
    "titleEn": "Diameter of Binary Tree",
    "slug": "diameter-of-binary-tree",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 94,
    "externalUrl": "https://leetcode.cn/problems/diameter-of-binary-tree/",
    "summary": "给定一棵二叉树，返回树的直径。直径是任意两节点间最长路径的边数。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握DFS求树的直径：每个节点的直径=左深度+右深度。",
    "whyThisPattern": "树的直径=任意两节点间的最长路径（边数）。关键观察：对于每个节点，经过它的最长路径=左子树深度+右子树深度。所以后序遍历每个节点，计算左深度+右深度，更新全局最大值。注意：直径不一定经过根节点！",
    "hints": {
      "level1": "二叉树的直径=任意两节点间最长路径的边数。注意不一定过根节点。",
      "level2": "后序遍历：每个节点的直径=左深度+右深度。更新全局最大。",
      "level3": "DFS。",
      "level4": "后序一遍。",
      "level5": "def depth(node): l=depth(left); r=depth(right); self.ans=max(ans,l+r); return max(l,r)+1",
      "level6": "# 核心思路：每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        ans = 0\n\n        def depth(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n            left = depth(node.left)\n            right = depth(node.right)\n            ans = max(ans, left + right)\n            return max(left, right) + 1\n\n        depth(root)\n        return ans"
    },
    "bruteForceIdea": "对每个节点，分别计算左子树和右子树的深度，求和取最大值。时间O(n^2)。",
    "optimizedIdea": "每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。 每个节点访问一次；递归栈为树高。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        ans = 0\n\n        def depth(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n            left = depth(node.left)\n            right = depth(node.right)\n            ans = max(ans, left + right)\n            return max(left, right) + 1\n\n        depth(root)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「二叉树的直径」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 95,
    "leetcodeId": 560,
    "title": "和为 K 的子数组",
    "titleEn": "Subarray Sum Equals K",
    "slug": "subarray-sum-equals-k",
    "difficulty": "中等",
    "category": "前缀和",
    "tags": [
      "前缀和",
      "哈希表",
      "子数组"
    ],
    "order": 95,
    "externalUrl": "https://leetcode.cn/problems/subarray-sum-equals-k/",
    "summary": "给定一个整数数组nums和一个整数k，返回该数组中和为k的连续子数组的个数。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握“前缀和 + 哈希表”统计连续子数组数量：当前前缀和为 cur 时，之前出现过多少个 cur-k，就能形成多少个和为 k 的子数组。",
    "whyThisPattern": "前缀和+哈希表的经典应用：设prefix[j]是前j个元素的和。如果prefix[j]-prefix[i]=k，则子数组[i+1,j]的和为k。遍历时，对于当前前缀和prefix，需要找之前有多少个前缀和等于prefix-k。用哈希表记录每个前缀和出现的次数，O(1)查找。初始化{0:1}表示空前缀和出现一次。",
    "hints": {
      "level1": "连续子数组和等于k的个数。",
      "level2": "前缀和+哈希表：count+=map.get(prefix-k,0)。",
      "level3": "枚举O(n^2)。",
      "level4": "前缀和O(n)。",
      "level5": "prefix=0; map={0:1}; for num: prefix+=num; count+=map.get(prefix-k,0); map[prefix]+=1",
      "level6": "# 核心思路：前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1], k=2 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        count = defaultdict(int)\n        count[0] = 1\n        cur = 0\n        ans = 0\n\n        for x in nums:\n            cur += x\n            ans += count[cur - k]\n            count[cur] += 1\n\n        return ans"
    },
    "bruteForceIdea": "枚举所有子数组计算和是否等于k。时间O(n^2)。",
    "optimizedIdea": "前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。 一次扫描，哈希表记录前缀和出现次数。",
    "pseudocode": "1. 先判断是前缀和、滑动窗口还是单调队列。\n2. 明确连续区间的左右边界。\n3. 维护窗口/前缀哈希中的计数含义。\n4. 用负数、重复、空窗口样例检查。",
    "solutionCode": "# 核心思路：前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1], k=2 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        count = defaultdict(int)\n        count[0] = 1\n        cur = 0\n        ans = 0\n\n        for x in nums:\n            cur += x\n            ans += count[cur - k]\n            count[cur] += 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "连续子数组/子串和子序列混淆。",
      "有负数时误用滑动窗口。",
      "前缀和计数没有先初始化 0。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「和为 K 的子数组」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 96,
    "leetcodeId": 581,
    "title": "最短无序连续子数组",
    "titleEn": "Shortest Unsorted Continuous Subarray",
    "slug": "shortest-unsorted-continuous-subarray",
    "difficulty": "中等",
    "category": "技巧",
    "tags": [
      "数组"
    ],
    "order": 96,
    "externalUrl": "https://leetcode.cn/problems/shortest-unsorted-continuous-subarray/",
    "summary": "给你一个整数数组，你需要找到一个连续子数组，如果对这个子数组进行升序排序，那么整个数组都会变为升序排序。找最短的这样的子数组长度。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「技巧」在「最短无序连续子数组」中的标准建模方式：从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "一次遍历的核心思想：从左到右维护当前最大值，如果某个位置的值小于之前的最大值，说明这个位置需要被排序（更新右边界）。从右到左维护当前最小值，如果某个位置的值大于之前的最小值，说明这个位置需要被排序（更新左边界）。两个边界之间的子数组就是需要排序的最短子数组。",
    "hints": {
      "level1": "找最短的连续子数组，排序后整个数组有序。比如[2,6,4,8,10,9,15]，需要排序[6,4,8,10,9]。",
      "level2": "正向遍历维护max确定右边界，反向遍历维护min确定左边界。",
      "level3": "排序比较。",
      "level4": "一次遍历。",
      "level5": "正向:maxn更新,nums[i]<maxn则right=i; 反向:minn更新,nums[i]>minn则left=i",
      "level6": "# 核心思路：从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,6,4,8,10,9,15] 检查代码。\nclass Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        right = -1\n        max_seen = float('-inf')\n\n        for i in range(n):\n            if nums[i] < max_seen:\n                right = i\n            else:\n                max_seen = nums[i]\n\n        left = n\n        min_seen = float('inf')\n        for i in range(n - 1, -1, -1):\n            if nums[i] > min_seen:\n                left = i\n            else:\n                min_seen = nums[i]\n\n        return 0 if right == -1 else right - left + 1"
    },
    "bruteForceIdea": "拷贝数组排序，然后和原数组比较找到第一个和最后一个不同的位置。时间O(n*logn)，空间O(n)。",
    "optimizedIdea": "从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。 左右各扫描一次。",
    "pseudocode": "1. 先识别题目的特殊性质或数学不变量。\n2. 把性质落实为变量或原地操作。\n3. 每一步都保持不变量不被破坏。\n4. 用极端值、重复值、已排序样例检查。",
    "solutionCode": "# 核心思路：从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,6,4,8,10,9,15] 检查代码。\nclass Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        right = -1\n        max_seen = float('-inf')\n\n        for i in range(n):\n            if nums[i] < max_seen:\n                right = i\n            else:\n                max_seen = nums[i]\n\n        left = n\n        min_seen = float('inf')\n        for i in range(n - 1, -1, -1):\n            if nums[i] > min_seen:\n                left = i\n            else:\n                min_seen = nums[i]\n\n        return 0 if right == -1 else right - left + 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「最短无序连续子数组」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 97,
    "leetcodeId": 617,
    "title": "合并二叉树",
    "titleEn": "Merge Two Binary Trees",
    "slug": "merge-two-binary-trees",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "二叉树"
    ],
    "order": 97,
    "externalUrl": "https://leetcode.cn/problems/merge-two-binary-trees/",
    "summary": "给定两棵二叉树root1和root2，将它们合并为一棵新二叉树。如果两个节点重叠，将它们的值相加。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「二叉树」在「合并二叉树」中的标准建模方式：两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "递归合并的核心思路：同时遍历两棵树，对每个位置的节点：①如果两棵树都有节点，值相加，然后递归合并左右子树 ②如果只有一棵树有节点，直接用那棵树的节点 ③如果都没有，返回None。这样一次递归就能完成合并。",
    "hints": {
      "level1": "合并两棵二叉树：重叠节点值相加，否则取非空的节点。",
      "level2": "递归：都存在则相加递归，否则取非空的。",
      "level3": "BFS。",
      "level4": "递归。",
      "level5": "def merge(t1,t2): if not t1: return t2; if not t2: return t1; t1.val+=t2.val; t1.left=merge(t1.left,t2.left); t1.right=merge(t1.right,t2.right); return t1",
      "level6": "# 核心思路：两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root1=[1,3,2,5], root2=[2,1,3,null,4,null,7] 检查代码。\nclass Solution:\n    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root1:\n            return root2\n        if not root2:\n            return root1\n\n        root1.val += root2.val\n        root1.left = self.mergeTrees(root1.left, root2.left)\n        root1.right = self.mergeTrees(root1.right, root2.right)\n        return root1"
    },
    "bruteForceIdea": "BFS层序遍历两棵树，逐层合并。需要同时维护两个队列。",
    "optimizedIdea": "两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。 若直接复用节点，只递归两树重叠部分；递归栈取决于树高。",
    "pseudocode": "1. 先判断应该前序、中序、后序还是层序。\n2. 写递归函数的返回值含义。\n3. 处理空节点作为终止条件。\n4. 在单层逻辑里组合左右子树结果。",
    "solutionCode": "# 核心思路：两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root1=[1,3,2,5], root2=[2,1,3,null,4,null,7] 检查代码。\nclass Solution:\n    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root1:\n            return root2\n        if not root2:\n            return root1\n\n        root1.val += root2.val\n        root1.left = self.mergeTrees(root1.left, root2.left)\n        root1.right = self.mergeTrees(root1.right, root2.right)\n        return root1",
    "complexity": {
      "time": "O(min(m,n)) 或 O(m+n)",
      "space": "O(h)"
    },
    "commonMistakes": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「合并二叉树」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 98,
    "leetcodeId": 621,
    "title": "任务调度器",
    "titleEn": "Task Scheduler",
    "slug": "task-scheduler",
    "difficulty": "中等",
    "category": "贪心",
    "tags": [
      "贪心"
    ],
    "order": 98,
    "externalUrl": "https://leetcode.cn/problems/task-scheduler/",
    "summary": "给定一个用字符数组tasks表示的CPU任务和冷却时间n，求完成所有任务的最短时间。相同任务之间必须间隔n个时间单位。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「贪心」在「任务调度器」中的标准建模方式：先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "贪心公式推导：出现次数最多的任务决定了框架数。假设最高频任务A出现max_cnt次，需要(max_cnt-1)个间隔段，每段长度为n+1（n个冷却+1个A本身），加上最后一段中同频任务的数量cnt。总长度=(max_cnt-1)*(n+1)+cnt。但如果任务总数更多（冷却被填满），则答案就是任务总数。",
    "hints": {
      "level1": "任务调度器：相同任务间隔n，求最短总时间。",
      "level2": "贪心公式：max(len(tasks), (max_cnt-1)*(n+1)+cnt)。",
      "level3": "模拟。",
      "level4": "贪心公式。",
      "level5": "c=Counter(tasks); max_cnt=max(c.values()); cnt=sum(1 for v in c.values() if v==max_cnt); return max(len(tasks),(max_cnt-1)*(n+1)+cnt)",
      "level6": "# 核心思路：先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        freq = Counter(tasks)\n        max_count = max(freq.values())\n        max_kinds = sum(1 for v in freq.values() if v == max_count)\n\n        # 先用最高频任务撑开框架，再与任务总数取最大值\n        frame = (max_count - 1) * (n + 1) + max_kinds\n        return max(frame, len(tasks))"
    },
    "bruteForceIdea": "暴力思路：模拟CPU调度过程：维护就绪队列和冷却队列。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。 任务种类固定为大写字母，计数空间常数；扫描任务一次。",
    "pseudocode": "1. 先说明局部最优选择是什么。\n2. 证明这个选择不会损失全局最优。\n3. 遍历中维护覆盖范围、最优候选或排序结构。\n4. 用反例尝试推翻贪心，确认边界。",
    "solutionCode": "# 核心思路：先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        freq = Counter(tasks)\n        max_count = max(freq.values())\n        max_kinds = sum(1 for v in freq.values() if v == max_count)\n\n        # 先用最高频任务撑开框架，再与任务总数取最大值\n        frame = (max_count - 1) * (n + 1) + max_kinds\n        return max(frame, len(tasks))",
    "complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「任务调度器」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 99,
    "leetcodeId": 647,
    "title": "回文子串",
    "titleEn": "Palindromic Substrings",
    "slug": "palindromic-substrings",
    "difficulty": "中等",
    "category": "多维动态规划",
    "tags": [
      "动态规划",
      "字符串"
    ],
    "order": 99,
    "externalUrl": "https://leetcode.cn/problems/palindromic-substrings/",
    "summary": "给定一个字符串s，统计并返回其中回文子串的数目。请先明确输入、输出、返回值含义和极端边界，再选择合适的数据结构或算法模式。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「多维动态规划」在「回文子串」中的标准建模方式：每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "中心扩展法：回文子串的中心可以是单个字符（奇数长度回文）或两个相邻字符之间（偶数长度回文）。共有2n-1个可能的中心。对每个中心向两边扩展，只要两端字符相同就继续扩展并计数。时间O(n^2)，空间O(1)。比DP方法更直观。",
    "hints": {
      "level1": "统计回文子串数目。比如\"abc\"有3个，\"aaa\"有6个。",
      "level2": "中心扩展：2n-1个中心，每个向两边扩展统计。",
      "level3": "枚举O(n^3)。",
      "level4": "中心扩展O(n^2)。",
      "level5": "for center in 0..2n-2: l=center//2; r=l+center%2; while l>=0 and r<n and s[l]==s[r]: count++; l--; r++",
      "level6": "# 核心思路：每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abc\" 检查代码。\nclass Solution:\n    def countSubstrings(self, s: str) -> int:\n        ans = 0\n\n        def expand(left: int, right: int) -> None:\n            nonlocal ans\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                ans += 1\n                left -= 1\n                right += 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度回文\n            expand(i, i + 1)   # 偶数长度回文\n\n        return ans"
    },
    "bruteForceIdea": "暴力思路：枚举所有子串判断是否回文。时间O(n^3)。也就是先不做复杂优化，直接枚举、扫描或模拟所有可能情况，保证答案正确；它的价值是帮助定位重复计算、重复查找或无效枚举这些优化瓶颈。",
    "optimizedIdea": "每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。 2n-1 个中心，每个中心最坏扩展 O(n)。",
    "pseudocode": "1. 定义二维/区间状态，明确下标是否表示前 i 个。\n2. 写出状态转移依赖哪些方向或子区间。\n3. 先初始化空串、第一行/列或长度边界。\n4. 按依赖关系确定遍历顺序，手推小样例。",
    "solutionCode": "# 核心思路：每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abc\" 检查代码。\nclass Solution:\n    def countSubstrings(self, s: str) -> int:\n        ans = 0\n\n        def expand(left: int, right: int) -> None:\n            nonlocal ans\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                ans += 1\n                left -= 1\n                right += 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度回文\n            expand(i, i + 1)   # 偶数长度回文\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)"
    },
    "commonMistakes": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「回文子串」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  },
  {
    "id": 100,
    "leetcodeId": 739,
    "title": "每日温度",
    "titleEn": "Daily Temperatures",
    "slug": "daily-temperatures",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "栈",
      "单调栈"
    ],
    "order": 100,
    "externalUrl": "https://leetcode.cn/problems/daily-temperatures/",
    "summary": "给定一个整数数组temperatures表示每天的温度，返回一个数组answer，其中answer[i]表示第i天之后需要等几天才能遇到更暖和的天气。如果之后都不会更暖和，answer[i]=0。",
    "prerequisites": [
      "基础算法思维"
    ],
    "learningGoal": "掌握「栈」在「每日温度」中的标准建模方式：单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。 面试时要能讲出变量含义、更新顺序和边界处理。",
    "whyThisPattern": "单调递减栈的经典应用：栈中存放\"还没找到更高温度的天\"的下标，栈底到栈顶温度递减。遍历时，如果当前温度高于栈顶对应的温度，说明栈顶那天等到了更高温度——弹出栈顶并计算等待天数（当前下标-栈顶下标）。重复此过程直到栈空或栈顶温度>=当前温度。每个元素最多入栈出栈各一次，所以时间O(n)。",
    "hints": {
      "level1": "每天要等多少天才能遇到更高温度。等不到则为0。比如[73,74,75,71,69,72,76,73]返回[1,1,4,2,1,1,0,0]。",
      "level2": "单调递减栈：存下标，遇到更高温度时弹栈计算等待天数。",
      "level3": "扫描O(n^2)。",
      "level4": "单调栈O(n)。",
      "level5": "stack=[]; for i,t: while stack and t>temps[stack[-1]]: j=stack.pop(); res[j]=i-j; stack.append(i)",
      "level6": "# 核心思路：单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 temperatures=[73,74,75,71,69,72,76,73] 检查代码。\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        stack = []  # 存下标，且对应温度单调递减\n\n        for i, temp in enumerate(temperatures):\n            while stack and temp > temperatures[stack[-1]]:\n                prev = stack.pop()\n                ans[prev] = i - prev\n            stack.append(i)\n\n        return ans"
    },
    "bruteForceIdea": "对每天，从下一天开始向后扫描，找到第一个温度更高的天。两层循环，时间O(n^2)。",
    "optimizedIdea": "单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。 每个下标最多入栈出栈一次。",
    "pseudocode": "1. 明确栈里存值还是下标，以及栈的单调性/匹配意义。\n2. 遇到触发条件时持续弹栈并结算答案。\n3. 加入哨兵或初始化边界，统一处理空栈。\n4. 用空输入、重复值、完全单调样例检查。",
    "solutionCode": "# 核心思路：单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 temperatures=[73,74,75,71,69,72,76,73] 检查代码。\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        stack = []  # 存下标，且对应温度单调递减\n\n        for i, temp in enumerate(temperatures):\n            while stack and temp > temperatures[stack[-1]]:\n                prev = stack.pop()\n                ans[prev] = i - prev\n            stack.append(i)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "commonMistakes": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "reviewQuestions": [
      "这道题的核心不变量是什么？请结合「每日温度」手推一遍。",
      "如果输入命中边界样例，代码会走到哪一行？",
      "为什么时间复杂度和空间复杂度分别是当前结论？",
      "面试官要求不用背代码时，你能否先讲暴力、再讲优化瓶颈？"
    ]
  }
];
