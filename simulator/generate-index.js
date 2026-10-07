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
  <style>
    :root {
      --primary: #0284c7;
      --primary-dark: #0369a1;
      --primary-light: #e0f2fe;
      --navy: #0f172a;
      --navy-light: #1e293b;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --radius: 10px;
      --radius-sm: 6px;
      --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
      --hijau: #16a34a;
      --hijau-bg: #dcfce7;
      --kuning: #d97706;
      --kuning-bg: #fef3c7;
      --merah: #dc2626;
      --merah-bg: #fee2e2;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 80px;
    }

    /* LOGIN SCREEN */
    #login-view {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: linear-gradient(135deg, #0f2b48 0%, #0369a1 100%);
    }
    .login-card {
      background: white;
      border-radius: var(--radius);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1);
      padding: 36px 30px;
      width: 100%;
      max-width: 420px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .login-header h1 {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 6px;
    }
    .login-header p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .login-field {
      margin-bottom: 16px;
    }
    .login-field label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--navy);
      margin-bottom: 6px;
    }
    .login-field input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.15s;
    }
    .login-field input:focus {
      border-color: var(--primary);
    }
    .login-error {
      background: var(--merah-bg);
      color: var(--merah);
      font-size: 0.8rem;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      display: none;
    }
    .login-hint {
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.4;
    }
    .user-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #e0f2fe;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      padding: 4px 10px;
      border-radius: 9999px;
    }

    /* CONTAINER */
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* HEADER */
    header.hero {
      background: linear-gradient(135deg, #0f2b48 0%, #0369a1 100%);
      color: white;
      padding: 14px 0;
      margin-bottom: 20px;
      box-shadow: var(--shadow-md);
    }
    .hero-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .hero h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .hero-user-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* STICKY TOP SCOREBOARD */
    .sticky-score-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      padding: 12px 0;
      margin-bottom: 24px;
      transition: all 0.2s ease;
    }
    .score-bar-grid {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .score-main {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .score-value-box {
      display: flex;
      flex-direction: column;
    }
    .score-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .score-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      color: var(--text);
    }
    .score-scale {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .zona-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .zona-pill.zona-hijau {
      background: var(--hijau-bg);
      color: var(--hijau);
      border-color: #86efac;
    }
    .zona-pill.zona-kuning {
      background: var(--kuning-bg);
      color: var(--kuning);
      border-color: #fde047;
    }
    .zona-pill.zona-merah {
      background: var(--merah-bg);
      color: var(--merah);
      border-color: #fca5a5;
    }
    .zona-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: currentColor;
    }

    .score-progress-wrap {
      flex: 1;
      min-width: 220px;
      max-width: 320px;
    }
    .progress-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .progress-track {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary);
      width: 0%;
      transition: width 0.3s ease, background 0.3s ease;
    }

    .score-actions-wrap { display: contents; }
    .btn.score-more-btn { display: none; }
    .score-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .method-selector {
      font-size: 0.78rem;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      font-weight: 500;
      cursor: pointer;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .btn-primary:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }
    .btn-danger {
      color: var(--merah);
    }
    .btn-danger:hover {
      background: var(--merah-bg);
      border-color: #fca5a5;
    }
    button:focus-visible,
    .btn:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    summary:focus-visible,
    label:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    /* DIMENSI GRID */
    .dimensi-summary-section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dimensi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
    }
    .dimensi-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: var(--shadow);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .dimensi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }
    .dimensi-card-header {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .dimensi-card-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dimensi-card-score {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text);
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .dimensi-card-pct {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .dimensi-card-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* DIMENSI & ASPEK ACCORDION / SECTIONS */
    .dimensi-block {
      background: transparent;
      margin-bottom: 32px;
    }
    .dimensi-header {
      background: #0f172a;
      color: white;
      padding: 14px 20px;
      border-radius: var(--radius) var(--radius) 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .dimensi-header h2 {
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dimensi-header .dimensi-badge {
      background: rgba(255,255,255,0.18);
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .aspek-block {
      background: var(--card-bg);
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 18px 20px;
    }
    .aspek-block:last-child {
      border-radius: 0 0 var(--radius) var(--radius);
      margin-bottom: 20px;
    }
    .aspek-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f1f5f9;
    }
    .aspek-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e3a8a;
    }
    .aspek-meta {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      gap: 12px;
    }

    /* BUTIR CARD */
    .butir-card {
      background: #fafafa;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      margin-bottom: 16px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .butir-card:last-child {
      margin-bottom: 0;
    }
    .butir-card:hover {
      border-color: #cbd5e1;
      background: #ffffff;
    }
    .butir-card.has-value {
      border-left: 4px solid var(--primary);
    }
    .butir-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .butir-number {
      font-size: 0.82rem;
      font-weight: 700;
      background: #e2e8f0;
      color: var(--navy);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .butir-score-badge {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      background: #f1f5f9;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .butir-score-badge.active {
      background: var(--primary-light);
      color: var(--primary-dark);
      border: 1px solid #bae6fd;
    }
    .butir-question {
      font-size: 0.96rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    /* BUKTI DUKUNG COLLAPSIBLE */
    details.bukti-box {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 12px;
    }
    details.bukti-box summary {
      cursor: pointer;
      font-weight: 600;
      color: #3b82f6;
      outline: none;
      user-select: none;
    }
    details.bukti-box .bukti-content {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.78rem;
      line-height: 1.4;
      color: #475569;
    }
    details.bukti-box a {
      color: var(--primary);
      text-decoration: underline;
    }

    /* INPUT CONTROLS */
    .checklist-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .check-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--border);
      cursor: pointer;
      font-size: 0.88rem;
      transition: all 0.15s;
    }
    .check-item:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .check-item input[type="checkbox"] {
      margin-top: 3px;
      accent-color: var(--primary);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .check-item.checked {
      background: #f0f9ff;
      border-color: #7dd3fc;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .radio-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--border);
      cursor: pointer;
      font-size: 0.88rem;
      transition: all 0.15s;
    }
    .radio-item:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .radio-item input[type="radio"] {
      margin-top: 3px;
      accent-color: var(--primary);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .radio-item.selected {
      background: #f0f9ff;
      border-color: #7dd3fc;
      font-weight: 500;
    }
    .radio-score-tag {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #475569;
    }
    .radio-item.selected .radio-score-tag {
      background: #bae6fd;
      color: var(--primary-dark);
    }

    .lampiran3-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      background: white;
      padding: 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-field label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--navy);
    }
    .form-field select, .form-field input[type="number"] {
      padding: 8px 10px;
      font-size: 0.88rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: white;
      color: var(--text);
      outline: none;
    }
    .form-field select:focus, .form-field input[type="number"]:focus {
      border-color: var(--primary);
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--primary);
      cursor: pointer;
    }
    .lampiran3-preview {
      grid-column: 1 / -1;
      font-size: 0.78rem;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px dashed var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
    }

    /* RESPONSIVE DESIGN */
    @media (max-width: 768px) {
      body {
        padding-bottom: 60px;
      }
      .container {
        padding: 0 12px;
      }
      header.hero {
        padding: 12px 0;
        margin-bottom: 14px;
      }
      .hero h1 {
        font-size: 1.1rem;
      }
      .sticky-score-bar {
        padding: 8px 0;
        margin-bottom: 16px;
      }
      .score-bar-grid {
        gap: 8px;
      }
      .score-main {
        width: 100%;
        justify-content: space-between;
      }
      .score-number {
        font-size: 1.6rem;
      }
      .zona-pill {
        font-size: 0.75rem;
        padding: 4px 10px;
      }
      .score-progress-wrap {
        flex: 1 1 auto;
        min-width: 120px;
        max-width: none;
      }
      .btn.score-more-btn {
        display: inline-flex;
        padding: 6px 10px;
        font-size: 0.74rem;
      }
      .score-actions {
        display: none;
        width: 100%;
        flex-direction: column;
        gap: 6px;
      }
      .score-more-toggle:checked ~ .score-actions {
        display: flex;
      }
      .score-actions .method-selector,
      .score-actions .btn {
        width: 100%;
        justify-content: center;
        text-align: center;
        padding: 6px 8px;
        font-size: 0.74rem;
      }
      .dimensi-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
      }
      .dimensi-card {
        padding: 10px;
      }
      .dimensi-card-title {
        font-size: 0.82rem;
      }
      .dimensi-card-score {
        font-size: 1.1rem;
      }
      .dimensi-header {
        padding: 10px 14px;
      }
      .dimensi-header h2 {
        font-size: 1rem;
      }
      .dimensi-header .dimensi-badge {
        font-size: 0.72rem;
        padding: 3px 8px;
      }
      .aspek-block {
        padding: 14px 12px;
      }
      .aspek-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 12px;
      }
      .aspek-meta {
        font-size: 0.72rem;
        flex-wrap: wrap;
        gap: 8px;
      }
      .butir-card {
        padding: 12px;
        margin-bottom: 12px;
      }
      .butir-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .butir-score-badge {
        width: 100%;
        justify-content: space-between;
        font-size: 0.72rem;
        padding: 4px 8px;
      }
      .butir-question {
        font-size: 0.9rem;
        margin-bottom: 10px;
      }
      .check-item, .radio-item {
        padding: 8px 10px;
        font-size: 0.82rem;
      }
      .radio-item {
        flex-wrap: wrap;
      }
      .radio-score-tag {
        margin-left: 0;
        margin-top: 4px;
        font-size: 0.7rem;
      }
      .lampiran3-wrap {
        grid-template-columns: 1fr;
        padding: 10px;
        gap: 10px;
      }
      .lampiran3-preview {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        font-size: 0.74rem;
      }
    }

    @media (max-width: 480px) {
      .dimensi-grid {
        grid-template-columns: 1fr 1fr;
      }
      .dimensi-grid .dimensi-card:last-child {
        grid-column: 1 / -1;
      }
      .login-card {
        padding: 24px 18px;
      }
      .login-header h1 {
        font-size: 1.25rem;
      }
    }

    /* PRINT STYLES */
    @media print {
      body {
        background: white;
        color: black;
        padding-bottom: 0;
      }
      #login-view, .sticky-score-bar, .score-actions, .hero, .btn, details.bukti-box summary, .check-item input, .radio-item input, .slider-row input[type="range"] {
        display: none !important;
      }
      .print-header {
        display: block !important;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .print-header h1 { font-size: 1.4rem; }
      .print-summary-table {
        display: table !important;
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      .print-summary-table th, .print-summary-table td {
        border: 1px solid #ccc;
        padding: 6px 10px;
        font-size: 0.82rem;
      }
      .print-summary-table th { background: #f0f0f0; }
      .butir-card {
        page-break-inside: avoid;
        border: 1px solid #ccc !important;
        margin-bottom: 10px;
      }
    }
    .print-header, .print-summary-table { display: none; }
  </style>
</head>
<body>

  <!-- LOGIN SCREEN -->
  <div id="login-view">
    <div class="login-card">
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
        <h1>Simulator IPotik 2026</h1>
        <div class="hero-user-box">
          <span class="user-pill"><span id="user-display">admin</span></span>
          <button class="btn btn-danger" id="btn-logout" title="Keluar dari sesi" style="font-size:0.75rem; padding:4px 10px;">
            Keluar
          </button>
        </div>
      </div>
    </header>

    <!-- STICKY SCOREBOARD -->
    <section class="sticky-score-bar">
      <div class="container score-bar-grid">
        <div class="score-main" role="status" aria-live="polite" aria-atomic="true">
          <div class="score-value-box">
            <span class="score-label">Indeks IPotik</span>
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
          <input type="checkbox" id="score-more-toggle" class="score-more-toggle" hidden>
          <label for="score-more-toggle" class="btn score-more-btn">Lainnya</label>
          <div class="score-actions">
            <select class="method-selector" id="method-select" title="Pilih Metode Pembobotan">
              <option value="1">Metode 1: Rumus Resmi (Default)</option>
              <option value="2">Metode 2: Bobot Tercetak</option>
            </select>
            <button class="btn btn-primary" id="btn-max" title="Isi semua butir dengan skor tertinggi">
              Skor Maksimal
            </button>
            <button class="btn btn-danger" id="btn-reset" title="Kosongkan seluruh isian">
              Reset
            </button>
            <button class="btn" id="btn-print" title="Cetak atau simpan sebagai dokumen PDF">
              Cetak / PDF
            </button>
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
        tentukanZona,
        hitungIPotik,
      };
    })();
  </script>

  <!-- APP SCRIPT -->
  <script type="module">
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

    let metode = parseInt(localStorage.getItem(METHOD_KEY) || '1', 10);
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
    }

    // UPDATE DASHBOARD
    function updateDashboard(res) {
      grandScoreEl.textContent = res.ipotik.toFixed(2);
      if (printSummaryEl) {
        printSummaryEl.textContent = \`Indeks IPotik: \${res.ipotik.toFixed(2)} / 4.00 (\${res.zona.label} &mdash; \${res.zona.keterangan})\`;
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
