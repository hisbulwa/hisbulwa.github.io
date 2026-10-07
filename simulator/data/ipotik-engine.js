/**
 * IPotik Scoring Engine
 * =====================
 * Mesin penghitung Indeks Pojok Statistik (IPotik) 2026.
 * Mereplikasi seluruh logika rumus pada file Excel
 * Penilaian_Monev_Pojok_Statistik_2026.xlsx
 *
 * Dipakai oleh website simulator — import file ini
 * lalu panggil fungsi-fungsi yang tersedia.
 */

// ──────────────────────────────────────────────
// 1. LOOKUP TABLE — Lampiran 3 (Skor Kesesuaian)
// ──────────────────────────────────────────────
//
// Baris  = target periode RPK (urut sesuai Excel)
// Kolom  = pita realisasi: [0%, 1–25%, 26–49%, ≥50%]
//
const LAMPIRAN3 = {
  "Tentatif":    [1,   1,   1,   1  ],
  "Semesteran":  [1,   1.2, 1.4, 1.5],
  "Triwulanan":  [1,   1.7, 1.9, 2  ],
  "Bulanan":     [1,   2.2, 2.4, 2.5],
  "Mingguan":    [1,   2.7, 2.9, 3  ],
  "Harian":      [1,   3.3, 3.6, 4  ],
};

// ──────────────────────────────────────────────
// 2. HELPER — tentukan kolom pita realisasi
// ──────────────────────────────────────────────

/**
 * Mengembalikan index kolom (0–3) pada tabel Lampiran 3
 * berdasarkan persentase realisasi.
 *
 * @param {number} persen — 0 sampai 100
 * @returns {number} 0 | 1 | 2 | 3
 */
function pitaRealisasiIndex(persen) {
  if (persen === 0)           return 0; // 0%
  if (persen <= 25)           return 1; // 1–25%
  if (persen < 50)            return 2; // 26–49%
  /* persen >= 50 */          return 3; // ≥50%
}

// ──────────────────────────────────────────────
// 3. HITUNG SKOR BUTIR (kolom I pada Excel)
// ──────────────────────────────────────────────

/**
 * Menghitung skor mentah satu butir berdasarkan tipe input-nya.
 *
 * @param {Object} butir   — definisi butir dari ipotik-config.json
 * @param {*}      input   — nilai yang diisi pengguna (kolom G)
 * @param {string} [targetPeriode] — khusus tipe lampiran3 (kolom H)
 * @returns {number|null}  — skor (1–4), atau null jika belum diisi
 */
function hitungSkorButir(butir, input, targetPeriode) {
  // Belum diisi → null (dihitung 0 pada kontribusi)
  if (input === null || input === undefined || input === "") return null;

  switch (butir.tipeInput) {
    // ── Checklist: skor = jumlah item, minimal 1 ──
    case "checklist":
      return Math.max(1, Number(input));

    // ── Pilihan tunggal / frekuensi: langsung pakai ──
    case "pilihan":
    case "frekuensi":
      return Number(input);

    // ── Lampiran 3: lookup otomatis ──
    case "lampiran3": {
      if (!targetPeriode) return null;
      const persen = Number(input);
      const kolom  = pitaRealisasiIndex(persen);
      const baris  = LAMPIRAN3[targetPeriode];
      if (!baris) return null;
      return baris[kolom];
    }

    // ── Jumlah + 1: skor = MIN(4, jumlah + 1) ──
    case "jumlah_plus1":
      return Math.min(4, Number(input) + 1);

    default:
      return Number(input);
  }
}

// ──────────────────────────────────────────────
// 4. NORMALISASI (kolom L pada Excel)
// ──────────────────────────────────────────────

/**
 * Normalisasi skor ke rentang 0–1.
 * Rumus: (skor − min) ÷ (maks − min)
 *
 * @param {number} skor
 * @param {number} min  — selalu 1 pada instrumen ini
 * @param {number} maks — selalu 4 pada instrumen ini
 * @returns {number} 0 ≤ hasil ≤ 1
 */
