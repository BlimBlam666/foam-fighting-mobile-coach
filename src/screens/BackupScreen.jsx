import React from 'react'
import { storageStatusClass, storageStatusLabel } from '../app/appHelpers.js'

export function BackupScreen({
  exportFallbackJson,
  exportNotice,
  importMode,
  importReport,
  logs,
  onClearLogs,
  onCopyFallbackJson,
  onExportLogs,
  onImportFromFile,
  onLoadDemoData,
  onSetImportMode,
  onShowCopyableBackup,
  storageStatus,
}) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Backup and restore</h3>
            <span className="subtle">Your training data is stored locally on this device/browser.</span>
          </div>
          <span className={`pill ${storageStatusClass(storageStatus)}`}>{storageStatusLabel(storageStatus)}</span>
        </div>

        <div className="callout warning">
          <strong>Local-first storage</strong>
          <p>Export before changing phones, clearing browser data, using private mode, or uninstalling this browser.</p>
        </div>

        <div className="backup-actions">
          <button className="primary-btn" onClick={onExportLogs} type="button">Export JSON backup</button>
          <button className="ghost-btn" onClick={onShowCopyableBackup} type="button">
            Show copyable backup
          </button>
        </div>

        {exportNotice && (
          <div className="callout success">
            <strong>Export status</strong>
            <p>{exportNotice}</p>
          </div>
        )}

        {exportFallbackJson && (
          <div className="fallback-box">
            <div className="panel-head">
              <h3>Copyable backup JSON</h3>
              <button className="ghost-btn" onClick={onCopyFallbackJson} type="button">Copy</button>
            </div>
            <textarea readOnly value={exportFallbackJson} aria-label="Copyable backup JSON" />
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Import JSON backup</h3>
            <span className="subtle">Invalid files are rejected before they can change current data.</span>
          </div>
        </div>

        <div className="segmented-control" role="group" aria-label="Import mode">
          <button
            className={importMode === 'merge' ? 'active' : ''}
            onClick={() => onSetImportMode('merge')}
            type="button"
          >
            Merge by ID
          </button>
          <button
            className={importMode === 'replace' ? 'active' : ''}
            onClick={() => onSetImportMode('replace')}
            type="button"
          >
            Replace all
          </button>
        </div>

        <p className="guidance-text">
          Merge skips duplicate IDs unless the imported log has a newer updatedAt timestamp. Replace swaps all app data after confirmation.
        </p>

        <label className="file-picker">
          <span>Choose JSON backup</span>
          <input accept="application/json,.json" type="file" onChange={onImportFromFile} />
        </label>

        {importReport && (
          <div className={importReport.type === 'success' ? 'callout success' : 'callout warning'}>
            <strong>{importReport.type === 'success' ? 'Import complete' : 'Import failed'}</strong>
            <p>{importReport.message}</p>
            {importReport.summary && (
              <div className="import-summary">
                <span>Imported: {importReport.summary.imported}</span>
                <span>Merged: {importReport.summary.merged}</span>
                <span>Skipped: {importReport.summary.skipped}</span>
                <span>Rejected: {importReport.summary.rejected}</span>
                <span>Replaced: {importReport.summary.replaced}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Destructive actions</h3>
                  <span className="subtle">Sample preview data and clearing logs are intentionally separate actions.</span>
          </div>
        </div>
        <div className="backup-actions">
          <button className="ghost-btn danger-btn" onClick={onClearLogs} type="button">Clear all logs</button>
          {logs.length === 0 && (
            <button className="secondary-btn" onClick={onLoadDemoData} type="button">Preview sample data</button>
          )}
        </div>
      </section>
    </div>
  )
}
