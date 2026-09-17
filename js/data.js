/**
 * Aerocabin System Data Provider
 * Real-world overview datasets representing:
 * 1. Certification-dashboard (LCU Training & Certification)
 * 2. LDND (LDND Carpet Monitor)
 * 3. Lifevest-Monitoring (Life Vest Tracker)
 */

const AerocabinData = {
    // Project URLs (user configurable with localStorage persistence)
    urls: {
        certification: localStorage.getItem('aerocabin_url_cert') || 'https://certification-dashboard-production.up.railway.app/',
        ldnd: localStorage.getItem('aerocabin_url_ldnd') || 'http://localhost:3000',
        lifevest: localStorage.getItem('aerocabin_url_lifevest') || 'http://localhost:8001',
    },

    saveUrls(certUrl, ldndUrl, lifevestUrl) {
        this.urls.certification = certUrl.trim() || 'https://certification-dashboard-production.up.railway.app/';
        this.urls.ldnd = ldndUrl.trim() || 'http://localhost:3000';
        this.urls.lifevest = lifevestUrl.trim() || 'http://localhost:8001';

        localStorage.setItem('aerocabin_url_cert', this.urls.certification);
        localStorage.setItem('aerocabin_url_ldnd', this.urls.ldnd);
        localStorage.setItem('aerocabin_url_lifevest', this.urls.lifevest);
    },

    // 1. Certification Dashboard Data
    certification: {
        title: "LCU Certification & Training",
        subtitle: "Sistem Pemantauan Masa Berlaku Sertifikasi Kompetensi & Pelatihan Kedinasan Pegawai",
        icon: "📜",
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
        icon: "🧶",
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
        icon: "🦺",
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
    }
};

window.AerocabinData = AerocabinData;
