# Capstone_Project_KasKu

**KasKu – Aplikasi Pencatatan Kas & Iuran Organisasi Mahasiswa**
Capstone Project IBM SkillsBuild – Track **IBM Bob**

KasKu adalah aplikasi web sederhana untuk membantu bendahara organisasi mahasiswa (himpunan, UKM, kepanitiaan) mencatat iuran anggota, pemasukan, dan pengeluaran kas dalam satu tempat. Seluruh kode aplikasi dibangun dengan bantuan **IBM Bob** sebagai AI coding agent di Visual Studio Code, menggunakan prompt berlapis (*prompt layering*) dan iterasi terarah.

---

## Problem Statement

Di banyak organisasi mahasiswa, pengelolaan kas masih dilakukan secara manual: iuran dicatat di buku atau spreadsheet yang jarang diperbarui, bukti pembayaran tercecer di chat WhatsApp, dan bendahara harus mengecek satu per satu siapa yang belum membayar. Akibatnya saldo kas sulit dipastikan, rawan salah hitung, penagihan memakan waktu, dan penyusunan laporan pertanggungjawaban (LPJ) menjadi sulit.

## Target Users

- **Bendahara** organisasi mahasiswa, UKM, atau kepanitiaan acara kampus (pengguna utama).
- **Ketua / pengurus inti** yang perlu memantau kondisi kas dan membutuhkan data untuk laporan.

---

## Fitur

| Fitur | Keterangan |
|---|---|
| **Dashboard** | Kartu ringkasan Total Saldo, Pemasukan, Pengeluaran, jumlah anggota belum bayar, 5 transaksi terakhir, dan grafik batang pemasukan vs pengeluaran 6 bulan terakhir |
| **Anggota (CRUD)** | Kelola data anggota: nama, NIM, divisi, nomor WhatsApp |
| **Iuran Bulanan** | Tandai status Lunas/Belum per bulan; status Lunas otomatis tercatat sebagai transaksi pemasukan |
| **Transaksi (CRUD)** | Catat pemasukan/pengeluaran per kategori, dengan filter jenis & bulan serta pencarian |
| **Pengingat WhatsApp** | Salin pesan pengingat berisi daftar anggota yang belum bayar, plus link `wa.me` per anggota |
| **Export CSV** | Unduh data transaksi untuk keperluan laporan |
| **Responsif** | Tabel otomatis berubah menjadi *card list* di layar HP, dilengkapi empty state & toast notifikasi |
| **Penyimpanan lokal** | Data tersimpan di `localStorage` browser, disertai data contoh dan tombol Reset Data |

## Teknologi

- HTML5 (semantik)
- Tailwind CSS (via CDN)
- Vanilla JavaScript (tanpa framework/library)
- `localStorage` sebagai penyimpanan data
- **IBM Bob** (mode Code/Agent) sebagai AI coding assistant

## Struktur File

```
Capstone_Project_KasKu/
├── index.html   # Struktur halaman & tab navigasi
├── style.css    # Styling tambahan (empty state, data card, dll.)
├── script.js    # Logika aplikasi: CRUD, iuran, filter, grafik, export, localStorage
└── README.md
```

## Cara Menjalankan

**Cara 1 – langsung di browser**
1. Clone atau download repository ini.
2. Buka file `index.html` dengan klik dua kali (terbuka di Chrome/Safari/Edge).

**Cara 2 – VS Code + Live Server**
1. Buka folder project di VS Code.
2. Install extension **Live Server**.
3. Klik kanan `index.html` → **Open with Live Server**.

> Membutuhkan koneksi internet untuk memuat Tailwind CSS dari CDN.

---

## Arsitektur Prompt (Prompt Layering)

Prompt utama untuk IBM Bob disusun dalam tiga lapisan:

| Layer | Pertanyaan yang dijawab | Isi |
|---|---|---|
| **1. Role & Context** | Bob berbicara sebagai siapa & dalam konteks apa? | Bob sebagai *Senior Frontend Engineer* yang membangun aplikasi KasKu untuk bendahara organisasi mahasiswa; batasan HTML + Tailwind CDN + Vanilla JS, tanpa framework & backend, data di localStorage |
| **2. Task & Requirements** | Apa yang harus dibangun? | Rincian fitur bernomor: tab navigasi, dashboard, CRUD anggota, iuran bulanan, CRUD transaksi + filter, pengingat WhatsApp, export CSV, data contoh |
| **3. Constraints & Output** | Bagaimana hasil akhirnya harus terlihat & berfungsi? | 3 file terpisah, tema emerald + amber, mobile-first, format Rupiah `id-ID`, validasi input, modal konfirmasi custom, teks berbahasa Indonesia, kode berkomentar, tanpa error console |

<details>
<summary><b>Lihat prompt utama</b></summary>

