import React from 'react'
import { phaseWeeks, weeklyPlan } from '../trainingData.js'

export function PlanScreen({ onUpdateSettings, selectedWeek }) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>Weekly training engine</h3>
            <span className="subtle">Each day has a system, goal, and success metric.</span>
          </div>
          <select value={selectedWeek} onChange={(event) => onUpdateSettings({ selectedWeek: event.target.value })}>
            {phaseWeeks.map((week) => <option key={week.week}>{week.week}</option>)}
          </select>
        </div>

        <div className="stack small-gap">
          {weeklyPlan.map((plan) => (
            <div className="week-row" key={plan.day}>
              <div>
                <strong>{plan.day}</strong>
                <p>{plan.focus} / {plan.system}</p>
              </div>
              <span className="pill neutral">{plan.metric}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Monthly periodization</h3>
          <span className="subtle">Build for 3 weeks, then deload.</span>
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
