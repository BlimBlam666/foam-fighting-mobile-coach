import React from 'react'

export function HomeScreen({ logs, metrics, onLogClick, saveMessage, todayPlan }) {
  return (
    <div className="stack">
      {logs.length === 0 && (
        <section className="panel empty-state-panel">
          <h3>Start with one session</h3>
          <p>Add your first practice log. The app will use it to find repeated weaknesses and update your weekly stats.</p>
          <button className="primary-btn" onClick={onLogClick} type="button">Log first session</button>
        </section>
      )}

      {saveMessage && (
        <section className="callout success">
          <strong>Saved</strong>
          <p>{saveMessage}</p>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h3>Olympic Coach session</h3>
          <span className="subtle">90 min ideal / 45 min minimum.</span>
        </div>
        <div className="callout success">
          <strong>{todayPlan.title}</strong>
          <p>{todayPlan.focus} / {todayPlan.system}</p>
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
          <h3>Coach prompts</h3>
        </div>
        <div className="callout success">
          <strong>Day goal</strong>
          <p>{todayPlan.goal}</p>
        </div>
        <div className="callout success">
          <strong>Tracked metrics</strong>
          <p>{todayPlan.trackedMetrics.join(', ')}</p>
        </div>
        <div className="callout warning">
          <strong>Current weakness target</strong>
          <p>{logs.length === 0 ? 'Log a few sessions first. Repeated problems will show up here.' : metrics.weaknessTarget}</p>
        </div>
          <div className="chip-wrap">
          {todayPlan.requiredDrills.map((item) => (
            <span className="chip" key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="panel dark-panel">
        <div className="panel-head">
          <h3>Pre-fight ritual</h3>
        </div>
        <ul className="ritual-list">
          {['Gear check', 'Breathing reset', 'One process goal', 'One confidence cue', 'One visualization rep'].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
