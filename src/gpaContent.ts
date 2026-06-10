export const gpaHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GradeX — CGPA & SGPA Calculator</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #0a0a0a;
    --black2: #111111;
    --black3: #1a1a1a;
    --black4: #222222;
    --black5: #2e2e2e;
    --orange: #FF6B00;
    --orange2: #FF8C33;
    --orange3: #FF4500;
    --orange-dim: rgba(255, 107, 0, 0.12);
    --orange-glow: rgba(255, 107, 0, 0.3);
    --text: #f0f0f0;
    --text2: #aaaaaa;
    --text3: #666666;
    --border: rgba(255, 107, 0, 0.15);
    --border2: rgba(255, 107, 0, 0.35);
    --radius: 12px;
    --radius2: 8px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--black);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* BACKGROUND GRID */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  /* GLOW ORB */
  body::after {
    content: '';
    position: fixed;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* HEADER */
  header {
    position: relative;
    z-index: 10;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: rgba(10,10,10,0.8);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    background: var(--orange);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: 14px;
    color: #000;
    box-shadow: 0 0 16px var(--orange-glow);
  }

  .logo-text {
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: var(--text);
    letter-spacing: 2px;
  }

  .logo-text span { color: var(--orange); }

  .header-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--orange);
    border: 1px solid var(--border2);
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--orange-dim);
    letter-spacing: 1px;
  }

  /* MAIN */
  main {
    position: relative;
    z-index: 5;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px 60px;
  }

  /* HERO */
  .hero {
    text-align: center;
    margin-bottom: 40px;
  }

  .hero-tag {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--orange);
    text-transform: uppercase;
    margin-bottom: 14px;
    opacity: 0.8;
  }

  .hero h1 {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: clamp(28px, 6vw, 52px);
    line-height: 1.1;
    letter-spacing: -1px;
  }

  .hero h1 span {
    color: var(--orange);
    text-shadow: 0 0 30px var(--orange-glow);
  }

  .hero p {
    margin-top: 12px;
    color: var(--text2);
    font-size: 15px;
    font-weight: 300;
  }

  /* TABS */
  .tabs {
    display: flex;
    background: var(--black3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 28px;
    gap: 4px;
  }

  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: var(--radius2);
    background: transparent;
    color: var(--text2);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.5px;
  }

  .tab-btn.active {
    background: var(--orange);
    color: #000;
    font-weight: 700;
    box-shadow: 0 0 20px var(--orange-glow);
  }

  .tab-btn:not(.active):hover {
    background: var(--orange-dim);
    color: var(--orange);
  }

  /* PANEL */
  .panel { display: none; }
  .panel.active { display: block; }

  /* CARD */
  .card {
    background: var(--black2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: 20px;
    transition: border-color 0.2s;
  }

  .card:hover { border-color: var(--border2); }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .card-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--orange);
    text-transform: uppercase;
  }

  /* SUBJECT ROW */
  .subject-row {
    display: grid;
    grid-template-columns: 1fr 140px 110px 44px;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }

  @media (max-width: 600px) {
    .subject-row {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
    }
    .subject-row .remove-btn {
      grid-column: 2;
      grid-row: 2;
      justify-self: end;
    }
    .subject-row input:first-child {
      grid-column: 1 / -1;
    }
  }

  .inp {
    background: var(--black3);
    border: 1px solid var(--border);
    border-radius: var(--radius2);
    padding: 10px 14px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .inp:focus {
    border-color: var(--orange);
    box-shadow: 0 0 0 3px var(--orange-dim);
  }

  .inp::placeholder { color: var(--text3); }

  select.inp {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FF6B00' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }

  select.inp option {
    background: var(--black3);
    color: var(--text);
  }

  /* BUTTONS */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px 20px;
    border-radius: var(--radius2);
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    letter-spacing: 0.3px;
  }

  .btn-primary {
    background: var(--orange);
    color: #000;
    box-shadow: 0 0 20px var(--orange-glow);
  }

  .btn-primary:hover {
    background: var(--orange2);
    transform: translateY(-1px);
    box-shadow: 0 0 28px var(--orange-glow);
  }

  .btn-secondary {
    background: transparent;
    color: var(--orange);
    border: 1px solid var(--border2);
  }

  .btn-secondary:hover {
    background: var(--orange-dim);
    border-color: var(--orange);
  }

  .btn-danger {
    background: rgba(255,50,50,0.1);
    color: #ff5555;
    border: 1px solid rgba(255,50,50,0.2);
    padding: 8px;
    width: 36px;
    height: 36px;
    border-radius: 6px;
  }

  .btn-danger:hover { background: rgba(255,50,50,0.2); }

  .btn-full { width: 100%; }

  /* GRADE GUIDE */
  .grade-guide {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }

  .grade-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--black4);
    border: 1px solid var(--border);
    color: var(--text2);
  }

  .grade-chip strong { color: var(--orange); }

  /* RESULT CARD */
  .result-card {
    background: linear-gradient(135deg, var(--black3) 0%, var(--black4) 100%);
    border: 1px solid var(--orange);
    border-radius: var(--radius);
    padding: 28px;
    text-align: center;
    box-shadow: 0 0 40px rgba(255,107,0,0.1), inset 0 1px 0 rgba(255,107,0,0.1);
    margin-bottom: 20px;
    display: none;
  }

  .result-card.show { display: block; }

  .result-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--orange2);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .result-value {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: clamp(52px, 14vw, 80px);
    color: var(--orange);
    line-height: 1;
    text-shadow: 0 0 40px var(--orange-glow);
  }

  .result-grade {
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: var(--text);
    margin-top: 10px;
    letter-spacing: 2px;
  }

  .result-meta {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .result-meta-item {
    text-align: center;
  }

  .result-meta-item .val {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    font-size: 20px;
    color: var(--orange2);
  }

  .result-meta-item .lbl {
    font-size: 11px;
    color: var(--text3);
    margin-top: 2px;
    letter-spacing: 1px;
  }

  /* SGPA SEMESTERS */
  .semester-block {
    background: var(--black3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
    transition: border-color 0.2s;
  }

  .semester-block:hover { border-color: var(--border2); }

  .semester-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 10px;
    flex-wrap: wrap;
  }

  .semester-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--orange);
    letter-spacing: 2px;
  }

  .semester-inp {
    background: var(--black4);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 14px;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    width: 130px;
    outline: none;
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .semester-inp:focus {
    border-color: var(--orange);
    box-shadow: 0 0 0 3px var(--orange-dim);
  }

  .semester-credits-inp {
    background: var(--black4);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 14px;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    width: 110px;
    outline: none;
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .semester-credits-inp:focus {
    border-color: var(--orange);
    box-shadow: 0 0 0 3px var(--orange-dim);
  }

  .semester-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .semester-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .semester-field label {
    font-size: 11px;
    color: var(--text3);
    letter-spacing: 1px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* DIVIDER */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 20px 0;
  }

  /* SCALE INFO */
  .scale-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .scale-toggle label {
    font-size: 13px;
    color: var(--text2);
  }

  /* HISTORY */
  .history-list { list-style: none; }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--black3);
    border: 1px solid var(--border);
    border-radius: var(--radius2);
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 8px;
    transition: border-color 0.2s;
  }

  .history-item:hover { border-color: var(--border2); }

  .history-type {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 10px;
    background: var(--orange-dim);
    color: var(--orange);
    border: 1px solid var(--border2);
    letter-spacing: 1px;
  }

  .history-score {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--orange);
  }

  .history-info {
    font-size: 12px;
    color: var(--text3);
    font-family: 'JetBrains Mono', monospace;
  }

  .history-del {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text3);
    font-size: 18px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .history-del:hover { color: #ff5555; }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--text3);
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 1px;
  }

  /* COL HEADERS */
  .col-headers {
    display: grid;
    grid-template-columns: 1fr 140px 110px 44px;
    gap: 10px;
    margin-bottom: 8px;
    padding: 0 2px;
  }

  .col-headers span {
    font-size: 11px;
    color: var(--text3);
    letter-spacing: 1px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
  }

  @media (max-width: 600px) {
    .col-headers { display: none; }
  }

  /* ACTIONS ROW */
  .actions-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  /* PROGRESS BAR */
  .progress-bar-wrap {
    background: var(--black4);
    border-radius: 20px;
    height: 6px;
    margin-top: 12px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--orange3), var(--orange2));
    border-radius: 20px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--orange-glow);
  }

  /* FOOTER */
  footer {
    position: relative;
    z-index: 5;
    text-align: center;
    padding: 24px;
    border-top: 1px solid var(--border);
    color: var(--text3);
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 1px;
  }

  footer span { color: var(--orange); }

  /* SCROLL */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--black2); }
  ::-webkit-scrollbar-thumb { background: var(--black5); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--orange); }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .panel.active { animation: fadeUp 0.3s ease; }

  .result-card.show { animation: fadeUp 0.4s ease; }

  @keyframes pulse-glow {
    0%, 100% { text-shadow: 0 0 30px var(--orange-glow); }
    50% { text-shadow: 0 0 60px rgba(255,107,0,0.6); }
  }

  .result-value { animation: pulse-glow 2.5s ease-in-out infinite; }

  /* RESPONSIVE */
  @media (max-width: 480px) {
    header { padding: 14px 16px; }
    main { padding: 24px 14px 48px; }
    .card { padding: 18px 14px; }
    .semester-block { padding: 14px; }
  }

  /* NOTIFICATION */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--black3);
    border: 1px solid var(--orange);
    border-radius: var(--radius2);
    padding: 12px 18px;
    font-size: 13px;
    color: var(--text);
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateY(80px);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  .toast-icon { color: var(--orange); font-size: 16px; }

  /* GRADE COLORS */
  .grade-O { color: #00e676; }
  .grade-A { color: #40c4ff; }
  .grade-B { color: var(--orange); }
  .grade-C { color: var(--orange2); }
  .grade-D { color: #ffab40; }
  .grade-F { color: #ff5252; }
</style>
</head>
<body>

<!-- HEADER -->
<header>
  <div class="logo">
    <div class="logo-icon">GX</div>
    <span class="logo-text">GRADE<span>X</span></span>
  </div>
  <div class="header-badge">CGPA · SGPA</div>
</header>

<!-- MAIN -->
<main>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-tag">Academic Performance Calculator</div>
    <h1>Calculate Your <span>GPA</span></h1>
    <p>SGPA per semester · CGPA across all semesters · Instant grade breakdown</p>
  </div>

  <!-- TABS -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('sgpa')">📊 SGPA Calculator</button>
    <button class="tab-btn" onclick="switchTab('cgpa')">🎓 CGPA Calculator</button>
    <button class="tab-btn" onclick="switchTab('history')">📁 History</button>
  </div>

  <!-- ═══════════════════════════════ SGPA PANEL ═══════════════════════════════ -->
  <div id="panel-sgpa" class="panel active">

    <div class="card">
      <div class="card-header">
        <div class="card-title">⚡ SGPA — Semester GPA</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <select class="inp" id="sgpa-scale" style="width:auto;font-family:'JetBrains Mono',monospace;font-size:12px;" onchange="updateGradeGuide()">
            <option value="10">10-Point Scale</option>
            <option value="4">4-Point Scale</option>
          </select>
          <select class="inp" id="sem-number" style="width:auto;font-family:'JetBrains Mono',monospace;font-size:12px;">
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 6">Semester 6</option>
            <option value="Semester 7">Semester 7</option>
            <option value="Semester 8">Semester 8</option>
          </select>
        </div>
      </div>

      <!-- GRADE GUIDE -->
      <div class="grade-guide" id="grade-guide-10">
        <div class="grade-chip"><strong>O</strong> = 10</div>
        <div class="grade-chip"><strong>A+</strong> = 9</div>
        <div class="grade-chip"><strong>A</strong> = 8</div>
        <div class="grade-chip"><strong>B+</strong> = 7</div>
        <div class="grade-chip"><strong>B</strong> = 6</div>
        <div class="grade-chip"><strong>C</strong> = 5</div>
        <div class="grade-chip"><strong>D</strong> = 4</div>
        <div class="grade-chip"><strong>F</strong> = 0</div>
      </div>

      <div class="grade-guide" id="grade-guide-4" style="display:none;">
        <div class="grade-chip"><strong>A</strong> = 4.0</div>
        <div class="grade-chip"><strong>A-</strong> = 3.7</div>
        <div class="grade-chip"><strong>B+</strong> = 3.3</div>
        <div class="grade-chip"><strong>B</strong> = 3.0</div>
        <div class="grade-chip"><strong>B-</strong> = 2.7</div>
        <div class="grade-chip"><strong>C+</strong> = 2.3</div>
        <div class="grade-chip"><strong>C</strong> = 2.0</div>
        <div class="grade-chip"><strong>D</strong> = 1.0</div>
        <div class="grade-chip"><strong>F</strong> = 0.0</div>
      </div>

      <!-- COL HEADERS -->
      <div class="col-headers">
        <span>Subject Name</span>
        <span>Grade Point</span>
        <span>Credits</span>
        <span></span>
      </div>

      <!-- SUBJECTS -->
      <div id="sgpa-subjects"></div>

      <div class="actions-row">
        <button class="btn btn-secondary" onclick="addSubject()">+ Add Subject</button>
        <button class="btn btn-primary" onclick="calculateSGPA()">Calculate SGPA</button>
        <button class="btn btn-secondary" onclick="clearSGPA()">Clear</button>
      </div>
    </div>

    <!-- RESULT -->
    <div class="result-card" id="sgpa-result">
      <div class="result-label" id="sgpa-result-label">SGPA · SEMESTER 1</div>
      <div class="result-value" id="sgpa-value">0.00</div>
      <div class="result-grade" id="sgpa-grade-text">—</div>
      <div class="result-meta">
        <div class="result-meta-item">
          <div class="val" id="sgpa-total-credits">0</div>
          <div class="lbl">TOTAL CREDITS</div>
        </div>
        <div class="result-meta-item">
          <div class="val" id="sgpa-total-points">0</div>
          <div class="lbl">GRADE POINTS</div>
        </div>
        <div class="result-meta-item">
          <div class="val" id="sgpa-subjects-count">0</div>
          <div class="lbl">SUBJECTS</div>
        </div>
      </div>
      <div class="progress-bar-wrap" style="max-width:400px;margin:16px auto 0;">
        <div class="progress-bar" id="sgpa-progress" style="width:0%"></div>
      </div>
    </div>

  </div>
  <!-- /SGPA -->

  <!-- ═══════════════════════════════ CGPA PANEL ═══════════════════════════════ -->
  <div id="panel-cgpa" class="panel">

    <div class="card">
      <div class="card-header">
        <div class="card-title">🎓 CGPA — Cumulative GPA</div>
        <select class="inp" id="cgpa-scale" style="width:auto;font-family:'JetBrains Mono',monospace;font-size:12px;">
          <option value="10">10-Point Scale</option>
          <option value="4">4-Point Scale</option>
        </select>
      </div>
      <p style="color:var(--text3);font-size:12px;font-family:'JetBrains Mono',monospace;margin-bottom:18px;letter-spacing:.5px;">Enter your SGPA and credits for each semester.</p>

      <div id="cgpa-semesters"></div>

      <div class="actions-row">
        <button class="btn btn-secondary" onclick="addSemester()">+ Add Semester</button>
        <button class="btn btn-primary" onclick="calculateCGPA()">Calculate CGPA</button>
        <button class="btn btn-secondary" onclick="clearCGPA()">Clear</button>
      </div>
    </div>

    <!-- RESULT -->
    <div class="result-card" id="cgpa-result">
      <div class="result-label">CUMULATIVE GPA (CGPA)</div>
      <div class="result-value" id="cgpa-value">0.00</div>
      <div class="result-grade" id="cgpa-grade-text">—</div>
      <div class="result-meta">
        <div class="result-meta-item">
          <div class="val" id="cgpa-total-credits">0</div>
          <div class="lbl">TOTAL CREDITS</div>
        </div>
        <div class="result-meta-item">
          <div class="val" id="cgpa-semesters-count">0</div>
          <div class="lbl">SEMESTERS</div>
        </div>
        <div class="result-meta-item">
          <div class="val" id="cgpa-percentage">0%</div>
          <div class="lbl">PERCENTAGE</div>
        </div>
      </div>
      <div class="progress-bar-wrap" style="max-width:400px;margin:16px auto 0;">
        <div class="progress-bar" id="cgpa-progress" style="width:0%"></div>
      </div>
    </div>

    <!-- CONVERTER -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">🔁 CGPA ↔ Percentage</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;flex-wrap:wrap;">
        <div>
          <label style="display:block;font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;letter-spacing:1px;margin-bottom:6px;">CGPA</label>
          <input type="number" class="inp" id="conv-cgpa" placeholder="e.g. 8.5" step="0.01" min="0" max="10" oninput="convertCGPA()">
        </div>
        <div style="text-align:center;color:var(--orange);font-family:'Orbitron',sans-serif;font-size:16px;font-weight:700;">⇄</div>
        <div>
          <label style="display:block;font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;letter-spacing:1px;margin-bottom:6px;">PERCENTAGE</label>
          <input type="number" class="inp" id="conv-percent" placeholder="e.g. 80.75" step="0.01" min="0" max="100" oninput="convertPercent()">
        </div>
      </div>
      <div id="conv-result" style="margin-top:12px;font-size:12px;color:var(--text3);font-family:'JetBrains Mono',monospace;text-align:center;"></div>
    </div>

  </div>
  <!-- /CGPA -->

  <!-- ═══════════════════════════════ HISTORY PANEL ═══════════════════════════════ -->
  <div id="panel-history" class="panel">
    <div class="card">
      <div class="card-header">
        <div class="card-title">📁 Calculation History</div>
        <button class="btn btn-secondary" onclick="clearHistory()" style="font-size:12px;padding:8px 14px;">Clear All</button>
      </div>
      <ul class="history-list" id="history-list">
        <li class="empty-state">NO HISTORY YET · CALCULATE SGPA OR CGPA FIRST</li>
      </ul>
    </div>
  </div>
  <!-- /HISTORY -->

</main>

<!-- FOOTER -->
<footer>
  BUILT BY <span>GAMURA</span> · GRADEX v1.0 · ALL RIGHTS RESERVED
</footer>

<!-- TOAST -->
<div class="toast" id="toast">
  <span class="toast-icon">✓</span>
  <span id="toast-msg">Saved to history</span>
</div>

<script>
  // ─── STATE ────────────────────────────────────────────────────────────────
  let subjectCount = 0;
  let semesterCount = 0;
  let history = JSON.parse(localStorage.getItem('gradex-history') || '[]');

  // ─── GRADE MAPS ───────────────────────────────────────────────────────────
  const GRADE_MAP_10 = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0
  };
  const GRADE_MAP_4 = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  // ─── TABS ─────────────────────────────────────────────────────────────────
  function switchTab(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    event.currentTarget.classList.add('active');
    if (name === 'history') renderHistory();
  }

  // ─── GRADE GUIDE TOGGLE ───────────────────────────────────────────────────
  function updateGradeGuide() {
    const scale = document.getElementById('sgpa-scale').value;
    document.getElementById('grade-guide-10').style.display = scale === '10' ? 'flex' : 'none';
    document.getElementById('grade-guide-4').style.display = scale === '4' ? 'flex' : 'none';
    // Update all grade selects
    document.querySelectorAll('.grade-select').forEach(sel => {
      const val = sel.value;
      populateGradeSelect(sel, scale);
    });
  }

  function populateGradeSelect(sel, scale) {
    const grades = scale === '10'
      ? ['O','A+','A','B+','B','C','D','F']
      : ['A','A-','B+','B','B-','C+','C','C-','D+','D','F'];
    const prev = sel.value;
    sel.innerHTML = grades.map(g => \`<option value="\${g}">\${g}</option>\`).join('');
    if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
  }

  // ─── ADD SUBJECT ──────────────────────────────────────────────────────────
  function addSubject(name = '', grade = '', credits = '') {
    subjectCount++;
    const scale = document.getElementById('sgpa-scale').value;
    const grades = scale === '10'
      ? ['O','A+','A','B+','B','C','D','F']
      : ['A','A-','B+','B','B-','C+','C','C-','D+','D','F'];

    const row = document.createElement('div');
    row.className = 'subject-row';
    row.id = 'subject-' + subjectCount;
    row.innerHTML = \`
      <input type="text" class="inp" placeholder="Subject name (optional)" value="\${name}">
      <select class="inp grade-select">
        \${grades.map(g => \`<option value="\${g}" \${g === grade ? 'selected' : ''}>\${g}</option>\`).join('')}
      </select>
      <input type="number" class="inp credits-inp" placeholder="Credits" value="\${credits}" min="1" max="10" step="1">
      <button class="btn btn-danger" onclick="removeSubject('subject-\${subjectCount}')">✕</button>
    \`;
    document.getElementById('sgpa-subjects').appendChild(row);
  }

  function removeSubject(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ─── CALCULATE SGPA ───────────────────────────────────────────────────────
  function calculateSGPA() {
    const rows = document.querySelectorAll('#sgpa-subjects .subject-row');
    if (rows.length === 0) { showToast('⚠ Add at least one subject', true); return; }

    const scale = document.getElementById('sgpa-scale').value;
    const gradeMap = scale === '10' ? GRADE_MAP_10 : GRADE_MAP_4;
    const scaleMax = scale === '10' ? 10 : 4;
    const semName = document.getElementById('sem-number').value;

    let totalWeighted = 0, totalCredits = 0, hasError = false;

    rows.forEach(row => {
      const gradeSel = row.querySelector('.grade-select').value;
      const creditInp = parseFloat(row.querySelector('.credits-inp').value);
      if (isNaN(creditInp) || creditInp <= 0) { hasError = true; return; }
      const gp = gradeMap[gradeSel];
      totalWeighted += gp * creditInp;
      totalCredits += creditInp;
    });

    if (hasError) { showToast('⚠ Enter valid credits for all subjects', true); return; }
    if (totalCredits === 0) { showToast('⚠ Total credits cannot be zero', true); return; }

    const sgpa = (totalWeighted / totalCredits).toFixed(2);
    const gradeText = getGradeText(parseFloat(sgpa), scaleMax);

    // Show result
    document.getElementById('sgpa-result-label').textContent = \`SGPA · \${semName.toUpperCase()}\`;
    document.getElementById('sgpa-value').textContent = sgpa;
    document.getElementById('sgpa-grade-text').textContent = gradeText;
    document.getElementById('sgpa-total-credits').textContent = totalCredits;
    document.getElementById('sgpa-total-points').textContent = totalWeighted.toFixed(1);
    document.getElementById('sgpa-subjects-count').textContent = rows.length;
    document.getElementById('sgpa-progress').style.width = ((sgpa / scaleMax) * 100) + '%';
    document.getElementById('sgpa-result').classList.add('show');

    // Save history
    saveHistory({ type: 'SGPA', label: semName, score: sgpa, credits: totalCredits, scale });
    showToast('✓ SGPA calculated & saved');
  }

  function clearSGPA() {
    document.getElementById('sgpa-subjects').innerHTML = '';
    document.getElementById('sgpa-result').classList.remove('show');
    subjectCount = 0;
    // Re-add 4 default rows
    for (let i = 0; i < 4; i++) addSubject();
  }

  // ─── ADD SEMESTER (CGPA) ──────────────────────────────────────────────────
  function addSemester(sgpa = '', credits = '') {
    semesterCount++;
    const block = document.createElement('div');
    block.className = 'semester-block';
    block.id = 'sem-' + semesterCount;
    block.innerHTML = \`
      <div class="semester-header">
        <div class="semester-label">SEM \${semesterCount}</div>
        <button class="btn btn-danger" onclick="removeSemester('sem-\${semesterCount}')">✕ Remove</button>
      </div>
      <div class="semester-row">
        <div class="semester-field">
          <label>SGPA</label>
          <input type="number" class="semester-inp" placeholder="e.g. 8.5" value="\${sgpa}" step="0.01" min="0" max="10">
        </div>
        <div class="semester-field">
          <label>CREDITS</label>
          <input type="number" class="semester-credits-inp" placeholder="e.g. 24" value="\${credits}" step="1" min="1">
        </div>
      </div>
    \`;
    document.getElementById('cgpa-semesters').appendChild(block);
  }

  function removeSemester(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ─── CALCULATE CGPA ───────────────────────────────────────────────────────
  function calculateCGPA() {
    const blocks = document.querySelectorAll('#cgpa-semesters .semester-block');
    if (blocks.length === 0) { showToast('⚠ Add at least one semester', true); return; }

    const scale = parseFloat(document.getElementById('cgpa-scale').value);
    let totalWeighted = 0, totalCredits = 0, hasError = false, validCount = 0;

    blocks.forEach(block => {
      const sgpaInp = parseFloat(block.querySelector('.semester-inp').value);
      const credInp = parseFloat(block.querySelector('.semester-credits-inp').value);
      if (isNaN(sgpaInp) || isNaN(credInp) || credInp <= 0) { hasError = true; return; }
      if (sgpaInp < 0 || sgpaInp > scale) { hasError = true; return; }
      totalWeighted += sgpaInp * credInp;
      totalCredits += credInp;
      validCount++;
    });

    if (hasError) { showToast('⚠ Check all SGPA and credits entries', true); return; }
    if (totalCredits === 0) { showToast('⚠ Total credits cannot be zero', true); return; }

    const cgpa = (totalWeighted / totalCredits).toFixed(2);
    const pct = (scale === 10)
      ? ((parseFloat(cgpa) * 10) - 0.75).toFixed(2)
      : ((parseFloat(cgpa) / 4) * 100).toFixed(2);
    const gradeText = getGradeText(parseFloat(cgpa), scale);

    document.getElementById('cgpa-value').textContent = cgpa;
    document.getElementById('cgpa-grade-text').textContent = gradeText;
    document.getElementById('cgpa-total-credits').textContent = totalCredits;
    document.getElementById('cgpa-semesters-count').textContent = validCount;
    document.getElementById('cgpa-percentage').textContent = pct + '%';
    document.getElementById('cgpa-progress').style.width = ((cgpa / scale) * 100) + '%';
    document.getElementById('cgpa-result').classList.add('show');

    saveHistory({ type: 'CGPA', label: validCount + ' Semesters', score: cgpa, credits: totalCredits, scale, pct });
    showToast('✓ CGPA calculated & saved');
  }

  function clearCGPA() {
    document.getElementById('cgpa-semesters').innerHTML = '';
    document.getElementById('cgpa-result').classList.remove('show');
    semesterCount = 0;
    for (let i = 0; i < 4; i++) addSemester();
  }

  // ─── CONVERTER ────────────────────────────────────────────────────────────
  function convertCGPA() {
    const cgpa = parseFloat(document.getElementById('conv-cgpa').value);
    if (isNaN(cgpa)) { document.getElementById('conv-result').textContent = ''; return; }
    const pct = (cgpa * 10) - 0.75;
    document.getElementById('conv-percent').value = pct.toFixed(2);
    document.getElementById('conv-result').textContent = \`\${cgpa} CGPA ≈ \${pct.toFixed(2)}% (10-point scale, formula: CGPA×10 − 0.75)\`;
  }

  function convertPercent() {
    const pct = parseFloat(document.getElementById('conv-percent').value);
    if (isNaN(pct)) { document.getElementById('conv-result').textContent = ''; return; }
    const cgpa = ((pct + 0.75) / 10).toFixed(2);
    document.getElementById('conv-cgpa').value = cgpa;
    document.getElementById('conv-result').textContent = \`\${pct}% ≈ \${cgpa} CGPA (10-point scale, formula: (% + 0.75) ÷ 10)\`;
  }

  // ─── GRADE TEXT ───────────────────────────────────────────────────────────
  function getGradeText(val, scale) {
    if (scale === 10) {
      if (val >= 9.5) return '🏆 OUTSTANDING — O';
      if (val >= 8.5) return '⭐ EXCELLENT — A+';
      if (val >= 7.5) return '✅ VERY GOOD — A';
      if (val >= 6.5) return '👍 GOOD — B+';
      if (val >= 5.5) return '📘 ABOVE AVERAGE — B';
      if (val >= 4.5) return '📗 AVERAGE — C';
      if (val >= 4.0) return '📙 PASS — D';
      return '❌ FAIL — F';
    } else {
      if (val >= 3.9) return '🏆 OUTSTANDING — A';
      if (val >= 3.5) return '⭐ EXCELLENT — A-';
      if (val >= 3.0) return '✅ VERY GOOD — B';
      if (val >= 2.5) return '📘 AVERAGE — C';
      if (val >= 2.0) return '📗 PASS — D';
      return '❌ FAIL — F';
    }
  }

  // ─── HISTORY ──────────────────────────────────────────────────────────────
  function saveHistory(item) {
    item.time = new Date().toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    history.unshift(item);
    if (history.length > 50) history.pop();
    localStorage.setItem('gradex-history', JSON.stringify(history));
  }

  function renderHistory() {
    const list = document.getElementById('history-list');
    if (history.length === 0) {
      list.innerHTML = '<li class="empty-state">NO HISTORY YET · CALCULATE SGPA OR CGPA FIRST</li>';
      return;
    }
    list.innerHTML = history.map((h, i) => \`
      <li class="history-item">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="history-type">\${h.type}</span>
          <span style="color:var(--text2);font-size:13px;">\${h.label}</span>
        </div>
        <div class="history-score">\${h.score}</div>
        <div class="history-info">\${h.credits} CR · Scale:\${h.scale} · \${h.time}</div>
        <button class="history-del" onclick="deleteHistory(\${i})" title="Delete">✕</button>
      </li>
    \`).join('');
  }

  function deleteHistory(i) {
    history.splice(i, 1);
    localStorage.setItem('gradex-history', JSON.stringify(history));
    renderHistory();
  }

  function clearHistory() {
    if (!confirm('Clear all history?')) return;
    history = [];
    localStorage.setItem('gradex-history', JSON.stringify(history));
    renderHistory();
    showToast('History cleared');
  }

  // ─── TOAST ────────────────────────────────────────────────────────────────
  function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.style.borderColor = isError ? '#ff5252' : 'var(--orange)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    // SGPA: default 5 subjects
    for (let i = 0; i < 5; i++) addSubject();
    // CGPA: default 4 semesters
    for (let i = 0; i < 4; i++) addSemester();
  }

  init();
</script>
</body>
</html>`;
