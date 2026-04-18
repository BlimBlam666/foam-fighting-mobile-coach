import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { makeAppData, makeLog, readStoredAppData, seedAppData } from './testUtils.js'

function renderSeededApp(appData = makeAppData()) {
  seedAppData(appData)
  return render(<App />)
}

async function openTab(user, name) {
  await user.click(screen.getByRole('button', { name }))
}

async function createLogThroughUi(user, { day, mainDrill = 'Shield side entries', result = '84', cleanReps, mistakeCategory } = {}) {
  await openTab(user, 'Log')
  if (day) {
    await user.selectOptions(screen.getByLabelText('Training day required'), day)
  }
  await user.clear(screen.getByLabelText('Main drill required'))
  await user.type(screen.getByLabelText('Main drill required'), mainDrill)
  if (mistakeCategory) {
    await user.selectOptions(screen.getByLabelText('Primary mistake category required'), mistakeCategory)
  }
  if (cleanReps !== undefined) {
    await user.clear(screen.getByLabelText('Clean reps'))
    await user.type(screen.getByLabelText('Clean reps'), String(cleanReps))
  }
  await user.clear(screen.getByLabelText('Result required'))
  await user.type(screen.getByLabelText('Result required'), result)
  await user.click(screen.getByRole('button', { name: 'Save session' }))
}

async function uploadBackup(user, appData) {
  const file = new File([JSON.stringify(appData)], 'foam-backup.json', { type: 'application/json' })
  await user.upload(screen.getByLabelText('Choose JSON backup'), file)
}

beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('app smoke and session logging flows', () => {
  it('mounts without crashing', () => {
    renderSeededApp()

    expect(screen.getByRole('heading', { name: 'Warlord Coach' })).toBeInTheDocument()
    expect(screen.getByText('Saved on this device')).toBeInTheDocument()
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText('No logs yet')).toBeInTheDocument()
    expect(screen.getByText('Starts after logging')).toBeInTheDocument()
  })

  it('shows a blank metrics state before any real logs exist', async () => {
    const user = userEvent.setup()
    renderSeededApp()

    await openTab(user, 'Stats')

    expect(screen.getByText('No metrics yet')).toBeInTheDocument()
    expect(screen.getByText(/No training history has been logged/)).toBeInTheDocument()
    expect(screen.queryByText('Weekly coach review')).not.toBeInTheDocument()
  })

  it('creates a log and persists it to localStorage', async () => {
    const user = userEvent.setup()
    renderSeededApp()

    await createLogThroughUi(user)

    expect(await screen.findByText('1 sessions / 45 minutes logged.')).toBeInTheDocument()
    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))
    expect(readStoredAppData().logs[0]).toMatchObject({
      mainDrill: 'Shield side entries',
      result: '84',
      schemaVersion: 3,
      mistakeCategory: 'otherCustom',
    })
  })

  it('shows inline help for confusing log fields', async () => {
    const user = userEvent.setup()
    renderSeededApp()

    await openTab(user, 'Log')
    await user.click(screen.getByRole('button', { name: 'Help: Main drill required' }))

    expect(screen.getByText('The main drill or training block you spent the session on.')).toBeInTheDocument()
    expect(screen.getByText('Enter a short drill name, not the whole workout.')).toBeInTheDocument()
    expect(screen.getByText(/Example: Retreat\/reentry range drill/)).toBeInTheDocument()
  })

  it('creates a structured Olympic metric and mistake taxonomy log from the phone flow', async () => {
    const user = userEvent.setup()
    renderSeededApp()

    await createLogThroughUi(user, { day: 'Monday', mainDrill: '4-quadrant pell', result: '90', cleanReps: 72, mistakeCategory: 'formBreakdown' })

    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))
    expect(readStoredAppData().logs[0]).toMatchObject({
      day: 'Monday',
      cleanReps: 72,
      metricType: 'Accuracy %',
      mistakeCategory: 'formBreakdown',
    })
  })

  it('loads persisted logs after a remount', async () => {
    const user = userEvent.setup()
    const view = renderSeededApp()

    await createLogThroughUi(user, { mainDrill: 'Reload practice', result: '77' })
    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))

    view.unmount()
    render(<App />)

    await openTab(user, 'Log')
    expect(screen.getByText(/Reload practice/)).toBeInTheDocument()
  })

  it('edits a log, preserves createdAt, and updates metrics immediately', async () => {
    const user = userEvent.setup()
    const original = makeLog({}, { id: 'log_edit_ui', createdAt: '2026-04-17T10:00:00.000Z', updatedAt: '2026-04-17T10:00:00.000Z' })
    renderSeededApp(makeAppData([original]))

    await openTab(user, 'Log')
    await user.click(screen.getByRole('button', { name: 'Edit log' }))

    const dialog = screen.getByRole('dialog', { name: 'Edit session log' })
    await user.clear(within(dialog).getByLabelText('Minutes'))
    await user.type(within(dialog).getByLabelText('Minutes'), '90')
    await user.clear(within(dialog).getByLabelText('Result'))
    await user.type(within(dialog).getByLabelText('Result'), '91')
    await user.clear(within(dialog).getByLabelText('Clean reps'))
    await user.type(within(dialog).getByLabelText('Clean reps'), '66')
    await user.selectOptions(within(dialog).getByLabelText('Primary mistake category'), 'badBlocks')
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit session log' })).not.toBeInTheDocument())
    await openTab(user, 'Stats')
    expect(await screen.findByText('1 sessions / 90 minutes logged.')).toBeInTheDocument()

    await waitFor(() => {
      const stored = readStoredAppData().logs[0]
      expect(stored.id).toBe('log_edit_ui')
      expect(stored.createdAt).toBe('2026-04-17T10:00:00.000Z')
      expect(stored.updatedAt).not.toBe('2026-04-17T10:00:00.000Z')
      expect(stored.duration).toBe(90)
      expect(stored.result).toBe('91')
      expect(stored.cleanReps).toBe(66)
      expect(stored.mistakeCategory).toBe('badBlocks')
    })
  })

  it('deletes one log after confirmation and refreshes metrics', async () => {
    const user = userEvent.setup()
    const keep = makeLog({ mainDrill: 'Keep this one' }, { id: 'log_keep' })
    const remove = makeLog({ mainDrill: 'Delete this one' }, { id: 'log_delete' })
    renderSeededApp(makeAppData([keep, remove]))

    await openTab(user, 'Log')
    await user.click(screen.getAllByRole('button', { name: 'Edit log' })[1])
    await user.click(screen.getByRole('button', { name: 'Delete this log' }))

    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))
    expect(readStoredAppData().logs[0].id).toBe('log_keep')
    expect(screen.queryByText(/Delete this one/)).not.toBeInTheDocument()

    await openTab(user, 'Stats')
    expect(await screen.findByText('1 sessions / 45 minutes logged.')).toBeInTheDocument()
  })
})

