# LeetCode Hot100 刷题平台 技术文档

> 本文档涵盖项目所有技术要点，适用于简历撰写和面试准备。

---

## 一、项目概述

### 1.1 项目简介

本项目是一个面向算法学习者的 LeetCode Hot100 刷题学习平台，解决的核心问题是：初学者在刷算法题时缺乏系统化的学习路径和有效的自我检测机制。平台以"代码随想录"的学习理念为基础，将 100 道高频面试题按照 17 个知识阶段组织，为每道题提供六步渐进式引导学习（从读题建模到完整代码复盘），并配备错题本、学习进度追踪、笔记系统等功能，帮助用户从"看答案"转变为"真正理解"。

### 1.2 核心功能

| 功能 | 说明 | 技术实现 |
|------|------|---------|
| 六步渐进学习 | 每道题分6步引导：读题建模→暴力起步→识别瓶颈→识别模式→伪代码→完整答案 | React 状态管理 + 逐级解锁机制 |
| 17阶段学习路线 | 将100道题按算法分类组织为17个学习阶段，从数组哈希到技巧 | TypeScript 数据建模 + 路由驱动 |
| 多解法对比 | 每道题收录多种Python解法（暴力/基础/推荐/备选/进阶），对比时间空间复杂度 | 静态数据 + 可折叠卡片UI |
| 错题本 | 支持添加/移除错题、记录错误原因、标记已掌握、定期复习提醒 | 服务端持久化 + 筛选过滤 |
| 学习进度追踪 | 完成题目数、学习天数、提示使用次数、阶段完成率 | 自定义Hook + JSON文件存储 |
| 用户认证 | 基于Cookie-Session的登录认证，预置1个管理员+10个学员账号 | scrypt加密 + UUID Session |
| 管理后台 | 管理员查看所有用户、重置密码 | 基于角色的权限控制 |
| 笔记系统 | 每道题可记录学习笔记 | 按题目ID键值存储 |
| 解题后复盘 | 提交后自测清单、常见错误调试指南、边界用例测试 | 题型分类的调试配方 |
| 响应式布局 | 桌面端侧边栏 + 移动端自适应 | Tailwind CSS 响应式设计 |

### 1.3 技术栈

- **前端框架**：Next.js 16 (App Router) + React 19 + TypeScript 6
- **样式方案**：Tailwind CSS 4 + 自定义CSS
- **包管理器**：pnpm 10
- **后端**：Next.js API Routes (Route Handlers)
- **数据存储**：JSON文件（`data/users.json`）
- **密码加密**：Node.js crypto (scrypt + timingSafeEqual)
- **部署方案**：Docker + Docker Compose（Node 22 Alpine）
- **代码质量**：TypeScript 严格模式 + 内容QA脚本

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器 (Client)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 首页仪表盘│  │ 题目详情页│  │ 学习路线页│  │ 错题本  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│  ┌────┴──────────────┴──────────────┴──────────────┴───┐ │
│  │          React Hooks (useProgress/useHints)         │ │
│  │          AuthContext (登录状态管理)                   │ │
│  └────────────────────┬────────────────────────────────┘ │
└───────────────────────┼──────────────────────────────────┘
                        │ fetch API
┌───────────────────────┼──────────────────────────────────┐
│                 Next.js Server                            │
│  ┌────────────────────┴────────────────────────────────┐ │
│  │              API Route Handlers                      │ │
│  │  /api/auth/login  /api/auth/me  /api/progress       │ │
│  │  /api/auth/register  /api/auth/logout  /api/setup   │ │
│  └────────────────────┬────────────────────────────────┘ │
│  ┌────────────────────┴────────────────────────────────┐ │
│  │              业务逻辑层                              │ │
│  │  auth.ts (认证)  db.ts (存储)  progress.ts (规范化)  │ │
│  │  password.ts (加密)  seededAccounts.ts (预置账号)    │ │
│  └────────────────────┬────────────────────────────────┘ │
│  ┌────────────────────┴────────────────────────────────┐ │
│  │              数据存储层                              │ │
│  │              data/users.json                         │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 2.2 核心请求流程

**用户登录流程**：
1. 用户在 `/login` 页面输入用户名和密码
2. 前端通过 `POST /api/auth/login` 提交表单（支持 JSON 和 FormData 两种格式）
3. 服务端 `findUserByUsername()` 查找用户，`verifyPassword()` 用 scrypt 验证密码
4. 验证通过后 `createSession()` 生成 UUID Token，写入 `data/users.json`
5. 通过 `Set-Cookie` 将 Token 写入 HttpOnly Cookie（7天过期）
6. 前端重定向到首页，`AuthContext` 通过 `GET /api/auth/me` 获取当前用户

