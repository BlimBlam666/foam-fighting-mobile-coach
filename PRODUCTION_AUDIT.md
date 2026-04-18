# Foam Fighter Mobile Coach - Production Readiness Audit

## Executive Summary

The app is a small Vite + React single-page application optimized for local phone testing. It has a working mobile-first UI, local session logging, bottom navigation, localStorage persistence, and JSON export. It is a strong prototype/beta foundation, but it is not production-ready yet.

The biggest release risks are data durability, lack of tests, incomplete log management, hard-coded prototype metrics, no deploy configuration, and the single large `App.jsx` file mixing data, state, views, storage, metrics, and export behavior. The fastest path to beta is to stabilize the local data model, add basic validation and destructive-action safeguards, and create a repeatable deploy/test checklist.

## Current Architecture

### Project Shape

- `package.json`
  - Defines the app as an ESM Vite project.
  - Scripts:
    - `npm run dev`: starts Vite on `0.0.0.0` for phone testing on the same Wi-Fi.
    - `npm run build`: creates a production build in `dist/`.
    - `npm run preview`: serves the production build on `0.0.0.0`.
  - Dependencies are intentionally minimal: `react`, `react-dom`, Vite, and the React plugin.

- `index.html`
  - Provides the root `<div id="root"></div>`.
  - Includes mobile viewport metadata with `viewport-fit=cover`.
  - Loads `/src/main.jsx`.

- `src/main.jsx`
  - Imports React, ReactDOM, `App`, and `styles.css`.
  - Mounts `<App />` into `#root` inside `React.StrictMode`.

- `src/App.jsx`
  - Contains nearly all product logic and UI.
  - Defines static app data:
    - weekly training plan
    - periodization weeks
    - drill library
    - seed session logs
    - prototype metric cards
    - tab definitions
  - Defines local helper functions:
    - `todayIndex()`
    - `todayDate()`
    - `successClass()`
    - `normalizeLogs()`
    - `loadLogs()`
  - Defines React state:
    - active tab
    - session logs
    - selected training week
    - session log form fields
  - Defines derived state with `useMemo`:
    - today plan
    - weakness target
    - weekly stats
    - focus breakdown
  - Defines actions:
    - update form fields
    - change selected day
    - submit session log
    - reset logs to seed data
    - reload saved logs
    - export logs as JSON
  - Renders all screens directly:
    - Today
    - Log
    - Metrics
    - Week
    - Library
    - Footer
    - Sticky bottom navigation

- `src/styles.css`
  - Contains all global and component CSS.
  - Implements mobile-first layout, card styling, form controls, bottom nav, metrics ring, responsive grids, and safe-area padding.

- `Prototype Code.txt`
  - Original prototype source/reference. It is not used by the running app.

- `dist/`
  - Generated build output. It should not be treated as source.

- `node_modules/`
  - Installed dependencies. It should not be committed if this project is put under version control.

## State Flow

1. App startup
   - `main.jsx` mounts `App`.
   - `App` initializes `logs` with `useState(loadLogs)`.
   - `loadLogs()` reads `localStorage["foam-fighter-session-logs"]`.
   - Stored logs are parsed and passed through `normalizeLogs()`.
   - If storage is missing, invalid, or unreadable, seed logs are used.

2. Form state
   - The log form lives in local React state as `form`.
   - Inputs call `updateForm()` or `changeDay()`.
   - Changing the day updates the day, focus, and metric type from `weeklyPlan`.

3. Saving logs
   - Submitting the form creates a new log object.
   - The new log is prepended to `logs`.
   - The form resets to defaults.
   - The active tab changes to `metrics`.
   - A `useEffect` watches `logs` and writes the full array to localStorage.

4. Derived metrics
   - `weaknessTarget` counts repeated `problem` values.
   - `weeklyStats` calculates sessions, wins, losses, minutes, win rate, average energy, and average confidence.
   - `focusStats` groups logs by focus and calculates sessions, minutes, wins, and win rate.

5. Export
   - `exportLogs()` creates a JSON blob containing `exportedAt`, `storageKey`, and `logs`.
   - It creates a temporary anchor and triggers a browser download.

## Top 15 Issues Blocking Production Release

### Critical Bugs

1. Reset is destructive without confirmation
   - The Reset button immediately replaces user logs with seed logs.
   - Risk: accidental data loss during real training use.
   - Location: `src/App.jsx`, `clearLogs()`.

2. Metrics ring CSS may not accurately render the success percentage across all browsers
   - `conic-gradient(#10b981 var(--score, 70%), #e2e8f0 0)` depends on a custom property passed as a percentage.
   - It likely works in modern browsers, but it needs mobile Safari and Android validation.
   - Location: `src/styles.css`, `.score-ring`.

