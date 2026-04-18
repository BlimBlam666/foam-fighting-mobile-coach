# Foam Fighter Mobile Coach

A mobile-first beta app for the Olympic Coach foam fighting program: Warlord acceleration, practice logs, weekly metrics, schedule customization, periodization, and local JSON backup/restore.

The app is intentionally local-first: training data is stored in the current device/browser using `localStorage`. There is no account, server database, or cloud sync.

## Current Beta Features

- Quick session logging optimized for phones.
- Olympic Coach default program with 6 training days plus 1 recovery day.
- Schedule presets and manual weekday remapping for real park practice.
- Per-log edit and delete with confirmation.
- Weekly metrics for clean reps, spar wins, accuracy, conditioning rounds, mistakes, and placement.
- Weakness targeting based on repeated logged problems.
- Weekly plan and periodization reference.
- First-run onboarding and persistent help screen.
- Save-state feedback for local storage.
- Full JSON export.
- JSON import with replace or merge-by-ID behavior.
- Local schema validation, migration support, and automated tests.

## Setup

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Vite is configured with `--host 0.0.0.0`, so phone testing on the same Wi-Fi is supported. Use the local network URL printed by Vite, usually something like:

```text
http://192.168.x.x:5173/
```

## Test

Run automated tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Main Files

- `src/App.jsx`: top-level composition.
- `src/hooks/useCoachApp.js`: app state and user actions.
- `src/screens/`: screen-level UI.
- `src/components/`: reusable shell and modal components.
- `src/dataModel.js`: canonical data model, validation, migration, import merge logic.
- `src/storage.js`: localStorage boundary.
- `src/metrics.js`: derived metrics.
- `src/trainingData.js`: weekly plan, periodization, drill library, demo data.
- `src/test/`: Vitest and React Testing Library tests.

See `ARCHITECTURE.md` for the full structure and data flow.

## Local-Only Storage Warning

Data lives only in the browser storage for the exact device/browser being used. Users should export a JSON backup before:

- changing phones
- clearing browser data
- using private/incognito mode
- uninstalling the browser
- switching browsers
- testing risky beta changes

Mobile browsers can handle file downloads and file uploads differently. If export download does not appear, use the copyable JSON fallback on the Backup screen.

## Release Docs

- `DEPLOY.md`: Vercel/static deployment instructions.
- `RELEASE_CHECKLIST.md`: beta release gate checklist.
- `MANUAL_QA_CHECKLIST.md`: real-device QA checklist.
- `TESTING.md`: automated test coverage.
- `BACKUP_AND_RESTORE.md`: backup/restore behavior.
- `DATA_MODEL.md`: data model and migration details.