**学习进度同步流程**：
1. 用户在题目页标记完成/加入错题本
2. `useProgress` Hook 在客户端 `cloneProgress()` 深拷贝当前进度
3. 修改后调用 `normalizeProgress()` 校验所有字段合法性
4. 乐观更新本地状态，同时 `PUT /api/progress` 同步到服务端
5. 服务端再次 `normalizeProgress()` 后写入 `data/users.json`
6. 如果网络失败，提示用户数据未写入

---

## 三、核心模块详解

### 3.1 六步渐进式学习引擎

#### 核心设计思想

在设计题目学习页面时，需要解决一个核心问题：初学者看算法题最常见的错误是"跳步"——直接看最优解代码，然后背答案，但遇到变题就不会了。因此，需要一个引导机制，强制用户按"读题→暴力→瓶颈→模式→伪代码→代码"的路径思考，每一步都需要用户主动点击解锁。

#### 技术实现

采用**策略模式**设计提示系统：每道题有6个层级的提示（`hints.level1` 到 `hints.level6`），从最基础的题目理解引导，到最终的完整代码。用户必须逐级解锁，不能跳级。

```typescript
// 解锁状态通过 Hook 管理
const { unlockedLevel, unlockTo } = useHints(problem.id);

// 逐级解锁逻辑：只能解锁当前已解锁层级的下一级
const canUnlock = level <= unlockedLevel + 1;
if (canUnlock) {
  await unlockTo(level);  // 解锁到指定层级
}
```

**关键设计决策**：
- **选择逐级解锁而非一次性展示**：对比方案是直接展示所有提示，但研究表明渐进式提示能显著提高学习效果。用户需要先尝试自己思考，遇到困难时再查看下一级提示。
- **提示内容分层设计**：level1 是读题引导，level2 是暴力思路提示，level3 是瓶颈分析，level4 是优化方向，level5 是伪代码，level6 是完整代码。每层都有"先这样想"的引导语和"参考理解"的解答。

#### 边界情况处理

- **提示数据缺失**：部分题目没有完整的6级提示，系统通过 `getProblemRefinement()` 从精修数据中补充
- **网络中断**：解锁状态乐观更新本地，异步同步服务端，失败时不影响本地体验

### 3.2 多解法对比系统

#### 核心设计思想

面试中，面试官经常追问"还有没有其他解法？"。因此，每道题需要提供多种解法，并清晰对比它们的时间空间复杂度差异。

#### 技术实现

采用**策略模式**的变体：每道题关联多个 `SolutionVariant`，每个变体包含名称、标记（暴力/基础/推荐/备选/进阶）、思路、代码、复杂度等完整信息。

```typescript
interface SolutionVariant {
  name: string;        // 解法名称
  badge: '暴力' | '基础' | '推荐' | '备选' | '进阶';
  idea: string;        // 思路说明
  time: string;        // 时间复杂度
  space: string;       // 空间复杂度
  complexityDetail: string;
  code: string;        // Python 代码
  notes: string[];     // 注意事项
}
```

**UI 设计**：采用可折叠卡片布局。顶部是所有解法的摘要对比（时间/空间复杂度并列），点击任意卡片展开该解法的完整代码和详细分析。默认展开"面试推荐写法"。

### 3.3 题型专属教学框架

#### 核心设计思想

不同算法题型有完全不同的思考框架。动态规划需要"五步曲"（dp定义→递推公式→初始化→遍历顺序→举例推导），二叉树需要"递归三要素"，回溯需要"选择→约束→撤销"。系统需要为每种题型提供专属的教学模板。

#### 技术实现

采用**模板方法模式**：定义通用的 `Problem` 接口，通过可选字段（`dpSteps?`、`treeFramework?`、`backtrackingTemplate?`、`greedyProof?`）为不同题型注入专属内容。

```typescript
interface Problem {
  // 通用字段
  id: number;
  title: string;
  solutionCode: string;
  // ...
  
  // 题型专属区域（按需显示）
  dpSteps?: DPSteps;              // 动态规划五步曲
  treeFramework?: TreeFramework;  // 二叉树递归框架
  backtrackingTemplate?: BacktrackingTemplate;  // 回溯模板
  greedyProof?: GreedyProof;      // 贪心证明
}
```

### 3.4 错题本与复习机制