3. Export may fail or behave poorly in some mobile in-app browsers
   - Blob download via temporary anchor is not reliable in every IAB or mobile WebView.
   - Risk: users think data is backed up but cannot retrieve it.
   - Location: `src/App.jsx`, `exportLogs()`.

4. No runtime error boundary
   - A rendering error can still white-screen the entire app.
   - Previous startup issue proved this is a real risk.
   - Location: `src/main.jsx` and `src/App.jsx`.

### Product Gaps

5. Logs cannot be edited or deleted individually
   - Users can only add logs, export logs, reload logs, or reset all logs.
   - Production users will need to fix mistakes after fast phone entry.

6. Seed logs are mixed with real user data behavior
   - First launch starts with demo logs that look like real history.
   - Reset restores demo logs instead of creating an empty state.
   - This distorts metrics and can confuse users.

7. Several displayed metrics are hard-coded prototype data
   - Top hero metric cards and technique tracking do not come from user logs.
   - Risk: users trust numbers that are not derived from actual entries.
   - Location: `metricCards` and `techniqueRows` in `src/App.jsx`.

8. No onboarding or first-run empty state
   - A new user is not clearly told where data lives, whether it is private/local, or how to back it up.
   - The product goal is durable local data, so this needs explicit UX.

9. No import/restore path
   - Export exists, but there is no matching JSON import.
   - A phone replacement, browser clear, or migration cannot restore prior logs.

### UX/Mobile Issues

10. Bottom nav uses text-letter icons instead of recognizable symbols
   - The nav is functional, but `T`, `+`, `%`, `W`, `D` are not ideal affordances.
   - This is acceptable for beta but weak for production polish.

11. Form is still long for post-practice phone entry
   - The log screen asks for many fields in one pass.
   - There is no collapsed advanced section, quick-save mode, or defaults based on today's plan beyond day/focus/metric.

12. Some controls and rows may become cramped on narrow phones
   - The three-button Load/Export/Reset row can be tight on small screens.
   - Long weakness text can expand cards heavily.
   - Needs visual QA at 320px, 360px, 390px, and common iPhone/Android heights.

13. Accessibility is incomplete
   - Buttons have labels, but there are no focus states beyond browser defaults.
   - The score ring communicates meaning visually without an explicit accessible text alternative.
   - Color-coded `good`, `warn`, and `bad` states rely partly on color.

### Data/Storage Issues

14. localStorage is durable but not robust enough alone
   - localStorage can be cleared by browsers, privacy modes, IABs, or device cleanup.
   - Writes can fail silently.
   - There is no backup reminder, import path, schema version, or migration strategy.

15. Log schema validation is permissive and lossy
   - `normalizeLogs()` fills missing data and coerces values, but it can hide corrupted or partially incompatible data.
   - There is no `id`, `createdAt`, `updatedAt`, app version, or schema version on entries.

## Issue Groups

### Critical Bugs

- Destructive reset has no confirmation.
- Export may fail in mobile IABs without fallback.
- No error boundary for runtime crashes.
- Metrics ring needs cross-browser validation.

### Product Gaps

- No edit/delete per log.
- No import/restore path.
- Demo seed data is mixed into the real product experience.
- Some metrics are hard-coded prototype values.
- No onboarding or local-data explanation.

### UX/Mobile Issues

- Bottom nav icon affordances are not production quality.
- Long form is not optimized enough for tired, post-practice entry.
- Small-phone layout needs visual QA.
- Accessibility states and non-color indicators are incomplete.

### Data/Storage Issues

- localStorage has no schema version or migration path.
- localStorage failures are swallowed without user-visible status.
- No backup reminders or import path.
- Logs lack stable IDs and timestamps.
- Reset overwrites logs with demo data instead of offering clear choices.

### Testing Gaps

- No test framework is installed.
- No unit tests for `normalizeLogs()`, metrics calculations, export payload shape, or form submission.
- No component/integration tests for adding a log and seeing it persist.
- No mobile viewport regression tests.
- No manual QA checklist for iOS Safari, Android Chrome, and in-app browsers.
- No accessibility audit.

### Deployment/Release Gaps

- No README with install, phone testing, build, preview, and deploy instructions.
- No hosting target documented.
- No CI or repeatable release check.
- No `.gitignore`, so generated folders/logs could be committed accidentally.
- No production environment metadata, app icons, manifest, or PWA configuration.
- `dist/`, `node_modules/`, and dev logs currently exist in the workspace and should be excluded from source control.

## Phased Implementation Plan

### Phase 1: Must-Have For Beta

Goal: make the app safe enough for real phone testing with local data.

1. Add data-loss protection
   - Confirm before Reset.
   - Change Reset behavior to clear to an empty log list or clearly label it as "Restore demo logs".
   - Add a separate "Clear all logs" action only behind confirmation.

