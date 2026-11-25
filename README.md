## Automation Added in v4
1. **GitHub Actions Auto-Updater (`.github/workflows/update-jobs.yml` + `scripts/update_jobs.py`)**:
   - Add official/public RSS feed URLs to `FEED_URLS` in `scripts/update_jobs.py`.
   - GitHub Actions runs every 12 hours (or manually from the **Actions** tab) and commits new entries to `jobs-data.js`.
2. **Google Apps Script Auto-Filler (`scripts/google-apps-script.gs`)**:
   - Open your Google Sheet -> **Extensions -> Apps Script**, paste `scripts/google-apps-script.gs`, add RSS URLs to `FEED_URLS`, and set a 6- or 12-hour Time-driven Trigger.
