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
            <h3>Olympic Coach schedule</h3>
            <span className="subtle">Customize park days while keeping the Warlord acceleration system intact.</span>
          </div>
          <select value={selectedWeek} onChange={(event) => onUpdateSettings({ selectedWeek: event.target.value })}>
            {phaseWeeks.map((week) => <option key={week.week}>{week.week}</option>)}
          </select>
        </div>

        <div className="segmented-control schedule-presets" role="group" aria-label="Schedule presets">
          {Object.values(scheduleTemplates).map((template) => (
            <button
              className={scheduleTemplate === template.id ? 'active' : ''}
              key={template.id}
              onClick={() => onApplyScheduleTemplate(template.id)}
              type="button"
            >
              {template.name}
            </button>
          ))}
        </div>

        <p className="guidance-text">
          Presets are starting points. Manual changes are saved on this device and exported with backups.
        </p>

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
      </section>

      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Manual weekday mapping</h3>
            <span className="subtle">Use this for real park schedules, travel, and practice days.</span>
          </div>
        </div>

        <div className="stack small-gap">
          {weekdays.map((day) => {
            const plan = weeklyPlan.find((item) => item.day === day)
            return (
              <label key={day}>
                <span>{day}</span>
                <select value={plan.focusId} onChange={(event) => onUpdateScheduleDay(day, event.target.value)}>
                  {Object.values(trainingFocuses).map((focus) => (
                    <option key={focus.id} value={focus.id}>{focus.title}</option>
                  ))}
                </select>
              </label>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Monthly periodization</h3>
          <span className="subtle">Week 1-3 build; Week 4 deloads at 50% workload.</span>
        </div>
        <div className="stack small-gap">
          {phaseWeeks.map((week) => (
            <div className="period-card" key={week.week}>
              <div className="period-top">
                <strong>{week.week} / {week.phase}</strong>
                <span className="pill neutral">{week.focus}</span>
              </div>
              <div className="mini-metric">
                <span>Intensity</span>
                <span>{week.intensity}%</span>
              </div>
              <div className="bar"><div className="fill warn" style={{ width: `${week.intensity}%` }} /></div>
              <div className="mini-metric">
                <span>Volume</span>
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
