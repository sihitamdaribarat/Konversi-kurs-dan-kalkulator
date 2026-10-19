# 💱 Konverter Mata Uang IDR ↔ USD & Kalkulator Digital

Aplikasi web modern berbasis **Vanilla HTML5, CSS3, dan JavaScript (ES6+)** yang menggabungkan fitur **Konverter Valuta Asing (Rupiah Indonesia & Dolar AS)** dengan **Mesin Kalkulator Digital Mandiri** dalam antarmuka dua kolom yang responsif, elegan, dan aksesibel.

---

## 📁 Struktur Repositori

```text
konversi-mata-uang/
├── index.html       # Struktur semantik HTML5, ARIA labels, dan layout 2 kolom
├── style.css        # Desain CSS3 murni responsif (CSS Grid, Flexbox, Design Tokens)
├── script.js        # Logika modular: CurrencyConverter & Calculator Engine
├── docs/            # Dokumentasi pendukung dan spesifikasi perancangan
└── README.md        # Panduan penggunaan, fitur, dan checklist pengujian
```

---

## 🚀 Panduan Menjalankan Secara Lokal

Aplikasi ini dibuat secara **100% murni tanpa dependensi eksternal, bundler, atau framework** (Zero Dependency).

### Cara Menjalankan:
1. Unduh atau clone repositori ini ke komputer Anda.
2. Buka folder proyek di File Explorer.
3. Klik ganda pada berkas **`index.html`** untuk langsung membukanya di peramban web pilihan Anda (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, dll.).
4. *(Opsi Pengembang)*: Anda juga dapat menggunakan ekstensi **Live Server** di Visual Studio Code untuk pengalaman live reload.

---

## ✨ Ringkasan Fitur Aplikasi

### 1. 💵 Konverter Mata Uang IDR ↔ USD
- **Dukungan Dua Arah (Bilateral)**:
  - **IDR ke USD**: `Hasil = Jumlah ÷ Kurs`
  - **USD ke IDR**: `Hasil = Jumlah × Kurs`
- **Mekanisme Tombol Swap (⇄ / ⇅)**:
  - Menukar posisi mata uang asal ("Dari") dan tujuan ("Ke") secara instan.
  - Otomatis mengubah simbol prefix nominal input (`Rp` $\leftrightarrow$ `$`).
  - Responsif: Berubah menjadi ikon vertikal `⇅` pada layar ponsel ($\le$ 768px).
- **Validasi Input Ketat**:
  - Memverifikasi angka valid dengan `Number.isFinite`.
  - Syarat mutlak: **Jumlah $\ge$ 0** dan **Kurs > 0**.
  - Jika input tidak valid saat konversi diminta, boks hasil berubah menjadi merah (`.is-error`) disertai pesan edukatif yang jelas.
  - Saat pengetikan langsung (*on-input*), hasil tidak memicu warna merah melainkan menampilkan status netral hingga input valid.
- **Standar Pemformatan `Intl.NumberFormat`**:
  - Menggunakan API baku browser `Intl.NumberFormat('id-ID')` untuk Rupiah dan `Intl.NumberFormat('en-US')` untuk Dolar AS dengan presisi 2 digit desimal.
- **Sinkronisasi Kurs Dinamis via API**:
  - Mengambil data kurs terkini IDR per 1 USD secara asynchronous dari **Exchange Rate API** (`open.er-api.com`).
  - Memperbarui timestamp terakhir di bagian *footer*.
  - Dilengkapi mekanisme **Fallback Otomatis** (1 USD = Rp 16.000) jika perangkat offline atau koneksi API terputus.
  - Mempertahankan nilai kurs yang diedit secara manual oleh pengguna agar tidak tertimpa otomatis saat sinkronisasi background.

### 2. 🧮 Mesin Kalkulator Digital Mandiri
- **State Machine Mandiri**:
  - Mengelola state bilangan pertama (`previousOperand`), operator aritmatika (`+`, `-`, `×`, `÷`), bilangan kedua (`currentOperand`), serta flag status reset layar.
- **Operasi Aritmatika Dasar**:
  - Penjumlahan (`+`), Pengurangan (`-`), Perkalian (`×`), dan Pembagian (`÷`).
  - Layar ganda atas-bawah (riwayat operasi lengkap & digit aktif).
- **Proteksi Pembagian Nol (Zero Division Guard)**:
  - Jika operasi pembagian dengan nol dilakukan (`n ÷ 0`), layar kalkulator menampilkan **`Error: Pembagi 0`** dan mencegah keluarnya nilai `Infinity` atau `NaN`.
