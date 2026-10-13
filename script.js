/* =====================================================
   KasKu — script.js
   Aplikasi Kas Organisasi Mahasiswa
   Seluruh data disimpan di localStorage browser.
   ===================================================== */

'use strict';

// =====================================================
// KONSTANTA & KUNCI STORAGE
// =====================================================
const STORAGE_KEYS = {
  anggota   : 'kasku_anggota',
  transaksi : 'kasku_transaksi',
  iuran     : 'kasku_iuran',       // { "YYYY-MM_angId": true/false }
  nominal   : 'kasku_nominal_iuran',
  inited    : 'kasku_initialized',
};

const NOMINAL_DEFAULT = 10000;

// Format Rupiah
const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

// Format tanggal ke dd Mmm YYYY
const formatTanggal = (isoDate) => {
  if (!isoDate) return '-';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Nama bulan dari "YYYY-MM"
const namaBulan = (bulanStr) => {
  if (!bulanStr) return '';
  const [y, m] = bulanStr.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

// Buat ID unik sederhana
const buatId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// =====================================================
// LOCALSTORAGE HELPERS
// =====================================================
const simpan = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const ambil  = (key, defaultVal = []) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : defaultVal;
};

// =====================================================
// DATA CONTOH (dimuat saat pertama kali buka)
// =====================================================
function muatDataContoh() {
  const anggotaContoh = [
    { id: 'a1', nama: 'Budi Santoso',    nim: '0612345001', divisi: 'Keuangan',    wa: '081234560001' },
    { id: 'a2', nama: 'Sari Dewi',       nim: '0612345002', divisi: 'Keuangan',    wa: '081234560002' },
    { id: 'a3', nama: 'Andi Prasetyo',   nim: '0612345003', divisi: 'Humas',       wa: '081234560003' },
    { id: 'a4', nama: 'Rina Kartika',    nim: '0612345004', divisi: 'Humas',       wa: '081234560004' },
    { id: 'a5', nama: 'Doni Kurniawan',  nim: '0612345005', divisi: 'Litbang',     wa: '081234560005' },
    { id: 'a6', nama: 'Maya Lestari',    nim: '0612345006', divisi: 'Litbang',     wa: '081234560006' },
    { id: 'a7', nama: 'Fajar Nugroho',   nim: '0612345007', divisi: 'Kesekretariatan', wa: '081234560007' },
    { id: 'a8', nama: 'Indah Permata',   nim: '0612345008', divisi: 'Kesekretariatan', wa: '081234560008' },
  ];

  // Bulan lalu dan bulan ini
  const sekarang  = new Date();
  const bln       = (thn, bln) => `${thn}-${String(bln).padStart(2,'0')}`;
  const thn       = sekarang.getFullYear();
  const bln_ini   = sekarang.getMonth() + 1;
  const bln_lalu  = bln_ini === 1 ? 12 : bln_ini - 1;
  const thn_lalu  = bln_ini === 1 ? thn - 1 : thn;

  const tgl = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const transaksiContoh = [
    { id:'t1', tanggal: tgl(thn_lalu, bln_lalu, 5),  jenis:'Pemasukan',    kategori:'Iuran',          nominal:10000, keterangan:'Iuran Budi Santoso' },
    { id:'t2', tanggal: tgl(thn_lalu, bln_lalu, 5),  jenis:'Pemasukan',    kategori:'Iuran',          nominal:10000, keterangan:'Iuran Sari Dewi' },
    { id:'t3', tanggal: tgl(thn_lalu, bln_lalu, 7),  jenis:'Pemasukan',    kategori:'Sponsor',        nominal:500000, keterangan:'Sponsor banner seminar' },
    { id:'t4', tanggal: tgl(thn_lalu, bln_lalu, 10), jenis:'Pengeluaran',  kategori:'Konsumsi',       nominal:120000, keterangan:'Konsumsi rapat bulanan' },
    { id:'t5', tanggal: tgl(thn_lalu, bln_lalu, 15), jenis:'Pengeluaran',  kategori:'Perlengkapan',   nominal:85000,  keterangan:'Kertas & ATK' },
    { id:'t6', tanggal: tgl(thn, bln_ini, 2),         jenis:'Pemasukan',    kategori:'Iuran',          nominal:10000, keterangan:'Iuran Andi Prasetyo' },
    { id:'t7', tanggal: tgl(thn, bln_ini, 3),         jenis:'Pemasukan',    kategori:'Iuran',          nominal:10000, keterangan:'Iuran Rina Kartika' },
    { id:'t8', tanggal: tgl(thn, bln_ini, 5),         jenis:'Pemasukan',    kategori:'Sponsor',        nominal:300000, keterangan:'Donasi alumni' },
    { id:'t9', tanggal: tgl(thn, bln_ini, 8),         jenis:'Pengeluaran',  kategori:'Transportasi',   nominal:45000,  keterangan:'Bensin kunjungan' },
    { id:'t10',tanggal: tgl(thn, bln_ini, 10),        jenis:'Pengeluaran',  kategori:'Lainnya',        nominal:30000,  keterangan:'Cetak sertifikat' },
  ];

  // Iuran status: bulan lalu a1+a2 lunas, bulan ini a3+a4 lunas
  const iuranContoh = {};
  iuranContoh[`${bln(thn_lalu, bln_lalu)}_a1`] = true;
  iuranContoh[`${bln(thn_lalu, bln_lalu)}_a2`] = true;
  iuranContoh[`${bln(thn, bln_ini)}_a3`] = true;
  iuranContoh[`${bln(thn, bln_ini)}_a4`] = true;

  simpan(STORAGE_KEYS.anggota,  anggotaContoh);
  simpan(STORAGE_KEYS.transaksi, transaksiContoh);
  simpan(STORAGE_KEYS.iuran,    iuranContoh);
  simpan(STORAGE_KEYS.nominal,  NOMINAL_DEFAULT);
  simpan(STORAGE_KEYS.inited,   true);
}

// =====================================================
// TOAST NOTIFIKASI
// =====================================================
let toastTimer = null;
function tampilkanToast(pesan, durasi = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), durasi);
}

