import { createScheduleFromTemplate, defaultScheduleTemplateId, normalizeSchedule, scheduleTemplates } from './trainingData.js'

export const APP_SCHEMA_VERSION = 3
export const SESSION_LOG_SCHEMA_VERSION = 2
export const STORAGE_KEY = 'foam-fighter-app-data-v1'
export const LEGACY_LOGS_STORAGE_KEY = 'foam-fighter-session-logs'

export function createId(prefix = 'log') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function createDefaultSettings() {
  return {
    selectedWeek: 'Week 2',
    demoMode: false,
    onboardingCompleted: false,
    scheduleTemplate: defaultScheduleTemplateId,
    customSchedule: createScheduleFromTemplate(defaultScheduleTemplateId),
  }
}

export function createEmptyAppData() {
  const now = nowIso()
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    logs: [],
    settings: createDefaultSettings(),
    metadata: {
      appName: 'Foam Fighter Mobile Coach',
      createdAt: now,
      updatedAt: now,
      exportedAt: null,
      migratedFrom: null,
    },
  }
}

export function createSessionLog(input, options = {}) {
  const now = options.now || nowIso()
  const log = {
    id: options.id || createId('log'),
    schemaVersion: SESSION_LOG_SCHEMA_VERSION,
    createdAt: options.createdAt || now,
    updatedAt: options.updatedAt || now,
    date: input.date,
    day: input.day,
    focus: input.focus,
    duration: Number(input.duration),
    mainDrill: input.mainDrill,
    metricType: input.metricType,
    result: String(input.result),
    success: input.success,
    energy: Number(input.energy),
    confidence: Number(input.confidence),
    win: input.win,
    problem: input.problem,
    attempts: optionalNumber(input.attempts),
    successes: optionalNumber(input.successes),
    cleanReps: optionalNumber(input.cleanReps),
    sparWins: optionalNumber(input.sparWins),
    sparLosses: optionalNumber(input.sparLosses),
    conditioningRoundsSurvived: optionalNumber(input.conditioningRoundsSurvived),
    mistakeCount: optionalNumber(input.mistakeCount),
    tournamentPlacement: optionalNumber(input.tournamentPlacement),
  }

  const result = validateSessionLog(log)
  if (!result.ok) {
    throw new Error(`Invalid session log: ${result.errors.join('; ')}`)
  }

  return log
}

export function updateSessionLog(existingLog, input, options = {}) {
  const existingValidation = validateSessionLog(existingLog)
  if (!existingValidation.ok) {
    throw new Error(`Cannot update invalid session log: ${existingValidation.errors.join('; ')}`)
  }

  const updatedAt = options.updatedAt || nowIso()
  const log = {
    id: existingLog.id,
    schemaVersion: existingLog.schemaVersion,
    createdAt: existingLog.createdAt,
    updatedAt,
    date: input.date,
    day: input.day,
    focus: input.focus,
    duration: Number(input.duration),
    mainDrill: input.mainDrill,
    metricType: input.metricType,
    result: String(input.result),
    success: input.success,
    energy: Number(input.energy),
    confidence: Number(input.confidence),
    win: input.win,
    problem: input.problem,
    attempts: optionalNumber(input.attempts),
    successes: optionalNumber(input.successes),
    cleanReps: optionalNumber(input.cleanReps),
    sparWins: optionalNumber(input.sparWins),
    sparLosses: optionalNumber(input.sparLosses),
    conditioningRoundsSurvived: optionalNumber(input.conditioningRoundsSurvived),
    mistakeCount: optionalNumber(input.mistakeCount),
    tournamentPlacement: optionalNumber(input.tournamentPlacement),
  }

  const result = validateSessionLog(log)
  if (!result.ok) {
    throw new Error(`Invalid edited session log: ${result.errors.join('; ')}`)
  }

  return log
}

