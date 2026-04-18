import React from 'react'
import { successClass } from '../app/appHelpers.js'
import { calculateWeeklyCoachReview } from '../coachReview.js'

export function MetricsScreen({ logs, metrics, onExportLogs, onLogClick }) {
  const review = calculateWeeklyCoachReview(logs)

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
        <div className="panel-head wrap-head">
          <div>
            <h3>Weekly coach review</h3>
            <span className="subtle">{review.rangeLabel}</span>
          </div>
          <span className="pill neutral">{review.sessions} sessions / {review.minutes} min</span>
        </div>

        {review.sparse && (
          <div className="callout warning">
            <strong>Sparse week</strong>
            <p>Log at least two sessions this week for stronger trend guidance.</p>
          </div>
        )}

        <div className="stats-grid metric-grid">
          <TrendCard label="Clean reps" trend={review.trends.cleanReps} />
          <TrendCard label="Accuracy" suffix="%" trend={review.trends.accuracy} />
          <TrendCard label="Spar performance" suffix="%" trend={review.trends.sparPerformance} />
          <TrendCard label="Conditioning" trend={review.trends.conditioning} />
          <TrendCard label="Mistakes" trend={review.trends.mistakeFrequency} />
          <div className="stat-card">
            <span>Main weakness</span>
            <strong className="small-stat">{review.weakness.label}</strong>
            <span>{review.weakness.count ? `${review.weakness.count} mentions` : 'No repeated problem yet'}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Coach verdict</h3>
        </div>
        <div className="stack small-gap">
          {review.verdict.map((line) => (
            <div className="callout success" key={line}>
              <p>{line}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Next week focus</h3>
        </div>
        <p className="guidance-text">{review.nextWeekFocus}</p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Sunday review</h3>
        </div>
        <ul className="ritual-list">
          {review.sundayReview.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Olympic tracking system</h3>
          <span className="subtle">Weekly measures for Warlord acceleration.</span>
        </div>
        <div className="stats-grid metric-grid">
          {metrics.programTracking.map((item) => (
            <div className="stat-card" key={item.key}>
              <span>{item.label}</span>
              <strong className="small-stat">
                {item.averageResult === null ? 'n/a' : `${item.averageResult}${item.suffix}`}
              </strong>
              <span>{item.count ? `${item.count} ${item.source === 'structured' ? 'structured' : 'legacy'} logs` : item.empty}</span>
            </div>
          ))}
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

function TrendCard({ label, suffix = '', trend }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong className="small-stat">
        {trend.direction === 'insufficient' ? 'n/a' : `${trend.startAverage}${suffix} -> ${trend.endAverage}${suffix}`}
      </strong>
      <span>{trend.label}</span>
    </div>
  )
}
