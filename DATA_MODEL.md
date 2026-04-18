# Foam Fighter Mobile Coach Data Model

## Goals

The beta data contract is designed for local-first use. It keeps data durable in browser storage, supports explicit migrations from prototype data, rejects malformed imports, and gives the UI real metrics derived from saved logs.

Cloud sync is intentionally out of scope for this version.

## Version Constants

- `APP_SCHEMA_VERSION = 3`
- `SESSION_LOG_SCHEMA_VERSION = 2`
- Primary localStorage key: `foam-fighter-app-data-v1`
- Legacy prototype localStorage key: `foam-fighter-session-logs`

The production storage unit is always `AppData`. The old prototype stored a raw array of logs; that shape is treated only as a legacy migration source.

## Canonical Shapes

### SessionLog

Every saved session log must contain all of these fields:

```js
{
  id: 'log_uuid-or-legacy-id',
  schemaVersion: 2,
  createdAt: '2026-04-17T19:30:00.000Z',
  updatedAt: '2026-04-17T19:30:00.000Z',
  date: '2026-04-17',
  day: 'Friday',
  focus: 'Weakness',
  duration: 45,
  mainDrill: 'Bad blocks',
  metricType: 'Mistake frequency',
  result: '70',
  success: 'Yes',
  energy: 7,
  confidence: 7,
  win: 'Cleaner reset after pressure',
  problem: 'Late retreat',
  attempts: 80,
  successes: 72,
  cleanReps: 70,
  sparWins: null,
  sparLosses: null,
  conditioningRoundsSurvived: null,
  mistakeCount: 4,
  tournamentPlacement: null
}
```

Validation rules:

- `id`: non-empty string.
- `schemaVersion`: must equal `2`.
- `createdAt`: valid ISO date-time string.
- `updatedAt`: valid ISO date-time string.
- `date`: `YYYY-MM-DD` string.
- `day`: non-empty string.
- `focus`: non-empty string.
- `duration`: finite number, minimum `0`.
- `mainDrill`: non-empty string.
- `metricType`: non-empty string.
- `result`: non-empty string.
- `success`: exactly `Yes` or `No`.
- `energy`: finite number from `0` to `10`.
- `confidence`: finite number from `0` to `10`.
- `win`: non-empty string.
- `problem`: non-empty string.
- `attempts`: optional finite number or `null`, minimum `0`.
- `successes`: optional finite number or `null`, minimum `0`; when `attempts` exists, must be `<= attempts`.
- `cleanReps`: optional finite number or `null`, minimum `0`.
- `sparWins`: optional finite number or `null`, minimum `0`.
- `sparLosses`: optional finite number or `null`, minimum `0`.
- `conditioningRoundsSurvived`: optional finite number or `null`, minimum `0`.
- `mistakeCount`: optional finite number or `null`, minimum `0`.
- `tournamentPlacement`: optional finite number or `null`, minimum `1`.

`metricType` and `result` remain required as a flexible fallback and for older logs. New Olympic Coach metrics should prefer the structured optional fields when available.

New logs are created through `createSessionLog()` in `src/dataModel.js`, which adds IDs, timestamps, and schema version before validation.

### UserSettings

```js
{
  selectedWeek: 'Week 2',
  demoMode: false,
  onboardingCompleted: false,
  scheduleTemplate: 'standardOlympic',
  customSchedule: {
    Monday: 'technicalPrecision',
    Tuesday: 'movementRange',
    Wednesday: 'tacticalIq',
    Thursday: 'pressureConditioning',
    Friday: 'weaknessIsolation',
    Saturday: 'competitionSimulation',
    Sunday: 'activeRecovery'
  }
}
```

Validation rules:

- `selectedWeek`: non-empty string.
- `demoMode`: boolean.
- `onboardingCompleted`: boolean.
- `scheduleTemplate`: known preset ID or `custom`.
- `customSchedule`: every weekday must map to a known Olympic Coach training focus ID.

`demoMode` exists so sample data can be clearly labeled and separated from real user behavior.
Schedule settings are exported/imported with `AppData` so real-world park scheduling survives reloads and backups.

