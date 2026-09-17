# Aerocabin - Unified Fleet & Training Command Center
### *Portal Terpadu Overview Sistem Pemeliharaan Aviasi GMF AeroAsia*

Portal dashboard mandiri berbasis web yang menyajikan ringkasan visual analitik real-time (*High-Speed Overview*) dari 3 pilar sistem aviasi:
1. **📜 LCU Certification & Training Dashboard**: Pemantauan masa berlaku 53 modul sertifikasi kedinasan teknisi.
2. **🧶 LDND Carpet Monitor**: Pemantauan siklus penggantian karpet kabin (Aisle & Underseat) serta stok bahan mentah (*rawmat*).
3. **🦺 Life Vest Tracker**: Pemantauan masa berlaku pelampung keselamatan kursi kabin pesawat dan forecasting penggantian.

---

## ⚡ Karakteristik Utama

- **Tanpa Login Page**: Akses instan langsung ke dashboard tanpa hambatan otentikasi.
- **Ringan & Cepat (Zero Lag)**: Menggunakan HTML5, Vanilla CSS bertema aviasi GMF, dan Vanilla JS + Chart.js. Overview memuat metrik utama secara instan tanpa melakukan query database berat saat pertama kali dibuka.
- **Desain Bergaya Cabin-Monitoring**:
  - Sticky Top Navbar dengan *Module Switcher Pills* interaktif.
  - Sidebar responsif (bisa di-*collapse* pada desktop & laci *drawer* pada mobile).
  - Mode Gelap (*Dark Mode*) default dan Mode Terang (*Light Mode*) dengan tombol toggle.
  - Jam digital dan indikator status kesiapan sistem.
- **Tombol Details Terintegrasi**:
  - Setiap modul overview memiliki tombol **"🚀 Buka Dashboard Lengkap (Details)"** yang langsung membuka URL sistem aplikasi penuh di tab baru.
  - Alamat URL aplikasi dapat disesuaikan kapan saja lewat tombol **⚙️ Pengaturan URL** di navbar kanan (tersimpan di `localStorage`).

---

## 📂 Struktur Direktori

```
Aerocabin/
├── index.html              # Halaman portal utama (SPA responsif)
├── README.md               # Panduan & dokumentasi
├── css/
│   ├── app.css             # Tema aviasi GMF, design tokens, navbar, sidebar, layout
│   └── components.css      # Styling cards KPI, charts, badges, hero, tabel, modal
├── js/
│   ├── data.js             # Data analitik representatif untuk ketiga sistem
│   ├── charts.js           # Integrasi grafik Chart.js (Donut, Bar, Stacked Bar)
│   └── app.js              # Navigasi tab, URL settings, theme toggle, DOM rendering
└── images/
    └── aerocabin-logo.svg  # Logo vektor modern Aerocabin
```

---

## 🚀 Cara Menjalankan

Anda dapat menjalankan `Aerocabin` dengan beberapa cara mudah:

### Opsi 1: Buka Langsung di Browser
Cukup buka file `index.html` langsung dengan peramban web (Google Chrome, Microsoft Edge, Firefox, dll):
```bash
# Melalui terminal Windows
start "" "c:\Users\dimas\LDND COBA\Aerocabin\index.html"
```

### Opsi 2: Menggunakan Live Server / Local Web Server
Jika Anda menggunakan ekstensi Live Server di VS Code / IDE:
- Klik kanan `Aerocabin/index.html` -> Pilih **"Open with Live Server"**.

Atau melalui terminal:
```bash
# Menggunakan npx serve
npx serve "c:\Users\dimas\LDND COBA\Aerocabin" -p 5000

# Atau menggunakan Python
python -m http.server 5000 --directory "c:\Users\dimas\LDND COBA\Aerocabin"

# Atau menggunakan PHP built-in server
php -S localhost:5000 -t "c:\Users\dimas\LDND COBA\Aerocabin"
```
Akses di browser pada: `http://localhost:5000`.

---

## ⚙️ Konfigurasi URL Target Dashboard

Secara default, tombol **Details** mengarah ke:
- **Certification Dashboard**: `https://certification-dashboard-production.up.railway.app/` (atau `http://localhost:8000`)
- **LDND Carpet Monitor**: `http://localhost:3000`
- **Lifevest Monitoring**: `http://localhost:8001`

Untuk mengubah port atau domain:
1. Klik ikon roda gigi **⚙️** di kanan atas navbar Aerocabin.
2. Masukkan alamat URL sesuai lingkungan Anda (misal `http://localhost:8000`).
3. Klik **"Simpan Pengaturan"**. Seluruh tombol **Details** akan otomatis terhubung ke URL baru.
