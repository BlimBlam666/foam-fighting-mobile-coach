import React from 'react'
import { MISTAKE_TAXONOMY } from '../dataModel.js'

export function LogEditorModal({
  editError,
  editForm,
  onCancel,
  onChangeDay,
  onDelete,
  onSave,
  onUpdateField,
  weeklyPlan,
}) {
  if (!editForm) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit session log">
      <section className="edit-sheet">
        <div className="panel-head wrap-head">
          <div>
            <p className="eyebrow">Session log</p>
            <h3>Edit entry</h3>
            <span className="subtle">Saving preserves ID and createdAt, then updates updatedAt.</span>
          </div>
          <button className="ghost-btn compact-btn" onClick={onCancel} type="button">Cancel</button>
        </div>

        {editError && (
          <div className="callout warning">
            <strong>Edit failed</strong>
            <p>{editError}</p>
          </div>
        )}

        <form onSubmit={onSave}>
          <div className="form-grid two">
            <label>
              <span>Date</span>
              <input type="date" value={editForm.date} onChange={(event) => onUpdateField('date', event.target.value)} />
            </label>
            <label>
              <span>Day</span>
              <select value={editForm.day} onChange={(event) => onChangeDay(event.target.value)}>
                {weeklyPlan.map((plan) => <option key={plan.day}>{plan.day}</option>)}
              </select>
            </label>
          </div>

          <div className="form-grid two">
            <label>
              <span>Focus</span>
              <input value={editForm.focus} onChange={(event) => onUpdateField('focus', event.target.value)} />
            </label>
            <label>
              <span>Minutes</span>
              <input inputMode="numeric" value={editForm.duration} onChange={(event) => onUpdateField('duration', event.target.value)} />
            </label>
          </div>

          <label>
            <FieldLabel label="Main drill" help={fieldHelp.mainDrill} />
            <input aria-label="Main drill" value={editForm.mainDrill} onChange={(event) => onUpdateField('mainDrill', event.target.value)} />
          </label>

          <label>
            <FieldLabel label="Primary mistake category" help={fieldHelp.mistakeCategory} />
            <select aria-label="Primary mistake category" value={editForm.mistakeCategory} onChange={(event) => onUpdateField('mistakeCategory', event.target.value)}>
              {MISTAKE_TAXONOMY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <div className="form-grid two">
            <label>
              <FieldLabel label="Metric being tracked" help={fieldHelp.metricType} />
              <input aria-label="Metric type" value={editForm.metricType} onChange={(event) => onUpdateField('metricType', event.target.value)} />
            </label>
            <label>
              <FieldLabel label="Result for that metric" help={fieldHelp.result} />
              <input aria-label="Result" inputMode="decimal" value={editForm.result} onChange={(event) => onUpdateField('result', event.target.value)} />
            </label>
          </div>

          <div className="form-grid three">
            <label>
              <FieldLabel label="Session success" help={fieldHelp.success} />
              <select aria-label="Success" value={editForm.success} onChange={(event) => onUpdateField('success', event.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              <FieldLabel label="Energy 0-10" help={fieldHelp.energy} />
              <input aria-label="Energy" inputMode="numeric" value={editForm.energy} onChange={(event) => onUpdateField('energy', event.target.value)} />
            </label>
            <label>
              <FieldLabel label="Confidence 0-10" help={fieldHelp.confidence} />
              <input aria-label="Confidence" inputMode="numeric" value={editForm.confidence} onChange={(event) => onUpdateField('confidence', event.target.value)} />
            </label>
          </div>

          <div className="quick-summary">
            <strong>Structured Olympic metrics</strong>
            <span>Optional. Metrics screen prefers these over generic result parsing.</span>
          </div>

          <div className="form-grid two">
            {structuredMetricFields.map((field) => (
              <label key={field.key}>
                <FieldLabel label={field.label} help={field.help} />
                <input
                  aria-label={field.ariaLabel || field.label}
                  inputMode="numeric"
                  value={editForm[field.key]}
                  onChange={(event) => onUpdateField(field.key, event.target.value)}
                />
              </label>
            ))}
          </div>

          <label>
            <span>Biggest win</span>
            <textarea value={editForm.win} onChange={(event) => onUpdateField('win', event.target.value)} />
          </label>
          <label>
            <FieldLabel label="Mistake detail" help={fieldHelp.mistakeDetail} />
            <textarea value={editForm.problem} onChange={(event) => onUpdateField('problem', event.target.value)} />
          </label>

          <div className="edit-actions">
            <button className="primary-btn" type="submit">Save changes</button>
            <button className="ghost-btn" onClick={onCancel} type="button">Cancel</button>
            <button className="ghost-btn danger-btn delete-log-btn" onClick={onDelete} type="button">Delete this log</button>
          </div>
        </form>
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
    enter: 'Choose or enter the metric that matches the result value.',
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

const structuredMetricFields = [
  { key: 'attempts', label: 'Attempts (tries)', ariaLabel: 'Attempts', help: fieldHelp.attempts },
  { key: 'successes', label: 'Successful reps', ariaLabel: 'Successes', help: fieldHelp.successes },
  { key: 'cleanReps', label: 'Clean reps', help: fieldHelp.cleanReps },
  { key: 'sparWins', label: 'Spar wins' },
  { key: 'sparLosses', label: 'Spar losses' },
  { key: 'conditioningRoundsSurvived', label: 'Conditioning rounds survived' },
  { key: 'mistakeCount', label: 'Mistake count', help: fieldHelp.mistakeCount },
  { key: 'tournamentPlacement', label: 'Tournament placement' },
]
