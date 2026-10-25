import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { User, UserProgress } from '@/types';
import { defaultProgress, normalizeProgress } from './progress';
import { SEEDED_ACCOUNTS } from './seededAccounts';
import { hashPassword } from './password';

// Tests and deployments can isolate account storage without copying live data.
// Account files are runtime volumes and must not be traced into server bundles.
const DATA_DIR = resolve(/* turbopackIgnore: true */ process.env.HOT100_DATA_DIR || resolve(process.cwd(), 'data'));
const DB_FILE = resolve(DATA_DIR, 'users.json');
const SEED_CREATED_AT = '2026-01-01T00:00:00.000Z';
const SEEDED_USER_IDS = new Set(SEEDED_ACCOUNTS.map((account) => account.id));

interface DBData {
  users: User[];
  sessions: Record<string, { userId: string; expiresAt: string }>;
  progress: Record<string, UserProgress>;
}

function createInitialDB(): DBData {
  return ensureSeededAccounts({ users: [], sessions: {}, progress: {} });
}

function ensureDataDir() {
  if (!existsSync(/* turbopackIgnore: true */ DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<User>;
  return (
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.username === 'string' &&
    user.username.length > 0 &&
    typeof user.passwordHash === 'string' &&
    user.passwordHash.length > 0 &&
    (user.role === 'admin' || user.role === 'user') &&
    typeof user.createdAt === 'string'
  );
}

function normalizeUsers(rawUsers: unknown): User[] {
  if (!Array.isArray(rawUsers)) return [];

  const seenIds = new Set<string>();
  const seenUsernames = new Set<string>();
  const users: User[] = [];

  for (const item of rawUsers) {
    if (!isValidUser(item)) continue;
    const usernameKey = item.username.trim().toLowerCase();
    if (seenIds.has(item.id) || seenUsernames.has(usernameKey)) continue;
    seenIds.add(item.id);
    seenUsernames.add(usernameKey);
    users.push({
      ...item,
      username: item.username.trim(),
    });
  }

  return users;
}

function normalizeSessions(rawSessions: unknown, validUserIds: Set<string>): Record<string, { userId: string; expiresAt: string }> {
  if (!rawSessions || typeof rawSessions !== 'object') return {};

  const sessions: Record<string, { userId: string; expiresAt: string }> = {};
  const now = Date.now();

  for (const [token, rawSession] of Object.entries(rawSessions)) {
    if (!rawSession || typeof rawSession !== 'object') continue;
    const session = rawSession as { userId?: unknown; expiresAt?: unknown };
    if (typeof session.userId !== 'string' || !validUserIds.has(session.userId)) continue;
    if (typeof session.expiresAt !== 'string') continue;
    const expiresAtMs = new Date(session.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) continue;
    sessions[token] = { userId: session.userId, expiresAt: session.expiresAt };
  }

  return sessions;
}

function ensureSeededAccounts(data: DBData): DBData {
  const users = [...data.users];
  const progress = { ...data.progress };
  let changed = false;

  for (const account of SEEDED_ACCOUNTS) {
    const usernameKey = account.username.toLowerCase();
    let user = users.find((item) => item.username.toLowerCase() === usernameKey);

    if (!user) {
      user = {
        id: account.id,
        username: account.username,
        passwordHash: hashPassword(account.password),
        role: account.role,
        createdAt: SEED_CREATED_AT,
      };
      users.push(user);
      changed = true;
    }

    if (user.role !== account.role) {
      user.role = account.role;
      changed = true;
    }

    if (!progress[user.id]) {
      progress[user.id] = normalizeProgress(defaultProgress);
      changed = true;
    } else {
      const normalized = normalizeProgress(progress[user.id]);
      progress[user.id] = normalized;
    }
  }

  for (const user of users) {
    progress[user.id] = normalizeProgress(progress[user.id] || defaultProgress);
  }

  const validUserIds = new Set(users.map((user) => user.id));
  const sessions = normalizeSessions(data.sessions, validUserIds);

  return changed ? { users, sessions, progress } : { users, sessions, progress };
}

function normalizeDB(data: Partial<DBData> | null | undefined): DBData {
  const users = normalizeUsers(data?.users);
  const validUserIds = new Set(users.map((user) => user.id));
  const sessions = normalizeSessions(data?.sessions, validUserIds);
  const rawProgress: Record<string, unknown> = data?.progress && typeof data.progress === 'object'
    ? (data.progress as Record<string, unknown>)
    : {};
  const progress: Record<string, UserProgress> = {};

  for (const user of users) {
    progress[user.id] = normalizeProgress(rawProgress[user.id] as Partial<UserProgress> | null | undefined);
  }

  return ensureSeededAccounts({ users, sessions, progress });
}

function readDB(): DBData {
  ensureDataDir();
  if (!existsSync(/* turbopackIgnore: true */ DB_FILE)) {
    const initial = createInitialDB();
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = readFileSync(/* turbopackIgnore: true */ DB_FILE, 'utf-8').replace(/^\uFEFF/, '');
    const normalized = normalizeDB(JSON.parse(raw));
    writeFileSync(DB_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    return normalized;
  } catch {
    const initial = createInitialDB();
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function writeDB(data: DBData) {
  ensureDataDir();
  writeFileSync(DB_FILE, JSON.stringify(normalizeDB(data), null, 2), 'utf-8');
}

// User operations
function normalizeLoginUsername(username: string): string {
  const normalized = username.trim().toLowerCase();
  const shortStudentAccount = normalized.match(/^user([1-9])$/);
  return shortStudentAccount ? `user0${shortStudentAccount[1]}` : normalized;
}

export function findUserByUsername(username: string): User | undefined {
  const normalized = normalizeLoginUsername(username);
  return readDB().users.find((user) => user.username.toLowerCase() === normalized);
}

export function findUserById(id: string): User | undefined {
  return readDB().users.find((user) => user.id === id);
}

export function createUser(user: User): void {
  const db = readDB();
  if (db.users.some((item) => item.username.toLowerCase() === user.username.toLowerCase())) return;
  db.users.push(user);
  db.progress[user.id] = normalizeProgress(defaultProgress);
  writeDB(db);
}

export function getAllUsers(): User[] {
  return readDB().users;
}

export function isSeededUser(userId: string): boolean {
  return SEEDED_USER_IDS.has(userId);
}

export function createManagedUser(username: string, password: string): { ok: boolean; user?: User; reason?: string } {
  const normalizedUsername = normalizeLoginUsername(username);
  const normalizedPassword = password.trim();

  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(normalizedUsername)) {
    return { ok: false, reason: '用户名只能使用 3-24 位字母、数字、下划线或短横线' };
  }

  if (normalizedPassword.length < 6) {
    return { ok: false, reason: '密码至少 6 位' };
  }

  const db = readDB();
  if (db.users.some((item) => item.username.toLowerCase() === normalizedUsername)) {
    return { ok: false, reason: '这个用户名已经存在' };
  }

  const user: User = {
    id: `custom-${crypto.randomUUID()}`,
    username: normalizedUsername,
    passwordHash: hashPassword(normalizedPassword),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.progress[user.id] = normalizeProgress(defaultProgress);
  writeDB(db);
  return { ok: true, user };
}

export function updateUserPassword(userId: string, password: string): { ok: boolean; reason?: string } {
  const db = readDB();
  const user = db.users.find((item) => item.id === userId);
  if (!user) return { ok: false, reason: '用户不存在' };
  if (user.role !== 'user') return { ok: false, reason: '只能修改普通用户密码' };

  user.passwordHash = hashPassword(password);
  writeDB(db);
  return { ok: true };
}

export function deleteManagedUser(userId: string): { ok: boolean; reason?: string } {
  const db = readDB();
  const user = db.users.find((item) => item.id === userId);
  if (!user) return { ok: false, reason: '用户不存在' };
  if (user.role === 'admin') return { ok: false, reason: '不能删除管理员账号' };
  if (isSeededUser(user.id)) return { ok: false, reason: '预置账号不能删除，可以修改密码' };

  db.users = db.users.filter((item) => item.id !== user.id);
  delete db.progress[user.id];

  for (const [token, session] of Object.entries(db.sessions)) {
    if (session.userId === user.id) {
      delete db.sessions[token];
    }
  }

  writeDB(db);
  return { ok: true };
}

// Session operations
export function createSession(userId: string): string {
  const db = readDB();
  if (!db.users.some((user) => user.id === userId)) {
    throw new Error('Cannot create session for unknown user');
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.sessions[token] = { userId, expiresAt };
  writeDB(db);
  return token;
}

export function getSession(token: string): { userId: string } | null {
  const db = readDB();
  const session = db.sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    delete db.sessions[token];
    writeDB(db);
    return null;
  }
  return { userId: session.userId };
}

export function deleteSession(token: string): void {
  const db = readDB();
  delete db.sessions[token];
  writeDB(db);
}

// Progress operations
export function getProgress(userId: string): UserProgress {
  const db = readDB();
  const userExists = db.users.some((user) => user.id === userId);
  if (!userExists) return normalizeProgress(defaultProgress);

  const progress = normalizeProgress(db.progress[userId] || defaultProgress);
  if (!db.progress[userId]) {
    db.progress[userId] = progress;
    writeDB(db);
  }
  return progress;
}

export function saveProgress(userId: string, progress: UserProgress): void {
  const db = readDB();
  if (!db.users.some((user) => user.id === userId)) return;
  db.progress[userId] = normalizeProgress(progress);
  writeDB(db);
}

export function getAllProgress(): Record<string, UserProgress> {
  return readDB().progress;
}