- **Proteksi Titik/Koma Desimal Ganda**:
  - Mencegah input titik desimal ganda pada bilangan yang sama (misal `3..5` dicegah menjadi `3.5`).
- **Fitur Hapus & Reset**:
  - **Backspace (⌫)**: Menghapus 1 digit terakhir dari kanan; jika digit habis, otomatis kembali ke `0`.
  - **Clear (C)**: Mereset seluruh memori kalkulator ke kondisi awal.
- **Dukungan Input Keyboard Fisik**:
  - Mendukung input angka `0`-`9`, tanda desimal `.`, `,`, operator `+`, `-`, `*`, `/`, tombol `Enter` / `=`, `Backspace`, dan `Escape` / `C`.
  - Dilengkapi deteksi konteks agar shortcut keyboard kalkulator tidak mengganggu saat pengguna sedang mengetik di input form konverter.

---

## 🧪 Checklist Pengujian Kasus Batas (Edge Cases)

| Kategori | Skenario Kasus Uji | Input | Output yang Diharapkan | Status |
|---|---|---|---|:---:|
| **Konverter** | Input nominal negatif | Jumlah: `-50000` | Boks merah `.is-error`: *"Jumlah tidak valid... minimal 0."* | ☐ Belum diuji |
| **Konverter** | Input kurs nol atau negatif | Kurs: `0` atau `-16000` | Boks merah `.is-error`: *"Kurs tidak valid... harus positif (> 0)."* | ☐ Belum diuji |
| **Konverter** | Input non-numerik / kosong | Jumlah: `""` atau teks | Validasi gagal, kalkulasi dibatalkan secara aman | ☐ Belum diuji |
| **Konverter** | Tukar mata uang (Swap) | Klik tombol `⇄` | Pilihan mata uang terbalik, prefix berubah, hasil terhitung ulang | ☐ Belum diuji |
| **Konverter** | Kegagalan jaringan API | Mode Offline | Fallback aktif: `1 USD = Rp 16.000`, status footer offline | ☐ Belum diuji |
| **Kalkulator** | Pembagian dengan nol | `15 ÷ 0 =` | Layar menampilkan teks merah **`Error: Pembagi 0`** (bukan `Infinity`) | ☐ Belum diuji |
| **Kalkulator** | Pengetikan titik ganda | `7 . . 5` | Layar hanya menerima satu titik/koma desimal: `7,5` | ☐ Belum diuji |
| **Kalkulator** | Titik di awal bilangan kosong | Klik `.` atau `,` saat layar `0` | Layar otomatis menampilkan `0,` | ☐ Belum diuji |
| **Kalkulator** | Penghapusan digit tunggal | Angka `8` lalu tekan `⌫` | Layar kembali ke nilai default `0` | ☐ Belum diuji |
| **Kalkulator** | Presisi desimal floating point | `0.1 + 0.2 =` | Menghasilkan nilai presisi bersih `0,3` dengan `toPrecision(12)` | ☐ Belum diuji |
| **Kalkulator** | Operasi berantai | `2 + 3 + 4 =` | Otomatis menghitung `5` lalu melanjutkan kalkulasi menjadi `9` | ☐ Belum diuji |
| **Aksesibilitas** | Navigasi keyboard | Tab, Enter, Space | Seluruh tombol dapat diakses via keyboard dengan ring fokus jelas | ☐ Belum diuji |

---

## 🎨 Palet Desain, Tipografi & Interaktivitas
- **Warna Latar Belakang**: `#f4f6f9` (Neutral Light Slate)
- **Warna Permukaan Kartu**: `#ffffff` dengan kontur border `#e2e8f0` dan bayangan lembut
- **Aksen Utama**: `#2563eb` (Modern Royal Blue)
- **Indikator Sukses Konversi**: `#ecfdf5` (Mint Green) dengan teks `#065f46`
- **Indikator Error**: `#fef2f2` (Soft Crimson) dengan teks `#991b1b`
- **Layar Kalkulator**: `#0f172a` (Deep Slate LCD Display)
- **Tipografi**: Font `Inter` (antarmuka umum) dan `JetBrains Mono` (angka & layar kalkulator) yang dimuat dari Google Fonts
- **Efek Feedback Tombol**: Menggunakan class CSS `.btn-calc:active` dan `.btn-calc.btn-calc-active` untuk feedback visual penekanan tombol dan keyboard fisik

---

## 📄 Lisensi & Hak Cipta
Dibuat sebagai aplikasi web konverter mata uang dan kalkulator digital modern. Bebas digunakan dan dikembangkan untuk tujuan pembelajaran.
