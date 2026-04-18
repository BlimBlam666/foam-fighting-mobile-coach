import React from 'react'
import { storageStatusText } from '../app/appHelpers.js'
import { weeklyPlan } from '../trainingData.js'

export function LogScreen({
  form,
  logs,
  onChangeDay,
  onClearLogs,
  onExportLogs,
  onLoadDemoData,
  onOpenLogEditor,
  onReloadSavedLogs,
  onSubmitLog,
  onToggleAdvanced,
  onUpdateField,
  showAdvancedLog,
  storageErrors,
  storageStatus,
}) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head">
          <h3>Quick log</h3>
          <span className="subtle">Required fields first. Details can wait.</span>
        </div>

        <form onSubmit={onSubmitLog}>
          <div className="quick-summary">
            <strong>{form.day} / {form.focus}</strong>
            <span>{form.metricType}</span>
          </div>

          <div className="form-grid two">
            <label>
              <span>Date required</span>
              <input type="date" value={form.date} onChange={(event) => onUpdateField('date', event.target.value)} />
            </label>
            <label>
              <span>Training day required</span>
              <select value={form.day} onChange={(event) => onChangeDay(event.target.value)}>
                {weeklyPlan.map((plan) => <option key={plan.day}>{plan.day}</option>)}
              </select>
            </label>
          </div>

          <div className="form-grid two">
            <label>
              <span>Focus required</span>
              <input value={form.focus} onChange={(event) => onUpdateField('focus', event.target.value)} />
            </label>
            <label>
              <span>Minutes required</span>
              <input inputMode="numeric" value={form.duration} onChange={(event) => onUpdateField('duration', event.target.value)} />
            </label>
          </div>

          <label>
            <span>Main drill required</span>
            <input value={form.mainDrill} onChange={(event) => onUpdateField('mainDrill', event.target.value)} placeholder="Main drill" />
          </label>

          <div className="form-grid two">
            <label>
              <span>Metric type required</span>
              <input value={form.metricType} onChange={(event) => onUpdateField('metricType', event.target.value)} />
            </label>
            <label>
              <span>Result required</span>
              <input inputMode="decimal" value={form.result} onChange={(event) => onUpdateField('result', event.target.value)} placeholder="82" />
            </label>
          </div>

          <div className="form-grid three">
            <label>
              <span>Success required</span>
              <select value={form.success} onChange={(event) => onUpdateField('success', event.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              <span>Energy required</span>
              <input inputMode="numeric" value={form.energy} onChange={(event) => onUpdateField('energy', event.target.value)} />
            </label>
            <label>
              <span>Confidence required</span>
              <input inputMode="numeric" value={form.confidence} onChange={(event) => onUpdateField('confidence', event.target.value)} />
            </label>
          </div>

          <button className="ghost-btn advanced-toggle" onClick={onToggleAdvanced} type="button">
            {showAdvancedLog ? 'Hide notes' : 'Add notes'}
          </button>

          {showAdvancedLog && (
            <div className="advanced-log">
              <label>
                <span>Biggest win optional</span>
                <textarea value={form.win} onChange={(event) => onUpdateField('win', event.target.value)} />
              </label>
              <label>
                <span>Biggest problem optional</span>
                <textarea value={form.problem} onChange={(event) => onUpdateField('problem', event.target.value)} />
              </label>
            </div>
          )}

          <button className="primary-btn" type="submit">Save session</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Local data</h3>
            <span className="subtle">{storageStatusText(storageStatus, storageErrors)}</span>
          </div>
          <div className="button-row">
            <button className="ghost-btn" onClick={onReloadSavedLogs} type="button">Load</button>
            <button className="ghost-btn" onClick={onExportLogs} type="button">Export</button>
            <button className="ghost-btn danger-btn" onClick={onClearLogs} type="button">Clear</button>
          </div>
        </div>
        {storageErrors.length > 0 && (
          <div className="callout warning">
            <strong>Data notice</strong>
            <p>{storageErrors.join('; ')}</p>
          </div>
        )}
        {logs.length === 0 && (
          <button className="secondary-btn" onClick={onLoadDemoData} type="button">Load optional demo data</button>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Recent entries</h3>
          <span className="subtle">Tap a log to edit / {logs.length} saved</span>
        </div>
        <div className="stack small-gap">
          {logs.length === 0 && <p className="empty-state">No sessions logged yet.</p>}
          {logs.map((log) => (
            <article className="log-card log-card-button" key={log.id} onClick={() => onOpenLogEditor(log)}>
              <div className="log-top">
                <div>
                  <strong>{log.day} / {log.focus}</strong>
                  <p>{log.date} / {log.duration} min / {log.mainDrill}</p>
                </div>
                <span className={log.success === 'Yes' ? 'pill good' : 'pill bad'}>{log.success}</span>
              </div>
              <div className="log-meta">
                <span>{log.metricType}: {log.result}</span>
                <span>Energy {log.energy} / Confidence {log.confidence}</span>
              </div>
              <p className="good-text"><strong>Win:</strong> {log.win}</p>
              <p className="bad-text"><strong>Problem:</strong> {log.problem}</p>
              <button className="inline-edit-btn" type="button">Edit log</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
