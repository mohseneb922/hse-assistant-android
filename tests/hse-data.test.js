import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  migrateState,
  validateBackupState
} from "../www/hse-data.js";

test("new installations receive generic editable company catalogs", () => {
  const state = migrateState({});
  assert.ok(state.cfg.departments.some(item => item.name === "تولید"));
  assert.ok(state.cfg.departments.some(item => item.name === "حراست"));
  assert.ok(state.cfg.activities.length > 0);
  assert.ok(state.cfg.trainingCourses.length > 0);
  assert.ok(state.cfg.inspectionTemplates.every(item => Array.isArray(item.items)));
  assert.ok(state.cfg.departments.every(item => item.active === true));
});

test("migration preserves existing operational records and custom catalogs", () => {
  const old = {
    inc: [{ id: "incident-1", d: "2026-11-01", s: "ثبت قدیمی" }],
    pr: [{ id: "person-1", n: "کارمند", un: "واحد قدیمی", st: "فعال" }],
    cfg: {
      departments: [{ id: "d-1", name: "بخش سفارشی", active: true }],
      activities: [{ id: "a-1", name: "فعالیت سفارشی", active: true }]
    }
  };
  const state = migrateState(old);
  assert.equal(state.inc[0].id, "incident-1");
  assert.ok(state.cfg.departments.some(item => item.name === "بخش سفارشی"));
  assert.ok(state.cfg.departments.some(item => item.name === "واحد قدیمی" && item.active === false));
  assert.ok(state.cfg.activities.some(item => item.name === "فعالیت سفارشی"));
});

test("legacy audit event records are preserved in the event log", () => {
  const state = migrateState({
    aud: [{ id: "event-1", ty: "ویرایش", md: "حادثه" }]
  });
  assert.equal(state.aud.length, 0);
  assert.equal(state.logs.length, 1);
  assert.equal(state.logs[0].id, "event-1");
  assert.equal(state.logs[0].legacySource, "aud");
});

test("modern audit records are not mistaken for legacy event logs", () => {
  const state = migrateState({
    cfg: { version: 1 },
    aud: [{ id: "audit-1", title: "ممیزی داخلی" }]
  });
  assert.equal(state.aud.length, 1);
  assert.equal(state.logs.length, 0);
});

test("legacy combined meetings and drills are split while preserving IDs", () => {
  const state = migrateState({
    mn: [
      { id: "old-drill", ty: "مانور تخلیه", d: "2026-10-01" },
      { id: "old-meeting", ty: "جلسه کمیته", d: "2026-10-02" }
    ]
  });
  assert.equal(state.mn.length, 0);
  assert.equal(state.drill[0].id, "old-drill");
  assert.equal(state.meeting[0].id, "old-meeting");
  assert.equal(state.drill[0].legacySource, "mn");
});

test("new module arrays and helper objects are initialized without overwriting data", () => {
  const state = migrateState({ kit: [{ id: "kit-1", name: "گاز استریل" }], hr: { "j1405-08": 120 } });
  assert.equal(state.kit[0].id, "kit-1");
  assert.equal(state.hr["j1405-08"], 120);
  assert.ok(Array.isArray(state.drill));
  assert.ok(Array.isArray(state.meeting));
  assert.ok(Array.isArray(state.logs));
});

test("backup validation accepts old backups and rejects malformed new structures", () => {
  assert.ok(validateBackupState({ inc: [], aud: [] }));
  assert.equal(validateBackupState({ inc: "not-an-array" }), null);
  assert.equal(validateBackupState({ cfg: [] }), null);
  assert.ok(validateBackupState({ app: "HSE-Assistant", data: { cfg: DEFAULT_SETTINGS, kit: [] } }));
});

test("migration is idempotent for an already migrated state", () => {
  const once = migrateState({ aud: [{ id: "old-event" }] });
  const twice = migrateState(once);
  assert.deepEqual(twice, once);
});