function normalisasi(skor, min = 1, maks = 4) {
  if (maks === min) return 0;
  return (skor - min) / (maks - min);
}

// ──────────────────────────────────────────────
// 5. BOBOT BUTIR (kolom N pada Excel)
// ──────────────────────────────────────────────

/**
 * Menghitung bobot butir berdasarkan metode yang dipilih.
 *
 * @param {Object} butir    — definisi butir
 * @param {Object} aspek    — definisi aspek yang memuat butir ini
 * @param {number} metode   — 1 = rumus resmi, 2 = bobot tercetak
 * @returns {number}
 */
function bobotButir(butir, aspek, metode) {
  if (metode === 2) {
    return butir.bobotTercetak;
  }
  // Metode 1 (default): bobot aspek ÷ jumlah butir dalam aspek
  return aspek.bobot / aspek.jumlahButir;
}

// ──────────────────────────────────────────────
// 6. KONTRIBUSI BUTIR (kolom O pada Excel)
// ──────────────────────────────────────────────

/**
 * Kontribusi satu butir ke IPotik.
 * Rumus: skorTernormalisasi × bobot × 4
 * Jika butir belum diisi → kontribusi = 0.
 *
 * @param {number|null} skor
 * @param {number}      bobot
 * @param {number}      min
 * @param {number}      maks
 * @returns {number}
 */
function kontribusiButir(skor, bobot, min = 1, maks = 4) {
  if (skor === null || skor === undefined) return 0;
  const norm = normalisasi(skor, min, maks);
  return norm * bobot * 4;
}

// ──────────────────────────────────────────────
// 7. KATEGORI ZONA
// ──────────────────────────────────────────────

const ZONA = [
  { zona: "hijau",  label: "Zona Hijau",  keterangan: "Kinerja Tinggi", batasBawah: 2.67, batasAtas: 4.00, warna: "#22c55e" },
  { zona: "kuning", label: "Zona Kuning", keterangan: "Kinerja Sedang", batasBawah: 1.34, batasAtas: 2.66, warna: "#eab308" },
  { zona: "merah",  label: "Zona Merah",  keterangan: "Kinerja Rendah", batasBawah: 0.00, batasAtas: 1.33, warna: "#ef4444" },
];

/**
 * Menentukan kategori zona berdasarkan nilai IPotik.
 * IPotik dibulatkan ke 2 desimal sebelum dicocokkan.
 *
 * @param {number} ipotik
 * @returns {Object} { zona, label, keterangan, warna }
 */
function tentukanZona(ipotik) {
  const rounded = Math.round(ipotik * 100) / 100;
  if (rounded >= 2.67) return ZONA[0]; // Hijau (2.67 – 4.00)
  if (rounded >= 1.34) return ZONA[1]; // Kuning (1.34 – 2.66)
  return ZONA[2];                      // Merah (0.00 – 1.33)
}

// ──────────────────────────────────────────────
// 8. HITUNG IPOTIK LENGKAP (master function)
// ──────────────────────────────────────────────

/**
 * Menghitung IPotik lengkap dari seluruh jawaban pengguna.
 *
 * @param {Object}   config     — isi ipotik-config.json
 * @param {Object}   jawaban    — { [noButir]: { input, targetPeriode? } }
 *                                Contoh: { "1": { input: 3 }, "19B": { input: 80, targetPeriode: "Bulanan" } }
 * @param {number}   [metode=1] — 1 = rumus resmi, 2 = bobot tercetak
 * @returns {Object} hasil perhitungan lengkap
 */
