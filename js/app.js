/**
 * Aerocabin Portal Main Application Logic
 * Navigation, View Router, Theme Switcher, URL Configs, and DOM Event Handlers
 */

const AerocabinApp = {
    currentTab: 'global',

    init() {
        this.setupTheme();
        this.setupClock();
        this.setupNavigation();
        this.setupSidebar();
        this.setupSettingsModal();
        this.renderCurrentView();

        // Listen for browser popstate or hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (['global', 'certification', 'ldnd', 'lifevest'].includes(hash)) {
                this.switchTab(hash, false);
            }
        });

        // Initialize with hash or default to global
        const initialHash = window.location.hash.replace('#', '');
        if (['global', 'certification', 'ldnd', 'lifevest'].includes(initialHash)) {
            this.switchTab(initialHash, false);
        }
    },

    // --- THEME SYSTEM ---
    setupTheme() {
        const savedTheme = localStorage.getItem('aerocabin_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeToggleBtn = document.getElementById('themeToggleBtn');
        themeToggleBtn?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('aerocabin_theme', nextTheme);

            if (window.AerocabinCharts) {
                window.AerocabinCharts.updateTheme();
            }
        });
    },

    // --- CLOCK & TIMESTAMP ---
    setupClock() {
        const clockEl = document.getElementById('liveClock');
        const update = () => {
            if (clockEl) {
                const now = new Date();
                clockEl.textContent = now.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };
        update();
        setInterval(update, 1000);
    },

    // --- SIDEBAR TOGGLES ---
    setupSidebar() {
        const desktopToggle = document.getElementById('sidebarToggleDesktopBtn');
        const mobileToggle = document.getElementById('sidebarToggleMobileBtn');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        // Restore collapsed state
        if (localStorage.getItem('aerocabin_sidebar_collapsed') === 'true') {
            document.body.classList.add('sidebar-collapsed');
        }

        desktopToggle?.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('aerocabin_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed'));
        });

        mobileToggle?.addEventListener('click', () => {
            sidebar?.classList.add('open');
            overlay?.classList.add('show');
        });

        const closeMobileSidebar = () => {
            sidebar?.classList.remove('open');
            overlay?.classList.remove('show');
        };

        sidebarCloseBtn?.addEventListener('click', closeMobileSidebar);
        overlay?.addEventListener('click', closeMobileSidebar);
    },

    // --- NAVIGATION ROUTER ---
    setupNavigation() {
        // Handle navbar buttons
        document.querySelectorAll('[data-tab-target]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const target = el.getAttribute('data-tab-target');
                if (target) {
                    this.switchTab(target, true);
                    // close mobile sidebar if opened
                    document.getElementById('sidebar')?.classList.remove('open');
                    document.getElementById('sidebarOverlay')?.classList.remove('show');
                }
            });
        });
    },

    switchTab(tabKey, updateHash = true) {
        this.currentTab = tabKey;
        if (updateHash) {
            window.location.hash = tabKey;
        }

        // Update active classes on nav elements
        document.querySelectorAll('[data-tab-target]').forEach(el => {
            if (el.getAttribute('data-tab-target') === tabKey) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Hide all views and show target view
        document.querySelectorAll('.view-pane').forEach(pane => {
            pane.style.display = 'none';
        });

        const targetPane = document.getElementById(`view-${tabKey}`);
        if (targetPane) {
            targetPane.style.display = 'block';
        }

        // Render charts for the active view
        setTimeout(() => {
            if (tabKey === 'global') window.AerocabinCharts?.renderGlobalCharts();
            else if (tabKey === 'certification') window.AerocabinCharts?.renderCertificationCharts();
            else if (tabKey === 'ldnd') window.AerocabinCharts?.renderLdndCharts();
            else if (tabKey === 'lifevest') window.AerocabinCharts?.renderLifevestCharts();
        }, 50);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // --- SETTINGS MODAL ---
    setupSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const openBtn = document.getElementById('settingsOpenBtn');
        const closeBtn = document.getElementById('settingsCloseBtn');
        const cancelBtn = document.getElementById('settingsCancelBtn');
        const saveBtn = document.getElementById('settingsSaveBtn');

        const certInput = document.getElementById('settingCertUrl');
        const ldndInput = document.getElementById('settingLdndUrl');
        const lifevestInput = document.getElementById('settingLifevestUrl');

        const openModal = () => {
            if (certInput) certInput.value = AerocabinData.urls.certification;
            if (ldndInput) ldndInput.value = AerocabinData.urls.ldnd;
            if (lifevestInput) lifevestInput.value = AerocabinData.urls.lifevest;
            modal?.classList.add('show');
        };

        const closeModal = () => modal?.classList.remove('show');

        openBtn?.addEventListener('click', openModal);
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        saveBtn?.addEventListener('click', () => {
            AerocabinData.saveUrls(certInput.value, ldndInput.value, lifevestInput.value);
            this.updateAllDetailButtons();
            closeModal();
            this.showToast('✅ Pengaturan URL Dashboard berhasil diperbarui!');
        });
    },

    updateAllDetailButtons() {
        // Certification buttons
        document.querySelectorAll('.btn-cert-target').forEach(btn => {
            btn.href = AerocabinData.urls.certification;
        });
        document.querySelectorAll('.text-cert-target').forEach(el => {
            el.textContent = AerocabinData.urls.certification;
        });

        // LDND buttons
        document.querySelectorAll('.btn-ldnd-target').forEach(btn => {
            btn.href = AerocabinData.urls.ldnd;
        });
        document.querySelectorAll('.text-ldnd-target').forEach(el => {
            el.textContent = AerocabinData.urls.ldnd;
        });

        // Lifevest buttons
        document.querySelectorAll('.btn-lifevest-target').forEach(btn => {
            btn.href = AerocabinData.urls.lifevest;
        });
        document.querySelectorAll('.text-lifevest-target').forEach(el => {
            el.textContent = AerocabinData.urls.lifevest;
        });
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3500);
        }
    },

    renderCurrentView() {
        this.updateAllDetailButtons();
        this.populateHighlights();
        this.switchTab(this.currentTab, false);
    },

    populateHighlights() {
        // Populate Certification Highlights
        const certTbody = document.getElementById('certHighlightsBody');
        if (certTbody) {
            certTbody.innerHTML = AerocabinData.certification.highlights.map(item => `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: var(--text-primary);">${item.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono';">ID: ${item.id}</div>
                    </td>
                    <td><span class="badge badge-info">${item.cert}</span></td>
                    <td>${item.dept}</td>
                    <td class="font-mono">${item.expiry}</td>
                    <td>
                        ${item.daysLeft <= 0 
                            ? `<span class="badge badge-danger">Expired (${Math.abs(item.daysLeft)}h lalu)</span>`
                            : `<span class="badge badge-warning">Sisa ${item.daysLeft} Hari</span>`}
                    </td>
                </tr>
            `).join('');
        }

        // Populate LDND Carpet Highlights
        const ldndTbody = document.getElementById('ldndHighlightsBody');
        if (ldndTbody) {
            ldndTbody.innerHTML = AerocabinData.ldnd.highlights.map(item => `
                <tr>
                    <td>
                        <span style="font-weight: 800; font-family: 'JetBrains Mono'; font-size: 0.92rem; color: var(--text-primary);">${item.reg}</span>
                    </td>
                    <td><span class="badge badge-neutral">${item.fleet}</span></td>
                    <td>
                        <span class="badge ${item.airline === 'GA' ? 'badge-info' : 'badge-success'}">${item.airline === 'GA' ? 'Garuda Indonesia' : 'Citilink'}</span>
                    </td>
                    <td>${item.type}</td>
                    <td class="font-mono">${item.lastDone}</td>
                    <td class="font-mono" style="font-weight: 700;">${item.nextDue}</td>
                    <td>
                        ${item.diff <= 0 
                            ? `<span class="badge badge-danger">Already Due (${Math.abs(item.diff)} hari lalu)</span>`
                            : `<span class="badge badge-warning">Near Due (${item.diff} hari lagi)</span>`}
                    </td>
                </tr>
            `).join('');
        }

        // Populate Lifevest Highlights
        const lifevestTbody = document.getElementById('lifevestHighlightsBody');
        if (lifevestTbody) {
            lifevestTbody.innerHTML = AerocabinData.lifevest.highlights.map(item => `
                <tr>
                    <td>
                        <span style="font-weight: 800; font-family: 'JetBrains Mono'; font-size: 0.92rem; color: var(--text-primary);">${item.reg}</span>
                    </td>
                    <td><span class="badge badge-neutral">${item.type || item.fleet}</span></td>
                    <td>
                        <span class="badge ${item.airline === 'GA' ? 'badge-info' : 'badge-success'}">${item.airline === 'GA' ? 'Garuda' : 'Citilink'}</span>
                    </td>
                    <td class="font-mono">${item.totalSeats} seats</td>
                    <td>
                        <span class="badge ${item.critical > 0 ? 'badge-warning' : 'badge-neutral'}">${item.critical} Vests</span>
                    </td>
                    <td>
                        ${item.expired > 0 
                            ? `<span class="badge badge-danger">${item.expired} Expired</span>` 
                            : `<span class="badge badge-success">0 Expired</span>`}
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="flex: 1; height: 6px; background: var(--bg-card-elevated); border-radius: 3px; overflow: hidden; min-width: 60px;">
                                <div style="width: ${item.health}%; height: 100%; background: ${item.health > 95 ? '#10b981' : '#f59e0b'};"></div>
                            </div>
                            <span class="font-mono" style="font-size: 0.8rem; font-weight: 700;">${item.health}%</span>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
};

window.AerocabinApp = AerocabinApp;
document.addEventListener('DOMContentLoaded', () => AerocabinApp.init());
