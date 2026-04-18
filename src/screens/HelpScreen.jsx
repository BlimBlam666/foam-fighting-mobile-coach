import React from 'react'

export function HelpScreen({ onShowOnboarding }) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>How to use this app</h3>
            <span className="subtle">Olympic Coach program map for park schedules.</span>
          </div>
        </div>
        <div className="help-list">
          <article><strong>Home</strong><p>Shows today's scheduled Olympic Coach focus, system type, day goal, and weakness target.</p></article>
          <article><strong>Log</strong><p>Save a session with the day's expected metrics, 5-phase structure, and required drills.</p></article>
          <article><strong>Stats</strong><p>Shows real logged performance only after you save sessions. A clean first run has no history yet.</p></article>
          <article><strong>Backup</strong><p>Your data lives on this device/browser. Export before changing devices or clearing browser data.</p></article>
          <article><strong>Plan</strong><p>Shows planned training targets, schedule presets, and manual park-day mapping. It is not completed performance history.</p></article>
        </div>
      </section>

      <section className="panel">
        <h3>Coaching philosophy</h3>
        <p className="guidance-text">Diagnose weakness, isolate variable, overload specifically, pressure test, measure outcome, repeat.</p>
      </section>

      <section className="panel">
        <h3>Weekly planning</h3>
        <p className="guidance-text">The default split runs six training days plus one recovery day. Use Plan to keep the same systems while moving competition, practice, or recovery around real park days.</p>
      </section>

      <section className="panel">
        <h3>Local data</h3>
        <p className="guidance-text">This app starts with no real history. Optional sample preview data appears only when you explicitly load it. Backups are JSON files; keep one before changing devices, clearing browser data, or testing in a new browser.</p>
        <button className="secondary-btn" onClick={onShowOnboarding} type="button">Show onboarding again</button>
      </section>
    </div>
  )
}
