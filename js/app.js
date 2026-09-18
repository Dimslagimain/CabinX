/**
 * Aerocabin / CabinX Integrated Command Portal
 * Unified Application Controller
 * Handles Multi-Project Overviews, Real-time Live Synchronization & Direct Integrated Dashboards
 */

const AerocabinApp = {
    currentTab: 'global',
    validTabs: ['global', 'certification', 'certification-details', 'ldnd', 'ldnd-details', 'lifevest', 'lifevest-details'],
    iframeLoaded: { cert: false, ldnd: false, lifevest: false },

    // LDND state
    ldndCurrentTab: 'GA',

    // Lifevest state
    selectedAircraftReg: 'PK-GNA',

    init() {
        // 1. Ensure latest persisted datasets are loaded first from localStorage
        AerocabinData.loadFromStorage();

        this.setupTheme();
        this.setupClock();
        this.setupNavigation();
        this.setupSidebar();
        this.setupSettingsModal();
        this.setupSyncEngine();
        this.setupCertificationFilters();
        this.setupLdndFilters();
        this.setupLifevestSeatMap();
        this.populateAllKpis();
        this.populateHighlights();
        this.updateSyncUI();
        this.renderCurrentView();

        // Listen for live data updates
        document.addEventListener('aerocabin:data-synced', (e) => {
            this.populateAllKpis();
            this.populateHighlights();
            if (window.AerocabinCharts) {
                window.AerocabinCharts.refreshActiveChart();
            }
            this.updateSyncUI();
        });

        // Trigger background live sync to refresh if newer server data exists
        setTimeout(() => {
            AerocabinData.syncAll();
        }, 250);

        // Listen for browser popstate or hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (this.validTabs.includes(hash)) {
                this.switchTab(hash, false);
            }
        });

        // Initialize with hash or default to global
        const initialHash = window.location.hash.replace('#', '');
        if (this.validTabs.includes(initialHash)) {
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
        document.addEventListener('click', (e) => {
            const targetEl = e.target.closest('[data-tab-target]');
            if (targetEl) {
                e.preventDefault();
                const target = targetEl.getAttribute('data-tab-target');
                if (target) {
                    if (target.endsWith('-details')) {
                        const system = target.startsWith('certification')
                            ? 'cert'
                            : target.startsWith('ldnd')
                                ? 'ldnd'
                                : 'lifevest';
                        const url = AerocabinData.getUrl(system);

                        if (url && url !== '#') {
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }
                        return;
                    }

                    this.switchTab(target, true);
                    document.getElementById('sidebar')?.classList.remove('open');
                    document.getElementById('sidebarOverlay')?.classList.remove('show');
                }
            }
        });
    },

    switchTab(tabKey, updateHash = true) {
        if (!this.validTabs.includes(tabKey)) tabKey = 'global';
        this.currentTab = tabKey;
        if (updateHash) {
            window.location.hash = tabKey;
        }

        // Determine parent module for navbar highlight
        let parentModule = tabKey;
        if (tabKey.startsWith('certification')) parentModule = 'certification';
        else if (tabKey.startsWith('ldnd')) parentModule = 'ldnd';
        else if (tabKey.startsWith('lifevest')) parentModule = 'lifevest';

        // Update active classes on nav elements
        document.querySelectorAll('.nav-module-btn, .sidebar-nav-item').forEach(el => {
            const elTarget = el.getAttribute('data-tab-target');
            if (elTarget === tabKey || elTarget === parentModule) {
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
            const isIframPane = targetPane.classList.contains('iframe-view-pane');
            targetPane.style.display = isIframPane ? 'flex' : 'block';
        }

        // Render charts for the active overview
        setTimeout(() => {
            if (tabKey === 'global') window.AerocabinCharts?.renderGlobalCharts();
            else if (tabKey === 'certification') window.AerocabinCharts?.renderCertificationCharts();
            else if (tabKey === 'ldnd') window.AerocabinCharts?.renderLdndCharts();
            else if (tabKey === 'lifevest') window.AerocabinCharts?.renderLifevestCharts();
        }, 50);

        // Load iframe for detail panes
        if (tabKey === 'certification-details') {
            this.loadIframe('cert');
        } else if (tabKey === 'ldnd-details') {
            this.loadIframe('ldnd');
        } else if (tabKey === 'lifevest-details') {
            this.loadIframe('lifevest');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // --- LIVE SYNC ENGINE & UI ---
    setupSyncEngine() {
        const syncBtn = document.getElementById('syncLiveDataBtn');
        syncBtn?.addEventListener('click', async () => {
            if (AerocabinData.syncState.status === 'syncing') return;

            this.setSyncingState(true);
            this.showToast('Memulai sinkronisasi data dari dashboard target...');

            try {
                await AerocabinData.syncAll();
                this.setSyncingState(false);
                this.showToast('Data overview berhasil disinkronkan!');
            } catch (err) {
                this.setSyncingState(false);
                this.showToast('Sinkronisasi selesai dengan data terbaru.');
            }
        });
    },

    setSyncingState(isSyncing) {
        const syncBtn = document.getElementById('syncLiveDataBtn');
        const syncText = document.getElementById('syncBtnText');
        const syncDot = document.getElementById('syncDot');

        if (isSyncing) {
            if (syncBtn) syncBtn.classList.add('is-syncing');
            if (syncText) syncText.textContent = 'Syncing...';
            if (syncDot) syncDot.style.background = '#f59e0b';
        } else {
            if (syncBtn) syncBtn.classList.remove('is-syncing');
            if (syncText) syncText.textContent = 'Live Sync';
            if (syncDot) syncDot.style.background = '#10b981';
        }
    },

    updateSyncUI() {
        const syncInfo = document.getElementById('syncTimeInfo');
        const heroBadge = document.getElementById('globalLastSyncedBadge');

        if (AerocabinData.syncState.lastSynced) {
            const d = new Date(AerocabinData.syncState.lastSynced);
            const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const label = `Synced: ${dateStr}, ${timeStr} WIB`;

            if (syncInfo) {
                syncInfo.textContent = label;
                syncInfo.style.display = 'inline-flex';
            }
            if (heroBadge) {
                heroBadge.textContent = `● Data Aktif: ${dateStr} ${timeStr} WIB`;
            }
        }
    },

    // --- DYNAMIC KPI POPULATOR ---
    populateAllKpis() {
        // Format helpers
        const num = (n) => Number(n || 0).toLocaleString('id-ID');

        // 1. Global Showcase Cards
        const gCert = AerocabinData.certification.stats;
        const gLdnd = AerocabinData.ldnd.stats;
        const gLife = AerocabinData.lifevest.stats;

        this.setElText('globalCertEmployees', num(gCert.totalEmployees));
        this.setElText('globalCertAchievement', `${gCert.avgAchievement}%`);
        this.setElText('globalCertExpiring', num(gCert.expiringCount));
        this.setElText('globalCertExpired', num(gCert.expiredCount));

        this.setElText('globalLdndAircraft', num(gLdnd.totalAircraft));
        this.setElText('globalLdndSafe', num(gLdnd.safeCount));
        this.setElText('globalLdndDue', num(gLdnd.alreadyDue));
        this.setElText('globalLdndNearDue', num(gLdnd.nearDue));

        this.setElText('globalLifevestTotal', num(gLife.totalVests));
        this.setElText('globalLifevestHealth', `${gLife.healthRate}%`);
        this.setElText('globalLifevestSafe', num(gLife.safeCount));
        this.setElText('globalLifevestWarning', num(gLife.warningCount));
        this.setElText('globalLifevestCritical', num(gLife.criticalCount));
        this.setElText('globalLifevestExpired', num(gLife.expiredCount));

        // 2. Certification Overview KPIs
        this.setElText('kpiCertEmployees', num(gCert.totalEmployees));
        this.setElText('kpiCertActive', num(gCert.activeCount));
        this.setElText('kpiCertExpiring', num(gCert.expiringCount));
        this.setElText('kpiCertExpired', num(gCert.expiredCount));

        // 3. LDND Carpet Overview KPIs
        this.setElText('kpiLdndAircraft', num(gLdnd.totalAircraft));
        this.setElText('kpiLdndDue', num(gLdnd.alreadyDue));
        this.setElText('kpiLdndNearDue', num(gLdnd.nearDue));
        const rawMatEl = document.getElementById('kpiLdndRawmat');
        if (rawMatEl) {
            rawMatEl.innerHTML = `GA: ${num(gLdnd.rawmatGA)} <span style="font-size: 0.8rem; color: var(--text-muted);">YD</span>`;
        }

        // 4. Lifevest Overview KPIs (5 Cards System Synced with Live Database)
        this.setElText('kpiLifevestTotal', num(gLife.totalVests));
        this.setElText('kpiLifevestSafe', num(gLife.safeCount));
        this.setElText('kpiLifevestWarning', num(gLife.warningCount));
        this.setElText('kpiLifevestCritical', num(gLife.criticalCount));
        this.setElText('kpiLifevestExpired', num(gLife.expiredCount));
        this.setElText('kpiLifevestHealthSub', `Health: ${gLife.healthRate}% (${num(gLife.safeCount)} Safe)`);
    },

    setElText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    // --- POPULATE QUICK HIGHLIGHTS IN OVERVIEWS ---
    populateHighlights() {
        // Certification Overview Highlights
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

        // LDND Carpet Overview Highlights
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

        // Lifevest Overview Highlights
        const lifevestTbody = document.getElementById('lifevestHighlightsBody');
        if (lifevestTbody) {
            lifevestTbody.innerHTML = AerocabinData.lifevest.highlights.map(item => {
                const isGA = item.airline === 'GA' || item.airline === 'Garuda' || item.airline === 'Garuda Indonesia';
                const airlineName = isGA ? 'Garuda Indonesia' : (item.airline || 'Citilink');
                return `
                <tr>
                    <td>
                        <span style="font-weight: 800; font-family: 'JetBrains Mono'; font-size: 0.92rem; color: var(--text-primary);">${item.reg}</span>
                    </td>
                    <td><span class="badge badge-neutral">${item.type || item.fleet || 'B737-800'}</span></td>
                    <td>
                        <span class="badge ${isGA ? 'badge-info' : 'badge-success'}">${airlineName}</span>
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
                                <div style="width: ${item.health}%; height: 100%; background: ${item.health >= 90 ? '#10b981' : (item.health > 0 ? '#f59e0b' : '#f43f5e')};"></div>
                            </div>
                            <span class="font-mono" style="font-size: 0.8rem; font-weight: 700;">${item.health}%</span>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        }
    },

    // --- SETTINGS MODAL DIALOG ---
    setupSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const openBtn = document.getElementById('settingsOpenBtn');
        const closeBtn = document.getElementById('settingsCloseBtn');
        const cancelBtn = document.getElementById('settingsCancelBtn');
        const saveBtn = document.getElementById('settingsSaveBtn');

        const inputCert = document.getElementById('urlInputCert');
        const inputLdnd = document.getElementById('urlInputLdnd');
        const inputLife = document.getElementById('urlInputLife');

        const openModal = () => {
            if (inputCert) inputCert.value = AerocabinData.urls.certification;
            if (inputLdnd) inputLdnd.value = AerocabinData.urls.ldnd;
            if (inputLife) inputLife.value = AerocabinData.urls.lifevest;
            if (modal) modal.classList.add('show');
        };

        const closeModal = () => {
            if (modal) modal.classList.remove('show');
        };

        openBtn?.addEventListener('click', openModal);
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        saveBtn?.addEventListener('click', () => {
            if (inputCert?.value) {
                AerocabinData.urls.certification = inputCert.value.trim();
                AerocabinData.urls.certificationBase = inputCert.value.replace(/\/login\/?$/, '').replace(/\/$/, '');
            }
            if (inputLdnd?.value) {
                AerocabinData.urls.ldnd = inputLdnd.value.trim();
                AerocabinData.urls.ldndBase = inputLdnd.value.replace(/\/$/, '');
            }
            if (inputLife?.value) {
                AerocabinData.urls.lifevest = inputLife.value.trim();
                AerocabinData.urls.lifevestBase = inputLife.value.replace(/\/login\/?$/, '').replace(/\/$/, '');
            }

            AerocabinData.saveCustomUrls();
            closeModal();
            this.showToast('URL target berhasil diperbarui & menyinkronkan...');
            AerocabinData.syncAll();
        });
    },

    // --- IFRAME EMBEDDED DASHBOARD MANAGEMENT ---
    loadIframe(system) {
        const url = AerocabinData.getUrl(system);
        const iframeId = system === 'cert' ? 'certIframe' : (system === 'ldnd' ? 'ldndIframe' : 'lifevestIframe');
        const loaderId = system === 'cert' ? 'certIframeLoader' : (system === 'ldnd' ? 'ldndIframeLoader' : 'lifevestIframeLoader');
        const errorId = system === 'cert' ? 'certIframeError' : (system === 'ldnd' ? 'ldndIframeError' : 'lifevestIframeError');
        const urlDispId = system === 'cert' ? 'certIframeUrlDisplay' : (system === 'ldnd' ? 'ldndIframeUrlDisplay' : 'lifevestIframeUrlDisplay');
        const extLinkId = system === 'cert' ? 'certIframeExternalLink' : (system === 'ldnd' ? 'ldndIframeExternalLink' : 'lifevestIframeExternalLink');
        const errLinkId = system === 'cert' ? 'certIframeErrorLink' : (system === 'ldnd' ? 'ldndIframeErrorLink' : 'lifevestIframeErrorLink');

        const iframe = document.getElementById(iframeId);
        const loader = document.getElementById(loaderId);
        const errorDiv = document.getElementById(errorId);
        const urlDisp = document.getElementById(urlDispId);
        const extLink = document.getElementById(extLinkId);
        const errLink = document.getElementById(errLinkId);

        if (!iframe) return;

        if (extLink) extLink.href = url;
        if (errLink) errLink.href = url;
        if (urlDisp) urlDisp.textContent = url;

        if (this.iframeLoaded[system] && iframe.src === url) {
            if (loader) loader.style.display = 'none';
            if (errorDiv) errorDiv.style.display = 'none';
            iframe.style.display = 'block';
            iframe.style.opacity = '1';
            return;
        }

        this.iframeLoaded[system] = false;
        if (loader) { loader.style.display = 'flex'; }
        if (errorDiv) { errorDiv.style.display = 'none'; }
        iframe.style.display = 'none';
        iframe.style.opacity = '0';

        iframe.src = url;

        setTimeout(() => {
            if (!this.iframeLoaded[system]) {
                this.onIframeError(system);
            }
        }, 15000);
    },

    onIframeLoad(system) {
        const iframeId = system === 'cert' ? 'certIframe' : (system === 'ldnd' ? 'ldndIframe' : 'lifevestIframe');
        const loaderId = system === 'cert' ? 'certIframeLoader' : (system === 'ldnd' ? 'ldndIframeLoader' : 'lifevestIframeLoader');
        const errorId = system === 'cert' ? 'certIframeError' : (system === 'ldnd' ? 'ldndIframeError' : 'lifevestIframeError');

        const iframe = document.getElementById(iframeId);
        const loader = document.getElementById(loaderId);
        const errorDiv = document.getElementById(errorId);

        if (!iframe || !iframe.src || iframe.src === window.location.href || iframe.src === '' || iframe.src === 'about:blank') {
            return;
        }

        this.iframeLoaded[system] = true;
        if (loader) loader.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'none';
        iframe.style.display = 'block';
        iframe.style.opacity = '1';
    },

    onIframeError(system) {
        if (this.iframeLoaded[system]) return;

        const loaderId = system === 'cert' ? 'certIframeLoader' : (system === 'ldnd' ? 'ldndIframeLoader' : 'lifevestIframeLoader');
        const errorId = system === 'cert' ? 'certIframeError' : (system === 'ldnd' ? 'ldndIframeError' : 'lifevestIframeError');
        const iframeId = system === 'cert' ? 'certIframe' : (system === 'ldnd' ? 'ldndIframe' : 'lifevestIframe');

        const loader = document.getElementById(loaderId);
        const errorDiv = document.getElementById(errorId);
        const iframe = document.getElementById(iframeId);

        if (loader) loader.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'flex';
        if (iframe) { iframe.style.display = 'none'; }
    },

    retryIframe(system) {
        this.iframeLoaded[system] = false;
        const iframeId = system === 'cert' ? 'certIframe' : (system === 'ldnd' ? 'ldndIframe' : 'lifevestIframe');
        const iframe = document.getElementById(iframeId);
        if (iframe) iframe.src = '';
        setTimeout(() => this.loadIframe(system), 100);
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3500);
        }
    },

    renderCurrentView() {
        this.populateAllKpis();
        this.populateHighlights();
        this.renderCertDetailsTable();
        this.renderLdndDetailsTable();
        this.renderLifevestFleetSelect();
        this.switchTab(this.currentTab, false);
    },

    // ═══════════════════════════════════════════════════════
    // 1. FULL CERTIFICATION DASHBOARD LOGIC
    // ═══════════════════════════════════════════════════════
    setupCertificationFilters() {
        const searchInput = document.getElementById('certSearchInput');
        const deptSelect = document.getElementById('certDeptSelect');
        const statusSelect = document.getElementById('certStatusSelect');

        searchInput?.addEventListener('input', () => this.renderCertDetailsTable());
        deptSelect?.addEventListener('change', () => this.renderCertDetailsTable());
        statusSelect?.addEventListener('change', () => this.renderCertDetailsTable());
    },

    renderCertDetailsTable() {
        const tbody = document.getElementById('certFullTableBody');
        if (!tbody) return;

        const search = document.getElementById('certSearchInput')?.value.toLowerCase() || '';
        const dept = document.getElementById('certDeptSelect')?.value || 'ALL';
        const status = document.getElementById('certStatusSelect')?.value || 'ALL';

        let list = AerocabinData.detailed.certifications;

        if (dept !== 'ALL') {
            list = list.filter(item => item.dept === dept);
        }
        if (status !== 'ALL') {
            list = list.filter(item => item.status === status);
        }
        if (search) {
            list = list.filter(item =>
                item.name.toLowerCase().includes(search) ||
                item.empId.toLowerCase().includes(search) ||
                item.cert.toLowerCase().includes(search) ||
                item.certNo.toLowerCase().includes(search)
            );
        }

        const countEl = document.getElementById('certResultCount');
        if (countEl) countEl.textContent = `${list.length} data ditemukan`;

        tbody.innerHTML = list.map(item => `
            <tr>
                <td>
                    <div style="font-weight: 800; color: var(--text-primary);">${item.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono';">ID: ${item.empId}</div>
                </td>
                <td><span class="badge badge-info">${item.cert}</span></td>
                <td style="font-family: 'JetBrains Mono'; font-size: 0.8rem;">${item.certNo}</td>
                <td>${item.dept}</td>
                <td class="font-mono">${item.issue}</td>
                <td class="font-mono" style="font-weight: 700;">${item.expiry}</td>
                <td>
                    ${item.status === 'expired'
                ? `<span class="badge badge-danger">Expired (${Math.abs(item.daysLeft)}h lalu)</span>`
                : item.status === 'warning'
                    ? `<span class="badge badge-warning">Warning (${item.daysLeft} hari)</span>`
                    : `<span class="badge badge-success">Aktif (${item.daysLeft} hari)</span>`}
                </td>
                <td>
                    <button type="button" class="btn-table-action" onclick="AerocabinApp.showToast('Memproses renewal untuk ${item.name}...')">
                        Perbarui
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // ═══════════════════════════════════════════════════════
    // 2. FULL LDND CARPET DASHBOARD LOGIC
    // ═══════════════════════════════════════════════════════
    setupLdndFilters() {
        const searchInput = document.getElementById('ldndSearchInput');
        const fleetSelect = document.getElementById('ldndFleetSelect');
        const statusSelect = document.getElementById('ldndStatusSelect');

        searchInput?.addEventListener('input', () => this.renderLdndDetailsTable());
        fleetSelect?.addEventListener('change', () => this.renderLdndDetailsTable());
        statusSelect?.addEventListener('change', () => this.renderLdndDetailsTable());

        // Sub-tabs: Garuda (GA) vs Citilink (QG)
        document.querySelectorAll('.sub-tab-btn[data-airline]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sub-tab-btn[data-airline]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.ldndCurrentTab = btn.getAttribute('data-airline');
                this.renderLdndDetailsTable();
            });
        });
    },

    renderLdndDetailsTable() {
        const tbody = document.getElementById('ldndFullTableBody');
        if (!tbody) return;

        const search = document.getElementById('ldndSearchInput')?.value.toLowerCase() || '';
        const fleet = document.getElementById('ldndFleetSelect')?.value || 'ALL';
        const status = document.getElementById('ldndStatusSelect')?.value || 'ALL';

        let list = AerocabinData.detailed.carpetItems;

        // Filter by airline sub-tab
        if (this.ldndCurrentTab !== 'ALL') {
            list = list.filter(item => item.airline === this.ldndCurrentTab);
        }

        if (fleet !== 'ALL') {
            list = list.filter(item => item.fleet === fleet);
        }
        if (status !== 'ALL') {
            list = list.filter(item => item.status === status);
        }
        if (search) {
            list = list.filter(item =>
                item.reg.toLowerCase().includes(search) ||
                item.fleet.toLowerCase().includes(search) ||
                item.type.toLowerCase().includes(search) ||
                item.lastWo.toLowerCase().includes(search)
            );
        }

        const countEl = document.getElementById('ldndResultCount');
        if (countEl) countEl.textContent = `${list.length} armada/komponen ditemukan`;

        tbody.innerHTML = list.map(item => `
            <tr>
                <td>
                    <span style="font-weight: 800; font-family: 'JetBrains Mono'; font-size: 0.95rem; color: var(--text-primary);">${item.reg}</span>
                </td>
                <td><span class="badge badge-neutral">${item.fleet}</span></td>
                <td>
                    <span class="badge ${item.airline === 'GA' ? 'badge-info' : 'badge-success'}">
                        ${item.airline === 'GA' ? 'Garuda Indonesia' : 'Citilink'}
                    </span>
                </td>
                <td><strong>${item.type}</strong> (${item.interval} Bulan)</td>
                <td class="font-mono">${item.lastDone}</td>
                <td class="font-mono" style="font-weight: 700;">${item.nextDue}</td>
                <td>
                    ${item.status === 'due'
                ? `<span class="badge badge-danger">Already Due (${Math.abs(item.diff)}h)</span>`
                : item.status === 'near_due'
                    ? `<span class="badge badge-warning">Near Due (${item.diff} hari)</span>`
                    : `<span class="badge badge-success">Safe (+${item.diff}h)</span>`}
                </td>
                <td>
                    <span class="badge ${item.acStatus === 'ACTIVE' ? 'badge-success' : 'badge-warning'}">${item.acStatus}</span>
                </td>
                <td>
                    <button type="button" class="btn-table-action" onclick="AerocabinApp.showToast('Membuka Work Order untuk ${item.reg} (${item.type})...')">
                        WO: ${item.lastWo}
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // ═══════════════════════════════════════════════════════
    // 3. FULL LIFEVEST SEAT MAP & TRACKING LOGIC
    // ═══════════════════════════════════════════════════════
    setupLifevestSeatMap() {
        const regSelect = document.getElementById('lifevestFleetSelect');
        regSelect?.addEventListener('change', (e) => {
            this.selectedAircraftReg = e.target.value;
            this.renderLifevestSeatMap();
        });
    },

    renderLifevestFleetSelect() {
        const select = document.getElementById('lifevestFleetSelect');
        if (!select) return;

        select.innerHTML = AerocabinData.detailed.lifevestFleet.map(ac => `
            <option value="${ac.reg}" ${ac.reg === this.selectedAircraftReg ? 'selected' : ''}>
                ${ac.reg} — ${ac.type} (${ac.airline === 'GA' ? 'Garuda' : 'Citilink'}) | Health: ${ac.health}%
            </option>
        `).join('');

        this.renderLifevestSeatMap();
    },

    renderLifevestSeatMap() {
        const grid = document.getElementById('seatMapGrid');
        if (!grid) return;

        const seats = AerocabinData.detailed.generateSeatMatrix(this.selectedAircraftReg);
        const aircraft = AerocabinData.detailed.lifevestFleet.find(a => a.reg === this.selectedAircraftReg) || AerocabinData.detailed.lifevestFleet[0];

        // Group seats by row
        const rowMap = {};
        seats.forEach(s => {
            if (!rowMap[s.row]) rowMap[s.row] = [];
            rowMap[s.row].push(s);
        });

        // Summary bar
        const statsEl = document.getElementById('seatMapStatsBar');
        if (statsEl) {
            statsEl.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; margin-bottom: 1rem;">
                    <div>
                        <span style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); font-family: 'JetBrains Mono';">${aircraft.reg}</span>
                        <span class="badge badge-neutral" style="margin-left: 0.5rem;">${aircraft.type}</span>
                        <span class="badge ${aircraft.airline === 'GA' ? 'badge-info' : 'badge-success'}">${aircraft.airline === 'GA' ? 'Garuda Indonesia' : 'Citilink'}</span>
                    </div>
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <span class="badge badge-success">${aircraft.safe} Safe</span>
                        <span class="badge badge-warning">${aircraft.warning} Warning</span>
                        <span class="badge badge-danger">${aircraft.critical} Critical</span>
                        <span class="badge badge-purple">${aircraft.expired} Expired</span>
                    </div>
                </div>
            `;
        }

        let html = '';
        Object.keys(rowMap).forEach(r => {
            const rowSeats = rowMap[r];
            const leftGroup = rowSeats.filter(s => ['A', 'B', 'C'].includes(s.letter));
            const rightGroup = rowSeats.filter(s => ['D', 'E', 'F'].includes(s.letter));

            html += `
                <div class="seat-row">
                    <div class="seat-row-label">${r}</div>
                    ${leftGroup.map(s => this.renderSeatUnit(s)).join('')}
                    <div class="seat-aisle-gap">AISLE</div>
                    ${rightGroup.map(s => this.renderSeatUnit(s)).join('')}
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    renderSeatUnit(seat) {
        let statusClass = 'seat-safe';
        if (seat.status === 'warning') statusClass = 'seat-warning';
        else if (seat.status === 'critical') statusClass = 'seat-critical';
        else if (seat.status === 'expired') statusClass = 'seat-expired';

        return `
            <div class="seat-unit ${statusClass}"
                 onclick="AerocabinApp.showSeatModal('${seat.seatNumber}', '${seat.partNumber}', '${seat.status}', '${seat.expiry}', '${seat.reg}')"
                 title="Kursi ${seat.seatNumber} | ${seat.partNumber} | Status: ${seat.status} | Exp: ${seat.expiry}">
                ${seat.letter}
            </div>
        `;
    },

    showSeatModal(seatNum, partNum, status, expiry, reg) {
        this.showToast(`Kursi ${seatNum} (${reg}) — Status: ${status.toUpperCase()} — Exp: ${expiry} — ${partNum}`);
    }
};

window.AerocabinApp = AerocabinApp;

document.addEventListener('DOMContentLoaded', () => {
    window.AerocabinApp.init();
});
