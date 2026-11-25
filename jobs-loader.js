// Configuration: Google Sheets Sync, Affiliate Prep Links, and Alert Channel
// 1. Optional Google Sheet CSV URL (leave empty to use jobs-data.js):
const GOOGLE_SHEET_CSV_URL = "";

// 2. Affiliate / Prep Links (replace with your own ?tag= or referral link anytime):
const AFFILIATE_PREP_URLS = {
    SSC: "https://www.amazon.in/s?k=SSC+CGL+previous+year+solved+papers+book",
    RRB: "https://www.amazon.in/s?k=Railway+RRB+NTPC+Group+D+book",
    BANKING: "https://www.amazon.in/s?k=IBPS+SBI+PO+Clerk+solved+papers+book",
    UPSC: "https://www.amazon.in/s?k=UPSC+CSE+NDA+CDS+previous+year+papers+book",
    "INDIAN AIR FORCE": "https://www.amazon.in/s?k=AFCAT+exam+guide+book",
    "INDIAN ARMY": "https://www.amazon.in/s?k=Indian+Army+Agniveer+Assam+Rifles+book",
    PSU: "https://www.amazon.in/s?k=GATE+PSU+State+PSC+exam+book",
    DEFAULT: "https://www.amazon.in/s?k=Government+Exam+Preparation+Books"
};

function getPrepLink(org) {
    return AFFILIATE_PREP_URLS[org] || AFFILIATE_PREP_URLS.DEFAULT;
}

function makeSlug(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parseCSV(csvText) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const ch = csvText[i];
        const next = csvText[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') {
                cell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            row.push(cell);
            cell = '';
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && next === '\n') i++;
            row.push(cell);
            if (row.some(v => v.trim() !== '')) rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += ch;
        }
    }
    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        if (row.some(v => v.trim() !== '')) rows.push(row);
    }
    return rows;
}

function csvToJobs(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1).map(cols => {
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = (cols[idx] || '').trim();
        });
        obj.posts = parseInt(String(obj.posts || '0').replace(/[^0-9]/g, ''), 10) || 0;
        obj.isNew = String(obj.isNew || '').toLowerCase() === 'true';
        if (!obj.slug) obj.slug = makeSlug(obj.title);
        if (!obj.fee) obj.fee = 'Check official notification PDF';
        if (!obj.selectionProcess) obj.selectionProcess = 'Written Exam / CBT & Document Verification';
        return obj;
    }).filter(j => j.title);
}

async function loadJobsData() {
    if (GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL.startsWith('http')) {
        try {
            const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
            if (res.ok) {
                const text = await res.text();
                const parsed = csvToJobs(text);
                if (parsed.length > 0) return { jobs: parsed, source: 'google-sheet' };
            }
        } catch (err) {
            console.warn('Google Sheet sync failed, falling back to local jobs-data.js:', err);
        }
    }
    return { jobs: window.JOBS_DATA || [], source: 'local' };
}
