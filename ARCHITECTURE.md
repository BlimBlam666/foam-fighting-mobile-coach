# Architecture

This app is a mobile-first Vite React app with local-first persistence. The current structure keeps beta behavior simple while separating screen rendering, shared UI, app state orchestration, and domain logic.

## File Tree

```text
src/
  App.jsx
  main.jsx
  styles.css
  app/
    appHelpers.js
    navigation.js
  components/
    AppShell.jsx
    LogEditorModal.jsx
    OnboardingModal.jsx
  hooks/
    useCoachApp.js
  screens/
    BackupScreen.jsx
    HelpScreen.jsx
    HomeScreen.jsx
    LibraryScreen.jsx
    LogScreen.jsx
    MetricsScreen.jsx
    PlanScreen.jsx
  dataModel.js
  metrics.js
  coachReview.js
  storage.js
  trainingData.js
  test/
    App.test.jsx
    dataModel.test.js
    metrics.test.js
    setup.js
    testUtils.js
```

## Responsibilities

`src/App.jsx`

The top-level composition component. It calls `useCoachApp()`, renders the shared shell, chooses the active screen, and wires hook state/actions into child components.

`src/hooks/useCoachApp.js`

The main app controller. It owns React state and user actions:

- loading and saving `AppData`
- creating session logs
- editing/deleting session logs
- structured Olympic metric fields on logs
- controlled mistake taxonomy selection
- onboarding state
- active tab state
- import/export UI state
- schedule preset and custom weekday mapping
- demo data loading
- derived metrics

This hook is intentionally the only place where UI events are translated into data mutations.

`src/app/appHelpers.js`

Small app-level helpers used by both the hook and UI:

- initial log form shape
- log-to-edit-form mapping
- current weekday index
- storage status labels/text/classes
- file reading helper
- success color class helper

`src/app/navigation.js`

Bottom navigation tab definitions.

`src/components/`

Reusable app UI that is not a full screen:

- `AppShell.jsx`: header, save-state banner, demo banner, hero card, footer, bottom nav
- `LogEditorModal.jsx`: per-log edit/delete sheet
- `OnboardingModal.jsx`: first-run onboarding sheet

`src/screens/`

Screen-level rendering only. These components receive state and callbacks from `App.jsx` and avoid owning persistence/business logic.

- `HomeScreen.jsx`: today plan, prompts, empty start state, save confirmation
- `LogScreen.jsx`: quick log form, local data actions, recent log list
- `MetricsScreen.jsx`: weekly metrics, focus breakdown, metric result summaries
- `BackupScreen.jsx`: export fallback, import merge/replace, destructive actions
- `HelpScreen.jsx`: persistent help and onboarding replay
- `PlanScreen.jsx`: weekly plan and periodization
- `PlanScreen.jsx`: Olympic Coach schedule presets, manual weekday mapping, and periodization
- `LibraryScreen.jsx`: drill library view retained for the existing hidden tab path

`src/dataModel.js`

Canonical client-side data contract and validation/migration logic. This file defines `AppData`, `SessionLog`, schema versions, strict parsing, legacy migration, and merge behavior.

`AppData` schema version 4 adds controlled mistake taxonomy IDs to `SessionLog` schema version 3 while preserving the generic `metricType/result` fallback path and free-text problem detail.

`src/storage.js`

The localStorage boundary. Components and screens should not read or write raw `localStorage`; they should go through the hook, which uses this module.

`src/metrics.js`

Pure derived metrics from session logs. Program tracking prefers structured Olympic fields and falls back to numeric `metricType/result` values for older logs. Weakness targeting prefers the controlled mistake taxonomy and falls back to legacy free text when needed.

`src/coachReview.js`

Pure rule-based weekly review logic. It turns logs into trend summaries, taxonomy-based weakness prioritization, coach verdicts, next-week focus, and Sunday review prompts. It does not use AI or hidden scoring.

`src/trainingData.js`

Olympic Coach program content: training focus definitions, schedule presets, weekday schedule helpers, periodization, drill library, and optional demo data.

`src/test/`

Vitest and React Testing Library coverage for beta-critical data, metrics, storage, import/export, and UI flows.

## Data Flow

1. `App.jsx` mounts and calls `useCoachApp()`.
2. `useCoachApp()` calls `loadAppData()` from `storage.js`.
3. `storage.js` reads localStorage and delegates parsing/migration to `dataModel.js`.
4. The hook stores canonical `AppData` in React state, including schedule settings.
5. `useCoachApp()` derives the active weekly plan from `settings.customSchedule`.
6. Screens render from hook state passed through `App.jsx`.
7. User actions call hook methods such as `submitLog()`, `saveEditedLog()`, `deleteEditedLog()`, `applyScheduleTemplate()`, `updateScheduleDay()`, or `importFromFile()`.
8. Hook methods create or update canonical data through `dataModel.js`.
9. A `useEffect()` in `useCoachApp()` persists changed `AppData` through `saveAppData()`.
10. `metrics.js` derives dashboard values from the current log array.
11. `coachReview.js` derives transparent weekly coaching guidance for the Stats screen.

## Extension Guidelines

- Add new full-page views under `src/screens/`.
- Add reusable layout or modal pieces under `src/components/`.
- Keep validation, migration, and merge rules in `src/dataModel.js`.
- Keep raw browser storage access in `src/storage.js`.
- Put new app-wide helpers in `src/app/appHelpers.js` only if they are shared by multiple modules.
- Prefer adding behavior to `useCoachApp()` before passing callbacks down to screens.
- Keep screens mostly presentational so future tests can target behavior through the hook and visible UI.
