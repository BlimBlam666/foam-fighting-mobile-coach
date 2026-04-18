import {
  LEGACY_LOGS_STORAGE_KEY,
  STORAGE_KEY,
  createEmptyAppData,
  nowIso,
  parseStoredAppData,
  validateAppData,
} from './dataModel.js'

export function loadAppData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = parseStoredAppData(raw)

    if (parsed.ok) {
      return { appData: parsed.value, status: parsed.migrated ? 'migrated' : 'loaded', errors: parsed.errors }
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_LOGS_STORAGE_KEY)
    const legacyParsed = parseStoredAppData(legacyRaw)
    if (legacyParsed.ok && legacyRaw) {
      return { appData: legacyParsed.value, status: 'migrated', errors: [] }
    }

    return { appData: createEmptyAppData(), status: 'invalid', errors: parsed.errors }
  } catch {
    return { appData: createEmptyAppData(), status: 'unavailable', errors: ['localStorage is unavailable'] }
  }
}

export function saveAppData(appData) {
  const next = {
    ...appData,
    metadata: {
      ...appData.metadata,
      updatedAt: nowIso(),
    },
  }
  const validation = validateAppData(next)

  if (!validation.ok) {
    return { ok: false, status: 'failed', appData, errors: validation.errors }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return { ok: true, status: 'saved', appData: next, errors: [] }
  } catch {
    return { ok: false, status: 'unavailable', appData, errors: ['Storage unavailable: unable to write app data to localStorage'] }
  }
}

export function createExportPayload(appData) {
  return {
    ...appData,
    metadata: {
      ...appData.metadata,
      exportedAt: nowIso(),
    },
  }
}
