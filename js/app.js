/**
 * Aerocabin / CabinX Integrated Command Portal
 * Unified Application Controller
 * Handles Multi-Project Overviews & Direct Integrated Dashboards
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
        this.setupTheme();
        this.setupClock();
        this.setupNavigation();
        this.setupSidebar();
        this.setupCertificationFilters();
        this.setupLdndFilters();
        this.setupLifevestSeatMap();
        this.renderCurrentView();

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
            // Iframe panes use flex layout; regular panes use block
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

        // Load iframe for detail panes (lazy: only set src once)
        if (tabKey === 'certification-details') {
            this.loadIframe('cert');
        } else if (tabKey === 'ldnd-details') {
            this.loadIframe('ldnd');
        } else if (tabKey === 'lifevest-details') {
            this.loadIframe('lifevest');
        }

        // For detail panes, expand to full viewport height (handled by CSS)
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Update external link references
        if (extLink) extLink.href = url;
        if (errLink) errLink.href = url;
        if (urlDisp) urlDisp.textContent = url;

        // If already loaded with same URL, don't reload
        if (this.iframeLoaded[system] && iframe.src === url) {
            // Already loaded — ensure correct visible state
            if (loader) loader.style.display = 'none';
            if (errorDiv) errorDiv.style.display = 'none';
            iframe.style.display = 'block';
            iframe.style.opacity = '1';
            return;
        }

        // Reset state: show loader, hide iframe and error
        this.iframeLoaded[system] = false;
        if (loader) { loader.style.display = 'flex'; }
        if (errorDiv) { errorDiv.style.display = 'none'; }
        iframe.style.display = 'none';
        iframe.style.opacity = '0';

        // Set the iframe src to trigger load
        iframe.src = url;

        // Timeout: if iframe hasn't loaded in 15s, show error
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

        // Check if src is empty (initial state) - don't mark as loaded
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
        // Don't show error if already loaded successfully
        if (this.iframeLoaded[system]) return;

        const iframeId = system === 'cert' ? 'certIframe' : (system === 'ldnd' ? 'ldndIframe' : 'lifevestIframe');
        const loaderId = system === 'cert' ? 'certIframeLoader' : (system === 'ldnd' ? 'ldndIframeLoader' : 'lifevestIframeLoader');
        const errorId = system === 'cert' ? 'certIframeError' : (system === 'ldnd' ? 'ldndIframeError' : 'lifevestIframeError');

        const loader = document.getElementById(loaderId);
        const errorDiv = document.getElementById(errorId);

        if (loader) loader.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'flex';
        const iframe = document.getElementById(iframeId);
        if (iframe) { iframe.style.display = 'none'; }
    },

    retryIframe(system) {
        // Reset loaded state and force reload
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
        this.populateHighlights();
        this.switchTab(this.currentTab, false);
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
                    <button type="button" class="btn-table-action" onclick="AerocabinApp.showCertModal('${item.name}', '${item.cert}', '${item.certNo}', '${item.expiry}', '${item.dept}')">
                        <span>📄 Detail</span>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showCertModal(name, cert, certNo, expiry, dept) {
        alert(`Detail Sertifikasi Pegawai\n\nNama: ${name}\nModul: ${cert}\nNo. Sertifikat: ${certNo}\nMasa Berlaku: ${expiry}\nDepartemen: ${dept}\n\nStatus: Terverifikasi di Learning Center Unit (LCU).`);
    },

    // ═══════════════════════════════════════════════════════
    // 2. FULL LDND CARPET DASHBOARD LOGIC
    // ═══════════════════════════════════════════════════════
    setupLdndFilters() {
        // GA vs QG tabs
        document.querySelectorAll('.ldnd-airline-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const airline = btn.getAttribute('data-airline');
                this.ldndCurrentTab = airline;
                document.querySelectorAll('.ldnd-airline-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderLdndDetailsTable();
            });
        });

        document.getElementById('ldndSearchInput')?.addEventListener('input', () => this.renderLdndDetailsTable());
        document.getElementById('ldndFleetSelect')?.addEventListener('change', () => this.renderLdndDetailsTable());
        document.getElementById('ldndStatusSelect')?.addEventListener('change', () => this.renderLdndDetailsTable());
    },

    renderLdndDetailsTable() {
        const tbody = document.getElementById('ldndFullTableBody');
        if (!tbody) return;

        const search = document.getElementById('ldndSearchInput')?.value.toLowerCase() || '';
        const fleet = document.getElementById('ldndFleetSelect')?.value || 'ALL';
        const status = document.getElementById('ldndStatusSelect')?.value || 'ALL';

        let list = AerocabinData.detailed.carpetItems.filter(item => item.airline === this.ldndCurrentTab);

        if (fleet !== 'ALL') {
            list = list.filter(item => item.fleet === fleet);
        }
        if (status !== 'ALL') {
            list = list.filter(item => item.status === status);
        }
        if (search) {
            list = list.filter(item =>
                item.reg.toLowerCase().includes(search) ||
                item.lastWo.toLowerCase().includes(search) ||
                item.fleet.toLowerCase().includes(search)
            );
        }

        const countEl = document.getElementById('ldndResultCount');
        if (countEl) countEl.textContent = `${list.length} item karpet armada ${this.ldndCurrentTab}`;

        tbody.innerHTML = list.map(item => `
            <tr>
                <td>
                    <span style="font-weight: 800; font-family: 'JetBrains Mono'; font-size: 0.95rem; color: var(--text-primary);">${item.reg}</span>
                </td>
                <td><span class="badge badge-neutral">${item.fleet}</span></td>
                <td><span class="badge ${item.airline === 'GA' ? 'badge-info' : 'badge-success'}">${item.airline}</span></td>
                <td><strong style="color: var(--text-primary);">${item.type}</strong></td>
                <td class="font-mono">${item.interval} Bulan</td>
                <td class="font-mono">${item.lastDone}</td>
                <td class="font-mono" style="font-weight: 700;">${item.nextDue}</td>
                <td>
                    ${item.status === 'due'
                ? `<span class="badge badge-danger">Already Due (${Math.abs(item.diff)}h)</span>`
                : item.status === 'near_due'
                    ? `<span class="badge badge-warning">Near Due (${item.diff}h)</span>`
                    : `<span class="badge badge-success">Safe (${item.diff}h)</span>`}
                </td>
                <td>
                    <span class="badge ${item.acStatus === 'ACTIVE' ? 'badge-cyan' : 'badge-neutral'}">${item.acStatus}</span>
                </td>
                <td>
                    <button type="button" class="btn-table-action" onclick="AerocabinApp.showCarpetDoneModal('${item.reg}', '${item.type}', '${item.nextDue}')">
                        <span>✏️ Catat Done</span>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showCarpetDoneModal(reg, type, nextDue) {
        const wo = prompt(`Catat Penggantian Karpet Selesai (Done Action)\n\nPesawat: ${reg}\nTipe: ${type}\nNext Due: ${nextDue}\n\nMasukkan Nomor Work Order (WO):`, `WO-${new Date().getFullYear()}-`);
        if (wo) {
            this.showToast(`✅ Penggantian karpet ${reg} (${type}) berhasil dicatat dengan nomor ${wo}!`);
        }
    },

    // ═══════════════════════════════════════════════════════
    // 3. FULL LIFEVEST DASHBOARD & 2D SEAT MAP LOGIC
    // ═══════════════════════════════════════════════════════
    setupLifevestSeatMap() {
        const selectEl = document.getElementById('lifevestAircraftSelect');
        if (selectEl) {
            selectEl.innerHTML = AerocabinData.detailed.lifevestFleet.map(ac => `
                <option value="${ac.reg}">${ac.reg} - ${ac.type} (${ac.airline}) [${ac.health}% Safe]</option>
            `).join('');

            selectEl.addEventListener('change', (e) => {
                this.selectedAircraftReg = e.target.value;
                this.renderLifevestSeatMap();
            });
        }
    },

    renderLifevestSeatMap() {
        const container = document.getElementById('seatMapGrid');
        if (!container) return;

        const reg = this.selectedAircraftReg;
        const ac = AerocabinData.detailed.lifevestFleet.find(a => a.reg === reg) || AerocabinData.detailed.lifevestFleet[0];
        const seats = AerocabinData.detailed.generateSeatMatrix(reg);

        // Update aircraft header info
        const infoEl = document.getElementById('seatMapAircraftInfo');
        if (infoEl) {
            infoEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <span style="font-size: 1.2rem; font-weight: 800; font-family: 'JetBrains Mono'; color: var(--text-primary);">${ac.reg}</span>
                    <span class="badge badge-neutral">${ac.type}</span>
                    <span class="badge ${ac.airline === 'GA' ? 'badge-info' : 'badge-success'}">${ac.airline === 'GA' ? 'Garuda Indonesia' : 'Citilink'}</span>
                    <span class="badge badge-success">${ac.safe} Safe</span>
                    <span class="badge badge-warning">${ac.warning} Warning</span>
                    <span class="badge badge-danger">${ac.critical + ac.expired} Critical/Expired</span>
                    <span style="font-weight: 700; color: #10b981;">Health: ${ac.health}%</span>
                </div>
            `;
        }

        // Group seats by row
        const rowsMap = {};
        seats.forEach(s => {
            if (!rowsMap[s.row]) rowsMap[s.row] = [];
            rowsMap[s.row].push(s);
        });

        // Render rows
        let html = '';
        Object.keys(rowsMap).forEach(rowNum => {
            const rowSeats = rowsMap[rowNum];
            const leftSeats = rowSeats.filter(s => ['A', 'B', 'C'].includes(s.letter));
            const rightSeats = rowSeats.filter(s => ['D', 'E', 'F'].includes(s.letter));

            html += `
                <div class="seat-row">
                    <div class="seat-row-label">${rowNum}</div>
                    ${leftSeats.map(s => `
                        <div class="seat-unit seat-${s.status}" 
                             title="Kursi: ${s.seatNumber} | Part No: ${s.partNumber} | Expired: ${s.expiry} | Status: ${s.status.toUpperCase()}"
                             onclick="AerocabinApp.showSeatDetails('${s.seatNumber}', '${s.partNumber}', '${s.expiry}', '${s.status}')">
                            <span>${s.letter}</span>
                        </div>
                    `).join('')}
                    <div class="seat-aisle-gap">AISLE</div>
                    ${rightSeats.map(s => `
                        <div class="seat-unit seat-${s.status}"
                             title="Kursi: ${s.seatNumber} | Part No: ${s.partNumber} | Expired: ${s.expiry} | Status: ${s.status.toUpperCase()}"
                             onclick="AerocabinApp.showSeatDetails('${s.seatNumber}', '${s.partNumber}', '${s.expiry}', '${s.status}')">
                            <span>${s.letter}</span>
                        </div>
                    `).join('')}
                    <div class="seat-row-label">${rowNum}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    showSeatDetails(seatNum, partNum, expiry, status) {
        const newDate = prompt(`Detail Pelampung Kursi ${seatNum}\n\nPart Number: ${partNum}\nStatus Saat Ini: ${status.toUpperCase()}\nTanggal Expired: ${expiry}\n\nMasukkan tanggal expired baru untuk update (YYYY-MM-DD):`, expiry);
        if (newDate && newDate !== expiry) {
            this.showToast(`✅ Pelampung kursi ${seatNum} berhasil diupdate ke tanggal ${newDate}!`);
        }
    }
};

window.AerocabinApp = AerocabinApp;
document.addEventListener('DOMContentLoaded', () => AerocabinApp.init());
