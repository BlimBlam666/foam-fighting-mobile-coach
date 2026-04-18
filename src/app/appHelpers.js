import { todayDate } from '../dataModel.js'

export function todayIndex() {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

export function initialLogForm(plan) {
  return {
    date: todayDate(),
    day: plan.day,
    focus: plan.focus,
    duration: '45',
    mainDrill: '',
    metricType: plan.metric,
    result: '',
    success: 'Yes',
    energy: '7',
    confidence: '7',
    win: '',
    problem: '',
  }
}

export function formFromLog(log) {
  return {
    date: log.date,
    day: log.day,
    focus: log.focus,
    duration: String(log.duration),
    mainDrill: log.mainDrill,
    metricType: log.metricType,
    result: log.result,
    success: log.success,
    energy: String(log.energy),
    confidence: String(log.confidence),
    win: log.win,
    problem: log.problem,
  }
}

export function successClass(value) {
  if (value >= 80) return 'good'
  if (value >= 60) return 'warn'
  return 'bad'
}

export function storageStatusText(status, errors) {
  if (status === 'saved') return 'Saved on this device.'
  if (status === 'loaded') return 'Loaded from this device.'
  if (status === 'migrated') return 'Migrated older saved logs to the beta data model.'
  if (status === 'failed') return `Save failed: ${errors.join('; ')}`
  if (status === 'invalid') return `Stored data was invalid and was not loaded: ${errors.join('; ')}`
  if (status === 'unavailable') return 'Local storage is unavailable in this browser.'
  return 'Ready.'
}

export function storageStatusLabel(status) {
  if (status === 'saved' || status === 'loaded' || status === 'migrated') return 'Saved on this device'
  if (status === 'unavailable') return 'Storage unavailable'
  if (status === 'failed' || status === 'invalid') return 'Save failed'
  return 'Checking storage'
}

export function storageStatusClass(status) {
  if (status === 'saved' || status === 'loaded' || status === 'migrated') return 'good'
  if (status === 'unavailable' || status === 'failed' || status === 'invalid') return 'bad'
  return 'warn'
}

export function readFileAsText(file) {
  if (typeof file.text === 'function') return file.text()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read import file'))
    reader.readAsText(file)
  })
}
