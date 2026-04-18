import { createEmptyAppData, createSessionLog, STORAGE_KEY } from '../dataModel.js'

export const baseLogInput = {
  date: '2026-04-17',
  day: 'Friday',
  focus: 'Weakness',
  duration: 45,
  mainDrill: 'Bad block resets',
  metricType: 'Weakness Success %',
  result: '72',
  success: 'Yes',
  energy: 7,
  confidence: 6,
  win: 'Recovered guard cleanly',
  problem: 'Late retreat',
}

export function makeLog(overrides = {}, options = {}) {
  return createSessionLog(
    {
      ...baseLogInput,
      ...overrides,
    },
    {
      id: options.id || overrides.id || 'log_test_1',
      createdAt: options.createdAt || '2026-04-17T10:00:00.000Z',
      updatedAt: options.updatedAt || '2026-04-17T10:00:00.000Z',
      now: options.now || '2026-04-17T10:00:00.000Z',
    },
  )
}

export function makeAppData(logs = [], settings = {}) {
  const appData = createEmptyAppData()
  appData.logs = logs
  appData.settings = {
    ...appData.settings,
    onboardingCompleted: true,
    ...settings,
  }
  appData.metadata.createdAt = '2026-04-17T09:00:00.000Z'
  appData.metadata.updatedAt = '2026-04-17T09:00:00.000Z'
  return appData
}

export function seedAppData(appData = makeAppData()) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appData))
  return appData
}

export function readStoredAppData() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY))
}
