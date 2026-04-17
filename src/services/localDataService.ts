import { AppUser } from '../types/auth';

export interface SessionRecord {
  uid: string;
  wpm: number;
  accuracy: number;
  timestamp: number;
  testLength: number;
}

export interface UserMetrics {
  avgWpm: number;
  maxWpm: number;
  avgAccuracy: number;
  totalTests: number;
  lastUpdated: number;
}

const STORAGE_KEYS = {
  user: 'braintype.user',
  accounts: 'braintype.accounts',
  sessions: 'braintype.sessions',
  metrics: 'braintype.metrics',
};

type MetricsByUser = Record<string, UserMetrics>;

interface StoredAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUser(): AppUser | null {
  return readJson<AppUser | null>(STORAGE_KEYS.user, null);
}

export function setStoredUser(user: AppUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user);
    return;
  }
  writeJson(STORAGE_KEYS.user, user);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAccounts() {
  return readJson<StoredAccount[]>(STORAGE_KEYS.accounts, []);
}

function setAccounts(accounts: StoredAccount[]) {
  writeJson(STORAGE_KEYS.accounts, accounts);
}

function generateAccountId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toAppUser(account: StoredAccount): AppUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  };
}

export function registerWithEmailPassword(email: string, password: string, name?: string): AppUser {
  const normalizedEmail = normalizeEmail(email);
  const safePassword = password.trim();

  if (!normalizedEmail || !safePassword) {
    throw new Error('Email and password are required.');
  }

  if (safePassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const accounts = getAccounts();
  const exists = accounts.some((account) => account.email === normalizedEmail);
  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const account: StoredAccount = {
    id: generateAccountId(),
    email: normalizedEmail,
    password: safePassword,
    name: (name || normalizedEmail.split('@')[0]).trim(),
    createdAt: Date.now(),
  };

  accounts.push(account);
  setAccounts(accounts);
  return toAppUser(account);
}

export function loginWithEmailPassword(email: string, password: string): AppUser {
  const normalizedEmail = normalizeEmail(email);
  const safePassword = password.trim();
  const account = getAccounts().find((entry) => entry.email === normalizedEmail);

  if (!account || account.password !== safePassword) {
    throw new Error('Invalid email or password.');
  }

  return toAppUser(account);
}

export function addSession(record: SessionRecord) {
  const sessions = readJson<SessionRecord[]>(STORAGE_KEYS.sessions, []);
  sessions.push(record);
  writeJson(STORAGE_KEYS.sessions, sessions);
}

export function getSessionsByUser(uid: string): SessionRecord[] {
  const sessions = readJson<SessionRecord[]>(STORAGE_KEYS.sessions, []);
  return sessions
    .filter((session) => session.uid === uid)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function updateMetricsForSession(uid: string, wpm: number, accuracy: number) {
  const metricsMap = readJson<MetricsByUser>(STORAGE_KEYS.metrics, {});
  const existing = metricsMap[uid];
  const now = Date.now();

  if (!existing) {
    metricsMap[uid] = {
      avgWpm: wpm,
      maxWpm: wpm,
      avgAccuracy: accuracy,
      totalTests: 1,
      lastUpdated: now,
    };
  } else {
    const newTotal = existing.totalTests + 1;
    metricsMap[uid] = {
      avgWpm: (existing.avgWpm * existing.totalTests + wpm) / newTotal,
      maxWpm: Math.max(existing.maxWpm, wpm),
      avgAccuracy: (existing.avgAccuracy * existing.totalTests + accuracy) / newTotal,
      totalTests: newTotal,
      lastUpdated: now,
    };
  }

  writeJson(STORAGE_KEYS.metrics, metricsMap);
}

export function getUserMetrics(uid: string): UserMetrics | null {
  const metricsMap = readJson<MetricsByUser>(STORAGE_KEYS.metrics, {});
  return metricsMap[uid] || null;
}