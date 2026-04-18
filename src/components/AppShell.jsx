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
      <strong>Demo data</strong>
      <span>These logs are sample data. Saving a new session exits demo mode.</span>
    </section>
  )
}

export function TodayHero({ metrics, onLogNow, todayPlan }) {
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
        <div className="stat-card"><span>Sessions</span><strong>{metrics.sessions}</strong></div>
        <div className="stat-card"><span>Success Rate</span><strong>{metrics.winRate}%</strong></div>
      </div>
    </section>
  )
}

export function CoachFooter({ weaknessTarget }) {
  return (
    <footer className="coach-footer">
      <div>
        <p className="eyebrow">Coach verdict</p>
        <h4>Train the weakest variable next.</h4>
        <p>Most repeated problem this week: <strong>{weaknessTarget}</strong>.</p>
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