### AppData

```js
{
  schemaVersion: 3,
  logs: [SessionLog],
  settings: UserSettings,
  metadata: {
    appName: 'Foam Fighter Mobile Coach',
    createdAt: '2026-04-17T19:30:00.000Z',
    updatedAt: '2026-04-17T19:30:00.000Z',
    exportedAt: null,
    migratedFrom: null
  }
}
```

Validation rules:

- `schemaVersion`: must equal `3`.
- `logs`: array of valid `SessionLog` objects.
- `settings`: valid `UserSettings` object.
- `metadata.appName`: non-empty string.
- `metadata.createdAt`: valid ISO date-time string.
- `metadata.updatedAt`: valid ISO date-time string.
- `metadata.exportedAt`: `null` or valid ISO date-time string.
- `metadata.migratedFrom`: informational migration source; currently not strict.

### WeeklyPlanDay

Weekly plan days are derived from static Olympic Coach focus definitions plus the user's saved schedule. They live in `src/trainingData.js`.

```js
{
  day: 'Monday',
  short: 'Mon',
  focus: 'Mechanics + Technical Precision',
  system: 'Neural',
  metric: 'Accuracy %',
  trackedMetrics: ['Accuracy %', 'Clean reps', 'Form breakdown %'],
  color: 'rose',
  goal: 'Perfect mechanics by isolating one shot.',
  requiredDrills: ['Pick ONE shot only', '10 slow-motion reps'],
  phases: ['Mobility and wrist/elbow/shoulder prep'],
  drillIdeas: ['10 slow']
}
```

The default Olympic Coach split is:

- Monday: Technical Precision / Neural
- Tuesday: Movement and Range / Movement
- Wednesday: Tactical IQ / Cognitive
- Thursday: Pressure and Conditioning / Stress
- Friday: Weakness Isolation / Adaptive
- Saturday: Competition Simulation / Performance
- Sunday: Active Recovery / Recovery

Schedule presets are `standardOlympic`, `fightersPracticeWednesday`, and `fullParkSunday`. Manual remapping stores `scheduleTemplate: 'custom'`.

### PeriodizationWeek

Periodization weeks are static app content, not user data. They live in `src/trainingData.js`.

```js
{
  week: 'Week 1',
  phase: 'Accumulation',
  intensity: 60,
  volume: 85,
  focus: 'Volume + Technique'
}
```

### DerivedMetrics

Derived metrics are not persisted. They are recalculated from `AppData.logs` by `calculateDerivedMetrics()` in `src/metrics.js`.

```js
{
  sessions: 3,
  wins: 1,
  losses: 2,
  minutes: 225,
  winRate: 33,
  avgEnergy: 7,
  avgConfidence: 6,
  weaknessTarget: 'Late retreat',
  focusStats: [
    {
      focus: 'Mechanics',
      sessions: 1,
      wins: 0,
      minutes: 90,
      winRate: 0
    }
  ],
  metricTypeStats: [
    {
      metricType: 'Accuracy %',
      count: 1,
      averageResult: 82
    }
  ]
}
```

Rules:

- Metrics are derived from real logs currently loaded in `AppData`.
- Non-numeric `result` values are ignored for `averageResult`.
- No prototype technique metrics are shown unless the data exists in logs.

## Storage Flow

### Load

`loadAppData()` in `src/storage.js` is the only app helper that reads from localStorage.

Load order:

1. Read `foam-fighter-app-data-v1`.
2. Parse as JSON.
3. Validate as current `AppData`.
4. If current data is missing or invalid, attempt legacy migration from `foam-fighter-session-logs`.
5. If both fail, return empty valid `AppData` with an error status.

Corrupt stored data must not crash the app. It returns:

```js
{
  appData: createEmptyAppData(),
  status: 'invalid',
  errors: ['stored app data is not valid JSON']
}
```

### Save

`saveAppData(appData)` validates the full `AppData` object before writing.

If validation fails, it returns:

```js
{
  ok: false,
  appData,
  errors: ['logs[0]: duration must be a finite number']
}
```

Components do not write directly to localStorage.

