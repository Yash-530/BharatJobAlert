/**
 * Google Apps Script: Auto-fill your Google Sheet from public RSS/Atom job feeds.
 *
 * Setup:
 * 1. Open your Google Sheet (imported from sample-jobs-sheet.csv).
 * 2. Go to Extensions -> Apps Script and paste this code.
 * 3. Add your official RSS/Atom feed URLs to FEED_URLS below.
 * 4. Run fetchFeedsToSheet() once to grant permissions.
 * 5. Click Triggers (clock icon) -> Add Trigger -> fetchFeedsToSheet -> Time-driven (Every 6 or 12 hours).
 */

const FEED_URLS = [
  'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3'
];

function makeSlug_(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferOrg_(title) {
  const t = String(title || '').toUpperCase();
  const orgs = ['UPSC', 'SSC', 'RRB', 'DRDO', 'BARC', 'ISRO', 'IBPS', 'SBI', 'ONGC', 'NTPC', 'BHEL'];
  for (const org of orgs) {
    if (t.includes(org)) return org;
  }
  if (t.includes('ARMY')) return 'INDIAN ARMY';
  if (t.includes('NAVY')) return 'INDIAN NAVY';
  if (t.includes('AIR FORCE') || t.includes('IAF')) return 'INDIAN AIR FORCE';
  if (t.includes('BANK')) return 'BANKING';
  return 'PSU';
}

function fetchFeedsToSheet() {
  if (!FEED_URLS.length) {
    Logger.log('Add at least one RSS/Atom URL to FEED_URLS.');
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const existingSlugs = new Set();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) existingSlugs.add(String(data[i][0]).trim());
  }

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy');

  FEED_URLS.forEach(url => {
    try {
      const xml = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
      const doc = XmlService.parse(xml);
      const root = doc.getRootElement();
      const channel = root.getChild('channel');
      const items = channel ? channel.getChildren('item') : root.getChildren('entry', root.getNamespace());

      items.forEach(item => {
        const title = (item.getChildText('title') || '').trim();
        if (!title) return;
        const slug = makeSlug_(title);
        if (existingSlugs.has(slug)) return;

        const link = (item.getChildText('link') || url).trim();
        const rawDesc = item.getChildText('description') || '';
        const cleanDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 260);

        sheet.appendRow([
          slug,
          title,
          inferOrg_(title),
          0,
          'Graduation',
          'As per official norms',
          'All India',
          'Check Notice',
          today,
          'TRUE',
          link,
          'Check official notification PDF',
          'Written Exam / CBT & Document Verification',
          cleanDesc || 'Check official notification for complete details.'
        ]);
        existingSlugs.add(slug);
      });
    } catch (err) {
      Logger.log('Error fetching ' + url + ': ' + err);
    }
  });
}