// =====================================================
// MODAL KONFIRMASI
// =====================================================
let onKonfirmasiHapus = null;

function tampilkanModal(pesan, onYes) {
  document.getElementById('modalPesan').textContent = pesan;
  document.getElementById('modalKonfirmasi').classList.remove('hidden');
  onKonfirmasiHapus = onYes;
}

document.getElementById('modalBatal').addEventListener('click', () => {
  document.getElementById('modalKonfirmasi').classList.add('hidden');
  onKonfirmasiHapus = null;
});

document.getElementById('modalHapus').addEventListener('click', () => {
  if (typeof onKonfirmasiHapus === 'function') onKonfirmasiHapus();
  document.getElementById('modalKonfirmasi').classList.add('hidden');
  onKonfirmasiHapus = null;
});

// Tutup modal saat klik overlay
document.getElementById('modalKonfirmasi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('modalKonfirmasi').classList.add('hidden');
    onKonfirmasiHapus = null;
  }
});

// =====================================================
// NAVIGASI TAB
// =====================================================
function initTab() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Nonaktifkan semua
      tabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      // Aktifkan yang dipilih
      btn.classList.add('active');
      const target = document.getElementById('tab-' + btn.dataset.tab);
      target.classList.remove('hidden');
      // Refresh konten jika diperlukan
      if (btn.dataset.tab === 'dashboard') renderDashboard();
      if (btn.dataset.tab === 'iuran')     renderIuran();
      if (btn.dataset.tab === 'transaksi') renderTransaksi();
    });
  });
}

// =====================================================
// GRAFIK BATANG — Pemasukan vs Pengeluaran 6 Bulan Terakhir
// =====================================================

/**
 * Menghitung total per jenis untuk setiap bulan dalam rentang 6 bulan terakhir,
 * lalu merender kolom-kolom batang berpasangan ke dalam #grafikBatang.
 * Tinggi batang dihitung proporsional terhadap nilai tertinggi di semua bulan.
 */
