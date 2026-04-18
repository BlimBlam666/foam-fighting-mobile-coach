import React from 'react'
import { phaseWeeks, scheduleTemplates, trainingFocuses, weekdays } from '../trainingData.js'

export function PlanScreen({
  onApplyScheduleTemplate,
  onUpdateScheduleDay,
  onUpdateSettings,
  scheduleTemplate,
  selectedWeek,
  weeklyPlan,
}) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Assign each training focus to a weekday</h3>
            <span className="subtle">This controls what Home, Log, and Stats expect on each day.</span>
          </div>
          <select value={selectedWeek} onChange={(event) => onUpdateSettings({ selectedWeek: event.target.value })}>
            {phaseWeeks.map((week) => <option key={week.week}>{week.week}</option>)}
          </select>
        </div>

        <p className="guidance-text">
          Move the Olympic Coach focuses around real park practice, travel, or recovery needs. Manual changes save on this device and export with backups.
        </p>

        <div className="stack small-gap">
          {weekdays.map((day) => {
            const plan = weeklyPlan.find((item) => item.day === day)
            return (
              <label className="schedule-map-row" key={day}>
                <span>{day}</span>
                <select aria-label={`${day} training focus`} value={plan.focusId} onChange={(event) => onUpdateScheduleDay(day, event.target.value)}>
                  {Object.values(trainingFocuses).map((focus) => (
                    <option key={focus.id} value={focus.id}>{focus.title}</option>
                  ))}
                </select>
                <small>{plan.system} / Track: {plan.trackedMetrics.join(', ')}</small>
              </label>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Current weekly plan</h3>
            <span className="subtle">A quick read of the goals created by your weekday assignments.</span>
          </div>
        </div>

        <div className="stack small-gap">
          {weeklyPlan.map((plan) => (
            <div className="week-row" key={plan.day}>
              <div>
                <strong>{plan.day}</strong>
                <p>{plan.focus} / {plan.system}</p>
                <p>{plan.goal}</p>
              </div>
              <span className="pill neutral">{plan.trackedMetrics.join(', ')}</span>
            </div>
          ))}
        </div>

        <details className="preset-details">
          <summary>Apply a preset starting point</summary>
          <p className="guidance-text">Optional shortcuts. Applying one replaces the weekday assignments above; you can still edit any day afterward.</p>
          <div className="preset-list" role="group" aria-label="Schedule presets">
            {Object.values(scheduleTemplates).map((template) => (
              <button
                className={scheduleTemplate === template.id ? 'active' : ''}
                key={template.id}
                onClick={() => onApplyScheduleTemplate(template.id)}
                type="button"
              >
                <strong>{template.name}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>
        </details>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Monthly periodization targets</h3>
          <span className="subtle">Planned training load, not completed user performance.</span>
        </div>
        <div className="callout warning">
          <strong>What these bars mean</strong>
          <p>These are target intensity and volume levels for the planned program. Week 1-3 build skill load; Week 4 is a planned deload at 50% workload.</p>
        </div>
        <div className="stack small-gap">
          {phaseWeeks.map((week) => (
            <div className="period-card" key={week.week}>
              <div className="period-top">
                <strong>{week.week} / {week.phase}</strong>
                <span className="pill neutral">{week.focus}</span>
              </div>
              <div className="mini-metric">
                <span>Target intensity</span>
                <span>{week.intensity}%</span>
              </div>
              <div className="bar"><div className="fill warn" style={{ width: `${week.intensity}%` }} /></div>
              <div className="mini-metric">
                <span>Target volume</span>
                <span>{week.volume}%</span>
              </div>
              <div className="bar"><div className="fill good" style={{ width: `${week.volume}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
