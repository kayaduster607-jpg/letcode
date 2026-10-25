# 发布验证记录

日期：2026-10-25。

## 验证结果

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 锁文件安装 | 通过 | pnpm 10.17.1，安装在独立发布副本 |
| TypeScript | 通过 | `tsc --noEmit`，生产构建亦执行类型检查 |
| 教学内容 QA | 通过 | 100 道题、100 份精修、17 阶段完整覆盖、270 种解法 |
| Python 内容 QA | 通过 | 题目和精修代码按 Python 3.9 AST 规则解析 |
| Python 兼容性脚本 | 通过 | 570 段教学代码片段，通过现有语法及已列举 API 规则检查 |
| 动画生成与静态检查 | 通过 | 生成 100 套页面，审计脚本报告 100 页、0 个问题 |
| 视频资源边界 | 通过 | 30 项检查，含隐藏配置、敏感文件名、扩展名和路径边界 |
| 真实 HTTP 验证 | 通过 | 33 项检查，使用临时数据目录和本机临时端口 |
| 生产构建 | 通过 | Next.js 16.4.1 Turbopack，构建完成，114 个静态生成任务完成 |
| 依赖审计 | 通过 | 最终锁文件 0 条已知漏洞告警 |
| Compose 配置 | 通过 | 显式传入空 env 配置，`docker compose config --quiet` 成功 |
| 架构图 | 通过 | SVG 导出 1800 × 1060 PNG，检查文字、边界、连线与 README 缩放显示 |

## 实际环境

- Windows，Node.js 22.22.2，pnpm 10.17.1。
- Next.js 16.4.1，React/React DOM 19.2.6，TypeScript 6.0.3，Tailwind CSS 4.3.0。
- Python 3.13.5 用于 AST 静态分析，不代表实际使用 Python 3.9 执行全部代码。
- Docker 客户端 29.2.1；本机 Docker Engine 未运行。

## HTTP 检查的主要行为

- 未登录用户不能读取学习进度，公开注册与管理员初始化接口拒绝请求。
- 正确/错误密码分支、HttpOnly/SameSite 会话 Cookie、退出后的会话失效。
- 普通账号不能访问管理员接口，初始账号数量为 11。
- 进度按当前 Session 用户保存，过滤非法题号、重复题号和超范围提示层级；客户端提交其他用户 ID 不会改变保存目标。
- 管理员可以创建、重置密码并删除自建普通账号，预置账号受删除限制。
- 学习页面、生成的动画 HTML 和 JavaScript 正常返回。
- 视频目录中的隐藏配置与非公开内容在文件访问前拒绝。

`scripts/verify_http.mjs` 将 `HOT100_DATA_DIR` 设置为临时目录，独立启动构建后的服务。测试后关闭子进程，验证临时目录边界再清理；没有使用原目录 `data/users.json`，也没有读取任何 env 文件。

## 本次发布修复

1. 更新安全修复依赖，并将覆盖配置放到 pnpm 实际识别的 `pnpm.overrides`。
2. 将动画生成加入包脚本与 Docker 构建流程，解决原 Dockerfile 复制不存在的 `ship` 目录的问题。
3. 新增统一的视频资源路径策略，移除 API 对本机桌面路径的默认依赖。
4. 增加隔离账号数据目录配置，避免验证脚本触碰真实数据。
5. 可选 TTS 脚本仅使用进程环境变量中的密钥，生成目录改为项目相对路径。
6. 增加 Git 与 Docker 忽略规则、中文 README、架构图及密钥检查说明。

## 未验证范围

- 因本机 Docker Engine 未运行，没有执行容器镜像构建或容器内 HTTP 测试；已验证生成步骤、应用构建与 Compose 配置。
- 没有逐题在 LeetCode 执行全部 Python 解法，没有据此声明全部题解运行正确。
- 动画检查是脚本静态检查，没有逐帧人工审阅全部 100 套动画。
- 没有调用 MiMo TTS，没有验证音色、语音质量或外部模型接口可用性。
- 没有进行并发写入、负载、渗透或正式数据恢复测试。

## 复现

```bash
pnpm install --frozen-lockfile
pnpm generate:videos
pnpm typecheck
pnpm qa:content
pnpm qa:python
pnpm qa:video-assets
node scripts/audit_hot100_video_pages.mjs ./ship
pnpm audit --audit-level moderate
pnpm build
node scripts/verify_http.mjs
```

`docs/` 中其他文档保留了历史版本的功能与迭代记录；当前安装命令、资源路径和发布验证范围以本次 README 与本记录为准。