function renderGrafikBatang() {
  const transaksi = ambil(STORAGE_KEYS.transaksi);
  const container = document.getElementById('grafikBatang');

  // Buat daftar 6 bulan terakhir (dari yang paling lama ke paling baru)
  const bulanList = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    bulanList.push({ key, label, pemasukan: 0, pengeluaran: 0 });
  }

  // Akumulasi nominal transaksi ke bulan yang sesuai
  transaksi.forEach(t => {
    if (!t.tanggal) return;
    const bulanTrx = t.tanggal.slice(0, 7); // "YYYY-MM"
    const slot = bulanList.find(b => b.key === bulanTrx);
    if (!slot) return;
    if (t.jenis === 'Pemasukan')   slot.pemasukan   += Number(t.nominal);
    if (t.jenis === 'Pengeluaran') slot.pengeluaran += Number(t.nominal);
  });

  // Nilai tertinggi di antara semua batang → sebagai basis 100% tinggi
  const nilaiMax = Math.max(...bulanList.map(b => Math.max(b.pemasukan, b.pengeluaran)), 1);

  // Tinggi area grafik dalam px (harus cocok dengan h-44 = 176px di HTML, dikurangi label)
  const TINGGI_MAX_PX = 120;

  container.innerHTML = bulanList.map(b => {
    const pctPemasukan   = (b.pemasukan   / nilaiMax) * TINGGI_MAX_PX;
    const pctPengeluaran = (b.pengeluaran / nilaiMax) * TINGGI_MAX_PX;
    // Minimal 2px agar batang tetap terlihat ketika ada nilai > 0
    const tinggiP  = b.pemasukan   > 0 ? Math.max(pctPemasukan,   2) : 0;
    const tinggiPG = b.pengeluaran > 0 ? Math.max(pctPengeluaran, 2) : 0;

    return `
      <div class="grafik-kolom" title="${b.label}">
        <!-- Pasangan batang -->
        <div class="grafik-batang-grup">
          <div class="grafik-bar grafik-bar-masuk"
               style="height:${tinggiP}px"
               title="Pemasukan ${b.label}: ${formatRupiah(b.pemasukan)}">
          </div>
          <div class="grafik-bar grafik-bar-keluar"
               style="height:${tinggiPG}px"
               title="Pengeluaran ${b.label}: ${formatRupiah(b.pengeluaran)}">
          </div>
        </div>
        <!-- Label bulan di bawah batang -->
        <p class="grafik-label">${b.label}</p>
      </div>
    `;
  }).join('');
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
  const transaksi = ambil(STORAGE_KEYS.transaksi);
  const anggota   = ambil(STORAGE_KEYS.anggota);
  const iuranMap  = ambil(STORAGE_KEYS.iuran, {});

  // Hitung total
  let totalPemasukan   = 0;
  let totalPengeluaran = 0;
  transaksi.forEach(t => {
    if (t.jenis === 'Pemasukan')   totalPemasukan   += Number(t.nominal);
    if (t.jenis === 'Pengeluaran') totalPengeluaran += Number(t.nominal);
  });
  const saldo = totalPemasukan - totalPengeluaran;

  // Hitung belum bayar bulan ini
  const now     = new Date();
  const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let belumBayar = 0;
  anggota.forEach(a => {
    if (!iuranMap[`${bulanIni}_${a.id}`]) belumBayar++;
  });

  document.getElementById('summSaldo').textContent       = formatRupiah(saldo);
  document.getElementById('summPemasukan').textContent   = formatRupiah(totalPemasukan);
  document.getElementById('summPengeluaran').textContent = formatRupiah(totalPengeluaran);
  document.getElementById('summBelumBayar').textContent  = `${belumBayar} Anggota`;
  document.getElementById('summBulanIuran').textContent  = namaBulan(bulanIni);

  // Render grafik batang setelah data kartu siap
  renderGrafikBatang();

  // 5 transaksi terakhir
  const container = document.getElementById('dashboardTransaksi');
  const lima = [...transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5);

  if (lima.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 py-6">Belum ada transaksi.</p>';
    return;
  }

  container.innerHTML = lima.map(t => `
    <div class="dash-trx-row border-b border-slate-100">
      <div class="flex items-center gap-3 min-w-0">
        <span class="badge ${t.jenis === 'Pemasukan' ? 'badge-pemasukan' : 'badge-pengeluaran'}">${t.jenis}</span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-slate-700 truncate">${escHtml(t.keterangan || '-')}</p>
          <p class="text-xs text-slate-400">${formatTanggal(t.tanggal)} · ${escHtml(t.kategori)}</p>
        </div>
      </div>
      <span class="text-sm font-semibold ${t.jenis === 'Pemasukan' ? 'text-blue-700' : 'text-red-600'} shrink-0">
        ${t.jenis === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.nominal)}
      </span>
    </div>
  `).join('');
}

