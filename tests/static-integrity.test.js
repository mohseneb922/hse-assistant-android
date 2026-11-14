import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../www/app.js', import.meta.url), 'utf8');
const db = await readFile(new URL('../www/db-init.js', import.meta.url), 'utf8');
const data = await readFile(new URL('../www/hse-data.js', import.meta.url), 'utf8');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const fileSaver = await readFile(new URL('../scripts/configure-hse-file-saver.py', import.meta.url), 'utf8');

function listFrom(source, expression) {
  const match = source.match(expression);
  assert.ok(match, 'module registry must exist');
  return [...match[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

const appModules = listFrom(app, /const MK=\[(.*?)\];/s);
const dbModules = listFrom(db, /const MODULE_KEYS = \[(.*?)\];/s);

 test('application and SQLite module registries stay identical', () => {
  assert.deepEqual(appModules, dbModules);
  assert.equal(new Set(appModules).size, appModules.length, 'module IDs must be unique');
});

test('all extended HSE registers are represented in the UI and backup validator', () => {
  const extended = ['cmp','cw','acc','emg','inv','hyg','erg','asn','fac','doc','aud','logs','kit','drill','meeting'];
  const backupRegistry = data.match(/const ARRAY_KEYS = \[(.*?)\];/s)?.[1] || '';
  assert.match(app, /function validBackup\(x\)\{return window\.HSE_VALIDATE_BACKUP_STATE/);
  for (const id of extended) {
    assert.ok(app.includes(`M.${id}=`), `missing form definition: ${id}`);
    assert.ok(app.includes(`${id}:()=>`), `missing page: ${id}`);
    assert.ok(app.includes(`['${id}',`), `missing navigation item: ${id}`);
    assert.ok(backupRegistry.includes(`"${id}"`), `missing backup validation key: ${id}`);
  }
});

test('SQLite persistence updates only changed module snapshots transactionally', () => {
  assert.match(db, /persistedModules\.get\(module\) === snapshot/);
  assert.match(db, /executeSet\(operations, true\)/);
  assert.doesNotMatch(db, /DROP TABLE/i);
});

test('sensitive medical data and PIN limitations are disclosed in the interface', () => {
  assert.match(app, /محرمانگی اطلاعات پزشکی/);
  assert.match(app, /PIN رمزنگاری یا احراز هویت امن نیست/);
  assert.match(app, /پایگاه داده SQLite راه‌اندازی نشده است/);
});

test('restore waits for persistence and can roll back browser storage on failure', () => {
  assert.match(app, /async function restoreTextBackup\(\).*?await applyBackupState/s);
  assert.match(app, /localStorage\.setItem\(K,JSON\.stringify\(previous\)\)/);
  assert.match(app, /await sv\(\);m\.style\.display='none'/);
});

test('Capacitor Android, SQLite, and native Storage Access Framework backup are configured', () => {
  for (const name of ['@capacitor/core','@capacitor/android','@capacitor-community/sqlite']) {
    assert.ok(pkg.dependencies[name], `missing dependency ${name}`);
  }
  assert.match(db, /registerPlugin\('HSEFileSaver'\)/);
  assert.match(db, /HSEFileSaver\.saveFile/);
  assert.match(fileSaver, /Intent\.ACTION_CREATE_DOCUMENT/);
  assert.match(fileSaver, /import androidx\.activity\.result\.ActivityResult;/, 'Capacitor 6 callback must use AndroidX ActivityResult');
  assert.match(fileSaver, /registerPlugin\(HSEFileSaverPlugin\.class\)/);
  assert.ok(!pkg.dependencies['@capacitor/filesystem'], 'obsolete filesystem dependency should stay removed');
  assert.ok(!pkg.dependencies['@capacitor/share'], 'obsolete share dependency should stay removed');
});