2. Add stable log IDs and timestamps
   - Include `id`, `createdAt`, `updatedAt`, and `schemaVersion` on every new log.
   - Normalize old logs into the new shape.

3. Add import/restore JSON
   - Pair existing export with a local JSON import flow.
   - Validate imported JSON before replacing or merging data.
   - Offer merge vs replace.

4. Replace hard-coded production-facing metrics
   - Remove or clearly mark prototype metric cards.
   - Drive the dashboard from actual session logs.
   - Keep technique tracking only if entries support technique-level attempts/successes.

5. Improve localStorage user feedback
   - Show a small status: "Saved on this device", "Save failed", or "Storage unavailable".
   - Avoid silent failure as the only behavior.

6. Add beta QA checklist
   - Document iPhone Safari, Android Chrome, and IAB checks.
   - Include refresh persistence, add log, export, import, reset confirmation, and bottom-nav overlap checks.

7. Add `.gitignore`
   - Exclude `node_modules/`, `dist/`, Vite logs, OS files, and local temp files.

8. Add README
   - Include `npm install`, `npm run dev`, phone Wi-Fi URL guidance, `npm run build`, and `npm run preview`.

### Phase 2: Must-Have For Production

Goal: make the app reliable, maintainable, deployable, and testable.

1. Split `App.jsx` into focused modules
   - `data/trainingPlan.js`
   - `storage/logStorage.js`
   - `utils/metrics.js`
   - `components/BottomNav.jsx`
   - `screens/TodayScreen.jsx`
   - `screens/LogScreen.jsx`
   - `screens/MetricsScreen.jsx`
   - `screens/WeekScreen.jsx`
   - `screens/LibraryScreen.jsx`

2. Add automated tests
   - Unit tests for storage normalization and metrics.
   - Component tests for log submission and rendered metrics.
   - A smoke test that mounts the app without crashing.

3. Add error boundary
   - Render a recoverable error screen instead of a blank page.
   - Include "Reload app" and "Export local data if possible".

4. Harden mobile export/import
   - Add a fallback that displays JSON in a selectable textarea if blob download fails.
   - Validate export works on iOS Safari, Android Chrome, and target IAB.

5. Improve accessibility
   - Add visible focus states.
   - Add screen-reader text for score ring and metric summaries.
   - Ensure color-coded statuses also include text labels.
   - Verify contrast.

6. Create deployment configuration
   - Choose target: Netlify, Vercel, GitHub Pages, Cloudflare Pages, or static file host.
   - Document base path if needed.
   - Add preview instructions from `dist/`.

7. Add CI or a release script
   - Run install, build, tests, and maybe lint on every release.
   - Produce a repeatable pass/fail release checklist.

8. Add PWA basics if local-first is a product goal
   - Web app manifest.
   - App icons.
   - Offline caching strategy.
   - Clear messaging that data is local to the browser/device.

### Phase 3: Nice-To-Have After Launch

Goal: improve retention, coaching quality, and data usefulness.

1. Add richer training analytics
   - Trends by week.
   - Weakness recurrence over time.
   - Best/worst drills.
   - Streaks and training consistency.

2. Add customizable training plan
   - Let users edit daily focus, drills, and metrics.
   - Save plan settings locally.

3. Add quick-log mode
   - One-screen "minimum viable log" after practice.
   - Optional advanced fields.

4. Add technique-level logging
   - Attempts, successes, clean hits, failure cause.
   - Make technique tracking real instead of static.

5. Add reminders or calendar export
   - Local notification/PWA reminder if supported.
   - Downloadable calendar schedule.

6. Add multi-device sync only if needed
   - Keep local-first as the default.
   - If sync is added, define auth, privacy, export, and deletion policies first.

7. Add theming and branding polish
   - Replace letter icons with better iconography.
   - Add app icon and splash assets.
   - Refine copy and empty states.

## Recommended Beta Exit Criteria

- User can add a real log on a phone in under 60 seconds.
- Refresh preserves logs.
- Close/reopen browser preserves logs.
- Export creates usable JSON on target mobile browsers.
- Import restores that JSON.
- Reset cannot destroy data without confirmation.
- Metrics are based only on real logs or clearly labeled demo data.
- `npm install`, `npm run dev`, `npm run build`, and `npm run preview` are documented and verified.
- Source control excludes generated files.
- A manual QA checklist exists and has been run on at least one iPhone and one Android device.

## Current Release Readiness

- Prototype readiness: high.
- Beta readiness: medium after Phase 1.
- Production readiness: low until Phase 2 is complete.

The app is close to a useful local beta, but production should wait until data safety, import/restore, testing, deploy docs, and source organization are addressed.
