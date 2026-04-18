import React from 'react'
import { storageStatusText } from '../app/appHelpers.js'
import { MISTAKE_TAXONOMY, getMistakeDisplay } from '../dataModel.js'

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
  todayPlan,
  weeklyPlan,
}) {
  const structuredFields = fieldsForFocus(todayPlan.focusId)

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
            <span>{todayPlan.system} / Track: {todayPlan.trackedMetrics.join(', ')}</span>
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

          <label>
            <span>Primary mistake category required</span>
            <select value={form.mistakeCategory} onChange={(event) => onUpdateField('mistakeCategory', event.target.value)}>
              {MISTAKE_TAXONOMY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          {structuredFields.length > 0 && (
            <div className="structured-log">
              <div className="quick-summary">
                <strong>Olympic metrics</strong>
                <span>Fill what you measured today. Generic result remains available below.</span>
              </div>
              <div className="form-grid two">
                {structuredFields.map((field) => (
                  <label key={field.key}>
                    <span>{field.label}</span>
                    <input
                      inputMode="numeric"
                      value={form[field.key]}
                      onChange={(event) => onUpdateField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-grid two">
            <label>
              <span>Metric type required</span>
              <select value={form.metricType} onChange={(event) => onUpdateField('metricType', event.target.value)}>
                {todayPlan.trackedMetrics.map((metric) => <option key={metric}>{metric}</option>)}
              </select>
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
                <span>Mistake detail optional</span>
                <textarea value={form.problem} onChange={(event) => onUpdateField('problem', event.target.value)} />
              </label>
            </div>
          )}

          <button className="primary-btn" type="submit">Save session</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Expected structure</h3>
          <span className="subtle">90 min ideal / 45 min minimum.</span>
        </div>
        <div className="phase-list">
          {todayPlan.phases.map((phase, index) => (
            <div className="phase-item" key={phase}>
              <div className="phase-index">{index + 1}</div>
              <div>{phase}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Required drills</h3>
        </div>
        <div className="chip-wrap">
          {todayPlan.requiredDrills.map((item) => (
            <span className="chip" key={item}>{item}</span>
          ))}
        </div>
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
          <button className="secondary-btn" onClick={onLoadDemoData} type="button">Preview sample data</button>
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
              <p className="bad-text"><strong>Mistake:</strong> {getMistakeDisplay(log)}{log.problem && log.problem !== 'No issue noted' ? ` / ${log.problem}` : ''}</p>
              <button className="inline-edit-btn" type="button">Edit log</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function fieldsForFocus(focusId) {
  const common = {
    technicalPrecision: [
      { key: 'cleanReps', label: 'Clean reps', placeholder: '70' },
      { key: 'attempts', label: 'Accuracy attempts', placeholder: '80' },
      { key: 'successes', label: 'Accuracy successes', placeholder: '72' },
    ],
    pressureConditioning: [
      { key: 'conditioningRoundsSurvived', label: 'Conditioning rounds survived', placeholder: '3' },
      { key: 'sparWins', label: 'Fatigue spar wins', placeholder: '4' },
      { key: 'sparLosses', label: 'Fatigue spar losses', placeholder: '2' },
      { key: 'mistakeCount', label: 'Mistakes under fatigue', placeholder: '5' },
    ],
    competitionSimulation: [
      { key: 'sparWins', label: 'Spar wins', placeholder: '5' },
      { key: 'sparLosses', label: 'Spar losses', placeholder: '2' },
      { key: 'tournamentPlacement', label: 'Tournament placement', placeholder: '1' },
      { key: 'mistakeCount', label: 'Mistakes', placeholder: '4' },
    ],
    weaknessIsolation: [
      { key: 'mistakeCount', label: 'Weakness mistakes', placeholder: '6' },
      { key: 'cleanReps', label: 'Clean correction reps', placeholder: '40' },
      { key: 'attempts', label: 'Correction attempts', placeholder: '50' },
      { key: 'successes', label: 'Correction successes', placeholder: '38' },
    ],
  }

  return common[focusId] || [
    { key: 'attempts', label: 'Attempts', placeholder: '20' },
    { key: 'successes', label: 'Successes', placeholder: '15' },
    { key: 'mistakeCount', label: 'Mistakes', placeholder: '3' },
  ]
}
