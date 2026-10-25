// DP 五步曲（动态规划专属）
export interface DPSteps {
  dpDefinition: string; // 第1步：dp数组含义
  recurrence: string; // 第2步：递推公式
  initialization: string; // 第3步：初始化
  traversalOrder: string; // 第4步：遍历顺序
  exampleDerivation: string; // 第5步：举例推导
  debugTip: string; // Debug思路
}

// 二叉树递归框架（二叉树题专属）
export interface TreeFramework {
  traversalType: '前序' | '中序' | '后序' | '层序';
  recursionOrIteration: string; // 为什么选递归/迭代
  functionSignature: string; // 函数参数和返回值
  terminationCondition: string; // 终止条件
  singleLayerLogic: string; // 单层递归逻辑
  dfsOrBfs: 'DFS' | 'BFS';
  beginnerPitfall: string; // 初学者易混淆点
}

// 回溯模板（回溯题专属）
export interface BacktrackingTemplate {
  treeStructure: string; // 问题如何抽象成树形结构
  horizontalLoop: string; // 横向for循环遍历什么
  verticalRecursion: string; // 纵向递归调用什么
  terminationCondition: string; // 终止条件
  processNode: string; // 处理节点
  recursiveCall: string; // 递归
  undoSelection: string; // 撤销选择
  pruning: string; // 是否需要剪枝
}

// 贪心证明（贪心题专属）
export interface GreedyProof {
  localOptimal: string; // 局部最优
  globalOptimal: string; // 全局最优
  proofReasoning: string; // 为什么局部最优推出全局最优
  counterExample: string; // 有没有反例
  whyNotDP: string; // 为什么不是动态规划
  intuition: string; // 贪心感觉/经验总结
}

// 题目完整数据
export interface Problem {
  id: number;
  leetcodeId: number;
  title: string;
  titleEn: string;
  slug: string;
  difficulty: '简单' | '中等' | '困难';
  category: string;
  tags: string[];
  order: number;
  externalUrl: string;

  // 教学内容
  summary: string;
  prerequisites: string[];
  learningGoal: string;
  whyThisPattern: string;

  // 分层提示
  hints: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
  };

  // 解法
  bruteForceIdea: string;
  optimizedIdea: string;
  pseudocode: string;
  solutionCode: string;
  complexity: { time: string; space: string };
  commonMistakes: string[];
  reviewQuestions: string[];

  // 题型专属区域（按需显示）
  dpSteps?: DPSteps;
  treeFramework?: TreeFramework;
  backtrackingTemplate?: BacktrackingTemplate;
  greedyProof?: GreedyProof;
}

// 学习阶段
export interface LearningStage {
  id: string;
  name: string;
  description: string;
  order: number;
  problemIds: number[];
  templates: string[];
  commonMistakes: string[];
  tips: string;
}

// 错题本条目
export interface WrongBookEntry {
  problemId: number;
  reason: string;
  addedAt: string;
  lastReviewAt: string | null;
  mastered: boolean;
}

// 用户角色
export type UserRole = 'admin' | 'user';

// 用户信息
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

// 用户进度（存储在服务端）
export interface UserProgress {
  completedProblemIds: number[];
  wrongProblemIds: number[];
  wrongBook: WrongBookEntry[];
  unlockedHints: Record<number, number>;
  notes: Record<number, string>;
  postSolveChecks: Record<number, Record<number, boolean>>;
  lastStudiedProblemId: number | null;
  studyDays: number;
  lastStudyDate: string | null;
}
