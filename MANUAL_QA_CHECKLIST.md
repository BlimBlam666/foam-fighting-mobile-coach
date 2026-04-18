# Manual QA Checklist

This checklist covers the beta risks automation cannot fully prove, especially real-phone browser behavior.

## Test Matrix

Run the core checks on:

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Desktop Chrome narrow viewport around 320-360px wide
- [ ] Desktop or mobile production preview/deployed URL

Optional:

- [ ] iPhone Chrome
- [ ] Android Firefox
- [ ] Private/incognito browser session

## First Load and Onboarding

- [ ] App opens without a blank white page.
- [ ] Header, today card, and bottom navigation are visible.
- [ ] First-run onboarding appears for a new browser/profile.
- [ ] `Start with a log` opens the Log tab.
- [ ] `Read help first` opens Help.
- [ ] `Not now` dismisses onboarding.
- [ ] Refresh does not show onboarding again after dismissal.
- [ ] Help screen can show onboarding again.

## Quick Log Flow

- [ ] Open app.
- [ ] Tap Log in bottom navigation.
- [ ] Required fields are understandable.
- [ ] Enter main drill and result.
- [ ] Save session.
- [ ] App confirms save.
- [ ] Stats update immediately.
- [ ] Recent entries shows the saved log.
- [ ] Refresh preserves the log.
- [ ] Close and reopen the browser tab; log is still present.

## Edit and Delete Flow

- [ ] Tap a recent log.
- [ ] Edit sheet opens and fits on screen.
- [ ] Update minutes/result/problem.
- [ ] Tap Save changes.
- [ ] Sheet closes.
- [ ] Stats update immediately.
- [ ] Reopen the log and confirm edited fields persisted.
- [ ] Tap Delete this log.
- [ ] Confirmation appears.
- [ ] Cancel keeps the log.
- [ ] Confirm deletes only that one log.
- [ ] Other logs remain intact.

## Backup Export

- [ ] Open Backup tab.
- [ ] Read local-first storage warning.
- [ ] Tap Export JSON backup.
- [ ] On iPhone Safari, check Files/Downloads or browser download UI.
- [ ] On Android Chrome, check Downloads or browser download UI.
- [ ] If no file appears, verify copyable JSON is shown.
- [ ] Copyable JSON text is selectable/copyable.
- [ ] Exported JSON includes current logs.

## Backup Import

- [ ] Export a backup with at least one log.
- [ ] Import the backup using Merge by ID.
- [ ] Duplicate IDs are skipped unless the imported log is newer.
- [ ] Import report shows imported/merged/skipped/rejected/replaced counts.
- [ ] Import invalid JSON.
- [ ] Invalid import shows Import failed.
- [ ] Current data remains unchanged after invalid import.
- [ ] Import using Replace all.
- [ ] Confirmation appears before replace.
- [ ] Replace swaps current data only after confirmation.

## Storage Edge Cases

- [ ] Refresh after several logs.
- [ ] Close/reopen after several logs.
- [ ] Try private/incognito mode and note whether storage persists after closing.
- [ ] If storage is unavailable or cleared, app shows understandable empty/recovery state.
- [ ] Export before clearing browser data.
- [ ] Clear browser data and verify app starts fresh.
- [ ] Import backup after clearing browser data.

## Narrow Phone Layout

Check around 320-360px width:

- [ ] No horizontal scrolling.
- [ ] Header content does not overlap.
- [ ] Bottom navigation labels remain readable.
- [ ] Tap targets are not cramped.
- [ ] Forms fit without clipping labels.
- [ ] Edit sheet scrolls when needed.
- [ ] Backup JSON textarea is usable.
- [ ] Metrics cards do not overlap text.

## Accessibility Spot Checks

- [ ] Text is readable in normal mobile brightness.
- [ ] Buttons have clear visible labels.
- [ ] Active bottom tab is obvious without relying only on color.
- [ ] Focus outline is visible with keyboard/external keyboard.
- [ ] Form labels are associated with inputs.
- [ ] Status messages include text, not just color.
- [ ] Confirmation dialogs clearly describe destructive actions.
- [ ] Crash fallback, if triggered, gives a reload path and warns about local data.

## Known Mobile Browser Limitations

- iPhone Safari may save exported JSON to Files without an obvious prompt.
- Android Chrome download location can vary by device settings.
- Embedded/in-app browsers may block file download or upload.
- Private browsing can clear or restrict localStorage.
- There is no cloud sync; backups are the recovery path.

Record device model, browser, OS version, deployed URL, and any failures for each QA pass.
