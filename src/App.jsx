import React from 'react'
import { useCoachApp } from './hooks/useCoachApp.js'
import {
  AppHeader,
  BottomNav,
  CoachFooter,
  DemoBanner,
  SaveStateBanner,
  TodayHero,
} from './components/AppShell.jsx'
import { LogEditorModal } from './components/LogEditorModal.jsx'
import { OnboardingModal } from './components/OnboardingModal.jsx'
import { BackupScreen } from './screens/BackupScreen.jsx'
import { HelpScreen } from './screens/HelpScreen.jsx'
import { HomeScreen } from './screens/HomeScreen.jsx'
import { LibraryScreen } from './screens/LibraryScreen.jsx'
import { LogScreen } from './screens/LogScreen.jsx'
import { MetricsScreen } from './screens/MetricsScreen.jsx'
import { PlanScreen } from './screens/PlanScreen.jsx'

export default function App() {
  const coach = useCoachApp()

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <AppHeader selectedWeek={coach.selectedWeek} />
        <SaveStateBanner status={coach.storageStatus} errors={coach.storageErrors} />

        {coach.appData.settings.demoMode && <DemoBanner />}

        <TodayHero
          metrics={coach.metrics}
          onLogNow={() => coach.setTab('log')}
          todayPlan={coach.todayPlan}
        />

        {coach.tab === 'today' && (
          <HomeScreen
            logs={coach.logs}
            metrics={coach.metrics}
            onLogClick={() => coach.setTab('log')}
            saveMessage={coach.saveMessage}
            todayPlan={coach.todayPlan}
          />
        )}

        {coach.tab === 'log' && (
          <LogScreen
            form={coach.form}
            logs={coach.logs}
            onChangeDay={coach.changeDay}
            onClearLogs={coach.clearLogs}
            onExportLogs={coach.exportLogs}
            onLoadDemoData={coach.loadDemoData}
            onOpenLogEditor={coach.openLogEditor}
            onReloadSavedLogs={coach.reloadSavedLogs}
            onSubmitLog={coach.submitLog}
            onToggleAdvanced={() => coach.setShowAdvancedLog((value) => !value)}
            onUpdateField={coach.updateForm}
            showAdvancedLog={coach.showAdvancedLog}
            storageErrors={coach.storageErrors}
            storageStatus={coach.storageStatus}
            todayPlan={coach.todayPlan}
            weeklyPlan={coach.weeklyPlan}
          />
        )}

        {coach.tab === 'metrics' && (
          <MetricsScreen
            logs={coach.logs}
            metrics={coach.metrics}
            onExportLogs={coach.exportLogs}
            onLogClick={() => coach.setTab('log')}
          />
        )}

        {coach.tab === 'backup' && (
          <BackupScreen
            exportFallbackJson={coach.exportFallbackJson}
            exportNotice={coach.exportNotice}
            importMode={coach.importMode}
            importReport={coach.importReport}
            logs={coach.logs}
            onClearLogs={coach.clearLogs}
            onCopyFallbackJson={coach.copyFallbackJson}
            onExportLogs={coach.exportLogs}
            onImportFromFile={coach.importFromFile}
            onLoadDemoData={coach.loadDemoData}
            onSetImportMode={coach.setImportMode}
            onShowCopyableBackup={coach.showCopyableBackup}
            storageStatus={coach.storageStatus}
          />
        )}

        {coach.tab === 'help' && (
          <HelpScreen onShowOnboarding={() => coach.setShowOnboarding(true)} />
        )}

        {coach.tab === 'week' && (
          <PlanScreen
            onApplyScheduleTemplate={coach.applyScheduleTemplate}
            onUpdateScheduleDay={coach.updateScheduleDay}
            onUpdateSettings={coach.updateSettings}
            scheduleTemplate={coach.scheduleTemplate}
            selectedWeek={coach.selectedWeek}
            weeklyPlan={coach.weeklyPlan}
          />
        )}

        {coach.tab === 'library' && <LibraryScreen />}

        <CoachFooter weaknessTarget={coach.metrics.weaknessTarget} />
        <BottomNav activeTab={coach.tab} onChangeTab={coach.setTab} />

        <LogEditorModal
          editError={coach.editError}
          editForm={coach.editForm}
          onCancel={coach.closeLogEditor}
          onChangeDay={coach.changeEditDay}
          onDelete={coach.deleteEditedLog}
          onSave={coach.saveEditedLog}
          onUpdateField={coach.updateEditForm}
          weeklyPlan={coach.weeklyPlan}
        />

        <OnboardingModal
          onDismiss={coach.dismissOnboarding}
          onOpenHelp={coach.openHelp}
          onStartLog={coach.finishOnboarding}
          show={coach.showOnboarding}
        />
      </div>
    </main>
  )
}
