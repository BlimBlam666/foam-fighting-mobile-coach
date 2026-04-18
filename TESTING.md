# Testing

This project uses Vitest with React Testing Library and jsdom. The goal is practical beta confidence, not exhaustive styling coverage.

## Run Tests

Install dependencies first:

```bash
npm install
```

Run the full test suite once:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

Confirm the production build still works:

```bash
npm run build
```

## What Is Covered

- Data contract validation for required `SessionLog` fields.
- Import parsing failures for empty files, invalid JSON, and unsupported schema versions.
- Legacy log migration into canonical `AppData`.
- `updateSessionLog()` behavior, including preserved `id`, preserved `createdAt`, preserved `schemaVersion`, and changed `updatedAt`.
- Merge import behavior by stable log ID, including newer conflict replacement and older conflict skipping.
- Derived metrics for sessions, wins/losses, minutes, win rate, averages, weakness targeting, focus stats, and metric result averages.
- App smoke render.
- UI flows for creating, editing, and deleting logs.
- Persistence through `localStorage` after app remount.
- Backup/restore UI coverage for valid merge import, invalid import, replace import, merge conflicts, and copyable JSON fallback.

## What Is Not Covered Yet

- Real browser download behavior for generated backup files. The test suite checks the copyable JSON fallback and leaves actual downloads to manual device testing.
- Cross-browser storage edge cases such as private browsing quota behavior, blocked storage, or very large backup files.
- Visual layout regression testing across phone sizes.
- Accessibility audits beyond queryable labels and basic interaction paths.
- Long-term migration paths beyond the current legacy log array and schema version checks.

Before beta release, do a short manual pass on an actual phone: create a few logs, refresh, edit one, export a backup, import it into another browser profile, and confirm the stats match.