#### 核心设计思想

错题本不是简单的"标记错题"，而是要形成"记录→复盘→掌握"的闭环。系统实现了基于时间间隔的复习提醒机制。

#### 技术实现

```typescript
// 3天未复习则标记为"需复习"
const REVIEW_INTERVAL_DAYS = 3;

function isReviewDue(entry: WrongBookEntry): boolean {
  if (entry.mastered) return false;
  if (!entry.lastReviewAt) return true;  // 从未复习过
  const lastReviewTime = new Date(entry.lastReviewAt).getTime();
  return Date.now() - lastReviewTime >= REVIEW_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
}
```

**错题本数据结构**：
- `problemId`：关联的题目ID
- `reason`：用户记录的错误原因（可编辑）
- `addedAt`：加入时间
- `lastReviewAt`：上次复习时间
- `mastered`：是否已掌握

### 3.5 解题后复盘教练（PostSolveCoach）

#### 核心设计思想

题目做完不等于掌握了。需要一个"复盘教练"引导用户自测、定位错误、复盘迁移。

#### 技术实现

采用**策略模式**：根据题目分类（`problem.category`）匹配对应的调试配方（`DebugRecipe`），包含定位（locate）、修正（fix）、再测（retest）三个步骤。

```typescript
type DebugRecipe = {
  locate: string;  // 如何定位错误
  fix: string;     // 如何修正
  retest: string;  // 如何验证修正
};

// 20种题型各有专属调试配方
const categoryDebugRecipes: Record<string, DebugRecipe> = {
  '哈希': { locate: '...', fix: '...', retest: '...' },
  '双指针': { locate: '...', fix: '...', retest: '...' },
  // ...
};
```

**提交前自测清单**：根据题目动态生成5-6条检查项，用户可逐条勾选确认，系统追踪完成状态。

---

## 四、后端技术栈详解

### 4.1 Next.js API Routes (Route Handlers)

**是什么**：Next.js 的服务端 API 层，使用文件系统路由，每个 `route.ts` 文件导出 HTTP 方法处理函数。

**为什么选它**：
1. 无需额外搭建 Express/Koa 服务，前后端同仓开发
2. 原生支持 TypeScript，类型安全
3. App Router 的 Server Components 可以直接在服务端读取 Cookie，无需额外中间件

**核心用法**：
```typescript
// src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  // 支持 JSON 和 FormData 两种格式
  const contentType = request.headers.get('content-type') || '';
  const wantsJson = contentType.includes('application/json');
  
  // 验证用户名密码
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
  }
  
  // 创建 Session 并设置 Cookie
  const token = createSession(user.id);
  const response = NextResponse.json({ user: { id: user.id, username: user.username } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,    // 防止 XSS 读取
    sameSite: 'lax',   // 防止 CSRF
    maxAge: 7 * 24 * 60 * 60,  // 7天
  });
  return response;
}
```

**替代方案**：
- **Express + 前后端分离**：需要额外的跨域配置和部署，对于这个规模的项目过于复杂
- **tRPC**：类型安全性更好，但学习成本高，且项目API数量有限（6个端点），不需要RPC抽象

### 4.2 JSON 文件存储

**是什么**：将用户数据、Session、学习进度存储在 `data/users.json` 文件中，通过 `readFileSync` / `writeFileSync` 同步读写。

**为什么选它**：
1. 零外部依赖：不需要安装 MongoDB、PostgreSQL 等数据库
2. 部署简单：Docker 容器只需挂载 `data` 目录即可持久化
3. 数据可读：JSON 文件可以直接查看和编辑，方便调试

**核心用法**：
```typescript
// 每次读取都经过规范化，保证数据完整性
function readDB(): DBData {
  if (!existsSync(DB_FILE)) {
    const initial = createInitialDB();
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = readFileSync(DB_FILE, 'utf-8').replace(/^﻿/, '');
    const normalized = normalizeDB(JSON.parse(raw));
    writeFileSync(DB_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    return normalized;
  } catch {
    const initial = createInitialDB();
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}
```

**数据规范化设计**：每次读取数据库时，都会对所有字段进行规范化（`normalizeDB`），包括：
- 用户数据去重（按ID和用户名）
- Session 过期清理
- 进度数据类型校验
- 预置账号存在性保证

**优缺点**：
| 优点 | 缺点 |
|------|------|
| 零依赖，部署简单 | 不支持并发写入（同步IO） |
| 数据可读可编辑 | 不适合大规模数据 |
| 无数据库运维成本 | 没有索引，全量扫描 |