### Export

`createExportPayload(appData)` creates a valid `AppData` export with `metadata.exportedAt` set to the current ISO timestamp.

The current UI downloads this as:

```text
foam-fighter-app-data-YYYY-MM-DD.json
```

### Import

Full import UI is not implemented yet. The parser already supports the required contract:

- Current `AppData` objects are validated strictly.
- Legacy raw log arrays can be migrated.
- Invalid shapes are rejected with clear errors.

Future import UI should call `parseImportedAppData(value)` from `src/dataModel.js`, show errors to the user, and offer replace/merge choices.

## Migration Flow

### Version 1 AppData

`AppData` schema version 1 is migrated to the current schema by adding the Olympic Coach schedule settings:

- `scheduleTemplate: 'standardOlympic'`
- `customSchedule`: the standard Olympic split

Existing logs remain `SessionLog` schema version 1. The migration does not infer richer metric fields from old free-text logs.

### Version 2 AppData

`AppData` schema version 2 is migrated to schema version 3 by upgrading logs to `SessionLog` schema version 2. The structured Olympic metric fields are added as `null` when absent:

- `attempts`
- `successes`
- `cleanReps`
- `sparWins`
- `sparLosses`
- `conditioningRoundsSurvived`
- `mistakeCount`
- `tournamentPlacement`

The migration intentionally does not infer structured values from old `metricType/result` pairs. Older data remains available through the fallback metric parser.

### Version 0 Prototype Data

Prototype data was either:

- a raw array in `foam-fighter-session-logs`, or
- an imported object with a `logs` array but no top-level `schemaVersion`.

The migration path is explicit:

1. `parseImportedAppData(value)` detects a legacy array or legacy object.
2. `migrateLegacyLogArray(logs)` validates that every legacy item has the required prototype fields.
3. Each legacy item is migrated through `migrateLegacyLog(log, index)`.
4. Migration adds:
   - stable migrated ID: `legacy_YYYYMMDD_index`
   - `schemaVersion: 2`
   - `createdAt`
   - `updatedAt`
5. The migrated logs are wrapped in a new `AppData` object.
6. `metadata.migratedFrom` is set to `legacy-session-log-array`.

Migration intentionally coerces only known prototype fields:

- numeric strings for `duration`, `energy`, and `confidence` become numbers.
- `result` becomes a string.
- legacy `success` must be `Yes` or `No`.

Anything outside these explicit rules is rejected.

## Demo Data

Demo logs live in `src/trainingData.js` as `demoLogs`.

Demo behavior:

- First run starts with empty real data, not demo logs.
- Demo data is loaded only when the user taps "Load optional demo data".
- Demo data is migrated through the same legacy migration function.
- `settings.demoMode` is set to `true`.
- Saving a real session sets `demoMode` back to `false`.
- Clearing logs removes logs; it does not restore demo data.

## Current Derived Metrics

The UI currently derives these from real logs:

- session count
- total minutes
- wins
- losses
- success rate
- average energy
- average confidence
- most repeated weakness/problem
- focus breakdown
- numeric average result by metric type
- Olympic tracking averages, preferring structured fields:
  - Clean reps from `cleanReps`, falling back to `Clean reps` result
  - Spar wins % from `sparWins` / `sparLosses`, falling back to `Spar wins %` result
  - Accuracy % from `successes` / `attempts`, falling back to `Accuracy %` result
  - Conditioning rounds from `conditioningRoundsSurvived`, falling back to matching result
  - Mistake frequency from `mistakeCount`, falling back to matching result
  - Tournament placement from `tournamentPlacement`, falling back to matching result

Removed from production-facing UI:

- hard-coded prototype tracking cards
- hard-coded technique tracking rows

## Known Future Data Needs

Some useful Olympic Coach metrics still need richer fields before they can be fully precise:

- per-shot and per-quadrant accuracy
- opponent/context for fatigue spar win/loss details
- structured tournament bracket size and round result
- read correctness and prediction timing
- cause-of-death taxonomy separate from free-text `problem`

Those should be added as explicit schema migrations rather than inferred from free text.
