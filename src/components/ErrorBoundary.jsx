import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed', error, info)
  }

  reloadApp = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="app-shell">
        <div className="phone-frame">
          <section className="panel error-panel" role="alert">
            <p className="eyebrow">Recovery</p>
            <h1>Foam Fighter Mobile Coach hit a problem.</h1>
            <p className="guidance-text">
              Your training data is stored locally in this browser. Try reloading first. If the app keeps crashing, export from a working browser/profile before clearing browser data.
            </p>
            <button className="primary-btn" onClick={this.reloadApp} type="button">Reload app</button>
          </section>
        </div>
      </main>
    )
  }
}