**替代方案**：
- **SQLite**：更好的并发支持和查询能力，但增加了依赖和部署复杂度
- **MongoDB**：适合大规模数据，但对于10个用户的教学平台过于重量级

### 4.3 密码加密 (scrypt)

**是什么**：使用 Node.js 内置 `crypto` 模块的 `scrypt` 算法进行密码哈希，配合 `timingSafeEqual` 进行常量时间比较。

**为什么选 scrypt 而不是 bcrypt**：
1. Node.js 原生支持，无需安装额外包
2. scrypt 设计时考虑了内存硬度（memory-hard），抗 GPU 暴力破解
3. `timingSafeEqual` 防止时序攻击

**核心用法**：
```typescript
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;  // salt:hash 格式存储
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const testHash = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(testHash, 'hex')
  );
}
```

**安全设计**：
- 每次哈希使用随机16字节盐值
- 哈希长度64字节
- 使用 `timingSafeEqual` 比较，防止时序攻击
- 存储格式为 `salt:hash`，方便解析

### 4.4 Session 管理

**是什么**：基于 UUID Token 的 Session 机制，Token 存储在服务端 JSON 文件中，通过 HttpOnly Cookie 传递。

**Session 创建**：
```typescript
export function createSession(userId: string): string {
  const token = crypto.randomUUID();  // 生成随机UUID
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.sessions[token] = { userId, expiresAt };
  writeDB(db);
  return token;
}
```

**Session 验证**：每次请求时从 Cookie 读取 Token，查找对应的 Session 记录，检查是否过期。过期的 Session 在验证时自动清理。

---

## 五、前端技术栈详解

### 5.1 Next.js App Router

**是什么**：Next.js 13+ 引入的基于文件系统的路由系统，支持 Server Components、Client Components、Route Handlers 等特性。

**项目中的路由结构**：
```
src/app/
├── page.tsx              # 首页（服务端组件，检查登录后重定向）
├── HomeClient.tsx        # 首页客户端逻辑
├── layout.tsx            # 根布局
├── providers.tsx         # 全局 Context Provider
├── login/page.tsx        # 登录页
├── learn/page.tsx        # 学习路线页
├── learn/LearnClient.tsx
├── problem/[slug]/       # 动态路由：题目详情
│   ├── page.tsx          # 服务端：根据slug查找题目
│   └── ProblemClient.tsx # 客户端：题目详情UI
├── wrong-book/           # 错题本
├── admin/                # 管理后台
└── api/                  # API路由
    ├── auth/
    │   ├── login/route.ts
    │   ├── logout/route.ts
    │   ├── me/route.ts
    │   └── register/route.ts
    ├── progress/route.ts
    └── admin/users/route.ts
```

**Server Component 与 Client Component 的分工**：
- **Server Component**（`page.tsx`）：负责数据获取、权限检查、重定向逻辑
- **Client Component**（`*Client.tsx`）：负责交互状态、用户操作、UI更新

```typescript
// page.tsx — Server Component
export default async function HomePage() {
  const user = await getCurrentUser();  // 服务端直接读取Cookie
  if (!user) redirect('/login');         // 未登录则重定向
  return <HomeClient />;                 // 渲染客户端组件
}
```

### 5.2 React 自定义 Hooks

项目封装了3个核心 Hook，将业务逻辑与UI分离：

**useProgress**：学习进度管理
- 加载/保存进度数据
- 切换题目完成状态
- 管理错题本（添加/移除/标记掌握）
- 解题后复盘检查项管理
- 自动记录学习天数

**useHints**：提示解锁管理
- 管理当前解锁层级
- 逐级解锁逻辑
- 乐观更新 + 服务端同步

**useNotes**：笔记管理
- 按题目ID读写笔记
- 自动保存

### 5.3 Context 全局状态

```typescript
// AuthContext：管理登录状态
interface AuthContextType {
  user: { id: string; username: string; role: string } | null;
  loading: boolean;
  refresh: () => Promise<void>;
}
```

`AuthContext` 在 `providers.tsx` 中提供给整个应用，所有需要登录状态的组件都通过 `useAuth()` Hook 获取。

### 5.4 Tailwind CSS 4

**为什么选 Tailwind**：
1. 原子化CSS，无需编写独立的样式文件
2. 响应式设计通过前缀实现（`sm:`、`md:`、`lg:`）
3. 与 React 组件天然配合
4. 生产环境自动 purge 未使用的样式

