/**
 * Aerocabin System Data Provider
 * Real-world overview datasets representing:
 * 1. Certification-dashboard (LCU Training & Certification)
 * 2. LDND (LDND Carpet Monitor)
 * 3. Lifevest-Monitoring (Life Vest Tracker)
 */

const AerocabinData = {
    // Project URLs are configured in source code only.
    urls: {
        certification: 'https://certification-dashboard-production-ed6d.up.railway.app/',
        ldnd: 'https://ldnd-flax.vercel.app/',
        lifevest: 'https://lifevest-monitoring-production.up.railway.app/',
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

    // 1. Certification Dashboard Data
    certification: {
        title: "LCU Certification & Training",
        subtitle: "Sistem Pemantauan Masa Berlaku Sertifikasi Kompetensi & Pelatihan Kedinasan Pegawai",
        icon: "cert",
        badge: "LCU Learning Center",
        theme: "cert",
        stats: {
            totalEmployees: 342,
            totalCertifications: 1845,
            activeCount: 1510,
            expiringCount: 185,
            expiredCount: 150,
            avgAchievement: 91.4
        },
        chartDistribution: {
            labels: ['Aktif (>60 Hari)', 'Warning (≤60 Hari)', 'Expired (<0 Hari)'],
            data: [1510, 185, 150],
            colors: ['#10b981', '#f59e0b', '#f43f5e']
        },
        chartModules: {
            labels: ['Human Factor', 'Safety Mgmt (SMS)', 'EASA Part 145', 'CASR Part 145', 'Fuel Tank Safety', 'Quality System'],
            data: [312, 298, 265, 240, 220, 195],
            color: '#38bdf8'
        },
        highlights: [
            { name: "Ahmad Fauzi", id: "542890", cert: "Human Factor Initial", expiry: "2026-09-28", daysLeft: 11, status: "warning", dept: "Line Maintenance" },
            { name: "Budi Santoso", id: "538912", cert: "EASA Part 145 Continuation", expiry: "2026-09-22", daysLeft: 5, status: "warning", dept: "Cabin Maintenance" },
            { name: "Dimas Arya", id: "549021", cert: "Fuel Tank Safety (FTS) Phase 2", expiry: "2026-10-04", daysLeft: 17, status: "warning", dept: "Base Maintenance" },
            { name: "Eko Prasetyo", id: "531098", cert: "Safety Management System (SMS)", expiry: "2026-08-30", daysLeft: -18, status: "danger", dept: "Quality Assurance" },
            { name: "Reza Pratama", id: "550123", cert: "EWIS Group 1 & 2", expiry: "2026-10-18", daysLeft: 31, status: "warning", dept: "Avionics Shop" }
        ]
    },

    // 2. LDND Carpet Monitor Data
    ldnd: {
        title: "LDND Carpet Monitor",
        subtitle: "Sistem Pemantauan Penggantian Karpet Pesawat (Last Done / Next Due) & Kontrol Raw Material",
        icon: "ldnd",
        badge: "Cabin Carpet System",
        theme: "ldnd",
        stats: {
            totalAircraft: 84,
            alreadyDue: 14,
            nearDue: 23,
            safeCount: 131,
            rawmatGA: 1420,
            rawmatQG: 980,
            prematureCount: 7
        },
        chartDistribution: {
            labels: ['On Schedule (Safe)', 'Near Due (≤14 Hari)', 'Already Due'],
            data: [131, 23, 14],
            colors: ['#10b981', '#f59e0b', '#f43f5e']
        },
        chartFleet: {
            labels: ['B737-800', 'A320', 'A330-300', 'B777-300ER', 'ATR 72-600'],
            alreadyDue: [6, 4, 2, 1, 1],
            nearDue: [10, 7, 3, 2, 1],
            safe: [55, 42, 18, 12, 4]
        },
        highlights: [
            { reg: "PK-GFF", fleet: "B737-800", airline: "GA", type: "Aisle Carpet", nextDue: "2026-09-08", diff: -9, status: "danger", lastDone: "2026-03-08" },
            { reg: "PK-GLW", fleet: "A320-200", airline: "QG", type: "Underseat Carpet", nextDue: "2026-09-12", diff: -5, status: "danger", lastDone: "2026-03-12" },
            { reg: "PK-GLK", fleet: "A320-200", airline: "QG", type: "Aisle Carpet", nextDue: "2026-09-20", diff: 3, status: "warning", lastDone: "2026-03-20" },
            { reg: "PK-GMC", fleet: "B737-800", airline: "GA", type: "Underseat Carpet", nextDue: "2026-09-24", diff: 7, status: "warning", lastDone: "2026-03-24" },
            { reg: "PK-GPA", fleet: "A330-300", airline: "GA", type: "Aisle Carpet", nextDue: "2026-09-29", diff: 12, status: "warning", lastDone: "2026-03-29" }
        ]
    },

    // 3. Lifevest Monitoring Data
    lifevest: {
        title: "Life Vest Tracker",
        subtitle: "Sistem Pemantauan Masa Berlaku Pelampung Kursi Kabin & Peramalan Penggantian",
        icon: "lifevest",
        badge: "Safety Equipment",
        theme: "lifevest",
        stats: {
            totalVests: 14280,
            healthRate: 94.2,
            safeCount: 13450,
            warningCount: 520,
            criticalCount: 210,
            expiredCount: 100,
            forecastWeekly: 42,
            forecastMonthly: 210
        },
        chartDistribution: {
            labels: ['Safe (>60 Hari)', 'Warning (30-60 Hari)', 'Critical (<30 Hari)', 'Expired'],
            data: [13450, 520, 210, 100],
            colors: ['#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
        },
        chartPartNumbers: {
            labels: ['Adult Life Vest', 'Crew Life Vest', 'Infant Life Vest'],
            data: [12400, 1180, 700],
            colors: ['#06b6d4', '#3b82f6', '#ec4899']
        },
        highlights: [
            { reg: "PK-GNA", type: "B737-800", airline: "GA", totalSeats: 162, critical: 8, expired: 3, health: 93, status: "danger" },
            { reg: "PK-GLA", type: "A320-200", airline: "QG", totalSeats: 180, critical: 12, expired: 0, health: 93, status: "warning" },
            { reg: "PK-GPD", type: "A330-300", airline: "GA", totalSeats: 287, critical: 15, expired: 1, health: 94, status: "danger" },
            { reg: "PK-GIH", fleet: "B777-300ER", airline: "GA", totalSeats: 393, critical: 14, expired: 0, health: 96, status: "warning" },
            { reg: "PK-GQG", fleet: "A320-200", airline: "QG", totalSeats: 180, critical: 6, expired: 0, health: 97, status: "warning" }
        ]
    },

    // --- FULL DATASET UNTUK DASHBOARD TERINTEGRASI ---
    detailed: {
        // 1. Full Certification Records
        certifications: [
            { id: 1, name: "Ahmad Fauzi", empId: "542890", cert: "Human Factor Initial", certNo: "HF-2024-0891", dept: "Line Maintenance", issue: "2024-09-28", expiry: "2026-09-28", daysLeft: 11, status: "warning" },
            { id: 2, name: "Budi Santoso", empId: "538912", cert: "EASA Part 145 Continuation", certNo: "EASA-2024-1102", dept: "Cabin Maintenance", issue: "2024-09-22", expiry: "2026-09-22", daysLeft: 5, status: "warning" },
            { id: 3, name: "Dimas Arya", empId: "549021", cert: "Fuel Tank Safety (FTS) Phase 2", certNo: "FTS-2024-0412", dept: "Base Maintenance", issue: "2024-10-04", expiry: "2026-10-04", daysLeft: 17, status: "warning" },
            { id: 4, name: "Eko Prasetyo", empId: "531098", cert: "Safety Management System (SMS)", certNo: "SMS-2024-0098", dept: "Quality Assurance", issue: "2024-08-30", expiry: "2026-08-30", daysLeft: -18, status: "expired" },
            { id: 5, name: "Reza Pratama", empId: "550123", cert: "EWIS Group 1 & 2", certNo: "EWIS-2024-0331", dept: "Avionics Shop", issue: "2024-10-18", expiry: "2026-10-18", daysLeft: 31, status: "warning" },
            { id: 6, name: "Siti Rahmawati", empId: "548761", cert: "CASR Part 145 Awareness", certNo: "CASR-2024-0819", dept: "Quality Assurance", issue: "2024-11-12", expiry: "2026-11-12", daysLeft: 56, status: "warning" },
            { id: 7, name: "Hendra Gunawan", empId: "537829", cert: "GMF Quality System", certNo: "GQS-2025-0104", dept: "Base Maintenance", issue: "2025-01-15", expiry: "2027-01-15", daysLeft: 120, status: "active" },
            { id: 8, name: "Fajar Nugraha", empId: "551204", cert: "Aviation Legislation", certNo: "AVL-2025-0210", dept: "Line Maintenance", issue: "2025-02-20", expiry: "2027-02-20", daysLeft: 156, status: "active" },
            { id: 9, name: "Tri Wahyudi", empId: "532984", cert: "Human Factor Continuation", certNo: "HF-2024-0105", dept: "Cabin Maintenance", issue: "2024-08-10", expiry: "2026-08-10", daysLeft: -38, status: "expired" },
            { id: 10, name: "Ilham Ramadhan", empId: "552190", cert: "Safety Management System (SMS)", certNo: "SMS-2025-0418", dept: "Cabin Maintenance", issue: "2025-04-10", expiry: "2027-04-10", daysLeft: 205, status: "active" },
            { id: 11, name: "Agus Setiawan", empId: "540112", cert: "Fuel Tank Safety (FTS) Phase 1", certNo: "FTS-2025-0601", dept: "Base Maintenance", issue: "2025-06-01", expiry: "2027-06-01", daysLeft: 257, status: "active" },
            { id: 12, name: "Doni Kurniawan", empId: "547833", cert: "EASA Part 145 Initial", certNo: "EASA-2024-0901", dept: "Line Maintenance", issue: "2024-09-01", expiry: "2026-09-01", daysLeft: -16, status: "expired" }
        ],

        // 2. Full LDND Carpet Master Data
        carpetItems: [
            { id: 1, reg: "PK-GFF", fleet: "B737-800", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-03-08", nextDue: "2026-09-08", diff: -9, status: "due", acStatus: "ACTIVE", lastWo: "WO-24-08912" },
            { id: 2, reg: "PK-GFF", fleet: "B737-800", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-09-08", nextDue: "2026-09-08", diff: -9, status: "due", acStatus: "ACTIVE", lastWo: "WO-24-08913" },
            { id: 3, reg: "PK-GLW", fleet: "A320-200", airline: "QG", type: "Underseat", interval: 12, lastDone: "2025-09-12", nextDue: "2026-09-12", diff: -5, status: "due", acStatus: "ACTIVE", lastWo: "WO-24-09100" },
            { id: 4, reg: "PK-GLW", fleet: "A320-200", airline: "QG", type: "Aisle", interval: 6, lastDone: "2026-04-12", nextDue: "2026-10-12", diff: 25, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-10291" },
            { id: 5, reg: "PK-GLK", fleet: "A320-200", airline: "QG", type: "Aisle", interval: 6, lastDone: "2026-03-20", nextDue: "2026-09-20", diff: 3, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-24-07611" },
            { id: 6, reg: "PK-GLK", fleet: "A320-200", airline: "QG", type: "Underseat", interval: 12, lastDone: "2025-11-20", nextDue: "2026-11-20", diff: 64, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-07612" },
            { id: 7, reg: "PK-GMC", fleet: "B737-800", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-09-24", nextDue: "2026-09-24", diff: 7, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-24-08420" },
            { id: 8, reg: "PK-GMC", fleet: "B737-800", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-05-10", nextDue: "2026-11-10", diff: 54, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-09882" },
            { id: 9, reg: "PK-GPA", fleet: "A330-300", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-03-29", nextDue: "2026-09-29", diff: 12, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-24-06519" },
            { id: 10, reg: "PK-GPA", fleet: "A330-300", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-12-15", nextDue: "2026-12-15", diff: 89, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-06520" },
            { id: 11, reg: "PK-GIH", fleet: "B777-300ER", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-02-15", nextDue: "2026-08-15", diff: -33, status: "due", acStatus: "PROLONG", lastWo: "WO-24-04192" },
            { id: 12, reg: "PK-GIH", fleet: "B777-300ER", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-08-15", nextDue: "2026-08-15", diff: -33, status: "due", acStatus: "PROLONG", lastWo: "WO-24-04193" },
            { id: 13, reg: "PK-GQG", fleet: "A320-200", airline: "QG", type: "Aisle", interval: 6, lastDone: "2026-06-15", nextDue: "2026-12-15", diff: 89, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-11802" },
            { id: 14, reg: "PK-GNA", fleet: "B737-800", airline: "GA", type: "Aisle", interval: 6, lastDone: "2026-05-01", nextDue: "2026-11-01", diff: 45, status: "safe", acStatus: "ACTIVE", lastWo: "WO-24-10115" },
            { id: 15, reg: "PK-GFD", fleet: "B737-800", airline: "GA", type: "Underseat", interval: 12, lastDone: "2025-10-01", nextDue: "2026-10-01", diff: 14, status: "near_due", acStatus: "ACTIVE", lastWo: "WO-24-09311" }
        ],

        // 3. Full Lifevest Fleet & 2D Seat Matrix
        lifevestFleet: [
            { reg: "PK-GNA", type: "B737-800", airline: "GA", seatsCount: 162, safe: 151, warning: 8, critical: 2, expired: 1, health: 93 },
            { reg: "PK-GLA", type: "A320-200", airline: "QG", seatsCount: 180, safe: 168, warning: 10, critical: 2, expired: 0, health: 93 },
            { reg: "PK-GPD", type: "A330-300", airline: "GA", seatsCount: 287, safe: 271, warning: 11, critical: 4, expired: 1, health: 94 },
            { reg: "PK-GIH", type: "B777-300ER", airline: "GA", seatsCount: 393, safe: 377, warning: 12, critical: 4, expired: 0, health: 96 },
            { reg: "PK-GQG", type: "A320-200", airline: "QG", seatsCount: 180, safe: 174, warning: 5, critical: 1, expired: 0, health: 97 },
            { reg: "PK-GFF", type: "B737-800", airline: "GA", seatsCount: 162, safe: 155, warning: 5, critical: 2, expired: 0, health: 96 },
            { reg: "PK-GLW", type: "A320-200", airline: "QG", seatsCount: 180, safe: 165, warning: 12, critical: 3, expired: 0, health: 92 }
        ],

        // Generated Seat Matrix for B737/A320 layout (Rows 1-28, Seats A,B,C - D,E,F)
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
    }
};

window.AerocabinData = AerocabinData;
