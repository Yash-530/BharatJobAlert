(function () {
    const STORAGE_KEY = 'bja_theme';

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
            btn.setAttribute('aria-pressed', String(isDark));
        }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#themeToggle');
        if (!btn) return;
        const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    });
})();
