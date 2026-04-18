# Backup And Restore

## Where Data Lives

Foam Fighter Mobile Coach is local-first. User data is stored in the browser on the current device using localStorage.

Primary storage key:

```text
foam-fighter-app-data-v1
```

Legacy prototype key, used only for migration:

```text
foam-fighter-session-logs
```

The app stores a full `AppData` object under the primary key. That object includes:

- `schemaVersion`
- `logs`
- `settings`
- `metadata`

Because this is local browser storage, the data can be lost if the user clears browser data, uses private/incognito mode, switches devices, uninstalls the browser, or if a mobile in-app browser purges site data.

## Save State Feedback

The app shows visible storage state near the top of the UI:

- `Saved on this device`
- `Save failed`
- `Storage unavailable`

The app validates data before saving. If validation or localStorage write fails, the app shows a visible notice instead of failing silently.

## Export

The Backup screen has an `Export JSON backup` action.

Export creates a full `AppData` JSON file. The exported payload includes the same schema used by localStorage, with `metadata.exportedAt` set to the export time.

The export filename is:

```text
foam-fighter-app-data-YYYY-MM-DD.json
```

### Mobile Fallback

Some mobile browsers and in-app browsers do not reliably support file downloads from a generated Blob. The app keeps Blob download as the first option, then also exposes a copyable JSON fallback.

If the file does not appear after export, use the copyable backup JSON:

1. Open the Backup screen.
2. Tap `Show copyable backup`, or use the fallback shown after export.
3. Tap `Copy`, or manually select the JSON text.
4. Save it somewhere safe, such as notes, cloud storage, email, or a files app.

## Import

The Backup screen has an `Import JSON backup` section with two modes:

- `Merge by ID`
- `Replace all`

The app reads the chosen `.json` file, parses it, and validates it through the existing data-contract layer before changing current data.

Invalid imports never update current app data.

Handled import failures include:

- empty file
- invalid JSON
- invalid schema shape
- unsupported `schemaVersion`
- corrupted file content
- duplicate log IDs inside an imported `AppData`
- invalid legacy prototype logs

## Replace Mode

Replace mode swaps the current app data for the imported `AppData`.

Safeguards:

- The imported file must parse and validate first.
- The app asks for confirmation before replacing current data.
- Imported demo mode is cleared so restored data behaves as real user data.

Replace is best for restoring a known-good backup onto a fresh device/browser.

## Merge Mode

Merge mode combines imported logs with current logs by stable `id`.

Rules:

- Logs with new IDs are added.
- Logs with the same ID are compared by `updatedAt`.
- If the imported log is newer, it replaces the current log.
- If the current log is newer or equal, the imported log is skipped.
- Imported logs are not duplicated.
- Current settings are preserved.
- Demo mode is cleared.

After merge, the app reports:

- imported
- merged
- skipped
- rejected
- replaced

Merge is best when a user has logs on both the current browser and a backup file.

## Legacy Prototype Migration

Older prototype backups may be a raw array of session logs or an object with a `logs` array and no top-level `schemaVersion`.

Those shapes are supported by explicit migration:

1. Each legacy log must contain all required prototype fields.
2. The app creates a stable migrated ID.
3. The app adds `schemaVersion`, `createdAt`, and `updatedAt`.
4. The migrated logs are wrapped in current `AppData`.
5. Invalid legacy logs reject the import.

## Known Limitations

- localStorage is not a true backup.
- Data is device/browser specific.
- In-app browsers can behave differently from Safari or Chrome.
- Blob file download is not guaranteed on every mobile browser, so the copyable JSON fallback is important.
- There is no cloud sync.
- There is no automatic scheduled backup.
- Imports currently support file selection only; drag/drop and paste-import are not implemented.
- Merge uses log `id` and `updatedAt`; it does not attempt fuzzy matching for manually duplicated sessions.

## Recommended Beta Practice

Before changing phones, clearing browser data, testing in a new browser, or using private mode:

1. Export JSON.
2. Confirm the file exists or copy the fallback JSON.
3. Import it into the target browser with `Replace all`.
4. Confirm session count and metrics look right.