export function validateSessionLog(log) {
  const errors = []

  if (!isPlainObject(log)) errors.push('log must be an object')
  if (errors.length) return { ok: false, errors }

  requireString(log, 'id', errors)
  requireNumber(log, 'schemaVersion', errors, SESSION_LOG_SCHEMA_VERSION)
  requireIsoString(log, 'createdAt', errors)
  requireIsoString(log, 'updatedAt', errors)
  requireDateString(log, 'date', errors)
  requireString(log, 'day', errors)
  requireString(log, 'focus', errors)
  requireFiniteNumber(log, 'duration', errors, { min: 0 })
  requireString(log, 'mainDrill', errors)
  requireString(log, 'metricType', errors)
  requireString(log, 'result', errors)
  if (log.success !== 'Yes' && log.success !== 'No') errors.push('success must be "Yes" or "No"')
  requireFiniteNumber(log, 'energy', errors, { min: 0, max: 10 })
  requireFiniteNumber(log, 'confidence', errors, { min: 0, max: 10 })
  requireString(log, 'win', errors)
  requireString(log, 'problem', errors)
  validateOptionalNumber(log, 'attempts', errors, { min: 0 })
  validateOptionalNumber(log, 'successes', errors, { min: 0 })
  validateOptionalNumber(log, 'cleanReps', errors, { min: 0 })
  validateOptionalNumber(log, 'sparWins', errors, { min: 0 })
  validateOptionalNumber(log, 'sparLosses', errors, { min: 0 })
  validateOptionalNumber(log, 'conditioningRoundsSurvived', errors, { min: 0 })
  validateOptionalNumber(log, 'mistakeCount', errors, { min: 0 })
  validateOptionalNumber(log, 'tournamentPlacement', errors, { min: 1 })

  if (typeof log.attempts === 'number' && typeof log.successes === 'number' && log.successes > log.attempts) {
    errors.push('successes must be <= attempts')
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: log }
}

export function validateAppData(data) {
  const errors = []

  if (!isPlainObject(data)) errors.push('app data must be an object')
  if (errors.length) return { ok: false, errors }

  requireNumber(data, 'schemaVersion', errors, APP_SCHEMA_VERSION)
  if (!Array.isArray(data.logs)) errors.push('logs must be an array')
  if (!isPlainObject(data.settings)) errors.push('settings must be an object')
  if (!isPlainObject(data.metadata)) errors.push('metadata must be an object')

  if (isPlainObject(data.settings)) {
    requireString(data.settings, 'selectedWeek', errors)
    if (typeof data.settings.demoMode !== 'boolean') errors.push('settings.demoMode must be a boolean')
    if (data.settings.onboardingCompleted !== undefined && typeof data.settings.onboardingCompleted !== 'boolean') {
      errors.push('settings.onboardingCompleted must be a boolean')
    }
    if (data.settings.onboardingCompleted === undefined) {
      data.settings.onboardingCompleted = false
    }
    if (data.settings.scheduleTemplate !== 'custom' && !scheduleTemplates[data.settings.scheduleTemplate]) {
      errors.push('settings.scheduleTemplate must be a known schedule template or "custom"')
    }
    if (!isPlainObject(data.settings.customSchedule)) {
      errors.push('settings.customSchedule must be an object')
    } else {
      const normalized = normalizeSchedule(data.settings.customSchedule)
      Object.entries(normalized).forEach(([day, focusId]) => {
        if (data.settings.customSchedule[day] !== focusId) {
          errors.push(`settings.customSchedule.${day} must be a known training focus`)
        }
      })
    }
  }

  if (isPlainObject(data.metadata)) {
    requireString(data.metadata, 'appName', errors)
    requireIsoString(data.metadata, 'createdAt', errors)
    requireIsoString(data.metadata, 'updatedAt', errors)
    if (data.metadata.exportedAt !== null) requireIsoString(data.metadata, 'exportedAt', errors)
  }

  if (Array.isArray(data.logs)) {
    const ids = new Set()
    data.logs.forEach((log, index) => {
      const result = validateSessionLog(log)
      if (!result.ok) errors.push(`logs[${index}]: ${result.errors.join(', ')}`)
      if (result.ok && ids.has(log.id)) errors.push(`logs[${index}]: duplicate log id "${log.id}"`)
      if (result.ok) ids.add(log.id)
    })
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: data }
}

export function parseImportedAppDataJson(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { ok: false, value: null, migrated: false, errors: ['import file is empty'] }
  }

  try {
    const parsed = JSON.parse(raw)
    return parseImportedAppData(parsed)
  } catch {
    return { ok: false, value: null, migrated: false, errors: ['import file is not valid JSON'] }
  }
}

