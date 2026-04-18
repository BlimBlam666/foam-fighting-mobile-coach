import { describe, expect, it } from 'vitest'
import {
  APP_SCHEMA_VERSION,
  SESSION_LOG_SCHEMA_VERSION,
  createSessionLog,
  mergeImportedAppData,
  migrateLegacyLogArray,
  parseImportedAppDataJson,
  updateSessionLog,
  validateSessionLog,
} from '../dataModel.js'
import { baseLogInput, makeAppData, makeLog } from './testUtils.js'

describe('session log validation and parsing', () => {
  it('defaults new users to Week 1 with no logs', () => {
    const appData = makeAppData()

    expect(appData.settings.selectedWeek).toBe('Week 1')
    expect(appData.logs).toEqual([])
    expect(appData.settings.demoMode).toBe(false)
  })

  it('creates logs with stable ids, timestamps, and schema version', () => {
    const log = createSessionLog(baseLogInput, {
      id: 'log_fixed',
      now: '2026-04-17T12:00:00.000Z',
    })

    expect(log).toMatchObject({
      id: 'log_fixed',
      schemaVersion: SESSION_LOG_SCHEMA_VERSION,
      createdAt: '2026-04-17T12:00:00.000Z',
      updatedAt: '2026-04-17T12:00:00.000Z',
      date: '2026-04-17',
    })
    expect(validateSessionLog(log)).toEqual({ ok: true, value: log })
  })

  it('rejects invalid session log fields clearly', () => {
    expect(() => createSessionLog({ ...baseLogInput, energy: 99 })).toThrow('energy must be <= 10')
    expect(() => createSessionLog({ ...baseLogInput, success: 'Maybe' })).toThrow('success must be "Yes" or "No"')
  })

  it('rejects empty, invalid, and unsupported imported data', () => {
    expect(parseImportedAppDataJson('').errors).toContain('import file is empty')
    expect(parseImportedAppDataJson('{oops').errors).toContain('import file is not valid JSON')
    expect(parseImportedAppDataJson(JSON.stringify({ schemaVersion: 999 })).errors).toContain('unsupported AppData schemaVersion: 999')
  })

  it('migrates AppData v1 settings into the Olympic schedule contract', () => {
    const appData = makeAppData([makeLog()])
    const parsed = parseImportedAppDataJson(JSON.stringify({
      ...appData,
      schemaVersion: 1,
      settings: {
        selectedWeek: 'Week 2',
        demoMode: false,
        onboardingCompleted: true,
      },
    }))

    expect(parsed.ok).toBe(true)
    expect(parsed.migrated).toBe(true)
    expect(parsed.value.schemaVersion).toBe(APP_SCHEMA_VERSION)
    expect(parsed.value.logs[0].schemaVersion).toBe(SESSION_LOG_SCHEMA_VERSION)
    expect(parsed.value.logs[0].cleanReps).toBe(null)
    expect(parsed.value.settings.scheduleTemplate).toBe('standardOlympic')
    expect(parsed.value.settings.customSchedule.Wednesday).toBe('tacticalIq')
  })

  it('creates structured Olympic metric fields on new logs', () => {
    const log = createSessionLog({
      ...baseLogInput,
      attempts: '80',
      successes: '72',
      cleanReps: '70',
      sparWins: '',
      mistakeCount: '4',
    })

    expect(log).toMatchObject({
      schemaVersion: SESSION_LOG_SCHEMA_VERSION,
      attempts: 80,
      successes: 72,
      cleanReps: 70,
      sparWins: null,
      mistakeCount: 4,
    })
  })
})

describe('migration behavior', () => {
  it('migrates legacy log arrays into AppData', () => {
    const migrated = migrateLegacyLogArray([baseLogInput])

    expect(migrated.ok).toBe(true)
    expect(migrated.migrated).toBe(true)
    expect(migrated.value.schemaVersion).toBe(APP_SCHEMA_VERSION)
    expect(migrated.value.metadata.migratedFrom).toBe('legacy-session-log-array')
    expect(migrated.value.logs[0]).toMatchObject({
      id: 'legacy_20260417_1',
      schemaVersion: SESSION_LOG_SCHEMA_VERSION,
      createdAt: '2026-04-17T12:00:00.000Z',
      updatedAt: '2026-04-17T12:00:00.000Z',
    })
  })

  it('rejects corrupt legacy logs instead of partially migrating', () => {
    const migrated = migrateLegacyLogArray([{ ...baseLogInput, mainDrill: '' }])

    expect(migrated.ok).toBe(false)
    expect(migrated.errors[0]).toContain('missing required fields: mainDrill')
  })
})

describe('log editing and import merge behavior', () => {
  it('updates a log while preserving id, createdAt, and schemaVersion', () => {
    const existing = makeLog({}, { id: 'log_edit', createdAt: '2026-04-17T10:00:00.000Z', updatedAt: '2026-04-17T10:00:00.000Z' })
    const updated = updateSessionLog(
      existing,
      { ...baseLogInput, duration: 60, result: '88' },
      { updatedAt: '2026-04-18T10:00:00.000Z' },
    )

    expect(updated.id).toBe(existing.id)
    expect(updated.createdAt).toBe(existing.createdAt)
    expect(updated.schemaVersion).toBe(existing.schemaVersion)
    expect(updated.updatedAt).toBe('2026-04-18T10:00:00.000Z')
    expect(updated.duration).toBe(60)
    expect(updated.result).toBe('88')
  })

  it('rejects invalid edits through the same validation rules', () => {
    const existing = makeLog({}, { id: 'log_edit_invalid' })

    expect(() => updateSessionLog(existing, { ...baseLogInput, confidence: -1 })).toThrow('confidence must be >= 0')
  })

  it('merges imported logs by id and keeps the newest conflict', () => {
    const currentOld = makeLog({ result: '50' }, { id: 'log_same', updatedAt: '2026-04-17T10:00:00.000Z' })
    const importedNew = makeLog({ result: '90' }, { id: 'log_same', updatedAt: '2026-04-18T10:00:00.000Z' })
    const importedFresh = makeLog({ problem: 'Too upright' }, { id: 'log_new', updatedAt: '2026-04-18T11:00:00.000Z' })

    const merged = mergeImportedAppData(makeAppData([currentOld]), makeAppData([importedNew, importedFresh]))

    expect(merged.ok).toBe(true)
    expect(merged.summary).toMatchObject({ imported: 2, merged: 2, skipped: 0, rejected: 0, replaced: 1 })
    expect(merged.appData.logs).toHaveLength(2)
    expect(merged.appData.logs.find((log) => log.id === 'log_same').result).toBe('90')
  })

  it('skips older imported conflicts without duplicating ids', () => {
    const currentNew = makeLog({ result: '90' }, { id: 'log_same', updatedAt: '2026-04-18T10:00:00.000Z' })
    const importedOld = makeLog({ result: '40' }, { id: 'log_same', updatedAt: '2026-04-17T10:00:00.000Z' })

    const merged = mergeImportedAppData(makeAppData([currentNew]), makeAppData([importedOld]))

    expect(merged.ok).toBe(true)
    expect(merged.summary).toMatchObject({ imported: 1, merged: 0, skipped: 1, rejected: 0, replaced: 0 })
    expect(merged.appData.logs).toHaveLength(1)
    expect(merged.appData.logs[0].result).toBe('90')
  })
})
