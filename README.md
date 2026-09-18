# CabinX - Unified Fleet & Operational Command Center
### *Portal Terpadu Overview Sistem Pemeliharaan Aviasi GMF AeroAsia*

Portal dashboard mandiri berbasis web yang menyajikan ringkasan visual analitik real-time (*High-Speed Overview*) dan sinkronisasi data langsung dari 3 pilar sistem aviasi:
1. **📜 LCU Certification & Training Dashboard**: `https://certification-dashboard-production-ed6d.up.railway.app/login`
2. **🧶 LDND Carpet Monitor**: `https://ldnd-flax.vercel.app/`
3. **🦺 Life Vest Tracker**: `https://lifevest-monitoring-production.up.railway.app/login`

---

## ⚡ Karakteristik Utama

- **Sinkronisasi Data Langsung**: Tombol **Live Sync** di navbar untuk sinkronisasi metrik real-time dari endpoint masing-masing dashboard.
- **Tanpa Login Page**: Akses overview instan langsung ke command center tanpa hambatan otentikasi awal.
- **Ringan & Cepat (Zero Lag)**: Menggunakan HTML5, Vanilla CSS modular, Vanilla JS, dan Chart.js.
- **Desain Mewah Bergaya Cabin-Monitoring**:
  - Sticky Top Navbar dengan *Module Switcher Pills* interaktif.
  - Sidebar responsif (bisa di-*collapse* pada desktop & laci *drawer* pada mobile).
  - Mode Gelap Luxury Charcoal (*Dark Mode*) default dan Mode Terang (*Light Mode*) dengan tombol toggle.
  - Jam digital live dan status indikator sinkronisasi data.
- **Tombol Details Terintegrasi**:
  - Setiap modul overview memiliki tombol **"🚀 Details →"** yang membuka dashboard penuh secara langsung.
  - Alamat URL aplikasi dapat disesuaikan kapan saja lewat tombol **⚙️ Konfigurasi URL** di navbar kanan.

---

## 📂 Struktur Direktori CSS Modular

```
CabinX/
├── index.html              # Halaman portal utama (SPA responsif)
├── README.md               # Panduan & dokumentasi
├── css/
│   ├── app.css             # Tema aviasi, design tokens, navbar, sidebar, layout
│   ├── components.css      # Master index import
│   ├── hero.css            # Module hero banner & header
│   ├── buttons.css         # Button variants & badges
│   ├── cards.css           # KPI cards, chart containers, tables & showcase cards
│   ├── icons.css           # Simple CSS icon system
│   ├── modal.css           # Modal dialog & form inputs
│   ├── dashboard.css       # View headers, filter toolbars & sub-tabs
│   ├── seatmap.css         # Interactive 2D Seat Map & legend
│   ├── iframe.css          # Embedded dashboard iframe views, loader & error states
│   └── dark-theme.css      # Luxury dark theme scoped overrides
├── js/
│   ├── data.js             # Data provider & live synchronization hub
│   ├── charts.js           # Integrasi grafik Chart.js dinamis
│   └── app.js              # Controller aplikasi, router, KPI renderer & settings modal
└── images/
    └── cabinx.jpeg         # Logo CabinX
```

---

## 🚀 Cara Menjalankan

Buka file `index.html` langsung di browser atau jalankan web server lokal:
```bash
# Menggunakan npx serve
npx serve . -p 5000

# Atau menggunakan Python
python -m http.server 5000
```
Akses di browser pada: `http://localhost:5000`.
