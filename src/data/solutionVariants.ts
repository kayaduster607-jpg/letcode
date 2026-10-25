export interface SolutionVariant {
  name: string;
  badge: '暴力' | '基础' | '推荐' | '备选' | '进阶';
  idea: string;
  time: string;
  space: string;
  complexityDetail: string;
  code: string;
  notes: string[];
}

export const solutionVariants: Record<number, SolutionVariant[]> = {
  "1": [
    {
      "name": "暴力双循环",
      "badge": "暴力",
      "idea": "枚举第一个下标 i，再枚举它后面的下标 j，检查两数之和。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "两层循环最多检查 n(n-1)/2 对元素，不使用额外数据结构。",
      "code": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        n = len(nums)\n        for i in range(n):\n            for j in range(i + 1, n):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []",
      "notes": [
        "适合读题建模，不适合面试最终提交。"
      ]
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "核心观察：遍历到nums[i]时，我只需要知道\"target-nums[i]之前有没有出现过\"。如果用哈希表记录已经遍历过的数和它们的下标，就能O(1)完成这个查找。具体做法：遍历数组，对于当前数nums[i]，先查哈希表中有没有target-nums[i]——如果有，直接返回两个下标；如果没有，把nums[i]存入哈希表（key是值，value是下标），继续遍历。注意：必须\"先查再存\"，否则会找到自己。时间O(n)，空间O(n)。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遍历每个数 x 时，只关心 target - x 之前有没有出现过；哈希表把“找另一个数”的动作从 O(n) 降到 O(1)。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,3], target=6 检查代码。\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # seen[value] = index：value 第一次出现的下标\n        seen = {}\n\n        for i, x in enumerate(nums):\n            need = target - x  # 当前数 x 需要搭配的另一个数\n\n            # 先查再存，避免 target=2*x 时把自己匹配给自己\n            if need in seen:\n                return [seen[need], i]\n\n            # 没找到搭档，记录当前数，留给后面的元素匹配\n            seen[x] = i\n\n        # 题目保证有且只有一个答案，正常不会走到这里\n        return []",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "排序 + 双指针保留下标",
      "badge": "备选",
      "idea": "把数值和原下标一起排序，再用左右指针找和；能做但比哈希慢。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "排序是主要成本，需要保存原下标。",
      "code": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        arr = sorted((x, i) for i, x in enumerate(nums))\n        left, right = 0, len(arr) - 1\n        while left < right:\n            total = arr[left][0] + arr[right][0]\n            if total == target:\n                return [arr[left][1], arr[right][1]]\n            if total < target:\n                left += 1\n            else:\n                right -= 1\n        return []",
      "notes": []
    }
  ],
  "2": [
    {
      "name": "转整数再相加",
      "badge": "基础",
      "idea": "把逆序链表还原成整数，相加后再拆成链表；Python 不溢出，但这个思路不能迁移到定长整数语言。",
      "time": "O(m+n+L)",
      "space": "O(L)",
      "complexityDetail": "m、n 是两个链表长度，L 是答案位数；需要新建答案链表。",
      "code": "class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        def to_number(node):\n            base = 1\n            num = 0\n            while node:\n                num += node.val * base\n                base *= 10\n                node = node.next\n            return num\n\n        total = to_number(l1) + to_number(l2)\n        dummy = ListNode(0)\n        cur = dummy\n        if total == 0:\n            return ListNode(0)\n        while total:\n            cur.next = ListNode(total % 10)\n            cur = cur.next\n            total //= 10\n        return dummy.next",
      "notes": [
        "能帮助理解逆序链表含义，但面试推荐逐位相加。"
      ]
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "模拟竖式加法：用一个指针分别遍历两个链表，逐位相加。关键点：①用carry变量记录进位 ②当前位的值=(l1.val + l2.val + carry) % 10 ③进位=(l1.val + l2.val + carry) / 10 ④用dummy节点简化头节点处理 ⑤当两个链表都遍历完且carry=0时结束。时间O(max(m,n))，空间O(max(m,n))。",
      "time": "O(max(m,n))",
      "space": "O(max(m,n))",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：把链表当成竖式加法，从低位到高位逐位相加，用 carry 记录进位，用 dummy 节点统一处理新链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 l1=[9,9,9], l2=[1] 检查代码。\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)  # 虚拟头节点，避免单独处理第一个节点\n        cur = dummy\n        carry = 0            # 进位，只可能是 0 或 1\n\n        # 只要任意链表没走完，或最后还有进位，就继续处理\n        while l1 or l2 or carry:\n            x = l1.val if l1 else 0\n            y = l2.val if l2 else 0\n            total = x + y + carry\n\n            carry = total // 10          # 十位作为下一轮进位\n            cur.next = ListNode(total % 10)  # 个位成为当前答案节点\n            cur = cur.next\n\n            if l1:\n                l1 = l1.next\n            if l2:\n                l2 = l2.next\n\n        return dummy.next",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "3": [
    {
      "name": "枚举起点并扩展",
      "badge": "暴力",
      "idea": "固定左端点，从左往右扩展，遇到重复字符就停止。",
      "time": "O(n^2)",
      "space": "O(min(n,字符集大小))",
      "complexityDetail": "每个起点最多向右扫描 n 次，集合保存当前子串字符。",
      "code": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ans = 0\n        for left in range(len(s)):\n            seen = set()\n            for right in range(left, len(s)):\n                if s[right] in seen:\n                    break\n                seen.add(s[right])\n                ans = max(ans, right - left + 1)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "滑动窗口优化：维护一个不重复的窗口[left, right]。right不断向右扩展，当s[right]已经在窗口中时，left向右收缩直到重复消失。用哈希集合O(1)判断是否重复。每个字符最多被left和right各访问一次，所以总时间O(n)。具体做法：用一个集合记录当前窗口内的字符。right右移时，如果s[right]已在集合中，就不断移除s[left]并left++，直到s[right]不在集合中。然后把s[right]加入集合，更新最大长度。",
      "time": "O(n)",
      "space": "O(min(n,字符集大小))",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：用 left/right 维护一个不含重复字符的窗口；右边扩张，遇到重复就移动 left 到重复字符后一位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abba\" 检查代码。\nclass Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}   # last[ch] = 字符 ch 最近一次出现的下标\n        left = 0    # 当前无重复窗口的左边界\n        ans = 0\n\n        for right, ch in enumerate(s):\n            # ch 在窗口内重复出现，left 必须跳到上次 ch 的后一位\n            if ch in last and last[ch] >= left:\n                left = last[ch] + 1\n\n            last[ch] = right\n            ans = max(ans, right - left + 1)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "滑动窗口 + 集合",
      "badge": "推荐",
      "idea": "窗口内始终不含重复字符；右边加入重复字符前，左边不断移出。",
      "time": "O(n)",
      "space": "O(min(n,字符集大小))",
      "complexityDetail": "左右指针都只向右移动，集合保存窗口字符。",
      "code": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        seen = set()\n        left = 0\n        ans = 0\n        for right, ch in enumerate(s):\n            while ch in seen:\n                seen.remove(s[left])\n                left += 1\n            seen.add(ch)\n            ans = max(ans, right - left + 1)\n        return ans",
      "notes": []
    }
  ],
  "4": [
    {
      "name": "合并后取中位数",
      "badge": "基础",
      "idea": "像归并排序一样合并两个有序数组，再直接取中位数。",
      "time": "O(m+n)",
      "space": "O(m+n)",
      "complexityDetail": "需要完整合并数组，总长度为 m+n。",
      "code": "class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        merged = []\n        i = j = 0\n        while i < len(nums1) or j < len(nums2):\n            if j == len(nums2) or (i < len(nums1) and nums1[i] <= nums2[j]):\n                merged.append(nums1[i])\n                i += 1\n            else:\n                merged.append(nums2[j])\n                j += 1\n        n = len(merged)\n        if n % 2:\n            return float(merged[n // 2])\n        return (merged[n // 2 - 1] + merged[n // 2]) / 2",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "在较短数组上二分切分点：nums1 左边取 i 个，nums2 左边取 j 个，并让左半区总数固定。只要 a_left<=b_right 且 b_left<=a_right，就说明左半边都不大于右半边，中位数只由四个边界决定。",
      "time": "O(log(min(m,n)))",
      "space": "O(1)",
      "complexityDetail": "只在较短数组的切分点范围 [0,m] 上二分，每轮排除一半切分位置；只保存常数个边界变量。",
      "code": "# 核心思路：在较短数组上二分切分点，让左半边数量等于右半边，且左半边最大值 <= 右半边最小值。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums1=[], nums2=[1] 检查代码。\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # 始终在较短数组上二分，保证复杂度是 log(min(m,n))\n        if len(nums1) > len(nums2):\n            nums1, nums2 = nums2, nums1\n\n        m, n = len(nums1), len(nums2)\n        total_left = (m + n + 1) // 2  # 左半边需要放多少个元素\n        left, right = 0, m\n\n        while left <= right:\n            i = (left + right) // 2       # nums1 左边取 i 个\n            j = total_left - i            # nums2 左边取 j 个\n\n            a_left = nums1[i - 1] if i > 0 else float('-inf')\n            a_right = nums1[i] if i < m else float('inf')\n            b_left = nums2[j - 1] if j > 0 else float('-inf')\n            b_right = nums2[j] if j < n else float('inf')\n\n            # 找到合法切分：左半边所有数 <= 右半边所有数\n            if a_left <= b_right and b_left <= a_right:\n                if (m + n) % 2 == 1:\n                    return float(max(a_left, b_left))\n                return (max(a_left, b_left) + min(a_right, b_right)) / 2\n\n            # nums1 左边取太多了，i 往左收\n            if a_left > b_right:\n                right = i - 1\n            else:\n                left = i + 1\n\n        return 0.0",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "找第 k 小元素",
      "badge": "进阶",
      "idea": "每次丢掉两个数组中较小的一批前缀，直到找到第 k 小。",
      "time": "O(log(m+n))",
      "space": "O(log(m+n))",
      "complexityDetail": "递归每次至少丢掉 k/2 个元素，递归深度对数级。",
      "code": "class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        def kth(a_start, b_start, k):\n            if a_start == len(nums1):\n                return nums2[b_start + k - 1]\n            if b_start == len(nums2):\n                return nums1[a_start + k - 1]\n            if k == 1:\n                return min(nums1[a_start], nums2[b_start])\n            half = k // 2\n            a_key = nums1[a_start + half - 1] if a_start + half - 1 < len(nums1) else float('inf')\n            b_key = nums2[b_start + half - 1] if b_start + half - 1 < len(nums2) else float('inf')\n            if a_key <= b_key:\n                return kth(a_start + half, b_start, k - half)\n            return kth(a_start, b_start + half, k - half)\n\n        total = len(nums1) + len(nums2)\n        if total % 2:\n            return float(kth(0, 0, total // 2 + 1))\n        return (kth(0, 0, total // 2) + kth(0, 0, total // 2 + 1)) / 2",
      "notes": []
    }
  ],
  "5": [
    {
      "name": "暴力枚举所有子串",
      "badge": "暴力",
      "idea": "枚举每个子串，判断它是否为回文，记录最长长度。",
      "time": "O(n^3)",
      "space": "O(1)",
      "complexityDetail": "子串数量 O(n^2)，每次判断回文最坏 O(n)。",
      "code": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        def is_pal(left, right):\n            while left < right:\n                if s[left] != s[right]:\n                    return False\n                left += 1\n                right -= 1\n            return True\n\n        ans = ''\n        for i in range(len(s)):\n            for j in range(i, len(s)):\n                if j - i + 1 > len(ans) and is_pal(i, j):\n                    ans = s[i:j + 1]\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "方法一DP：dp[i][j]表示s[i..j]是否是回文。转移：dp[i][j]=s[i]==s[j] && (j-i<=2 || dp[i+1][j-1])。i必须倒序遍历（因为dp[i][j]依赖dp[i+1][j-1]）。方法二中心扩展：以每个字符（或两个字符之间）为中心向两边扩展，时间O(n^2)空间O(1)。",
      "time": "O(n²)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：回文串由中心向两边对称扩展；枚举每个字符中心和字符间隙中心，记录最长回文边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"babad\" 检查代码。\nclass Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s:\n            return \"\"\n\n        start = end = 0  # 当前最长回文子串的左右边界\n\n        def expand(left: int, right: int) -> None:\n            nonlocal start, end\n            # 只要左右字符相同，就继续向两边扩张\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                left -= 1\n                right += 1\n\n            # 跳出循环时 [left+1, right-1] 才是真正回文区间\n            if right - left - 2 > end - start:\n                start, end = left + 1, right - 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度中心\n            expand(i, i + 1)   # 偶数长度中心\n\n        return s[start:end + 1]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "中心扩展",
      "badge": "推荐",
      "idea": "回文串一定有中心，枚举每个字符和字符间隙为中心向两侧扩展。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "共有 2n-1 个中心，每次最坏扩展 O(n)。",
      "code": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        start = end = 0\n        def expand(left, right):\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                left -= 1\n                right += 1\n            return left + 1, right - 1\n\n        for i in range(len(s)):\n            l1, r1 = expand(i, i)\n            l2, r2 = expand(i, i + 1)\n            if r1 - l1 > end - start:\n                start, end = l1, r1\n            if r2 - l2 > end - start:\n                start, end = l2, r2\n        return s[start:end + 1]",
      "notes": []
    },
    {
      "name": "动态规划判断回文",
      "badge": "备选",
      "idea": "dp[i][j] 表示 s[i:j+1] 是否为回文，由内部子串状态转移。",
      "time": "O(n^2)",
      "space": "O(n^2)",
      "complexityDetail": "枚举所有左右边界，二维表保存回文状态。",
      "code": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        n = len(s)\n        dp = [[False] * n for _ in range(n)]\n        ans = ''\n        for length in range(1, n + 1):\n            for left in range(n - length + 1):\n                right = left + length - 1\n                if s[left] == s[right] and (length <= 2 or dp[left + 1][right - 1]):\n                    dp[left][right] = True\n                    if length > len(ans):\n                        ans = s[left:right + 1]\n        return ans",
      "notes": []
    }
  ],
  "10": [
    {
      "name": "递归记忆化匹配",
      "badge": "备选",
      "idea": "定义 dfs(i,j) 表示 s[i:] 能否匹配 p[j:]，遇到 * 时分“使用 0 次”和“使用至少 1 次”。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "状态是 i、j 的组合，记忆化后每个状态只计算一次。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        @lru_cache(None)\n        def dfs(i, j):\n            if j == len(p):\n                return i == len(s)\n\n            first = i < len(s) and (p[j] == s[i] or p[j] == '.')\n            if j + 1 < len(p) and p[j + 1] == '*':\n                return dfs(i, j + 2) or (first and dfs(i + 1, j))\n            return first and dfs(i + 1, j + 1)\n\n        return dfs(0, 0)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "二维DP：dp[i][j]=p的前i个字符能否匹配s的前j个字符。如果p[i-1]==\"*\"：dp[i][j]=dp[i-2][j](匹配0次)或(match(s[j-1],p[i-2]) and dp[i][j-1])(匹配多次)。否则：dp[i][j]=match and dp[i-1][j-1]。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp[i][j] 表示 s 前 i 个字符能否匹配 p 前 j 个字符；普通字符看前一格，星号要么删掉前一个模式，要么继续吃一个字符。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"aa\", p=\"a*\" 检查代码。\nclass Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True  # 空串匹配空模式\n\n        # 初始化：s 为空时，只有 a*b*c* 这种模式可能匹配空串\n        for j in range(2, n + 1):\n            if p[j - 1] == '*':\n                dp[0][j] = dp[0][j - 2]\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                elif p[j - 1] == '*':\n                    # 情况1：x* 出现 0 次，直接删掉 p[j-2:j]\n                    dp[i][j] = dp[i][j - 2]\n\n                    # 情况2：x* 至少出现 1 次，前提是 x 能匹配 s[i-1]\n                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:\n                        dp[i][j] = dp[i][j] or dp[i - 1][j]\n\n        return dp[m][n]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "11": [
    {
      "name": "暴力枚举两条边",
      "badge": "暴力",
      "idea": "枚举所有左右边界，面积由短板高度乘宽度决定。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "所有边界对数量是 O(n^2)。",
      "code": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        ans = 0\n        for i in range(len(height)):\n            for j in range(i + 1, len(height)):\n                ans = max(ans, min(height[i], height[j]) * (j - i))\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "双指针：left=0, right=n-1。面积=min(h[left],h[right])*(right-left)。移动较短的那根指针（因为移动较长的线面积一定不会增大）。时间O(n)。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：容器面积由短板决定；双指针从两端开始，每次移动较短的一边，才可能找到更高短板。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[1,1] 检查代码。\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        ans = 0\n\n        while left < right:\n            width = right - left\n            ans = max(ans, width * min(height[left], height[right]))\n\n            # 面积受短板限制，移动长板不会提高当前短板\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "双指针短板移动",
      "badge": "推荐",
      "idea": "左右边界向中间收缩，每次移动较短边，因为面积上限受短板限制。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "两个指针总共移动 n 次。",
      "code": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        ans = 0\n        while left < right:\n            ans = max(ans, min(height[left], height[right]) * (right - left))\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n        return ans",
      "notes": []
    }
  ],
  "15": [
    {
      "name": "三重循环去重",
      "badge": "暴力",
      "idea": "枚举三个下标并用集合去重，能保证正确但复杂度太高。",
      "time": "O(n^3)",
      "space": "O(k)",
      "complexityDetail": "k 是不同三元组数量，三重循环枚举所有组合。",
      "code": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        n = len(nums)\n        ans = set()\n        for i in range(n):\n            for j in range(i + 1, n):\n                for k in range(j + 1, n):\n                    if nums[i] + nums[j] + nums[k] == 0:\n                        ans.add(tuple(sorted((nums[i], nums[j], nums[k]))))\n        return [list(item) for item in sorted(ans)]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "排序后双指针：for i in 0..n-3: if i>0 and nums[i]==nums[i-1] continue; left=i+1, right=n-1; while left<right: sum=nums[i]+nums[left]+nums[right]; if sum==0: 记录，left++跳过重复，right--跳过重复; if sum<0: left++; if sum>0: right--。时间O(n^2)。",
      "time": "O(n²)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：先排序固定一个数，再用左右指针在剩余区间找两数和；去重是这题能 AC 的关键。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-1,0,1,2,-1,-4] 检查代码。\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        n = len(nums)\n\n        for i in range(n - 2):\n            # 固定数去重：相同 nums[i] 只处理第一次\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            # 排序后最小固定数已大于 0，后面不可能凑成 0\n            if nums[i] > 0:\n                break\n\n            left, right = i + 1, n - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    ans.append([nums[i], nums[left], nums[right]])\n                    left += 1\n                    right -= 1\n\n                    # 双指针去重：跳过相同的第二、第三个数\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "排序 + 双指针",
      "badge": "推荐",
      "idea": "先排序，固定第一个数，再用双指针找另外两个数并跳过重复值。",
      "time": "O(n^2)",
      "space": "O(1) 或 O(n)",
      "complexityDetail": "固定一个数 O(n)，双指针线性扫描 O(n)。",
      "code": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        n = len(nums)\n        for i in range(n - 2):\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            if nums[i] > 0:\n                break\n            left, right = i + 1, n - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    ans.append([nums[i], nums[left], nums[right]])\n                    left += 1\n                    right -= 1\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n        return ans",
      "notes": []
    }
  ],
  "17": [
    {
      "name": "队列逐层扩展",
      "badge": "基础",
      "idea": "把当前答案列表看成队列，读到一个数字就给已有字符串追加该数字对应的每个字母。",
      "time": "O(4^n)",
      "space": "O(4^n)",
      "complexityDetail": "最终答案本身最多 4^n 个，空间主要来自结果集。",
      "code": "class Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits:\n            return []\n        mp = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}\n        ans = ['']\n        for d in digits:\n            ans = [prefix + ch for prefix in ans for ch in mp[d]]\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "回溯：path记录当前组合，当path长度等于digits长度时加入结果。for循环遍历当前数字对应的所有字母，选择→递归→撤销。",
      "time": "O(4^n·n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：每个数字对应一组字母，回溯树的第 depth 层决定第 depth 个数字选哪个字母。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 digits=\"\" 检查代码。\nclass Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits:\n            return []\n\n        phone = {\n            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',\n            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'\n        }\n        ans = []\n        path = []\n\n        def backtrack(index: int) -> None:\n            # index 表示正在决定 digits[index]\n            if index == len(digits):\n                ans.append(''.join(path))\n                return\n\n            for ch in phone[digits[index]]:\n                path.append(ch)          # 选择一个字母\n                backtrack(index + 1)     # 递归决定下一个数字\n                path.pop()               # 撤销选择，尝试同层其他字母\n\n        backtrack(0)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "19": [
    {
      "name": "两次遍历求长度",
      "badge": "基础",
      "idea": "第一次遍历得到链表长度，第二次走到倒数第 n 个结点的前一个结点并删除。",
      "time": "O(L)",
      "space": "O(1)",
      "complexityDetail": "虽然遍历两次，但总访问次数仍然是线性的。",
      "code": "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)\n        length = 0\n        cur = head\n        while cur:\n            length += 1\n            cur = cur.next\n\n        cur = dummy\n        for _ in range(length - n):\n            cur = cur.next\n        cur.next = cur.next.next\n        return dummy.next",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "双指针一次遍历：创建dummy节点指向head。fast先走n步，然后fast和slow同步走，fast到末尾时slow在待删节点前一个。slow.next=slow.next.next。",
      "time": "O(L)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：快指针先走 n 步，再让快慢一起走；快指针到尾时，慢指针正好停在待删节点前一个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1], n=1 检查代码。\nclass Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)  # 处理删除头节点的情况\n        fast = slow = dummy\n\n        # fast 先走 n 步，制造 n 个节点的间距\n        for _ in range(n):\n            fast = fast.next\n\n        # fast 到最后一个节点时，slow 在待删除节点前一个\n        while fast.next:\n            fast = fast.next\n            slow = slow.next\n\n        slow.next = slow.next.next\n        return dummy.next",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "20": [
    {
      "name": "反复消除相邻括号",
      "badge": "暴力",
      "idea": "不断删除字符串里的 \"()\"、\"[]\"、\"{}\"，最后为空则合法。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "每轮替换要扫描字符串，最坏需要 O(n) 轮。",
      "code": "class Solution:\n    def isValid(self, s: str) -> bool:\n        old = None\n        while old != s:\n            old = s\n            s = s.replace('()', '').replace('[]', '').replace('{}', '')\n        return s == ''",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "栈：遍历字符串，遇到左括号入栈，遇到右括号时检查栈顶是否匹配——匹配则出栈，不匹配则返回false。遍历结束后栈为空则有效。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遇到左括号入栈；遇到右括号时，栈顶必须是对应的左括号，否则立刻失败。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"()[]{}\" 检查代码。\nclass Solution:\n    def isValid(self, s: str) -> bool:\n        pair = {')': '(', ']': '[', '}': '{'}\n        stack = []\n\n        for ch in s:\n            if ch in pair:  # ch 是右括号，需要匹配栈顶\n                if not stack or stack[-1] != pair[ch]:\n                    return False\n                stack.pop()\n            else:           # ch 是左括号，等待后续右括号匹配\n                stack.append(ch)\n\n        return not stack",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "21": [
    {
      "name": "递归合并",
      "badge": "备选",
      "idea": "每次取两个链表头中较小的一个，剩余部分递归合并。",
      "time": "O(m+n)",
      "space": "O(m+n)",
      "complexityDetail": "每个节点处理一次，递归栈深度最多 m+n。",
      "code": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        if not list1:\n            return list2\n        if not list2:\n            return list1\n        if list1.val <= list2.val:\n            list1.next = self.mergeTwoLists(list1.next, list2)\n            return list1\n        list2.next = self.mergeTwoLists(list1, list2.next)\n        return list2",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "迭代合并：dummy节点，p指针。while l1 and l2: 取较小的接到p后面，p前进。循环结束后接到剩余部分。",
      "time": "O(m+n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：两个指针分别指向两个链表当前最小节点，每次把较小节点接到结果链表后面。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 list1=[], list2=[] 检查代码。\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n\n        while list1 and list2:\n            if list1.val <= list2.val:\n                cur.next = list1\n                list1 = list1.next\n            else:\n                cur.next = list2\n                list2 = list2.next\n            cur = cur.next\n\n        # 剩余链表本身已经有序，直接接上即可\n        cur.next = list1 if list1 else list2\n        return dummy.next",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "22": [
    {
      "name": "生成全部再过滤",
      "badge": "暴力",
      "idea": "先生成所有长度为 2n 的括号串，再检查是否合法。",
      "time": "O(2^(2n) * n)",
      "space": "O(n)",
      "complexityDetail": "共有 2^(2n) 个候选串，每个校验需要 O(n)。",
      "code": "class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        def valid(path):\n            bal = 0\n            for ch in path:\n                bal += 1 if ch == '(' else -1\n                if bal < 0:\n                    return False\n            return bal == 0\n\n        def dfs(path):\n            if len(path) == 2 * n:\n                if valid(path):\n                    ans.append(path)\n                return\n            dfs(path + '(')\n            dfs(path + ')')\n\n        dfs('')\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "回溯剪枝：left记录已用的(数，right记录已用的)数。if left<n: 加(递归; if right<left: 加)递归。当长度=2n时记录结果。",
      "time": "O(Cn·n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：回溯过程中只生成合法前缀：左括号数量小于 n 才能加左括号，右括号数量小于左括号数量才能加右括号。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        path = []\n\n        def backtrack(left_count: int, right_count: int) -> None:\n            # path 长度达到 2n，说明得到一个完整合法组合\n            if len(path) == 2 * n:\n                ans.append(''.join(path))\n                return\n\n            # 只要左括号还没用完，就可以加左括号\n            if left_count < n:\n                path.append('(')\n                backtrack(left_count + 1, right_count)\n                path.pop()\n\n            # 右括号不能超过左括号，否则前缀会非法\n            if right_count < left_count:\n                path.append(')')\n                backtrack(left_count, right_count + 1)\n                path.pop()\n\n        backtrack(0, 0)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "31": [
    {
      "name": "找下一个更大排列并排序后缀",
      "badge": "基础",
      "idea": "找到第一个可增大的位置，交换后把右侧后缀升序排列。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "排序后缀的成本是 O(n log n)，Python 切片会产生额外空间。",
      "code": "class Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        i = len(nums) - 2\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n        if i >= 0:\n            j = len(nums) - 1\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n        nums[i + 1:] = sorted(nums[i + 1:])",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "三步法：①从右找下降位i ②从右找第一个>nums[i]的j ③swap(i,j) ④reverse(i+1)。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：从右往左找第一个下降位置 i，再用右侧刚好更大的数交换，最后把右侧改成升序。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        n = len(nums)\n        i = n - 2\n\n        # 找到第一个 nums[i] < nums[i+1]，说明 i 可以被增大\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            # 从右侧找第一个比 nums[i] 大的数，它是“刚好更大”的交换对象\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        # i 右侧原本是降序，反转后变成最小升序后缀\n        left, right = i + 1, n - 1\n        while left < right:\n            nums[left], nums[right] = nums[right], nums[left]\n            left += 1\n            right -= 1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "标准原地反转后缀",
      "badge": "推荐",
      "idea": "后缀本身已经降序，交换后只需反转后缀即可变为最小升序。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "从右向左扫描、交换、反转后缀都为线性。",
      "code": "class Solution:\n    def nextPermutation(self, nums: List[int]) -> None:\n        i = len(nums) - 2\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n        if i >= 0:\n            j = len(nums) - 1\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n        left, right = i + 1, len(nums) - 1\n        while left < right:\n            nums[left], nums[right] = nums[right], nums[left]\n            left += 1\n            right -= 1",
      "notes": []
    }
  ],
  "32": [
    {
      "name": "动态规划",
      "badge": "备选",
      "idea": "dp[i] 表示以下标 i 结尾的最长有效括号长度，遇到右括号时向前找能匹配的左括号。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个位置只计算一次，dp 数组保存状态。",
      "code": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        dp = [0] * len(s)\n        ans = 0\n        for i in range(1, len(s)):\n            if s[i] == ')':\n                pre = i - dp[i - 1] - 1\n                if pre >= 0 and s[pre] == '(':\n                    dp[i] = dp[i - 1] + 2\n                    if pre > 0:\n                        dp[i] += dp[pre - 1]\n                    ans = max(ans, dp[i])\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "栈存下标，栈底放-1作为基准。遇到(入栈；遇到)弹栈，如果栈空则入栈当前下标作为新基准，否则更新最大长度=i-stack[-1]。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：栈中保存还没匹配的位置；用 -1 作为哨兵，遇到合法匹配时用当前下标减栈顶得到长度。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"(()\" 检查代码。\nclass Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        stack = [-1]  # 栈底哨兵：最后一个无法匹配的右括号位置\n        ans = 0\n\n        for i, ch in enumerate(s):\n            if ch == '(':\n                stack.append(i)\n            else:\n                stack.pop()\n                if not stack:\n                    # 当前 ')' 没有左括号匹配，成为新的分割点\n                    stack.append(i)\n                else:\n                    # i - stack[-1] 是当前合法段长度\n                    ans = max(ans, i - stack[-1])\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "栈保存下标",
      "badge": "推荐",
      "idea": "栈底保存上一个无法匹配的位置，遇到匹配成功就用当前下标减栈顶得到长度。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个下标最多入栈出栈一次。",
      "code": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        stack = [-1]\n        ans = 0\n        for i, ch in enumerate(s):\n            if ch == '(':\n                stack.append(i)\n            else:\n                stack.pop()\n                if not stack:\n                    stack.append(i)\n                else:\n                    ans = max(ans, i - stack[-1])\n        return ans",
      "notes": []
    },
    {
      "name": "左右两遍计数",
      "badge": "备选",
      "idea": "从左到右和从右到左各扫一遍，用左右括号数量相等时更新答案。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "两次线性扫描，不需要栈。",
      "code": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        ans = 0\n        left = right = 0\n        for ch in s:\n            left += ch == '('\n            right += ch == ')'\n            if left == right:\n                ans = max(ans, 2 * right)\n            elif right > left:\n                left = right = 0\n        left = right = 0\n        for ch in reversed(s):\n            left += ch == '('\n            right += ch == ')'\n            if left == right:\n                ans = max(ans, 2 * left)\n            elif left > right:\n                left = right = 0\n        return ans",
      "notes": []
    }
  ],
  "33": [
    {
      "name": "线性扫描",
      "badge": "基础",
      "idea": "从左到右找 target，不利用旋转数组的有序结构。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "最坏情况下要看完所有元素。",
      "code": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        for i, x in enumerate(nums):\n            if x == target:\n                return i\n        return -1",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "使用二分查找。每次计算 mid 后，先判断 nums[left..mid] 还是 nums[mid..right] 有序，再根据 target 是否落在有序区间内决定保留哪一半。由于每轮都能排除约一半候选元素，时间复杂度降为 O(log n)，空间复杂度 O(1)。",
      "time": "O(log n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：旋转数组每次二分后，左右两半至少有一半是有序的；判断 target 是否落在有序半边来收缩区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,5,6,7,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return mid\n\n            # 左半边 [left, mid] 有序\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            # 右半边 [mid, right] 有序\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return -1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "34": [
    {
      "name": "线性查找左右边界",
      "badge": "基础",
      "idea": "扫描数组，第一次遇到 target 记左边界，之后不断更新右边界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "没有利用数组有序性，因此最坏扫描完整数组。",
      "code": "class Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        left = right = -1\n        for i, x in enumerate(nums):\n            if x == target:\n                if left == -1:\n                    left = i\n                right = i\n        return [left, right]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "两次二分：左边界-找第一个>=target的位置；右边界-找最后一个<=target的位置。时间O(logn)。",
      "time": "O(log n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：用两次 lower_bound：第一次找 target 的第一个位置，第二次找 target+1 的第一个位置再减一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[5,7,7,8,8,10], target=8 检查代码。\nclass Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        def lower_bound(x: int) -> int:\n            left, right = 0, len(nums)\n            # 在 [left, right) 中找第一个 >= x 的位置\n            while left < right:\n                mid = (left + right) // 2\n                if nums[mid] < x:\n                    left = mid + 1\n                else:\n                    right = mid\n            return left\n\n        start = lower_bound(target)\n        if start == len(nums) or nums[start] != target:\n            return [-1, -1]\n\n        end = lower_bound(target + 1) - 1\n        return [start, end]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "39": [
    {
      "name": "选/不选递归",
      "badge": "基础",
      "idea": "对每个候选数做选或不选；选中后因为可以重复使用，所以递归仍停在当前下标。",
      "time": "指数级",
      "space": "O(target/min(candidates))",
      "complexityDetail": "递归树规模与 target 和候选数组相关，最坏为指数级。",
      "code": "class Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        candidates.sort()\n        ans = []\n        path = []\n\n        def dfs(i, rest):\n            if rest == 0:\n                ans.append(path[:])\n                return\n            if i == len(candidates) or rest < 0:\n                return\n            dfs(i + 1, rest)\n            path.append(candidates[i])\n            dfs(i, rest - candidates[i])\n            path.pop()\n\n        dfs(0, target)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "回溯+排序剪枝：排序后从start开始选择，每个数字可以选择多次（递归时传i而不是i+1）。如果当前数字>target就break。",
      "time": "O(S)",
      "space": "O(target/min(candidates))",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：回溯枚举“选哪个候选数”，因为同一个数字可以重复使用，递归时 start 仍传当前 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 candidates=[2,3,6,7], target=7 检查代码。\nclass Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        candidates.sort()\n        ans = []\n        path = []\n\n        def backtrack(start: int, remain: int) -> None:\n            if remain == 0:\n                ans.append(path[:])\n                return\n\n            for i in range(start, len(candidates)):\n                x = candidates[i]\n                if x > remain:  # 排序后后面更大，直接剪枝\n                    break\n                path.append(x)\n                backtrack(i, remain - x)  # i 不是 i+1，因为可以重复选 x\n                path.pop()\n\n        backtrack(0, target)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "42": [
    {
      "name": "每格向两边找最高墙",
      "badge": "暴力",
      "idea": "对每个位置分别扫描左侧最高墙和右侧最高墙，能接的水由较矮墙决定。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "每个位置都可能向左右各扫描一遍。",
      "code": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        ans = 0\n        n = len(height)\n        for i in range(n):\n            left_max = max(height[:i + 1])\n            right_max = max(height[i:])\n            ans += min(left_max, right_max) - height[i]\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "双指针：left=0, right=n-1, left_max=0, right_max=0。当height[left]<height[right]时，如果height[left]>=left_max则更新left_max，否则接水left_max-height[left]。left++。另一边同理。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：双指针维护左右最高墙；哪边最高墙更低，就能确定哪边当前位置接多少水。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 height=[0,1,0,2,1,0,1,3,2,1,2,1] 检查代码。\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max = right_max = 0\n        ans = 0\n\n        while left < right:\n            left_max = max(left_max, height[left])\n            right_max = max(right_max, height[right])\n\n            # 左侧最高墙更矮，当前位置水量由 left_max 决定\n            if left_max < right_max:\n                ans += left_max - height[left]\n                left += 1\n            else:\n                ans += right_max - height[right]\n                right -= 1\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "前后缀最大值",
      "badge": "基础",
      "idea": "预处理每个位置左侧最高墙和右侧最高墙，再计算当前位置接水量。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "三次线性遍历，两个辅助数组。",
      "code": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        n = len(height)\n        if n == 0:\n            return 0\n        left_max = [0] * n\n        right_max = [0] * n\n        left_max[0] = height[0]\n        for i in range(1, n):\n            left_max[i] = max(left_max[i - 1], height[i])\n        right_max[-1] = height[-1]\n        for i in range(n - 2, -1, -1):\n            right_max[i] = max(right_max[i + 1], height[i])\n        return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))",
      "notes": []
    },
    {
      "name": "双指针",
      "badge": "推荐",
      "idea": "较矮一侧的最大墙决定当前接水量，因此每次移动较矮的一边。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "左右指针各移动至多 n 次。",
      "code": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max = right_max = 0\n        ans = 0\n        while left < right:\n            if height[left] < height[right]:\n                left_max = max(left_max, height[left])\n                ans += left_max - height[left]\n                left += 1\n            else:\n                right_max = max(right_max, height[right])\n                ans += right_max - height[right]\n                right -= 1\n        return ans",
      "notes": []
    }
  ],
  "46": [
    {
      "name": "交换法回溯",
      "badge": "备选",
      "idea": "把当前位置与后面的每个位置交换，递归确定下一位。",
      "time": "O(n! * n)",
      "space": "O(n)",
      "complexityDetail": "有 n! 个排列，复制每个排列需要 O(n)。",
      "code": "class Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        def dfs(start):\n            if start == len(nums):\n                ans.append(nums[:])\n                return\n            for i in range(start, len(nums)):\n                nums[start], nums[i] = nums[i], nums[start]\n                dfs(start + 1)\n                nums[start], nums[i] = nums[i], nums[start]\n        dfs(0)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "回溯+used数组：for每个数字，如果没用过就选择它（标记used），递归下一层，撤销选择（取消标记）。",
      "time": "O(n!·n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：回溯树每层选择一个还没用过的数，路径长度等于 n 时得到一个排列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n        used = [False] * len(nums)\n\n        def backtrack() -> None:\n            if len(path) == len(nums):\n                ans.append(path[:])\n                return\n\n            for i, x in enumerate(nums):\n                if used[i]:\n                    continue\n                used[i] = True\n                path.append(x)\n                backtrack()\n                path.pop()\n                used[i] = False\n\n        backtrack()\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "48": [
    {
      "name": "额外矩阵",
      "badge": "基础",
      "idea": "新建矩阵，把原矩阵 (i,j) 放到旋转后 (j,n-1-i)。",
      "time": "O(n^2)",
      "space": "O(n^2)",
      "complexityDetail": "每个格子移动一次，但使用了额外矩阵。",
      "code": "class Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n        rotated = [[0] * n for _ in range(n)]\n        for i in range(n):\n            for j in range(n):\n                rotated[j][n - 1 - i] = matrix[i][j]\n        for i in range(n):\n            matrix[i][:] = rotated[i]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "原地旋转：先转置（swap(matrix[i][j], matrix[j][i])），再水平翻转（每行reverse）。O(1)空间。",
      "time": "O(n²)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：顺时针旋转 90 度可以拆成两步：先沿主对角线转置，再把每一行反转。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix=[[1]] 检查代码。\nclass Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n\n        # 第一步：沿主对角线转置，matrix[i][j] 与 matrix[j][i] 交换\n        for i in range(n):\n            for j in range(i + 1, n):\n                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n\n        # 第二步：每一行左右反转\n        for row in matrix:\n            row.reverse()",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "49": [
    {
      "name": "排序字符串作为 key",
      "badge": "推荐",
      "idea": "把每个字符串排序，异位词排序后结果相同，因此能分到同一组。",
      "time": "O(NKlogK)",
      "space": "O(NK)",
      "complexityDetail": "N 是字符串数量，K 是平均长度；每个字符串排序成本 KlogK。",
      "code": "from collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n        for s in strs:\n            key = ''.join(sorted(s))\n            groups[key].append(s)\n        return list(groups.values())",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "哈希表：key=sorted(s)，相同key的分为一组。O(n*mlogm)时间。",
      "time": "O(n·klogk)",
      "space": "O(nk)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：字母异位词排序后得到同一个 key，把相同 key 的字符串放到同一组。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 strs=[\"\"] 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n\n        for word in strs:\n            # 异位词排序后的字符序列完全相同\n            key = ''.join(sorted(word))\n            groups[key].append(word)\n\n        return list(groups.values())",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "26 字母计数 key",
      "badge": "进阶",
      "idea": "用长度为 26 的计数元组作为 key，避免对每个字符串排序。",
      "time": "O(NK)",
      "space": "O(NK)",
      "complexityDetail": "每个字符串只统计字符一次。",
      "code": "from collections import defaultdict\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n        for s in strs:\n            cnt = [0] * 26\n            for ch in s:\n                cnt[ord(ch) - ord('a')] += 1\n            groups[tuple(cnt)].append(s)\n        return list(groups.values())",
      "notes": []
    }
  ],
  "53": [
    {
      "name": "枚举所有子数组",
      "badge": "暴力",
      "idea": "固定左端点，向右累计子数组和并更新最大值。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "子数组数量是 O(n^2)，滚动累加避免第三层求和。",
      "code": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        ans = nums[0]\n        for i in range(len(nums)):\n            total = 0\n            for j in range(i, len(nums)):\n                total += nums[j]\n                ans = max(ans, total)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "Kadane算法：curr=max(nums[i], curr+nums[i])。如果curr+nums[i]<nums[i]，说明前面的和是负数，重新开始。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp 含义是“必须以当前位置结尾的最大子数组和”；要么接上前面，要么从当前数重新开始。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[-2,1,-3,4,-1,2,1,-5,4] 检查代码。\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        cur = ans = nums[0]  # 必须用 nums[0] 初始化，防止全负数错误\n\n        for x in nums[1:]:\n            # 如果 cur 为负，接上它只会拖累 x，所以从 x 重新开始\n            cur = max(x, cur + x)\n            ans = max(ans, cur)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "Kadane 动态规划",
      "badge": "推荐",
      "idea": "cur 表示以当前元素结尾的最大子数组和，要么接上前面，要么从当前重新开始。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个元素只更新一次状态。",
      "code": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        cur = ans = nums[0]\n        for x in nums[1:]:\n            cur = max(x, cur + x)\n            ans = max(ans, cur)\n        return ans",
      "notes": []
    },
    {
      "name": "前缀和 + 最小前缀",
      "badge": "备选",
      "idea": "当前前缀和减去之前最小前缀和，就是以当前位置结尾的最大子数组和。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "线性维护 prefix 和 min_prefix。",
      "code": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        prefix = 0\n        min_prefix = 0\n        ans = nums[0]\n        for x in nums:\n            prefix += x\n            ans = max(ans, prefix - min_prefix)\n            min_prefix = min(min_prefix, prefix)\n        return ans",
      "notes": []
    }
  ],
  "55": [
    {
      "name": "动态规划可达性",
      "badge": "基础",
      "idea": "dp[i] 表示能否到达下标 i，再用前面的每个可达位置转移。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "每个位置都可能检查前面所有位置。",
      "code": "class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        n = len(nums)\n        dp = [False] * n\n        dp[0] = True\n        for i in range(n):\n            if not dp[i]:\n                continue\n            for j in range(i + 1, min(n, i + nums[i] + 1)):\n                dp[j] = True\n        return dp[-1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "贪心：维护max_i。遍历时如果i>max_i返回false，否则更新max_i。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：维护当前能到达的最远位置 farthest；遍历到 i 时如果 i 已经超过 farthest，说明断档不可达。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,1,1,4] 检查代码。\nclass Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        farthest = 0\n\n        for i, jump in enumerate(nums):\n            if i > farthest:\n                return False  # 当前下标都到不了，后面更不可能\n            farthest = max(farthest, i + jump)\n            if farthest >= len(nums) - 1:\n                return True\n\n        return True",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "56": [
    {
      "name": "逐个插入并合并",
      "badge": "基础",
      "idea": "维护一个已合并区间列表，每来一个区间就和已有区间比较并合并。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "每插入一个区间都可能扫描当前结果列表。",
      "code": "class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        ans = []\n        for start, end in intervals:\n            cur = [start, end]\n            next_ans = []\n            for a, b in ans:\n                if b < cur[0] or cur[1] < a:\n                    next_ans.append([a, b])\n                else:\n                    cur[0] = min(cur[0], a)\n                    cur[1] = max(cur[1], b)\n            next_ans.append(cur)\n            ans = next_ans\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "排序后线性扫描：按起点排序。for interval: if merged非空且interval[0]<=merged[-1][1]: 合并; else: 新增。",
      "time": "O(nlogn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：先按左端点排序，再从左到右维护已经合并好的最后一个区间，能重叠就扩右端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 intervals=[[1,3],[2,6],[8,10],[15,18]] 检查代码。\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n\n        for start, end in intervals:\n            if not merged or start > merged[-1][1]:\n                merged.append([start, end])\n            else:\n                # 当前区间与最后一个区间重叠，右端点取更大值\n                merged[-1][1] = max(merged[-1][1], end)\n\n        return merged",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "62": [
    {
      "name": "二维 DP",
      "badge": "基础",
      "idea": "dp[i][j] 表示走到第 i 行第 j 列的路径数，只能从上方或左方转移。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "每个格子计算一次，保存整张 DP 表。",
      "code": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        dp = [[1] * n for _ in range(m)]\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]\n        return dp[-1][-1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[i][j]=dp[i-1][j]+dp[i][j-1]。初始化：第一行和第一列都是1（只有一种走法）。时间O(mn)，空间可优化为O(n)（滚动数组）。",
      "time": "O(mn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：到达 (i,j) 只能从上方或左方来，所以路径数等于上方路径数加左方路径数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 m=3, n=7 检查代码。\nclass Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # 第一行每个格子都只有 1 种走法\n        dp = [1] * n\n\n        for _ in range(1, m):\n            for j in range(1, n):\n                # dp[j] 是上方，dp[j-1] 是左方\n                dp[j] += dp[j - 1]\n\n        return dp[-1]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "滚动数组 DP",
      "badge": "推荐",
      "idea": "一行一行更新，dp[j] 表示当前行第 j 列路径数。",
      "time": "O(mn)",
      "space": "O(n)",
      "complexityDetail": "每个格子计算一次，只保留一行状态。",
      "code": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        dp = [1] * n\n        for _ in range(1, m):\n            for j in range(1, n):\n                dp[j] += dp[j - 1]\n        return dp[-1]",
      "notes": []
    },
    {
      "name": "组合数学",
      "badge": "进阶",
      "idea": "总共走 m+n-2 步，其中选择 m-1 步向下即可。",
      "time": "O(min(m,n))",
      "space": "O(1)",
      "complexityDetail": "计算组合数 C(m+n-2, m-1)。",
      "code": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        a = min(m - 1, n - 1)\n        b = m + n - 2\n        ans = 1\n        for i in range(1, a + 1):\n            ans = ans * (b - a + i) // i\n        return ans",
      "notes": []
    }
  ],
  "64": [
    {
      "name": "额外 DP 表",
      "badge": "基础",
      "idea": "dp[i][j] 表示从左上角到当前位置的最小路径和。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "每个格子计算一次，额外保存 m*n 张表。",
      "code": "class Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [[0] * n for _ in range(m)]\n        dp[0][0] = grid[0][0]\n        for i in range(1, m):\n            dp[i][0] = dp[i - 1][0] + grid[i][0]\n        for j in range(1, n):\n            dp[0][j] = dp[0][j - 1] + grid[0][j]\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]\n        return dp[-1][-1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1])。初始化：第一行累加，第一列累加。时间O(mn)。",
      "time": "O(mn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp[j] 表示走到当前行第 j 列的最小路径和，只能从上方 dp[j] 或左方 dp[j-1] 转移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 grid=[[1,3,1],[1,5,1],[4,2,1]] 检查代码。\nclass Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n\n        # 初始化第一行：只能从左边来\n        for j in range(1, n):\n            dp[j] = dp[j - 1] + grid[0][j]\n\n        for i in range(1, m):\n            dp[0] += grid[i][0]  # 第一列只能从上方来\n            for j in range(1, n):\n                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]\n\n        return dp[-1]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "原地 DP",
      "badge": "推荐",
      "idea": "直接把 grid[i][j] 改成到达该格子的最小路径和。",
      "time": "O(mn)",
      "space": "O(1)",
      "complexityDetail": "复用输入矩阵，不再开额外 DP 表。",
      "code": "class Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        for i in range(m):\n            for j in range(n):\n                if i == 0 and j == 0:\n                    continue\n                up = grid[i - 1][j] if i > 0 else float('inf')\n                left = grid[i][j - 1] if j > 0 else float('inf')\n                grid[i][j] += min(up, left)\n        return grid[-1][-1]",
      "notes": []
    }
  ],
  "70": [
    {
      "name": "递归记忆化",
      "badge": "基础",
      "idea": "f(n)=f(n-1)+f(n-2)，用缓存避免重复递归。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个 n 只计算一次，递归栈和缓存都为 O(n)。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def climbStairs(self, n: int) -> int:\n        @lru_cache(None)\n        def dfs(k):\n            if k <= 2:\n                return k\n            return dfs(k - 1) + dfs(k - 2)\n        return dfs(n)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。 只需要前两阶答案，滚动变量即可。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：到第 i 阶的最后一步只能从 i-1 或 i-2 来，所以 f[i]=f[i-1]+f[i-2]。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n\n        prev2, prev1 = 1, 2  # f(1), f(2)\n        for _ in range(3, n + 1):\n            cur = prev1 + prev2\n            prev2, prev1 = prev1, cur\n\n        return prev1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "滚动变量 DP",
      "badge": "推荐",
      "idea": "只需要前两级台阶的方案数，用两个变量滚动更新。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个台阶计算一次，只保存两个状态。",
      "code": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        return b",
      "notes": []
    }
  ],
  "72": [
    {
      "name": "递归记忆化",
      "badge": "基础",
      "idea": "dfs(i,j) 表示 word1[i:] 到 word2[j:] 的编辑距离，尝试插入、删除、替换。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "状态数量为 m*n，每个状态常数次转移。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        @lru_cache(None)\n        def dfs(i, j):\n            if i == len(word1):\n                return len(word2) - j\n            if j == len(word2):\n                return len(word1) - i\n            if word1[i] == word2[j]:\n                return dfs(i + 1, j + 1)\n            return 1 + min(dfs(i + 1, j), dfs(i, j + 1), dfs(i + 1, j + 1))\n        return dfs(0, 0)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[i][j]=min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(same?0:1))。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数；最后一步分插入、删除、替换/不动。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 word1=\"horse\", word2=\"ros\" 检查代码。\nclass Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n\n        # word1 前 i 个字符变成空串：删除 i 次\n        for i in range(m + 1):\n            dp[i][0] = i\n        # 空串变成 word2 前 j 个字符：插入 j 次\n        for j in range(n + 1):\n            dp[0][j] = j\n\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = 1 + min(\n                        dp[i - 1][j],     # 删除 word1[i-1]\n                        dp[i][j - 1],     # 插入 word2[j-1]\n                        dp[i - 1][j - 1]  # 替换 word1[i-1]\n                    )\n\n        return dp[m][n]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "75": [
    {
      "name": "计数排序",
      "badge": "基础",
      "idea": "统计 0、1、2 出现次数，再按顺序覆盖数组。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "只需要三个计数器，不依赖额外数组。",
      "code": "class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        cnt0 = cnt1 = cnt2 = 0\n        for x in nums:\n            if x == 0:\n                cnt0 += 1\n            elif x == 1:\n                cnt1 += 1\n            else:\n                cnt2 += 1\n        nums[:cnt0] = [0] * cnt0\n        nums[cnt0:cnt0 + cnt1] = [1] * cnt1\n        nums[cnt0 + cnt1:] = [2] * cnt2",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。 每个元素最多被交换到所属区域一次，原地排序。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：荷兰国旗三指针：left 左边全是 0，right 右边全是 2，i 扫描未知区间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,0,2,1,1,0] 检查代码。\nclass Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        left, i, right = 0, 0, len(nums) - 1\n\n        while i <= right:\n            if nums[i] == 0:\n                nums[left], nums[i] = nums[i], nums[left]\n                left += 1\n                i += 1\n            elif nums[i] == 2:\n                nums[i], nums[right] = nums[right], nums[i]\n                right -= 1\n                # 注意：这里 i 不加一，因为换过来的元素还没检查\n            else:\n                i += 1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "荷兰国旗三指针",
      "badge": "推荐",
      "idea": "left 前面全是 0，right 后面全是 2，i 扫描未知区间。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个元素最多被交换常数次。",
      "code": "class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        left, i, right = 0, 0, len(nums) - 1\n        while i <= right:\n            if nums[i] == 0:\n                nums[left], nums[i] = nums[i], nums[left]\n                left += 1\n                i += 1\n            elif nums[i] == 2:\n                nums[right], nums[i] = nums[i], nums[right]\n                right -= 1\n            else:\n                i += 1",
      "notes": []
    }
  ],
  "76": [
    {
      "name": "枚举所有窗口",
      "badge": "暴力",
      "idea": "枚举所有子串并检查是否覆盖 t。",
      "time": "O(n^2 * C)",
      "space": "O(C)",
      "complexityDetail": "C 是字符集大小；每个窗口都要比较频次。",
      "code": "from collections import Counter\n\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        best = ''\n        for i in range(len(s)):\n            window = Counter()\n            for j in range(i, len(s)):\n                window[s[j]] += 1\n                if all(window[c] >= need[c] for c in need):\n                    if not best or j - i + 1 < len(best):\n                        best = s[i:j + 1]\n                    break\n        return best",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。 左右指针都只向右移动；计数字典大小受字符集限制。",
      "time": "O(|s|+|t|)",
      "space": "O(字符集大小)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：滑动窗口记录窗口内字符频率；当窗口覆盖 t 后，持续收缩左边界来找最短答案。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"ADOBECODEBANC\", t=\"ABC\" 检查代码。\nfrom collections import Counter, defaultdict\n\nclass Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        window = defaultdict(int)\n        required = len(need)  # 有多少种字符需要满足频次\n        formed = 0            # 当前有多少种字符已经满足频次\n        left = 0\n        best_len = float('inf')\n        best_start = 0\n\n        for right, ch in enumerate(s):\n            window[ch] += 1\n            if ch in need and window[ch] == need[ch]:\n                formed += 1\n\n            # 当前窗口已经覆盖 t，尝试收缩到最短\n            while formed == required:\n                if right - left + 1 < best_len:\n                    best_len = right - left + 1\n                    best_start = left\n\n                out = s[left]\n                window[out] -= 1\n                if out in need and window[out] < need[out]:\n                    formed -= 1\n                left += 1\n\n        return '' if best_len == float('inf') else s[best_start:best_start + best_len]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "78": [
    {
      "name": "位掩码枚举",
      "badge": "基础",
      "idea": "用二进制位表示每个元素选或不选，一共 2^n 种状态。",
      "time": "O(n * 2^n)",
      "space": "O(n * 2^n)",
      "complexityDetail": "每个子集复制最多 n 个元素，结果集本身也是指数级。",
      "code": "class Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        n = len(nums)\n        ans = []\n        for mask in range(1 << n):\n            cur = []\n            for i in range(n):\n                if mask & (1 << i):\n                    cur.append(nums[i])\n            ans.append(cur)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。 共有 2^n 个子集，拷贝每个子集最坏 O(n)；递归深度 n。",
      "time": "O(2^n·n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：子集问题的回溯树中，每个节点都是一个答案；从 start 开始继续选择，避免重复组合。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3] 检查代码。\nclass Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        ans = []\n        path = []\n\n        def backtrack(start: int) -> None:\n            # 子集题：树上的每一个节点都是答案\n            ans.append(path[:])\n\n            for i in range(start, len(nums)):\n                path.append(nums[i])\n                backtrack(i + 1)\n                path.pop()\n\n        backtrack(0)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "迭代扩展子集",
      "badge": "备选",
      "idea": "每读到一个新数，就把它追加到已有所有子集后面，形成一批新子集。",
      "time": "O(n * 2^n)",
      "space": "O(n * 2^n)",
      "complexityDetail": "结果集本身包含 2^n 个子集。",
      "code": "class Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        ans = [[]]\n        for x in nums:\n            ans += [cur + [x] for cur in ans]\n        return ans",
      "notes": []
    }
  ],
  "79": [
    {
      "name": "DFS + 额外 visited",
      "badge": "基础",
      "idea": "从每个格子出发 DFS，用 visited 集合记录当前路径已经使用的格子。",
      "time": "O(mn * 4^L)",
      "space": "O(L)",
      "complexityDetail": "L 是单词长度，每一步最多向四个方向扩展。",
      "code": "class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        def dfs(i, j, k, visited):\n            if k == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n:\n                return False\n            if (i, j) in visited or board[i][j] != word[k]:\n                return False\n            visited.add((i, j))\n            ok = dfs(i + 1, j, k + 1, visited) or dfs(i - 1, j, k + 1, visited) or dfs(i, j + 1, k + 1, visited) or dfs(i, j - 1, k + 1, visited)\n            visited.remove((i, j))\n            return ok\n\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0, set()):\n                    return True\n        return False",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。 每个起点 DFS，除第一步外最多 3 个方向可走；L 为单词长度，递归深度 L。",
      "time": "O(mn·3^L)",
      "space": "O(L)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：从每个格子尝试作为起点做 DFS；路径中格子不能重复使用，所以递归前临时标记，递归后恢复。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 board=[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word=\"ABCCED\" 检查代码。\nclass Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        m, n = len(board), len(board[0])\n        if len(word) > m * n:\n            return False\n\n        def dfs(i: int, j: int, k: int) -> bool:\n            # k 表示正在匹配 word[k]\n            if k == len(word):\n                return True\n            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:\n                return False\n\n            saved = board[i][j]\n            board[i][j] = '#'  # 标记已访问，防止同一路径重复使用\n            found = (\n                dfs(i + 1, j, k + 1) or\n                dfs(i - 1, j, k + 1) or\n                dfs(i, j + 1, k + 1) or\n                dfs(i, j - 1, k + 1)\n            )\n            board[i][j] = saved  # 回溯恢复现场\n            return found\n\n        for i in range(m):\n            for j in range(n):\n                if dfs(i, j, 0):\n                    return True\n        return False",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "81": [
    {
      "name": "线性扫描",
      "badge": "基础",
      "idea": "有重复值时二分会退化，最稳妥的基础做法是直接扫描。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "最坏需要看完整个数组。",
      "code": "class Solution:\n    def search(self, nums: List[int], target: int) -> bool:\n        for x in nums:\n            if x == target:\n                return True\n        return False",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。 重复值极端情况下每次只能缩小一格，例如全是 1。",
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：有重复值时，nums[left]==nums[mid]==nums[right] 无法判断哪边有序，只能同时收缩两端；其余情况按旋转数组二分。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,5,6,0,0,1,2], target=0 检查代码。\nclass Solution:\n    def search(self, nums: List[int], target: int) -> bool:\n        left, right = 0, len(nums) - 1\n\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return True\n\n            # 重复值挡住判断，只能安全收缩\n            if nums[left] == nums[mid] == nums[right]:\n                left += 1\n                right -= 1\n            elif nums[left] <= nums[mid]:  # 左半边有序\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:                          # 右半边有序\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n\n        return False",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "84": [
    {
      "name": "以每根柱子为最矮柱扩展",
      "badge": "暴力",
      "idea": "固定每根柱子为矩形最矮高度，向左右扩到第一个更矮位置。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "每根柱子都可能向两侧扫描 O(n)。",
      "code": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        ans = 0\n        n = len(heights)\n        for i, h in enumerate(heights):\n            left = i\n            while left - 1 >= 0 and heights[left - 1] >= h:\n                left -= 1\n            right = i\n            while right + 1 < n and heights[right + 1] >= h:\n                right += 1\n            ans = max(ans, h * (right - left + 1))\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。 每个柱子最多入栈、出栈一次；哨兵 0 负责清空栈。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：单调递增栈保存柱子下标；当遇到更矮柱子时，弹出的柱子以当前 i 为右边界，以新栈顶为左边界。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 heights=[2,1,5,6,2,3] 检查代码。\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # 两端加 0 哨兵，方便所有柱子最终都出栈\n        heights = [0] + heights + [0]\n        stack = []  # 栈中下标对应的高度单调递增\n        ans = 0\n\n        for i, h in enumerate(heights):\n            while stack and h < heights[stack[-1]]:\n                mid = stack.pop()\n                height = heights[mid]\n                width = i - stack[-1] - 1  # 左右第一个更矮柱子之间的宽度\n                ans = max(ans, height * width)\n            stack.append(i)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "单调栈",
      "badge": "推荐",
      "idea": "维护递增栈，遇到更矮柱子时弹出栈顶并以它为高度计算最大宽度。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每根柱子最多入栈、出栈一次。",
      "code": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        arr = [0] + heights + [0]\n        stack = []\n        ans = 0\n        for i, h in enumerate(arr):\n            while stack and h < arr[stack[-1]]:\n                mid = stack.pop()\n                ans = max(ans, arr[mid] * (i - stack[-1] - 1))\n            stack.append(i)\n        return ans",
      "notes": []
    }
  ],
  "85": [
    {
      "name": "枚举上下边界压缩列",
      "badge": "基础",
      "idea": "枚举矩形上边界和下边界，把每列是否全为 1 压成数组，再找最长连续 1。",
      "time": "O(m^2n)",
      "space": "O(n)",
      "complexityDetail": "上下边界 O(m^2)，每次线性扫描列。",
      "code": "class Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        if not matrix:\n            return 0\n        m, n = len(matrix), len(matrix[0])\n        ans = 0\n        for top in range(m):\n            ok = [1] * n\n            for bottom in range(top, m):\n                for col in range(n):\n                    ok[col] &= matrix[bottom][col] == '1'\n                width = 0\n                for val in ok:\n                    width = width + 1 if val else 0\n                    ans = max(ans, width * (bottom - top + 1))\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "逐行更新heights数组：如果matrix[i][j]==1则heights[j]++，否则heights[j]=0。对每行用单调栈求最大矩形。时间O(mn)。",
      "time": "O(mn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：把每一行当作柱状图底边，累计每列向上的连续 1 高度，然后套“柱状图最大矩形”。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 \"0\" 检查代码。\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        if not matrix or not matrix[0]:\n            return 0\n\n        m, n = len(matrix), len(matrix[0])\n        heights = [0] * n\n        ans = 0\n\n        def largest_rectangle() -> int:\n            arr = [0] + heights + [0]\n            stack = []\n            best = 0\n            for i, h in enumerate(arr):\n                while stack and h < arr[stack[-1]]:\n                    mid = stack.pop()\n                    best = max(best, arr[mid] * (i - stack[-1] - 1))\n                stack.append(i)\n            return best\n\n        for i in range(m):\n            for j in range(n):\n                # 如果当前位置是 1，高度加一；遇到 0，高度断开归零\n                heights[j] = heights[j] + 1 if matrix[i][j] == '1' else 0\n            ans = max(ans, largest_rectangle())\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "94": [
    {
      "name": "递归中序遍历",
      "badge": "基础",
      "idea": "按照左子树、根、右子树的顺序递归访问节点。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点访问一次，递归栈高度为树高 h。",
      "code": "class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        def dfs(node):\n            if not node:\n                return\n            dfs(node.left)\n            ans.append(node.val)\n            dfs(node.right)\n        dfs(root)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "迭代：用栈模拟递归。curr指针一直往左走并入栈，到null后弹栈访问，然后curr=curr.right。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：中序遍历顺序是左-根-右；迭代写法用栈一路压左节点，再弹出访问并转向右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        stack = []\n        cur = root\n\n        while cur or stack:\n            # 先一路走到最左边\n            while cur:\n                stack.append(cur)\n                cur = cur.left\n\n            cur = stack.pop()\n            ans.append(cur.val)  # 左子树访问完后访问根\n            cur = cur.right      # 再处理右子树\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "迭代栈中序",
      "badge": "推荐",
      "idea": "一路向左入栈，弹出时访问节点，再转向右子树。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点入栈出栈一次。",
      "code": "class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        stack = []\n        cur = root\n        while cur or stack:\n            while cur:\n                stack.append(cur)\n                cur = cur.left\n            cur = stack.pop()\n            ans.append(cur.val)\n            cur = cur.right\n        return ans",
      "notes": []
    },
    {
      "name": "Morris 中序遍历",
      "badge": "进阶",
      "idea": "利用空右指针建立临时线索，做到 O(1) 额外空间。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每条边最多走两次，不使用显式栈。",
      "code": "class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ans = []\n        cur = root\n        while cur:\n            if not cur.left:\n                ans.append(cur.val)\n                cur = cur.right\n            else:\n                pre = cur.left\n                while pre.right and pre.right is not cur:\n                    pre = pre.right\n                if not pre.right:\n                    pre.right = cur\n                    cur = cur.left\n                else:\n                    pre.right = None\n                    ans.append(cur.val)\n                    cur = cur.right\n        return ans",
      "notes": []
    }
  ],
  "96": [
    {
      "name": "递归记忆化 Catalan",
      "badge": "基础",
      "idea": "以每个值作为根，左子树数量乘右子树数量，累加所有根的选择。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "状态 n 有 n 种根选择，缓存后共有 n 个状态。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def numTrees(self, n: int) -> int:\n        @lru_cache(None)\n        def count(k):\n            if k <= 1:\n                return 1\n            total = 0\n            for left_size in range(k):\n                total += count(left_size) * count(k - 1 - left_size)\n            return total\n        return count(n)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[n]=sum(dp[i-1]*dp[n-i]) for i in 1..n。dp[0]=1, dp[1]=1。",
      "time": "O(n²)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：以每个值 root 作为根时，左边有 left 个节点、右边有 right 个节点，组合数相乘后累加。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=1 检查代码。\nclass Solution:\n    def numTrees(self, n: int) -> int:\n        # dp[i] = i 个不同节点能组成多少种 BST\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        dp[1] = 1\n\n        for nodes in range(2, n + 1):\n            for left_count in range(nodes):\n                right_count = nodes - 1 - left_count\n                dp[nodes] += dp[left_count] * dp[right_count]\n\n        return dp[n]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "98": [
    {
      "name": "中序遍历后检查递增",
      "badge": "基础",
      "idea": "BST 的中序遍历必须严格递增，先保存遍历结果再检查。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个节点访问一次，数组保存 n 个值。",
      "code": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        vals = []\n        def inorder(node):\n            if not node:\n                return\n            inorder(node.left)\n            vals.append(node.val)\n            inorder(node.right)\n        inorder(root)\n        return all(vals[i] < vals[i + 1] for i in range(len(vals) - 1))",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "中序遍历：记录prev值，当前值必须>prev。时间O(n)。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：BST 不只是每个节点大于左孩子小于右孩子，而是每个节点都必须落在祖先传下来的上下界之间。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[2,1,3] 检查代码。\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:\n            if not node:\n                return True\n            if not (low < node.val < high):\n                return False\n            # 左子树上界变成 node.val；右子树下界变成 node.val\n            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n\n        return dfs(root, float('-inf'), float('inf'))",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "递归上下界",
      "badge": "推荐",
      "idea": "每个节点必须落在祖先节点限定的开区间内。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点检查一次，递归栈高度为 h。",
      "code": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def dfs(node, low, high):\n            if not node:\n                return True\n            if not (low < node.val < high):\n                return False\n            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n        return dfs(root, float('-inf'), float('inf'))",
      "notes": []
    }
  ],
  "101": [
    {
      "name": "递归比较镜像节点",
      "badge": "推荐",
      "idea": "左子树的左边要和右子树的右边相等，左子树的右边要和右子树的左边相等。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点最多比较一次，递归栈深度为树高。",
      "code": "class Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def same(a, b):\n            if not a or not b:\n                return a is b\n            return a.val == b.val and same(a.left, b.right) and same(a.right, b.left)\n        return same(root.left, root.right) if root else True",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "递归：isMirror(left, right) = left.val==right.val && isMirror(left.left, right.right) && isMirror(left.right, right.left)。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：判断两棵子树是否镜像：外侧节点相等且内侧节点相等，即 left.left 对 right.right，left.right 对 right.left。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,2,3,4,4,3] 检查代码。\nclass Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:\n            if not a and not b:\n                return True\n            if not a or not b:\n                return False\n            if a.val != b.val:\n                return False\n            return mirror(a.left, b.right) and mirror(a.right, b.left)\n\n        return True if not root else mirror(root.left, root.right)",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "队列迭代比较",
      "badge": "备选",
      "idea": "每次从队列中取出两个应该镜像相等的节点进行比较。",
      "time": "O(n)",
      "space": "O(w)",
      "complexityDetail": "队列最多保存一层镜像节点对。",
      "code": "from collections import deque\n\nclass Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        q = deque([(root.left, root.right)]) if root else deque()\n        while q:\n            a, b = q.popleft()\n            if not a or not b:\n                if a is not b:\n                    return False\n                continue\n            if a.val != b.val:\n                return False\n            q.append((a.left, b.right))\n            q.append((a.right, b.left))\n        return True",
      "notes": []
    }
  ],
  "102": [
    {
      "name": "DFS 按层收集",
      "badge": "备选",
      "idea": "递归时携带 depth，第一次到某一层就创建对应列表。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点访问一次，递归栈深度为树高；结果集不计入额外空间时为 O(h)。",
      "code": "class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        ans = []\n        def dfs(node, depth):\n            if not node:\n                return\n            if depth == len(ans):\n                ans.append([])\n            ans[depth].append(node.val)\n            dfs(node.left, depth + 1)\n            dfs(node.right, depth + 1)\n        dfs(root, 0)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(w)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：层序遍历就是 BFS；队列中每一轮保存当前层所有节点，处理完这一轮再进入下一层。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        if not root:\n            return []\n\n        ans = []\n        queue = deque([root])\n\n        while queue:\n            level = []\n            for _ in range(len(queue)):  # 当前队列长度就是当前层节点数\n                node = queue.popleft()\n                level.append(node.val)\n                if node.left:\n                    queue.append(node.left)\n                if node.right:\n                    queue.append(node.right)\n            ans.append(level)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "104": [
    {
      "name": "BFS 层数统计",
      "badge": "备选",
      "idea": "按层遍历二叉树，遍历完一层深度加一。",
      "time": "O(n)",
      "space": "O(w)",
      "complexityDetail": "w 是二叉树最大宽度，队列最多保存一层节点。",
      "code": "from collections import deque\n\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root:\n            return 0\n        q = deque([root])\n        depth = 0\n        while q:\n            for _ in range(len(q)):\n                node = q.popleft()\n                if node.left:\n                    q.append(node.left)\n                if node.right:\n                    q.append(node.right)\n            depth += 1\n        return depth",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "递归：if not root: return 0; return max(depth(left), depth(right))+1。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：树的最大深度 = max(左子树深度, 右子树深度) + 1，空节点深度为 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        if not root:\n            return 0\n        left_depth = self.maxDepth(root.left)\n        right_depth = self.maxDepth(root.right)\n        return max(left_depth, right_depth) + 1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "105": [
    {
      "name": "递归切片构造",
      "badge": "基础",
      "idea": "每次用 preorder[0] 做根，在 inorder 中切出左右子树。",
      "time": "O(n^2)",
      "space": "O(n^2)",
      "complexityDetail": "每层查找根和切片都可能产生线性成本。",
      "code": "class Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        if not preorder:\n            return None\n        root_val = preorder[0]\n        idx = inorder.index(root_val)\n        root = TreeNode(root_val)\n        root.left = self.buildTree(preorder[1:1 + idx], inorder[:idx])\n        root.right = self.buildTree(preorder[1 + idx:], inorder[idx + 1:])\n        return root",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "用哈希表存中序值到下标的映射，加速查找。时间O(n)。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：前序第一个元素是根；在中序中找到根的位置，就能切分出左子树和右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 preorder=[3,9,20,15,7], inorder=[9,3,15,20,7] 检查代码。\nclass Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        index = {val: i for i, val in enumerate(inorder)}\n        pre_pos = 0\n\n        def build(in_left: int, in_right: int) -> Optional[TreeNode]:\n            nonlocal pre_pos\n            if in_left > in_right:\n                return None\n\n            root_val = preorder[pre_pos]\n            pre_pos += 1\n            root = TreeNode(root_val)\n            mid = index[root_val]\n\n            # 前序顺序是 根-左-右，所以必须先构造左子树\n            root.left = build(in_left, mid - 1)\n            root.right = build(mid + 1, in_right)\n            return root\n\n        return build(0, len(inorder) - 1)",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "114": [
    {
      "name": "前序收集再改指针",
      "badge": "基础",
      "idea": "先得到前序遍历节点列表，再按列表顺序把每个节点接到右指针。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "遍历一次，额外列表保存所有节点。",
      "code": "class Solution:\n    def flatten(self, root: Optional[TreeNode]) -> None:\n        nodes = []\n        def preorder(node):\n            if not node:\n                return\n            nodes.append(node)\n            preorder(node.left)\n            preorder(node.right)\n        preorder(root)\n        for i in range(len(nodes) - 1):\n            nodes[i].left = None\n            nodes[i].right = nodes[i + 1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "后序遍历的变体：从右到左遍历，用prev记录上一个节点。当前节点的right=prev, left=null, prev=当前节点。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：按前序展开；反向后序（右-左-根）遍历时，用 prev 保存已经展开好的链表头。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,5,3,4,null,6] 检查代码。\nclass Solution:\n    def flatten(self, root: Optional[TreeNode]) -> None:\n        prev = None\n\n        def dfs(node: Optional[TreeNode]) -> None:\n            nonlocal prev\n            if not node:\n                return\n            # 反向前序：先右后左，最后处理根\n            dfs(node.right)\n            dfs(node.left)\n\n            node.right = prev\n            node.left = None\n            prev = node\n\n        dfs(root)",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "121": [
    {
      "name": "暴力枚举买卖日",
      "badge": "暴力",
      "idea": "枚举买入日和卖出日，取最大利润。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "所有买卖日组合数量为 O(n^2)。",
      "code": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        ans = 0\n        for buy in range(len(prices)):\n            for sell in range(buy + 1, len(prices)):\n                ans = max(ans, prices[sell] - prices[buy])\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "贪心：维护min_price和max_profit。一次遍历。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遍历价格时维护历史最低买入价；今天卖出的最大利润就是 price - min_price。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[7,1,5,3,6,4] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        ans = 0\n\n        for price in prices:\n            min_price = min(min_price, price)      # 到今天为止最低买入价\n            ans = max(ans, price - min_price)      # 今天卖出能赚多少\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "124": [
    {
      "name": "递归求每个节点向下最大贡献",
      "badge": "推荐",
      "idea": "一个节点作为路径最高点时，只能从左右贡献中取正值；向父节点返回单边最大贡献。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点访问一次，递归栈深度为树高。",
      "code": "class Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        ans = float('-inf')\n        def gain(node):\n            nonlocal ans\n            if not node:\n                return 0\n            left = max(gain(node.left), 0)\n            right = max(gain(node.right), 0)\n            ans = max(ans, node.val + left + right)\n            return node.val + max(left, right)\n        gain(root)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "后序遍历：返回值=以当前节点为端点的最大贡献（只能选一侧）。全局最大值=左贡献+右贡献+节点值（可以拐弯）。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：对每个节点计算“向父节点贡献的最大单边路径”，同时用左右贡献加当前节点更新全局最大路径和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3] 检查代码。\nclass Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        ans = float('-inf')\n\n        def gain(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n\n            # 负贡献不如不要，所以与 0 取 max\n            left = max(gain(node.left), 0)\n            right = max(gain(node.right), 0)\n\n            # 以当前节点为最高点的路径，可以同时接左右两边\n            ans = max(ans, node.val + left + right)\n\n            # 返回给父节点时只能选一边，不能分叉\n            return node.val + max(left, right)\n\n        gain(root)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "128": [
    {
      "name": "排序后扫描",
      "badge": "基础",
      "idea": "排序后相邻的连续数字会挨在一起，跳过重复值并统计最长连续段。",
      "time": "O(n log n)",
      "space": "O(1) 或 O(n)",
      "complexityDetail": "排序是主要成本；Python 排序可能使用额外空间。",
      "code": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        if not nums:\n            return 0\n        nums.sort()\n        ans = cur = 1\n        for i in range(1, len(nums)):\n            if nums[i] == nums[i - 1]:\n                continue\n            if nums[i] == nums[i - 1] + 1:\n                cur += 1\n            else:\n                cur = 1\n            ans = max(ans, cur)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "哈希集合+只从起点计数：for num in set: if num-1 not in set: 从num开始计数连续长度。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：把所有数放进集合，只从“没有前驱”的数开始向后数连续长度，避免重复计算。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[100,4,200,1,3,2] 检查代码。\nclass Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        num_set = set(nums)\n        ans = 0\n\n        for x in num_set:\n            # 只有 x 是序列起点时才开始数，避免从中间重复数\n            if x - 1 not in num_set:\n                cur = x\n                length = 1\n                while cur + 1 in num_set:\n                    cur += 1\n                    length += 1\n                ans = max(ans, length)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "136": [
    {
      "name": "哈希计数",
      "badge": "基础",
      "idea": "统计每个数字出现次数，返回次数为 1 的数字。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "哈希表最多保存 n 个不同数字。",
      "code": "from collections import Counter\n\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        cnt = Counter(nums)\n        for x, c in cnt.items():\n            if c == 1:\n                return x\n        return -1",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "所有数异或：result^=num for all nums。时间O(n)，空间O(1)。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：异或满足 x^x=0、x^0=x，所有成对数字抵消后剩下的就是只出现一次的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,1] 检查代码。\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ans = 0\n        for x in nums:\n            ans ^= x  # 成对的数会被异或抵消\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "异或运算",
      "badge": "推荐",
      "idea": "相同数字异或为 0，0 和任何数异或仍是该数，所有数字异或后剩下单独出现的数。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "只遍历一次，只用一个变量。",
      "code": "class Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ans = 0\n        for x in nums:\n            ans ^= x\n        return ans",
      "notes": []
    }
  ],
  "139": [
    {
      "name": "DFS 记忆化",
      "badge": "备选",
      "idea": "dfs(i) 表示 s[i:] 能否拆分，枚举下一个单词边界。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "有 n 个起点，每个起点枚举后续边界。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        words = set(wordDict)\n        @lru_cache(None)\n        def dfs(i):\n            if i == len(s):\n                return True\n            for j in range(i + 1, len(s) + 1):\n                if s[i:j] in words and dfs(j):\n                    return True\n            return False\n        return dfs(0)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[0]=true; for i in 1..n: for j in 0..i-1: if dp[j] and s[j:i] in wordDict: dp[i]=true; break。时间O(n^2*m)。",
      "time": "O(n²)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp[i] 表示 s[:i] 能否被拆分；枚举最后一个单词 s[j:i]，如果 dp[j] 为真且这个单词在词典里，则 dp[i] 为真。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"leetcode\", wordDict=[\"leet\",\"code\"] 检查代码。\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True  # 空串可以被拆分\n\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n\n        return dp[n]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "141": [
    {
      "name": "哈希集合记录节点",
      "badge": "基础",
      "idea": "遍历链表，把访问过的节点对象放入集合；再次遇到说明有环。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个节点最多访问一次，集合最多保存 n 个节点。",
      "code": "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        seen = set()\n        cur = head\n        while cur:\n            if cur in seen:\n                return True\n            seen.add(cur)\n            cur = cur.next\n        return False",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "Floyd判圈：fast走两步slow走一步，相遇则有环。O(1)空间。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：快慢指针同时走，快指针每次两步、慢指针每次一步；如果有环，它们必定会在环内相遇。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                return True\n\n        return False",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "142": [
    {
      "name": "哈希集合找入口",
      "badge": "基础",
      "idea": "第一次遇到已经访问过的节点，它就是环入口。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "集合保存访问过的节点。",
      "code": "class Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        seen = set()\n        cur = head\n        while cur:\n            if cur in seen:\n                return cur\n            seen.add(cur)\n            cur = cur.next\n        return None",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "Floyd：fast/slow相遇后，一个从head出发一个从相遇点出发，同步走，相遇点=入口。O(1)空间。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：快慢指针相遇后，一个指针回到头节点，两个指针每次走一步，再次相遇点就是环入口。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[3,2,0,-4], pos=1 检查代码。\nclass Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        slow = fast = head\n\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                # 相遇后，一个从头出发，一个从相遇点出发\n                p = head\n                while p != slow:\n                    p = p.next\n                    slow = slow.next\n                return p\n\n        return None",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "146": [
    {
      "name": "OrderedDict 实现",
      "badge": "基础",
      "idea": "Python 内置有序字典可以移动 key 到末尾，用来维护最近使用顺序。",
      "time": "O(1)",
      "space": "O(capacity)",
      "complexityDetail": "get、put、move_to_end、popitem 都是均摊 O(1)。",
      "code": "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "哈希表+双向链表：get时查找并移到头部；put时插入或更新并移到头部。容量满时删除尾部。",
      "time": "get/put 均摊 O(1)",
      "space": "O(capacity)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：哈希表负责 O(1) 找节点，双向链表负责 O(1) 移动最近使用节点和删除最久未使用节点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 capacity=1，连续 put 两个 key 检查代码。\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}  # key -> Node\n        self.head = Node()  # 虚拟头：最近使用端\n        self.tail = Node()  # 虚拟尾：最久使用端\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node: Node) -> None:\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node: Node) -> None:\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)  # 访问后变成最近使用\n        return node.val\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            node = self.cache[key]\n            node.val = value\n            self._remove(node)\n            self._add_to_front(node)\n            return\n\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n\n        if len(self.cache) > self.capacity:\n            old = self.tail.prev  # 虚拟尾前一个是真正最久未使用节点\n            self._remove(old)\n            del self.cache[old.key]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "148": [
    {
      "name": "数组排序后重建链表",
      "badge": "基础",
      "idea": "把链表值收集到数组，排序后重新写回链表。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "排序是主成本，数组保存 n 个值。",
      "code": "class Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        vals = []\n        cur = head\n        while cur:\n            vals.append(cur.val)\n            cur = cur.next\n        vals.sort()\n        cur = head\n        for x in vals:\n            cur.val = x\n            cur = cur.next\n        return head",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "归并排序：快慢指针找中点，递归排序左右半，合并。O(nlogn)时间O(1)空间。",
      "time": "O(nlogn)",
      "space": "O(logn)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：链表归并排序：快慢指针找中点切成两半，递归排序后再合并两个有序链表。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[4,2,1,3] 检查代码。\nclass Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n\n        # 快慢指针找中点，同时 pre 用于断开前半段\n        slow = fast = head\n        pre = None\n        while fast and fast.next:\n            pre = slow\n            slow = slow.next\n            fast = fast.next.next\n        pre.next = None\n\n        left = self.sortList(head)\n        right = self.sortList(slow)\n        return self.merge(left, right)\n\n    def merge(self, a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:\n        dummy = ListNode(0)\n        cur = dummy\n        while a and b:\n            if a.val <= b.val:\n                cur.next = a\n                a = a.next\n            else:\n                cur.next = b\n                b = b.next\n            cur = cur.next\n        cur.next = a if a else b\n        return dummy.next",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "归并排序链表",
      "badge": "推荐",
      "idea": "用快慢指针拆分链表，递归排序两半，再合并两个有序链表。",
      "time": "O(n log n)",
      "space": "O(log n)",
      "complexityDetail": "每层合并 O(n)，共有 logn 层；递归栈 O(logn)。",
      "code": "class Solution:\n    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n\n        slow, fast = head, head.next\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n        mid = slow.next\n        slow.next = None\n\n        left = self.sortList(head)\n        right = self.sortList(mid)\n        return self.merge(left, right)\n\n    def merge(self, a, b):\n        dummy = ListNode(0)\n        cur = dummy\n        while a and b:\n            if a.val <= b.val:\n                cur.next = a\n                a = a.next\n            else:\n                cur.next = b\n                b = b.next\n            cur = cur.next\n        cur.next = a or b\n        return dummy.next",
      "notes": []
    }
  ],
  "152": [
    {
      "name": "枚举所有子数组乘积",
      "badge": "暴力",
      "idea": "固定左端点，向右累乘并更新最大乘积。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "子数组数量是 O(n^2)。",
      "code": "class Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        ans = nums[0]\n        for i in range(len(nums)):\n            prod = 1\n            for j in range(i, len(nums)):\n                prod *= nums[j]\n                ans = max(ans, prod)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：max_dp=max(nums[i], max_dp*nums[i], min_dp*nums[i])，min_dp同理。遇到负数时最大最小互换。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：乘积遇到负数会让最大最小互换，所以同时维护以当前位置结尾的最大乘积和最小乘积。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,3,-2,4] 检查代码。\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        max_prod = min_prod = ans = nums[0]\n\n        for x in nums[1:]:\n            if x < 0:\n                max_prod, min_prod = min_prod, max_prod\n            max_prod = max(x, max_prod * x)\n            min_prod = min(x, min_prod * x)\n            ans = max(ans, max_prod)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "最大最小乘积 DP",
      "badge": "推荐",
      "idea": "负数会让最大变最小、最小变最大，所以同时维护以当前位置结尾的最大/最小乘积。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个元素常数次更新。",
      "code": "class Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        cur_max = cur_min = ans = nums[0]\n        for x in nums[1:]:\n            if x < 0:\n                cur_max, cur_min = cur_min, cur_max\n            cur_max = max(x, cur_max * x)\n            cur_min = min(x, cur_min * x)\n            ans = max(ans, cur_max)\n        return ans",
      "notes": []
    }
  ],
  "153": [
    {
      "name": "线性找最小值",
      "badge": "基础",
      "idea": "直接扫描数组并记录最小值，不利用旋转有序性质。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个元素都要看一次。",
      "code": "class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        ans = nums[0]\n        for x in nums:\n            ans = min(ans, x)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(log n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：无重复旋转数组中，nums[mid] > nums[right] 说明最小值在右半边，否则在左半边含 mid。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,4,5,1,2] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            else:\n                right = mid\n\n        return nums[left]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "154": [
    {
      "name": "线性找最小值",
      "badge": "基础",
      "idea": "有重复元素时，最简单稳妥的做法是直接扫描。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "每个元素都访问一次。",
      "code": "class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        ans = nums[0]\n        for x in nums:\n            ans = min(ans, x)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "二分比较 nums[mid] 和 nums[right]：如果 nums[mid] > nums[right]，最小值一定在右半；如果 nums[mid] < nums[right]，最小值在左半且包含 mid；如果二者相等，无法判断方向，但可以安全地 right-- 去掉一个重复候选。最坏全重复时退化到 O(n)。",
      "time": "平均 O(log n)，最坏 O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：有重复时 nums[mid]==nums[right] 无法判断最小值在哪边，只能 right-- 安全缩小范围。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,2,2,0,1] 检查代码。\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        left, right = 0, len(nums) - 1\n\n        while left < right:\n            mid = (left + right) // 2\n            if nums[mid] > nums[right]:\n                left = mid + 1\n            elif nums[mid] < nums[right]:\n                right = mid\n            else:\n                right -= 1  # 无法判断，安全丢掉一个重复右端点\n\n        return nums[left]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "155": [
    {
      "name": "栈中存二元组",
      "badge": "基础",
      "idea": "每个元素入栈时，同时保存当前最小值。",
      "time": "O(1)",
      "space": "O(n)",
      "complexityDetail": "每次操作常数时间，栈额外保存 n 个当前最小值。",
      "code": "class MinStack:\n    def __init__(self):\n        self.stack = []\n\n    def push(self, val: int) -> None:\n        cur_min = val if not self.stack else min(val, self.stack[-1][1])\n        self.stack.append((val, cur_min))\n\n    def pop(self) -> None:\n        self.stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1][0]\n\n    def getMin(self) -> int:\n        return self.stack[-1][1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "push/pop/top/getMin 均 O(1)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：一个普通栈存所有值，一个辅助栈同步记录当前最小值，栈顶就是当前最小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 push(-2),push(0),push(-3),getMin() 检查代码。\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        # 当前最小值 = min(新值, 之前最小值)\n        if not self.min_stack:\n            self.min_stack.append(val)\n        else:\n            self.min_stack.append(min(val, self.min_stack[-1]))\n\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "辅助最小栈",
      "badge": "推荐",
      "idea": "主栈存所有元素，辅助栈只在新值不大于当前最小时入栈，弹出同步维护。",
      "time": "O(1)",
      "space": "O(n)",
      "complexityDetail": "所有操作常数时间，最坏辅助栈也保存 n 个值。",
      "code": "class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        if not self.min_stack or val <= self.min_stack[-1]:\n            self.min_stack.append(val)\n\n    def pop(self) -> None:\n        val = self.stack.pop()\n        if val == self.min_stack[-1]:\n            self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]",
      "notes": []
    }
  ],
  "160": [
    {
      "name": "哈希集合记录 A 链表",
      "badge": "基础",
      "idea": "先把 A 链表所有节点放入集合，再遍历 B 找第一个出现过的节点。",
      "time": "O(m+n)",
      "space": "O(m)",
      "complexityDetail": "A 链表节点都存入集合，B 链表线性扫描。",
      "code": "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        seen = set()\n        cur = headA\n        while cur:\n            seen.add(cur)\n            cur = cur.next\n        cur = headB\n        while cur:\n            if cur in seen:\n                return cur\n            cur = cur.next\n        return None",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(m+n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：两个指针分别走 A+B 和 B+A；如果有交点，它们会在交点相遇；如果没有，会同时走到 None。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 A=[4,1,8,4,5], B=[5,6,1,8,4,5] 检查代码。\nclass Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        p, q = headA, headB\n\n        while p != q:\n            p = p.next if p else headB\n            q = q.next if q else headA\n\n        return p",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "双指针换头",
      "badge": "推荐",
      "idea": "两个指针分别走 A+B 和 B+A，如果相交会在入口相遇，否则一起到 None。",
      "time": "O(m+n)",
      "space": "O(1)",
      "complexityDetail": "两个指针最多各走 m+n 步。",
      "code": "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        a, b = headA, headB\n        while a is not b:\n            a = a.next if a else headB\n            b = b.next if b else headA\n        return a",
      "notes": []
    }
  ],
  "169": [
    {
      "name": "哈希计数",
      "badge": "基础",
      "idea": "统计每个数出现次数，超过 n/2 的就是多数元素。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "计数表最多保存 n 个不同元素。",
      "code": "from collections import Counter\n\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        cnt = Counter(nums)\n        for x, c in cnt.items():\n            if c > len(nums) // 2:\n                return x\n        return nums[0]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：摩尔投票：多数元素数量超过一半，和其他元素两两抵消后，最后剩下的候选一定是多数元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,3] 检查代码。\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        candidate = None\n        count = 0\n\n        for x in nums:\n            if count == 0:\n                candidate = x\n            count += 1 if x == candidate else -1\n\n        return candidate",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "排序取中间",
      "badge": "基础",
      "idea": "多数元素出现超过一半，排序后中间位置一定是多数元素。",
      "time": "O(n log n)",
      "space": "O(1) 或 O(n)",
      "complexityDetail": "排序是主要成本。",
      "code": "class Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        nums.sort()\n        return nums[len(nums) // 2]",
      "notes": []
    },
    {
      "name": "Boyer-Moore 投票",
      "badge": "推荐",
      "idea": "不同元素两两抵消，最后留下的候选一定是多数元素。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "一次扫描维护候选和票数。",
      "code": "class Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        candidate = None\n        votes = 0\n        for x in nums:\n            if votes == 0:\n                candidate = x\n            votes += 1 if x == candidate else -1\n        return candidate",
      "notes": []
    }
  ],
  "198": [
    {
      "name": "二维含义 DP",
      "badge": "基础",
      "idea": "dp[i] 表示偷到第 i 间房为止的最大金额，可选偷或不偷第 i 间。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个位置一次转移，数组保存所有状态。",
      "code": "class Solution:\n    def rob(self, nums: List[int]) -> int:\n        if not nums:\n            return 0\n        if len(nums) == 1:\n            return nums[0]\n        dp = [0] * len(nums)\n        dp[0] = nums[0]\n        dp[1] = max(nums[0], nums[1])\n        for i in range(2, len(nums)):\n            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\n        return dp[-1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[i]=max(dp[i-1], dp[i-2]+nums[i])。空间优化为两个变量。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：每间房只有偷或不偷：偷当前房就不能偷前一间，不偷当前房就继承前一间最优。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,1] 检查代码。\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        prev2 = 0  # dp[i-2]\n        prev1 = 0  # dp[i-1]\n\n        for money in nums:\n            cur = max(prev1, prev2 + money)\n            prev2, prev1 = prev1, cur\n\n        return prev1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "200": [
    {
      "name": "DFS 淹岛",
      "badge": "推荐",
      "idea": "遇到陆地就 DFS 把整座岛标记为水，岛屿数量加一。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "每个格子最多访问一次，递归栈最坏为格子总数。",
      "code": "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        def dfs(i, j):\n            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':\n                return\n            grid[i][j] = '0'\n            dfs(i + 1, j)\n            dfs(i - 1, j)\n            dfs(i, j + 1)\n            dfs(i, j - 1)\n\n        ans = 0\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    dfs(i, j)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。 每个格子最多访问一次；递归栈最坏覆盖整张网格。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遇到一个未访问的 1 就发现一个新岛屿，然后用 DFS/BFS 把与它连通的所有 1 都淹掉。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 全是 0 检查代码。\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        ans = 0\n\n        def dfs(i: int, j: int) -> None:\n            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':\n                return\n            grid[i][j] = '0'  # 标记已访问，也可以理解为淹掉陆地\n            dfs(i + 1, j)\n            dfs(i - 1, j)\n            dfs(i, j + 1)\n            dfs(i, j - 1)\n\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    dfs(i, j)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "BFS 淹岛",
      "badge": "备选",
      "idea": "遇到陆地后用队列把连通的陆地全部标记为水。",
      "time": "O(mn)",
      "space": "O(min(mn))",
      "complexityDetail": "每个格子最多入队一次。",
      "code": "from collections import deque\n\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        m, n = len(grid), len(grid[0])\n        ans = 0\n        for i in range(m):\n            for j in range(n):\n                if grid[i][j] == '1':\n                    ans += 1\n                    grid[i][j] = '0'\n                    q = deque([(i, j)])\n                    while q:\n                        x, y = q.popleft()\n                        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                            nx, ny = x + dx, y + dy\n                            if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':\n                                grid[nx][ny] = '0'\n                                q.append((nx, ny))\n        return ans",
      "notes": []
    }
  ],
  "206": [
    {
      "name": "递归反转",
      "badge": "备选",
      "idea": "先反转 head.next 之后的链表，再把 head 接到尾部。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个节点处理一次，递归栈深度 n。",
      "code": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        if not head or not head.next:\n            return head\n        new_head = self.reverseList(head.next)\n        head.next.next = head\n        head.next = None\n        return new_head",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遍历链表时保存 next，反转 cur.next 指向 prev，然后 prev/cur 一起后移。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        cur = head\n\n        while cur:\n            nxt = cur.next      # 先保存原来的下一个节点\n            cur.next = prev     # 反转指针\n            prev = cur          # prev 前进\n            cur = nxt           # cur 前进\n\n        return prev",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "207": [
    {
      "name": "BFS 拓扑排序",
      "badge": "推荐",
      "idea": "统计每门课入度，先学入度为 0 的课，每学一门课就降低后继入度。",
      "time": "O(V+E)",
      "space": "O(V+E)",
      "complexityDetail": "V 是课程数，E 是先修关系数。",
      "code": "from collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        indeg = [0] * numCourses\n        for a, b in prerequisites:\n            graph[b].append(a)\n            indeg[a] += 1\n        q = deque([i for i in range(numCourses) if indeg[i] == 0])\n        learned = 0\n        while q:\n            cur = q.popleft()\n            learned += 1\n            for nxt in graph[cur]:\n                indeg[nxt] -= 1\n                if indeg[nxt] == 0:\n                    q.append(nxt)\n        return learned == numCourses",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(V+E)",
      "space": "O(V+E)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：课程依赖是有向图；如果拓扑排序能取完所有课程，说明无环，否则存在循环依赖。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 numCourses=2, prerequisites=[[1,0]] 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        indegree = [0] * numCourses\n\n        for course, pre in prerequisites:\n            graph[pre].append(course)\n            indegree[course] += 1\n\n        queue = deque(i for i in range(numCourses) if indegree[i] == 0)\n        learned = 0\n\n        while queue:\n            cur = queue.popleft()\n            learned += 1\n            for nxt in graph[cur]:\n                indegree[nxt] -= 1\n                if indegree[nxt] == 0:\n                    queue.append(nxt)\n\n        return learned == numCourses",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "DFS 三色标记",
      "badge": "备选",
      "idea": "0 未访问、1 当前路径中、2 已确认安全；DFS 遇到 1 表示有环。",
      "time": "O(V+E)",
      "space": "O(V+E)",
      "complexityDetail": "邻接表和递归栈占空间。",
      "code": "class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        for a, b in prerequisites:\n            graph[b].append(a)\n        color = [0] * numCourses\n\n        def dfs(x):\n            if color[x] == 1:\n                return False\n            if color[x] == 2:\n                return True\n            color[x] = 1\n            for nxt in graph[x]:\n                if not dfs(nxt):\n                    return False\n            color[x] = 2\n            return True\n\n        return all(dfs(i) for i in range(numCourses))",
      "notes": []
    }
  ],
  "208": [
    {
      "name": "字典节点 Trie",
      "badge": "推荐",
      "idea": "每个节点用字典保存子节点，插入和查询都按字符逐层向下走。",
      "time": "O(L)",
      "space": "O(总字符数)",
      "complexityDetail": "单次操作 L 为单词或前缀长度；空间由插入的总字符数决定。",
      "code": "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "使用 Trie。每个节点保存 children 字典和 is_end 标记。insert 逐字符创建/下钻节点；search 逐字符走路径，最后还要检查 is_end；startsWith 只要路径存在即可。单次操作时间 O(L)，L 为单词或前缀长度。",
      "time": "insert/search/startsWith 均 O(L)",
      "space": "O(总字符数)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：Trie 的每条边表示一个字符；插入和查询都沿字符逐层走，节点上用 is_end 标记是否完整单词结束。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 insert(\"apple\"), search(\"apple\") 检查代码。\nclass TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                node.children[ch] = TrieNode()\n            node = node.children[ch]\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return node.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        node = self.root\n        for ch in prefix:\n            if ch not in node.children:\n                return False\n            node = node.children[ch]\n        return True",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "215": [
    {
      "name": "排序取第 k 个",
      "badge": "基础",
      "idea": "直接排序数组，倒数第 k 个就是第 k 大。",
      "time": "O(n log n)",
      "space": "O(1) 或 O(n)",
      "complexityDetail": "排序是主要成本。",
      "code": "class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        nums.sort()\n        return nums[-k]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(nlogk)",
      "space": "O(k)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：维护一个大小为 k 的小顶堆；堆里始终是当前见过的 k 个最大元素，堆顶就是第 k 大。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,2,1,5,6,4], k=2 检查代码。\nimport heapq\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        heap = []\n\n        for x in nums:\n            heapq.heappush(heap, x)\n            if len(heap) > k:\n                heapq.heappop(heap)  # 弹掉当前 k+1 个数中最小的\n\n        return heap[0]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "大小为 k 的小根堆",
      "badge": "推荐",
      "idea": "维护 k 个最大元素的小根堆，堆顶就是第 k 大。",
      "time": "O(n log k)",
      "space": "O(k)",
      "complexityDetail": "每个元素最多入堆或替换一次。",
      "code": "import heapq\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        heap = []\n        for x in nums:\n            if len(heap) < k:\n                heapq.heappush(heap, x)\n            elif x > heap[0]:\n                heapq.heapreplace(heap, x)\n        return heap[0]",
      "notes": []
    },
    {
      "name": "快速选择",
      "badge": "进阶",
      "idea": "按快排分区思想，每次只递归包含第 k 大的那一边。",
      "time": "平均 O(n)，最坏 O(n^2)",
      "space": "O(1)",
      "complexityDetail": "随机分区平均线性，但极端分区会退化。",
      "code": "import random\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        target = len(nums) - k\n        left, right = 0, len(nums) - 1\n        while True:\n            pivot_idx = random.randint(left, right)\n            nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]\n            pivot = nums[right]\n            store = left\n            for i in range(left, right):\n                if nums[i] < pivot:\n                    nums[store], nums[i] = nums[i], nums[store]\n                    store += 1\n            nums[store], nums[right] = nums[right], nums[store]\n            if store == target:\n                return nums[store]\n            if store < target:\n                left = store + 1\n            else:\n                right = store - 1",
      "notes": []
    }
  ],
  "221": [
    {
      "name": "暴力枚举边长",
      "badge": "暴力",
      "idea": "把每个 1 当作正方形左上角，尝试扩大边长并检查区域是否全是 1。",
      "time": "O(mn * min(m,n)^3)",
      "space": "O(1)",
      "complexityDetail": "枚举起点和边长，并检查正方形内部。",
      "code": "class Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        best = 0\n        for i in range(m):\n            for j in range(n):\n                max_len = min(m - i, n - j)\n                for size in range(1, max_len + 1):\n                    ok = True\n                    for r in range(i, i + size):\n                        for c in range(j, j + size):\n                            if matrix[r][c] == '0':\n                                ok = False\n                    if ok:\n                        best = max(best, size * size)\n        return best",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP：dp[i][j]=min(左,上,左上)+1。O(mn)时间。",
      "time": "O(mn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长；若当前为 1，则由左、上、左上三个位置的最小值加一。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 matrix 全是 0 检查代码。\nclass Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        dp = [0] * (n + 1)\n        max_side = 0\n\n        for i in range(1, m + 1):\n            prev_diag = 0  # 保存上一行左上角 dp[j-1]\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = min(dp[j], dp[j - 1], prev_diag) + 1\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev_diag = temp\n\n        return max_side * max_side",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "二维 DP",
      "badge": "推荐",
      "idea": "dp[i][j] 表示以该格为右下角的最大正方形边长。",
      "time": "O(mn)",
      "space": "O(mn)",
      "complexityDetail": "每个格子一次转移，二维表保存状态。",
      "code": "class Solution:\n    def maximalSquare(self, matrix: List[List[str]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        best = 0\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if matrix[i - 1][j - 1] == '1':\n                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1\n                    best = max(best, dp[i][j])\n        return best * best",
      "notes": []
    }
  ],
  "226": [
    {
      "name": "BFS 迭代翻转",
      "badge": "备选",
      "idea": "用队列遍历每个节点，访问到就交换左右孩子。",
      "time": "O(n)",
      "space": "O(w)",
      "complexityDetail": "每个节点交换一次，队列最多保存一层节点。",
      "code": "from collections import deque\n\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root:\n            return None\n        q = deque([root])\n        while q:\n            node = q.popleft()\n            node.left, node.right = node.right, node.left\n            if node.left:\n                q.append(node.left)\n            if node.right:\n                q.append(node.right)\n        return root",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "递归一行：root.left,root.right=invert(right),invert(left)。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：对每个节点交换左右孩子，再递归翻转左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root:\n            return None\n        root.left, root.right = root.right, root.left\n        self.invertTree(root.left)\n        self.invertTree(root.right)\n        return root",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "234": [
    {
      "name": "复制到数组后双指针",
      "badge": "基础",
      "idea": "把链表值复制到数组，用左右指针判断数组是否回文。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "遍历链表一次，数组保存所有值。",
      "code": "class Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        vals = []\n        while head:\n            vals.append(head.val)\n            head = head.next\n        return vals == vals[::-1]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "快慢指针找中点→反转后半→比较→可选恢复。O(1)空间。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：快慢指针找到中点，反转后半段，然后从头和后半段头同步比较。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 head=[1,2,2,1] 检查代码。\nclass Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n\n        # 反转后半段\n        prev = None\n        cur = slow\n        while cur:\n            nxt = cur.next\n            cur.next = prev\n            prev = cur\n            cur = nxt\n\n        # prev 是后半段反转后的头\n        p1, p2 = head, prev\n        while p2:\n            if p1.val != p2.val:\n                return False\n            p1 = p1.next\n            p2 = p2.next\n\n        return True",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "236": [
    {
      "name": "递归后序返回命中节点",
      "badge": "推荐",
      "idea": "如果左右子树都找到目标，当前节点就是最近公共祖先；否则把找到的一侧向上传。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "最坏访问所有节点，递归栈高度为树高。",
      "code": "class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        if not root or root == p or root == q:\n            return root\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n        if left and right:\n            return root\n        return left or right",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：后序递归：如果左右子树分别找到 p/q，当前节点就是最近公共祖先；如果只找到一边，就把那一边向上返回。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 p=5, q=1 检查代码。\nclass Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        if not root or root == p or root == q:\n            return root\n\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n\n        if left and right:\n            return root\n        return left if left else right",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "238": [
    {
      "name": "左右乘积数组",
      "badge": "基础",
      "idea": "分别保存每个位置左边所有数乘积和右边所有数乘积，答案为二者相乘。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "两个辅助数组各长 n。",
      "code": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        n = len(nums)\n        left = [1] * n\n        right = [1] * n\n        for i in range(1, n):\n            left[i] = left[i - 1] * nums[i - 1]\n        for i in range(n - 2, -1, -1):\n            right[i] = right[i + 1] * nums[i + 1]\n        return [left[i] * right[i] for i in range(n)]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：答案等于当前位置左侧所有数乘积 × 右侧所有数乘积；两趟扫描即可，不需要除法。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,2,3,4] 检查代码。\nclass Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        n = len(nums)\n        ans = [1] * n\n\n        # ans[i] 先存 nums[i] 左侧所有数的乘积\n        left_product = 1\n        for i in range(n):\n            ans[i] = left_product\n            left_product *= nums[i]\n\n        # 再从右往左乘上右侧所有数的乘积\n        right_product = 1\n        for i in range(n - 1, -1, -1):\n            ans[i] *= right_product\n            right_product *= nums[i]\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "常数空间前后缀",
      "badge": "推荐",
      "idea": "先把左乘积写入答案，再从右往左乘右乘积。",
      "time": "O(n)",
      "space": "O(1) 额外",
      "complexityDetail": "输出数组不计入额外空间，只用一个 right 变量。",
      "code": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ans = [1] * len(nums)\n        prefix = 1\n        for i, x in enumerate(nums):\n            ans[i] = prefix\n            prefix *= x\n        suffix = 1\n        for i in range(len(nums) - 1, -1, -1):\n            ans[i] *= suffix\n            suffix *= nums[i]\n        return ans",
      "notes": []
    }
  ],
  "239": [
    {
      "name": "暴力扫描每个窗口",
      "badge": "暴力",
      "idea": "对每个长度为 k 的窗口直接求最大值。",
      "time": "O(nk)",
      "space": "O(1)",
      "complexityDetail": "共有约 n 个窗口，每个窗口求最大值 O(k)。",
      "code": "class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        ans = []\n        for i in range(len(nums) - k + 1):\n            ans.append(max(nums[i:i + k]))\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "用单调递减双端队列保存候选最大值下标。遍历每个位置时，先移除窗口左侧过期下标，再从队尾弹出所有不大于当前值的下标，最后把当前下标入队；队首始终是当前窗口最大值。每个下标最多入队出队一次，时间 O(n)。",
      "time": "O(n)",
      "space": "O(k)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：单调队列保存下标，队头永远是当前窗口最大值下标；新元素进入时弹出队尾所有更小元素。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,-1,-3,5,3,6,7], k=3 检查代码。\nfrom collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()  # 存下标，且 nums[q] 单调递减\n        ans = []\n\n        for i, x in enumerate(nums):\n            # 移除窗口左侧过期下标\n            if q and q[0] <= i - k:\n                q.popleft()\n\n            # 新元素更大时，队尾较小元素不可能再成为最大值\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "堆",
      "badge": "备选",
      "idea": "堆中存负值和下标，窗口滑动时弹出已经离开窗口的元素。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "每个元素入堆一次，可能延迟删除。",
      "code": "import heapq\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        heap = []\n        ans = []\n        for i, x in enumerate(nums):\n            heapq.heappush(heap, (-x, i))\n            while heap[0][1] <= i - k:\n                heapq.heappop(heap)\n            if i >= k - 1:\n                ans.append(-heap[0][0])\n        return ans",
      "notes": []
    },
    {
      "name": "单调队列",
      "badge": "推荐",
      "idea": "队列中下标对应的值单调递减，队首永远是当前窗口最大值。",
      "time": "O(n)",
      "space": "O(k)",
      "complexityDetail": "每个下标最多入队、出队一次。",
      "code": "from collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()\n        ans = []\n        for i, x in enumerate(nums):\n            while q and q[0] <= i - k:\n                q.popleft()\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n        return ans",
      "notes": []
    }
  ],
  "240": [
    {
      "name": "逐行二分",
      "badge": "基础",
      "idea": "每一行都是有序的，对每行分别二分查找 target。",
      "time": "O(m log n)",
      "space": "O(1)",
      "complexityDetail": "m 行，每行二分 O(log n)。",
      "code": "class Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        for row in matrix:\n            left, right = 0, len(row) - 1\n            while left <= right:\n                mid = (left + right) // 2\n                if row[mid] == target:\n                    return True\n                if row[mid] < target:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n        return False",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。 行号最多增加 m 次，列号最多减少 n 次。",
      "time": "O(m+n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：从右上角出发：当前值太大就左移，太小就下移，每次排除一行或一列。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 target=5 在矩阵中 检查代码。\nclass Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        m, n = len(matrix), len(matrix[0])\n        row, col = 0, n - 1  # 右上角\n\n        while row < m and col >= 0:\n            if matrix[row][col] == target:\n                return True\n            elif matrix[row][col] > target:\n                col -= 1  # 当前列下面更大，整列可排除\n            else:\n                row += 1  # 当前行左边更小，整行可排除\n\n        return False",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "右上角阶梯搜索",
      "badge": "推荐",
      "idea": "从右上角开始，大于 target 就左移，小于 target 就下移。",
      "time": "O(m+n)",
      "space": "O(1)",
      "complexityDetail": "每步排除一行或一列。",
      "code": "class Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        m, n = len(matrix), len(matrix[0])\n        i, j = 0, n - 1\n        while i < m and j >= 0:\n            if matrix[i][j] == target:\n                return True\n            if matrix[i][j] > target:\n                j -= 1\n            else:\n                i += 1\n        return False",
      "notes": []
    }
  ],
  "279": [
    {
      "name": "BFS 最短路",
      "badge": "备选",
      "idea": "把数字 n 看成起点，每次减去一个完全平方数，第一次到 0 的层数就是答案。",
      "time": "O(n√n)",
      "space": "O(n)",
      "complexityDetail": "每个剩余值最多入队一次，每次枚举平方数。",
      "code": "from collections import deque\n\nclass Solution:\n    def numSquares(self, n: int) -> int:\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        q = deque([(n, 0)])\n        seen = {n}\n        while q:\n            cur, step = q.popleft()\n            if cur == 0:\n                return step\n            for sq in squares:\n                if sq > cur:\n                    break\n                nxt = cur - sq\n                if nxt not in seen:\n                    seen.add(nxt)\n                    q.append((nxt, step + 1))\n        return n",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n√n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：完全背包最少个数：dp[i] 表示组成 i 的最少平方数个数，枚举每个平方数更新。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=12 检查代码。\nclass Solution:\n    def numSquares(self, n: int) -> int:\n        dp = [float('inf')] * (n + 1)\n        dp[0] = 0\n\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        for square in squares:\n            for amount in range(square, n + 1):\n                dp[amount] = min(dp[amount], dp[amount - square] + 1)\n\n        return dp[n]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "完全背包 DP",
      "badge": "推荐",
      "idea": "dp[i] 表示凑出 i 的最少完全平方数个数。",
      "time": "O(n√n)",
      "space": "O(n)",
      "complexityDetail": "每个金额枚举不超过 √n 个平方数。",
      "code": "class Solution:\n    def numSquares(self, n: int) -> int:\n        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]\n        dp = [0] + [float('inf')] * n\n        for i in range(1, n + 1):\n            for sq in squares:\n                if sq > i:\n                    break\n                dp[i] = min(dp[i], dp[i - sq] + 1)\n        return dp[n]",
      "notes": []
    }
  ],
  "283": [
    {
      "name": "额外数组",
      "badge": "基础",
      "idea": "先收集所有非零元素，再补零，最后覆盖原数组。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "额外数组保存非零元素。",
      "code": "class Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        arr = [x for x in nums if x != 0]\n        arr += [0] * (len(nums) - len(arr))\n        nums[:] = arr",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：用 slow 指向下一个非零应该放的位置；扫描到非零就放到 slow，并最终把后面补 0。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[0,1,0,3,12] 检查代码。\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        slow = 0\n\n        # 先把所有非零元素按原相对顺序放到前面\n        for x in nums:\n            if x != 0:\n                nums[slow] = x\n                slow += 1\n\n        # 剩下的位置补 0\n        for i in range(slow, len(nums)):\n            nums[i] = 0",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "稳定双指针",
      "badge": "推荐",
      "idea": "slow 指向下一个非零元素应该放的位置，fast 扫描数组。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "一次扫描后补零，保持非零元素相对顺序。",
      "code": "class Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        slow = 0\n        for fast in range(len(nums)):\n            if nums[fast] != 0:\n                nums[slow] = nums[fast]\n                slow += 1\n        for i in range(slow, len(nums)):\n            nums[i] = 0",
      "notes": []
    }
  ],
  "287": [
    {
      "name": "哈希集合查重",
      "badge": "基础",
      "idea": "遍历数组，第一个第二次出现的数字就是重复数。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "集合最多保存 n 个数字，但不符合题目常见的 O(1) 空间进阶要求。",
      "code": "class Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        seen = set()\n        for x in nums:\n            if x in seen:\n                return x\n            seen.add(x)\n        return -1",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：把 nums[i] 看成链表 next 指针，由于有重复数，必然形成环；环入口就是重复数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,3,4,2,2] 检查代码。\nclass Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        slow = fast = nums[0]\n\n        # 第一阶段：快慢指针在环内相遇\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast:\n                break\n\n        # 第二阶段：从起点和相遇点同步走，入口就是重复数\n        finder = nums[0]\n        while finder != slow:\n            finder = nums[finder]\n            slow = nums[slow]\n\n        return finder",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "二分答案计数",
      "badge": "进阶",
      "idea": "对值域二分，统计小于等于 mid 的元素个数，用抽屉原理判断重复数在哪半边。",
      "time": "O(n log n)",
      "space": "O(1)",
      "complexityDetail": "值域大小为 n，每轮统计数组一次。",
      "code": "class Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        left, right = 1, len(nums) - 1\n        while left < right:\n            mid = (left + right) // 2\n            cnt = sum(x <= mid for x in nums)\n            if cnt > mid:\n                right = mid\n            else:\n                left = mid + 1\n        return left",
      "notes": []
    },
    {
      "name": "快慢指针找环入口",
      "badge": "推荐",
      "idea": "把 nums[i] 看成 i 指向 nums[i] 的链表，重复数就是环入口。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "两个阶段的快慢指针都是线性。",
      "code": "class Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        slow = fast = nums[0]\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]\n            if slow == fast:\n                break\n        finder = nums[0]\n        while finder != slow:\n            finder = nums[finder]\n            slow = nums[slow]\n        return finder",
      "notes": []
    }
  ],
  "297": [
    {
      "name": "DFS 前序序列化",
      "badge": "推荐",
      "idea": "用前序遍历输出节点值，空节点用 # 占位，反序列化时按同样顺序递归读取。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个节点和空指针各处理一次，字符串和递归栈占空间。",
      "code": "class Codec:\n    def serialize(self, root):\n        vals = []\n        def dfs(node):\n            if not node:\n                vals.append('#')\n                return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        vals = iter(data.split(','))\n        def dfs():\n            val = next(vals)\n            if val == '#':\n                return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n        return dfs()",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：前序遍历序列化，并用 # 记录空节点；反序列化时按同样前序顺序递归读 token。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[] 检查代码。\nfrom collections import deque\n\nclass Codec:\n    def serialize(self, root):\n        vals = []\n\n        def dfs(node):\n            if not node:\n                vals.append('#')\n                return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n\n        dfs(root)\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        vals = deque(data.split(','))\n\n        def dfs():\n            val = vals.popleft()\n            if val == '#':\n                return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n\n        return dfs()",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "BFS 层序序列化",
      "badge": "备选",
      "idea": "按层输出节点，空节点也记录为 #，反序列化时依次恢复左右孩子。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "队列和序列都为线性规模。",
      "code": "from collections import deque\n\nclass Codec:\n    def serialize(self, root):\n        if not root:\n            return ''\n        vals = []\n        q = deque([root])\n        while q:\n            node = q.popleft()\n            if node:\n                vals.append(str(node.val))\n                q.append(node.left)\n                q.append(node.right)\n            else:\n                vals.append('#')\n        return ','.join(vals)\n\n    def deserialize(self, data):\n        if not data:\n            return None\n        vals = data.split(',')\n        root = TreeNode(int(vals[0]))\n        q = deque([root])\n        i = 1\n        while q:\n            node = q.popleft()\n            if vals[i] != '#':\n                node.left = TreeNode(int(vals[i]))\n                q.append(node.left)\n            i += 1\n            if vals[i] != '#':\n                node.right = TreeNode(int(vals[i]))\n                q.append(node.right)\n            i += 1\n        return root",
      "notes": []
    }
  ],
  "300": [
    {
      "name": "O(n^2) 动态规划",
      "badge": "基础",
      "idea": "dp[i] 表示以 nums[i] 结尾的最长递增子序列长度。",
      "time": "O(n^2)",
      "space": "O(n)",
      "complexityDetail": "每个 i 都要枚举前面的 j。",
      "code": "class Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        dp = [1] * len(nums)\n        for i in range(len(nums)):\n            for j in range(i):\n                if nums[j] < nums[i]:\n                    dp[i] = max(dp[i], dp[j] + 1)\n        return max(dp)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "DP O(n^2)或贪心+二分O(nlogn)。",
      "time": "O(nlogn)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：tails[len-1] 保存长度为 len 的递增子序列的最小结尾；每个数用二分替换第一个 >= 它的位置。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[10,9,2,5,3,7,101,18] 检查代码。\nimport bisect\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n\n        for x in nums:\n            # 严格递增：找第一个 >= x 的位置替换\n            pos = bisect.bisect_left(tails, x)\n            if pos == len(tails):\n                tails.append(x)\n            else:\n                tails[pos] = x\n\n        return len(tails)",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "贪心 + 二分",
      "badge": "推荐",
      "idea": "tails[len] 保存长度为 len+1 的递增子序列最小结尾，越小越容易接后续元素。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "每个元素在 tails 中二分一次。",
      "code": "from bisect import bisect_left\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n        for x in nums:\n            i = bisect_left(tails, x)\n            if i == len(tails):\n                tails.append(x)\n            else:\n                tails[i] = x\n        return len(tails)",
      "notes": []
    }
  ],
  "309": [
    {
      "name": "三状态 DP 数组",
      "badge": "基础",
      "idea": "hold 表示持股，sold 表示今天卖出，rest 表示不持股且不在卖出当天。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每天三个状态，数组保存完整过程。",
      "code": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        n = len(prices)\n        hold = [0] * n\n        sold = [0] * n\n        rest = [0] * n\n        hold[0] = -prices[0]\n        for i in range(1, n):\n            hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])\n            sold[i] = hold[i - 1] + prices[i]\n            rest[i] = max(rest[i - 1], sold[i - 1])\n        return max(sold[-1], rest[-1])",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：三种状态：hold 持股、sold 今天刚卖、rest 不持股且不在刚卖状态；买入只能从 rest 来，卖出从 hold 来。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 prices=[1,2,3,0,2] 检查代码。\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        hold = -prices[0]  # 手里持有股票的最大收益\n        sold = 0           # 今天刚卖出后的最大收益\n        rest = 0           # 不持股且不处于刚卖出状态的最大收益\n\n        for price in prices[1:]:\n            prev_hold, prev_sold, prev_rest = hold, sold, rest\n            hold = max(prev_hold, prev_rest - price)\n            sold = prev_hold + price\n            rest = max(prev_rest, prev_sold)\n\n        return max(sold, rest)",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "312": [
    {
      "name": "递归记忆化区间 DP",
      "badge": "备选",
      "idea": "dfs(left,right) 表示只戳开区间内气球的最大收益，枚举最后戳破的气球。",
      "time": "O(n^3)",
      "space": "O(n^2)",
      "complexityDetail": "区间状态 O(n^2)，每个状态枚举最后气球 O(n)。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        arr = [1] + nums + [1]\n        @lru_cache(None)\n        def dfs(left, right):\n            if left + 1 >= right:\n                return 0\n            best = 0\n            for k in range(left + 1, right):\n                best = max(best, dfs(left, k) + arr[left] * arr[k] * arr[right] + dfs(k, right))\n            return best\n        return dfs(0, len(arr) - 1)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n³)",
      "space": "O(n²)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：区间 DP 反向思考：枚举区间内最后一个被戳破的气球 k，则左右区间互不影响。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[3,1,5,8] 检查代码。\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        arr = [1] + nums + [1]\n        n = len(arr)\n        dp = [[0] * n for _ in range(n)]\n\n        # length 是开区间 (left, right) 的跨度\n        for length in range(2, n):\n            for left in range(0, n - length):\n                right = left + length\n                for k in range(left + 1, right):\n                    coins = arr[left] * arr[k] * arr[right]\n                    dp[left][right] = max(dp[left][right], dp[left][k] + coins + dp[k][right])\n\n        return dp[0][n - 1]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "322": [
    {
      "name": "递归记忆化",
      "badge": "备选",
      "idea": "dfs(rest) 表示凑出 rest 所需最少硬币数，枚举最后使用哪一枚硬币。",
      "time": "O(amount * n)",
      "space": "O(amount)",
      "complexityDetail": "每个金额状态计算一次，每次枚举 n 种硬币。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        INF = 10 ** 9\n        @lru_cache(None)\n        def dfs(rest):\n            if rest == 0:\n                return 0\n            if rest < 0:\n                return INF\n            return min(dfs(rest - coin) + 1 for coin in coins)\n        ans = dfs(amount)\n        return -1 if ans >= INF else ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(amount·len(coins))",
      "space": "O(amount)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：完全背包最少硬币数：dp[amount] 表示凑出 amount 的最少硬币数，枚举硬币不断松弛。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 coins=[1,2,5], amount=11 检查代码。\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n\n        for coin in coins:\n            for x in range(coin, amount + 1):\n                dp[x] = min(dp[x], dp[x - coin] + 1)\n\n        return -1 if dp[amount] == amount + 1 else dp[amount]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "完全背包 DP",
      "badge": "推荐",
      "idea": "dp[x] 表示凑成金额 x 的最少硬币数，枚举每个金额和每枚硬币。",
      "time": "O(amount*n)",
      "space": "O(amount)",
      "complexityDetail": "金额状态 amount 个，每个状态枚举 n 枚硬币。",
      "code": "class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        INF = amount + 1\n        dp = [0] + [INF] * amount\n        for x in range(1, amount + 1):\n            for coin in coins:\n                if x >= coin:\n                    dp[x] = min(dp[x], dp[x - coin] + 1)\n        return -1 if dp[amount] == INF else dp[amount]",
      "notes": []
    }
  ],
  "337": [
    {
      "name": "记忆化 DFS",
      "badge": "基础",
      "idea": "对每个节点分别计算偷它和不偷它的收益，用哈希表缓存节点结果。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个节点状态计算一次，缓存和递归栈占空间。",
      "code": "class Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        memo = {}\n        def dfs(node):\n            if not node:\n                return 0\n            if node in memo:\n                return memo[node]\n            rob_it = node.val\n            if node.left:\n                rob_it += dfs(node.left.left) + dfs(node.left.right)\n            if node.right:\n                rob_it += dfs(node.right.left) + dfs(node.right.right)\n            skip_it = dfs(node.left) + dfs(node.right)\n            memo[node] = max(rob_it, skip_it)\n            return memo[node]\n        return dfs(root)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：树形 DP：对每个节点返回两个值，rob 表示偷当前节点的最大收益，not_rob 表示不偷当前节点的最大收益。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[3,2,3,null,3,null,1] 检查代码。\nclass Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        def dfs(node: Optional[TreeNode]):\n            if not node:\n                return (0, 0)\n\n            left_rob, left_not = dfs(node.left)\n            right_rob, right_not = dfs(node.right)\n\n            rob_cur = node.val + left_not + right_not\n            not_rob_cur = max(left_rob, left_not) + max(right_rob, right_not)\n            return (rob_cur, not_rob_cur)\n\n        return max(dfs(root))",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "树形 DP 二元组",
      "badge": "推荐",
      "idea": "dfs 返回两个值：偷当前节点的最大收益、不偷当前节点的最大收益。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点只计算一次，不需要哈希缓存。",
      "code": "class Solution:\n    def rob(self, root: Optional[TreeNode]) -> int:\n        def dfs(node):\n            if not node:\n                return (0, 0)\n            left_rob, left_skip = dfs(node.left)\n            right_rob, right_skip = dfs(node.right)\n            rob_it = node.val + left_skip + right_skip\n            skip_it = max(left_rob, left_skip) + max(right_rob, right_skip)\n            return rob_it, skip_it\n        return max(dfs(root))",
      "notes": []
    }
  ],
  "338": [
    {
      "name": "直接调用 bit_count",
      "badge": "基础",
      "idea": "Python 整数自带 bit_count，可直接计算每个数字二进制 1 的个数。",
      "time": "O(n log n)",
      "space": "O(1) 额外",
      "complexityDetail": "从 0 到 n 每个数字都要统计二进制位；结果数组不计入额外空间。",
      "code": "class Solution:\n    def countBits(self, n: int) -> List[int]:\n        return [i.bit_count() for i in range(n + 1)]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：利用最低位规律：bits[i] = bits[i >> 1] + (i & 1)，也就是去掉最后一位后的 1 个数加当前最低位。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 n=2 检查代码。\nclass Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n\n        for i in range(1, n + 1):\n            ans[i] = ans[i >> 1] + (i & 1)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "DP：i >> 1",
      "badge": "推荐",
      "idea": "i 的 1 个数等于 i//2 的 1 个数加上最低位。",
      "time": "O(n)",
      "space": "O(1) 额外",
      "complexityDetail": "从 0 到 n 一次递推，结果数组不计入额外空间。",
      "code": "class Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n        for i in range(1, n + 1):\n            ans[i] = ans[i >> 1] + (i & 1)\n        return ans",
      "notes": []
    },
    {
      "name": "DP：去掉最低位的 1",
      "badge": "备选",
      "idea": "i & (i-1) 会去掉 i 最低位的 1。",
      "time": "O(n)",
      "space": "O(1) 额外",
      "complexityDetail": "每个 i 由更小状态转移而来。",
      "code": "class Solution:\n    def countBits(self, n: int) -> List[int]:\n        ans = [0] * (n + 1)\n        for i in range(1, n + 1):\n            ans[i] = ans[i & (i - 1)] + 1\n        return ans",
      "notes": []
    }
  ],
  "347": [
    {
      "name": "排序频次",
      "badge": "基础",
      "idea": "统计频次后按出现次数降序排序，取前 k 个。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "排序不同元素的频次是主要成本。",
      "code": "from collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        cnt = Counter(nums)\n        return [x for x, _ in sorted(cnt.items(), key=lambda item: item[1], reverse=True)[:k]]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：先统计频率，再用桶排序：出现次数为 freq 的元素放入 buckets[freq]，从高频桶往低频桶收集 k 个。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,2,2,3], k=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n\n        for num, freq in count.items():\n            buckets[freq].append(num)\n\n        ans = []\n        for freq in range(len(buckets) - 1, 0, -1):\n            for num in buckets[freq]:\n                ans.append(num)\n                if len(ans) == k:\n                    return ans\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "最小堆",
      "badge": "推荐",
      "idea": "维护大小为 k 的最小堆，堆中保留当前频率最高的 k 个元素。",
      "time": "O(n log k)",
      "space": "O(n)",
      "complexityDetail": "计数表 O(n)，堆大小为 k。",
      "code": "from collections import Counter\nimport heapq\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        cnt = Counter(nums)\n        heap = []\n        for x, c in cnt.items():\n            heapq.heappush(heap, (c, x))\n            if len(heap) > k:\n                heapq.heappop(heap)\n        return [x for _, x in heap]",
      "notes": []
    },
    {
      "name": "桶排序",
      "badge": "进阶",
      "idea": "频率最大不超过 n，用频率作为桶下标，从高频桶往低频桶收集。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "计数和桶数组都是线性规模。",
      "code": "from collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        cnt = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for x, c in cnt.items():\n            buckets[c].append(x)\n        ans = []\n        for freq in range(len(buckets) - 1, -1, -1):\n            ans.extend(buckets[freq])\n            if len(ans) >= k:\n                return ans[:k]\n        return ans",
      "notes": []
    }
  ],
  "394": [
    {
      "name": "递归解析",
      "badge": "备选",
      "idea": "遇到数字读倍数，遇到 [ 递归解析子串，遇到 ] 返回当前层结果。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个字符处理一次，递归栈和构造字符串占空间。",
      "code": "class Solution:\n    def decodeString(self, s: str) -> str:\n        def parse(i):\n            ans = ''\n            num = 0\n            while i < len(s):\n                ch = s[i]\n                if ch.isdigit():\n                    num = num * 10 + int(ch)\n                elif ch == '[':\n                    inner, i = parse(i + 1)\n                    ans += inner * num\n                    num = 0\n                elif ch == ']':\n                    return ans, i\n                else:\n                    ans += ch\n                i += 1\n            return ans, i\n        return parse(0)[0]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(输出字符串长度)",
      "space": "O(嵌套深度+输出长度)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：遇到数字累积重复次数，遇到 [ 保存之前字符串和次数，遇到 ] 弹栈并展开当前片段。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"3[a]2[bc]\" 检查代码。\nclass Solution:\n    def decodeString(self, s: str) -> str:\n        stack = []\n        cur = ''\n        num = 0\n\n        for ch in s:\n            if ch.isdigit():\n                num = num * 10 + int(ch)\n            elif ch == '[':\n                stack.append((cur, num))\n                cur = ''\n                num = 0\n            elif ch == ']':\n                prev, times = stack.pop()\n                cur = prev + cur * times\n            else:\n                cur += ch\n\n        return cur",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "栈模拟",
      "badge": "推荐",
      "idea": "遇到 [ 保存之前的字符串和倍数，遇到 ] 弹栈并拼接。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个字符处理一次，栈保存嵌套层。",
      "code": "class Solution:\n    def decodeString(self, s: str) -> str:\n        stack = []\n        cur = ''\n        num = 0\n        for ch in s:\n            if ch.isdigit():\n                num = num * 10 + int(ch)\n            elif ch == '[':\n                stack.append((cur, num))\n                cur = ''\n                num = 0\n            elif ch == ']':\n                prev, times = stack.pop()\n                cur = prev + cur * times\n            else:\n                cur += ch\n        return cur",
      "notes": []
    }
  ],
  "399": [
    {
      "name": "BFS 图搜索",
      "badge": "备选",
      "idea": "把等式建成带权图，每个查询用 BFS 寻找从起点到终点的路径乘积。",
      "time": "O(Q(V+E))",
      "space": "O(V+E)",
      "complexityDetail": "每个查询最坏遍历整张图。",
      "code": "from collections import defaultdict, deque\n\nclass Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        graph = defaultdict(list)\n        for (a, b), val in zip(equations, values):\n            graph[a].append((b, val))\n            graph[b].append((a, 1.0 / val))\n\n        def bfs(a, b):\n            if a not in graph or b not in graph:\n                return -1.0\n            q = deque([(a, 1.0)])\n            seen = {a}\n            while q:\n                cur, prod = q.popleft()\n                if cur == b:\n                    return prod\n                for nxt, w in graph[cur]:\n                    if nxt not in seen:\n                        seen.add(nxt)\n                        q.append((nxt, prod * w))\n            return -1.0\n\n        return [bfs(a, b) for a, b in queries]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(E+Q·(V+E))",
      "space": "O(V+E)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：把 a/b=value 看成有向边 a->b 权重 value、b->a 权重 1/value；查询就是图上乘边权找路径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 a/b=2,b/c=3, 查询 a/c 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        graph = defaultdict(list)\n        for (a, b), val in zip(equations, values):\n            graph[a].append((b, val))\n            graph[b].append((a, 1.0 / val))\n\n        def dfs(cur: str, target: str, product: float, visited: set) -> float:\n            if cur == target:\n                return product\n            visited.add(cur)\n            for nxt, weight in graph[cur]:\n                if nxt not in visited:\n                    res = dfs(nxt, target, product * weight, visited)\n                    if res != -1.0:\n                        return res\n            return -1.0\n\n        ans = []\n        for a, b in queries:\n            if a not in graph or b not in graph:\n                ans.append(-1.0)\n            else:\n                ans.append(dfs(a, b, 1.0, set()))\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "406": [
    {
      "name": "暴力插入并校验",
      "badge": "基础",
      "idea": "尝试把人插入到当前队列的所有位置，选择能让已放入队列暂时合法的位置。",
      "time": "O(n^3)",
      "space": "O(n)",
      "complexityDetail": "教学用来理解 k 的含义，真实面试使用排序插入贪心。",
      "code": "class Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        people.sort(key=lambda x: (-x[0], x[1]))\n        ans = []\n        for person in people:\n            ans.insert(person[1], person)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n²)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：先按身高降序、k 升序排序；插入当前人时，前面已经都是更高或等高的人，直接插入下标 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 people=[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]] 检查代码。\nclass Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        # 高个先排；同身高 k 小的先排\n        people.sort(key=lambda x: (-x[0], x[1]))\n        ans = []\n\n        for person in people:\n            ans.insert(person[1], person)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "416": [
    {
      "name": "二维 0/1 背包",
      "badge": "基础",
      "idea": "dp[i][j] 表示使用前 i 个数能否凑出和 j。",
      "time": "O(n*target)",
      "space": "O(n*target)",
      "complexityDetail": "target 是总和的一半，二维表保存所有前缀状态。",
      "code": "class Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2:\n            return False\n        target = total // 2\n        n = len(nums)\n        dp = [[False] * (target + 1) for _ in range(n + 1)]\n        dp[0][0] = True\n        for i, num in enumerate(nums, 1):\n            for j in range(target + 1):\n                dp[i][j] = dp[i - 1][j] or (j >= num and dp[i - 1][j - num])\n        return dp[n][target]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。 target=sum(nums)/2；每个数只能用一次，所以容量倒序遍历。",
      "time": "O(n·target)",
      "space": "O(target)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：问题转成 0/1 背包：能否从数组中选一些数，使和等于总和的一半。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,5,11,5] 检查代码。\nclass Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2 == 1:\n            return False\n\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n\n        for num in nums:\n            # 0/1 背包必须倒序，防止同一个 num 被重复使用\n            for cap in range(target, num - 1, -1):\n                dp[cap] = dp[cap] or dp[cap - num]\n\n        return dp[target]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "一维 0/1 背包",
      "badge": "推荐",
      "idea": "从大到小更新容量，保证每个数只使用一次。",
      "time": "O(n*target)",
      "space": "O(target)",
      "complexityDetail": "target 是总和一半，只保存一维状态。",
      "code": "class Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2:\n            return False\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n        for num in nums:\n            for j in range(target, num - 1, -1):\n                dp[j] = dp[j] or dp[j - num]\n        return dp[target]",
      "notes": []
    },
    {
      "name": "整数 bitset",
      "badge": "进阶",
      "idea": "用整数的二进制位表示可达和，左移 num 位表示加上 num。",
      "time": "O(n*target/word)",
      "space": "O(1) 代码层面",
      "complexityDetail": "Python 大整数内部仍占 target 位，但写法非常简洁。",
      "code": "class Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total % 2:\n            return False\n        target = total // 2\n        bits = 1\n        for num in nums:\n            bits |= bits << num\n        return ((bits >> target) & 1) == 1",
      "notes": []
    }
  ],
  "437": [
    {
      "name": "双重 DFS",
      "badge": "基础",
      "idea": "枚举每个节点作为路径起点，再向下统计以它开头的路径数量。",
      "time": "O(n^2)",
      "space": "O(h)",
      "complexityDetail": "每个起点都可能向下遍历大量节点，退化链表时为 O(n^2)。",
      "code": "class Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        def count_from(node, rest):\n            if not node:\n                return 0\n            hit = 1 if node.val == rest else 0\n            return hit + count_from(node.left, rest - node.val) + count_from(node.right, rest - node.val)\n\n        if not root:\n            return 0\n        return count_from(root, targetSum) + self.pathSum(root.left, targetSum) + self.pathSum(root.right, targetSum)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：树上前缀和：当前前缀为 cur，若之前出现过 cur-target，则从那个祖先之后到当前节点的路径和为 target。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[10,5,-3,3,2,null,11,3,-2,null,1], target=8 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        prefix = defaultdict(int)\n        prefix[0] = 1\n        ans = 0\n\n        def dfs(node: Optional[TreeNode], cur_sum: int) -> None:\n            nonlocal ans\n            if not node:\n                return\n\n            cur_sum += node.val\n            ans += prefix[cur_sum - targetSum]\n\n            prefix[cur_sum] += 1\n            dfs(node.left, cur_sum)\n            dfs(node.right, cur_sum)\n            prefix[cur_sum] -= 1  # 回溯，离开当前路径\n\n        dfs(root, 0)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "前缀和 DFS",
      "badge": "推荐",
      "idea": "当前路径和为 cur，若之前有 cur-target 的前缀，就能组成一条目标路径。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点访问一次，哈希表保存当前根到节点路径上的前缀和。",
      "code": "from collections import defaultdict\n\nclass Solution:\n    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:\n        prefix = defaultdict(int)\n        prefix[0] = 1\n        ans = 0\n        def dfs(node, cur):\n            nonlocal ans\n            if not node:\n                return\n            cur += node.val\n            ans += prefix[cur - targetSum]\n            prefix[cur] += 1\n            dfs(node.left, cur)\n            dfs(node.right, cur)\n            prefix[cur] -= 1\n        dfs(root, 0)\n        return ans",
      "notes": []
    }
  ],
  "438": [
    {
      "name": "排序每个窗口",
      "badge": "暴力",
      "idea": "把 p 排序，再对 s 的每个等长窗口排序比较。",
      "time": "O(n*klogk)",
      "space": "O(k)",
      "complexityDetail": "k=len(p)，每个窗口排序成本 klogk。",
      "code": "class Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        k = len(p)\n        target = sorted(p)\n        ans = []\n        for i in range(len(s) - k + 1):\n            if sorted(s[i:i + k]) == target:\n                ans.append(i)\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。 每个字符进出窗口一次；计数表大小固定。",
      "time": "O(|s|+|p|)",
      "space": "O(字符集大小)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：固定长度滑动窗口，窗口长度等于 p；维护窗口字符计数，与 p 的计数相等时记录左端点。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"cbaebabacd\", p=\"abc\" 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        m, n = len(s), len(p)\n        if n > m:\n            return []\n\n        need = Counter(p)\n        window = Counter(s[:n])\n        ans = []\n\n        if window == need:\n            ans.append(0)\n\n        for right in range(n, m):\n            left = right - n\n            out = s[left]\n            window[out] -= 1\n            if window[out] == 0:\n                del window[out]\n\n            window[s[right]] += 1\n            if window == need:\n                ans.append(left + 1)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "滑动窗口计数",
      "badge": "推荐",
      "idea": "维护长度为 len(p) 的窗口频次，窗口频次等于 p 的频次时记录起点。",
      "time": "O(n)",
      "space": "O(字符集大小)",
      "complexityDetail": "每个字符入窗出窗一次。",
      "code": "from collections import Counter\n\nclass Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        k = len(p)\n        if len(s) < k:\n            return []\n        need = Counter(p)\n        window = Counter(s[:k])\n        ans = []\n        if window == need:\n            ans.append(0)\n        for right in range(k, len(s)):\n            left_char = s[right - k]\n            window[left_char] -= 1\n            if window[left_char] == 0:\n                del window[left_char]\n            window[s[right]] += 1\n            if window == need:\n                ans.append(right - k + 1)\n        return ans",
      "notes": []
    }
  ],
  "448": [
    {
      "name": "哈希集合",
      "badge": "基础",
      "idea": "把出现过的数字放入集合，再枚举 1 到 n 找没出现的数字。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "集合最多保存 n 个数字。",
      "code": "class Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        seen = set(nums)\n        return [x for x in range(1, len(nums) + 1) if x not in seen]",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：数组值都在 1..n，可以把出现过的数字 x 映射到下标 x-1，并把该位置标负；最后仍为正的位置就是没出现的数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[4,3,2,7,8,2,3,1] 检查代码。\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for x in nums:\n            idx = abs(x) - 1\n            if nums[idx] > 0:\n                nums[idx] = -nums[idx]\n\n        ans = []\n        for i, x in enumerate(nums):\n            if x > 0:\n                ans.append(i + 1)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "原地负号标记",
      "badge": "推荐",
      "idea": "数字 x 出现过，就把下标 x-1 的位置标记为负数；最后仍为正的位置就是缺失数字。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "只修改原数组，不开集合。",
      "code": "class Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for x in nums:\n            idx = abs(x) - 1\n            nums[idx] = -abs(nums[idx])\n        return [i + 1 for i, x in enumerate(nums) if x > 0]",
      "notes": []
    }
  ],
  "461": [
    {
      "name": "bin 字符串计数",
      "badge": "基础",
      "idea": "先异或找不同位，再把二进制字符串里的 1 计数。",
      "time": "O(log C)",
      "space": "O(log C)",
      "complexityDetail": "C 是整数大小，二进制字符串长度为 logC。",
      "code": "class Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        return bin(x ^ y).count('1')",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "优化思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。 实现时先定义关键状态或数据结构，再严格维护循环不变量；最后用边界样例检查更新顺序是否会漏解或越界。",
      "time": "O(1)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：两个数异或后，二进制中为 1 的位就是不同位，统计 1 的个数即可。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 x=1, y=4 检查代码。\nclass Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        z = x ^ y  # 不同的位置为 1\n        count = 0\n        while z:\n            z &= z - 1  # 每次消掉最低位的 1\n            count += 1\n        return count",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "Brian Kernighan 位运算",
      "badge": "推荐",
      "idea": "每次 x &= x-1 去掉最低位的 1，循环次数就是 1 的个数。",
      "time": "O(1)",
      "space": "O(1)",
      "complexityDetail": "整数位数固定时为常数；更一般可写 O(logC)。",
      "code": "class Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        z = x ^ y\n        ans = 0\n        while z:\n            z &= z - 1\n            ans += 1\n        return ans",
      "notes": []
    }
  ],
  "494": [
    {
      "name": "DFS 记忆化正负号",
      "badge": "基础",
      "idea": "对每个数选择加号或减号，缓存当前位置和当前和。",
      "time": "O(n*S)",
      "space": "O(n*S)",
      "complexityDetail": "S 是可能出现的和的范围，缓存避免指数级重复计算。",
      "code": "from functools import lru_cache\n\nclass Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        @lru_cache(None)\n        def dfs(i, total):\n            if i == len(nums):\n                return 1 if total == target else 0\n            return dfs(i + 1, total + nums[i]) + dfs(i + 1, total - nums[i])\n        return dfs(0, 0)",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。 bag=(sum+target)/2；0/1 背包计数，容量倒序。",
      "time": "O(n·bag)",
      "space": "O(bag)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：给数字加正负号，设正数和为 P、负数和为 N，则 P-N=target 且 P+N=sum，转成选一些数凑 P=(sum+target)/2。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1,1,1], target=3 检查代码。\nclass Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 == 1:\n            return 0\n\n        bag = (total + target) // 2\n        dp = [0] * (bag + 1)\n        dp[0] = 1\n\n        for num in nums:\n            for cap in range(bag, num - 1, -1):\n                dp[cap] += dp[cap - num]\n\n        return dp[bag]",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "转化为子集和 DP",
      "badge": "推荐",
      "idea": "设正数和为 P，负数和为 N，有 P-N=target 且 P+N=sum，所以 P=(sum+target)/2。",
      "time": "O(n*P)",
      "space": "O(P)",
      "complexityDetail": "P 是要凑出的正数和，按 0/1 背包计数。",
      "code": "class Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2:\n            return 0\n        bag = (total + target) // 2\n        dp = [0] * (bag + 1)\n        dp[0] = 1\n        for num in nums:\n            for j in range(bag, num - 1, -1):\n                dp[j] += dp[j - num]\n        return dp[bag]",
      "notes": []
    }
  ],
  "538": [
    {
      "name": "递归反中序",
      "badge": "推荐",
      "idea": "BST 从大到小遍历并维护前缀和，当前节点更新为已经访问过的大值之和。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点访问一次，递归栈高度为树高。",
      "code": "class Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n        def dfs(node):\n            nonlocal total\n            if not node:\n                return\n            dfs(node.right)\n            total += node.val\n            node.val = total\n            dfs(node.left)\n        dfs(root)\n        return root",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。 每个节点访问一次；递归栈为树高。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：BST 中序是升序，所以反向中序（右-根-左）能从大到小累加，把当前节点更新为累加和。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8] 检查代码。\nclass Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n\n        def reverse_inorder(node: Optional[TreeNode]) -> None:\n            nonlocal total\n            if not node:\n                return\n            reverse_inorder(node.right)\n            total += node.val\n            node.val = total\n            reverse_inorder(node.left)\n\n        reverse_inorder(root)\n        return root",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "迭代反中序",
      "badge": "备选",
      "idea": "用栈模拟从大到小遍历，边遍历边维护累计和。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点入栈出栈一次。",
      "code": "class Solution:\n    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        total = 0\n        stack = []\n        cur = root\n        while cur or stack:\n            while cur:\n                stack.append(cur)\n                cur = cur.right\n            cur = stack.pop()\n            total += cur.val\n            cur.val = total\n            cur = cur.left\n        return root",
      "notes": []
    }
  ],
  "543": [
    {
      "name": "暴力计算每个节点左右深度",
      "badge": "基础",
      "idea": "把每个节点当作最高点，分别计算左右子树深度并更新直径。",
      "time": "O(n^2)",
      "space": "O(h)",
      "complexityDetail": "每个节点都可能重新计算子树深度，退化时为 O(n^2)。",
      "code": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        def depth(node):\n            if not node:\n                return 0\n            return 1 + max(depth(node.left), depth(node.right))\n        if not root:\n            return 0\n        through = depth(root.left) + depth(root.right)\n        return max(through, self.diameterOfBinaryTree(root.left), self.diameterOfBinaryTree(root.right))",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。 每个节点访问一次；递归栈为树高。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：每个节点处的最长路径 = 左子树高度 + 右子树高度；后序遍历计算高度并更新全局直径。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root=[1,2,3,4,5] 检查代码。\nclass Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        ans = 0\n\n        def depth(node: Optional[TreeNode]) -> int:\n            nonlocal ans\n            if not node:\n                return 0\n            left = depth(node.left)\n            right = depth(node.right)\n            ans = max(ans, left + right)\n            return max(left, right) + 1\n\n        depth(root)\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "后序一次求高度和直径",
      "badge": "推荐",
      "idea": "DFS 返回子树高度，同时用左右高度之和更新答案。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "每个节点只访问一次。",
      "code": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        ans = 0\n        def depth(node):\n            nonlocal ans\n            if not node:\n                return 0\n            left = depth(node.left)\n            right = depth(node.right)\n            ans = max(ans, left + right)\n            return max(left, right) + 1\n        depth(root)\n        return ans",
      "notes": []
    }
  ],
  "560": [
    {
      "name": "枚举所有子数组",
      "badge": "暴力",
      "idea": "固定左端点，向右累计和，等于 k 就计数。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "所有子数组数量为 O(n^2)。",
      "code": "class Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        ans = 0\n        for i in range(len(nums)):\n            total = 0\n            for j in range(i, len(nums)):\n                total += nums[j]\n                if total == k:\n                    ans += 1\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。 一次扫描，哈希表记录前缀和出现次数。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：前缀和：如果当前前缀和为 cur，之前出现过 cur-k，则这些位置到当前的子数组和为 k。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[1,1,1], k=2 检查代码。\nfrom collections import defaultdict\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        count = defaultdict(int)\n        count[0] = 1\n        cur = 0\n        ans = 0\n\n        for x in nums:\n            cur += x\n            ans += count[cur - k]\n            count[cur] += 1\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "前缀和 + 哈希表",
      "badge": "推荐",
      "idea": "当前前缀和为 cur，如果之前出现过 cur-k，则这些位置到当前形成和为 k 的子数组。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个位置只处理一次，哈希表保存前缀和出现次数。",
      "code": "from collections import defaultdict\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        cnt = defaultdict(int)\n        cnt[0] = 1\n        cur = 0\n        ans = 0\n        for x in nums:\n            cur += x\n            ans += cnt[cur - k]\n            cnt[cur] += 1\n        return ans",
      "notes": []
    }
  ],
  "581": [
    {
      "name": "排序后比较",
      "badge": "基础",
      "idea": "将数组排序，原数组和排序数组第一个/最后一个不同位置之间就是需要排序的区间。",
      "time": "O(n log n)",
      "space": "O(n)",
      "complexityDetail": "排序是主成本，排序数组占 O(n) 空间。",
      "code": "class Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        sorted_nums = sorted(nums)\n        left, right = 0, len(nums) - 1\n        while left < len(nums) and nums[left] == sorted_nums[left]:\n            left += 1\n        while right >= 0 and nums[right] == sorted_nums[right]:\n            right -= 1\n        return 0 if left >= right else right - left + 1",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。 左右各扫描一次。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：从左到右维护最大值，发现 nums[i] 小于历史最大值说明右边界至少到 i；从右到左维护最小值，发现 nums[i] 大于历史最小值说明左边界至少到 i。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 nums=[2,6,4,8,10,9,15] 检查代码。\nclass Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        right = -1\n        max_seen = float('-inf')\n\n        for i in range(n):\n            if nums[i] < max_seen:\n                right = i\n            else:\n                max_seen = nums[i]\n\n        left = n\n        min_seen = float('inf')\n        for i in range(n - 1, -1, -1):\n            if nums[i] > min_seen:\n                left = i\n            else:\n                min_seen = nums[i]\n\n        return 0 if right == -1 else right - left + 1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "单调栈",
      "badge": "备选",
      "idea": "从左到右找被更小元素破坏的右边界，从右到左找被更大元素破坏的左边界。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个下标最多入栈出栈一次。",
      "code": "class Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        left, right = n, -1\n        stack = []\n        for i, x in enumerate(nums):\n            while stack and nums[stack[-1]] > x:\n                left = min(left, stack.pop())\n            stack.append(i)\n        stack = []\n        for i in range(n - 1, -1, -1):\n            while stack and nums[stack[-1]] < nums[i]:\n                right = max(right, stack.pop())\n            stack.append(i)\n        return 0 if right == -1 else right - left + 1",
      "notes": []
    },
    {
      "name": "一次扫描维护边界",
      "badge": "推荐",
      "idea": "从左到右维护最大值确定右边界，从右到左维护最小值确定左边界。",
      "time": "O(n)",
      "space": "O(1)",
      "complexityDetail": "两次线性扫描，只用常数变量。",
      "code": "class Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        max_seen = float('-inf')\n        min_seen = float('inf')\n        right = -1\n        left = n\n        for i in range(n):\n            max_seen = max(max_seen, nums[i])\n            if nums[i] < max_seen:\n                right = i\n        for i in range(n - 1, -1, -1):\n            min_seen = min(min_seen, nums[i])\n            if nums[i] > min_seen:\n                left = i\n        return 0 if right == -1 else right - left + 1",
      "notes": []
    }
  ],
  "617": [
    {
      "name": "递归原地合并",
      "badge": "推荐",
      "idea": "两个节点都存在时相加并继续合并左右子树；某一边为空时直接返回另一边。",
      "time": "O(n)",
      "space": "O(h)",
      "complexityDetail": "n 是两棵树重叠部分加非空节点数；递归栈高度为树高。",
      "code": "class Solution:\n    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root1:\n            return root2\n        if not root2:\n            return root1\n        root1.val += root2.val\n        root1.left = self.mergeTrees(root1.left, root2.left)\n        root1.right = self.mergeTrees(root1.right, root2.right)\n        return root1",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。 若直接复用节点，只递归两树重叠部分；递归栈取决于树高。",
      "time": "O(min(m,n)) 或 O(m+n)",
      "space": "O(h)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：两棵树对应节点都存在就相加，只存在一边就直接返回那边；递归合并左右子树。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 root1=[1,3,2,5], root2=[2,1,3,null,4,null,7] 检查代码。\nclass Solution:\n    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root1:\n            return root2\n        if not root2:\n            return root1\n\n        root1.val += root2.val\n        root1.left = self.mergeTrees(root1.left, root2.left)\n        root1.right = self.mergeTrees(root1.right, root2.right)\n        return root1",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "621": [
    {
      "name": "最大堆模拟 CPU",
      "badge": "备选",
      "idea": "每个冷却周期取当前剩余次数最多的任务执行，未做完的任务下一轮再入堆。",
      "time": "O(T log A)",
      "space": "O(A)",
      "complexityDetail": "T 是总调度长度，A 是任务种类数。",
      "code": "from collections import Counter, deque\nimport heapq\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        heap = [-c for c in Counter(tasks).values()]\n        heapq.heapify(heap)\n        cool = deque()\n        time = 0\n        while heap or cool:\n            time += 1\n            if heap:\n                cnt = heapq.heappop(heap) + 1\n                if cnt:\n                    cool.append((time + n, cnt))\n            if cool and cool[0][0] == time:\n                heapq.heappush(heap, cool.popleft()[1])\n        return time",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。 任务种类固定为大写字母，计数空间常数；扫描任务一次。",
      "time": "O(N)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：先安排出现次数最多的任务：把 max_count-1 个间隔块撑开，每块长度 n+1，最后加上同为最高频的任务数；答案还不能小于任务总数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2 检查代码。\nfrom collections import Counter\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        freq = Counter(tasks)\n        max_count = max(freq.values())\n        max_kinds = sum(1 for v in freq.values() if v == max_count)\n\n        # 先用最高频任务撑开框架，再与任务总数取最大值\n        frame = (max_count - 1) * (n + 1) + max_kinds\n        return max(frame, len(tasks))",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    }
  ],
  "647": [
    {
      "name": "枚举所有子串",
      "badge": "暴力",
      "idea": "枚举每个子串并判断是否回文。",
      "time": "O(n^3)",
      "space": "O(1)",
      "complexityDetail": "子串 O(n^2)，每次回文检查 O(n)。",
      "code": "class Solution:\n    def countSubstrings(self, s: str) -> int:\n        def is_pal(left, right):\n            while left < right:\n                if s[left] != s[right]:\n                    return False\n                left += 1\n                right -= 1\n            return True\n        ans = 0\n        for i in range(len(s)):\n            for j in range(i, len(s)):\n                if is_pal(i, j):\n                    ans += 1\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。 2n-1 个中心，每个中心最坏扩展 O(n)。",
      "time": "O(n²)",
      "space": "O(1)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：每个回文都有中心；枚举 n 个字符中心和 n-1 个间隙中心，向两边扩展并计数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 s=\"abc\" 检查代码。\nclass Solution:\n    def countSubstrings(self, s: str) -> int:\n        ans = 0\n\n        def expand(left: int, right: int) -> None:\n            nonlocal ans\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                ans += 1\n                left -= 1\n                right += 1\n\n        for i in range(len(s)):\n            expand(i, i)       # 奇数长度回文\n            expand(i, i + 1)   # 偶数长度回文\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "中心扩展",
      "badge": "推荐",
      "idea": "每个回文子串都有中心，枚举单中心和双中心向外扩展。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "共有 2n-1 个中心，每个中心最坏扩展 O(n)。",
      "code": "class Solution:\n    def countSubstrings(self, s: str) -> int:\n        ans = 0\n        def expand(left, right):\n            nonlocal ans\n            while left >= 0 and right < len(s) and s[left] == s[right]:\n                ans += 1\n                left -= 1\n                right += 1\n        for i in range(len(s)):\n            expand(i, i)\n            expand(i, i + 1)\n        return ans",
      "notes": []
    },
    {
      "name": "DP 判断回文",
      "badge": "备选",
      "idea": "dp[i][j] 表示 s[i:j+1] 是否为回文，成立就计数。",
      "time": "O(n^2)",
      "space": "O(n^2)",
      "complexityDetail": "枚举所有子串并保存回文状态。",
      "code": "class Solution:\n    def countSubstrings(self, s: str) -> int:\n        n = len(s)\n        dp = [[False] * n for _ in range(n)]\n        ans = 0\n        for length in range(1, n + 1):\n            for left in range(n - length + 1):\n                right = left + length - 1\n                if s[left] == s[right] and (length <= 2 or dp[left + 1][right - 1]):\n                    dp[left][right] = True\n                    ans += 1\n        return ans",
      "notes": []
    }
  ],
  "739": [
    {
      "name": "暴力向右找更暖日",
      "badge": "暴力",
      "idea": "对每一天向后扫描，找到第一个温度更高的日子。",
      "time": "O(n^2)",
      "space": "O(1)",
      "complexityDetail": "每一天最坏都要向右扫到末尾。",
      "code": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        n = len(temperatures)\n        ans = [0] * n\n        for i in range(n):\n            for j in range(i + 1, n):\n                if temperatures[j] > temperatures[i]:\n                    ans[i] = j - i\n                    break\n        return ans",
      "notes": []
    },
    {
      "name": "面试推荐写法",
      "badge": "推荐",
      "idea": "单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。 每个下标最多入栈出栈一次。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "这是当前题目精修数据中的主解法，适合作为手撕标准答案。",
      "code": "# 核心思路：单调递减栈保存还没等到更高温的日期下标；当前温度更高时，弹栈并计算等待天数。\n# 手撕重点：先讲变量含义和循环/递归不变量，再用边界样例 temperatures=[73,74,75,71,69,72,76,73] 检查代码。\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        stack = []  # 存下标，且对应温度单调递减\n\n        for i, temp in enumerate(temperatures):\n            while stack and temp > temperatures[stack[-1]]:\n                prev = stack.pop()\n                ans[prev] = i - prev\n            stack.append(i)\n\n        return ans",
      "notes": [
        "优先掌握这一版；其他解法用于理解取舍和应对追问。"
      ]
    },
    {
      "name": "单调栈",
      "badge": "推荐",
      "idea": "栈中保存还没找到更暖日的下标；当前温度更高时结算栈顶。",
      "time": "O(n)",
      "space": "O(n)",
      "complexityDetail": "每个下标最多入栈出栈一次。",
      "code": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        stack = []\n        for i, t in enumerate(temperatures):\n            while stack and t > temperatures[stack[-1]]:\n                j = stack.pop()\n                ans[j] = i - j\n            stack.append(i)\n        return ans",
      "notes": []
    }
  ]
};

export function getSolutionVariants(leetcodeId: number): SolutionVariant[] {
  return solutionVariants[leetcodeId] ?? [];
}