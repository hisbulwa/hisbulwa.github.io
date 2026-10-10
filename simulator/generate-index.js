import fs from 'node:fs';

const configJson = fs.readFileSync('./data/ipotik-config.json', 'utf8');
const engineJs = fs.readFileSync('./data/ipotik-engine.js', 'utf8');

// Strip export statements for inline script fallback
const engineInline = engineJs
  .replace(/export\s*\{[\s\S]*?\};?/, '')
  .trim();

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulator Penilaian Indeks Pojok Statistik (IPotik) 2026</title>
  <meta name="description" content="Simulator Penilaian Indeks Pojok Statistik (IPotik) 2026 berdasarkan Panduan Monitoring dan Evaluasi BPS RI.">
  <script>
    try {
      const savedTheme = localStorage.getItem('ipotik_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        document.documentElement.dataset.theme = savedTheme;
      }
    } catch (error) {
      console.warn('Preferensi tema tidak dapat dibaca.', error);
    }
  </script>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>

  <!-- LOGIN SCREEN -->
  <div id="login-view">
    <div class="login-card">
      <button type="button" class="btn theme-toggle login-theme-toggle" data-theme-toggle aria-label="Ganti ke tema gelap">
        <span data-theme-label>Terang</span>
      </button>
      <div class="login-header">
        <h1>Pojok Statistik</h1>
        <p>Masuk ke Simulator Penilaian IPotik 2026</p>
      </div>
      <div id="login-error" class="login-error"></div>
      <form id="login-form">
        <div class="login-field">
          <label for="login-username">Username</label>
          <input type="text" id="login-username" placeholder="Masukkan username" required autocomplete="username">
        </div>
        <div class="login-field">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="Masukkan password" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; justify-content: center; font-size: 0.92rem;">
          Masuk
        </button>
      </form>
      <div class="login-hint">
        Akun default evaluasi: <strong>admin</strong> / <strong>admin</strong>
      </div>
    </div>
  </div>

  <!-- APPLICATION VIEW (Protected) -->
  <div id="app-view" style="display: none;">
    <!-- PRINT ONLY HEADER -->
    <div class="print-header container">
      <h1>Laporan Simulasi Penilaian Indeks Pojok Statistik (IPotik) 2026</h1>
      <p>Badan Pusat Statistik RI &mdash; Tanggal Simulasi: <span id="print-date"></span></p>
      <div id="print-score-summary" style="margin-top:10px; font-weight:bold; font-size:1.1rem;"></div>
    </div>

    <!-- HERO HEADER -->
    <header class="hero">
      <div class="container hero-content">
        <h1>Form Simulasi Indeks Pojok Statistik</h1>
        <details class="hero-user-box" open>
          <summary class="btn hero-menu-toggle" aria-label="Buka menu pengguna">
            <span class="user-icon" aria-hidden="true"></span>
          </summary>
          <div class="hero-user-menu">
            <button type="button" class="btn theme-toggle" data-theme-toggle aria-label="Ganti ke tema gelap">
              <span data-theme-label>Terang</span>
            </button>
            <span class="user-pill"><span id="user-display">admin</span></span>
            <button class="btn btn-danger" id="btn-logout" title="Keluar dari sesi" style="font-size:0.75rem; padding:4px 10px;">
              Keluar
            </button>
          </div>
        </details>
      </div>
    </header>

    <!-- STICKY SCOREBOARD -->
    <section class="sticky-score-bar">
      <div class="container score-bar-grid">
        <div class="score-main" role="status" aria-live="polite" aria-atomic="true">
          <div class="score-value-box">
            <span class="score-label">Indeks Potik</span>
            <div>
              <span class="score-number" id="grand-score">0.00</span>
              <span class="score-scale">/ 4.00</span>
            </div>
          </div>
          <div class="zona-pill zona-merah" id="zona-badge">
            <span class="zona-dot" aria-hidden="true"></span>
            <span id="zona-text">Zona Merah (Kinerja Rendah)</span>
          </div>
        </div>

        <div class="score-progress-wrap">
          <div class="progress-meta">
            <span id="progress-label">Progres Pengisian</span>
            <span id="progress-text">0 / 33 Butir (0%)</span>
          </div>
          <div class="progress-track" id="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="progress-label">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
        </div>

        <div class="score-actions-wrap">
          <button type="button" class="btn score-more-btn" id="score-more-toggle" aria-label="Buka menu tindakan" aria-expanded="false" aria-controls="score-actions">
            <span class="menu-icon" aria-hidden="true"></span>
          </button>
          <div class="score-actions" id="score-actions">
            <select class="method-selector" id="method-select" title="Pilih Metode Pembobotan">
              <option value="1">Metode 1: Panduan Monev 2026 (hal.13)</option>
              <option value="2">Metode 2: Panduan Monev 2026 (Bobot tertulis)</option>
              <option value="3">Metode 3: Aplikasi PSV (default)</option>
            </select>
            <button type="button" class="btn btn-primary" id="btn-recommendations">
              Saran Perbaikan
            </button>
            <button class="btn btn-primary" id="btn-max" title="Isi semua butir dengan skor tertinggi">
              Skor Maksimal
            </button>
            <button class="btn btn-danger" id="btn-reset" title="Kosongkan seluruh isian">
              Reset
            </button>
            <button class="btn" id="btn-print" title="Cetak atau simpan sebagai dokumen PDF">
              Cetak / PDF
            </button>
            <a class="btn" href="https://docs.google.com/spreadsheets/d/1EAocoKIR3pn2W-XOPADIizz_Vm8hrYb8/edit?usp=sharing&amp;ouid=117014170219577938176&amp;rtpof=true&amp;sd=true" target="_blank" rel="noopener noreferrer" title="Buka file simulasi Excel di tab baru">
              Unduh Simulator dalam Format Excel
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT -->
    <main class="container">
      <!-- RINGKASAN DIMENSI -->
      <section class="dimensi-summary-section">
        <h2 class="section-title">Capaian Per Dimensi</h2>
        <div class="dimensi-grid" id="dimensi-summary-grid">
          <!-- Rendered by JS -->
        </div>
      </section>

      <!-- FORMULIR PENILAIAN 33 BUTIR -->
      <section id="form-container">
        <!-- Rendered by JS -->
      </section>
    </main>
  </div>

  <dialog class="recommendations-dialog" id="recommendations-dialog" aria-labelledby="recommendations-title">
    <div class="recommendations-header">
      <div>
        <h2 id="recommendations-title">Saran Perbaikan IPotik</h2>
        <p>Saran diurutkan berdasarkan potensi kenaikan indeks pada butir tersebut.</p>
      </div>
      <button type="button" class="btn" id="recommendations-close" aria-label="Tutup saran">Tutup</button>
    </div>
    <ol class="recommendations-list" id="recommendations-list"></ol>
  </dialog>

  <!-- EMBEDDED FALLBACK DATA & ENGINE (Guarantees zero-setup file:// offline operation) -->
  <script id="ipotik-config-fallback" type="application/json">
${configJson.trim()}
  </script>

  <script>
    // Inlined engine fallback for offline/file:// double-click support
    window.__IPOTIK_FALLBACK_ENGINE__ = (function() {
      ${engineInline}
      return {
        LAMPIRAN3,
        ZONA,
        pitaRealisasiIndex,
        hitungSkorButir,
        normalisasi,
        bobotButir,
        kontribusiButir,
        saranPerbaikan,
        tentukanZona,
        hitungIPotik,
      };
    })();
  </script>

  <!-- APP SCRIPT -->
  <script type="module">
    const userMenu = document.querySelector('.hero-user-box');
    const mobileView = window.matchMedia('(max-width: 768px)');
    const syncUserMenu = () => { userMenu.open = !mobileView.matches; };
    syncUserMenu();
    mobileView.addEventListener('change', syncUserMenu);

    const themeButtons = document.querySelectorAll('[data-theme-toggle]');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let themeIsManual = Boolean(document.documentElement.dataset.theme);
    let activeTheme = document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light');

    function updateThemeButtons() {
      themeButtons.forEach(button => {
        const nextTheme = activeTheme === 'dark' ? 'terang' : 'gelap';
        button.querySelector('[data-theme-label]').textContent = 'Tema ' + nextTheme;
        button.setAttribute('aria-label', 'Ganti ke tema ' + nextTheme);
        button.setAttribute('aria-pressed', String(activeTheme === 'dark'));
      });
    }

    themeButtons.forEach(button => button.addEventListener('click', () => {
      themeIsManual = true;
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = activeTheme;
      try {
        localStorage.setItem('ipotik_theme', activeTheme);
      } catch (error) {
        console.warn('Preferensi tema tidak dapat disimpan.', error);
      }
      updateThemeButtons();
    }));
    systemTheme.addEventListener('change', event => {
      if (!themeIsManual) {
        activeTheme = event.matches ? 'dark' : 'light';
        updateThemeButtons();
      }
    });
    updateThemeButtons();

    // AUTHENTICATION
    const AUTH_KEY = 'ipotik_auth_user';
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginUser = document.getElementById('login-username');
    const loginPass = document.getElementById('login-password');
    const loginErr = document.getElementById('login-error');
    const userDisplay = document.getElementById('user-display');
    const btnLogout = document.getElementById('btn-logout');

    let isAppInitialized = false;

    function checkAuth() {
      const user = sessionStorage.getItem(AUTH_KEY);
      if (user) {
        loginView.style.display = 'none';
        appView.style.display = 'block';
        if (userDisplay) userDisplay.textContent = user;
        if (!isAppInitialized) {
          initApp();
          isAppInitialized = true;
        } else {
          populateFormValues();
          saveAndRecalculate();
        }
      } else {
        loginView.style.display = 'flex';
        appView.style.display = 'none';
      }
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = loginUser.value.trim();
      const p = loginPass.value.trim();
      if (!u || !p) {
        loginErr.textContent = 'Username dan password wajib diisi';
        loginErr.style.display = 'block';
        return;
      }
      sessionStorage.setItem(AUTH_KEY, u);
      loginErr.style.display = 'none';
      loginForm.reset();
      checkAuth();
    });

    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });

    // CONFIG & ENGINE LOADER
    let config;
    let engine;

    try {
      if (window.location.protocol.startsWith('http')) {
        const [engMod, resJson] = await Promise.all([
          import('./data/ipotik-engine.js'),
          fetch('./data/ipotik-config.json').then(r => r.json())
        ]);
        engine = engMod;
        config = resJson;
      }
    } catch (e) {
      console.warn('HTTP dynamic fetch failed, using embedded fallback:', e);
    }

    if (!config) {
      config = JSON.parse(document.getElementById('ipotik-config-fallback').textContent);
    }
    if (!engine) {
      engine = window.__IPOTIK_FALLBACK_ENGINE__;
    }

    // STATE
    const STORAGE_KEY = 'ipotik_simulator_answers_v2026';
    const METHOD_KEY = 'ipotik_simulator_method_v2026';

    let metode = parseInt(localStorage.getItem(METHOD_KEY) || config.meta.metodeDefault.toString(), 10);
    let jawaban = {};

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) jawaban = JSON.parse(saved);
    } catch (e) {
      jawaban = {};
    }

    // DOM ELEMENTS
    const grandScoreEl = document.getElementById('grand-score');
    const zonaBadgeEl = document.getElementById('zona-badge');
    const zonaTextEl = document.getElementById('zona-text');
    const progressTextEl = document.getElementById('progress-text');
    const progressFillEl = document.getElementById('progress-fill');
    const progressBarEl = document.getElementById('progress-bar');
    const methodSelectEl = document.getElementById('method-select');
    const dimensiGridEl = document.getElementById('dimensi-summary-grid');
    const formContainerEl = document.getElementById('form-container');
    const printDateEl = document.getElementById('print-date');
    const printSummaryEl = document.getElementById('print-score-summary');
    const recommendationsDialog = document.getElementById('recommendations-dialog');
    const recommendationsList = document.getElementById('recommendations-list');

    if (printDateEl) {
      printDateEl.textContent = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    methodSelectEl.value = metode;

    function initApp() {
      renderApp();
      populateFormValues();
      saveAndRecalculate();
    }

    // RENDER FORMULIR
    function renderApp() {
      const aspekByDimensi = {};
      config.aspek.forEach(a => {
        if (!aspekByDimensi[a.dimensiId]) aspekByDimensi[a.dimensiId] = [];
        aspekByDimensi[a.dimensiId].push(a);
      });

      const butirByAspek = {};
      config.butir.forEach(b => {
        if (!butirByAspek[b.aspekId]) butirByAspek[b.aspekId] = [];
        butirByAspek[b.aspekId].push(b);
      });

      formContainerEl.innerHTML = '';

      config.dimensi.forEach((dim, dimIdx) => {
        const dimBlock = document.createElement('div');
        dimBlock.className = 'dimensi-block';
        dimBlock.id = 'section-' + dim.id;

        const dimHeader = document.createElement('div');
        dimHeader.className = 'dimensi-header';
        dimHeader.innerHTML = \`
          <h2>Dimensi \${dimIdx + 1}: \${dim.nama}</h2>
          <span class="dimensi-badge">Bobot: \${Math.round(dim.bobot * 100)}% &bull; Kontribusi Maks: \${dim.bobot * 4}</span>
        \`;
        dimBlock.appendChild(dimHeader);

        const aspeks = aspekByDimensi[dim.id] || [];
        aspeks.forEach(asp => {
          const aspBlock = document.createElement('div');
          aspBlock.className = 'aspek-block';

          const aspHdr = document.createElement('div');
          aspHdr.className = 'aspek-header';
          aspHdr.innerHTML = \`
            <div class="aspek-title">\${asp.nama}</div>
            <div class="aspek-meta">
              <span>Bobot: \${(asp.bobot * 100).toFixed(1)}%</span>
              <span>Jumlah: \${asp.jumlahButir} Butir</span>
              <span id="aspek-skor-\${asp.id}">Skor: 0.00</span>
            </div>
          \`;
          aspBlock.appendChild(aspHdr);

          const butirs = butirByAspek[asp.id] || [];
          butirs.forEach(b => {
            const card = renderButirCard(b, asp);
            aspBlock.appendChild(card);
          });

          dimBlock.appendChild(aspBlock);
        });

        formContainerEl.appendChild(dimBlock);
      });
    }

    // RENDER CARD BUTIR
    function renderButirCard(b, asp) {
      const card = document.createElement('div');
      card.className = 'butir-card';
      card.id = 'card-butir-' + b.no;

      const hdr = document.createElement('div');
      hdr.className = 'butir-header';
      hdr.innerHTML = \`
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="butir-number">Butir \${b.no}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">Bobot: \${(b.bobotTercetak * 100).toFixed(1)}%</span>
        </div>
        <div class="butir-score-badge" id="badge-\${b.no}">
          <span>Skor: -</span>
        </div>
      \`;
      card.appendChild(hdr);

      const q = document.createElement('div');
      q.className = 'butir-question';
      q.textContent = b.pertanyaan;
      card.appendChild(q);

      if (b.buktiDukung || b.caraPengisian || b.contohLink) {
        const details = document.createElement('details');
        details.className = 'bukti-box';
        let linkHtml = '';
        if (b.contohLink) {
          const cleanLink = b.contohLink.startsWith('http') ? b.contohLink : 'https://' + b.contohLink;
          linkHtml = \`<div style="margin-top:4px;"><strong>Contoh Bukti:</strong> <a href="\${cleanLink}" target="_blank" rel="noopener">\${b.contohLink}</a></div>\`;
        }
        details.innerHTML = \`
          <summary>Bukti Dukung & Panduan Pengisian</summary>
          <div class="bukti-content">
            \${b.buktiDukung ? \`<div><strong>Bukti Dukung:</strong> \${b.buktiDukung}</div>\` : ''}
            \${b.caraPengisian ? \`<div style="margin-top:2px;"><strong>Petunjuk:</strong> \${b.caraPengisian}</div>\` : ''}
            \${linkHtml}
          </div>
        \`;
        card.appendChild(details);
      }

      const inputWrap = document.createElement('div');
      inputWrap.className = 'input-container';

      if (b.tipeInput === 'checklist') {
        const group = document.createElement('div');
        group.className = 'checklist-group';
        (b.checklistItems || []).forEach((item, idx) => {
          const label = document.createElement('label');
          label.className = 'check-item';
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.dataset.no = b.no;
          chk.dataset.idx = idx;
          chk.addEventListener('change', () => onChecklistChange(b));

          const txt = document.createElement('span');
          txt.textContent = item;

          label.appendChild(chk);
          label.appendChild(txt);
          group.appendChild(label);
        });
        inputWrap.appendChild(group);

      } else if (b.tipeInput === 'pilihan' || b.tipeInput === 'frekuensi' || b.tipeInput === 'jumlah_plus1') {
        const group = document.createElement('div');
        group.className = 'radio-group';
        (b.rubrik || []).forEach(opt => {
          const label = document.createElement('label');
          label.className = 'radio-item';
          const rdo = document.createElement('input');
          rdo.type = 'radio';
          rdo.name = 'radio-' + b.no;
          rdo.value = b.tipeInput === 'jumlah_plus1' ? opt.jumlah : opt.skor;
          rdo.dataset.no = b.no;
          rdo.addEventListener('change', () => onRadioChange(b, rdo.value));

          const txt = document.createElement('span');
          txt.textContent = opt.label;

          const tag = document.createElement('span');
          tag.className = 'radio-score-tag';
          tag.textContent = 'Skor ' + opt.skor;

          label.appendChild(rdo);
          label.appendChild(txt);
          label.appendChild(tag);
          group.appendChild(label);
        });
        inputWrap.appendChild(group);

      } else if (b.tipeInput === 'lampiran3') {
        const l3 = document.createElement('div');
        l3.className = 'lampiran3-wrap';

        const f1 = document.createElement('div');
        f1.className = 'form-field';
        f1.innerHTML = \`<label>Target Periode di RPK:</label>\`;
        const sel = document.createElement('select');
        sel.id = 'sel-periode-' + b.no;
        sel.innerHTML = \`
          <option value="">-- Pilih Target Periode --</option>
          <option value="Harian">Harian</option>
          <option value="Mingguan">Mingguan</option>
          <option value="Bulanan">Bulanan</option>
          <option value="Triwulanan">Triwulanan</option>
          <option value="Semesteran">Semesteran</option>
          <option value="Tentatif">Tentatif</option>
        \`;
        sel.addEventListener('change', () => onLampiran3Change(b));
        f1.appendChild(sel);
        l3.appendChild(f1);

        const f2 = document.createElement('div');
        f2.className = 'form-field';
        f2.innerHTML = \`<label>Realisasi (%):</label>\`;
        const sRow = document.createElement('div');
        sRow.className = 'slider-row';

        const rng = document.createElement('input');
        rng.type = 'range';
        rng.min = '0';
        rng.max = '100';
        rng.value = '0';
        rng.id = 'rng-persen-' + b.no;

        const num = document.createElement('input');
        num.type = 'number';
        num.min = '0';
        num.max = '100';
        num.value = '0';
        num.style.width = '70px';
        num.id = 'num-persen-' + b.no;

        rng.addEventListener('input', () => {
          num.value = rng.value;
          onLampiran3Change(b);
        });
        num.addEventListener('input', () => {
          let val = Math.max(0, Math.min(100, Number(num.value) || 0));
          rng.value = val;
          onLampiran3Change(b);
        });

        sRow.appendChild(rng);
        sRow.appendChild(num);
        f2.appendChild(sRow);
        l3.appendChild(f2);

        const prev = document.createElement('div');
        prev.className = 'lampiran3-preview';
        prev.id = 'prev-lampiran3-' + b.no;
        prev.innerHTML = '<span>Pita Realisasi: Belum diisi</span><span>Skor Lampiran 3: -</span>';
        l3.appendChild(prev);

        inputWrap.appendChild(l3);
      }

      card.appendChild(inputWrap);
      return card;
    }

    // EVENT HANDLERS
    function onChecklistChange(b) {
      const card = document.getElementById('card-butir-' + b.no);
      const chks = card.querySelectorAll('input[type="checkbox"]');
      let count = 0;
      const checkedIdxs = [];
      chks.forEach(c => {
        const itemWrap = c.closest('.check-item');
        if (c.checked) {
          count++;
          checkedIdxs.push(parseInt(c.dataset.idx, 10));
          itemWrap.classList.add('checked');
        } else {
          itemWrap.classList.remove('checked');
        }
      });

      if (checkedIdxs.length === 0) {
        delete jawaban[b.no];
      } else {
        jawaban[b.no] = { input: count, items: checkedIdxs };
      }
      saveAndRecalculate();
    }

    function onRadioChange(b, val) {
      jawaban[b.no] = { input: Number(val) };
      const card = document.getElementById('card-butir-' + b.no);
      card.querySelectorAll('.radio-item').forEach(lbl => {
        const r = lbl.querySelector('input[type="radio"]');
        if (r.checked) lbl.classList.add('selected');
        else lbl.classList.remove('selected');
      });
      saveAndRecalculate();
    }

    function onLampiran3Change(b) {
      const sel = document.getElementById('sel-periode-' + b.no);
      const num = document.getElementById('num-persen-' + b.no);
      const targetPeriode = sel.value;
      const persen = Number(num.value);

      if (!targetPeriode) {
        delete jawaban[b.no];
      } else {
        jawaban[b.no] = { input: persen, targetPeriode };
      }
      saveAndRecalculate();
    }

    // RESTORE STATE TO UI
    function populateFormValues() {
      config.butir.forEach(b => {
        const j = jawaban[b.no];
        if (!j) return;

        const card = document.getElementById('card-butir-' + b.no);
        if (!card) return;

        if (b.tipeInput === 'checklist') {
          const chks = card.querySelectorAll('input[type="checkbox"]');
          const savedItems = j.items || [];
          chks.forEach(c => {
            const idx = parseInt(c.dataset.idx, 10);
            if (savedItems.includes(idx)) {
              c.checked = true;
              c.closest('.check-item')?.classList.add('checked');
            }
          });
        } else if (b.tipeInput === 'pilihan' || b.tipeInput === 'frekuensi' || b.tipeInput === 'jumlah_plus1') {
          const radios = card.querySelectorAll('input[type="radio"]');
          radios.forEach(r => {
            if (Number(r.value) === Number(j.input)) {
              r.checked = true;
              r.closest('.radio-item')?.classList.add('selected');
            }
          });
        } else if (b.tipeInput === 'lampiran3') {
          const sel = document.getElementById('sel-periode-' + b.no);
          const num = document.getElementById('num-persen-' + b.no);
          const rng = document.getElementById('rng-persen-' + b.no);
          if (sel && j.targetPeriode) sel.value = j.targetPeriode;
          if (num && j.input !== undefined) num.value = j.input;
          if (rng && j.input !== undefined) rng.value = j.input;
        }
      });
    }

    // SAVE & RECALCULATE
    function saveAndRecalculate() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jawaban));
      localStorage.setItem(METHOD_KEY, metode.toString());

      const res = engine.hitungIPotik(config, jawaban, metode);
      updateDashboard(res);
      renderRecommendations(res);
    }

    function renderRecommendations(res) {
      recommendationsList.replaceChildren();
      const saran = engine.saranPerbaikan(config, res, jawaban);
      if (!saran.length) {
        const item = document.createElement('li');
        item.className = 'recommendation-empty';
        item.textContent = 'Semua butir sudah mencapai skor tertinggi.';
        recommendationsList.appendChild(item);
        return;
      }

      saran.forEach(item => {
        const li = document.createElement('li');
        const title = document.createElement('strong');
        title.textContent = \`Butir \${item.no}: \${item.pertanyaan}\`;
        const advice = document.createElement('p');
        advice.textContent = item.saran;
        const impact = document.createElement('span');
        impact.className = 'recommendation-impact';
        impact.textContent = \`Potensi kenaikan hingga +\${item.kenaikanIPotik.toFixed(3)} indeks\`;
        const link = document.createElement('a');
        link.href = '#card-butir-' + item.no;
        link.textContent = 'Lihat butir';
        link.addEventListener('click', () => recommendationsDialog.close());
        li.append(title, advice, impact, link);
        recommendationsList.appendChild(li);
      });
    }

    // UPDATE DASHBOARD
    function updateDashboard(res) {
      grandScoreEl.textContent = res.ipotik.toFixed(2);
      if (printSummaryEl) {
        printSummaryEl.textContent = \`Indeks Potik: \${res.ipotik.toFixed(2)} / 4.00 (\${res.zona.label} &mdash; \${res.zona.keterangan})\`;
      }

      zonaBadgeEl.className = 'zona-pill zona-' + res.zona.zona;
      zonaTextEl.textContent = \`\${res.zona.label} (\${res.zona.keterangan})\`;

      const pct = Math.round((res.butirTerisi / res.totalButir) * 100);
      progressTextEl.textContent = \`\${res.butirTerisi} / \${res.totalButir} Butir (\${pct}%)\`;
      progressFillEl.style.width = pct + '%';
      progressBarEl.setAttribute('aria-valuenow', pct);

      renderDimensiCards(res.rekapDimensi);

      res.rekapAspek.forEach(a => {
        const el = document.getElementById('aspek-skor-' + a.id);
        if (el) {
          el.textContent = \`Skor Aspek: \${a.skorAspek.toFixed(4)} | Kontribusi: +\${a.kontribusi.toFixed(4)}\`;
        }
      });

      res.detailButir.forEach(d => {
        const card = document.getElementById('card-butir-' + d.no);
        const badge = document.getElementById('badge-' + d.no);
        if (!card || !badge) return;

        if (d.skor !== null) {
          card.classList.add('has-value');
          badge.classList.add('active');
          badge.innerHTML = \`
            <span>Skor: <strong>\${d.skor}</strong></span>
            <span>Norm: \${d.skorTernormalisasi.toFixed(2)}</span>
            <span>Kontrib: <strong>+\${d.kontribusi.toFixed(4)}</strong></span>
          \`;
        } else {
          card.classList.remove('has-value');
          badge.classList.remove('active');
          badge.innerHTML = '<span>Belum diisi</span>';
        }

        if (d.tipeInput === 'lampiran3') {
          const prev = document.getElementById('prev-lampiran3-' + d.no);
          if (prev) {
            if (d.targetPeriode && d.input !== null) {
              const pita = engine.pitaRealisasiIndex(Number(d.input));
              const pitaLabel = ['0%', '1–25%', '26–49%', '≥50%'][pita];
              prev.innerHTML = \`
                <span>Pita Realisasi: <strong>\${pitaLabel}</strong> (\${d.input}%) &bull; Target: <strong>\${d.targetPeriode}</strong></span>
                <span>Skor Lampiran 3: <strong>\${d.skor || '-'}</strong></span>
              \`;
            } else {
              prev.innerHTML = '<span>Pita Realisasi: Pilih target periode & realisasi</span><span>Skor Lampiran 3: -</span>';
            }
          }
        }
      });
    }

    // RENDER DIMENSI CARDS
    function renderDimensiCards(rekapDimensi) {
      dimensiGridEl.innerHTML = '';
      rekapDimensi.forEach(d => {
        const card = document.createElement('a');
        card.className = 'dimensi-card';
        card.href = '#section-' + d.id;
        card.innerHTML = \`
          <div class="dimensi-card-header">
            <span>Dimensi</span>
            <span>Bobot \${Math.round(d.bobot * 100)}%</span>
          </div>
          <div class="dimensi-card-title" title="\${d.nama}">\${d.nama}</div>
          <div class="dimensi-card-score">
            <span>\${d.persenCapaian.toFixed(1)}%</span>
            <span class="dimensi-card-pct">Capaian</span>
          </div>
          <div class="progress-track" style="margin-top:6px;">
            <div class="progress-fill" style="width: \${d.persenCapaian}%;"></div>
          </div>
          <div class="dimensi-card-sub">
            Kontribusi: \${d.kontribusi.toFixed(3)} / \${d.kontribusiMaksimal.toFixed(2)}
          </div>
        \`;
        dimensiGridEl.appendChild(card);
      });
    }

    // ACTIONS
    methodSelectEl.addEventListener('change', () => {
      metode = parseInt(methodSelectEl.value, 10);
      saveAndRecalculate();
    });

    const scoreMoreToggle = document.getElementById('score-more-toggle');
    const scoreActions = document.getElementById('score-actions');
    scoreMoreToggle.addEventListener('click', () => {
      const expanded = scoreMoreToggle.getAttribute('aria-expanded') === 'true';
      scoreMoreToggle.setAttribute('aria-expanded', String(!expanded));
      scoreMoreToggle.setAttribute('aria-label', expanded ? 'Buka menu tindakan' : 'Tutup menu tindakan');
      scoreActions.classList.toggle('is-open', !expanded);
    });

    document.getElementById('btn-recommendations').addEventListener('click', () => {
      recommendationsDialog.showModal();
    });
    document.getElementById('recommendations-close').addEventListener('click', () => {
      recommendationsDialog.close();
    });

    document.getElementById('btn-max').addEventListener('click', () => {
      if (!confirm('Isi semua butir dengan skor tertinggi? Jawaban saat ini akan diganti.')) return;
      config.butir.forEach(b => {
        if (b.tipeInput === 'checklist') {
          jawaban[b.no] = {
            input: b.checklistItems.length,
            items: b.checklistItems.map((_, i) => i)
          };
        } else if (b.tipeInput === 'lampiran3') {
          jawaban[b.no] = {
            input: 100,
            targetPeriode: 'Harian'
          };
        } else if (b.tipeInput === 'jumlah_plus1') {
          jawaban[b.no] = { input: 3 };
        } else {
          jawaban[b.no] = { input: 4 };
        }
      });
      renderApp();
      populateFormValues();
      saveAndRecalculate();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mengosongkan seluruh jawaban simulator?')) {
        jawaban = {};
        localStorage.removeItem(STORAGE_KEY);
        renderApp();
        saveAndRecalculate();
      }
    });

    document.getElementById('btn-print').addEventListener('click', () => {
      window.print();
    });

    // START
    // ponytail: hostname allowlist = local/dev; staging hosts need explicit add
    if (!/^(localhost|127\.0\.0\.1|)$/.test(location.hostname)) {
      document.querySelector('.login-hint')?.remove();
    }
    checkAuth();
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with responsive rules! Total bytes:', Buffer.byteLength(html));
