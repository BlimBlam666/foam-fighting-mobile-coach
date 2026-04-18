import React from 'react'
import { successClass } from '../app/appHelpers.js'

export function MetricsScreen({ logs, metrics, onExportLogs, onLogClick }) {
  return (
    <div className="stack">
      {logs.length === 0 && (
        <section className="panel empty-state-panel">
          <h3>No metrics yet</h3>
          <p>Metrics appear after you save session logs. Start with one quick log after practice.</p>
          <button className="primary-btn" onClick={onLogClick} type="button">Log a session</button>
        </section>
      )}

      <section className="panel metric-hero">
        <div className="panel-head wrap-head">
          <div>
            <h3>Weekly metrics</h3>
            <span className="subtle">{metrics.sessions} sessions / {metrics.minutes} minutes logged.</span>
          </div>
          <button className="ghost-btn export-btn" onClick={onExportLogs} type="button">Export JSON</button>
        </div>
        <div className="score-ring" style={{ '--score': `${metrics.winRate}%` }}>
          <div>
            <span>Success rate</span>
            <strong>{metrics.winRate}%</strong>
          </div>
        </div>
        <div className="stats-grid metric-grid">
          <div className="stat-card"><span>Wins / Losses</span><strong>{metrics.wins}/{metrics.losses}</strong></div>
          <div className="stat-card"><span>Avg Energy</span><strong>{metrics.avgEnergy}/10</strong></div>
          <div className="stat-card"><span>Avg Confidence</span><strong>{metrics.avgConfidence}/10</strong></div>
          <div className="stat-card"><span>Weakness</span><strong className="small-stat">{metrics.weaknessTarget}</strong></div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Focus breakdown</h3>
        </div>
        <div className="stack small-gap">
          {metrics.focusStats.length === 0 && <p className="empty-state">Add a session to see focus trends.</p>}
          {metrics.focusStats.map((row) => (
            <div className="progress-card" key={row.focus}>
              <div className="progress-row">
                <div>
                  <strong>{row.focus}</strong>
                  <p>{row.sessions} sessions / {row.minutes} minutes</p>
                </div>
                <span className={`pill ${successClass(row.winRate)}`}>{row.winRate}%</span>
              </div>
              <div className="bar"><div className={`fill ${successClass(row.winRate)}`} style={{ width: `${row.winRate}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Metric results</h3>
          <span className="subtle">Derived from numeric log results.</span>
        </div>
        <div className="stack small-gap">
          {metrics.metricTypeStats.length === 0 && <p className="empty-state">No metric results yet.</p>}
          {metrics.metricTypeStats.map((row) => (
            <div className="cod-row" key={row.metricType}>
              <span>{row.metricType}</span>
              <strong>{row.averageResult === null ? 'n/a' : row.averageResult}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
