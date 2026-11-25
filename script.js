let jobs = [];
let activeOrg = 'all';
let activeQual = 'all';
let searchQuery = '';

function setLiveDate() {
    const el = document.getElementById('liveDate');
    if (!el) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    el.textContent = `| ${formatted}`;
}

function formatNumber(num) {
    return Number(num || 0).toLocaleString('en-IN');
}

function renderJobs() {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    const q = searchQuery.trim().toLowerCase();
    const filtered = jobs.filter(job => {
        const orgMatch = activeOrg === 'all' || job.org === activeOrg;
        const qualMatch = activeQual === 'all' || job.qualification === activeQual;
        const textMatch = !q || [
            job.title,
            job.org,
            job.location,
            job.qualification,
            job.description
        ].some(field => (field || '').toLowerCase().includes(q));
        return orgMatch && qualMatch && textMatch;
    });

    updateStats(filtered);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3 style="color: #424242; margin-bottom: 8px;">No matching jobs found</h3>
                <p>Try clearing your search or selecting another organization or qualification.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(job => `
        <article class="job-card">
            <div class="job-header">
                <div class="job-org">
                    ${job.org}
                    ${job.isNew ? '<span class="new-badge">New</span>' : ''}
                </div>
                <h2 class="job-title">${job.title}</h2>
                <div class="job-meta">
                    <span class="meta-item">Location: ${job.location}</span>
                    <span class="meta-item">Vacancies: ${formatNumber(job.posts)}</span>
                </div>
            </div>

            <div class="job-description">
                ${job.description}
            </div>

            <div class="job-details">
                <div class="detail-row">
                    <span class="detail-label">Qualification</span>
                    <span class="detail-value">${job.qualification}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Salary Range</span>
                    <span class="detail-value">${job.salary}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Application Status</span>
                    <span class="detail-value">${job.applyStart}</span>
                </div>
            </div>

            <div class="job-footer">
                <span class="deadline">Deadline: ${job.deadline}</span>
                <div class="card-actions">
                    <button type="button" class="quick-view-btn" data-slug="${job.slug}">Quick View</button>
                    <a class="apply-btn" style="text-decoration:none;" href="job.html?id=${encodeURIComponent(job.slug)}">View Details →</a>
                </div>
            </div>
        </article>
    `).join('');
}

function updateStats(filtered) {
    const totalPosts = filtered.reduce((sum, job) => sum + (job.posts || 0), 0);
    const newCount = filtered.filter(j => j.isNew).length;
    const activeCount = filtered.filter(j => {
        const s = (j.applyStart || '').toLowerCase();
        return s !== 'closed' && s !== 'completed';
    }).length;

    document.getElementById('totalJobs').textContent = filtered.length;
    document.getElementById('newJobs').textContent = newCount;
    document.getElementById('totalPosts').textContent = formatNumber(totalPosts);
    document.getElementById('activeCount').textContent = activeCount;
}

function openQuickView(slug) {
    const job = jobs.find(j => j.slug === slug);
    const modal = document.getElementById('quickViewModal');
    const body = document.getElementById('modalBody');
    if (!job || !modal || !body) return;

    body.innerHTML = `
        <div class="job-org">${job.org}</div>
        <h2 id="modalTitle" style="font-size: 22px; color: #212121; margin: 10px 0 12px;">${job.title}</h2>
        <p style="font-size: 14px; line-height: 1.65; color: #424242; margin-bottom: 16px;">${job.description}</p>
        <div class="job-details" style="margin-top: 0; padding-top: 12px;">
            <div class="detail-row"><span class="detail-label">Vacancies</span><span class="detail-value">${formatNumber(job.posts)}</span></div>
            <div class="detail-row"><span class="detail-label">Qualification</span><span class="detail-value">${job.qualification}</span></div>
            <div class="detail-row"><span class="detail-label">Salary Range</span><span class="detail-value">${job.salary}</span></div>
            <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${job.location}</span></div>
            <div class="detail-row"><span class="detail-label">Application Fee</span><span class="detail-value">${job.fee}</span></div>
            <div class="detail-row"><span class="detail-label">Deadline</span><span class="detail-value" style="color:#d32f2f;">${job.deadline}</span></div>
        </div>
        <div class="modal-actions">
            <a href="job.html?id=${encodeURIComponent(job.slug)}" class="apply-btn" style="text-decoration:none;">Full Details &amp; Prep →</a>
            <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer" class="quick-view-btn" style="text-decoration:none;">Official Apply Portal ↗</a>
        </div>
    `;
    modal.classList.add('open');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.classList.remove('open');
}

document.getElementById('jobsGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-view-btn');
    if (btn) openQuickView(btn.dataset.slug);
});

document.getElementById('closeModalBtn').addEventListener('click', closeQuickView);
document.getElementById('quickViewModal').addEventListener('click', (e) => {
    if (e.target.id === 'quickViewModal') closeQuickView();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuickView();
});

document.getElementById('orgFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('#orgFilters .chip').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        activeOrg = e.target.dataset.org;
        renderJobs();
    }
});

document.getElementById('qualFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('#qualFilters .chip').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        activeQual = e.target.dataset.qual;
        renderJobs();
    }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderJobs();
});

// WhatsApp alert banner linked directly in index.html

async function init() {
    setLiveDate();
    const result = await loadJobsData();
    jobs = result.jobs;
    renderJobs();
}

init();
