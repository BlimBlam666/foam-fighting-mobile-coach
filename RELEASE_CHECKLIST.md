# Release Checklist

Use this before handing a beta link to testers.

## Code Health

- [ ] `npm install` completes from a clean checkout.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run preview` loads the production build.
- [ ] No known white-page startup issue.
- [ ] No console errors during a create/edit/delete/import smoke pass.
- [ ] `dist/` is generated only by build and is not committed.

## Release Metadata

- [ ] App title is correct: `Foam Fighter Mobile Coach | Beta`.
- [ ] Meta description is present.
- [ ] Theme color is present.
- [ ] Favicon/app icon placeholder loads.
- [ ] Web manifest loads without blocking app startup.

## Storage and Backup

- [ ] New log persists after refresh.
- [ ] New log persists after closing/reopening the browser tab.
- [ ] Export JSON backup works or the copyable fallback is visible.
- [ ] Import valid backup with Merge by ID works.
- [ ] Import valid backup with Replace all works after confirmation.
- [ ] Invalid JSON import is rejected without changing current data.
- [ ] Clear all logs requires confirmation.
- [ ] Demo data is separate from clear/reset behavior.

## Mobile QA

- [ ] iPhone Safari smoke pass complete.
- [ ] Android Chrome smoke pass complete.
- [ ] Narrow width check complete around 320-360px.
- [ ] Bottom navigation remains usable with one hand.
- [ ] Tap targets are comfortable.
- [ ] Onboarding does not reappear after dismissal.
- [ ] Help screen remains accessible.

## Accessibility Spot Checks

- [ ] Buttons and form controls have understandable labels.
- [ ] Focus states are visible with keyboard or external keyboard.
- [ ] Important status messages do not rely only on color.
- [ ] Crash fallback displays a readable recovery message if rendering fails.

## Handoff Notes

- [ ] Testers know data is stored locally on the device/browser.
- [ ] Testers know to export before changing devices or clearing browser data.
- [ ] Testers know mobile downloads may appear in Files/Downloads or may require copyable JSON fallback.
- [ ] Tester feedback channel is documented outside the app.

## Go / No-Go

Release only if:

- [ ] Tests pass.
- [ ] Build passes.
- [ ] At least one iPhone and one Android smoke pass are complete.
- [ ] Backup/export/import is verified on at least one real phone.
- [ ] Any remaining risks are documented for testers.