describe('backup and restore UI flows', () => {
  it('imports a valid backup in merge mode', async () => {
    const user = userEvent.setup()
    const imported = makeLog({ mainDrill: 'Imported merge log' }, { id: 'log_imported' })
    renderSeededApp()

    await openTab(user, 'Backup')
    await uploadBackup(user, makeAppData([imported]))

    expect(await screen.findByText('Import complete')).toBeInTheDocument()
    expect(screen.getByText('Merged: 1')).toBeInTheDocument()
    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))
    expect(readStoredAppData().logs[0].id).toBe('log_imported')
  })

  it('rejects invalid imports without corrupting current data', async () => {
    const user = userEvent.setup()
    const existing = makeLog({ mainDrill: 'Existing safe log' }, { id: 'log_existing' })
    renderSeededApp(makeAppData([existing]))

    await openTab(user, 'Backup')
    const file = new File(['{not valid json'], 'broken.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('Choose JSON backup'), file)

    expect(await screen.findByText('Import failed')).toBeInTheDocument()
    expect(screen.getByText('import file is not valid JSON')).toBeInTheDocument()
    expect(readStoredAppData().logs).toHaveLength(1)
    expect(readStoredAppData().logs[0].id).toBe('log_existing')
  })

  it('replaces current data when replace mode is confirmed', async () => {
    const user = userEvent.setup()
    const current = makeLog({ mainDrill: 'Current log' }, { id: 'log_current' })
    const replacement = makeLog({ mainDrill: 'Replacement log' }, { id: 'log_replacement' })
    renderSeededApp(makeAppData([current]))

    await openTab(user, 'Backup')
    await user.click(screen.getByRole('button', { name: 'Replace all' }))
    await uploadBackup(user, makeAppData([replacement]))

    expect(await screen.findByText('Import complete')).toBeInTheDocument()
    expect(screen.getByText('Replace complete. Imported 1 logs.')).toBeInTheDocument()
    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(1))
    expect(readStoredAppData().logs[0].id).toBe('log_replacement')
  })

  it('merges conflicts by id and keeps the newest imported log', async () => {
    const user = userEvent.setup()
    const oldCurrent = makeLog({ result: '45' }, { id: 'log_conflict', updatedAt: '2026-04-17T10:00:00.000Z' })
    const newImported = makeLog({ result: '95' }, { id: 'log_conflict', updatedAt: '2026-04-18T10:00:00.000Z' })
    const freshImported = makeLog({ mainDrill: 'Fresh imported log' }, { id: 'log_fresh', updatedAt: '2026-04-18T11:00:00.000Z' })
    renderSeededApp(makeAppData([oldCurrent]))

    await openTab(user, 'Backup')
    await uploadBackup(user, makeAppData([newImported, freshImported]))

    expect(await screen.findByText('Import complete')).toBeInTheDocument()
    expect(screen.getByText('Imported: 2')).toBeInTheDocument()
    expect(screen.getByText('Merged: 2')).toBeInTheDocument()
    expect(screen.getByText('Replaced: 1')).toBeInTheDocument()

    await waitFor(() => expect(readStoredAppData().logs).toHaveLength(2))
    expect(readStoredAppData().logs.find((log) => log.id === 'log_conflict').result).toBe('95')
  })

  it('shows copyable JSON after export so mobile users have a fallback', async () => {
    const user = userEvent.setup()
    renderSeededApp(makeAppData([makeLog({}, { id: 'log_export' })]))

    await openTab(user, 'Backup')
    await user.click(screen.getByRole('button', { name: 'Show copyable backup' }))

    const textarea = screen.getByLabelText('Copyable backup JSON')
    expect(textarea).toBeInTheDocument()
    const backup = JSON.parse(textarea.value)
    expect(backup.schemaVersion).toBe(4)
    expect(backup.logs).toHaveLength(1)
    expect(backup.logs[0].id).toBe('log_export')
    expect(backup.metadata.exportedAt).toEqual(expect.any(String))
    expect(Date.parse(backup.metadata.exportedAt)).not.toBeNaN()
    expect(readStoredAppData().logs[0].id).toBe('log_export')
  })
})

describe('Olympic Coach schedule customization', () => {
  it('manually remaps weekdays and persists the schedule after remount', async () => {
    const user = userEvent.setup()
    const view = renderSeededApp()

    await openTab(user, 'Plan')
    await user.selectOptions(screen.getByLabelText('Sunday training focus'), 'competitionSimulation')

    await waitFor(() => {
      const stored = readStoredAppData()
      expect(stored.settings.scheduleTemplate).toBe('custom')
      expect(stored.settings.customSchedule.Sunday).toBe('competitionSimulation')
    })

    view.unmount()
    render(<App />)

    await openTab(user, 'Plan')
    expect(screen.getAllByText(/Sunday/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Competition Simulation/).length).toBeGreaterThan(0)
  })

  it('keeps presets available as an optional starting point', async () => {
    const user = userEvent.setup()
    renderSeededApp()

    await openTab(user, 'Plan')
    await user.click(screen.getByText('Apply a preset starting point'))
    await user.click(screen.getByRole('button', { name: /Full Park Sunday/ }))

    await waitFor(() => {
      const stored = readStoredAppData()
      expect(stored.settings.scheduleTemplate).toBe('fullParkSunday')
      expect(stored.settings.customSchedule.Sunday).toBe('competitionSimulation')
    })
  })
})
