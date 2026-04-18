import { useEffect, useMemo, useState } from 'react'
import {
  APP_SCHEMA_VERSION,
  createSessionLog,
  mergeImportedAppData,
  migrateLegacyLogArray,
  parseImportedAppDataJson,
  todayDate,
  updateSessionLog,
} from '../dataModel.js'
import { calculateDerivedMetrics } from '../metrics.js'
import { createExportPayload, loadAppData, saveAppData } from '../storage.js'
import { createScheduleFromTemplate, demoLogs, getPlanForDay, getWeeklyPlan } from '../trainingData.js'
import { formFromLog, initialLogForm, readFileAsText, todayIndex } from '../app/appHelpers.js'

export function useCoachApp() {
  const loaded = useMemo(() => loadAppData(), [])
  const initialWeeklyPlan = getWeeklyPlan(loaded.appData.settings.customSchedule)
  const currentPlan = initialWeeklyPlan[todayIndex()]
  const [tab, setTab] = useState('today')
  const [appData, setAppData] = useState(loaded.appData)
  const [storageStatus, setStorageStatus] = useState(loaded.status)
  const [storageErrors, setStorageErrors] = useState(loaded.errors)
  const [importMode, setImportMode] = useState('merge')
  const [importReport, setImportReport] = useState(null)
  const [exportFallbackJson, setExportFallbackJson] = useState('')
  const [exportNotice, setExportNotice] = useState('')
  const [form, setForm] = useState(initialLogForm(currentPlan))
  const [editingLogId, setEditingLogId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editError, setEditError] = useState('')
  const [showAdvancedLog, setShowAdvancedLog] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!loaded.appData.settings.onboardingCompleted)
  const [saveMessage, setSaveMessage] = useState('')

  const logs = appData.logs
  const selectedWeek = appData.settings.selectedWeek
  const weeklyPlan = useMemo(() => getWeeklyPlan(appData.settings.customSchedule), [appData.settings.customSchedule])
  const metrics = useMemo(() => calculateDerivedMetrics(logs), [logs])

  useEffect(() => {
    const result = saveAppData(appData)
    setStorageStatus(result.status)
    setStorageErrors(result.errors)
  }, [appData])

  const todayPlan = useMemo(() => {
    return getPlanForDay(form.day, appData.settings.customSchedule) || weeklyPlan[todayIndex()]
  }, [appData.settings.customSchedule, form.day, weeklyPlan])

  function updateAppData(updater) {
    setAppData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return {
        ...next,
        schemaVersion: APP_SCHEMA_VERSION,
        metadata: {
          ...next.metadata,
        },
      }
    })
  }

  function updateSettings(partialSettings) {
    updateAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partialSettings,
      },
    }))
  }

  function applyScheduleTemplate(templateId) {
    const nextSchedule = createScheduleFromTemplate(templateId)
    updateSettings({
      scheduleTemplate: templateId,
      customSchedule: nextSchedule,
    })
    const picked = getPlanForDay(form.day, nextSchedule)
    setForm((prev) => ({
      ...prev,
      focus: picked.focus,
      metricType: picked.metric,
    }))
  }

  function updateScheduleDay(day, focusId) {
    const nextSchedule = {
      ...appData.settings.customSchedule,
      [day]: focusId,
    }
    updateSettings({
      scheduleTemplate: 'custom',
      customSchedule: nextSchedule,
    })
    if (form.day === day) {
      const picked = getPlanForDay(day, nextSchedule)
      setForm((prev) => ({
        ...prev,
        focus: picked.focus,
        metricType: picked.metric,
      }))
    }
  }

  function finishOnboarding() {
    updateSettings({ onboardingCompleted: true })
    setShowOnboarding(false)
    setTab('log')
  }

  function dismissOnboarding() {
    updateSettings({ onboardingCompleted: true })
    setShowOnboarding(false)
  }

  function openHelp() {
    updateSettings({ onboardingCompleted: true })
    setShowOnboarding(false)
    setTab('help')
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateEditForm(key, value) {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  function changeDay(value) {
    const picked = getPlanForDay(value, appData.settings.customSchedule)
    setForm((prev) => ({
      ...prev,
      day: value,
      focus: picked.focus,
      metricType: picked.metric,
    }))
  }

  function changeEditDay(value) {
    const picked = getPlanForDay(value, appData.settings.customSchedule)
    setEditForm((prev) => ({
      ...prev,
      day: value,
      focus: picked.focus,
      metricType: picked.metric,
    }))
  }

  function openLogEditor(log) {
    setEditingLogId(log.id)
    setEditForm(formFromLog(log))
    setEditError('')
  }

  function closeLogEditor() {
    setEditingLogId(null)
    setEditForm(null)
    setEditError('')
  }

  function saveEditedLog(event) {
    event.preventDefault()

    const existing = logs.find((log) => log.id === editingLogId)
    if (!existing) {
      setEditError('This log no longer exists.')
      return
    }

    try {
      const updated = updateSessionLog(existing, editForm)
      updateAppData((prev) => ({
        ...prev,
        logs: prev.logs.map((log) => (log.id === updated.id ? updated : log)),
        settings: {
          ...prev.settings,
          demoMode: false,
        },
      }))
      closeLogEditor()
    } catch (error) {
      setEditError(error.message)
    }
  }

  function deleteEditedLog() {
    const existing = logs.find((log) => log.id === editingLogId)
    if (!existing) {
      closeLogEditor()
      return
    }

    const confirmed = window.confirm(`Delete this ${existing.day} / ${existing.focus} log from ${existing.date}? This cannot be undone.`)
    if (!confirmed) return

    updateAppData((prev) => ({
      ...prev,
      logs: prev.logs.filter((log) => log.id !== existing.id),
      settings: {
        ...prev.settings,
        demoMode: false,
      },
    }))
    closeLogEditor()
  }

  function submitLog(event) {
    event.preventDefault()

    try {
      const entry = createSessionLog({
        date: form.date,
        day: form.day,
        focus: form.focus,
        duration: form.duration,
        mainDrill: form.mainDrill || todayPlan.drillIdeas[0],
        metricType: form.metricType,
        result: form.result || '0',
        success: form.success,
        energy: form.energy,
        confidence: form.confidence,
        win: form.win || 'Logged session',
        problem: form.problem || 'No issue noted',
        mistakeCategory: form.mistakeCategory,
        attempts: form.attempts,
        successes: form.successes,
        cleanReps: form.cleanReps,
        sparWins: form.sparWins,
        sparLosses: form.sparLosses,
        conditioningRoundsSurvived: form.conditioningRoundsSurvived,
        mistakeCount: form.mistakeCount,
        tournamentPlacement: form.tournamentPlacement,
      })

      updateAppData((prev) => ({
        ...prev,
        logs: [entry, ...prev.logs],
        settings: {
          ...prev.settings,
          demoMode: false,
        },
      }))
      setForm((prev) => ({
        ...prev,
        date: todayDate(),
        duration: '45',
        mainDrill: '',
        result: '',
        success: 'Yes',
        energy: '7',
        confidence: '7',
        win: '',
        problem: '',
        mistakeCategory: form.mistakeCategory,
        attempts: '',
        successes: '',
        cleanReps: '',
        sparWins: '',
        sparLosses: '',
        conditioningRoundsSurvived: '',
        mistakeCount: '',
        tournamentPlacement: '',
      }))
      setStorageErrors([])
      setSaveMessage('Session saved. Your metrics are updated.')
      setTab('metrics')
    } catch (error) {
      setStorageStatus('invalid')
      setStorageErrors([error.message])
    }
  }

  function clearLogs() {
    if (!window.confirm('Clear all saved session logs from this device?')) return

    updateAppData((prev) => ({
      ...prev,
      logs: [],
      settings: {
        ...prev.settings,
        demoMode: false,
      },
    }))
  }

  function reloadSavedLogs() {
    const result = loadAppData()
    setAppData(result.appData)
    setStorageStatus(result.status)
    setStorageErrors(result.errors)
    setImportReport(null)
  }

  function loadDemoData() {
    const migrated = migrateLegacyLogArray(demoLogs)
    if (!migrated.ok) {
      setStorageStatus('invalid')
      setStorageErrors(migrated.errors)
      return
    }

    updateAppData((prev) => ({
      ...prev,
      logs: migrated.value.logs,
      settings: {
        ...prev.settings,
        demoMode: true,
      },
      metadata: {
        ...prev.metadata,
        migratedFrom: 'optional-demo-data',
      },
    }))
  }

  function exportLogs() {
    const payload = createExportPayload(appData)
    const json = JSON.stringify(payload, null, 2)
    setExportNotice('')

    try {
      if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
        throw new Error('File download is not supported in this browser')
      }

      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `foam-fighter-app-data-${todayDate()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setExportNotice('Export started. If no file appears on this phone, use the copyable backup below.')
    } catch (error) {
      setExportNotice(`Download unavailable: ${error.message}. Use the copyable backup below.`)
    }

    setExportFallbackJson(json)
  }

  function showCopyableBackup() {
    setExportFallbackJson(JSON.stringify(createExportPayload(appData), null, 2))
  }

  async function importFromFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setImportReport(null)

    if (!file) return

    try {
      const raw = await readFileAsText(file)
      const parsed = parseImportedAppDataJson(raw)

      if (!parsed.ok) {
        setImportReport({
          type: 'error',
          message: parsed.errors.join('; '),
        })
        return
      }

      if (importMode === 'replace') {
        if (!window.confirm('Replace all current app data with this import? Export first if you want a backup.')) return

        updateAppData({
          ...parsed.value,
          settings: {
            ...parsed.value.settings,
            demoMode: false,
          },
        })
        setImportReport({
          type: 'success',
          message: `Replace complete. Imported ${parsed.value.logs.length} logs${parsed.migrated ? ' after migration' : ''}.`,
          summary: {
            imported: parsed.value.logs.length,
            merged: parsed.value.logs.length,
            skipped: 0,
            rejected: 0,
            replaced: 0,
          },
        })
        return
      }

      const merged = mergeImportedAppData(appData, parsed.value)
      if (!merged.ok) {
        setImportReport({
          type: 'error',
          message: merged.errors.join('; '),
        })
        return
      }

      updateAppData(merged.appData)
      setImportReport({
        type: 'success',
        message: `Merge complete${parsed.migrated ? ' after migration' : ''}.`,
        summary: merged.summary,
      })
    } catch (error) {
      setImportReport({
        type: 'error',
        message: error.message || 'Import failed because the file could not be read.',
      })
    }
  }

  async function copyFallbackJson() {
    if (!exportFallbackJson) return

    try {
      await navigator.clipboard.writeText(exportFallbackJson)
      setExportNotice('Backup JSON copied to clipboard.')
    } catch {
      setExportNotice('Copy failed. Select the JSON text and copy it manually.')
    }
  }

  return {
    appData,
    applyScheduleTemplate,
    clearLogs,
    closeLogEditor,
    copyFallbackJson,
    deleteEditedLog,
    dismissOnboarding,
    editError,
    editForm,
    exportFallbackJson,
    exportLogs,
    exportNotice,
    finishOnboarding,
    form,
    importFromFile,
    importMode,
    importReport,
    loadDemoData,
    logs,
    metrics,
    openHelp,
    openLogEditor,
    reloadSavedLogs,
    saveEditedLog,
    saveMessage,
    selectedWeek,
    scheduleTemplate: appData.settings.scheduleTemplate,
    setExportFallbackJson,
    setImportMode,
    setShowAdvancedLog,
    setShowOnboarding,
    setTab,
    showAdvancedLog,
    showCopyableBackup,
    showOnboarding,
    storageErrors,
    storageStatus,
    submitLog,
    tab,
    todayPlan,
    updateEditForm,
    updateForm,
    updateSettings,
    updateScheduleDay,
    weeklyPlan,
    changeDay,
    changeEditDay,
  }
}
