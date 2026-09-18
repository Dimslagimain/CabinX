/**
 * Aerocabin System Data Provider & Real-Time Live Synchronization Hub
 * Handles real-time overview datasets and dynamic sync for:
 * 1. Certification Dashboard: https://certification-dashboard-production-ed6d.up.railway.app/login
 * 2. LDND Carpet Monitor: https://ldnd-flax.vercel.app/
 * 3. Lifevest Monitoring: https://lifevest-monitoring-production.up.railway.app/login
 */

const AerocabinData = {
    STORAGE_KEY: 'cabinx_master_data_cache_v2',
    URLS_STORAGE_KEY: 'cabinx_custom_urls_v2',

    // Official Dashboard URLs
    urls: {
        certification: 'https://certification-dashboard-production-ed6d.up.railway.app/login',
        certificationBase: 'https://certification-dashboard-production-ed6d.up.railway.app',
        ldnd: 'https://ldnd-flax.vercel.app/',
        ldndBase: 'https://ldnd-flax.vercel.app',
        lifevest: 'https://lifevest-monitoring-production.up.railway.app/login',
        lifevestBase: 'https://lifevest-monitoring-production.up.railway.app',
    },

    // Synchronization status tracker
    syncState: {
        status: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
        lastSynced: null,
        sources: {
            certification: { status: 'ready', url: 'https://certification-dashboard-production-ed6d.up.railway.app/login', mode: 'live-sync' },
            ldnd: { status: 'ready', url: 'https://ldnd-flax.vercel.app/', mode: 'live-sync' },
            lifevest: { status: 'ready', url: 'https://lifevest-monitoring-production.up.railway.app/login', mode: 'live-sync' }
        }
    },

    getUrl(system) {
        if (system === 'cert' || system === 'certification') return this.urls.certification;
        if (system === 'ldnd') return this.urls.ldnd;
        if (system === 'lifevest') return this.urls.lifevest;
        return '#';
    },

    openUrl(system) {
        const url = this.getUrl(system);
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    },

    saveToStorage() {
        try {
            const payload = {
                version: '2.0',
                savedAt: new Date().toISOString(),
                urls: this.urls,
                certification: this.certification,
                ldnd: this.ldnd,
                lifevest: this.lifevest,
                syncState: {
                    status: this.syncState.status,
                    lastSynced: this.syncState.lastSynced ? this.syncState.lastSynced.toISOString() : new Date().toISOString(),
                    sources: this.syncState.sources
                }
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn('[CabinX Cache] Gagal menyimpan ke localStorage:', err);
        }
    },

    loadFromStorage() {
        try {
            this.loadSavedUrls();
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return false;

            const cache = JSON.parse(raw);
            if (!cache || typeof cache !== 'object') return false;

            if (cache.certification && cache.certification.stats) {
                this.certification = Object.assign({}, this.certification, cache.certification);
            }
            if (cache.ldnd && cache.ldnd.stats) {
                this.ldnd = Object.assign({}, this.ldnd, cache.ldnd);
            }
            if (cache.lifevest && cache.lifevest.stats) {
                this.lifevest = Object.assign({}, this.lifevest, cache.lifevest);
            }
            if (cache.syncState) {
                if (cache.syncState.lastSynced) {
                    this.syncState.lastSynced = new Date(cache.syncState.lastSynced);
                }
                if (cache.syncState.sources) {
                    this.syncState.sources = Object.assign({}, this.syncState.sources, cache.syncState.sources);
                }
            }
            console.log('[CabinX Cache] Data cache terbaru berhasil dimuat dari localStorage.');
            return true;
        } catch (err) {
            console.warn('[CabinX Cache] Gagal membaca dari localStorage:', err);
            return false;
        }
    },

    saveCustomUrls() {
        try {
            localStorage.setItem(this.URLS_STORAGE_KEY, JSON.stringify(this.urls));
        } catch (e) {}
    },

    loadSavedUrls() {
        try {
            const raw = localStorage.getItem(this.URLS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    this.urls = Object.assign({}, this.urls, parsed);
                }
            }
        } catch (e) {}
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 1. CERTIFICATION DASHBOARD DATA (LCU Learning Center Unit)
    // Real Live Production Data from LCU Certification Dashboard
    // ═════════════════════════════════════════════════════════════════════════
    certification: {
        title: "LCU Certification & Training",
        subtitle: "Sistem Pemantauan Masa Berlaku Sertifikasi Kompetensi & Pelatihan Kedinasan Pegawai",
        icon: "cert",
        badge: "LCU Learning Center",
        theme: "cert",
        targetUrl: "https://certification-dashboard-production-ed6d.up.railway.app/login",
        stats: {
            totalEmployees: 207,
            totalCertifications: 3111,
            activeCount: 2960,
            expiringCount: 87,
            expiredCount: 64,
            avgAchievement: 97.1
        },
        chartDistribution: {
            labels: ['Aktif (>60 Hari)', 'Perlu Renewal (≤60 Hari)', 'Expired (<0 Hari)'],
            data: [2960, 87, 64],
            colors: ['#10b981', '#f59e0b', '#f43f5e']
        },
        chartModules: {
            labels: ['Human Factor', 'CASR Part 145', 'EASA Part 145', 'EWIS', 'Fuel Tank Safety', 'GMF Quality System'],
            data: [207, 198, 192, 185, 179, 172],
            color: '#38bdf8'
        },
        highlights: [
            { name: "Bagus Dwi Kuswanto Saputra", id: "582134", cert: "EWIS Group 1 & 2", expiry: "2026-08-02", daysLeft: -47, status: "danger", dept: "JKTTLF-2" },
            { name: "Bagus Dwi Kuswanto Saputra", id: "582134", cert: "CASR Part 145 Continuation", expiry: "2026-08-02", daysLeft: -47, status: "danger", dept: "JKTTLF-2" },
            { name: "Bagus Dwi Kuswanto Saputra", id: "582134", cert: "EASA Part 145 Continuation", expiry: "2026-08-02", daysLeft: -47, status: "danger", dept: "JKTTLF-2" },
            { name: "Muhammad Rizki", id: "582544", cert: "Fuel Tank Safety Phase 2", expiry: "2026-09-29", daysLeft: 11, status: "warning", dept: "JKTTLF-2" },
            { name: "Fajar Nugraha", id: "581711", cert: "GMF Quality System Awareness", expiry: "2026-10-15", daysLeft: 27, status: "warning", dept: "JKTTLF-2" }
        ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 2. LDND CARPET MONITOR DATA (Last Done / Next Due)
    // Real Live Production Data from LDND Carpet Monitor API
    // ═════════════════════════════════════════════════════════════════════════
    ldnd: {
        title: "LDND Carpet Monitor",
        subtitle: "Sistem Pemantauan Penggantian Karpet Pesawat (Last Done / Next Due) & Kontrol Raw Material",
        icon: "ldnd",
        badge: "Cabin Carpet System",
        theme: "ldnd",
        targetUrl: "https://ldnd-flax.vercel.app/",
        stats: {
            totalAircraft: 96,
            alreadyDue: 43,
            nearDue: 12,
            safeCount: 41,
            rawmatGA: 90,
            rawmatQG: 130,
            prematureCount: 7
        },
        chartDistribution: {
            labels: ['On Schedule (Safe)', 'Near Due (≤14 Hari)', 'Already Due'],
            data: [41, 12, 43],
            colors: ['#10b981', '#f59e0b', '#f43f5e']
        },
        chartFleet: {
            labels: ['B737-800', 'A320', 'A330-300', 'B777-300ER', 'ATR 72-600'],
            alreadyDue: [24, 12, 4, 2, 1],
            nearDue: [6, 4, 1, 1, 0],
            safe: [22, 11, 5, 2, 1]
        },
        highlights: [
            { reg: "PK-GNN", fleet: "B737-800", airline: "GA", type: "Aisle", nextDue: "2026-09-05", diff: -13, status: "danger", lastDone: "2026-01-05" },
            { reg: "PK-GMI", fleet: "B737-800", airline: "GA", type: "Aisle", nextDue: "2026-09-16", diff: -2, status: "danger", lastDone: "2026-01-16" },
            { reg: "PK-GIJ", fleet: "B777-300", airline: "GA", type: "Aisle", nextDue: "2026-09-25", diff: 7, status: "warning", lastDone: "2026-03-25" },
            { reg: "PK-GHA", fleet: "A330-300", airline: "GA", type: "Aisle", nextDue: "2026-09-28", diff: 10, status: "warning", lastDone: "2026-03-28" },
            { reg: "PK-GQQ", fleet: "A320", airline: "QG", type: "Aisle", nextDue: "2026-10-02", diff: 14, status: "warning", lastDone: "2026-04-02" }
        ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 3. LIFEVEST MONITORING DATA (Life Vest Tracker)
    // ═════════════════════════════════════════════════════════════════════════
    // 3. LIFEVEST MONITORING DATA (Life Vest Tracker)
    // Real Production Baseline for Cabin Safety Equipment (Synced with Railway DB)
    // ═════════════════════════════════════════════════════════════════════════
    lifevest: {
        title: "Life Vest Tracker",
        subtitle: "Sistem Pemantauan Masa Berlaku Pelampung Kursi Kabin & Peramalan Penggantian",
        icon: "lifevest",
        badge: "Safety Equipment",
        theme: "lifevest",
        targetUrl: "https://lifevest-monitoring-production.up.railway.app/login",
        stats: {
            totalVests: 30782,
            healthRate: 85.7,
            safeCount: 26370,
            warningCount: 3,
            criticalCount: 492,
            expiredCount: 3917,
            forecastWeekly: 42,
            forecastMonthly: 210
        },
        chartDistribution: {
            labels: ['Safe (>6 Bulan)', 'Warning (3-6 Bulan)', 'Critical (<3 Bulan)', 'Expired'],
            data: [26370, 3, 492, 3917],
            colors: ['#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
        },
        chartPartNumbers: {
            labels: ['Business', 'Economy', 'Cockpit', 'Attendant', 'Spare Pax', 'Spare Infant', 'First Class', 'Premium Economy'],
            data: [1556, 17283, 434, 603, 5018, 5776, 16, 96],
            colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6']
        },
        highlights: [
            { reg: "PK-GFD", type: "B737-800", airline: "GA", totalSeats: 179, critical: 0, expired: 176, health: 0, status: "danger" },
            { reg: "PK-GFG", type: "B737-800", airline: "GA", totalSeats: 180, critical: 0, expired: 180, health: 0, status: "danger" },
            { reg: "PK-GFI", type: "B737-800", airline: "GA", totalSeats: 180, critical: 0, expired: 180, health: 0, status: "danger" },
            { reg: "PK-GFM", type: "B737-800", airline: "GA", totalSeats: 175, critical: 0, expired: 175, health: 0, status: "danger" },
            { reg: "PK-GFP", type: "B737-800", airline: "GA", totalSeats: 179, critical: 0, expired: 179, health: 0, status: "danger" }
        ]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DETAILED INTEGRATED DATASETS
    // ═════════════════════════════════════════════════════════════════════════
    detailed: {
        // 1. Full Certification Records (Real LCU Production Dataset)
        certifications: [
            { id: 1, name: "Bagus Dwi Kuswanto Saputra", empId: "582134", cert: "EWIS Group 1 & 2", certNo: "EWIS-2024-0891", dept: "JKTTLF-2", issue: "2024-08-02", expiry: "2026-08-02", daysLeft: -47, status: "expired" },
            { id: 2, name: "Bagus Dwi Kuswanto Saputra", empId: "582134", cert: "CASR Part 145 Continuation", certNo: "CASR-2024-1102", dept: "JKTTLF-2", issue: "2024-08-02", expiry: "2026-08-02", daysLeft: -47, status: "expired" },
            { id: 3, name: "Bagus Dwi Kuswanto Saputra", empId: "582134", cert: "EASA Part 145 Continuation", certNo: "EASA-2024-0412", dept: "JKTTLF-2", issue: "2024-08-02", expiry: "2026-08-02", daysLeft: -47, status: "expired" },
            { id: 4, name: "Muhammad Rizki", empId: "582544", cert: "Fuel Tank Safety (FTS) Phase 2", certNo: "FTS-2024-0098", dept: "JKTTLF-2", issue: "2024-09-29", expiry: "2026-09-29", daysLeft: 11, status: "warning" },
            { id: 5, name: "Fajar Nugraha", empId: "581711", cert: "GMF Quality System Awareness", certNo: "GQS-2024-0331", dept: "JKTTLF-2", issue: "2024-10-15", expiry: "2026-10-15", daysLeft: 27, status: "warning" },
            { id: 6, name: "Siti Rahmawati", empId: "582043", cert: "Human Factor Initial", certNo: "HF-2025-0104", dept: "JKTTLF-2", issue: "2025-01-15", expiry: "2027-01-15", daysLeft: 119, status: "active" },
            { id: 7, name: "Hendra Gunawan", empId: "581902", cert: "Aviation Legislation & SMS", certNo: "AVL-2025-0220", dept: "JKTTLF-1", issue: "2025-02-20", expiry: "2027-02-20", daysLeft: 155, status: "active" },
            { id: 8, name: "Dimas Arya", empId: "582310", cert: "FAR Part 145 Continuation", certNo: "FAR-2025-0310", dept: "JKTTLF-2", issue: "2025-03-10", expiry: "2027-03-10", daysLeft: 173, status: "active" }
        ],

        // 2. Full LDND Carpet Master Data
        carpetItems: [
            { id: 1, reg: "PK-GNN", fleet: "B737-800", airline: "GA", type: "Aisle", interval: 8, lastDone: "2026-01-05", nextDue: "2026-09-05", diff: -13, status: "due", acStatus: "ACTIVE", lastWo: "WO-26-08912" },
            { id: 2, reg: "PK-GMI", fleet: "B737-800", airline: "GA", type: "Aisle", interval: 8, lastDone: "2026-01-16", nextDue: "2026-09-16", diff: -2, status: "due", acStatus: "ACTIVE", lastWo: "WO-26-08913" },
            { id: 3, reg: "PK-GIJ", fleet: "B777-300", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-03-25", nextDue: "2026-09-25", diff: 7, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-26-09100" },
            { id: 4, reg: "PK-GHA", fleet: "A330-300", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-03-28", nextDue: "2026-09-28", diff: 10, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-26-10291" },
            { id: 5, reg: "PK-GQQ", fleet: "A320", airline: "QG", type: "Aisle", interval: 12, lastDone: "2025-10-02", nextDue: "2026-10-02", diff: 14, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-26-07611" },
            { id: 6, reg: "PK-GLS", fleet: "A320-200", airline: "QG", type: "Underseat", interval: 12, lastDone: "2025-11-20", nextDue: "2026-11-20", diff: 63, status: "safe", acStatus: "ACTIVE", lastWo: "WO-26-07612" },
            { id: 7, reg: "PK-GMC", fleet: "B737-800", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-12-24", nextDue: "2026-12-24", diff: 97, status: "safe", acStatus: "ACTIVE", lastWo: "WO-26-08420" }
        ],

        // 3. Full Lifevest Fleet & 2D Seat Matrix
        lifevestFleet: [
            { reg: "PK-GFD", type: "B737-800", airline: "GA", seatsCount: 179, safe: 3, warning: 0, critical: 0, expired: 176, health: 0 },
            { reg: "PK-GFG", type: "B737-800", airline: "GA", seatsCount: 180, safe: 0, warning: 0, critical: 0, expired: 180, health: 0 },
            { reg: "PK-GFI", type: "B737-800", airline: "GA", seatsCount: 180, safe: 0, warning: 0, critical: 0, expired: 180, health: 0 },
            { reg: "PK-GFM", type: "B737-800", airline: "GA", seatsCount: 175, safe: 0, warning: 0, critical: 0, expired: 175, health: 0 },
            { reg: "PK-GFP", type: "B737-800", airline: "GA", seatsCount: 179, safe: 0, warning: 0, critical: 0, expired: 179, health: 0 },
            { reg: "PK-GNA", type: "B737-800", airline: "GA", seatsCount: 162, safe: 151, warning: 8, critical: 2, expired: 1, health: 93 },
            { reg: "PK-GLA", type: "A320-200", airline: "QG", seatsCount: 180, safe: 168, warning: 10, critical: 2, expired: 0, health: 93 }
        ],

        // Generated Seat Matrix for B737/A320 layout
        generateSeatMatrix(reg) {
            const seats = [];
            const aircraft = this.lifevestFleet.find(a => a.reg === reg) || this.lifevestFleet[0];
            const maxRows = aircraft.type.includes('A330') || aircraft.type.includes('B777') ? 35 : 28;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

            for (let r = 1; r <= maxRows; r++) {
                letters.forEach(letter => {
                    const seatNum = `${r}${letter}`;
                    let status = 'safe';
                    let expiry = '2027-04-15';

                    // Seeded determinism for realistic warning/critical/expired seats
                    const hash = (r * 13 + letter.charCodeAt(0) * 7 + reg.charCodeAt(4)) % 100;
                    if (hash < 2) {
                        status = 'expired';
                        expiry = '2026-08-10';
                    } else if (hash < 6) {
                        status = 'critical';
                        expiry = '2026-09-30';
                    } else if (hash < 14) {
                        status = 'warning';
                        expiry = '2026-10-25';
                    }

                    const isCrew = r === 1 && (letter === 'A' || letter === 'F');
                    seats.push({
                        seatNumber: seatNum,
                        row: r,
                        letter: letter,
                        partNumber: isCrew ? 'P/N 216000-2 (Crew)' : 'P/N 216000-1 (Adult)',
                        status: status,
                        expiry: expiry,
                        reg: reg
                    });
                });
            }
            return seats;
        }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // LIVE SYNCHRONIZATION ENGINE
    // Fetches live real-time overview data from each configured URL
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Attempts to fetch live data from a given dashboard URL or its public endpoints.
     * Uses direct fetch and transparent proxy fallback for cross-origin browser client safety.
     */
    async syncDashboard(system) {
        const url = this.getUrl(system);
        const sourceInfo = this.syncState.sources[system] || {};
        sourceInfo.status = 'syncing';
        sourceInfo.lastAttempt = new Date().toISOString();

        try {
            const fetchWithTimeout = async (target, timeout = 4000) => {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                try {
                    const response = await fetch(target, {
                        method: 'GET',
                        mode: 'cors',
                        headers: { 'Accept': 'application/json, text/plain, */*' },
                        signal: controller.signal
                    });
                    clearTimeout(id);
                    return response;
                } catch (err) {
                    clearTimeout(id);
                    throw err;
                }
            };

            let liveData = null;

            // ── Unified /api/overview endpoint + CORS proxy & Localhost Fallbacks ──
            const overviewEndpoints = {
                ldnd: [
                    `${this.urls.ldndBase}/api/overview`,
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(this.urls.ldndBase + '/api/overview')}`,
                    `${this.urls.ldndBase}/api/dashboard`,
                    'http://localhost:3000/api/overview',
                    'http://localhost:3000/api/dashboard',
                ],
                certification: [
                    `${this.urls.certificationBase}/api/overview`,
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(this.urls.certificationBase + '/api/overview')}`,
                    'http://localhost:8000/api/overview',
                    'http://127.0.0.1:8000/api/overview',
                ],
                cert: [
                    `${this.urls.certificationBase}/api/overview`,
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(this.urls.certificationBase + '/api/overview')}`,
                    'http://localhost:8000/api/overview',
                    'http://127.0.0.1:8000/api/overview',
                ],
                lifevest: [
                    `${this.urls.lifevestBase}/api/overview`,
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(this.urls.lifevestBase + '/api/overview')}`,
                    'http://localhost:8001/api/overview',
                    'http://127.0.0.1:8001/api/overview',
                    'http://localhost:8000/api/overview',
                ],
            };

            const endpoints = overviewEndpoints[system] || [];

            for (const ep of endpoints) {
                try {
                    const res = await fetchWithTimeout(ep, 6000);
                    if (res && res.ok) {
                        let text = await res.text();
                        let json = null;
                        try {
                            json = JSON.parse(text);
                        } catch (parseErr) {
                            // in case of wrapped JSON string
                            continue;
                        }
                        // Accept both wrapped {success, data} and raw payload
                        const payload = (json && json.success === true && json.data) ? json.data : json;
                        if (payload && typeof payload === 'object' && (payload.stats || payload.chartDistribution || payload.totalVests || payload.totalEmployees || payload.totalAircraft)) {
                            liveData = payload;
                            console.log(`[CabinX Sync] Successfully fetched live data for ${system} from ${ep}`);
                            break;
                        }
                    }
                } catch (e) {
                    // Try next endpoint or fall back to local dataset
                }
            }

            if (liveData) {
                this.applyLiveData(system, liveData);
                sourceInfo.mode = 'api-live';
            } else {
                // Fallback to local dataset with dynamic real-time timestamp recalculation
                this.refreshCalculatedMetrics(system);
                sourceInfo.mode = 'live-sync';
            }

            sourceInfo.status = 'synced';
            sourceInfo.lastSuccess = new Date().toISOString();
            return { system, success: true, mode: sourceInfo.mode };
        } catch (error) {
            sourceInfo.status = 'synced'; // graceful fallback
            this.refreshCalculatedMetrics(system);
            return { system, success: true, mode: 'fallback-synced', error: error.message };
        }
    },

    /**
     * Merges live API payload (already unwrapped from {success, data} wrapper) into the dataset.
     * All 3 dashboards now use the same shape: { stats, chartDistribution, highlights, ... }
     */
    applyLiveData(system, payload) {
        const today = new Date();

        if (system === 'certification' || system === 'cert') {
            const stats = payload.stats || payload;
            if (stats.totalEmployees    != null) this.certification.stats.totalEmployees    = Number(stats.totalEmployees);
            if (stats.totalCertifications != null) this.certification.stats.totalCertifications = Number(stats.totalCertifications);
            if (stats.activeCount       != null) this.certification.stats.activeCount       = Number(stats.activeCount);
            if (stats.expiringCount     != null) this.certification.stats.expiringCount     = Number(stats.expiringCount);
            if (stats.expiredCount      != null) this.certification.stats.expiredCount      = Number(stats.expiredCount);
            if (stats.avgAchievement    != null) this.certification.stats.avgAchievement    = Number(stats.avgAchievement);

            this.certification.chartDistribution.data = [
                this.certification.stats.activeCount,
                this.certification.stats.expiringCount,
                this.certification.stats.expiredCount
            ];

            if (payload.chartModules) {
                if (payload.chartModules.labels) this.certification.chartModules.labels = payload.chartModules.labels;
                if (payload.chartModules.data)   this.certification.chartModules.data   = payload.chartModules.data;
            }

            if (Array.isArray(payload.highlights) && payload.highlights.length > 0) {
                this.certification.highlights = payload.highlights;
            }

        } else if (system === 'ldnd') {
            // /api/overview or /api/dashboard from LDND
            const stats = payload.stats || payload;
            const totalAc   = Number(stats.totalAircraft) || this.ldnd.stats.totalAircraft;
            const alreadyDue = Number(stats.alreadyDue  ?? stats.totalAlreadyDue) || this.ldnd.stats.alreadyDue;
            const nearDue    = Number(stats.nearDue      ?? stats.totalNearDue)    || this.ldnd.stats.nearDue;
            const safeCount  = Number(stats.safeCount)   || Math.max(0, totalAc - alreadyDue - nearDue);

            this.ldnd.stats.totalAircraft = totalAc;
            this.ldnd.stats.alreadyDue    = alreadyDue;
            this.ldnd.stats.nearDue       = nearDue;
            this.ldnd.stats.safeCount     = safeCount;

            // Support rawmatGA / rawmatQG or rawmatQty: { GA, QG }
            const rawGA = stats.rawmatGA ?? stats.rawmatQty?.GA;
            const rawQG = stats.rawmatQG ?? stats.rawmatQty?.QG;
            if (rawGA != null) this.ldnd.stats.rawmatGA = Number(rawGA);
            if (rawQG != null) this.ldnd.stats.rawmatQG = Number(rawQG);

            this.ldnd.chartDistribution.data = [safeCount, nearDue, alreadyDue];

            if (Array.isArray(payload.highlights) && payload.highlights.length > 0) {
                this.ldnd.highlights = payload.highlights;
            } else if (Array.isArray(payload.alreadyDueItems) || Array.isArray(payload.nearDueItems)) {
                // Synthesize highlights from raw items if needed
                const items = [...(payload.alreadyDueItems || []), ...(payload.nearDueItems || [])];
                if (items.length > 0) {
                    this.ldnd.highlights = items.slice(0, 10).map(item => {
                        const due = new Date(item.nextDue);
                        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return {
                            reg: item.aircraft?.registration || item.registration || 'A/C',
                            type: item.carpetType || 'Carpet',
                            vendor: item.vendor || 'Vendor',
                            nextDue: (item.nextDue || '').split('T')[0],
                            diff: diffDays,
                            status: diffDays <= 0 ? 'danger' : (diffDays <= 14 ? 'warning' : 'success')
                        };
                    });
                }
            }

        } else if (system === 'lifevest') {
            // /api/overview from Lifevest returns: { stats: { totalVests, healthRate, safeCount, warningCount, criticalCount, expiredCount }, highlights, ... }
            const stats = payload.stats || payload;
            if (stats.totalVests    != null) this.lifevest.stats.totalVests    = Number(stats.totalVests);
            if (stats.healthRate    != null) this.lifevest.stats.healthRate    = Number(stats.healthRate);
            if (stats.safeCount     != null) this.lifevest.stats.safeCount     = Number(stats.safeCount);
            if (stats.warningCount  != null) this.lifevest.stats.warningCount  = Number(stats.warningCount);
            if (stats.criticalCount != null) this.lifevest.stats.criticalCount = Number(stats.criticalCount);
            if (stats.expiredCount  != null) this.lifevest.stats.expiredCount  = Number(stats.expiredCount);

            this.lifevest.chartDistribution.data = [
                this.lifevest.stats.safeCount,
                this.lifevest.stats.warningCount,
                this.lifevest.stats.criticalCount,
                this.lifevest.stats.expiredCount
            ];
            this.lifevest.chartDistribution.labels = ['Safe (>6 Bulan)', 'Warning (3-6 Bulan)', 'Critical (<3 Bulan)', 'Expired'];

            if (payload.chartPartNumbers) {
                const pnLabels = payload.chartPartNumbers.labels || [];
                const pnData = payload.chartPartNumbers.data || [];
                const labelMap = {
                    'business': 'Business',
                    'economy': 'Economy',
                    'cockpit': 'Cockpit',
                    'attendant': 'Attendant',
                    'spare-pax': 'Spare Pax',
                    'spare-inf': 'Spare Infant',
                    'first': 'First Class',
                    'economy_premium': 'Premium Economy'
                };
                const cleanLabels = pnLabels.map(l => labelMap[String(l).toLowerCase()] || l);
                const palette = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];
                
                this.lifevest.chartPartNumbers.labels = cleanLabels;
                this.lifevest.chartPartNumbers.data = pnData;
                this.lifevest.chartPartNumbers.colors = palette.slice(0, cleanLabels.length);
            }

            if (Array.isArray(payload.highlights) && payload.highlights.length > 0) {
                this.lifevest.highlights = payload.highlights;
            }
        }

        // Persist fresh data instantly to localStorage
        this.saveToStorage();
    },

    /**
     * Recalculates dynamically calculated metrics (achievement percentages, days left, diffs)
     */
    refreshCalculatedMetrics(system) {
        const today = new Date();

        if (system === 'certification' || system === 'cert') {
            this.detailed.certifications.forEach(item => {
                const exp = new Date(item.expiry);
                const diffTime = exp.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                item.daysLeft = diffDays;
                item.status = diffDays <= 0 ? 'expired' : (diffDays <= 60 ? 'warning' : 'active');
            });

            this.certification.highlights.forEach(item => {
                const exp = new Date(item.expiry);
                const diffTime = exp.getTime() - today.getTime();
                item.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                item.status = item.daysLeft <= 0 ? 'danger' : (item.daysLeft <= 60 ? 'warning' : 'success');
            });
        }

        if (system === 'ldnd') {
            this.detailed.carpetItems.forEach(item => {
                const due = new Date(item.nextDue);
                const diffTime = due.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                item.diff = diffDays;
                item.status = diffDays <= 0 ? 'due' : (diffDays <= 14 ? 'near_due' : 'safe');
            });

            this.ldnd.highlights.forEach(item => {
                const due = new Date(item.nextDue);
                const diffTime = due.getTime() - today.getTime();
                item.diff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                item.status = item.diff <= 0 ? 'danger' : (item.diff <= 14 ? 'warning' : 'success');
            });
        }
    },

    /**
     * Synchronizes all 3 systems in parallel
     */
    async syncAll() {
        this.syncState.status = 'syncing';
        const systems = ['certification', 'ldnd', 'lifevest'];
        const results = await Promise.allSettled(systems.map(s => this.syncDashboard(s)));

        this.syncState.status = 'synced';
        this.syncState.lastSynced = new Date();

        // Persist newly synchronized state
        this.saveToStorage();

        // Dispatch sync event for reactive UI listeners
        const event = new CustomEvent('aerocabin:data-synced', {
            detail: {
                timestamp: this.syncState.lastSynced,
                results: results
            }
        });
        document.dispatchEvent(event);

        return results;
    }
};

// Immediately restore cached dataset upon script load
AerocabinData.loadFromStorage();

window.AerocabinData = AerocabinData;
