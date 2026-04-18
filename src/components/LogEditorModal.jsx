import React from 'react'

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
            <span>Main drill</span>
            <input value={editForm.mainDrill} onChange={(event) => onUpdateField('mainDrill', event.target.value)} />
          </label>

          <div className="form-grid two">
            <label>
              <span>Metric type</span>
              <input value={editForm.metricType} onChange={(event) => onUpdateField('metricType', event.target.value)} />
            </label>
            <label>
              <span>Result</span>
              <input inputMode="decimal" value={editForm.result} onChange={(event) => onUpdateField('result', event.target.value)} />
            </label>
          </div>

          <div className="form-grid three">
            <label>
              <span>Success</span>
              <select value={editForm.success} onChange={(event) => onUpdateField('success', event.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              <span>Energy</span>
              <input inputMode="numeric" value={editForm.energy} onChange={(event) => onUpdateField('energy', event.target.value)} />
            </label>
            <label>
              <span>Confidence</span>
              <input inputMode="numeric" value={editForm.confidence} onChange={(event) => onUpdateField('confidence', event.target.value)} />
            </label>
          </div>

          <div className="quick-summary">
            <strong>Structured Olympic metrics</strong>
            <span>Optional. Metrics screen prefers these over generic result parsing.</span>
          </div>

          <div className="form-grid two">
            {structuredMetricFields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input
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
            <span>Biggest problem</span>
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

const structuredMetricFields = [
  { key: 'attempts', label: 'Attempts' },
  { key: 'successes', label: 'Successes' },
  { key: 'cleanReps', label: 'Clean reps' },
  { key: 'sparWins', label: 'Spar wins' },
  { key: 'sparLosses', label: 'Spar losses' },
  { key: 'conditioningRoundsSurvived', label: 'Conditioning rounds survived' },
  { key: 'mistakeCount', label: 'Mistake count' },
  { key: 'tournamentPlacement', label: 'Tournament placement' },
]