**项目中的响应式设计**：
```tsx
// 桌面端：左右布局（主内容 + 侧边栏）
// 移动端：上下布局（侧边栏隐藏或折叠）
<div className="app-layout">
  <section className="app-content">{children}</section>
  <aside className="app-aside">{sidebar}</aside>
</div>
```

---

## 六、数据库设计

### 6.1 数据结构

项目使用 JSON 文件存储，核心数据结构如下：

```typescript
interface DBData {
  users: User[];                    // 用户列表
  sessions: Record<string, {        // Session 映射
    userId: string;
    expiresAt: string;
  }>;
  progress: Record<string, UserProgress>;  // 用户进度（以userId为key）
}

interface User {
  id: string;           // 用户ID（如 "admin-001", "student-01"）
  username: string;     // 用户名
  passwordHash: string; // scrypt哈希后的密码
  role: 'admin' | 'user';
  createdAt: string;
}

interface UserProgress {
  completedProblemIds: number[];     // 已完成的题目ID列表
  wrongProblemIds: number[];         // 错题ID列表
  wrongBook: WrongBookEntry[];       // 错题本详细信息
  unlockedHints: Record<number, number>;  // 每道题解锁的提示层级
  notes: Record<number, string>;     // 每道题的笔记
  postSolveChecks: Record<number, Record<number, boolean>>;  // 复盘检查项
  lastStudiedProblemId: number | null;
  studyDays: number;                 // 学习天数
  lastStudyDate: string | null;      // 最后学习日期
}
```

### 6.2 数据校验策略

所有外部输入在写入前都经过严格的规范化处理：

```typescript
function normalizeProgress(raw: Partial<UserProgress> | null | undefined): UserProgress {
  const merged = { ...defaultProgress, ...(raw || {}) };
  return {
    completedProblemIds: normalizeIdList(merged.completedProblemIds),  // 去重 + 校验ID合法性
    wrongProblemIds: normalizeIdList(merged.wrongProblemIds),
    wrongBook: normalizeWrongBook(merged.wrongBook),       // 校验每条记录结构
    unlockedHints: normalizeNumberRecord(merged.unlockedHints),  // 校验层级范围0-6
    notes: normalizeNotes(merged.notes),
    // ...
  };
}
```

**设计模式**：采用**防御性编程**策略，每次读取数据时都进行规范化，确保即使数据文件被手动修改或损坏，系统也能自动修复。

---

## 七、安全与认证

### 7.1 认证流程

```
用户输入账号密码
    ↓
POST /api/auth/login
    ↓
findUserByUsername() → 查找用户
    ↓
verifyPassword() → scrypt 验证
    ↓
createSession() → 生成 UUID Token
    ↓
Set-Cookie (HttpOnly, SameSite=Lax, 7天)
    ↓
后续请求自动携带 Cookie
    ↓
getCurrentUser() → Cookie → Session → User
```

### 7.2 安全措施

| 措施 | 实现方式 | 防御的攻击 |
|------|---------|-----------|
| 密码加密 | scrypt + 随机盐 | 彩虹表攻击 |
| 常量时间比较 | timingSafeEqual | 时序攻击 |
| HttpOnly Cookie | cookie选项 | XSS读取Token |
| SameSite=Lax | cookie选项 | CSRF攻击 |
| 输入校验 | normalizeProgress | 注入攻击 |
| 角色权限 | requireAdmin() | 越权访问 |
| 路径规范化 | normalizeNextPath | 开放重定向 |
| 禁止注册 | register返回403 | 恶意创建账号 |

### 7.3 预置账号

系统预置1个管理员和10个学员账号，不允许自助注册：

```typescript
export const SEEDED_ADMIN_ACCOUNT: SeededAccount = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin@123',
  role: 'admin',
};

export const SEEDED_USER_ACCOUNTS: SeededAccount[] = Array.from(
  { length: 10 },
  (_, i) => ({
    id: `student-${String(i + 1).padStart(2, '0')}`,
    username: `user${String(i + 1).padStart(2, '0')}`,
    password: 'user123456',
    role: 'user',
  })
);
```

---

## 八、部署与运维

### 8.1 Docker 多阶段构建

```dockerfile
# 阶段1：安装依赖
FROM node:22-alpine AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# 阶段2：构建
FROM node:22-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 阶段3：运行（最小镜像）
FROM node:22-alpine AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node", "server.js"]
```