export function parseStoredAppData(raw) {
  if (!raw) return { ok: true, value: createEmptyAppData(), migrated: false, errors: [] }

  try {
    const parsed = JSON.parse(raw)
    return parseImportedAppData(parsed)
  } catch {
    return { ok: false, value: createEmptyAppData(), migrated: false, errors: ['stored app data is not valid JSON'] }
  }
}

export function parseImportedAppData(value) {
  if (Array.isArray(value)) {
    return migrateLegacyLogArray(value)
  }

  if (!isPlainObject(value)) {
    return { ok: false, value: null, migrated: false, errors: ['import must be an AppData object or legacy log array'] }
  }

  if (Array.isArray(value.logs) && value.schemaVersion === undefined) {
    return migrateLegacyLogArray(value.logs)
  }

  if (value.schemaVersion === 1 || value.schemaVersion === 2) {
    const migrated = migrateAppDataToCurrent(value)
    const result = validateAppData(migrated)
    return result.ok
      ? { ok: true, value: migrated, migrated: true, errors: [] }
      : { ok: false, value: null, migrated: false, errors: result.errors }
  }

  if (value.schemaVersion !== APP_SCHEMA_VERSION) {
    return {
      ok: false,
      value: null,
      migrated: false,
      errors: [`unsupported AppData schemaVersion: ${String(value.schemaVersion)}`],
    }
  }

  const result = validateAppData(value)
  return result.ok
    ? { ok: true, value, migrated: false, errors: [] }
    : { ok: false, value: null, migrated: false, errors: result.errors }
}

export function migrateLegacyLogArray(logs) {
  if (!Array.isArray(logs)) {
    return { ok: false, value: null, migrated: false, errors: ['legacy logs must be an array'] }
  }

  const errors = []
  const migratedLogs = logs.map((log, index) => {
    try {
      return migrateLegacyLog(log, index)
    } catch (error) {
      errors.push(`legacy logs[${index}]: ${error.message}`)
      return null
    }
  })

  if (errors.length) {
    return { ok: false, value: null, migrated: false, errors }
  }

  const appData = createEmptyAppData()
  appData.logs = migratedLogs
  appData.metadata.updatedAt = nowIso()
  appData.metadata.migratedFrom = 'legacy-session-log-array'

  return { ok: true, value: appData, migrated: true, errors: [] }
}

export function migrateAppDataToCurrent(data) {
  const defaults = createEmptyAppData()
  const sourceVersion = Number.isFinite(data.schemaVersion) ? data.schemaVersion : 'unknown'
  return {
    ...defaults,
    ...data,
    schemaVersion: APP_SCHEMA_VERSION,
    logs: Array.isArray(data.logs) ? data.logs.map(migrateSessionLogToCurrent) : [],
    settings: {
      ...defaults.settings,
      ...(isPlainObject(data.settings) ? data.settings : {}),
      scheduleTemplate: isPlainObject(data.settings) && (scheduleTemplates[data.settings.scheduleTemplate] || data.settings.scheduleTemplate === 'custom')
        ? data.settings.scheduleTemplate
        : defaultScheduleTemplateId,
      customSchedule: normalizeSchedule(isPlainObject(data.settings) ? data.settings.customSchedule : null),
    },
    metadata: {
      ...defaults.metadata,
      ...(isPlainObject(data.metadata) ? data.metadata : {}),
      updatedAt: nowIso(),
      migratedFrom: appendMigration(data.metadata?.migratedFrom, `app-data-v${sourceVersion}`),
    },
  }
}

export function migrateSessionLogToCurrent(log) {
  return {
    ...log,
    schemaVersion: SESSION_LOG_SCHEMA_VERSION,
    attempts: optionalNumber(log.attempts),
    successes: optionalNumber(log.successes),
    cleanReps: optionalNumber(log.cleanReps),
    sparWins: optionalNumber(log.sparWins),
    sparLosses: optionalNumber(log.sparLosses),
    conditioningRoundsSurvived: optionalNumber(log.conditioningRoundsSurvived),
    mistakeCount: optionalNumber(log.mistakeCount),
    tournamentPlacement: optionalNumber(log.tournamentPlacement),
  }
}

