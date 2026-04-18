import React from 'react'
import { tabs } from '../app/navigation.js'
import { storageStatusClass, storageStatusLabel, storageStatusText } from '../app/appHelpers.js'

export function AppHeader({ selectedWeek }) {
  return (
    <header className="top-card">
      <div>
        <p className="eyebrow">Foam Fighter Master Guide</p>
        <h1>Warlord Coach</h1>
        <p className="subtle">Phone-first training, logging, and feedback loop.</p>
      </div>
      <div className="cycle-badge">
        <span>Cycle</span>
        <strong>{selectedWeek}</strong>
      </div>
    </header>
  )
}

export function SaveStateBanner({ status, errors }) {
  return (
    <section className={`save-state ${storageStatusClass(status)}`}>
      <strong>{storageStatusLabel(status)}</strong>
      <span>{storageStatusText(status, errors)}</span>
    </section>
  )
}

export function DemoBanner() {
  return (
    <section className="demo-banner">
      <strong>Sample preview data</strong>
      <span>These logs are examples, not your history. Saving a new session exits sample mode.</span>
    </section>
  )
}

export function TodayHero({ metrics, onLogNow, todayPlan }) {
  const hasLogs = metrics.sessions > 0

  return (
    <section className={`hero-card hero-${todayPlan.color}`}>
      <div className="hero-row">
        <div>
          <div className="tiny-label">Today</div>
          <h2>{todayPlan.day}</h2>
          <p>{todayPlan.focus} / {todayPlan.system}</p>
        </div>
        <button className="metric-pill hero-action" onClick={onLogNow} type="button">Log now</button>
      </div>

      <div className="goal-box">
        <div className="tiny-label">Primary goal</div>
        <div>{todayPlan.goal}</div>
      </div>

      <div className="stats-grid compact-stats">
        <div className="stat-card">
          <span>Logged sessions</span>
          <strong className={hasLogs ? '' : 'small-stat'}>{hasLogs ? metrics.sessions : 'No logs yet'}</strong>
        </div>
        <div className="stat-card">
          <span>Real performance</span>
          <strong className="small-stat">{hasLogs ? `${metrics.winRate}% success` : 'Starts after logging'}</strong>
        </div>
      </div>
    </section>
  )
}

export function CoachFooter({ sessions, weaknessTarget }) {
  const hasLogs = sessions > 0

  return (
    <footer className="coach-footer">
      <div>
        <p className="eyebrow">{hasLogs ? 'Coach verdict' : 'Planned framework'}</p>
        <h4>{hasLogs ? 'Train the weakest variable next.' : 'Log sessions to unlock a verdict.'}</h4>
        <p>
          {hasLogs ? 'Most repeated problem this week: ' : 'Your real weakness target appears after logging: '}
          <strong>{weaknessTarget}</strong>.
        </p>
      </div>
    </footer>
  )
}

export function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="tab-bar" aria-label="Coach views">
      {tabs.map((item) => (
        <button
          key={item.id}
          className={activeTab === item.id ? 'tab active' : 'tab'}
          onClick={() => onChangeTab(item.id)}
          type="button"
          aria-label={item.label}
        >
          <span className="tab-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