function hitungIPotik(config, jawaban, metode = 1) {
  const aspekMap = {};
  for (const a of config.aspek) {
    aspekMap[a.id] = a;
  }

  let totalIPotik = 0;
  let butirTerisi = 0;

  // Detail per butir
  const detailButir = config.butir.map((b) => {
    const j       = jawaban[b.no] || {};
    const input   = j.input ?? null;
    const target  = j.targetPeriode ?? null;
    const aspek   = aspekMap[b.aspekId];
    const skor    = hitungSkorButir(b, input, target);
    const bobot   = bobotButir(b, aspek, metode);
    const kontrib = kontribusiButir(skor, bobot, b.skorRange.min, b.skorRange.max);

    if (skor !== null) butirTerisi++;
    totalIPotik += kontrib;

    return {
      no: b.no,
      aspekId: b.aspekId,
      pertanyaan: b.pertanyaan,
      tipeInput: b.tipeInput,
      input,
      targetPeriode: target,
      skor,
      skorTernormalisasi: skor !== null ? normalisasi(skor, b.skorRange.min, b.skorRange.max) : null,
      bobot,
      kontribusi: kontrib,
    };
  });

  // Rekap per aspek (sesuai rumus Excel: SUMIF(norm) / jumlahButirAspek)
  const rekapAspek = config.aspek.map((a) => {
    const butirDalamAspek = detailButir.filter((d) => d.aspekId === a.id);
    const kontribTotal    = butirDalamAspek.reduce((sum, d) => sum + d.kontribusi, 0);
    const terisi          = butirDalamAspek.filter((d) => d.skor !== null).length;
    const normValues      = butirDalamAspek
      .filter((d) => d.skorTernormalisasi !== null)
      .map((d) => d.skorTernormalisasi);
    const sumNorm         = normValues.reduce((acc, v) => acc + v, 0);
    // Sesuai rumus resmi hal. 13 & Excel sel N11–N20: rata-rata ternormalisasi terhadap total butir aspek
    const skorAspek       = a.jumlahButir > 0 ? sumNorm / a.jumlahButir : 0;
    // Rata-rata hanya dari butir yang sudah terisi (informasi tambahan untuk UI)
    const skorAspekTerisi = terisi > 0 ? sumNorm / terisi : 0;

    return {
      id: a.id,
      nama: a.nama,
      dimensiId: a.dimensiId,
      bobot: a.bobot,
      jumlahButir: a.jumlahButir,
      butirTerisi: terisi,
      skorAspek: Math.round(skorAspek * 10000) / 10000,
      skorAspekTerisi: Math.round(skorAspekTerisi * 10000) / 10000,
      kontribusi: Math.round(kontribTotal * 10000) / 10000,
    };
  });

  // Rekap per dimensi
  const rekapDimensi = config.dimensi.map((d) => {
    const aspekDalamDimensi = rekapAspek.filter((a) => a.dimensiId === d.id);
    const kontrib = aspekDalamDimensi.reduce((sum, a) => sum + a.kontribusi, 0);
    const kontribMaks = d.bobot * 4;
    const persen  = kontribMaks > 0 ? (kontrib / kontribMaks) * 100 : 0;

    return {
      id: d.id,
      nama: d.nama,
      bobot: d.bobot,
      kontribusi: Math.round(kontrib * 10000) / 10000,
      kontribusiMaksimal: kontribMaks,
      persenCapaian: Math.round(persen * 100) / 100,
    };
  });

  const ipotikRounded = Math.round(totalIPotik * 100) / 100;
  const zona = tentukanZona(totalIPotik);

  return {
    ipotik: ipotikRounded,
    zona,
    butirTerisi,
    totalButir: config.butir.length,
    metode,
    detailButir,
    rekapAspek,
    rekapDimensi,
  };
}

// ──────────────────────────────────────────────
// EXPORTS
// ──────────────────────────────────────────────
export {
  LAMPIRAN3,
  ZONA,
  pitaRealisasiIndex,
  hitungSkorButir,
  normalisasi,
  bobotButir,
  kontribusiButir,
  tentukanZona,
  hitungIPotik,
};
