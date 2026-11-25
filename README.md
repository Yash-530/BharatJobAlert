# BharatJobAlert v2 (Google Sheets Sync + Quick View Modal)

## What Was Added in v2
1. **Google Sheets Sync (`jobs-loader.js` + `sample-jobs-sheet.csv`)**: Import `sample-jobs-sheet.csv` into Google Sheets, publish it as CSV (`File -> Share -> Publish to web -> CSV`), and paste the link into `GOOGLE_SHEET_CSV_URL` inside `jobs-loader.js`. Both `index.html` and `job.html` will automatically pull new rows from your Sheet (with `jobs-data.js` as an automatic fallback).
2. **Quick-View Modal (`index.html`, `script.js`, `style.css`)**: Each card now has both **Quick View** (opens a fast modal popup) and **View Details →** (opens `job.html?id=...` with ad & affiliate slots).

## Remaining Manual Setup Before Earning
1. **Google Sheet Link**: Publish `sample-jobs-sheet.csv` in Google Sheets and paste the CSV URL into `jobs-loader.js`.
2. **Custom Domain**: Buy a `.in` or `.com` domain, rename `CNAME.example` to `CNAME`, and replace `yourdomain.in` in `sitemap.xml` and `robots.txt`.
3. **Contact & Affiliate Links**: Replace `contact@yourdomain.in` in `contact.html` and `#affiliate-link` in `job.html`.
4. **Email Form**: Connect `#alertForm` in `script.js` to Brevo, Mailchimp, or Google Forms.
5. **AdSense Approval**: Submit `sitemap.xml` to Google Search Console, build steady traffic, then paste your AdSense Publisher ID into `index.html` and `ads.txt`.

## Automation Added in v4
1. **GitHub Actions Auto-Updater (`.github/workflows/update-jobs.yml` + `scripts/update_jobs.py`)**:
   - Add official/public RSS feed URLs to `FEED_URLS` in `scripts/update_jobs.py`.
   - GitHub Actions runs every 12 hours (or manually from the **Actions** tab) and commits new entries to `jobs-data.js`.
2. **Google Apps Script Auto-Filler (`scripts/google-apps-script.gs`)**:
   - Open your Google Sheet -> **Extensions -> Apps Script**, paste `scripts/google-apps-script.gs`, add RSS URLs to `FEED_URLS`, and set a 6- or 12-hour Time-driven Trigger.
