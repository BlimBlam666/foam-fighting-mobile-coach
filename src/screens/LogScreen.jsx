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
            <FieldLabel label="Main drill required" help={fieldHelp.mainDrill} />
            <input aria-label="Main drill required" value={form.mainDrill} onChange={(event) => onUpdateField('mainDrill', event.target.value)} placeholder="4-quadrant pell" />
          </label>

          <label>
            <FieldLabel label="Primary mistake category required" help={fieldHelp.mistakeCategory} />
            <select aria-label="Primary mistake category required" value={form.mistakeCategory} onChange={(event) => onUpdateField('mistakeCategory', event.target.value)}>
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
                    <FieldLabel label={field.label} help={field.help} />
                    <input
                      aria-label={field.ariaLabel || field.label}
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
              <FieldLabel label="Metric being tracked required" help={fieldHelp.metricType} />
              <select aria-label="Metric type required" value={form.metricType} onChange={(event) => onUpdateField('metricType', event.target.value)}>
                {todayPlan.trackedMetrics.map((metric) => <option key={metric}>{metric}</option>)}
              </select>
            </label>
            <label>
              <FieldLabel label="Result for that metric required" help={fieldHelp.result} />
              <input aria-label="Result required" inputMode="decimal" value={form.result} onChange={(event) => onUpdateField('result', event.target.value)} placeholder="82" />
            </label>
          </div>

          <div className="form-grid three">
            <label>
              <FieldLabel label="Session success required" help={fieldHelp.success} />
              <select aria-label="Success required" value={form.success} onChange={(event) => onUpdateField('success', event.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              <FieldLabel label="Energy 0-10 required" help={fieldHelp.energy} />
              <input aria-label="Energy required" inputMode="numeric" value={form.energy} onChange={(event) => onUpdateField('energy', event.target.value)} />
            </label>
            <label>
              <FieldLabel label="Confidence 0-10 required" help={fieldHelp.confidence} />
              <input aria-label="Confidence required" inputMode="numeric" value={form.confidence} onChange={(event) => onUpdateField('confidence', event.target.value)} />
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
                <FieldLabel label="Mistake detail optional" help={fieldHelp.mistakeDetail} />
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

function FieldLabel({ label, help }) {
  return (
    <span className="field-label-row">
      <span>{label}</span>
      {help && (
        <details className="field-help">
          <summary aria-label={`Help: ${label}`} role="button">?</summary>
          <div className="field-help-popover">
            <strong>{help.definition}</strong>
            <p>{help.enter}</p>
            <p><em>Example: {help.example}</em></p>
          </div>
        </details>
      )}
    </span>
  )
}

function fieldsForFocus(focusId) {
  const common = {
    technicalPrecision: [
      { key: 'cleanReps', label: 'Clean reps', placeholder: '70', help: fieldHelp.cleanReps },
      { key: 'attempts', label: 'Attempts (tries)', ariaLabel: 'Accuracy attempts', placeholder: '80', help: fieldHelp.attempts },
      { key: 'successes', label: 'Successful reps', ariaLabel: 'Accuracy successes', placeholder: '72', help: fieldHelp.successes },
    ],
    pressureConditioning: [
      { key: 'conditioningRoundsSurvived', label: 'Conditioning rounds survived', placeholder: '3' },
      { key: 'sparWins', label: 'Fatigue spar wins', placeholder: '4' },
      { key: 'sparLosses', label: 'Fatigue spar losses', placeholder: '2' },
      { key: 'mistakeCount', label: 'Mistake count under fatigue', ariaLabel: 'Mistakes under fatigue', placeholder: '5', help: fieldHelp.mistakeCount },
    ],
    competitionSimulation: [
      { key: 'sparWins', label: 'Spar wins', placeholder: '5' },
      { key: 'sparLosses', label: 'Spar losses', placeholder: '2' },
      { key: 'tournamentPlacement', label: 'Tournament placement', placeholder: '1' },
      { key: 'mistakeCount', label: 'Mistake count', ariaLabel: 'Mistakes', placeholder: '4', help: fieldHelp.mistakeCount },
    ],
    weaknessIsolation: [
      { key: 'mistakeCount', label: 'Weakness mistake count', ariaLabel: 'Weakness mistakes', placeholder: '6', help: fieldHelp.mistakeCount },
      { key: 'cleanReps', label: 'Clean correction reps', placeholder: '40' },
      { key: 'attempts', label: 'Correction attempts', placeholder: '50', help: fieldHelp.attempts },
      { key: 'successes', label: 'Successful corrections', ariaLabel: 'Correction successes', placeholder: '38', help: fieldHelp.successes },
    ],
  }

  return common[focusId] || [
    { key: 'attempts', label: 'Attempts (tries)', ariaLabel: 'Attempts', placeholder: '20', help: fieldHelp.attempts },
    { key: 'successes', label: 'Successful reps', ariaLabel: 'Successes', placeholder: '15', help: fieldHelp.successes },
    { key: 'mistakeCount', label: 'Mistake count', ariaLabel: 'Mistakes', placeholder: '3', help: fieldHelp.mistakeCount },
  ]
}

const fieldHelp = {
  mainDrill: {
    definition: 'The main drill or training block you spent the session on.',
    enter: 'Enter a short drill name, not the whole workout.',
    example: 'Retreat/reentry range drill',
  },
  attempts: {
    definition: 'How many total tries you took.',
    enter: 'Enter the full count before judging success.',
    example: '80 swings attempted',
  },
  successes: {
    definition: 'How many attempts met the standard.',
    enter: 'Enter the count that were clean, accurate, or correct. This is different from session success.',
    example: '72 clean hits out of 80',
  },
  cleanReps: {
    definition: 'Reps performed with good form and no obvious breakdown.',
    enter: 'Enter the clean count only.',
    example: '70 clean reps',
  },
  mistakeCategory: {
    definition: 'The primary repeated mistake for this session.',
    enter: 'Pick the closest category. Use detail notes only if you need more context.',
    example: 'Poor range control',
  },
  mistakeDetail: {
    definition: 'Optional notes about the mistake category.',
    enter: 'Write a short detail if the category alone is not enough.',
    example: 'Late retreat after missed first shot',
  },
  mistakeCount: {
    definition: 'How many times the key mistake happened.',
    enter: 'Count repeat errors during the drill, spar, or review block.',
    example: '5 late blocks',
  },
  metricType: {
    definition: 'The main measurement you want this log to report.',
    enter: 'Choose the metric that matches the result number.',
    example: 'Accuracy %',
  },
  result: {
    definition: 'The value for the selected metric.',
    enter: 'Enter a number or short result that matches Metric being tracked.',
    example: '82 for Accuracy %',
  },
  success: {
    definition: 'A simple yes/no judgment for the whole session.',
    enter: 'Choose Yes if the session met its goal. This is not the same as successful reps.',
    example: 'Yes: hit the 90% clean-hit gate',
  },
  energy: {
    definition: 'How much physical/mental fuel you had.',
    enter: 'Enter 0-10, where 10 means very fresh.',
    example: '7',
  },
  confidence: {
    definition: 'How confident you felt executing the skill.',
    enter: 'Enter 0-10, where 10 means highly confident.',
    example: '6',
  },
}
