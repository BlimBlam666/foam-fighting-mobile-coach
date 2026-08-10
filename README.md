# Academy Fighter Coach

A mobile-first deliberate-practice coach for foam fighters from the Academy of Mercenary Arts.

## Live versions

- GitHub Pages: https://blimblam666.github.io/foam-fighting-mobile-coach/
- ChatGPT Site: https://academy-fighter-coach.blimblam.chatgpt.site

## Current features

- 56 distinct Forged Sessions: eight across each of seven training domains
- Solo, Partner, and Warband adaptations
- 20-, 30-, and 45-minute session plans
- Four-phase practices: prepare, build, pressure-test, and reflect
- Step timers, completion tracking, coaching cues, and success standards
- Fight after-action reviews and next-session coaching
- Seven-domain Warlord Path assessments
- Chronicle, Training Marks, teaching records, and local progress history
- Installable PWA with offline support

## Training doctrine

The coach is built around a simple method: choose one narrow problem, practice it cleanly, add pressure without losing the purpose, and leave with one useful correction. The curriculum is grounded in Academy of Mercenary Arts course doctrine and SKBC training material.

## Data and privacy

Training records remain in the browser storage of the device where they were created. There is no account, server database, or automatic cloud sync. Clearing browser data can remove those records.

## GitHub Pages

The published app is a static export in the repository root. `.nojekyll` allows GitHub Pages to serve the generated `_next` assets. The manifest and service worker are scoped to `/foam-fighting-mobile-coach/` so installation and offline use work from the project Pages URL.
