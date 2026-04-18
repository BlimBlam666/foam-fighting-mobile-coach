# Log Editing Lifecycle

## Create

New logs are created from the quick session form.

Creation uses `createSessionLog()` in `src/dataModel.js`, which:

- creates a stable `id`
- sets `schemaVersion`
- sets `createdAt`
- sets `updatedAt`
- validates the full `SessionLog` shape before it enters app state

If validation fails, the log is not saved.

## Edit

Existing logs are opened from the Recent entries list on the Log screen.

Phone flow:

1. Open the Log tab.
2. Tap an existing log card.
3. Edit fields in the bottom sheet.
4. Tap `Save changes` to commit.
5. Tap `Cancel` to close without changing the log.

Editing uses `updateSessionLog()` in `src/dataModel.js`.

Edit behavior:

- preserves `id`
- preserves `createdAt`
- preserves `schemaVersion`
- updates `updatedAt`
- validates with the same `SessionLog` rules used for create
- treats imported logs exactly like native logs

Cancel behavior:

- leaves app state unchanged
- does not update `updatedAt`
- does not trigger log replacement

## Delete

Existing logs can be deleted only from the edit sheet.

Delete behavior:

- user must first open a specific log
- user taps `Delete this log`
- app shows a confirmation prompt naming the log date/focus
- only that log ID is removed
- no other logs are changed

This keeps delete away from the main quick-entry flow and makes accidental deletion harder.

## Timestamp Behavior

### New Log

```text
createdAt = now
updatedAt = now
```

### Edited Log

```text
createdAt = original createdAt
updatedAt = edit save time
```

### Deleted Log

Deleted logs are removed from `AppData.logs`. There is no tombstone in the current local-only schema.

## Validation Behavior

Create and edit both enforce the canonical `SessionLog` validation rules:

- required stable `id`
- `schemaVersion` must match the current session-log schema
- valid ISO timestamps
- `date` must be `YYYY-MM-DD`
- non-empty `day`, `focus`, `mainDrill`, `metricType`, `result`, `win`, and `problem`
- `duration` must be a finite number greater than or equal to `0`
- `success` must be `Yes` or `No`
- `energy` must be `0` through `10`
- `confidence` must be `0` through `10`

Invalid edits are rejected and shown in the edit sheet. Existing app data remains unchanged.

## Metrics Behavior

Metrics are derived from `AppData.logs`.

After edit or delete:

- session count updates
- total minutes update
- success rate updates
- average energy/confidence update
- weakness target updates
- focus breakdown updates
- metric result averages update

No separate metric cache is persisted.

## Current Limitations

- There is no undo after delete.
- There is no soft-delete/tombstone behavior.
- There is no per-log history of edits.
- Conflict resolution during backup merge uses `updatedAt`, so editing an imported log makes it a normal current log with a newer timestamp.
