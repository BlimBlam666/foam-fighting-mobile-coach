# Deploy

This is a static Vite React app. The recommended beta deployment path is Vercel.

## Recommended: Vercel

1. Push the repo to GitHub.
2. In Vercel, create a new project from the repo.
3. Vercel should detect Vite automatically.
4. Confirm these settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

The repo includes `vercel.json` with the same build/output settings and an SPA rewrite to `index.html`.

## Local Pre-Deploy Check

Run:

```bash
npm install
npm test
npm run build
npm run preview
```

Open the preview URL and complete a short smoke pass:

- app loads without a white page
- onboarding can be dismissed
- a log can be created
- refresh preserves data
- Backup screen can show copyable JSON

## Static Hosting Notes

Any static host that serves the `dist/` folder should work. For single-page app navigation, configure unknown paths to return `index.html`.

## Environment Variables

None required for beta. This app has no backend and no cloud sync.

## Local-Only Data Reminder

Deploying a new version does not migrate data on a server because there is no server database. Each beta tester's data remains in their own browser's `localStorage`. Schema migration happens client-side when the app loads.

Users should export a JSON backup before switching devices, clearing browser data, or testing a new deployment.

## Mobile Browser Limitations

- iPhone Safari may save downloads to Files instead of showing an obvious download prompt.
- Android Chrome behavior varies by file picker/download settings.
- Private browsing may block or clear storage unexpectedly.
- Some embedded browsers may restrict file download or file upload.

For beta, testers should verify both download export and copyable JSON fallback.