**设计决策**：
- **多阶段构建**：最终镜像只包含运行时必需文件，镜像体积最小化
- **standalone 模式**：`next.config.ts` 中设置 `output: 'standalone'`，Next.js 会打包一个独立的 Node.js 服务器
- **非 root 用户**：创建 `nextjs:nodejs` 用户运行进程，遵循最小权限原则

### 8.2 Docker Compose

```yaml
services:
  hot100:
    build: .
    container_name: hot100
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data  # 数据持久化
```

**关键点**：
- `volumes` 将宿主机的 `data` 目录挂载到容器内，确保用户数据在容器重启后不丢失
- `restart: unless-stopped` 保证服务自动恢复

### 8.3 质量保障脚本

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "lint": "tsc --noEmit",
    "qa:content": "node scripts/qa_hot100.mjs",
    "verify": "npm run lint && npm run qa:content && npm audit && npm run build"
  }
}
```

- `lint`：TypeScript 类型检查
- `qa:content`：题目内容质量检查脚本
- `verify`：完整验证流水线（类型检查 → 内容QA → 安全审计 → 构建）

---

## 九、面试 Q&A

### 9.1 项目架构类

**Q: 介绍一下这个项目的整体架构？**

A: 这是一个基于 Next.js 16 App Router 的全栈应用，采用前后端同仓架构。前端使用 React 19 + TypeScript + Tailwind CSS，后端使用 Next.js API Routes 提供 RESTful 接口，数据存储使用 JSON 文件。整体采用 Server Component + Client Component 的混合渲染模式。

**第一，前后端同仓架构**。选择 Next.js 的核心原因是它原生支持服务端渲染和 API Routes，无需额外搭建后端服务。Server Components 可以直接在服务端读取 Cookie 验证登录状态，避免了客户端额外的请求。

**第二，数据存储选型**。使用 JSON 文件而非数据库，原因是项目规模有限（预置11个用户），JSON 文件足以满足需求，且部署时只需挂载一个目录即可持久化，无需运维数据库。

**第三，安全性设计**。密码使用 scrypt 加密，Session 通过 HttpOnly Cookie 传递，所有用户输入都经过规范化校验，防止注入攻击。

**可能追问**：
- Q: 为什么不用 SQLite？
  A: SQLite 确实是更好的选择，它支持并发读取和索引查询。但对于这个项目，用户量小（11个预置账号），读写频率低，JSON 文件的简单性是更好的权衡。如果用户量增长到百人以上，应该迁移到 SQLite。

- Q: Server Component 和 Client Component 怎么划分的？
  A: 原则是"数据获取和权限检查在服务端，交互状态在客户端"。每个页面的 `page.tsx` 是 Server Component，负责检查登录状态、获取数据、重定向。交互逻辑放在 `*Client.tsx` 中，通过 Props 接收服务端传递的数据。

### 9.2 设计模式类

**Q: 你在项目中用了哪些设计模式？**

A: 主要使用了三种设计模式：

**第一，策略模式**。题目提示系统（Hints）采用策略模式，每道题有6个层级的提示策略，用户可以逐级解锁。解题后复盘教练也采用策略模式，根据题目分类（哈希、双指针、动态规划等20种）匹配不同的调试配方（DebugRecipe）。

**第二，模板方法模式**。题目数据结构 `Problem` 定义了通用的字段（标题、代码、复杂度等），同时通过可选字段（`dpSteps?`、`treeFramework?`、`backtrackingTemplate?`）为不同题型注入专属内容框架。

**第三，观察者模式**。`useProgress` Hook 的设计类似于观察者模式：进度数据变更时，所有订阅了该 Hook 的组件都会自动重新渲染。通过 `useCallback` 和 `useMemo` 优化，避免不必要的重渲染。

**可能追问**：
- Q: 策略模式和状态模式的区别？
  A: 策略模式关注的是"算法/行为的互换"，用户主动选择不同的策略。状态模式关注的是"状态驱动的行为变化"，对象的行为随内部状态自动改变。在这个项目中，提示系统是策略模式（用户选择查看哪一级），而调试配方的匹配更接近策略模式的自动分发。

- Q: 如果新增一种题型，需要改哪些文件？
  A: 需要改两个地方：第一，在 `problems.ts` 中为新题目的 `Problem` 对象添加对应的专属字段（如 `dpSteps`）；第二，如果需要新的调试配方，在 `PostSolveCoach.tsx` 的 `categoryDebugRecipes` 中添加新题型的配方。不需要修改框架代码，符合开闭原则。

### 9.3 数据存储类

**Q: JSON 文件存储怎么保证数据一致性？**

A: 采用三层防御策略：

**第一，同步读写**。使用 `readFileSync` / `writeFileSync` 而非异步版本，保证每次读写操作的原子性。Node.js 的同步文件操作在操作系统层面是原子的。

**第二，读时规范化**。每次读取数据库时，都会对所有字段进行规范化处理（`normalizeDB`），包括去重、类型校验、过期清理等。即使数据文件被手动修改或损坏，系统也能自动修复。

**第三，写时规范化**。写入前也经过 `normalizeDB` 处理，保证落盘的数据始终是合法的。

**可能追问**：
- Q: 如果两个用户同时写入怎么办？
  A: 这是 JSON 文件存储的固有缺陷。当前实现中，Node.js 的同步写操作在单进程内是串行的，所以不会出现数据竞争。但如果部署多个实例（如 Kubernetes Pod），就会有问题。解决方案是迁移到支持事务的数据库，或使用文件锁。
  
- Q: 数据文件损坏了怎么办？
  A: `readDB` 函数有 try-catch 兜底。如果 JSON 解析失败，会创建一个新的初始数据库（包含预置账号），然后写入文件覆盖损坏的数据。这意味着损坏会导致用户进度丢失，但不会导致服务不可用。

### 9.4 认证安全类

**Q: 你的认证方案是怎么设计的？**

A: 采用基于 Cookie-Session 的传统认证方案：

**第一，密码存储**。使用 scrypt 算法（Node.js 原生 crypto 模块）对密码进行哈希，每次哈希使用随机16字节盐值，哈希长度64字节。存储格式为 `salt:hash`。

**第二，Session 管理**。登录成功后生成 UUID Token，存储在服务端 JSON 文件中，设置7天过期。Token 通过 HttpOnly Cookie 传递给浏览器。

**第三，请求验证**。每次请求时从 Cookie 读取 Token，查找对应的 Session 记录，检查是否过期。过期的 Session 在验证时自动清理。

**可能追问**：
- Q: 为什么用 scrypt 而不是 bcrypt？
  A: Node.js 原生支持 scrypt，不需要安装额外的 npm 包。scrypt 的设计考虑了内存硬度（memory-hard），相比 bcrypt 更能抵抗 GPU 暴力破解。对于这个项目规模，两者安全性差异不大，但零依赖是选择 scrypt 的主要原因。

- Q: HttpOnly Cookie 能防御什么攻击？
  A: HttpOnly 标记防止 JavaScript 通过 `document.cookie` 读取 Session Token，从而防御 XSS 攻击窃取 Token。SameSite=Lax 标记防止 CSRF 攻击，浏览器不会在跨站请求中携带 Cookie。

- Q: 为什么不用 JWT？
  A: JWT 的优势是无状态验证（服务端不需要存储 Session），但需要处理 Token 刷新、黑名单等问题。对于这个项目，用户量小，有状态的 Session 方案更简单可靠。且 JWT 存在客户端无法主动失效的问题，一旦 Token 泄露，在过期前都可以被使用。

### 9.5 前端架构类

**Q: 你的状态管理是怎么做的？**

A: 采用"Context + 自定义 Hook"的轻量级方案，没有引入 Redux 或 Zustand。

**第一，全局状态**。`AuthContext` 管理登录状态，通过 `useAuth()` Hook 在任何组件中访问。这避免了登录状态的 Prop Drilling。

**第二，业务状态**。`useProgress` Hook 管理学习进度，封装了所有进度相关的操作（标记完成、管理错题本、记录学习天数）。Hook 内部使用 `useState` 管理数据，`useCallback` 缓存操作函数，`useEffect` 在用户变化时重新加载数据。

**第三，乐观更新**。用户操作时先更新本地状态（立即响应UI），同时异步同步到服务端。如果同步失败，显示错误提示但不回滚本地状态（避免用户体验闪烁）。

**可能追问**：
- Q: 为什么不用 Redux？
  A: 项目的状态结构简单（主要是用户信息和学习进度），不需要 Redux 的中间件、时间旅行调试等高级功能。Context + Hook 足以满足需求，且代码量更少、学习成本更低。

- Q: 怎么避免不必要的重渲染？
  A: `useProgress` 的操作函数都用 `useCallback` 包裹，依赖数组只包含必要的值。`HomeClient` 中的推荐题目和最弱阶段用 `useMemo` 缓存计算结果。此外，`AppShell` 的 Sidebar 通过 Props 传递，避免在布局组件中触发不必要的重渲染。

### 9.6 算法数据类

**Q: 100道题的数据是怎么组织的？**

A: 采用三层数据结构：

**第一层：题目基础数据**（`problems.ts`）。每道题包含 LeetCode ID、标题、难度、分类、标签、解题思路、代码、复杂度分析、常见错误等完整信息。数据量约 438KB，包含 100 道题的详细教学内容。

**第二层：学习路径**（`learningPath.ts`）。将 100 道题组织为 17 个学习阶段，每个阶段有名称、描述、题目ID列表、模板、常见错误、学习建议等。

**第三层：精修数据**（`problemRefinements.ts`、`solutionVariants.ts`）。为每道题提供多解法对比、边界用例、手撕步骤、面试检查单等深度内容。

**可能追问**：
- Q: 438KB 的数据直接打包到前端会不会影响加载速度？
  A: 这是一个值得优化的点。当前方案是全量加载，因为题目数据是静态的，打包后可以通过 Next.js 的代码分割和 gzip 压缩减小体积。如果题目数量增长，应该改为按需加载（只加载当前题目的数据）或使用数据库存储。

### 9.7 部署运维类

**Q: 项目的部署方案是什么？**

A: 采用 Docker 单容器部署：

**第一，多阶段构建**。Dockerfile 分三个阶段：deps（安装依赖）→ builder（构建产物）→ runner（最小运行镜像）。最终镜像只包含 Node.js 运行时和 Next.js standalone 输出，体积最小化。

**第二，数据持久化**。通过 Docker Compose 的 `volumes` 将宿主机的 `data` 目录挂载到容器内，确保用户数据在容器重启后不丢失。

**第三，安全配置**。容器内使用非 root 用户（`nextjs:nodejs`）运行进程，遵循最小权限原则。

**可能追问**：
- Q: 如果要支持多实例部署怎么办？
  A: 需要解决两个问题：Session 共享和数据存储。Session 可以迁移到 Redis，数据存储可以迁移到 PostgreSQL。这两个改动相对独立，可以分步进行。

- Q: 怎么做数据备份？
  A: 当前方案是直接备份 `data/users.json` 文件。可以添加定时任务将文件复制到对象存储（如 S3）。如果迁移到数据库，可以使用数据库的原生备份工具。

---

## 十、简历包装

### 10.1 项目描述（简历用）

**LeetCode Hot100 刷题学习平台**

面向算法学习者的在线刷题学习平台，基于 Next.js 16 + React 19 + TypeScript 全栈开发。采用 Server Component + Client Component 混合渲染架构，实现六步渐进式引导学习、多解法对比、错题本与定期复习、学习进度追踪等功能。数据存储采用 JSON 文件 + 读时规范化策略，密码加密使用 scrypt 算法，部署方案为 Docker 多阶段构建。

### 10.2 技术亮点

1. **渐进式学习引擎**：采用策略模式设计6级提示系统，每级提示从读题建模到完整代码递进，用户必须逐级解锁，避免"直接看答案"的学习陷阱
2. **题型专属教学框架**：通过 TypeScript 可选类型实现模板方法模式，为动态规划（五步曲）、二叉树（递归三要素）、回溯（选择-约束-撤销）等不同题型提供专属教学模板
3. **防御性数据层**：每次读取都经过 `normalizeProgress` 规范化，自动修复损坏数据、清理过期Session、校验类型合法性
4. **安全认证体系**：scrypt 密码哈希 + timingSafeEqual 常量时间比较 + HttpOnly Cookie + SameSite 防CSRF + 角色权限控制
5. **20种题型调试配方**：每种算法题型有专属的"定位-修正-再测"调试指南，帮助用户建立系统化的排错思维

### 10.3 可能追问及应对

**Q: 这个项目最大的技术挑战是什么？**

A: 最大的挑战是设计合理的数据规范化策略。由于使用 JSON 文件存储，没有数据库的 schema 约束，数据可能被手动修改或损坏。解决方案是实现一套完整的 `normalizeProgress` 函数，在每次读取时对所有字段进行类型校验、去重、范围限制（如提示层级0-6），确保系统始终运行在合法数据上。这比简单地用 try-catch 更可靠——不仅要防止崩溃，还要保证数据语义正确。

**Q: 如果重新做这个项目，你会怎么改进？**

A: 三个方面的改进：第一，数据存储迁移到 SQLite，解决并发写入问题，并支持更灵活的查询；第二，题目数据改为按需加载，减少首屏加载体积；第三，添加 WebSocket 实现实时学习统计（如在线人数、今日完成数），增强社区感。
