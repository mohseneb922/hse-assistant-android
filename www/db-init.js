import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

window.HSE_DB_MODE = Capacitor.isNativePlatform() ? 'native-sqlite' : 'browser-local';
const DB_NAME = 'hse_assistant';
const STORAGE_KEY = 'hse_personal_v1';
const MODULE_KEYS = ['inc','act','ext','ins','ert','gz','tr','bm','pr','md','cr','pl','mc','pw','mn','rk','pe','wm','ct','rq','cmp','cw','acc','emg','inv','hyg','erg','asn','fac','doc','aud'];
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const safeJson = (value, fallback = null) => {
  try { return JSON.parse(value); } catch { return fallback; }
};

async function setupSQLite() {
  if (!Capacitor.isNativePlatform()) return null;
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  await sqlite.checkConnectionsConsistency();
  const exists = await sqlite.isConnection(DB_NAME, false);
  const db = exists.result
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  await db.open();

  await db.execute(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workshops (
      id TEXT PRIMARY KEY NOT NULL,
      company_id TEXT,
      name TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY NOT NULL,
      personnel_code TEXT,
      full_name TEXT,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS module_records (
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      record_date TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      PRIMARY KEY(module, record_id)
    );
    CREATE INDEX IF NOT EXISTS idx_module_records_date ON module_records(module, record_date);
    CREATE INDEX IF NOT EXISTS idx_module_records_updated ON module_records(updated_at);
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      file_name TEXT,
      mime_type TEXT,
      local_uri TEXT,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      operation TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      action TEXT NOT NULL,
      module TEXT,
      record_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const stateResult = await db.query('SELECT payload FROM app_state WHERE id = 1');
  let initialState = stateResult.values?.length ? safeJson(stateResult.values[0].payload) : null;
  const persistedModules = new Map();
  if (!initialState) {
    // One-time migration from the previous browser-based version.
    initialState = safeJson(localStorage.getItem(STORAGE_KEY));
    if (initialState) await persistState(db, initialState, persistedModules, true);
  }
  if (initialState && typeof initialState === 'object' && !Array.isArray(initialState)) {
    for (const module of MODULE_KEYS) {
      persistedModules.set(module, JSON.stringify(Array.isArray(initialState[module]) ? initialState[module] : []));
    }
  }
  return {
    initialState,
    async saveState(payload) {
      const state = safeJson(payload);
      if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Invalid application state');
      await persistState(db, state, persistedModules, false);
    },
    async getCounts() {
      const result = await db.query('SELECT module, COUNT(*) AS count FROM module_records WHERE deleted_at IS NULL GROUP BY module');
      return result.values || [];
    },
    async close() { await db.close(); }
  };
}

async function persistState(db, state, persistedModules, forceAll = false) {
  const now = new Date().toISOString();
  const operations = [
    { statement: 'INSERT OR REPLACE INTO app_state(id,payload,updated_at) VALUES(1,?,?)', values: [JSON.stringify(state), now] }
  ];
  const changedSnapshots = [];
  for (const module of MODULE_KEYS) {
    const rows = Array.isArray(state[module]) ? state[module] : [];
    const snapshot = JSON.stringify(rows);
    if (!forceAll && persistedModules.get(module) === snapshot) continue;
    // Rewrite only modules whose content changed, not the entire database on every save.
    operations.push({ statement: 'DELETE FROM module_records WHERE module = ?', values: [module] });
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const id = String(row.id ?? `${module}-${operations.length}`);
      const date = row.d || row.dt || row.date || null;
      const rawVersion = Number(row.version);
      const version = Number.isInteger(rawVersion) && rawVersion > 0 ? rawVersion : 1;
      operations.push({
        statement: `INSERT OR REPLACE INTO module_records(module,record_id,payload,record_date,version,updated_at,deleted_at)
                    VALUES(?,?,?,?,?,?,NULL)`,
        values: [module, id, JSON.stringify(row), date ? String(date) : null, version, now]
      });
    }
    changedSnapshots.push([module, snapshot]);
  }

  operations.push({ statement: 'INSERT OR REPLACE INTO app_meta(key,value) VALUES(?,?)', values: ['schema_version', '2'] });
  try {
    // executeSet with transaction=true makes the state and changed module indexes atomic.
    await db.executeSet(operations, true);
    for (const [module, snapshot] of changedSnapshots) persistedModules.set(module, snapshot);
  } catch (error) {
    throw error;
  }
}

try {
  window.HSE_DB = await setupSQLite();
} catch (error) {
  console.error('SQLite initialization failed:', error);
  window.HSE_DB = null;
  window.HSE_DB_ERROR = String(error?.message || error);
}

window.HSE_FILES = {
  async exportFile(name, payload, mimeType = 'application/octet-stream') {
    if (!Capacitor.isNativePlatform()) throw new Error('Native file export unavailable');
    const saved = await Filesystem.writeFile({
      path: name,
      data: payload,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true
    });
    await Share.share({ title: 'دستیار HSE', text: `فایل خروجی (${mimeType})`, url: saved.uri, dialogTitle: 'ذخیره یا ارسال فایل' });
    return saved;
  },
  async exportJson(name, payload) { return this.exportFile(name, payload, 'application/json'); }
};

const script = document.createElement('script');
script.src = './app.js';
script.onerror = () => {
  const boot = document.getElementById('hse-boot');
  if (boot) boot.textContent = 'بارگذاری برنامه ناموفق بود. برنامه را ببندید و دوباره اجرا کنید.';
};
document.body.appendChild(script);