```
Anda adalah seorang Senior Frontend Engineer yang berpengalaman membangun aplikasi web pencatatan keuangan menggunakan HTML, Tailwind CSS (via CDN), dan Vanilla JavaScript. Anda sedang membangun aplikasi bernama "KasKu" untuk bendahara organisasi mahasiswa. Batasan wajib: tanpa framework, tanpa backend, seluruh data disimpan di localStorage browser.

Buat aplikasi KasKu dengan navigasi tab: Dashboard, Anggota, Iuran, dan Transaksi, yang berpindah tanpa me-refresh halaman. Fitur yang wajib ada:
1. Dashboard: kartu ringkasan Total Saldo, Total Pemasukan, Total Pengeluaran, dan Jumlah Anggota Belum Bayar Iuran bulan ini, serta daftar 5 transaksi terakhir.
2. Anggota (CRUD): nama, NIM, divisi, dan nomor WhatsApp.
3. Iuran Bulanan: pilih bulan, tampilkan semua anggota dengan status Lunas/Belum yang bisa diubah. Nominal iuran bisa diatur (default Rp10.000). Menandai Lunas otomatis membuat transaksi pemasukan kategori "Iuran", dan membatalkannya menghapus transaksi tersebut.
4. Transaksi (CRUD): tanggal, jenis (Pemasukan/Pengeluaran), kategori (Iuran, Sponsor, Konsumsi, Perlengkapan, Transportasi, Lainnya), nominal, dan keterangan. Sediakan filter berdasarkan jenis dan bulan, serta pencarian keterangan.
5. Pengingat: tombol "Salin Pesan Pengingat" yang menyalin teks WhatsApp berisi daftar nama anggota yang belum bayar iuran pada bulan terpilih, dan tombol link wa.me untuk setiap anggota yang belum bayar.
6. Tombol Export CSV untuk data transaksi.
7. Data contoh berisi 8 anggota dan 10 transaksi saat aplikasi pertama kali dibuka, serta tombol Reset Data.

Pisahkan kode ke dalam tiga file: index.html, style.css, dan script.js. Tampilan modern, minimalis, profesional, dan responsif (mobile-first) dengan warna utama hijau emerald, aksen kuning amber, dan latar slate terang. Gunakan card, rounded corner, soft shadow, hover effect, dan smooth transition. Format semua nominal dalam Rupiah menggunakan Intl.NumberFormat('id-ID'). Validasi input: nama wajib diisi, nominal harus lebih dari 0, dan nomor WhatsApp diawali 08 atau 62. Gunakan modal konfirmasi custom sebelum menghapus data (bukan alert/confirm bawaan browser). Semua teks antarmuka berbahasa Indonesia. Terapkan HTML semantik, beri penamaan variabel dan fungsi yang jelas, tambahkan komentar pada bagian penting, hindari kode yang tidak digunakan, dan pastikan tidak ada error di console serta seluruh fitur berfungsi.
```
</details>

## Iterasi Prompt (Targeted Refinement)

Prinsip yang dipakai: **satu masalah pada output = satu layer yang direvisi**, tanpa menulis ulang seluruh prompt.

**Iterasi 1 – revisi Layer 2 (fitur)**
Dashboard awal hanya menampilkan angka total, sehingga tren keuangan antarbulan tidak terlihat. Ditambahkan grafik batang pemasukan vs pengeluaran 6 bulan terakhir (div + Tailwind, tanpa library) yang memakai ulang fungsi perhitungan yang sudah ada.

```
Tambahkan grafik batang perbandingan Pemasukan vs Pengeluaran selama 6 bulan terakhir di tab Dashboard. Buat grafik hanya dengan elemen div dan Tailwind CSS, tanpa library chart. Gunakan data transaksi yang sudah ada di localStorage dan fungsi perhitungan yang sudah ada. Jangan ubah fitur atau tampilan lain.
```

**Iterasi 2 – revisi Layer 3 (tampilan & kualitas)**
Di layar HP tabel meluber ke samping, tidak ada umpan balik setelah aksi, dan halaman kosong membingungkan. Tabel diubah menjadi *card list* di mobile, serta ditambahkan empty state dan toast notifikasi.

```
Perbaiki tampilan pada layar kecil (di bawah 640px): ubah tabel Anggota, Iuran, dan Transaksi menjadi daftar card agar tidak meluber ke samping. Tambahkan empty state (ikon + pesan) jika data kosong atau hasil filter tidak ditemukan, dan tambahkan toast notifikasi singkat setiap kali data berhasil ditambah, diubah, dihapus, atau disalin. Jangan ubah logika dan fitur yang sudah ada.
```

---

## Potensi Pengembangan

- Backend & database (Firebase/Supabase) dengan login multi-pengurus agar data tersinkron antarperangkat.
- Upload foto bukti transaksi dan generate laporan LPJ otomatis dalam format PDF.
- Pengingat iuran terjadwal via WhatsApp Business API atau email.
- Integrasi pembayaran digital (QRIS/payment gateway) agar status iuran otomatis Lunas.
- Asisten AI (IBM watsonx/Granite) untuk menjawab pertanyaan keuangan dan memberi insight anggaran.

---

## Author

**Darrell Satriano**
Teknik Informatika, Universitas Sriwijaya
GitHub: [@Grimarks](https://github.com/Grimarks)
