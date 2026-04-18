import React from 'react'

export function OnboardingModal({ onDismiss, onOpenHelp, onStartLog, show }) {
  if (!show) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Foam Fighter Mobile Coach">
      <section className="edit-sheet onboarding-sheet">
        <p className="eyebrow">Welcome</p>
        <h3>Train, log, adjust.</h3>
        <p className="guidance-text">Use this app after practice to record what happened, find repeated weaknesses, and choose the next thing to train.</p>

        <div className="onboarding-steps">
          <article><strong>1. Check Home</strong><span>See today's focus and session plan.</span></article>
          <article><strong>2. Log fast</strong><span>Use the Log tab right after practice. Notes are optional.</span></article>
          <article><strong>3. Watch patterns</strong><span>Stats and weakness targeting update from your saved logs.</span></article>
          <article><strong>4. Back up</strong><span>Data is stored on this device/browser. Export before changing devices.</span></article>
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
