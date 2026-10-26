# Hot100 Learning Assistant

[简体中文](README.md) | [English](README.en.md)

An algorithm learning and review tool organized around LeetCode Hot100: choose problems by stage, work through hints, solutions, and animations, then record your understanding with completion marks, a mistake collection, and notes.

It is designed for learners who have seen an answer but cannot explain it, or who forget problems after solving them. It provides teaching content and progress management; **it neither executes user code nor provides online judging**. Run your implementation locally or on the original problem platform.

[Run](#run-the-project) · [First problem](#complete-your-first-problem-two-sum) · [Accounts](#accounts-and-records) · [Teaching assets](#how-teaching-assets-are-generated) · [Deploy](#deployment-and-backups)

## Run the project

Node.js 22.22+ is recommended, with the project's specified pnpm 10.17.1. The initial setup generates teaching animation assets locally; no model or speech key is needed:

```bash
git clone https://github.com/kayaduster607-jpg/letcode.git
cd letcode
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm install --frozen-lockfile
pnpm generate:videos
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) and sign in with demo username `user01` and password `user123456`.

## Complete your first problem: Two Sum

1. Open “两数之和” (Two Sum) from the learning path or problem list. Read the statement and examples before revealing a full solution.
2. Try `nums = [2, 7, 11, 15]` and `target = 9` on paper or in a local editor. The correct result is the indices `[0, 1]`.
3. Reveal hints gradually when stuck, then compare brute force and a hash table. Advance the animation to inspect each lookup and stored value, and explain why an element cannot be reused.
4. Run your code locally or on the original platform. Return to mark the problem complete; add it to the mistake collection if difficulties remain.
5. Save a note such as “Look up target - x before storing x's index,” then return to the learning page and verify the completion mark, note, and mistake entry.

| Your input in the tool | Page output | Saved result |
| --- | --- | --- |
| Stage, problem, hint, or solution selection | Statement, code, explanations, and step-by-step demonstrations | Current browsing position |
| Completion / mistake marks | Progress statistics and mistake collection | Learning state for the current account |
| Your reasoning and cause of errors | Reviewable problem notes | Personal notes on the server |

The array above is a problem example, not a web code-submission input. A complete learning round means you can explain the solution, your implementation has been checked, and saved state is readable after signing in again.

## Content and learning path

There are 100 problems and 270 solutions across 17 stages. Follow the stages or revisit weak topics through the problem list, search, and mistake collection. Progressive hints offer clues, animations expose state changes, and notes preserve why an error occurred.

![Pages, teaching content, and account storage](docs/assets/architecture.png)

Next.js serves pages, APIs, and assets. Teaching content and account records are separate: source files define problems, while account APIs save practice state. A single application with JSON files is lightweight to deploy, but persistence has no database transactions or cross-process write lock; use a controlled single instance.

## Accounts and records

| Account | Initial password | Purpose |
| --- | --- | --- |
| `user01` through `user10` | `user123456` | Learning, mistakes, and notes |
| `admin` | `admin@123` | Create regular accounts, view data, and reset regular-account passwords |

These are public demo credentials in the source. Before external deployment, change seed passwords in `src/lib/seededAccounts.ts` and initialize with a new empty data directory. Changing seeds does not reset existing accounts. There is no administrator self-service password-change interface, and seeded accounts cannot be deleted through the admin interface.

By default, `data/users.json` stores accounts, sessions, and per-user progress. Set `HOT100_DATA_DIR` for another location. The directory contains private notes and sessions: back it up in full and keep it out of Git.

Session cookies are HttpOnly and SameSite=Lax and last 7 days. Signing out removes the current session. Resetting a regular user's password as admin does not revoke all their old sessions. Public deployment needs HTTPS and appropriate secure-cookie configuration.

## How teaching assets are generated

```bash
pnpm generate:videos
node scripts/audit_hot100_video_pages.mjs ./ship
```

Generated files in `ship/` include click-driven presentation pages, scripts, and manifests. Set `VIDEO_PRESENTATION_ROOT` to adjust the path. Assets are not committed, so generate them after cloning; Docker builds run this step too.

Default demonstrations need no speech service. Optional `scripts/synthesize_hot100_mimo.py` reads `MIMO_API_KEY` from the process environment. Review its arguments, output, and service costs first. The core learning workflow does not depend on it. Keep only files intended for browser access in the asset directory.

## Deployment and backups

With Docker / Compose installed:

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 hot100
```

The service remains on port 3001. Compose mounts `./data` at `/app/data`. Preserve that directory when updating images; do not replace production records with development account data.

For production without Docker:

```bash
pnpm build
pnpm exec next start -p 3001
```

`dev` fixes port 3001, but the original `start` script does not. The explicit parameter above keeps the production address consistent. Pause writes before copying the complete `data/` directory and restore using the same directory.

## Troubleshooting and maintenance

| Issue | Check |
| --- | --- |
| Animation reports missing assets | Run generate:videos and check that the asset root points to ship |
| Old passwords work after changing seeds | Existing users.json is not reset from seeds |
| Progress differs between devices | Use the same server and account |
| Correct code has no judging result | There is no code judge; verify locally or on the original platform |

```bash
pnpm typecheck
pnpm qa:content
pnpm qa:video-assets
pnpm build
```

See `scripts/` for content, teaching-asset, and other checks. Verify problem / solution consistency first, then assets, account persistence, and deployment; merely opening the page is insufficient.
