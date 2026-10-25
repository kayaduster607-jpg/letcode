export interface RefinedEdgeCase {
  input: string;
  expected: string;
  why: string;
}

export interface RefinedComplexity {
  time: string;
  space: string;
  detail: string;
}

export interface ProblemRefinement {
  leetcodeId: number;
  title: string;
  slug: string;
  coreIdea: string;
  handwriteSteps: string[];
  edgeCases: RefinedEdgeCase[];
  annotatedCode: string;
  complexity: RefinedComplexity;
  commonPitfalls: string[];
  interviewChecklist: string[];
}

export const problemRefinements: Record<number, ProblemRefinement> = {
  "1": {
    "leetcodeId": 1,
    "title": "两数之和",
    "slug": "two-sum",
    "coreIdea": "遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。",
    "handwriteSteps": [
      "先说暴力解的重复查找在哪里。",
      "定义哈希表 key/value 分别保存什么。",
      "遍历时先查询再更新哈希表，避免自匹配或漏算。",
      "用重复值、负数、空/极小输入检查边界。"
    ],
    "edgeCases": [
      {
        "input": "nums=[3,3], target=6",
        "expected": "[0,1]",
        "why": "重复数字要存下标，且必须先查再存，不能同一个元素用两次。"
      },
      {
        "input": "nums=[-1,-2,-3,-4,-5], target=-8",
        "expected": "[2,4]",
        "why": "负数和正常整数一样可以作为哈希表 key。"
      },
      {
        "input": "nums=[2,7,11,15], target=9",
        "expected": "[0,1]",
        "why": "最基础样例，验证返回的是下标不是数值。"
      }
    ],
    "annotatedCode": "# 核心思路：遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,3], target=6 检查代码。\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # seen[value] = index：value 第一次出现的下标\n        seen = {}\n\n        for i, x in enumerate(nums):\n            need = target - x  # 当前数 x 需要搭配的另一个数\n\n            # 先查再存，避免 target=2*x 时把自己匹配给自己\n            if need in seen:\n                return [seen[need], i]\n\n            # 没找到搭档，记录当前数，留给后面的元素匹配\n            seen[x] = i\n\n        # 题目保证有且只有一个答案，正常不会走到这里\n        return []",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "数组只遍历一次；哈希表最多存 n 个数值到下标的映射。"
    },
    "commonPitfalls": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "2": {
    "leetcodeId": 2,
    "title": "两数相加",
    "slug": "add-two-numbers",
    "coreIdea": "把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "l1=[9,9,9], l2=[1]",
        "expected": "[0,0,0,1]",
        "why": "链表结束后 carry 仍然存在，必须继续生成新节点。"
      },
      {
        "input": "l1=[2,4,3], l2=[5,6,4]",
        "expected": "[7,0,8]",
        "why": "标准竖式加法 342+465=807。"
      },
      {
        "input": "l1=[0], l2=[0]",
        "expected": "[0]",
        "why": "零值链表不能返回空链表。"
      }
    ],
    "annotatedCode": "# 核心思路：把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 l1=[9,9,9], l2=[1] 检查代码。\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)  # 虚拟头节点，避免单独处理第一个节点\n        cur = dummy\n        carry = 0            # 进位，只可能是 0 或 1\n\n        # 只要任意链表没走完，或最后还有进位，就继续处理\n        while l1 or l2 or carry:\n            x = l1.val if l1 else 0\n            y = l2.val if l2 else 0\n            total = x + y + carry\n\n            carry = total // 10          # 十位作为下一轮进位\n            cur.next = ListNode(total % 10)  # 个位成为当前答案节点\n            cur = cur.next\n\n            if l1:\n                l1 = l1.next\n            if l2:\n                l2 = l2.next\n\n        return dummy.next",
    "complexity": {
      "time": "O(max(m,n))",
      "space": "O(max(m,n))",
      "detail": "最多遍历两个链表中较长的长度；返回链表本身需要同等数量的新节点。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "3": {
    "leetcodeId": 3,
    "title": "无重复字符的最长子串",
    "slug": "longest-substring-without-repeating-characters",
    "coreIdea": "用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。",
    "handwriteSteps": [
      "明确窗口内维护的条件是什么。",
      "右指针扩张并更新窗口状态。",
      "当窗口不满足/已经满足条件时移动左指针。",
      "每次更新答案时确认窗口左右边界是否闭区间。"
    ],
    "edgeCases": [
      {
        "input": "s=\"abba\"",
        "expected": "2",
        "why": "不能把 left 往回移；第二个 a 出现时 left 已经在 2。"
      },
      {
        "input": "s=\"bbbbb\"",
        "expected": "1",
        "why": "全重复时窗口长度始终最多为 1。"
      },
      {
        "input": "s=\"\"",
        "expected": "0",
        "why": "空字符串答案为 0。"
      }
    ],
    "annotatedCode": "# 核心思路：用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abba\" 检查代码。\nclass Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}   # last[ch] = 字符 ch 最近一次出现的下标\n        left = 0    # 当前无重复窗口的左边界\n        ans = 0\n\n        for right, ch in enumerate(s):\n            # ch 在窗口内重复出现，left 必须跳到上次 ch 的后一位\n            if ch in last and last[ch] >= left:\n                left = last[ch] + 1\n\n            last[ch] = right\n            ans = max(ans, right - left + 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(min(n,字符集大小))",
      "detail": "right 线性扫描，left 只向右移动；哈希表记录字符最近出现位置。"
    },
    "commonPitfalls": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "4": {
    "leetcodeId": 4,
    "title": "寻找两个正序数组的中位数",
    "slug": "median-of-two-sorted-arrays",
    "coreIdea": "在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。",
    "handwriteSteps": [
      "先保证 nums1 是较短数组，二分区间是 nums1 能取的左半区数量 [0,m]。",
      "用 i 表示 nums1 左边取几个，j=total_left-i 表示 nums2 左边取几个。",
      "取 a_left、a_right、b_left、b_right 四个边界，数组取空时用 -inf/inf。",
      "当 a_left<=b_right 且 b_left<=a_right 时切分合法，按总长度奇偶返回答案。",
      "如果 a_left>b_right，说明 nums1 左边取多了；否则 nums1 左边取少了。"
    ],
    "edgeCases": [
      {
        "input": "nums1=[], nums2=[1]",
        "expected": "1.0",
        "why": "一个数组为空时，哨兵值能自然处理。"
      },
      {
        "input": "nums1=[1,2], nums2=[3,4]",
        "expected": "2.5",
        "why": "总长度为偶数，需要取左右边界平均值。"
      },
      {
        "input": "nums1=[0,0], nums2=[0,0]",
        "expected": "0.0",
        "why": "大量重复值也应满足 <= 判断。"
      }
    ],
    "annotatedCode": "# 核心思路：在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums1=[], nums2=[1] 检查代码。\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # 始终在较短数组上二分，保证复杂度是 log(min(m,n))\n        if len(nums1) > len(nums2):\n            nums1, nums2 = nums2, nums1\n\n        m, n = len(nums1), len(nums2)\n        total_left = (m + n + 1) // 2  # 左半边需要放多少个元素\n        left, right = 0, m\n\n        while left <= right:\n            i = (left + right) // 2       # nums1 左边取 i 个\n            j = total_left - i            # nums2 左边取 j 个\n\n            a_left = nums1[i - 1] if i > 0 else float('-inf')\n            a_right = nums1[i] if i < m else float('inf')\n            b_left = nums2[j - 1] if j > 0 else float('-inf')\n            b_right = nums2[j] if j < n else float('inf')\n\n            # 找到合法切分：左半边所有数 <= 右半边所有数\n            if a_left <= b_right and b_left <= a_right:\n                if (m + n) % 2 == 1:\n                    return float(max(a_left, b_left))\n                return (max(a_left, b_left) + min(a_right, b_right)) / 2\n\n            # nums1 左边取太多了，i 往左收\n            if a_left > b_right:\n                right = i - 1\n            else:\n                left = i + 1\n\n        return 0.0",
    "complexity": {
      "time": "O(log(min(m,n)))",
      "space": "O(1)",
      "detail": "只在较短数组上二分；每次根据边界大小排除一半切分位置。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "5": {
    "leetcodeId": 5,
    "title": "最长回文子串",
    "slug": "longest-palindromic-substring",
    "coreIdea": "回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "s=\"babad\"",
        "expected": "\"bab\" 或 \"aba\"",
        "why": "奇数长度回文，存在多个正确答案。"
      },
      {
        "input": "s=\"cbbd\"",
        "expected": "\"bb\"",
        "why": "偶数长度回文中心在两个字符之间。"
      },
      {
        "input": "s=\"a\"",
        "expected": "\"a\"",
        "why": "长度为 1 时直接返回自身。"
      }
    ],
    "annotatedCode": "# 核心思路：回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"babad\" 检查代码。\nclass Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s:\n            return \"\"\n\n        start = end = 0  # 当前最长回文子串的左右边界\n\n        def expand(left: int, right: int) -> None:\n            nonlocal start, end\n            # 只要左右字符相同，就继续向两边扩张\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                left -= 1\n                right += 1\n\n            # 跳出循环时 [left+1, right-1] 才是真正回文区间\n            if right - left - 2 > end - start:\n                start, end = left + 1, right - 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度中心\n            expand(i, i + 1)   # 偶数长度中心\n\n        return s[start:end + 1]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)",
      "detail": "一共有 2n-1 个中心，每个中心最坏向外扩展 O(n)。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "10": {
    "leetcodeId": 10,
    "title": "正则表达式匹配",
    "slug": "regular-expression-matching",
    "coreIdea": "dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "s=\"aa\", p=\"a*\"",
        "expected": "true",
        "why": "* 可以让前一个字符重复多次。"
      },
      {
        "input": "s=\"ab\", p=\".*\"",
        "expected": "true",
        "why": ". 可以匹配任意字符，* 可以重复。"
      },
      {
        "input": "s=\"mississippi\", p=\"mis*is*p*.\"",
        "expected": "false",
        "why": "星号只能作用于前一个字符，不能随意跨段匹配。"
      }
    ],
    "annotatedCode": "# 核心思路：dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"aa\", p=\"a*\" 检查代码。\nclass Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True  # 空串匹配空模式\n\n        # 初始化：s 为空时，只有 a*b*c* 这种模式可能匹配空串\n        for j in range(2, n + 1):\n            if p[j - 1] == '*':\n                dp[0][j] = dp[0][j - 2]\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                elif p[j - 1] == '*':\n                    # 情况1：x* 出现 0 次，直接删掉 p[j-2:j]\n                    dp[i][j] = dp[i][j - 2]\n\n                    # 情况2：x* 至少出现 1 次，前提是 x 能匹配 s[i-1]\n                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:\n                        dp[i][j] = dp[i][j] or dp[i - 1][j]\n\n        return dp[m][n]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)",
      "detail": "m=len(s), n=len(p)，二维 DP 每个状态 O(1) 转移。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "11": {
    "leetcodeId": 11,
    "title": "盛最多水的容器",
    "slug": "container-with-most-water",
    "coreIdea": "容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。",
    "handwriteSteps": [
      "先明确两个指针分别代表什么边界。",
      "证明每次移动哪一个指针不会漏答案。",
      "在循环内先更新答案，再移动指针。",
      "用最小长度、单调数组、重复值样例检查。"
    ],
    "edgeCases": [
      {
        "input": "height=[1,1]",
        "expected": "1",
        "why": "最小长度数组。"
      },
      {
        "input": "height=[1,8,6,2,5,4,8,3,7]",
        "expected": "49",
        "why": "经典样例。"
      },
      {
        "input": "height=[2,3,4,5,18,17,6]",
        "expected": "17",
        "why": "最高柱子不一定参与最大面积。"
      }
    ],
    "annotatedCode": "# 核心思路：容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[1,1] 检查代码。\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        ans = 0\n\n        while left < right:\n            width = right - left\n            ans = max(ans, width * min(height[left], height[right]))\n\n            # 面积受短板限制，移动长板不会提高当前短板\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "左右指针每次移动一个，总共最多移动 n-1 次。"
    },
    "commonPitfalls": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "15": {
    "leetcodeId": 15,
    "title": "三数之和",
    "slug": "3sum",
    "coreIdea": "先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。",
    "handwriteSteps": [
      "先明确两个指针分别代表什么边界。",
      "证明每次移动哪一个指针不会漏答案。",
      "在循环内先更新答案，再移动指针。",
      "用最小长度、单调数组、重复值样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[-1,0,1,2,-1,-4]",
        "expected": "[[-1,-1,2],[-1,0,1]]",
        "why": "需要排序和去重。"
      },
      {
        "input": "nums=[0,0,0,0]",
        "expected": "[[0,0,0]]",
        "why": "重复答案只能保留一次。"
      },
      {
        "input": "nums=[1,2,-2,-1]",
        "expected": "[]",
        "why": "不存在三元组时返回空数组。"
      }
    ],
    "annotatedCode": "# 核心思路：先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-1,0,1,2,-1,-4] 检查代码。\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        n = len(nums)\n\n        for i in range(n - 2):\n            # 固定数去重：相同 nums[i] 只处理第一次\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            # 排序后最小固定数已大于 0，后面不可能凑成 0\n            if nums[i] > 0:\n                break\n\n            left, right = i + 1, n - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    ans.append([nums[i], nums[left], nums[right]])\n                    left += 1\n                    right -= 1\n\n                    # 双指针去重：跳过相同的第二、第三个数\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)",
      "detail": "排序后外层枚举 n 次，内层双指针线性移动；不计答案空间时额外空间 O(1)。"
    },
    "commonPitfalls": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "17": {
    "leetcodeId": 17,
    "title": "电话号码的字母组合",
    "slug": "letter-combinations-of-a-phone-number",
    "coreIdea": "每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "digits=\"\"",
        "expected": "[]",
        "why": "空输入不能返回 [\"\"]。"
      },
      {
        "input": "digits=\"2\"",
        "expected": "[\"a\",\"b\",\"c\"]",
        "why": "单个数字对应三个字母。"
      },
      {
        "input": "digits=\"79\"",
        "expected": "16 个组合",
        "why": "7 和 9 都有 4 个字母，组合数最多。"
      }
    ],
    "annotatedCode": "# 核心思路：每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 digits=\"\" 检查代码。\nclass Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits:\n            return []\n\n        phone = {\n            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',\n            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'\n        }\n        ans = []\n        path = []\n\n        def backtrack(index: int) -> None:\n            # index 表示正在决定 digits[index]\n            if index == len(digits):\n                ans.append(''.join(path))\n                return\n\n            for ch in phone[digits[index]]:\n                path.append(ch)          # 选择一个字母\n                backtrack(index + 1)     # 递归决定下一个数字\n                path.pop()               # 撤销选择，尝试同层其他字母\n\n        backtrack(0)\n        return ans",
    "complexity": {
      "time": "O(4^n·n)",
      "space": "O(n)",
      "detail": "最多每位 4 个选择，生成每个答案需要拷贝长度 n 的字符串；递归栈深度为 n。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "19": {
    "leetcodeId": 19,
    "title": "删除链表的倒数第N个结点",
    "slug": "remove-nth-node-from-end-of-list",
    "coreIdea": "快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[1], n=1",
        "expected": "[]",
        "why": "删除唯一节点，dummy 能统一处理。"
      },
      {
        "input": "head=[1,2], n=2",
        "expected": "[2]",
        "why": "删除头节点时不能直接用 head 前驱，必须用 dummy。"
      },
      {
        "input": "head=[1,2,3,4,5], n=2",
        "expected": "[1,2,3,5]",
        "why": "标准样例。"
      }
    ],
    "annotatedCode": "# 核心思路：快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1], n=1 检查代码。\nclass Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)  # 处理删除头节点的情况\n        fast = slow = dummy\n\n        # fast 先走 n 步，制造 n 个节点的间距\n        for _ in range(n):\n            fast = fast.next\n\n        # fast 到最后一个节点时，slow 在待删除节点前一个\n        while fast.next:\n            fast = fast.next\n            slow = slow.next\n\n        slow.next = slow.next.next\n        return dummy.next",
    "complexity": {
      "time": "O(L)",
      "space": "O(1)",
      "detail": "链表只被双指针线性扫描一次；只使用常数个指针变量。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "20": {
    "leetcodeId": 20,
    "title": "有效的括号",
    "slug": "valid-parentheses",
    "coreIdea": "遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "s=\"()[]{}\"",
        "expected": "true",
        "why": "多种括号顺序匹配。"
      },
      {
        "input": "s=\"([)]\"",
        "expected": "false",
        "why": "数量对但嵌套顺序错。"
      },
      {
        "input": "s=\"]\"",
        "expected": "false",
        "why": "右括号出现时栈为空。"
      }
    ],
    "annotatedCode": "# 核心思路：遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"()[]{}\" 检查代码。\nclass Solution:\n    def isValid(self, s: str) -> bool:\n        pair = {')': '(', ']': '[', '}': '{'}\n        stack = []\n\n        for ch in s:\n            if ch in pair:  # ch 是右括号，需要匹配栈顶\n                if not stack or stack[-1] != pair[ch]:\n                    return False\n                stack.pop()\n            else:           # ch 是左括号，等待后续右括号匹配\n                stack.append(ch)\n\n        return not stack",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个括号最多入栈或出栈一次；最坏全是左括号，栈大小为 n。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "21": {
    "leetcodeId": 21,
    "title": "合并两个有序链表",
    "slug": "merge-two-sorted-lists",
    "coreIdea": "两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "list1=[], list2=[]",
        "expected": "[]",
        "why": "两个空链表返回空。"
      },
      {
        "input": "list1=[], list2=[0]",
        "expected": "[0]",
        "why": "一边为空时直接接另一边。"
      },
      {
        "input": "list1=[1,2,4], list2=[1,3,4]",
        "expected": "[1,1,2,3,4,4]",
        "why": "标准合并。"
      }
    ],
    "annotatedCode": "# 核心思路：两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 list1=[], list2=[] 检查代码。\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n\n        while list1 and list2:\n            if list1.val <= list2.val:\n                cur.next = list1\n                list1 = list1.next\n            else:\n                cur.next = list2\n                list2 = list2.next\n            cur = cur.next\n\n        # 剩余链表本身已经有序，直接接上即可\n        cur.next = list1 if list1 else list2\n        return dummy.next",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)",
      "detail": "每个节点只接入结果链表一次；迭代写法只使用常数指针。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "22": {
    "leetcodeId": 22,
    "title": "括号生成",
    "slug": "generate-parentheses",
    "coreIdea": "回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "n=1",
        "expected": "[\"()\"]",
        "why": "最小非零规模。"
      },
      {
        "input": "n=3",
        "expected": "5 个结果",
        "why": "经典样例。"
      },
      {
        "input": "任意前缀右括号数 > 左括号数",
        "expected": "不允许生成",
        "why": "这是核心剪枝条件。"
      }
    ],
    "annotatedCode": "# 核心思路：回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        path = []\n\n        def backtrack(left_count: int, right_count: int) -> None:\n            # path 长度达到 2n，说明得到一个完整合法组合\n            if len(path) == 2 * n:\n                ans.append(''.join(path))\n                return\n\n            # 只要左括号还没用完，就可以加左括号\n            if left_count < n:\n                path.append('(')\n                backtrack(left_count + 1, right_count)\n                path.pop()\n\n            # 右括号不能超过左括号，否则前缀会非法\n            if right_count < left_count:\n                path.append(')')\n                backtrack(left_count, right_count + 1)\n                path.pop()\n\n        backtrack(0, 0)\n        return ans",
    "complexity": {
      "time": "O(Cn·n)",
      "space": "O(n)",
      "detail": "答案数量是第 n 个卡特兰数 Cn；递归路径长度为 2n，拷贝答案需要 O(n)。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "31": {
    "leetcodeId": 31,
    "title": "下一个排列",
    "slug": "next-permutation",
    "coreIdea": "从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,2,3]",
        "expected": "[1,3,2]",
        "why": "普通升序数组。"
      },
      {
        "input": "nums=[3,2,1]",
        "expected": "[1,2,3]",
        "why": "已经是最大排列，需要变成最小排列。"
      },
      {
        "input": "nums=[1,1,5]",
        "expected": "[1,5,1]",
        "why": "重复元素也按字典序处理。"
      }
    ],
    "annotatedCode": "# 核心思路：从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        n = len(nums)\n        i = n - 2\n\n        # 找到第一个 nums[i] < nums[i+1]，说明 i 可以被增大\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            # 从右侧找第一个比 nums[i] 大的数，它是“刚好更大”的交换对象\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        # i 右侧原本是降序，反转后变成最小升序后缀\n        left, right = i + 1, n - 1\n        while left < right:\n            nums[left], nums[right] = nums[right], nums[left]\n            left += 1\n            right -= 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "最多从右向左扫描两次并原地反转后缀。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "32": {
    "leetcodeId": 32,
    "title": "最长有效括号",
    "slug": "longest-valid-parentheses",
    "coreIdea": "栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "s=\"(()\"",
        "expected": "2",
        "why": "最后一个左括号无法匹配。"
      },
      {
        "input": "s=\")()())\"",
        "expected": "4",
        "why": "哨兵能处理前缀非法右括号。"
      },
      {
        "input": "s=\"\"",
        "expected": "0",
        "why": "空串没有有效括号。"
      }
    ],
    "annotatedCode": "# 核心思路：栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"(()\" 检查代码。\nclass Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        stack = [-1]  # 栈底哨兵：最后一个无法匹配的右括号位置\n        ans = 0\n\n        for i, ch in enumerate(s):\n            if ch == '(':\n                stack.append(i)\n            else:\n                stack.pop()\n                if not stack:\n                    # 当前 ')' 没有左括号匹配，成为新的分割点\n                    stack.append(i)\n                else:\n                    # i - stack[-1] 是当前合法段长度\n                    ans = max(ans, i - stack[-1])\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个下标最多入栈出栈一次；最坏栈保存所有下标。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "33": {
    "leetcodeId": 33,
    "title": "搜索旋转排序数组",
    "slug": "search-in-rotated-sorted-array",
    "coreIdea": "旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。",
    "handwriteSteps": [
      "明确二分区间是闭区间还是左闭右开。",
      "写出 mid 后判断哪一半一定无答案。",
      "更新 left/right 时保证区间收缩。",
      "用单元素、无答案、重复/旋转边界检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[4,5,6,7,0,1,2], target=0",
        "expected": "4",
        "why": "target 在右侧有序区间。"
      },
      {
        "input": "nums=[4,5,6,7,0,1,2], target=3",
        "expected": "-1",
        "why": "不存在时返回 -1。"
      },
      {
        "input": "nums=[1], target=0",
        "expected": "-1",
        "why": "单元素边界。"
      }
    ],
    "annotatedCode": "# 核心思路：旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,5,6,7,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return mid\n\n            # 左半边 [left, mid] 有序\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            # 右半边 [mid, right] 有序\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return -1",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)",
      "detail": "无重复元素时每次都能确定一半区间无答案。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "34": {
    "leetcodeId": 34,
    "title": "在排序数组中查找元素的第一个和最后一个位置",
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "coreIdea": "用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。",
    "handwriteSteps": [
      "明确二分区间是闭区间还是左闭右开。",
      "写出 mid 后判断哪一半一定无答案。",
      "更新 left/right 时保证区间收缩。",
      "用单元素、无答案、重复/旋转边界检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[5,7,7,8,8,10], target=8",
        "expected": "[3,4]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[5,7,7,8,8,10], target=6",
        "expected": "[-1,-1]",
        "why": "target 不存在。"
      },
      {
        "input": "nums=[], target=0",
        "expected": "[-1,-1]",
        "why": "空数组。"
      }
    ],
    "annotatedCode": "# 核心思路：用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[5,7,7,8,8,10], target=8 检查代码。\nclass Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        def lower_bound(x: int) -> int:\n            left, right = 0, len(nums)\n            # 在 [left, right) 中找第一个 >= x 的位置\n            while left < right:\n                mid = (left + right) // 2\n                if nums[mid] < x:\n                    left = mid + 1\n                else:\n                    right = mid\n            return left\n\n        start = lower_bound(target)\n        if start == len(nums) or nums[start] != target:\n            return [-1, -1]\n\n        end = lower_bound(target + 1) - 1\n        return [start, end]",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)",
      "detail": "二分两次，每次区间减半。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "39": {
    "leetcodeId": 39,
    "title": "组合总和",
    "slug": "combination-sum",
    "coreIdea": "回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "candidates=[2,3,6,7], target=7",
        "expected": "[[2,2,3],[7]]",
        "why": "同一数字可重复使用。"
      },
      {
        "input": "candidates=[2], target=1",
        "expected": "[]",
        "why": "所有候选都超过 target。"
      },
      {
        "input": "candidates=[2,3,5], target=8",
        "expected": "多组答案",
        "why": "需要继续搜索而不是找到一组就停止。"
      }
    ],
    "annotatedCode": "# 核心思路：回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 candidates=[2,3,6,7], target=7 检查代码。\nclass Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        candidates.sort()\n        ans = []\n        path = []\n\n        def backtrack(start: int, remain: int) -> None:\n            if remain == 0:\n                ans.append(path[:])\n                return\n\n            for i in range(start, len(candidates)):\n                x = candidates[i]\n                if x > remain:  # 排序后后面更大，直接剪枝\n                    break\n                path.append(x)\n                backtrack(i, remain - x)  # i 不是 i+1，因为可以重复选 x\n                path.pop()\n\n        backtrack(0, target)\n        return ans",
    "complexity": {
      "time": "O(S)",
      "space": "O(target/min(candidates))",
      "detail": "S 为搜索树节点数，受 target 和候选数影响；递归深度最多 target/min(candidates)。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "42": {
    "leetcodeId": 42,
    "title": "接雨水",
    "slug": "trapping-rain-water",
    "coreIdea": "双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。",
    "handwriteSteps": [
      "先明确两个指针分别代表什么边界。",
      "证明每次移动哪一个指针不会漏答案。",
      "在循环内先更新答案，再移动指针。",
      "用最小长度、单调数组、重复值样例检查。"
    ],
    "edgeCases": [
      {
        "input": "height=[0,1,0,2,1,0,1,3,2,1,2,1]",
        "expected": "6",
        "why": "经典样例。"
      },
      {
        "input": "height=[4,2,0,3,2,5]",
        "expected": "9",
        "why": "多段凹槽。"
      },
      {
        "input": "height=[1,2,3]",
        "expected": "0",
        "why": "单调递增不能接水。"
      }
    ],
    "annotatedCode": "# 核心思路：双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[0,1,0,2,1,0,1,3,2,1,2,1] 检查代码。\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max = right_max = 0\n        ans = 0\n\n        while left < right:\n            left_max = max(left_max, height[left])\n            right_max = max(right_max, height[right])\n\n            # 左侧最高墙更矮，当前位置水量由 left_max 决定\n            if left_max < right_max:\n                ans += left_max - height[left]\n                left += 1\n            else:\n                ans += right_max - height[right]\n                right -= 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "左右指针各只向中间移动，常数变量记录 left_max/right_max。"
    },
    "commonPitfalls": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "46": {
    "leetcodeId": 46,
    "title": "全排列",
    "slug": "permutations",
    "coreIdea": "回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,2,3]",
        "expected": "6 个排列",
        "why": "标准全排列。"
      },
      {
        "input": "nums=[0,1]",
        "expected": "[[0,1],[1,0]]",
        "why": "两个元素。"
      },
      {
        "input": "nums=[1]",
        "expected": "[[1]]",
        "why": "单元素。"
      }
    ],
    "annotatedCode": "# 核心思路：回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n        used = [False] * len(nums)\n\n        def backtrack() -> None:\n            if len(path) == len(nums):\n                ans.append(path[:])\n                return\n\n            for i, x in enumerate(nums):\n                if used[i]:\n                    continue\n                used[i] = True\n                path.append(x)\n                backtrack()\n                path.pop()\n                used[i] = False\n\n        backtrack()\n        return ans",
    "complexity": {
      "time": "O(n!·n)",
      "space": "O(n)",
      "detail": "共有 n! 个排列，每个答案拷贝长度 n；递归栈和 used/path 为 O(n)。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "48": {
    "leetcodeId": 48,
    "title": "旋转图像",
    "slug": "rotate-image",
    "coreIdea": "顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。",
    "handwriteSteps": [
      "先明确坐标含义和行列边界。",
      "利用矩阵的排序、层次或方向性质排除范围。",
      "更新坐标时保证不会越界和重复访问。",
      "用 1×1、单行、单列样例检查。"
    ],
    "edgeCases": [
      {
        "input": "matrix=[[1]]",
        "expected": "[[1]]",
        "why": "1×1 不变。"
      },
      {
        "input": "3×3 矩阵",
        "expected": "顺时针旋转",
        "why": "标准样例。"
      },
      {
        "input": "4×4 矩阵",
        "expected": "顺时针旋转",
        "why": "偶数阶也适用。"
      }
    ],
    "annotatedCode": "# 核心思路：顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix=[[1]] 检查代码。\nclass Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n\n        # 第一步：沿主对角线转置，matrix[i][j] 与 matrix[j][i] 交换\n        for i in range(n):\n            for j in range(i + 1, n):\n                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n\n        # 第二步：每一行左右反转\n        for row in matrix:\n            row.reverse()",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)",
      "detail": "原地处理 n×n 矩阵中每个元素常数次。"
    },
    "commonPitfalls": [
      "行列下标写反。",
      "边界判断漏掉单行单列。",
      "原地标记后忘记恢复或影响后续搜索。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "49": {
    "leetcodeId": 49,
    "title": "字母异位词分组",
    "slug": "group-anagrams",
    "coreIdea": "字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。",
    "handwriteSteps": [
      "先说暴力解的重复查找在哪里。",
      "定义哈希表 key/value 分别保存什么。",
      "遍历时先查询再更新哈希表，避免自匹配或漏算。",
      "用重复值、负数、空/极小输入检查边界。"
    ],
    "edgeCases": [
      {
        "input": "strs=[\"\"]",
        "expected": "[[\"\"]]",
        "why": "空字符串也是合法 key。"
      },
      {
        "input": "strs=[\"a\"]",
        "expected": "[[\"a\"]]",
        "why": "单元素。"
      },
      {
        "input": "strs=[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "expected": "三组",
        "why": "标准异位词分组。"
      }
    ],
    "annotatedCode": "# 核心思路：字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 strs=[\"\"] 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n\n        for word in strs:\n            # 异位词排序后的字符序列完全相同\n            key = ''.join(sorted(word))\n            groups[key].append(word)\n\n        return list(groups.values())",
    "complexity": {
      "time": "O(n·klogk)",
      "space": "O(nk)",
      "detail": "n 是字符串数量，k 是单词最大长度；排序每个字符串需要 O(klogk)。"
    },
    "commonPitfalls": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "53": {
    "leetcodeId": 53,
    "title": "最大子数组和",
    "slug": "maximum-subarray",
    "coreIdea": "dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。",
    "handwriteSteps": [
      "先找数组结构：前缀、区间、排序或原地标记。",
      "定义扫描过程中维护的不变量。",
      "每次更新前确认是否破坏原相对顺序或边界。",
      "用空/单元素、重复值、全有序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[-2,1,-3,4,-1,2,1,-5,4]",
        "expected": "6",
        "why": "[4,-1,2,1]。"
      },
      {
        "input": "nums=[-1]",
        "expected": "-1",
        "why": "全负数不能初始化为 0。"
      },
      {
        "input": "nums=[5,4,-1,7,8]",
        "expected": "23",
        "why": "整个数组最优。"
      }
    ],
    "annotatedCode": "# 核心思路：dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-2,1,-3,4,-1,2,1,-5,4] 检查代码。\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        cur = ans = nums[0]  # 必须用 nums[0] 初始化，防止全负数错误\n\n        for x in nums[1:]:\n            # 如果 cur 为负，接上它只会拖累 x，所以从 x 重新开始\n            cur = max(x, cur + x)\n            ans = max(ans, cur)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "Kadane 算法线性扫描，只维护当前最优和全局最优。"
    },
    "commonPitfalls": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "55": {
    "leetcodeId": 55,
    "title": "跳跃游戏",
    "slug": "jump-game",
    "coreIdea": "维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。",
    "handwriteSteps": [
      "先说明局部最优选择是什么。",
      "证明这个选择不会损失全局最优。",
      "遍历中维护覆盖范围、最优候选或排序结构。",
      "用反例尝试推翻贪心，确认边界。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,3,1,1,4]",
        "expected": "true",
        "why": "最远覆盖能越过终点。"
      },
      {
        "input": "nums=[3,2,1,0,4]",
        "expected": "false",
        "why": "会卡在下标 3 的 0。"
      },
      {
        "input": "nums=[0]",
        "expected": "true",
        "why": "起点就是终点。"
      }
    ],
    "annotatedCode": "# 核心思路：维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,1,1,4] 检查代码。\nclass Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        farthest = 0\n\n        for i, jump in enumerate(nums):\n            if i > farthest:\n                return False  # 当前下标都到不了，后面更不可能\n            farthest = max(farthest, i + jump)\n            if farthest >= len(nums) - 1:\n                return True\n\n        return True",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "每个位置只扫描一次，只维护最远覆盖范围。"
    },
    "commonPitfalls": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "56": {
    "leetcodeId": 56,
    "title": "合并区间",
    "slug": "merge-intervals",
    "coreIdea": "先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。",
    "handwriteSteps": [
      "先找数组结构：前缀、区间、排序或原地标记。",
      "定义扫描过程中维护的不变量。",
      "每次更新前确认是否破坏原相对顺序或边界。",
      "用空/单元素、重复值、全有序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "intervals=[[1,3],[2,6],[8,10],[15,18]]",
        "expected": "[[1,6],[8,10],[15,18]]",
        "why": "标准重叠合并。"
      },
      {
        "input": "intervals=[[1,4],[4,5]]",
        "expected": "[[1,5]]",
        "why": "端点相等也算重叠。"
      },
      {
        "input": "intervals=[[1,4],[2,3]]",
        "expected": "[[1,4]]",
        "why": "被包含区间不能缩短右端点。"
      }
    ],
    "annotatedCode": "# 核心思路：先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 intervals=[[1,3],[2,6],[8,10],[15,18]] 检查代码。\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n\n        for start, end in intervals:\n            if not merged or start > merged[-1][1]:\n                merged.append([start, end])\n            else:\n                # 当前区间与最后一个区间重叠，右端点取更大值\n                merged[-1][1] = max(merged[-1][1], end)\n\n        return merged",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(n)",
      "detail": "排序是主要成本；结果数组最坏保存 n 个区间。"
    },
    "commonPitfalls": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "62": {
    "leetcodeId": 62,
    "title": "不同路径",
    "slug": "unique-paths",
    "coreIdea": "到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "m=3, n=7",
        "expected": "28",
        "why": "标准样例。"
      },
      {
        "input": "m=1, n=10",
        "expected": "1",
        "why": "只有一行，只能一直向右。"
      },
      {
        "input": "m=10, n=1",
        "expected": "1",
        "why": "只有一列，只能一直向下。"
      }
    ],
    "annotatedCode": "# 核心思路：到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 m=3, n=7 检查代码。\nclass Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # 第一行每个格子都只有 1 种走法\n        dp = [1] * n\n\n        for _ in range(1, m):\n            for j in range(1, n):\n                # dp[j] 是上方，dp[j-1] 是左方\n                dp[j] += dp[j - 1]\n\n        return dp[-1]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)",
      "detail": "滚动数组 dp[j] 表示当前行第 j 列路径数。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "64": {
    "leetcodeId": 64,
    "title": "最小路径和",
    "slug": "minimum-path-sum",
    "coreIdea": "dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "grid=[[1,3,1],[1,5,1],[4,2,1]]",
        "expected": "7",
        "why": "路径 1→3→1→1→1。"
      },
      {
        "input": "grid=[[1,2,3]]",
        "expected": "6",
        "why": "只有一行。"
      },
      {
        "input": "grid=[[1],[2],[3]]",
        "expected": "6",
        "why": "只有一列。"
      }
    ],
    "annotatedCode": "# 核心思路：dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 grid=[[1,3,1],[1,5,1],[4,2,1]] 检查代码。\nclass Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n\n        # 初始化第一行：只能从左边来\n        for j in range(1, n):\n            dp[j] = dp[j - 1] + grid[0][j]\n\n        for i in range(1, m):\n            dp[0] += grid[i][0]  # 第一列只能从上方来\n            for j in range(1, n):\n                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]\n\n        return dp[-1]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)",
      "detail": "每个格子处理一次；滚动数组只保留一行。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "70": {
    "leetcodeId": 70,
    "title": "爬楼梯",
    "slug": "climbing-stairs",
    "coreIdea": "到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "n=1",
        "expected": "1",
        "why": "一阶只有一种。"
      },
      {
        "input": "n=2",
        "expected": "2",
        "why": "1+1 或 2。"
      },
      {
        "input": "n=3",
        "expected": "3",
        "why": "从前两个状态递推。"
      }
    ],
    "annotatedCode": "# 核心思路：到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n\n        prev2, prev1 = 1, 2  # f(1), f(2)\n        for _ in range(3, n + 1):\n            cur = prev1 + prev2\n            prev2, prev1 = prev1, cur\n\n        return prev1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "只需要前两阶答案，滚动变量即可。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "72": {
    "leetcodeId": 72,
    "title": "编辑距离",
    "slug": "edit-distance",
    "coreIdea": "dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "word1=\"horse\", word2=\"ros\"",
        "expected": "3",
        "why": "标准样例。"
      },
      {
        "input": "word1=\"\", word2=\"abc\"",
        "expected": "3",
        "why": "空串变目标串只能插入。"
      },
      {
        "input": "word1=\"abc\", word2=\"abc\"",
        "expected": "0",
        "why": "完全相同无需操作。"
      }
    ],
    "annotatedCode": "# 核心思路：dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 word1=\"horse\", word2=\"ros\" 检查代码。\nclass Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n\n        # word1 前 i 个字符变成空串：删除 i 次\n        for i in range(m + 1):\n            dp[i][0] = i\n        # 空串变成 word2 前 j 个字符：插入 j 次\n        for j in range(n + 1):\n            dp[0][j] = j\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = 1 + min(\n                        dp[i - 1][j],     # 删除 word1[i-1]\n                        dp[i][j - 1],     # 插入 word2[j-1]\n                        dp[i - 1][j - 1]  # 替换 word1[i-1]\n                    )\n\n        return dp[m][n]",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)",
      "detail": "二维表有 (m+1)(n+1) 个状态，每个状态常数转移。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "75": {
    "leetcodeId": 75,
    "title": "颜色分类",
    "slug": "sort-colors",
    "coreIdea": "荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,0,2,1,1,0]",
        "expected": "[0,0,1,1,2,2]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[0]",
        "expected": "[0]",
        "why": "单元素。"
      },
      {
        "input": "nums=[2,2,1,0,0]",
        "expected": "[0,0,1,2,2]",
        "why": "2 换到右侧后，i 不能立刻加一，要继续检查换来的数。"
      }
    ],
    "annotatedCode": "# 核心思路：荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,0,2,1,1,0] 检查代码。\nclass Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        left, i, right = 0, 0, len(nums) - 1\n\n        while i <= right:\n            if nums[i] == 0:\n                nums[left], nums[i] = nums[i], nums[left]\n                left += 1\n                i += 1\n            elif nums[i] == 2:\n                nums[i], nums[right] = nums[right], nums[i]\n                right -= 1\n                # 注意：这里 i 不加一，因为换过来的元素还没检查\n            else:\n                i += 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "每个元素最多被交换到所属区域一次，原地排序。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "76": {
    "leetcodeId": 76,
    "title": "最小覆盖子串",
    "slug": "minimum-window-substring",
    "coreIdea": "滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。",
    "handwriteSteps": [
      "明确窗口内维护的条件是什么。",
      "右指针扩张并更新窗口状态。",
      "当窗口不满足/已经满足条件时移动左指针。",
      "每次更新答案时确认窗口左右边界是否闭区间。"
    ],
    "edgeCases": [
      {
        "input": "s=\"ADOBECODEBANC\", t=\"ABC\"",
        "expected": "\"BANC\"",
        "why": "标准最小覆盖。"
      },
      {
        "input": "s=\"a\", t=\"aa\"",
        "expected": "\"\"",
        "why": "窗口无法满足重复字符需求。"
      },
      {
        "input": "s=\"aa\", t=\"aa\"",
        "expected": "\"aa\"",
        "why": "t 中重复字符需要足够次数。"
      }
    ],
    "annotatedCode": "# 核心思路：滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"ADOBECODEBANC\", t=\"ABC\" 检查代码。\nfrom collections import Counter, defaultdict\n\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        window = defaultdict(int)\n        required = len(need)  # 有多少种字符需要满足频次\n        formed = 0            # 当前有多少种字符已经满足频次\n        left = 0\n        best_len = float('inf')\n        best_start = 0\n\n        for right, ch in enumerate(s):\n            window[ch] += 1\n            if ch in need and window[ch] == need[ch]:\n                formed += 1\n\n            # 当前窗口已经覆盖 t，尝试收缩到最短\n            while formed == required:\n                if right - left + 1 < best_len:\n                    best_len = right - left + 1\n                    best_start = left\n\n                out = s[left]\n                window[out] -= 1\n                if out in need and window[out] < need[out]:\n                    formed -= 1\n                left += 1\n\n        return '' if best_len == float('inf') else s[best_start:best_start + best_len]",
    "complexity": {
      "time": "O(|s|+|t|)",
      "space": "O(字符集大小)",
      "detail": "左右指针都只向右移动；计数字典大小受字符集限制。"
    },
    "commonPitfalls": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "78": {
    "leetcodeId": 78,
    "title": "子集",
    "slug": "subsets",
    "coreIdea": "子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,2,3]",
        "expected": "8 个子集",
        "why": "标准样例。"
      },
      {
        "input": "nums=[]",
        "expected": "[[]]",
        "why": "空集也是子集。"
      },
      {
        "input": "nums=[0]",
        "expected": "[[],[0]]",
        "why": "单元素。"
      }
    ],
    "annotatedCode": "# 核心思路：子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n\n        def backtrack(start: int) -> None:\n            # 子集题：树上的每一个节点都是答案\n            ans.append(path[:])\n\n            for i in range(start, len(nums)):\n                path.append(nums[i])\n                backtrack(i + 1)\n                path.pop()\n\n        backtrack(0)\n        return ans",
    "complexity": {
      "time": "O(2^n·n)",
      "space": "O(n)",
      "detail": "共有 2^n 个子集，拷贝每个子集最坏 O(n)；递归深度 n。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "79": {
    "leetcodeId": 79,
    "title": "单词搜索",
    "slug": "word-search",
    "coreIdea": "从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。",
    "handwriteSteps": [
      "画出搜索树：每层做什么选择。",
      "写终止条件，并在终止时拷贝 path。",
      "for 循环横向枚举，递归纵向深入。",
      "递归回来必须撤销选择，必要时排序剪枝。"
    ],
    "edgeCases": [
      {
        "input": "board=[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word=\"ABCCED\"",
        "expected": "true",
        "why": "标准路径。"
      },
      {
        "input": "word 长度 > m*n",
        "expected": "false",
        "why": "格子不能重复使用。"
      },
      {
        "input": "board=[[\"a\"]], word=\"a\"",
        "expected": "true",
        "why": "单格匹配。"
      }
    ],
    "annotatedCode": "# 核心思路：从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 board=[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word=\"ABCCED\" 检查代码。\nclass Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        if len(word) > m * n:\n            return False\n\n        def dfs(i: int, j: int, k: int) -> bool:\n            # k 表示正在匹配 word[k]\n            if k == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:\n                return False\n\n            saved = board[i][j]\n            board[i][j] = '#'  # 标记已访问，防止同一路径重复使用\n            found = (\n                dfs(i + 1, j, k + 1) or\n                dfs(i - 1, j, k + 1) or\n                dfs(i, j + 1, k + 1) or\n                dfs(i, j - 1, k + 1)\n            )\n            board[i][j] = saved  # 回溯恢复现场\n            return found\n\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0):\n                    return True\n        return False",
    "complexity": {
      "time": "O(mn·3^L)",
      "space": "O(L)",
      "detail": "每个起点 DFS，除第一步外最多 3 个方向可走；L 为单词长度，递归深度 L。"
    },
    "commonPitfalls": [
      "忘记 path.pop() 回溯，导致结果互相污染。",
      "终止条件没有拷贝 path，而是直接引用。",
      "start、used、剪枝条件混用。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "81": {
    "leetcodeId": 81,
    "title": "搜索旋转排序数组 II",
    "slug": "search-in-rotated-sorted-array-ii",
    "coreIdea": "有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。",
    "handwriteSteps": [
      "明确二分区间是闭区间还是左闭右开。",
      "写出 mid 后判断哪一半一定无答案。",
      "更新 left/right 时保证区间收缩。",
      "用单元素、无答案、重复/旋转边界检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,5,6,0,0,1,2], target=0",
        "expected": "true",
        "why": "标准样例。"
      },
      {
        "input": "nums=[1,0,1,1,1], target=0",
        "expected": "true",
        "why": "重复值会干扰有序半边判断。"
      },
      {
        "input": "nums=[1,1,1,1], target=2",
        "expected": "false",
        "why": "最坏退化为线性收缩。"
      }
    ],
    "annotatedCode": "# 核心思路：有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,5,6,0,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> bool:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return True\n\n            # 重复值挡住判断，只能安全收缩\n            if nums[left] == nums[mid] == nums[right]:\n                left += 1\n                right -= 1\n            elif nums[left] <= nums[mid]:  # 左半边有序\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:                          # 右半边有序\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return False",
    "complexity": {
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)",
      "detail": "重复值极端情况下每次只能缩小一格，例如全是 1。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "84": {
    "leetcodeId": 84,
    "title": "柱状图中最大的矩形",
    "slug": "largest-rectangle-in-histogram",
    "coreIdea": "单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "heights=[2,1,5,6,2,3]",
        "expected": "10",
        "why": "标准样例。"
      },
      {
        "input": "heights=[2,4]",
        "expected": "4",
        "why": "两根柱子。"
      },
      {
        "input": "heights=[1,1,1]",
        "expected": "3",
        "why": "相等高度要能累积宽度。"
      }
    ],
    "annotatedCode": "# 核心思路：单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 heights=[2,1,5,6,2,3] 检查代码。\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # 两端加 0 哨兵，方便所有柱子最终都出栈\n        heights = [0] + heights + [0]\n        stack = []  # 栈中下标对应的高度单调递增\n        ans = 0\n\n        for i, h in enumerate(heights):\n            while stack and h < heights[stack[-1]]:\n                mid = stack.pop()\n                height = heights[mid]\n                width = i - stack[-1] - 1  # 左右第一个更矮柱子之间的宽度\n                ans = max(ans, height * width)\n            stack.append(i)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个柱子最多入栈、出栈一次；哨兵 0 负责清空栈。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "85": {
    "leetcodeId": 85,
    "title": "最大矩形",
    "slug": "maximal-rectangle",
    "coreIdea": "把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "matrix 全是 \"0\"",
        "expected": "0",
        "why": "没有矩形。"
      },
      {
        "input": "matrix=[[\"1\"]]",
        "expected": "1",
        "why": "单个 1。"
      },
      {
        "input": "经典 4×5 样例",
        "expected": "6",
        "why": "连续多行高度累积。"
      }
    ],
    "annotatedCode": "# 核心思路：把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 \"0\" 检查代码。\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        if not matrix or not matrix[0]:\n            return 0\n\n        m, n = len(matrix), len(matrix[0])\n        heights = [0] * n\n        ans = 0\n\n        def largest_rectangle() -> int:\n            arr = [0] + heights + [0]\n            stack = []\n            best = 0\n            for i, h in enumerate(arr):\n                while stack and h < arr[stack[-1]]:\n                    mid = stack.pop()\n                    best = max(best, arr[mid] * (i - stack[-1] - 1))\n                stack.append(i)\n            return best\n\n        for i in range(m):\n            for j in range(n):\n                # 如果当前位置是 1，高度加一；遇到 0，高度断开归零\n                heights[j] = heights[j] + 1 if matrix[i][j] == '1' else 0\n            ans = max(ans, largest_rectangle())\n\n        return ans",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)",
      "detail": "每行更新一次高度并在线性时间求柱状图最大面积。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "94": {
    "leetcodeId": 94,
    "title": "二叉树的中序遍历",
    "slug": "binary-tree-inorder-traversal",
    "coreIdea": "中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[]",
        "expected": "[]",
        "why": "空树。"
      },
      {
        "input": "root=[1,null,2,3]",
        "expected": "[1,3,2]",
        "why": "标准样例。"
      },
      {
        "input": "只有左链",
        "expected": "从叶子到根",
        "why": "验证左-根-右顺序。"
      }
    ],
    "annotatedCode": "# 核心思路：中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        stack = []\n        cur = root\n\n        while cur or stack:\n            # 先一路走到最左边\n            while cur:\n                stack.append(cur)\n                cur = cur.left\n\n            cur = stack.pop()\n            ans.append(cur.val)  # 左子树访问完后访问根\n            cur = cur.right      # 再处理右子树\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点入栈出栈一次；栈深度等于树高 h，最坏 O(n)。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "96": {
    "leetcodeId": 96,
    "title": "不同的二叉搜索树",
    "slug": "unique-binary-search-trees",
    "coreIdea": "以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "n=1",
        "expected": "1",
        "why": "单节点只有一种。"
      },
      {
        "input": "n=3",
        "expected": "5",
        "why": "卡特兰数经典样例。"
      },
      {
        "input": "n=0（理论边界）",
        "expected": "1",
        "why": "空树作为组合乘法单位。"
      }
    ],
    "annotatedCode": "# 核心思路：以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def numTrees(self, n: int) -> int:\n        # dp[i] = i 个不同节点能组成多少种 BST\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        dp[1] = 1\n\n        for nodes in range(2, n + 1):\n            for left_count in range(nodes):\n                right_count = nodes - 1 - left_count\n                dp[nodes] += dp[left_count] * dp[right_count]\n\n        return dp[n]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)",
      "detail": "dp[i] 需要枚举 i 个根位置，i 从 1 到 n。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "98": {
    "leetcodeId": 98,
    "title": "验证二叉搜索树",
    "slug": "validate-binary-search-tree",
    "coreIdea": "BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[2,1,3]",
        "expected": "true",
        "why": "标准合法 BST。"
      },
      {
        "input": "root=[5,1,4,null,null,3,6]",
        "expected": "false",
        "why": "3 在 5 的右子树中却小于 5。"
      },
      {
        "input": "存在重复值",
        "expected": "false",
        "why": "BST 通常要求严格小于/大于。"
      }
    ],
    "annotatedCode": "# 核心思路：BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[2,1,3] 检查代码。\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:\n            if not node:\n                return True\n            if not (low < node.val < high):\n                return False\n            # 左子树上界变成 node.val；右子树下界变成 node.val\n            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n\n        return dfs(root, float('-inf'), float('inf'))",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；递归栈深度为树高 h。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "101": {
    "leetcodeId": 101,
    "title": "对称二叉树",
    "slug": "symmetric-tree",
    "coreIdea": "判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[1,2,2,3,4,4,3]",
        "expected": "true",
        "why": "标准对称。"
      },
      {
        "input": "root=[1,2,2,null,3,null,3]",
        "expected": "false",
        "why": "值类似但结构不对称。"
      },
      {
        "input": "root=[]",
        "expected": "true",
        "why": "空树可视为对称。"
      }
    ],
    "annotatedCode": "# 核心思路：判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,2,3,4,4,3] 检查代码。\nclass Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:\n            if not a and not b:\n                return True\n            if not a or not b:\n                return False\n            if a.val != b.val:\n                return False\n            return mirror(a.left, b.right) and mirror(a.right, b.left)\n\n        return True if not root else mirror(root.left, root.right)",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点最多比较一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "102": {
    "leetcodeId": 102,
    "title": "二叉树的层序遍历",
    "slug": "binary-tree-level-order-traversal",
    "coreIdea": "层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[]",
        "expected": "[]",
        "why": "空树。"
      },
      {
        "input": "root=[3,9,20,null,null,15,7]",
        "expected": "[[3],[9,20],[15,7]]",
        "why": "标准样例。"
      },
      {
        "input": "只有一条链",
        "expected": "每层一个元素",
        "why": "队列宽度为 1。"
      }
    ],
    "annotatedCode": "# 核心思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        if not root:\n            return []\n\n        ans = []\n        queue = deque([root])\n\n        while queue:\n            level = []\n            for _ in range(len(queue)):  # 当前队列长度就是当前层节点数\n                node = queue.popleft()\n                level.append(node.val)\n                if node.left:\n                    queue.append(node.left)\n                if node.right:\n                    queue.append(node.right)\n            ans.append(level)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(w)",
      "detail": "每个节点入队出队一次；w 是树最大层宽，最坏 O(n)。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "104": {
    "leetcodeId": 104,
    "title": "二叉树的最大深度",
    "slug": "maximum-depth-of-binary-tree",
    "coreIdea": "树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[]",
        "expected": "0",
        "why": "空树深度为 0。"
      },
      {
        "input": "root=[3,9,20,null,null,15,7]",
        "expected": "3",
        "why": "标准样例。"
      },
      {
        "input": "单节点",
        "expected": "1",
        "why": "只有根节点。"
      }
    ],
    "annotatedCode": "# 核心思路：树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root:\n            return 0\n        left_depth = self.maxDepth(root.left)\n        right_depth = self.maxDepth(root.right)\n        return max(left_depth, right_depth) + 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；递归栈深度为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "105": {
    "leetcodeId": 105,
    "title": "从前序与中序遍历序列构造二叉树",
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
    "coreIdea": "前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]",
        "expected": "原树",
        "why": "标准样例。"
      },
      {
        "input": "preorder=[-1], inorder=[-1]",
        "expected": "单节点",
        "why": "最小树。"
      },
      {
        "input": "左/右子树为空",
        "expected": "正常构造",
        "why": "区间边界不能写错。"
      }
    ],
    "annotatedCode": "# 核心思路：前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 preorder=[3,9,20,15,7], inorder=[9,3,15,20,7] 检查代码。\nclass Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        index = {val: i for i, val in enumerate(inorder)}\n        pre_pos = 0\n\n        def build(in_left: int, in_right: int) -> Optional[TreeNode]:\n            nonlocal pre_pos\n            if in_left > in_right:\n                return None\n\n            root_val = preorder[pre_pos]\n            pre_pos += 1\n            root = TreeNode(root_val)\n            mid = index[root_val]\n\n            # 前序顺序是 根-左-右，所以必须先构造左子树\n            root.left = build(in_left, mid - 1)\n            root.right = build(mid + 1, in_right)\n            return root\n\n        return build(0, len(inorder) - 1)",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "哈希表 O(1) 查询根在中序的位置；每个节点递归构造一次。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "114": {
    "leetcodeId": 114,
    "title": "二叉树展开为链表",
    "slug": "flatten-binary-tree-to-linked-list",
    "coreIdea": "按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[1,2,5,3,4,null,6]",
        "expected": "[1,null,2,null,3,null,4,null,5,null,6]",
        "why": "标准前序展开。"
      },
      {
        "input": "root=[]",
        "expected": "[]",
        "why": "空树。"
      },
      {
        "input": "只有左子树",
        "expected": "全部接到右指针",
        "why": "左指针必须置空。"
      }
    ],
    "annotatedCode": "# 核心思路：按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,5,3,4,null,6] 检查代码。\nclass Solution:\n    def flatten(self, root: Optional[TreeNode]) -> None:\n        prev = None\n\n        def dfs(node: Optional[TreeNode]) -> None:\n            nonlocal prev\n            if not node:\n                return\n            # 反向前序：先右后左，最后处理根\n            dfs(node.right)\n            dfs(node.left)\n\n            node.right = prev\n            node.left = None\n            prev = node\n\n        dfs(root)",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点改指针一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "121": {
    "leetcodeId": 121,
    "title": "买卖股票的最佳时机",
    "slug": "best-time-to-buy-and-sell-stock",
    "coreIdea": "遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。",
    "handwriteSteps": [
      "先说明局部最优选择是什么。",
      "证明这个选择不会损失全局最优。",
      "遍历中维护覆盖范围、最优候选或排序结构。",
      "用反例尝试推翻贪心，确认边界。"
    ],
    "edgeCases": [
      {
        "input": "prices=[7,1,5,3,6,4]",
        "expected": "5",
        "why": "1 买 6 卖。"
      },
      {
        "input": "prices=[7,6,4,3,1]",
        "expected": "0",
        "why": "一直下跌不交易。"
      },
      {
        "input": "prices=[1,2]",
        "expected": "1",
        "why": "最小有效长度。"
      }
    ],
    "annotatedCode": "# 核心思路：遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[7,1,5,3,6,4] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        ans = 0\n\n        for price in prices:\n            min_price = min(min_price, price)      # 到今天为止最低买入价\n            ans = max(ans, price - min_price)      # 今天卖出能赚多少\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "只需一次扫描和两个变量。"
    },
    "commonPitfalls": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "124": {
    "leetcodeId": 124,
    "title": "二叉树中的最大路径和",
    "slug": "binary-tree-maximum-path-sum",
    "coreIdea": "对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[1,2,3]",
        "expected": "6",
        "why": "路径 2→1→3。"
      },
      {
        "input": "root=[-10,9,20,null,null,15,7]",
        "expected": "42",
        "why": "路径 15→20→7。"
      },
      {
        "input": "root=[-3]",
        "expected": "-3",
        "why": "全负数不能把答案初始化为 0。"
      }
    ],
    "annotatedCode": "# 核心思路：对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3] 检查代码。\nclass Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        ans = float('-inf')\n\n        def gain(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n\n            # 负贡献不如不要，所以与 0 取 max\n            left = max(gain(node.left), 0)\n            right = max(gain(node.right), 0)\n\n            # 以当前节点为最高点的路径，可以同时接左右两边\n            ans = max(ans, node.val + left + right)\n\n            # 返回给父节点时只能选一边，不能分叉\n            return node.val + max(left, right)\n\n        gain(root)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点后序遍历一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "128": {
    "leetcodeId": 128,
    "title": "最长连续序列",
    "slug": "longest-consecutive-sequence",
    "coreIdea": "把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。",
    "handwriteSteps": [
      "先说暴力解的重复查找在哪里。",
      "定义哈希表 key/value 分别保存什么。",
      "遍历时先查询再更新哈希表，避免自匹配或漏算。",
      "用重复值、负数、空/极小输入检查边界。"
    ],
    "edgeCases": [
      {
        "input": "nums=[100,4,200,1,3,2]",
        "expected": "4",
        "why": "序列 1,2,3,4。"
      },
      {
        "input": "nums=[]",
        "expected": "0",
        "why": "空数组。"
      },
      {
        "input": "nums=[1,2,0,1]",
        "expected": "3",
        "why": "重复数字用集合去重。"
      }
    ],
    "annotatedCode": "# 核心思路：把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[100,4,200,1,3,2] 检查代码。\nclass Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        num_set = set(nums)\n        ans = 0\n\n        for x in num_set:\n            # 只有 x 是序列起点时才开始数，避免从中间重复数\n            if x - 1 not in num_set:\n                cur = x\n                length = 1\n                while cur + 1 in num_set:\n                    cur += 1\n                    length += 1\n                ans = max(ans, length)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个数最多作为连续序列的一部分被访问一次。"
    },
    "commonPitfalls": [
      "哈希表 key/value 含义写反，导致返回数值而不是下标。",
      "更新哈希表的先后顺序错误，可能把当前元素和自己配对。",
      "没有考虑重复值或负数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "136": {
    "leetcodeId": 136,
    "title": "只出现一次的数字",
    "slug": "single-number",
    "coreIdea": "异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,2,1]",
        "expected": "1",
        "why": "基础样例。"
      },
      {
        "input": "nums=[4,1,2,1,2]",
        "expected": "4",
        "why": "顺序不影响异或结果。"
      },
      {
        "input": "nums=[-1]",
        "expected": "-1",
        "why": "负数也能异或。"
      }
    ],
    "annotatedCode": "# 核心思路：异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,1] 检查代码。\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ans = 0\n        for x in nums:\n            ans ^= x  # 成对的数会被异或抵消\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "线性扫描数组，常数变量保存异或结果。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "139": {
    "leetcodeId": 139,
    "title": "单词拆分",
    "slug": "word-break",
    "coreIdea": "dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "s=\"leetcode\", wordDict=[\"leet\",\"code\"]",
        "expected": "true",
        "why": "标准样例。"
      },
      {
        "input": "s=\"catsandog\", wordDict=[\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]",
        "expected": "false",
        "why": "局部能拆不代表整体能拆。"
      },
      {
        "input": "s=\"aaaaaaa\", wordDict=[\"aaaa\",\"aaa\"]",
        "expected": "true",
        "why": "需要不同长度组合。"
      }
    ],
    "annotatedCode": "# 核心思路：dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"leetcode\", wordDict=[\"leet\",\"code\"] 检查代码。\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True  # 空串可以被拆分\n\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n\n        return dp[n]",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)",
      "detail": "枚举 i 和 j 两层；哈希集合查询单词平均 O(1)，Python 切片有额外成本但思路复杂度按 O(n²) 记。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "141": {
    "leetcodeId": 141,
    "title": "环形链表",
    "slug": "linked-list-cycle",
    "coreIdea": "快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[3,2,0,-4], pos=1",
        "expected": "true",
        "why": "标准有环。"
      },
      {
        "input": "head=[1,2], pos=0",
        "expected": "true",
        "why": "环连回头节点。"
      },
      {
        "input": "head=[1], pos=-1",
        "expected": "false",
        "why": "单节点无环。"
      }
    ],
    "annotatedCode": "# 核心思路：快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                return True\n\n        return False",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "快慢指针访问节点次数线性；不需要额外集合。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "142": {
    "leetcodeId": 142,
    "title": "环形链表 II",
    "slug": "linked-list-cycle-ii",
    "coreIdea": "快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[3,2,0,-4], pos=1",
        "expected": "节点 2",
        "why": "标准入口。"
      },
      {
        "input": "head=[1,2], pos=0",
        "expected": "节点 1",
        "why": "入口是头节点。"
      },
      {
        "input": "head=[1], pos=-1",
        "expected": "null",
        "why": "无环返回 null。"
      }
    ],
    "annotatedCode": "# 核心思路：快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                # 相遇后，一个从头出发，一个从相遇点出发\n                p = head\n                while p != slow:\n                    p = p.next\n                    slow = slow.next\n                return p\n\n        return None",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "Floyd 判环加入口定位，均为线性步数。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "146": {
    "leetcodeId": 146,
    "title": "LRU 缓存",
    "slug": "lru-cache",
    "coreIdea": "哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "capacity=1，连续 put 两个 key",
        "expected": "只保留最新 key",
        "why": "容量极小时要正确淘汰。"
      },
      {
        "input": "get 不存在的 key",
        "expected": "-1",
        "why": "不能改变链表。"
      },
      {
        "input": "put 已存在 key",
        "expected": "更新值并移动到最近使用",
        "why": "不是新增容量。"
      }
    ],
    "annotatedCode": "# 核心思路：哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 capacity=1，连续 put 两个 key 检查代码。\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}  # key -> Node\n        self.head = Node()  # 虚拟头：最近使用端\n        self.tail = Node()  # 虚拟尾：最久使用端\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node: Node) -> None:\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node: Node) -> None:\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)  # 访问后变成最近使用\n        return node.val\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            node = self.cache[key]\n            node.val = value\n            self._remove(node)\n            self._add_to_front(node)\n            return\n\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n\n        if len(self.cache) > self.capacity:\n            old = self.tail.prev  # 虚拟尾前一个是真正最久未使用节点\n            self._remove(old)\n            del self.cache[old.key]",
    "complexity": {
      "time": "get/put 均摊 O(1)",
      "space": "O(capacity)",
      "detail": "字典保存 key 到链表节点；链表最多 capacity 个真实节点。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "148": {
    "leetcodeId": 148,
    "title": "排序链表",
    "slug": "sort-list",
    "coreIdea": "链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[4,2,1,3]",
        "expected": "[1,2,3,4]",
        "why": "标准样例。"
      },
      {
        "input": "head=[]",
        "expected": "[]",
        "why": "空链表。"
      },
      {
        "input": "head=[-1,5,3,4,0]",
        "expected": "[-1,0,3,4,5]",
        "why": "含负数。"
      }
    ],
    "annotatedCode": "# 核心思路：链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[4,2,1,3] 检查代码。\nclass Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n\n        # 快慢指针找中点，同时 pre 用于断开前半段\n        slow = fast = head\n        pre = None\n        while fast and fast.next:\n            pre = slow\n            slow = slow.next\n            fast = fast.next.next\n        pre.next = None\n\n        left = self.sortList(head)\n        right = self.sortList(slow)\n        return self.merge(left, right)\n\n    def merge(self, a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n        while a and b:\n            if a.val <= b.val:\n                cur.next = a\n                a = a.next\n            else:\n                cur.next = b\n                b = b.next\n            cur = cur.next\n        cur.next = a if a else b\n        return dummy.next",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(logn)",
      "detail": "每层合并 O(n)，共 logn 层；递归栈 O(logn)。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "152": {
    "leetcodeId": 152,
    "title": "乘积最大子数组",
    "slug": "maximum-product-subarray",
    "coreIdea": "乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,3,-2,4]",
        "expected": "6",
        "why": "2×3。"
      },
      {
        "input": "nums=[-2,0,-1]",
        "expected": "0",
        "why": "0 会截断乘积。"
      },
      {
        "input": "nums=[-2,3,-4]",
        "expected": "24",
        "why": "两个负数相乘变最大。"
      }
    ],
    "annotatedCode": "# 核心思路：乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,-2,4] 检查代码。\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        max_prod = min_prod = ans = nums[0]\n\n        for x in nums[1:]:\n            if x < 0:\n                max_prod, min_prod = min_prod, max_prod\n            max_prod = max(x, max_prod * x)\n            min_prod = min(x, min_prod * x)\n            ans = max(ans, max_prod)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "线性扫描，只维护 max_prod/min_prod/ans。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "153": {
    "leetcodeId": 153,
    "title": "寻找旋转排序数组中的最小值",
    "slug": "find-minimum-in-rotated-sorted-array",
    "coreIdea": "无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。",
    "handwriteSteps": [
      "明确二分区间是闭区间还是左闭右开。",
      "写出 mid 后判断哪一半一定无答案。",
      "更新 left/right 时保证区间收缩。",
      "用单元素、无答案、重复/旋转边界检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[3,4,5,1,2]",
        "expected": "1",
        "why": "标准旋转。"
      },
      {
        "input": "nums=[11,13,15,17]",
        "expected": "11",
        "why": "没有旋转。"
      },
      {
        "input": "nums=[2,1]",
        "expected": "1",
        "why": "两个元素。"
      }
    ],
    "annotatedCode": "# 核心思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,4,5,1,2] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            else:\n                right = mid\n\n        return nums[left]",
    "complexity": {
      "time": "O(log n)",
      "space": "O(1)",
      "detail": "每次比较 mid 和 right 都能排除一半。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "154": {
    "leetcodeId": 154,
    "title": "寻找旋转排序数组中的最小值 II",
    "slug": "find-minimum-in-rotated-sorted-array-ii",
    "coreIdea": "有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。",
    "handwriteSteps": [
      "明确二分区间是闭区间还是左闭右开。",
      "写出 mid 后判断哪一半一定无答案。",
      "更新 left/right 时保证区间收缩。",
      "用单元素、无答案、重复/旋转边界检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,2,2,0,1]",
        "expected": "0",
        "why": "标准重复旋转。"
      },
      {
        "input": "nums=[1,3,5]",
        "expected": "1",
        "why": "无重复也能处理。"
      },
      {
        "input": "nums=[1,1,1,0,1]",
        "expected": "0",
        "why": "重复值挡住二分判断。"
      }
    ],
    "annotatedCode": "# 核心思路：有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,2,0,1] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            elif nums[mid] < nums[right]:\n                right = mid\n            else:\n                right -= 1  # 无法判断，安全丢掉一个重复右端点\n\n        return nums[left]",
    "complexity": {
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)",
      "detail": "重复值极端情况下会退化，例如 [1,1,1,1]。"
    },
    "commonPitfalls": [
      "边界是闭区间还是左闭右开混用。",
      "left/right 更新不收缩，死循环。",
      "重复元素或旋转数组中无法判断有序半边时处理不当。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "155": {
    "leetcodeId": 155,
    "title": "最小栈",
    "slug": "min-stack",
    "coreIdea": "一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "push(-2),push(0),push(-3),getMin()",
        "expected": "-3",
        "why": "标准样例。"
      },
      {
        "input": "pop 后 getMin",
        "expected": "恢复上一个最小值",
        "why": "辅助栈必须同步弹出。"
      },
      {
        "input": "重复最小值",
        "expected": "仍正确",
        "why": "辅助栈每次都记录当前最小值。"
      }
    ],
    "annotatedCode": "# 核心思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 push(-2),push(0),push(-3),getMin() 检查代码。\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        # 当前最小值 = min(新值, 之前最小值)\n        if not self.min_stack:\n            self.min_stack.append(val)\n        else:\n            self.min_stack.append(min(val, self.min_stack[-1]))\n\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]",
    "complexity": {
      "time": "push/pop/top/getMin 均 O(1)",
      "space": "O(n)",
      "detail": "辅助栈与数据栈同长度，便于 pop 后恢复历史最小值。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "160": {
    "leetcodeId": 160,
    "title": "相交链表",
    "slug": "intersection-of-two-linked-lists",
    "coreIdea": "两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "A=[4,1,8,4,5], B=[5,6,1,8,4,5]",
        "expected": "节点 8",
        "why": "标准相交。"
      },
      {
        "input": "不相交",
        "expected": "null",
        "why": "两个指针最终同时为 None。"
      },
      {
        "input": "交点是头节点",
        "expected": "头节点",
        "why": "两链表完全相同。"
      }
    ],
    "annotatedCode": "# 核心思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 A=[4,1,8,4,5], B=[5,6,1,8,4,5] 检查代码。\nclass Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        p, q = headA, headB\n\n        while p != q:\n            p = p.next if p else headB\n            q = q.next if q else headA\n\n        return p",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)",
      "detail": "每个指针最多遍历两条链表。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "169": {
    "leetcodeId": 169,
    "title": "多数元素",
    "slug": "majority-element",
    "coreIdea": "摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[3,2,3]",
        "expected": "3",
        "why": "标准样例。"
      },
      {
        "input": "nums=[2,2,1,1,1,2,2]",
        "expected": "2",
        "why": "抵消后剩下 2。"
      },
      {
        "input": "nums=[1]",
        "expected": "1",
        "why": "单元素。"
      }
    ],
    "annotatedCode": "# 核心思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,3] 检查代码。\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        candidate = None\n        count = 0\n\n        for x in nums:\n            if count == 0:\n                candidate = x\n            count += 1 if x == candidate else -1\n\n        return candidate",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "一次扫描维护 candidate 和 count。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "198": {
    "leetcodeId": 198,
    "title": "打家劫舍",
    "slug": "house-robber",
    "coreIdea": "每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,2,3,1]",
        "expected": "4",
        "why": "偷 1 和 3。"
      },
      {
        "input": "nums=[2,7,9,3,1]",
        "expected": "12",
        "why": "偷 2、9、1。"
      },
      {
        "input": "nums=[5]",
        "expected": "5",
        "why": "单间房。"
      }
    ],
    "annotatedCode": "# 核心思路：每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,1] 检查代码。\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        prev2 = 0  # dp[i-2]\n        prev1 = 0  # dp[i-1]\n\n        for money in nums:\n            cur = max(prev1, prev2 + money)\n            prev2, prev1 = prev1, cur\n\n        return prev1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "滚动维护 dp[i-2] 和 dp[i-1]。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "200": {
    "leetcodeId": 200,
    "title": "岛屿数量",
    "slug": "number-of-islands",
    "coreIdea": "遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。",
    "handwriteSteps": [
      "先把问题翻译成点和边。",
      "选择 DFS/BFS/拓扑排序/并查集。",
      "维护 visited、入度或父节点等状态。",
      "用不连通、有环、单点图样例检查。"
    ],
    "edgeCases": [
      {
        "input": "全是 0",
        "expected": "0",
        "why": "没有岛。"
      },
      {
        "input": "全是 1",
        "expected": "1",
        "why": "整片连通。"
      },
      {
        "input": "对角线相邻的 1",
        "expected": "不连通",
        "why": "只算上下左右。"
      }
    ],
    "annotatedCode": "# 核心思路：遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 全是 0 检查代码。\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        ans = 0\n\n        def dfs(i: int, j: int) -> None:\n            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':\n                return\n            grid[i][j] = '0'  # 标记已访问，也可以理解为淹掉陆地\n            dfs(i + 1, j)\n            dfs(i - 1, j)\n            dfs(i, j + 1)\n            dfs(i, j - 1)\n\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    dfs(i, j)\n\n        return ans",
    "complexity": {
      "time": "O(mn)",
      "space": "O(mn)",
      "detail": "每个格子最多访问一次；递归栈最坏覆盖整张网格。"
    },
    "commonPitfalls": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "206": {
    "leetcodeId": 206,
    "title": "反转链表",
    "slug": "reverse-linked-list",
    "coreIdea": "遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[1,2,3,4,5]",
        "expected": "[5,4,3,2,1]",
        "why": "标准样例。"
      },
      {
        "input": "head=[]",
        "expected": "[]",
        "why": "空链表。"
      },
      {
        "input": "head=[1]",
        "expected": "[1]",
        "why": "单节点。"
      }
    ],
    "annotatedCode": "# 核心思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        cur = head\n\n        while cur:\n            nxt = cur.next      # 先保存原来的下一个节点\n            cur.next = prev     # 反转指针\n            prev = cur          # prev 前进\n            cur = nxt           # cur 前进\n\n        return prev",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "每个节点指针反转一次，只用三个指针。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "207": {
    "leetcodeId": 207,
    "title": "课程表",
    "slug": "course-schedule",
    "coreIdea": "课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。",
    "handwriteSteps": [
      "先把问题翻译成点和边。",
      "选择 DFS/BFS/拓扑排序/并查集。",
      "维护 visited、入度或父节点等状态。",
      "用不连通、有环、单点图样例检查。"
    ],
    "edgeCases": [
      {
        "input": "numCourses=2, prerequisites=[[1,0]]",
        "expected": "true",
        "why": "0 后可学 1。"
      },
      {
        "input": "numCourses=2, prerequisites=[[1,0],[0,1]]",
        "expected": "false",
        "why": "存在环。"
      },
      {
        "input": "prerequisites=[]",
        "expected": "true",
        "why": "没有依赖都能学。"
      }
    ],
    "annotatedCode": "# 核心思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 numCourses=2, prerequisites=[[1,0]] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        indegree = [0] * numCourses\n\n        for course, pre in prerequisites:\n            graph[pre].append(course)\n            indegree[course] += 1\n\n        queue = deque(i for i in range(numCourses) if indegree[i] == 0)\n        learned = 0\n\n        while queue:\n            cur = queue.popleft()\n            learned += 1\n            for nxt in graph[cur]:\n                indegree[nxt] -= 1\n                if indegree[nxt] == 0:\n                    queue.append(nxt)\n\n        return learned == numCourses",
    "complexity": {
      "time": "O(V+E)",
      "space": "O(V+E)",
      "detail": "V 是课程数，E 是先修关系数；建图和 BFS 都是线性。"
    },
    "commonPitfalls": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "208": {
    "leetcodeId": 208,
    "title": "实现 Trie",
    "slug": "implement-trie-prefix-tree",
    "coreIdea": "Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。",
    "handwriteSteps": [
      "定义 TrieNode：children 保存下一层字符边，is_end 标记完整单词结束。",
      "insert 时从 root 出发逐字符向下走，缺少节点就创建，最后把 is_end 置为 True。",
      "search 和 startsWith 共用查找过程；search 必须检查 is_end，startsWith 只要前缀路径存在。",
      "用 search(\"app\") 与 startsWith(\"app\") 区分“完整单词”和“前缀存在”。"
    ],
    "edgeCases": [
      {
        "input": "insert(\"apple\"), search(\"apple\")",
        "expected": "true",
        "why": "完整单词存在。"
      },
      {
        "input": "search(\"app\") 未插入 app",
        "expected": "false",
        "why": "前缀不等于完整单词。"
      },
      {
        "input": "startsWith(\"app\")",
        "expected": "true",
        "why": "前缀存在即可。"
      }
    ],
    "annotatedCode": "# 核心思路：Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 insert(\"apple\"), search(\"apple\") 检查代码。\nclass TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                node.children[ch] = TrieNode()\n            node = node.children[ch]\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True",
    "complexity": {
      "time": "insert/search/startsWith 均 O(L)",
      "space": "O(总字符数)",
      "detail": "L 为操作字符串长度；每个新字符最多创建一个节点。"
    },
    "commonPitfalls": [
      "把“前缀存在”误当成“完整单词存在”，导致 search(\"app\") 在只插入 apple 时返回 true。",
      "insert 后忘记在最后一个节点设置 is_end，所有 search 都会失败。",
      "children 的层级更新写错，没有让 node = node.children[ch] 继续向下走。"
    ],
    "interviewChecklist": [
      "能解释 Trie 为什么适合大量字符串的前缀查询。",
      "能说清 children 和 is_end 两个字段分别解决什么问题。",
      "能手推 insert(\"apple\")、search(\"app\")、startsWith(\"app\") 的区别。",
      "能准确说出单次操作复杂度是 O(L)，L 是输入字符串长度。"
    ]
  },
  "215": {
    "leetcodeId": 215,
    "title": "数组中的第K个最大元素",
    "slug": "kth-largest-element-in-an-array",
    "coreIdea": "维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。",
    "handwriteSteps": [
      "先说明为什么只需要维护前 k 个或当前最优。",
      "确定用小顶堆还是大顶堆。",
      "保持堆大小或弹出规则。",
      "用 k=1、重复值、频率相同样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[3,2,1,5,6,4], k=2",
        "expected": "5",
        "why": "标准样例。"
      },
      {
        "input": "nums=[3,2,3,1,2,4,5,5,6], k=4",
        "expected": "4",
        "why": "重复值按出现次数计。"
      },
      {
        "input": "k=1",
        "expected": "最大值",
        "why": "堆顶就是最大值。"
      }
    ],
    "annotatedCode": "# 核心思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,1,5,6,4], k=2 检查代码。\nimport heapq\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        heap = []\n\n        for x in nums:\n            heapq.heappush(heap, x)\n            if len(heap) > k:\n                heapq.heappop(heap)  # 弹掉当前 k+1 个数中最小的\n\n        return heap[0]",
    "complexity": {
      "time": "O(nlogk)",
      "space": "O(k)",
      "detail": "每个元素最多入堆一次，堆大小不超过 k。"
    },
    "commonPitfalls": [
      "小顶堆/大顶堆方向选反。",
      "堆大小没有限制，复杂度退化。",
      "重复值和频率相同的情况没有想清楚。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "221": {
    "leetcodeId": 221,
    "title": "最大正方形",
    "slug": "maximal-square",
    "coreIdea": "dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "matrix 全是 0",
        "expected": "0",
        "why": "没有正方形。"
      },
      {
        "input": "matrix=[[\"1\"]]",
        "expected": "1",
        "why": "单个 1 面积为 1。"
      },
      {
        "input": "经典样例",
        "expected": "4",
        "why": "边长 2 的正方形。"
      }
    ],
    "annotatedCode": "# 核心思路：dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 0 检查代码。\nclass Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        dp = [0] * (n + 1)\n        max_side = 0\n\n        for i in range(1, m + 1):\n            prev_diag = 0  # 保存上一行左上角 dp[j-1]\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = min(dp[j], dp[j - 1], prev_diag) + 1\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev_diag = temp\n\n        return max_side * max_side",
    "complexity": {
      "time": "O(mn)",
      "space": "O(n)",
      "detail": "滚动数组按行更新，每个格子处理一次。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "226": {
    "leetcodeId": 226,
    "title": "翻转二叉树",
    "slug": "invert-binary-tree",
    "coreIdea": "对每个节点交换左右孩子，再递归翻转左右子树。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[]",
        "expected": "[]",
        "why": "空树。"
      },
      {
        "input": "root=[4,2,7,1,3,6,9]",
        "expected": "[4,7,2,9,6,3,1]",
        "why": "标准样例。"
      },
      {
        "input": "单节点",
        "expected": "不变",
        "why": "无左右孩子。"
      }
    ],
    "annotatedCode": "# 核心思路：对每个节点交换左右孩子，再递归翻转左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "234": {
    "leetcodeId": 234,
    "title": "回文链表",
    "slug": "palindrome-linked-list",
    "coreIdea": "快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。",
    "handwriteSteps": [
      "先画 dummy、prev、cur、next 等指针位置。",
      "明确循环结束条件，避免空指针访问。",
      "每次改 next 前先保存后续节点。",
      "用删除头节点、单节点、长度不一致样例检查。"
    ],
    "edgeCases": [
      {
        "input": "head=[1,2,2,1]",
        "expected": "true",
        "why": "偶数长度回文。"
      },
      {
        "input": "head=[1,2,3,2,1]",
        "expected": "true",
        "why": "奇数长度回文。"
      },
      {
        "input": "head=[1,2]",
        "expected": "false",
        "why": "不回文。"
      }
    ],
    "annotatedCode": "# 核心思路：快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,2,1] 检查代码。\nclass Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n\n        # 反转后半段\n        prev = None\n        cur = slow\n        while cur:\n            nxt = cur.next\n            cur.next = prev\n            prev = cur\n            cur = nxt\n\n        # prev 是后半段反转后的头\n        p1, p2 = head, prev\n        while p2:\n            if p1.val != p2.val:\n                return False\n            p1 = p1.next\n            p2 = p2.next\n\n        return True",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "找中点、反转、比较都为线性；只用常数指针。"
    },
    "commonPitfalls": [
      "改指针前没有保存 next，导致链表断开。",
      "删除或合并头节点时没用 dummy，边界很容易崩。",
      "while 条件没有保护 None.next。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "236": {
    "leetcodeId": 236,
    "title": "二叉树的最近公共祖先",
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "coreIdea": "后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "p=5, q=1",
        "expected": "3",
        "why": "分别在根的两侧。"
      },
      {
        "input": "p=5, q=4",
        "expected": "5",
        "why": "一个节点是另一个节点祖先。"
      },
      {
        "input": "p/q 都存在",
        "expected": "返回节点对象",
        "why": "不是返回值。"
      }
    ],
    "annotatedCode": "# 核心思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 p=5, q=1 检查代码。\nclass Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        if not root or root == p or root == q:\n            return root\n\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n\n        if left and right:\n            return root\n        return left if left else right",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点最多访问一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "238": {
    "leetcodeId": 238,
    "title": "除自身以外数组的乘积",
    "slug": "product-of-array-except-self",
    "coreIdea": "答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。",
    "handwriteSteps": [
      "先找数组结构：前缀、区间、排序或原地标记。",
      "定义扫描过程中维护的不变量。",
      "每次更新前确认是否破坏原相对顺序或边界。",
      "用空/单元素、重复值、全有序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,2,3,4]",
        "expected": "[24,12,8,6]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[-1,1,0,-3,3]",
        "expected": "[0,0,9,0,0]",
        "why": "有一个 0 时只有 0 位置非零。"
      },
      {
        "input": "nums=[0,0]",
        "expected": "[0,0]",
        "why": "两个 0 时全为 0。"
      }
    ],
    "annotatedCode": "# 核心思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,4] 检查代码。\nclass Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        n = len(nums)\n        ans = [1] * n\n\n        # ans[i] 先存 nums[i] 左侧所有数的乘积\n        left_product = 1\n        for i in range(n):\n            ans[i] = left_product\n            left_product *= nums[i]\n\n        # 再从右往左乘上右侧所有数的乘积\n        right_product = 1\n        for i in range(n - 1, -1, -1):\n            ans[i] *= right_product\n            right_product *= nums[i]\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "不计输出数组，额外只用 right_product 一个变量。"
    },
    "commonPitfalls": [
      "排序后忘记原题是否要求保持原顺序。",
      "原地修改数组后还用原值做判断。",
      "边界样例空数组/单元素没有处理。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "239": {
    "leetcodeId": 239,
    "title": "滑动窗口最大值",
    "slug": "sliding-window-maximum",
    "coreIdea": "单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。",
    "handwriteSteps": [
      "先判断是前缀和、滑动窗口还是单调队列。",
      "明确连续区间的左右边界。",
      "维护窗口/前缀哈希中的计数含义。",
      "用负数、重复、空窗口样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,3,-1,-3,5,3,6,7], k=3",
        "expected": "[3,3,5,5,6,7]",
        "why": "标准样例。"
      },
      {
        "input": "k=1",
        "expected": "原数组",
        "why": "窗口大小为 1。"
      },
      {
        "input": "nums=[1], k=1",
        "expected": "[1]",
        "why": "单元素。"
      }
    ],
    "annotatedCode": "# 核心思路：单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,-1,-3,5,3,6,7], k=3 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()  # 存下标，且 nums[q] 单调递减\n        ans = []\n\n        for i, x in enumerate(nums):\n            # 移除窗口左侧过期下标\n            if q and q[0] <= i - k:\n                q.popleft()\n\n            # 新元素更大时，队尾较小元素不可能再成为最大值\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(k)",
      "detail": "每个下标最多进队出队一次；队列最多保存 k 个下标。"
    },
    "commonPitfalls": [
      "连续子数组/子串和子序列混淆。",
      "有负数时误用滑动窗口。",
      "前缀和计数没有先初始化 0。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "240": {
    "leetcodeId": 240,
    "title": "搜索二维矩阵 II",
    "slug": "search-a-2d-matrix-ii",
    "coreIdea": "从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。",
    "handwriteSteps": [
      "先明确坐标含义和行列边界。",
      "利用矩阵的排序、层次或方向性质排除范围。",
      "更新坐标时保证不会越界和重复访问。",
      "用 1×1、单行、单列样例检查。"
    ],
    "edgeCases": [
      {
        "input": "target=5 在矩阵中",
        "expected": "true",
        "why": "标准样例。"
      },
      {
        "input": "target=20 不在矩阵中",
        "expected": "false",
        "why": "会越界退出。"
      },
      {
        "input": "1×1 矩阵",
        "expected": "按值判断",
        "why": "最小矩阵。"
      }
    ],
    "annotatedCode": "# 核心思路：从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 target=5 在矩阵中 检查代码。\nclass Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        m, n = len(matrix), len(matrix[0])\n        row, col = 0, n - 1  # 右上角\n\n        while row < m and col >= 0:\n            if matrix[row][col] == target:\n                return True\n            elif matrix[row][col] > target:\n                col -= 1  # 当前列下面更大，整列可排除\n            else:\n                row += 1  # 当前行左边更小，整行可排除\n\n        return False",
    "complexity": {
      "time": "O(m+n)",
      "space": "O(1)",
      "detail": "行号最多增加 m 次，列号最多减少 n 次。"
    },
    "commonPitfalls": [
      "行列下标写反。",
      "边界判断漏掉单行单列。",
      "原地标记后忘记恢复或影响后续搜索。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "279": {
    "leetcodeId": 279,
    "title": "完全平方数",
    "slug": "perfect-squares",
    "coreIdea": "完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "n=12",
        "expected": "3",
        "why": "4+4+4。"
      },
      {
        "input": "n=13",
        "expected": "2",
        "why": "4+9。"
      },
      {
        "input": "n=1",
        "expected": "1",
        "why": "1。"
      }
    ],
    "annotatedCode": "# 核心思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=12 检查代码。\nclass Solution:\n    def numSquares(self, n: int) -> int:\n        dp = [float('inf')] * (n + 1)\n        dp[0] = 0\n\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        for square in squares:\n            for amount in range(square, n + 1):\n                dp[amount] = min(dp[amount], dp[amount - square] + 1)\n\n        return dp[n]",
    "complexity": {
      "time": "O(n√n)",
      "space": "O(n)",
      "detail": "平方数有 √n 个，每个更新 n 个容量。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "283": {
    "leetcodeId": 283,
    "title": "移动零",
    "slug": "move-zeroes",
    "coreIdea": "用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。",
    "handwriteSteps": [
      "先明确两个指针分别代表什么边界。",
      "证明每次移动哪一个指针不会漏答案。",
      "在循环内先更新答案，再移动指针。",
      "用最小长度、单调数组、重复值样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[0,1,0,3,12]",
        "expected": "[1,3,12,0,0]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[0,0]",
        "expected": "[0,0]",
        "why": "全零。"
      },
      {
        "input": "nums=[1,2]",
        "expected": "[1,2]",
        "why": "无零保持相对顺序。"
      }
    ],
    "annotatedCode": "# 核心思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[0,1,0,3,12] 检查代码。\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        slow = 0\n\n        # 先把所有非零元素按原相对顺序放到前面\n        for x in nums:\n            if x != 0:\n                nums[slow] = x\n                slow += 1\n\n        # 剩下的位置补 0\n        for i in range(slow, len(nums)):\n            nums[i] = 0",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "原地扫描数组，最多写入两遍。"
    },
    "commonPitfalls": [
      "不知道为什么移动左指针或右指针，靠猜会漏答案。",
      "循环边界写成 <= 或 < 时没有配合题意。",
      "更新答案和移动指针的顺序写反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "287": {
    "leetcodeId": 287,
    "title": "寻找重复数",
    "slug": "find-the-duplicate-number",
    "coreIdea": "把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,3,4,2,2]",
        "expected": "2",
        "why": "标准样例。"
      },
      {
        "input": "nums=[3,1,3,4,2]",
        "expected": "3",
        "why": "重复数可能在前面。"
      },
      {
        "input": "nums=[1,1]",
        "expected": "1",
        "why": "最小规模。"
      }
    ],
    "annotatedCode": "# 核心思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,4,2,2] 检查代码。\nclass Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        slow = fast = nums[0]\n\n        # 第一阶段：快慢指针在环内相遇\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast:\n                break\n\n        # 第二阶段：从起点和相遇点同步走，入口就是重复数\n        finder = nums[0]\n        while finder != slow:\n            finder = nums[finder]\n            slow = nums[slow]\n\n        return finder",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "Floyd 快慢指针两阶段定位入口。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "297": {
    "leetcodeId": 297,
    "title": "二叉树的序列化与反序列化",
    "slug": "serialize-and-deserialize-binary-tree",
    "coreIdea": "前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[]",
        "expected": "\"#\"",
        "why": "空树。"
      },
      {
        "input": "root=[1,2,3,null,null,4,5]",
        "expected": "可还原",
        "why": "标准树。"
      },
      {
        "input": "含负数节点",
        "expected": "可还原",
        "why": "字符串转 int。"
      }
    ],
    "annotatedCode": "# 核心思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Codec:\n    def serialize(self, root):\n        vals = []\n\n        def dfs(node):\n            if not node:\n                vals.append('#')\n                return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n\n        dfs(root)\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        vals = deque(data.split(','))\n\n        def dfs():\n            val = vals.popleft()\n            if val == '#':\n                return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n\n        return dfs()",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个真实节点和空指针标记各处理一次；字符串/队列存储 O(n)。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "300": {
    "leetcodeId": 300,
    "title": "最长递增子序列",
    "slug": "longest-increasing-subsequence",
    "coreIdea": "tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "nums=[10,9,2,5,3,7,101,18]",
        "expected": "4",
        "why": "[2,3,7,101]。"
      },
      {
        "input": "nums=[0,1,0,3,2,3]",
        "expected": "4",
        "why": "重复和回落。"
      },
      {
        "input": "nums=[7,7,7,7]",
        "expected": "1",
        "why": "严格递增，重复不能增长。"
      }
    ],
    "annotatedCode": "# 核心思路：tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[10,9,2,5,3,7,101,18] 检查代码。\nimport bisect\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n\n        for x in nums:\n            # 严格递增：找第一个 >= x 的位置替换\n            pos = bisect.bisect_left(tails, x)\n            if pos == len(tails):\n                tails.append(x)\n            else:\n                tails[pos] = x\n\n        return len(tails)",
    "complexity": {
      "time": "O(nlogn)",
      "space": "O(n)",
      "detail": "每个数二分一次 tails，tails 最长 n。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "309": {
    "leetcodeId": 309,
    "title": "最佳买卖股票时机含冷冻期",
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown",
    "coreIdea": "三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "prices=[1,2,3,0,2]",
        "expected": "3",
        "why": "卖出后冷冻一天。"
      },
      {
        "input": "prices=[1]",
        "expected": "0",
        "why": "一天无法获利。"
      },
      {
        "input": "prices=[6,1,3,2,4,7]",
        "expected": "6",
        "why": "多次交易但有冷冻限制。"
      }
    ],
    "annotatedCode": "# 核心思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[1,2,3,0,2] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        hold = -prices[0]  # 手里持有股票的最大收益\n        sold = 0           # 今天刚卖出后的最大收益\n        rest = 0           # 不持股且不处于刚卖出状态的最大收益\n\n        for price in prices[1:]:\n            prev_hold, prev_sold, prev_rest = hold, sold, rest\n            hold = max(prev_hold, prev_rest - price)\n            sold = prev_hold + price\n            rest = max(prev_rest, prev_sold)\n\n        return max(sold, rest)",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "每天只更新三个状态变量。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "312": {
    "leetcodeId": 312,
    "title": "戳气球",
    "slug": "burst-balloons",
    "coreIdea": "区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "nums=[3,1,5,8]",
        "expected": "167",
        "why": "标准样例。"
      },
      {
        "input": "nums=[1,5]",
        "expected": "10",
        "why": "两只气球。"
      },
      {
        "input": "包含 0",
        "expected": "可处理",
        "why": "0 作为气球值会影响乘积但不影响状态定义。"
      }
    ],
    "annotatedCode": "# 核心思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,1,5,8] 检查代码。\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        arr = [1] + nums + [1]\n        n = len(arr)\n        dp = [[0] * n for _ in range(n)]\n\n        # length 是开区间 (left, right) 的跨度\n        for length in range(2, n):\n            for left in range(0, n - length):\n                right = left + length\n                for k in range(left + 1, right):\n                    coins = arr[left] * arr[k] * arr[right]\n                    dp[left][right] = max(dp[left][right], dp[left][k] + coins + dp[k][right])\n\n        return dp[0][n - 1]",
    "complexity": {
      "time": "O(n³)",
      "space": "O(n²)",
      "detail": "区间长度 O(n)，左右端点 O(n)，每个区间枚举 k。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "322": {
    "leetcodeId": 322,
    "title": "零钱兑换",
    "slug": "coin-change",
    "coreIdea": "完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "coins=[1,2,5], amount=11",
        "expected": "3",
        "why": "5+5+1。"
      },
      {
        "input": "coins=[2], amount=3",
        "expected": "-1",
        "why": "无法凑出。"
      },
      {
        "input": "amount=0",
        "expected": "0",
        "why": "凑 0 元需要 0 枚。"
      }
    ],
    "annotatedCode": "# 核心思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 coins=[1,2,5], amount=11 检查代码。\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n\n        for coin in coins:\n            for x in range(coin, amount + 1):\n                dp[x] = min(dp[x], dp[x - coin] + 1)\n\n        return -1 if dp[amount] == amount + 1 else dp[amount]",
    "complexity": {
      "time": "O(amount·len(coins))",
      "space": "O(amount)",
      "detail": "每个硬币更新 amount 个容量。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "337": {
    "leetcodeId": 337,
    "title": "打家劫舍 III",
    "slug": "house-robber-iii",
    "coreIdea": "树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[3,2,3,null,3,null,1]",
        "expected": "7",
        "why": "偷根和两个孙子。"
      },
      {
        "input": "root=[3,4,5,1,3,null,1]",
        "expected": "9",
        "why": "不偷根更优。"
      },
      {
        "input": "root=[]",
        "expected": "0",
        "why": "空树收益为 0。"
      }
    ],
    "annotatedCode": "# 核心思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[3,2,3,null,3,null,1] 检查代码。\nclass Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        def dfs(node: Optional[TreeNode]):\n            if not node:\n                return (0, 0)\n\n            left_rob, left_not = dfs(node.left)\n            right_rob, right_not = dfs(node.right)\n\n            rob_cur = node.val + left_not + right_not\n            not_rob_cur = max(left_rob, left_not) + max(right_rob, right_not)\n            return (rob_cur, not_rob_cur)\n\n        return max(dfs(root))",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点后序计算一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "338": {
    "leetcodeId": 338,
    "title": "比特位计数",
    "slug": "counting-bits",
    "coreIdea": "利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "n=2",
        "expected": "[0,1,1]",
        "why": "0,1,2。"
      },
      {
        "input": "n=5",
        "expected": "[0,1,1,2,1,2]",
        "why": "标准样例。"
      },
      {
        "input": "n=0",
        "expected": "[0]",
        "why": "只返回 0。"
      }
    ],
    "annotatedCode": "# 核心思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=2 检查代码。\nclass Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n\n        for i in range(1, n + 1):\n            ans[i] = ans[i >> 1] + (i & 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "从 0 到 n 每个数 O(1) 递推。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "347": {
    "leetcodeId": 347,
    "title": "前 K 个高频元素",
    "slug": "top-k-frequent-elements",
    "coreIdea": "先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。",
    "handwriteSteps": [
      "先说明为什么只需要维护前 k 个或当前最优。",
      "确定用小顶堆还是大顶堆。",
      "保持堆大小或弹出规则。",
      "用 k=1、重复值、频率相同样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,1,1,2,2,3], k=2",
        "expected": "[1,2]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[1], k=1",
        "expected": "[1]",
        "why": "单元素。"
      },
      {
        "input": "频率相同",
        "expected": "任意顺序可接受",
        "why": "题目通常不要求固定顺序。"
      }
    ],
    "annotatedCode": "# 核心思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,2,2,3], k=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n\n        for num, freq in count.items():\n            buckets[freq].append(num)\n\n        ans = []\n        for freq in range(len(buckets) - 1, 0, -1):\n            for num in buckets[freq]:\n                ans.append(num)\n                if len(ans) == k:\n                    return ans\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "统计和扫桶都是线性；桶总容量 n+1。"
    },
    "commonPitfalls": [
      "小顶堆/大顶堆方向选反。",
      "堆大小没有限制，复杂度退化。",
      "重复值和频率相同的情况没有想清楚。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "394": {
    "leetcodeId": 394,
    "title": "字符串解码",
    "slug": "decode-string",
    "coreIdea": "遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "s=\"3[a]2[bc]\"",
        "expected": "\"aaabcbc\"",
        "why": "标准样例。"
      },
      {
        "input": "s=\"3[a2[c]]\"",
        "expected": "\"accaccacc\"",
        "why": "嵌套括号。"
      },
      {
        "input": "s=\"10[a]\"",
        "expected": "10 个 a",
        "why": "多位数字。"
      }
    ],
    "annotatedCode": "# 核心思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"3[a]2[bc]\" 检查代码。\nclass Solution:\n    def decodeString(self, s: str) -> str:\n        stack = []\n        cur = ''\n        num = 0\n\n        for ch in s:\n            if ch.isdigit():\n                num = num * 10 + int(ch)\n            elif ch == '[':\n                stack.append((cur, num))\n                cur = ''\n                num = 0\n            elif ch == ']':\n                prev, times = stack.pop()\n                cur = prev + cur * times\n            else:\n                cur += ch\n\n        return cur",
    "complexity": {
      "time": "O(输出字符串长度)",
      "space": "O(嵌套深度+输出长度)",
      "detail": "每个输出字符最终都会生成；栈保存嵌套上下文。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "399": {
    "leetcodeId": 399,
    "title": "除法求值",
    "slug": "evaluate-division",
    "coreIdea": "把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。",
    "handwriteSteps": [
      "先把问题翻译成点和边。",
      "选择 DFS/BFS/拓扑排序/并查集。",
      "维护 visited、入度或父节点等状态。",
      "用不连通、有环、单点图样例检查。"
    ],
    "edgeCases": [
      {
        "input": "a/b=2,b/c=3, 查询 a/c",
        "expected": "6.0",
        "why": "路径乘积。"
      },
      {
        "input": "查询未知变量",
        "expected": "-1.0",
        "why": "节点不存在。"
      },
      {
        "input": "查询 a/a 且 a 存在",
        "expected": "1.0",
        "why": "自己除自己。"
      }
    ],
    "annotatedCode": "# 核心思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 a/b=2,b/c=3, 查询 a/c 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        graph = defaultdict(list)\n        for (a, b), val in zip(equations, values):\n            graph[a].append((b, val))\n            graph[b].append((a, 1.0 / val))\n\n        def dfs(cur: str, target: str, product: float, visited: set) -> float:\n            if cur == target:\n                return product\n            visited.add(cur)\n            for nxt, weight in graph[cur]:\n                if nxt not in visited:\n                    res = dfs(nxt, target, product * weight, visited)\n                    if res != -1.0:\n                        return res\n            return -1.0\n\n        ans = []\n        for a, b in queries:\n            if a not in graph or b not in graph:\n                ans.append(-1.0)\n            else:\n                ans.append(dfs(a, b, 1.0, set()))\n        return ans",
    "complexity": {
      "time": "O(E+Q·(V+E))",
      "space": "O(V+E)",
      "detail": "建图线性；每个查询最坏 DFS/BFS 一遍图。"
    },
    "commonPitfalls": [
      "建边方向写反。",
      "visited 标记时机错误，导致重复搜索或死循环。",
      "拓扑排序忘记统计最终取出的节点数。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "406": {
    "leetcodeId": 406,
    "title": "根据身高重建队列",
    "slug": "queue-reconstruction-by-height",
    "coreIdea": "先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。",
    "handwriteSteps": [
      "先说明局部最优选择是什么。",
      "证明这个选择不会损失全局最优。",
      "遍历中维护覆盖范围、最优候选或排序结构。",
      "用反例尝试推翻贪心，确认边界。"
    ],
    "edgeCases": [
      {
        "input": "people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]",
        "expected": "[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]",
        "why": "标准样例。"
      },
      {
        "input": "相同身高不同 k",
        "expected": "k 小的先插入",
        "why": "排序第二关键字升序。"
      },
      {
        "input": "单人",
        "expected": "原样返回",
        "why": "最小规模。"
      }
    ],
    "annotatedCode": "# 核心思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]] 检查代码。\nclass Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        # 高个先排；同身高 k 小的先排\n        people.sort(key=lambda x: (-x[0], x[1]))\n        ans = []\n\n        for person in people:\n            ans.insert(person[1], person)\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(n)",
      "detail": "排序 O(nlogn)，列表中间插入最坏 O(n)，总 O(n²)。"
    },
    "commonPitfalls": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "416": {
    "leetcodeId": 416,
    "title": "分割等和子集",
    "slug": "partition-equal-subset-sum",
    "coreIdea": "问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,5,11,5]",
        "expected": "true",
        "why": "可以分成 11 和 11。"
      },
      {
        "input": "nums=[1,2,3,5]",
        "expected": "false",
        "why": "无法凑半和。"
      },
      {
        "input": "总和为奇数",
        "expected": "false",
        "why": "不可能平分。"
      }
    ],
    "annotatedCode": "# 核心思路：问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,5,11,5] 检查代码。\nclass Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2 == 1:\n            return False\n\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n\n        for num in nums:\n            # 0/1 背包必须倒序，防止同一个 num 被重复使用\n            for cap in range(target, num - 1, -1):\n                dp[cap] = dp[cap] or dp[cap - num]\n\n        return dp[target]",
    "complexity": {
      "time": "O(n·target)",
      "space": "O(target)",
      "detail": "target=sum(nums)/2；每个数只能用一次，所以容量倒序遍历。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "437": {
    "leetcodeId": 437,
    "title": "路径总和 III",
    "slug": "path-sum-iii",
    "coreIdea": "树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8",
        "expected": "3",
        "why": "标准样例。"
      },
      {
        "input": "含负数",
        "expected": "可处理",
        "why": "前缀和比滑动窗口更适合。"
      },
      {
        "input": "路径不一定从根开始",
        "expected": "能统计",
        "why": "任意祖先到当前节点。"
      }
    ],
    "annotatedCode": "# 核心思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        prefix = defaultdict(int)\n        prefix[0] = 1\n        ans = 0\n\n        def dfs(node: Optional[TreeNode], cur_sum: int) -> None:\n            nonlocal ans\n            if not node:\n                return\n\n            cur_sum += node.val\n            ans += prefix[cur_sum - targetSum]\n\n            prefix[cur_sum] += 1\n            dfs(node.left, cur_sum)\n            dfs(node.right, cur_sum)\n            prefix[cur_sum] -= 1  # 回溯，离开当前路径\n\n        dfs(root, 0)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；哈希表维护当前根到节点路径上的前缀和。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "438": {
    "leetcodeId": 438,
    "title": "找到字符串中所有字母异位词",
    "slug": "find-all-anagrams-in-a-string",
    "coreIdea": "固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。",
    "handwriteSteps": [
      "明确窗口内维护的条件是什么。",
      "右指针扩张并更新窗口状态。",
      "当窗口不满足/已经满足条件时移动左指针。",
      "每次更新答案时确认窗口左右边界是否闭区间。"
    ],
    "edgeCases": [
      {
        "input": "s=\"cbaebabacd\", p=\"abc\"",
        "expected": "[0,6]",
        "why": "标准样例。"
      },
      {
        "input": "s=\"abab\", p=\"ab\"",
        "expected": "[0,1,2]",
        "why": "重叠异位词。"
      },
      {
        "input": "len(p)>len(s)",
        "expected": "[]",
        "why": "窗口都形成不了。"
      }
    ],
    "annotatedCode": "# 核心思路：固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"cbaebabacd\", p=\"abc\" 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        m, n = len(s), len(p)\n        if n > m:\n            return []\n\n        need = Counter(p)\n        window = Counter(s[:n])\n        ans = []\n\n        if window == need:\n            ans.append(0)\n\n        for right in range(n, m):\n            left = right - n\n            out = s[left]\n            window[out] -= 1\n            if window[out] == 0:\n                del window[out]\n\n            window[s[right]] += 1\n            if window == need:\n                ans.append(left + 1)\n\n        return ans",
    "complexity": {
      "time": "O(|s|+|p|)",
      "space": "O(字符集大小)",
      "detail": "每个字符进出窗口一次；计数表大小固定。"
    },
    "commonPitfalls": [
      "窗口收缩条件写错，导致窗口里仍然不合法。",
      "字符频次只判断种类，不判断数量。",
      "答案更新时机不对，最短/最长窗口混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "448": {
    "leetcodeId": 448,
    "title": "找到所有数组中消失的数字",
    "slug": "find-all-numbers-disappeared-in-an-array",
    "coreIdea": "数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[4,3,2,7,8,2,3,1]",
        "expected": "[5,6]",
        "why": "标准样例。"
      },
      {
        "input": "nums=[1,1]",
        "expected": "[2]",
        "why": "重复导致缺失。"
      },
      {
        "input": "nums=[1,2,3]",
        "expected": "[]",
        "why": "没有缺失。"
      }
    ],
    "annotatedCode": "# 核心思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,3,2,7,8,2,3,1] 检查代码。\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for x in nums:\n            idx = abs(x) - 1\n            if nums[idx] > 0:\n                nums[idx] = -nums[idx]\n\n        ans = []\n        for i, x in enumerate(nums):\n            if x > 0:\n                ans.append(i + 1)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "原地标记，不计返回数组只用常数空间。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "461": {
    "leetcodeId": 461,
    "title": "汉明距离",
    "slug": "hamming-distance",
    "coreIdea": "两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "x=1, y=4",
        "expected": "2",
        "why": "001 与 100 有两位不同。"
      },
      {
        "input": "x=0, y=0",
        "expected": "0",
        "why": "完全相同。"
      },
      {
        "input": "x=3, y=1",
        "expected": "1",
        "why": "011 与 001。"
      }
    ],
    "annotatedCode": "# 核心思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 x=1, y=4 检查代码。\nclass Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        z = x ^ y  # 不同的位置为 1\n        count = 0\n        while z:\n            z &= z - 1  # 每次消掉最低位的 1\n            count += 1\n        return count",
    "complexity": {
      "time": "O(1)",
      "space": "O(1)",
      "detail": "整数位数固定；也可用 Brian Kernighan 算法按 1 的个数循环。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "494": {
    "leetcodeId": 494,
    "title": "目标和",
    "slug": "target-sum",
    "coreIdea": "给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。",
    "handwriteSteps": [
      "定义 dp 数组含义，必须能用一句话解释。",
      "推导递推公式：当前状态从哪些旧状态来。",
      "确定初始化和遍历顺序。",
      "用最小规模手推 dp 表验证。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,1,1,1,1], target=3",
        "expected": "5",
        "why": "标准样例。"
      },
      {
        "input": "abs(target)>sum(nums)",
        "expected": "0",
        "why": "不可能达到。"
      },
      {
        "input": "nums 含 0",
        "expected": "方案数会翻倍",
        "why": "0 取正负都不改变和。"
      }
    ],
    "annotatedCode": "# 核心思路：给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,1,1], target=3 检查代码。\nclass Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 == 1:\n            return 0\n\n        bag = (total + target) // 2\n        dp = [0] * (bag + 1)\n        dp[0] = 1\n\n        for num in nums:\n            for cap in range(bag, num - 1, -1):\n                dp[cap] += dp[cap - num]\n\n        return dp[bag]",
    "complexity": {
      "time": "O(n·bag)",
      "space": "O(bag)",
      "detail": "bag=(sum+target)/2；0/1 背包计数，容量倒序。"
    },
    "commonPitfalls": [
      "dp 含义没有定义清楚就写公式。",
      "初始化边界漏掉，导致小样例错误。",
      "遍历顺序和状态依赖方向相反。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "538": {
    "leetcodeId": 538,
    "title": "把二叉搜索树转换为累加树",
    "slug": "convert-bst-to-greater-tree",
    "coreIdea": "BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]",
        "expected": "累加树",
        "why": "标准样例。"
      },
      {
        "input": "单节点",
        "expected": "不变",
        "why": "只有自己。"
      },
      {
        "input": "右斜树",
        "expected": "从大到小累加",
        "why": "验证反向中序。"
      }
    ],
    "annotatedCode": "# 核心思路：BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8] 检查代码。\nclass Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n\n        def reverse_inorder(node: Optional[TreeNode]) -> None:\n            nonlocal total\n            if not node:\n                return\n            reverse_inorder(node.right)\n            total += node.val\n            node.val = total\n            reverse_inorder(node.left)\n\n        reverse_inorder(root)\n        return root",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "543": {
    "leetcodeId": 543,
    "title": "二叉树的直径",
    "slug": "diameter-of-binary-tree",
    "coreIdea": "每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root=[1,2,3,4,5]",
        "expected": "3",
        "why": "路径 4→2→1→3 或 5→2→1→3。"
      },
      {
        "input": "root=[1,2]",
        "expected": "1",
        "why": "两个节点一条边。"
      },
      {
        "input": "单节点",
        "expected": "0",
        "why": "直径按边数计算。"
      }
    ],
    "annotatedCode": "# 核心思路：每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        ans = 0\n\n        def depth(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n            left = depth(node.left)\n            right = depth(node.right)\n            ans = max(ans, left + right)\n            return max(left, right) + 1\n\n        depth(root)\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(h)",
      "detail": "每个节点访问一次；递归栈为树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "560": {
    "leetcodeId": 560,
    "title": "和为 K 的子数组",
    "slug": "subarray-sum-equals-k",
    "coreIdea": "前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。",
    "handwriteSteps": [
      "先判断是前缀和、滑动窗口还是单调队列。",
      "明确连续区间的左右边界。",
      "维护窗口/前缀哈希中的计数含义。",
      "用负数、重复、空窗口样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[1,1,1], k=2",
        "expected": "2",
        "why": "标准样例。"
      },
      {
        "input": "nums=[1,-1,0], k=0",
        "expected": "3",
        "why": "有负数，不能用滑动窗口。"
      },
      {
        "input": "nums=[0,0], k=0",
        "expected": "3",
        "why": "前缀和次数累加。"
      }
    ],
    "annotatedCode": "# 核心思路：前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1], k=2 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        count = defaultdict(int)\n        count[0] = 1\n        cur = 0\n        ans = 0\n\n        for x in nums:\n            cur += x\n            ans += count[cur - k]\n            count[cur] += 1\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "一次扫描，哈希表记录前缀和出现次数。"
    },
    "commonPitfalls": [
      "连续子数组/子串和子序列混淆。",
      "有负数时误用滑动窗口。",
      "前缀和计数没有先初始化 0。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "581": {
    "leetcodeId": 581,
    "title": "最短无序连续子数组",
    "slug": "shortest-unsorted-continuous-subarray",
    "coreIdea": "从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。",
    "handwriteSteps": [
      "先识别题目的特殊性质或数学不变量。",
      "把性质落实为变量或原地操作。",
      "每一步都保持不变量不被破坏。",
      "用极端值、重复值、已排序样例检查。"
    ],
    "edgeCases": [
      {
        "input": "nums=[2,6,4,8,10,9,15]",
        "expected": "5",
        "why": "排序 [6,4,8,10,9]。"
      },
      {
        "input": "nums=[1,2,3,4]",
        "expected": "0",
        "why": "已经有序。"
      },
      {
        "input": "nums=[1]",
        "expected": "0",
        "why": "单元素有序。"
      }
    ],
    "annotatedCode": "# 核心思路：从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,6,4,8,10,9,15] 检查代码。\nclass Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        right = -1\n        max_seen = float('-inf')\n\n        for i in range(n):\n            if nums[i] < max_seen:\n                right = i\n            else:\n                max_seen = nums[i]\n\n        left = n\n        min_seen = float('inf')\n        for i in range(n - 1, -1, -1):\n            if nums[i] > min_seen:\n                left = i\n            else:\n                min_seen = nums[i]\n\n        return 0 if right == -1 else right - left + 1",
    "complexity": {
      "time": "O(n)",
      "space": "O(1)",
      "detail": "左右各扫描一次。"
    },
    "commonPitfalls": [
      "只记结论不记不变量，面试官换问法就不会。",
      "原地操作覆盖了还要用的信息。",
      "极端样例没有验证。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "617": {
    "leetcodeId": 617,
    "title": "合并二叉树",
    "slug": "merge-two-binary-trees",
    "coreIdea": "两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。",
    "handwriteSteps": [
      "先判断应该前序、中序、后序还是层序。",
      "写递归函数的返回值含义。",
      "处理空节点作为终止条件。",
      "在单层逻辑里组合左右子树结果。"
    ],
    "edgeCases": [
      {
        "input": "root1=[1,3,2,5], root2=[2,1,3,null,4,null,7]",
        "expected": "[3,4,5,5,4,null,7]",
        "why": "标准样例。"
      },
      {
        "input": "一棵树为空",
        "expected": "返回另一棵树",
        "why": "空树边界。"
      },
      {
        "input": "两个节点都为空",
        "expected": "null",
        "why": "递归终止。"
      }
    ],
    "annotatedCode": "# 核心思路：两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root1=[1,3,2,5], root2=[2,1,3,null,4,null,7] 检查代码。\nclass Solution:\n    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root1:\n            return root2\n        if not root2:\n            return root1\n\n        root1.val += root2.val\n        root1.left = self.mergeTrees(root1.left, root2.left)\n        root1.right = self.mergeTrees(root1.right, root2.right)\n        return root1",
    "complexity": {
      "time": "O(min(m,n)) 或 O(m+n)",
      "space": "O(h)",
      "detail": "若直接复用节点，只递归两树重叠部分；递归栈取决于树高。"
    },
    "commonPitfalls": [
      "递归返回值含义不清，左右子树结果不会合并。",
      "空节点终止条件漏写。",
      "把“节点值相等”和“节点对象相等”混淆。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "621": {
    "leetcodeId": 621,
    "title": "任务调度器",
    "slug": "task-scheduler",
    "coreIdea": "先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。",
    "handwriteSteps": [
      "先说明局部最优选择是什么。",
      "证明这个选择不会损失全局最优。",
      "遍历中维护覆盖范围、最优候选或排序结构。",
      "用反例尝试推翻贪心，确认边界。"
    ],
    "edgeCases": [
      {
        "input": "tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2",
        "expected": "8",
        "why": "A B idle A B idle A B。"
      },
      {
        "input": "n=0",
        "expected": "len(tasks)",
        "why": "没有冷却时间。"
      },
      {
        "input": "多个最高频任务",
        "expected": "最后一列加 cnt",
        "why": "如 A、B 同频。"
      }
    ],
    "annotatedCode": "# 核心思路：先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        freq = Counter(tasks)\n        max_count = max(freq.values())\n        max_kinds = sum(1 for v in freq.values() if v == max_count)\n\n        # 先用最高频任务撑开框架，再与任务总数取最大值\n        frame = (max_count - 1) * (n + 1) + max_kinds\n        return max(frame, len(tasks))",
    "complexity": {
      "time": "O(N)",
      "space": "O(1)",
      "detail": "任务种类固定为大写字母，计数空间常数；扫描任务一次。"
    },
    "commonPitfalls": [
      "只会写代码但说不出局部最优为什么成立。",
      "需要排序的贪心忘记排序规则。",
      "把“能不能到达”和“最少几步到达”混成一题。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "647": {
    "leetcodeId": 647,
    "title": "回文子串",
    "slug": "palindromic-substrings",
    "coreIdea": "每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。",
    "handwriteSteps": [
      "定义二维/区间状态，明确下标是否表示前 i 个。",
      "写出状态转移依赖哪些方向或子区间。",
      "先初始化空串、第一行/列或长度边界。",
      "按依赖关系确定遍历顺序，手推小样例。"
    ],
    "edgeCases": [
      {
        "input": "s=\"abc\"",
        "expected": "3",
        "why": "每个单字符都是回文。"
      },
      {
        "input": "s=\"aaa\"",
        "expected": "6",
        "why": "a,a,a,aa,aa,aaa。"
      },
      {
        "input": "s=\"\"",
        "expected": "0",
        "why": "空串为 0。"
      }
    ],
    "annotatedCode": "# 核心思路：每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abc\" 检查代码。\nclass Solution:\n    def countSubstrings(self, s: str) -> int:\n        ans = 0\n\n        def expand(left: int, right: int) -> None:\n            nonlocal ans\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                ans += 1\n                left -= 1\n                right += 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度回文\n            expand(i, i + 1)   # 偶数长度回文\n\n        return ans",
    "complexity": {
      "time": "O(n²)",
      "space": "O(1)",
      "detail": "2n-1 个中心，每个中心最坏扩展 O(n)。"
    },
    "commonPitfalls": [
      "i/j 表示前 i 个还是下标 i 混淆。",
      "第一行第一列或空区间初始化错误。",
      "区间 DP 没按长度枚举，依赖状态还没算出来。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  },
  "739": {
    "leetcodeId": 739,
    "title": "每日温度",
    "slug": "daily-temperatures",
    "coreIdea": "单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。",
    "handwriteSteps": [
      "明确栈里存值还是下标，以及栈的单调性/匹配意义。",
      "遇到触发条件时持续弹栈并结算答案。",
      "加入哨兵或初始化边界，统一处理空栈。",
      "用空输入、重复值、完全单调样例检查。"
    ],
    "edgeCases": [
      {
        "input": "temperatures=[73,74,75,71,69,72,76,73]",
        "expected": "[1,1,4,2,1,1,0,0]",
        "why": "标准样例。"
      },
      {
        "input": "temperatures=[30,40,50,60]",
        "expected": "[1,1,1,0]",
        "why": "单调递增。"
      },
      {
        "input": "temperatures=[30,30,30]",
        "expected": "[0,0,0]",
        "why": "相等不是更暖和。"
      }
    ],
    "annotatedCode": "# 核心思路：单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 temperatures=[73,74,75,71,69,72,76,73] 检查代码。\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        stack = []  # 存下标，且对应温度单调递减\n\n        for i, temp in enumerate(temperatures):\n            while stack and temp > temperatures[stack[-1]]:\n                prev = stack.pop()\n                ans[prev] = i - prev\n            stack.append(i)\n\n        return ans",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "detail": "每个下标最多入栈出栈一次。"
    },
    "commonPitfalls": [
      "栈里到底存下标还是值没有想清楚。",
      "弹栈后没有重新判断栈是否为空。",
      "相等元素的处理规则和题目要求不一致。"
    ],
    "interviewChecklist": [
      "能用自己的话讲出暴力解和优化瓶颈。",
      "能写出核心不变量，并解释每个变量的含义。",
      "能手推至少一个普通样例和一个边界样例。",
      "能准确说出时间复杂度和空间复杂度。"
    ]
  }
};

export function getProblemRefinement(leetcodeId: number): ProblemRefinement | undefined {
  return problemRefinements[leetcodeId];
}