export function mergeImportedAppData(currentAppData, importedAppData) {
  const currentValidation = validateAppData(currentAppData)
  if (!currentValidation.ok) {
    return { ok: false, appData: currentAppData, summary: null, errors: currentValidation.errors }
  }

  const importedValidation = validateAppData(importedAppData)
  if (!importedValidation.ok) {
    return { ok: false, appData: currentAppData, summary: null, errors: importedValidation.errors }
  }

  const byId = new Map(currentAppData.logs.map((log) => [log.id, log]))
  const seenImportedIds = new Set()
  const summary = {
    imported: 0,
    merged: 0,
    skipped: 0,
    rejected: 0,
    replaced: 0,
  }

  importedAppData.logs.forEach((log) => {
    if (seenImportedIds.has(log.id)) {
      summary.rejected += 1
      return
    }
    seenImportedIds.add(log.id)

    const existing = byId.get(log.id)
    summary.imported += 1

    if (!existing) {
      byId.set(log.id, log)
      summary.merged += 1
      return
    }

    if (new Date(log.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(log.id, log)
      summary.replaced += 1
      summary.merged += 1
    } else {
      summary.skipped += 1
    }
  })

  const mergedLogs = Array.from(byId.values()).sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const appData = {
    ...currentAppData,
    logs: mergedLogs,
    settings: {
      ...currentAppData.settings,
      demoMode: false,
    },
    metadata: {
      ...currentAppData.metadata,
      updatedAt: nowIso(),
      migratedFrom: importedAppData.metadata.migratedFrom || currentAppData.metadata.migratedFrom,
    },
  }

  const validation = validateAppData(appData)
  if (!validation.ok) {
    return { ok: false, appData: currentAppData, summary, errors: validation.errors }
  }

  return { ok: true, appData, summary, errors: [] }
}

export function migrateLegacyLog(log, index = 0) {
  if (!isPlainObject(log)) {
    throw new Error('legacy log must be an object')
  }

  const missing = []
  const required = ['date', 'day', 'focus', 'duration', 'mainDrill', 'metricType', 'result', 'success', 'energy', 'confidence', 'win', 'problem']
  required.forEach((key) => {
    if (log[key] === undefined || log[key] === null || log[key] === '') missing.push(key)
  })

  if (missing.length) {
    throw new Error(`missing required fields: ${missing.join(', ')}`)
  }

  const createdAt = dateToIso(log.date) || nowIso()
  return createSessionLog(
    {
      date: String(log.date),
      day: String(log.day),
      focus: String(log.focus),
      duration: Number(log.duration),
      mainDrill: String(log.mainDrill),
      metricType: String(log.metricType),
      result: String(log.result),
      success: log.success === 'Yes' ? 'Yes' : log.success === 'No' ? 'No' : '',
      energy: Number(log.energy),
      confidence: Number(log.confidence),
      win: String(log.win),
      problem: String(log.problem),
    },
    {
      id: `legacy_${String(log.date).replaceAll('-', '')}_${index + 1}`,
      createdAt,
      updatedAt: createdAt,
      now: createdAt,
    },
  )
}

function dateToIso(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function appendMigration(existing, next) {
  if (typeof existing === 'string' && existing.trim()) return `${existing}, ${next}`
  return next
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requireString(object, key, errors) {
  if (typeof object[key] !== 'string' || object[key].trim() === '') {
    errors.push(`${key} must be a non-empty string`)
  }
}

function requireNumber(object, key, errors, expected) {
  if (object[key] !== expected) {
    errors.push(`${key} must be ${expected}`)
  }
}

function requireFiniteNumber(object, key, errors, options = {}) {
  if (typeof object[key] !== 'number' || !Number.isFinite(object[key])) {
    errors.push(`${key} must be a finite number`)
    return
  }

  if (options.min !== undefined && object[key] < options.min) errors.push(`${key} must be >= ${options.min}`)
  if (options.max !== undefined && object[key] > options.max) errors.push(`${key} must be <= ${options.max}`)
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : value
}

function validateOptionalNumber(object, key, errors, options = {}) {
  if (object[key] === undefined) {
    object[key] = null
  }
  if (object[key] === null) return
  requireFiniteNumber(object, key, errors, options)
}

function requireIsoString(object, key, errors) {
  if (typeof object[key] !== 'string' || Number.isNaN(Date.parse(object[key]))) {
    errors.push(`${key} must be an ISO date-time string`)
  }
}

function requireDateString(object, key, errors) {
  if (typeof object[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(object[key])) {
    errors.push(`${key} must be a YYYY-MM-DD string`)
  }
}
