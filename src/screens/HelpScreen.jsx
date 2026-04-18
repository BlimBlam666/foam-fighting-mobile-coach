import React from 'react'

export function HelpScreen({ onShowOnboarding }) {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head wrap-head">
          <div>
            <h3>How to use this app</h3>
            <span className="subtle">A quick map for practice nights.</span>
          </div>
        </div>
        <div className="help-list">
          <article><strong>Home</strong><p>Shows today's focus, the session plan, and your current weakness target.</p></article>
          <article><strong>Log</strong><p>Save a session in under a minute. Tap an old log to edit or delete it.</p></article>
          <article><strong>Stats</strong><p>Turns your logs into success rate, energy, confidence, focus trends, and repeated problems.</p></article>
          <article><strong>Backup</strong><p>Your data lives on this device/browser. Export before changing devices or clearing browser data.</p></article>
          <article><strong>Plan</strong><p>Shows the weekly training structure and the four-week build/deload cycle.</p></article>
        </div>
      </section>

      <section className="panel">
        <h3>Weakness targeting</h3>
        <p className="guidance-text">Each log has a biggest problem. When the same problem repeats, the app promotes it as your current weakness target so your next session has a clear job.</p>
      </section>

      <section className="panel">
        <h3>Weekly planning</h3>
        <p className="guidance-text">Each day has one training focus. The monthly plan builds intensity for three weeks, then deloads in week four so practice stays sustainable.</p>
      </section>

      <section className="panel">
        <h3>Local data</h3>
        <p className="guidance-text">This app does not sync to an account. Backups are JSON files. Keep one before changing devices, clearing browser data, or testing in a new browser.</p>
        <button className="secondary-btn" onClick={onShowOnboarding} type="button">Show onboarding again</button>
      </section>
    </div>
  )
}
