# 📚 Dokumentasi Teknis Arsitektur & Spesifikasi

## 1. Arsitektur Kode JavaScript
Aplikasi dibangun menggunakan pola **Modular IIFE (Immediately Invoked Function Expression)** untuk memisahkan ruang lingkup (scope) antar komponen:

- `CurrencyConverter`: Modul enkapsulasi logika konversi valuta asing, validasi input, pemformatan `Intl.NumberFormat`, serta konektivitas asynchronous ke Exchange Rate API.
- `Calculator`: Modul enkapsulasi mesin kalkulator mandiri, pengelolaan state mesin aritmatika, proteksi pembagian nol, dan penanganan input keyboard fisik.

## 2. Diagram Alur (Flowchart) Konversi
1. **Input**: Pengguna memasukkan `Jumlah` dan nilai `Kurs (Rp/USD)`.
2. **Validasi**:
   - Apakah `Jumlah >= 0` dan `Kurs > 0` (diverifikasi dengan `Number.isFinite`)?
   - **TIDAK**: Set `.is-error` pada `#conversion-result`, tampilkan pesan error, batalkan kalkulasi.
   - **YA**: Hapus error, lanjutkan ke proses arah konversi.
3. **Arah Konversi**:
   - Jika `IDR ➔ USD`: `Hasil = Jumlah ÷ Kurs`.
   - Jika `USD ➔ IDR`: `Hasil = Jumlah × Kurs`.
   - Jika mata uang sama: `Hasil = Jumlah`.
4. **Format & Render**:
   - Terapkan `Intl.NumberFormat` sesuai mata uang tujuan.
   - Render ke `#converted-result-display` dan detail penjelasannya.

## 3. Diagram Alur (Flowchart) Kalkulator
1. **Input Digit / Koma**:
   - Jika koma diketik, verifikasi `currentOperand.includes('.')`. Jika sudah ada, abaikan.
   - Tampilkan angka aktif pada `#calc-active-display`.
2. **Pilihan Operator**:
   - Simpan angka aktif ke `previousOperand`, simpan operator, tandai `shouldResetScreen = true`.
3. **Eksekusi (=)**:
   - Hitung `prev [op] curr`.
   - **Khusus Pembagian (÷)**:
     - Jika `curr === 0`: Tampilkan `"Error: Pembagi 0"`, tandai `hasError = true`, jangan biarkan menghasilkan `Infinity`.
     - Jika valid: Bulatkan floating point hingga 10 desimal (`parseFloat(res.toFixed(10))`), simpan riwayat di layar atas, tampilkan hasil di layar bawah.
4. **Backspace (⌫) & Clear (C)**:
   - `⌫`: Potong 1 karakter dari belakang; jika tersisa 0 atau kosong, set ke `'0'`.
   - `C`: Reset seluruh state (`previousOperand = ''`, `currentOperand = '0'`, `operation = null`, `hasError = false`).