// =====================================================
// ANGGOTA — CRUD
// =====================================================
function renderAnggota() {
  const anggota   = ambil(STORAGE_KEYS.anggota);
  const tbody     = document.getElementById('tabelAnggota');
  const listMobil = document.getElementById('listAnggotaMobil');
  const kosong    = document.getElementById('anggotaKosong');

  if (anggota.length === 0) {
    tbody.innerHTML    = '';
    listMobil.innerHTML = '';
    kosong.classList.remove('hidden');
    return;
  }
  kosong.classList.add('hidden');

  // ── Tabel desktop (sm ke atas) ──
  tbody.innerHTML = anggota.map(a => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-2 pr-3">
        <p class="font-medium text-slate-800">${escHtml(a.nama)}</p>
      </td>
      <td class="py-2 pr-3 text-slate-600">${escHtml(a.nim || '-')}</td>
      <td class="py-2 pr-3 text-slate-600">${escHtml(a.divisi || '-')}</td>
      <td class="py-2 pr-3 text-slate-600">${escHtml(a.wa || '-')}</td>
      <td class="py-2 text-right">
        <div class="flex gap-1 justify-end">
          <button class="btn-edit" onclick="editAnggota('${a.id}')">Edit</button>
          <button class="btn-hapus" onclick="hapusAnggota('${a.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // ── Daftar card mobile (di bawah sm) ──
  listMobil.innerHTML = anggota.map(a => `
    <div class="data-card">
      <div class="data-card-body">
        <p class="data-card-title">${escHtml(a.nama)}</p>
        <p class="data-card-meta">${escHtml(a.nim || '-')} · ${escHtml(a.divisi || '-')}</p>
        ${a.wa ? `<p class="data-card-meta">📱 ${escHtml(a.wa)}</p>` : ''}
      </div>
      <div class="data-card-actions">
        <button class="btn-edit" onclick="editAnggota('${a.id}')">Edit</button>
        <button class="btn-hapus" onclick="hapusAnggota('${a.id}')">Hapus</button>
      </div>
    </div>
  `).join('');
}

// Tampilkan form tambah
document.getElementById('btnTambahAnggota').addEventListener('click', () => {
  resetFormAnggota();
  document.getElementById('formAnggotaTitle').textContent = 'Tambah Anggota';
  document.getElementById('formAnggotaWrapper').classList.remove('hidden');
  document.getElementById('anggotaNama').focus();
});

// Batal form
document.getElementById('btnBatalAnggota').addEventListener('click', () => {
  document.getElementById('formAnggotaWrapper').classList.add('hidden');
  resetFormAnggota();
});

function resetFormAnggota() {
  document.getElementById('anggotaId').value      = '';
  document.getElementById('anggotaNama').value    = '';
  document.getElementById('anggotaNIM').value     = '';
  document.getElementById('anggotaDivisi').value  = '';
  document.getElementById('anggotaWA').value      = '';
  document.getElementById('errAnggotaNama').classList.add('hidden');
  document.getElementById('errAnggotaWA').classList.add('hidden');
}

// Edit anggota — isi form dengan data yang ada
function editAnggota(id) {
  const anggota = ambil(STORAGE_KEYS.anggota);
  const a = anggota.find(x => x.id === id);
  if (!a) return;

  document.getElementById('anggotaId').value     = a.id;
  document.getElementById('anggotaNama').value   = a.nama;
  document.getElementById('anggotaNIM').value    = a.nim || '';
  document.getElementById('anggotaDivisi').value = a.divisi || '';
  document.getElementById('anggotaWA').value     = a.wa || '';
  document.getElementById('formAnggotaTitle').textContent = 'Edit Anggota';
  document.getElementById('formAnggotaWrapper').classList.remove('hidden');
  document.getElementById('anggotaNama').focus();
  document.getElementById('formAnggotaWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hapus anggota
function hapusAnggota(id) {
  const anggota = ambil(STORAGE_KEYS.anggota);
  const a = anggota.find(x => x.id === id);
  if (!a) return;
  tampilkanModal(`Hapus anggota "${a.nama}"? Data iuran terkait juga akan dihapus.`, () => {
    // Hapus dari daftar
    const baru = anggota.filter(x => x.id !== id);
    simpan(STORAGE_KEYS.anggota, baru);
    // Hapus status iuran terkait anggota ini
    const iuranMap = ambil(STORAGE_KEYS.iuran, {});
    Object.keys(iuranMap).forEach(k => { if (k.endsWith(`_${id}`)) delete iuranMap[k]; });
    simpan(STORAGE_KEYS.iuran, iuranMap);
    renderAnggota();
    renderDashboard();
    tampilkanToast('Anggota berhasil dihapus.');
  });
}

// Submit form anggota
document.getElementById('formAnggota').addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const id      = document.getElementById('anggotaId').value.trim();
  const nama    = document.getElementById('anggotaNama').value.trim();
  const nim     = document.getElementById('anggotaNIM').value.trim();
  const divisi  = document.getElementById('anggotaDivisi').value.trim();
  const wa      = document.getElementById('anggotaWA').value.trim();

  // Validasi nama
  const errNama = document.getElementById('errAnggotaNama');
  if (!nama) { errNama.classList.remove('hidden'); valid = false; }
  else        errNama.classList.add('hidden');

  // Validasi WA (boleh kosong, tapi kalau diisi harus diawali 08 atau 62)
  const errWA = document.getElementById('errAnggotaWA');
  if (wa && !/^(08|62)/.test(wa)) { errWA.classList.remove('hidden'); valid = false; }
  else                              errWA.classList.add('hidden');

  if (!valid) return;

  const anggota = ambil(STORAGE_KEYS.anggota);

  if (id) {
    // Mode edit
    const idx = anggota.findIndex(x => x.id === id);
    if (idx !== -1) anggota[idx] = { ...anggota[idx], nama, nim, divisi, wa };
    tampilkanToast('Data anggota diperbarui.');
  } else {
    // Mode tambah
    anggota.push({ id: buatId(), nama, nim, divisi, wa });
    tampilkanToast('Anggota baru berhasil ditambahkan.');
  }

  simpan(STORAGE_KEYS.anggota, anggota);
  document.getElementById('formAnggotaWrapper').classList.add('hidden');
  resetFormAnggota();
  renderAnggota();
  renderDashboard();
});

// =====================================================
// IURAN BULANAN
// =====================================================
function renderIuran() {
  const anggota   = ambil(STORAGE_KEYS.anggota);
  const iuranMap  = ambil(STORAGE_KEYS.iuran, {});
  const bulan     = document.getElementById('iuranBulan').value;
  const nominal   = Number(ambil(STORAGE_KEYS.nominal, NOMINAL_DEFAULT));
  const tbody     = document.getElementById('tabelIuran');
  const listMobil = document.getElementById('listIuranMobil');
  const kosong    = document.getElementById('iuranKosong');

  document.getElementById('iuranNominal').value = nominal;
  document.getElementById('iuranJudulBulan').textContent =
    bulan ? `Daftar Iuran — ${namaBulan(bulan)}` : 'Daftar Iuran';

  if (anggota.length === 0) {
    tbody.innerHTML     = '';
    listMobil.innerHTML = '';
    kosong.classList.remove('hidden');
    return;
  }
  kosong.classList.add('hidden');

  // Helper: fragmen toggle + badge yang dipakai di kedua layout
  const toggleHtml = (a, lunas) => bulan ? `
    <label class="toggle-wrapper" title="${lunas ? 'Tandai Belum' : 'Tandai Lunas'}">
      <input type="checkbox" class="toggle-input"
        ${lunas ? 'checked' : ''}
        onchange="toggleIuran('${a.id}', '${bulan}', this.checked)" />
    </label>
    <span class="badge ${lunas ? 'badge-lunas' : 'badge-belum'} mt-1 inline-block">
      ${lunas ? 'Lunas' : 'Belum'}
    </span>
  ` : '<span class="text-slate-400 text-xs">Pilih bulan</span>';

  const waLinkHtml = (waNum, a) => waNum && !iuranMap[`${bulan}_${a.id}`] && bulan ? `
    <a href="https://wa.me/${waNum}?text=${encodeURIComponent(pesanWAAnggota(a, bulan))}"
       target="_blank" rel="noopener"
       class="text-emerald-600 hover:text-emerald-800 text-xs font-semibold underline">
      Kirim WA
    </a>
  ` : '<span class="text-slate-300 text-xs">—</span>';

  // ── Tabel desktop (sm ke atas) ──
  tbody.innerHTML = anggota.map(a => {
    const lunas = iuranMap[`${bulan}_${a.id}`] === true;
    const waNum = a.wa ? a.wa.replace(/^0/, '62') : '';
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-2 pr-3">
          <p class="font-medium text-slate-800">${escHtml(a.nama)}</p>
        </td>
        <td class="py-2 pr-3 text-slate-500 text-xs">
          ${escHtml(a.nim || '-')} / ${escHtml(a.divisi || '-')}
        </td>
        <td class="py-2 pr-3 text-center">${toggleHtml(a, lunas)}</td>
        <td class="py-2 text-center">${waLinkHtml(waNum, a)}</td>
      </tr>
    `;
  }).join('');

  // ── Daftar card mobile (di bawah sm) ──
  listMobil.innerHTML = anggota.map(a => {
    const lunas = iuranMap[`${bulan}_${a.id}`] === true;
    const waNum = a.wa ? a.wa.replace(/^0/, '62') : '';
    return `
      <div class="data-card">
        <div class="data-card-body">
          <p class="data-card-title">${escHtml(a.nama)}</p>
          <p class="data-card-meta">${escHtml(a.nim || '-')} · ${escHtml(a.divisi || '-')}</p>
        </div>
        <div class="data-card-actions items-center gap-3">
          ${toggleHtml(a, lunas)}
          ${waLinkHtml(waNum, a)}
        </div>
      </div>
    `;
  }).join('');
}

// Toggle status lunas iuran
function toggleIuran(anggotaId, bulan, lunas) {
  if (!bulan) return;
  const iuranMap  = ambil(STORAGE_KEYS.iuran, {});
  const transaksi = ambil(STORAGE_KEYS.transaksi);
  const anggota   = ambil(STORAGE_KEYS.anggota);
  const nominal   = Number(ambil(STORAGE_KEYS.nominal, NOMINAL_DEFAULT));
  const a         = anggota.find(x => x.id === anggotaId);
  const key       = `${bulan}_${anggotaId}`;

  if (lunas) {
    // Tandai lunas → buat transaksi pemasukan iuran
    iuranMap[key] = true;
    const trxBaru = {
      id         : `iuran_${key}`,   // ID deterministik agar mudah ditemukan/dihapus
      tanggal    : bulan + '-01',     // Tanggal hari pertama bulan iuran
      jenis      : 'Pemasukan',
      kategori   : 'Iuran',
      nominal    : nominal,
      keterangan : `Iuran ${a ? a.nama : ''} — ${namaBulan(bulan)}`,
    };
    // Pastikan tidak duplikat
    const sudahAda = transaksi.findIndex(t => t.id === trxBaru.id);
    if (sudahAda === -1) transaksi.push(trxBaru);
    else transaksi[sudahAda] = trxBaru;
    tampilkanToast(`${a ? a.nama : ''} ditandai Lunas.`);
  } else {
    // Batalkan lunas → hapus transaksi iuran terkait
    delete iuranMap[key];
    const idTrx = `iuran_${key}`;
    const idx   = transaksi.findIndex(t => t.id === idTrx);
    if (idx !== -1) transaksi.splice(idx, 1);
    tampilkanToast(`Status iuran ${a ? a.nama : ''} dibatalkan.`);
  }

  simpan(STORAGE_KEYS.iuran,    iuranMap);
  simpan(STORAGE_KEYS.transaksi, transaksi);
  renderIuran();
  renderDashboard();
}

// Pesan WA individual
function pesanWAAnggota(a, bulan) {
  return `Halo ${a.nama}, ini pengingat bahwa iuran bulan ${namaBulan(bulan)} belum dibayar. Mohon segera melunasi. Terima kasih 🙏`;
}

// Simpan nominal iuran
document.getElementById('btnSimpanNominalIuran').addEventListener('click', () => {
  const val = Number(document.getElementById('iuranNominal').value);
  if (!val || val < 1) { tampilkanToast('Nominal iuran tidak valid.'); return; }
  simpan(STORAGE_KEYS.nominal, val);
  tampilkanToast('Nominal iuran disimpan.');
});

// Salin pesan pengingat
document.getElementById('btnSalinPengingat').addEventListener('click', () => {
  const bulan    = document.getElementById('iuranBulan').value;
  const anggota  = ambil(STORAGE_KEYS.anggota);
  const iuranMap = ambil(STORAGE_KEYS.iuran, {});

  if (!bulan) { tampilkanToast('Pilih bulan terlebih dahulu.'); return; }

  const belum = anggota.filter(a => !iuranMap[`${bulan}_${a.id}`]);
  if (belum.length === 0) { tampilkanToast('Semua anggota sudah lunas! 🎉'); return; }

  const daftar = belum.map((a, i) => `${i + 1}. ${a.nama}`).join('\n');
  const pesan  = `📢 *Pengingat Iuran ${namaBulan(bulan)}*\n\nAnggota yang belum membayar iuran:\n${daftar}\n\nMohon segera melunasi. Terima kasih 🙏`;

  navigator.clipboard.writeText(pesan).then(() => {
    const fb = document.getElementById('salinFeedback');
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 2500);
    tampilkanToast('Pesan pengingat disalin!');
  }).catch(() => {
    // Fallback untuk browser yang tidak mendukung clipboard API
    const ta = document.createElement('textarea');
    ta.value = pesan;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    tampilkanToast('Pesan pengingat disalin!');
  });
});

// Inisialisasi bulan iuran ke bulan ini saat pertama dimuat
function initBulanIuran() {
  const now = new Date();
  const val = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('iuranBulan').value = val;
}

document.getElementById('iuranBulan').addEventListener('change', renderIuran);

// =====================================================
// TRANSAKSI — CRUD + FILTER + EXPORT
// =====================================================
function getFilteredTransaksi() {
  const semua      = ambil(STORAGE_KEYS.transaksi);
  const jenis      = document.getElementById('filterJenis').value;
  const bulan      = document.getElementById('filterBulan').value;
  const cari       = document.getElementById('filterCari').value.toLowerCase().trim();

  return semua.filter(t => {
    const cocokJenis = !jenis  || t.jenis === jenis;
    const cocokBulan = !bulan  || (t.tanggal && t.tanggal.startsWith(bulan));
    const cocokCari  = !cari   || (t.keterangan && t.keterangan.toLowerCase().includes(cari));
    return cocokJenis && cocokBulan && cocokCari;
  }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

function renderTransaksi() {
  const list      = getFilteredTransaksi();
  const tbody     = document.getElementById('tabelTransaksi');
  const listMobil = document.getElementById('listTransaksiMobil');
  const kosong    = document.getElementById('transaksiKosong');

  // Pesan empty state: bedakan antara data benar-benar kosong vs tidak cocok filter
  const adaFilter = document.getElementById('filterJenis').value ||
                    document.getElementById('filterBulan').value ||
                    document.getElementById('filterCari').value.trim();

  if (list.length === 0) {
    tbody.innerHTML     = '';
    listMobil.innerHTML = '';
    kosong.classList.remove('hidden');
    // Ganti teks empty state sesuai konteks filter
    const emptyMsg = kosong.querySelector('.empty-state-msg');
    if (emptyMsg) {
      emptyMsg.textContent = adaFilter
        ? 'Tidak ada transaksi yang cocok dengan filter.'
        : 'Belum ada transaksi. Klik "+ Tambah".';
    }
    return;
  }
  kosong.classList.add('hidden');

  // ── Tabel desktop (sm ke atas) ──
  tbody.innerHTML = list.map(t => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-2 pr-3 text-slate-700 text-sm">${formatTanggal(t.tanggal)}</td>
      <td class="py-2 pr-3">
        <span class="badge ${t.jenis === 'Pemasukan' ? 'badge-pemasukan' : 'badge-pengeluaran'}">
          ${escHtml(t.jenis)}
        </span>
      </td>
      <td class="py-2 pr-3 text-slate-600 text-sm">${escHtml(t.kategori)}</td>
      <td class="py-2 pr-3 text-right font-semibold text-sm ${t.jenis === 'Pemasukan' ? 'text-blue-700' : 'text-red-600'}">
        ${formatRupiah(t.nominal)}
      </td>
      <td class="py-2 pr-3 text-slate-600 text-sm max-w-[180px] truncate">
        ${escHtml(t.keterangan || '-')}
      </td>
      <td class="py-2 text-right">
        <div class="flex gap-1 justify-end">
          ${!t.id.startsWith('iuran_') ? `<button class="btn-edit" onclick="editTransaksi('${t.id}')">Edit</button>` : ''}
          <button class="btn-hapus" onclick="hapusTransaksi('${t.id}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // ── Daftar card mobile (di bawah sm) ──
  listMobil.innerHTML = list.map(t => `
    <div class="data-card">
      <div class="data-card-body">
        <div class="flex items-center gap-2 mb-1">
          <span class="badge ${t.jenis === 'Pemasukan' ? 'badge-pemasukan' : 'badge-pengeluaran'}">${escHtml(t.jenis)}</span>
          <span class="text-xs text-slate-400">${escHtml(t.kategori)}</span>
        </div>
        <p class="data-card-title ${t.jenis === 'Pemasukan' ? 'text-blue-700' : 'text-red-600'}">
          ${t.jenis === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.nominal)}
        </p>
        <p class="data-card-meta">${escHtml(t.keterangan || '-')}</p>
        <p class="data-card-meta">${formatTanggal(t.tanggal)}</p>
      </div>
      <div class="data-card-actions">
        ${!t.id.startsWith('iuran_') ? `<button class="btn-edit" onclick="editTransaksi('${t.id}')">Edit</button>` : ''}
        <button class="btn-hapus" onclick="hapusTransaksi('${t.id}')">Hapus</button>
      </div>
    </div>
  `).join('');
}

// Tambah transaksi
document.getElementById('btnTambahTransaksi').addEventListener('click', () => {
  resetFormTransaksi();
  document.getElementById('formTransaksiTitle').textContent = 'Tambah Transaksi';
  document.getElementById('formTransaksiWrapper').classList.remove('hidden');
  document.getElementById('transaksiTanggal').focus();
});

document.getElementById('btnBatalTransaksi').addEventListener('click', () => {
  document.getElementById('formTransaksiWrapper').classList.add('hidden');
  resetFormTransaksi();
});

function resetFormTransaksi() {
  document.getElementById('transaksiId').value          = '';
  document.getElementById('transaksiTanggal').value     = new Date().toISOString().slice(0, 10);
  document.getElementById('transaksiJenis').value       = 'Pemasukan';
  document.getElementById('transaksiKategori').value    = 'Iuran';
  document.getElementById('transaksiNominal').value     = '';
  document.getElementById('transaksiKeterangan').value  = '';
  document.getElementById('errTransaksiNominal').classList.add('hidden');
}

function editTransaksi(id) {
  const transaksi = ambil(STORAGE_KEYS.transaksi);
  const t = transaksi.find(x => x.id === id);
  if (!t) return;

  document.getElementById('transaksiId').value         = t.id;
  document.getElementById('transaksiTanggal').value    = t.tanggal;
  document.getElementById('transaksiJenis').value      = t.jenis;
  document.getElementById('transaksiKategori').value   = t.kategori;
  document.getElementById('transaksiNominal').value    = t.nominal;
  document.getElementById('transaksiKeterangan').value = t.keterangan || '';
  document.getElementById('formTransaksiTitle').textContent = 'Edit Transaksi';
  document.getElementById('formTransaksiWrapper').classList.remove('hidden');
  document.getElementById('formTransaksiWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hapusTransaksi(id) {
  const transaksi = ambil(STORAGE_KEYS.transaksi);
  const t = transaksi.find(x => x.id === id);
  if (!t) return;

  tampilkanModal(`Hapus transaksi "${t.keterangan || t.kategori}" ${formatRupiah(t.nominal)}?`, () => {
    const baru = transaksi.filter(x => x.id !== id);
    simpan(STORAGE_KEYS.transaksi, baru);

    // Jika transaksi iuran, reset status lunas terkait
    if (id.startsWith('iuran_')) {
      const iuranMap = ambil(STORAGE_KEYS.iuran, {});
      const mapKey   = id.replace(/^iuran_/, '');
      delete iuranMap[mapKey];
      simpan(STORAGE_KEYS.iuran, iuranMap);
    }

    renderTransaksi();
    renderDashboard();
    tampilkanToast('Transaksi berhasil dihapus.');
  });
}

document.getElementById('formTransaksi').addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const id          = document.getElementById('transaksiId').value.trim();
  const tanggal     = document.getElementById('transaksiTanggal').value;
  const jenis       = document.getElementById('transaksiJenis').value;
  const kategori    = document.getElementById('transaksiKategori').value;
  const nominal     = Number(document.getElementById('transaksiNominal').value);
  const keterangan  = document.getElementById('transaksiKeterangan').value.trim();

  // Validasi nominal
  const errNominal = document.getElementById('errTransaksiNominal');
  if (!nominal || nominal <= 0) { errNominal.classList.remove('hidden'); valid = false; }
  else                           errNominal.classList.add('hidden');

  if (!valid) return;

  const transaksi = ambil(STORAGE_KEYS.transaksi);

  if (id) {
    const idx = transaksi.findIndex(x => x.id === id);
    if (idx !== -1) transaksi[idx] = { ...transaksi[idx], tanggal, jenis, kategori, nominal, keterangan };
    tampilkanToast('Transaksi diperbarui.');
  } else {
    transaksi.push({ id: buatId(), tanggal, jenis, kategori, nominal, keterangan });
    tampilkanToast('Transaksi berhasil ditambahkan.');
  }

  simpan(STORAGE_KEYS.transaksi, transaksi);
  document.getElementById('formTransaksiWrapper').classList.add('hidden');
  resetFormTransaksi();
  renderTransaksi();
  renderDashboard();
});

// Filter event listeners
['filterJenis', 'filterBulan', 'filterCari'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderTransaksi);
  document.getElementById(id).addEventListener('change', renderTransaksi);
});

document.getElementById('btnResetFilter').addEventListener('click', () => {
  document.getElementById('filterJenis').value = '';
  document.getElementById('filterBulan').value = '';
  document.getElementById('filterCari').value  = '';
  renderTransaksi();
});

// =====================================================
// EXPORT CSV
// =====================================================
document.getElementById('btnExportCSV').addEventListener('click', () => {
  const list = getFilteredTransaksi();
  if (list.length === 0) { tampilkanToast('Tidak ada data untuk diekspor.'); return; }

  const header = ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Keterangan'];
  const baris  = list.map(t => [
    t.tanggal,
    t.jenis,
    t.kategori,
    t.nominal,
    `"${(t.keterangan || '').replace(/"/g, '""')}"`,
  ]);

  const csv     = [header, ...baris].map(r => r.join(',')).join('\n');
  const blob    = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM untuk Excel
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement('a');
  const now     = new Date().toISOString().slice(0, 10);
  link.href     = url;
  link.download = `kasku_transaksi_${now}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  tampilkanToast('Transaksi diekspor ke CSV.');
});

// =====================================================
// RESET DATA
// =====================================================
document.getElementById('btnResetData').addEventListener('click', () => {
  tampilkanModal('Reset semua data? Seluruh anggota, transaksi, dan iuran akan dihapus dan diganti dengan data contoh.', () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    muatDataContoh();
    initBulanIuran();
    renderDashboard();
    renderAnggota();
    renderIuran();
    renderTransaksi();
    tampilkanToast('Data direset ke data contoh.');
  });
});

// =====================================================
// UTILITY — Escape HTML (cegah XSS)
// =====================================================
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =====================================================
// INISIALISASI APLIKASI
// =====================================================
function init() {
  // Muat data contoh hanya jika belum pernah dibuka
  if (!ambil(STORAGE_KEYS.inited, false)) {
    muatDataContoh();
  }

  // Set default tanggal form transaksi ke hari ini
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('transaksiTanggal').value = today;

  initBulanIuran();
  initTab();
  renderDashboard();
  renderAnggota();
  renderIuran();
  renderTransaksi();
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', init);
