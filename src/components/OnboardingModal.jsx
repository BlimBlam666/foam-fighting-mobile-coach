import React from 'react'

export function OnboardingModal({ onDismiss, onOpenHelp, onStartLog, show }) {
  if (!show) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Foam Fighter Mobile Coach">
      <section className="edit-sheet onboarding-sheet">
        <p className="eyebrow">Welcome</p>
        <h3>Olympic Coach: train, log, adjust.</h3>
        <p className="guidance-text">Use the 6-day Warlord acceleration program to acquire skill fast without burning out.</p>

        <div className="onboarding-steps">
          <article><strong>1. Check Home</strong><span>See today's focus, system type, goal, and required drills.</span></article>
          <article><strong>2. Match your park schedule</strong><span>Use Plan presets or manually remap training days.</span></article>
          <article><strong>3. Log the metric</strong><span>Track the day's expected measure after practice.</span></article>
          <article><strong>4. Repeat the loop</strong><span>Diagnose weakness, isolate, overload, pressure test, measure.</span></article>
        </div>

        <div className="edit-actions">
          <button className="primary-btn" onClick={onStartLog} type="button">Start with a log</button>
          <button className="ghost-btn" onClick={onOpenHelp} type="button">Read help first</button>
          <button className="ghost-btn" onClick={onDismiss} type="button">Not now</button>
        </div>
      </section>
    </div>
  )
}
