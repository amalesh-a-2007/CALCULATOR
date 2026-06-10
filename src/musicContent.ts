export const musicHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>RhythmWealth — Finance & Music Calculator</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --wood-dark:   #2C1A0E;
    --wood-mid:    #5C3317;
    --wood-warm:   #8B4513;
    --wood-light:  #C68642;
    --wood-pale:   #E8C49A;
    --wood-cream:  #F5ECD7;
    --black:       #0D0D0D;
    --white:       #FDFAF5;
    --gray:        #7A7065;
    --border:      rgba(139,69,19,0.25);
  }

  html { font-size: 16px; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--wood-dark);
    color: var(--wood-cream);
    min-height: 100vh;
  }

  /* ── Header ── */
  header {
    background: var(--black);
    border-bottom: 2px solid var(--wood-warm);
    padding: 1rem 1.5rem 1rem 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .logo {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 700;
    color: var(--wood-light);
    letter-spacing: 0.02em;
  }
  .logo span { color: var(--white); }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 6px;
    background: var(--wood-dark);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px;
  }
  .tab-btn {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--wood-pale);
    cursor: pointer;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: background 0.2s, color 0.2s;
  }
  .tab-btn.active {
    background: var(--wood-warm);
    color: var(--white);
  }

  /* ── Main layout ── */
  main { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }

  .panel { display: none; }
  .panel.active { display: block; }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.3rem, 3.5vw, 1.9rem);
    font-weight: 500;
    color: var(--wood-light);
    margin-bottom: 0.25rem;
  }
  .page-sub {
    font-size: 0.85rem;
    color: var(--wood-pale);
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }

  /* ── Card ── */
  .card {
    background: var(--black);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
  }

  /* ── Two-col grid ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }
  @media (max-width: 680px) { .two-col { grid-template-columns: 1fr; } }

  /* ── Mode selector ── */
  .mode-row {
    display: flex;
    gap: 8px;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }
  .mode-btn {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 7px 20px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--wood-pale);
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }
  .mode-btn.active { background: var(--wood-mid); border-color: var(--wood-warm); color: var(--white); }

  /* ── Form elements ── */
  .field { margin-bottom: 1rem; }
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--wood-pale);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  input[type="number"], input[type="range"], select {
    width: 100%;
    background: var(--wood-dark);
    border: 1px solid var(--border);
    border-radius: 7px;
    color: var(--white);
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="number"]:focus, select:focus { border-color: var(--wood-warm); }
  select option { background: var(--wood-dark); color: var(--white); }

  input[type="range"] {
    padding: 0;
    height: 5px;
    border-radius: 99px;
    cursor: pointer;
    accent-color: var(--wood-warm);
    background: linear-gradient(to right, var(--wood-warm) 0%, var(--wood-dark) 0%);
  }
  .range-row { display: flex; align-items: center; gap: 10px; }
  .range-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--wood-light);
    min-width: 48px;
    text-align: right;
    white-space: nowrap;
  }

  /* ── Calc Button ── */
  .calc-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: var(--wood-warm);
    color: var(--white);
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-top: 0.5rem;
  }
  .calc-btn:hover { background: var(--wood-mid); }
  .calc-btn:active { transform: scale(0.98); }

  /* ── Results ── */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin-bottom: 1.25rem;
  }
  .result-card {
    background: var(--wood-dark);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    text-align: center;
  }
  .result-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--wood-pale);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
    opacity: 0.85;
  }
  .result-val {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    font-weight: 700;
    color: var(--wood-light);
    line-height: 1.2;
  }

  /* ── Chart container ── */
  .chart-wrap {
    position: relative;
    background: var(--wood-dark);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    margin-top: 1rem;
  }
  .chart-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--wood-pale);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    opacity: 0.8;
  }
  canvas { width: 100% !important; }

  /* ── BPM Pulse ── */
  .bpm-beat {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: var(--wood-warm);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    margin: 0 auto 1rem;
    transition: transform 0.05s;
  }
  .bpm-beat.pulse { animation: beat 0.1s ease-out; }
  @keyframes beat { 0%{transform:scale(1)} 40%{transform:scale(1.25)} 100%{transform:scale(1)} }

  .tempo-label {
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    color: var(--wood-light);
    margin-bottom: 1.25rem;
    letter-spacing: 0.05em;
  }

  /* ── Music table ── */
  .music-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  .music-table th {
    text-align: left;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--wood-pale);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
    opacity: 0.85;
  }
  .music-table td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(139,69,19,0.1);
    color: var(--wood-cream);
  }
  .music-table td:last-child { color: var(--wood-light); font-weight: 600; font-family: 'Playfair Display', serif; }
  .music-table tr:last-child td { border-bottom: none; }

  /* ── Tap BPM ── */
  .tap-btn {
    width: 100%;
    height: 80px;
    background: var(--wood-dark);
    border: 2px dashed var(--wood-warm);
    border-radius: 12px;
    color: var(--wood-light);
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s;
    letter-spacing: 0.05em;
  }
  .tap-btn:active { background: var(--wood-mid); }

  /* ── Divider ── */
  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1rem 0;
  }

  .section-title {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--wood-pale);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    opacity: 0.8;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--wood-dark); }
  ::-webkit-scrollbar-thumb { background: var(--wood-mid); border-radius: 99px; }
</style>
</head>
<body>

<header>
  <div class="logo">Rhythm<span>Wealth</span></div>
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('finance', this)">Finance</button>
    <button class="tab-btn" onclick="switchTab('music', this)">Music BPM</button>
  </div>
</header>

<main>

  <!-- ═══ FINANCE PANEL ═══ -->
  <div class="panel active" id="panel-finance">
    <h1 class="page-title">Finance Calculator</h1>
    <p class="page-sub">Visualize your SIP wealth growth or EMI repayment schedule</p>

    <div class="two-col">
      <!-- Input card -->
      <div class="card">
        <div class="mode-row">
          <button class="mode-btn active" id="sip-btn" onclick="setFinMode('sip')">SIP</button>
          <button class="mode-btn" id="emi-btn" onclick="setFinMode('emi')">EMI Loan</button>
        </div>

        <!-- SIP fields -->
        <div id="sip-fields">
          <div class="field">
            <label>Monthly Investment (₹)</label>
            <input type="number" id="sip-amount" value="5000" min="100" />
          </div>
          <div class="field">
            <label>Annual Return Rate</label>
            <div class="range-row">
              <input type="range" id="sip-rate" min="1" max="30" value="12" step="0.5" oninput="syncRange('sip-rate','sip-rate-val','%')" />
              <span class="range-val" id="sip-rate-val">12%</span>
            </div>
          </div>
          <div class="field">
            <label>Duration (Years)</label>
            <div class="range-row">
              <input type="range" id="sip-years" min="1" max="40" value="10" oninput="syncRange('sip-years','sip-years-val',' yr')" />
              <span class="range-val" id="sip-years-val">10 yr</span>
            </div>
          </div>
        </div>

        <!-- EMI fields -->
        <div id="emi-fields" style="display:none">
          <div class="field">
            <label>Loan Amount (₹)</label>
            <input type="number" id="emi-principal" value="500000" min="1000" />
          </div>
          <div class="field">
            <label>Annual Interest Rate</label>
            <div class="range-row">
              <input type="range" id="emi-rate" min="1" max="24" value="8.5" step="0.1" oninput="syncRange('emi-rate','emi-rate-val','%')" />
              <span class="range-val" id="emi-rate-val">8.5%</span>
            </div>
          </div>
          <div class="field">
            <label>Tenure (Years)</label>
            <div class="range-row">
              <input type="range" id="emi-years" min="1" max="30" value="10" oninput="syncRange('emi-years','emi-years-val',' yr')" />
              <span class="range-val" id="emi-years-val">10 yr</span>
            </div>
          </div>
        </div>

        <button class="calc-btn" onclick="calcFinance()">Calculate</button>
      </div>

      <!-- Results card -->
      <div class="card" id="fin-results">
        <div class="section-title" id="fin-result-title">SIP Growth Results</div>
        <div class="results-grid" id="fin-result-grid">
          <div class="result-card"><div class="result-label">Total Invested</div><div class="result-val" id="r-invested">—</div></div>
          <div class="result-card"><div class="result-label" id="r-gain-label">Est. Returns</div><div class="result-val" id="r-gain">—</div></div>
          <div class="result-card"><div class="result-label" id="r-total-label">Maturity Value</div><div class="result-val" id="r-total">—</div></div>
          <div class="result-card"><div class="result-label" id="r-extra-label">Monthly SIP</div><div class="result-val" id="r-extra">—</div></div>
        </div>

        <div class="chart-wrap">
          <div class="chart-label" id="chart-label-text">Wealth growth over time</div>
          <canvas id="finChart" height="180"></canvas>
        </div>
      </div>
    </div>
  </div><!-- /finance -->


  <!-- ═══ MUSIC PANEL ═══ -->
  <div class="panel" id="panel-music">
    <h1 class="page-title">BPM & Music Math</h1>
    <p class="page-sub">Calculate delay times, note values, and tempo — for producers & musicians</p>

    <div class="two-col">
      <!-- Input card -->
      <div class="card">
        <div class="bpm-beat" id="beatDot">♩</div>
        <div class="tempo-label" id="tempo-name">Moderato</div>

        <div class="field">
          <label>BPM (Beats Per Minute)</label>
          <div class="range-row">
            <input type="range" id="bpm-slider" min="40" max="220" value="120" oninput="syncBPM()" />
            <span class="range-val" id="bpm-disp">120</span>
          </div>
        </div>

        <div class="field">
          <label>Or enter manually</label>
          <input type="number" id="bpm-input" value="120" min="20" max="300" oninput="manualBPM()" />
        </div>

        <button class="tap-btn" id="tap-area" onclick="tapBPM()">Tap to detect BPM</button>
        <div style="text-align:center; font-size:0.75rem; color:var(--wood-pale); margin-top:6px; opacity:0.7">Tap at least 4 times in rhythm</div>

        <hr class="divider" />

        <div class="field">
          <label>Time Signature</label>
          <select id="time-sig">
            <option value="4">4/4</option>
            <option value="3">3/4</option>
            <option value="6">6/8</option>
            <option value="2">2/4</option>
          </select>
        </div>

        <button class="calc-btn" onclick="calcMusic()">Calculate Delays</button>
      </div>

      <!-- Results -->
      <div class="card">
        <div class="section-title">Note Delay Times (ms)</div>

        <table class="music-table" id="music-table">
          <thead>
            <tr>
              <th>Note Value</th>
              <th>Straight</th>
              <th>Dotted</th>
              <th>Triplet</th>
            </tr>
          </thead>
          <tbody id="music-tbody">
            <tr><td colspan="4" style="text-align:center;opacity:0.5;padding:1.5rem">Hit Calculate to see delay times</td></tr>
          </tbody>
        </table>

        <hr class="divider" />

        <div class="results-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="result-card">
            <div class="result-label">Beat Duration</div>
            <div class="result-val" id="beat-ms">—</div>
          </div>
          <div class="result-card">
            <div class="result-label">Bar Duration</div>
            <div class="result-val" id="bar-ms">—</div>
          </div>
          <div class="result-card">
            <div class="result-label">Tempo Range</div>
            <div class="result-val" id="tempo-range" style="font-size:0.85rem;">—</div>
          </div>
          <div class="result-card">
            <div class="result-label">Beats/Min</div>
            <div class="result-val" id="beats-min">—</div>
          </div>
        </div>
      </div>
    </div>
  </div><!-- /music -->

</main>

<script>
/* ══════════════ TAB SWITCHING ══════════════ */
function switchTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');
}

/* ══════════════ RANGE SYNC ══════════════ */
function syncRange(id, displayId, suffix) {
  const v = document.getElementById(id).value;
  document.getElementById(displayId).textContent = parseFloat(v) + suffix;
  updateRangeTrack(id);
}
function updateRangeTrack(id) {
  const el = document.getElementById(id);
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.background = \`linear-gradient(to right, #8B4513 \${pct}%, #2C1A0E \${pct}%)\`;
}
document.querySelectorAll('input[type="range"]').forEach(el => updateRangeTrack(el.id));

/* ══════════════ FINANCE MODE ══════════════ */
let finMode = 'sip';
let finChart = null;

function setFinMode(m) {
  finMode = m;
  document.getElementById('sip-fields').style.display = m === 'sip' ? '' : 'none';
  document.getElementById('emi-fields').style.display = m === 'emi' ? '' : 'none';
  document.getElementById('sip-btn').classList.toggle('active', m === 'sip');
  document.getElementById('emi-btn').classList.toggle('active', m === 'emi');
}

function fmt(n) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function calcFinance() {
  if (finMode === 'sip') calcSIP();
  else calcEMI();
}

function calcSIP() {
  const P = parseFloat(document.getElementById('sip-amount').value) || 5000;
  const r = parseFloat(document.getElementById('sip-rate').value) / 100 / 12;
  const n = parseInt(document.getElementById('sip-years').value) * 12;
  const invested = P * n;
  const maturity = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const gains = maturity - invested;

  document.getElementById('fin-result-title').textContent = 'SIP Growth Results';
  document.getElementById('r-invested').textContent = fmt(invested);
  document.getElementById('r-gain-label').textContent = 'Est. Returns';
  document.getElementById('r-gain').textContent = fmt(gains);
  document.getElementById('r-total-label').textContent = 'Maturity Value';
  document.getElementById('r-total').textContent = fmt(maturity);
  document.getElementById('r-extra-label').textContent = 'Monthly SIP';
  document.getElementById('r-extra').textContent = fmt(P);
  document.getElementById('chart-label-text').textContent = 'Wealth growth over years';

  // Chart data year-by-year
  const labels = [], invested_d = [], wealth_d = [];
  const yrs = parseInt(document.getElementById('sip-years').value);
  for (let y = 1; y <= yrs; y++) {
    const months = y * 12;
    const inv = P * months;
    const val = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    labels.push('Y' + y);
    invested_d.push(Math.round(inv));
    wealth_d.push(Math.round(val));
  }
  drawChart(labels, invested_d, wealth_d, 'Invested', 'Maturity Value');
}

function calcEMI() {
  const P = parseFloat(document.getElementById('emi-principal').value) || 500000;
  const r = parseFloat(document.getElementById('emi-rate').value) / 100 / 12;
  const n = parseInt(document.getElementById('emi-years').value) * 12;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - P;

  document.getElementById('fin-result-title').textContent = 'EMI Loan Results';
  document.getElementById('r-invested').textContent = fmt(P);
  document.getElementById('r-gain-label').textContent = 'Total Interest';
  document.getElementById('r-gain').textContent = fmt(interest);
  document.getElementById('r-total-label').textContent = 'Total Payment';
  document.getElementById('r-total').textContent = fmt(total);
  document.getElementById('r-extra-label').textContent = 'Monthly EMI';
  document.getElementById('r-extra').textContent = fmt(emi);
  document.getElementById('chart-label-text').textContent = 'Remaining balance over years';

  const labels = [], balance_d = [], paid_d = [];
  const yrs = parseInt(document.getElementById('emi-years').value);
  let bal = P;
  for (let y = 1; y <= yrs; y++) {
    for (let m = 0; m < 12; m++) {
      const intPart = bal * r;
      const prinPart = emi - intPart;
      bal = Math.max(0, bal - prinPart);
    }
    labels.push('Y' + y);
    balance_d.push(Math.round(bal));
    paid_d.push(Math.round(P - bal));
  }
  drawChart(labels, paid_d, balance_d, 'Principal Paid', 'Balance');
}

function drawChart(labels, d1, d2, l1, l2) {
  const ctx = document.getElementById('finChart').getContext('2d');
  if (finChart) finChart.destroy();
  finChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: l1, data: d1, borderColor: '#C68642', backgroundColor: 'rgba(198,134,66,0.12)', borderWidth: 2, pointRadius: 2, tension: 0.4, fill: true },
        { label: l2, data: d2, borderColor: '#FDFAF5', backgroundColor: 'rgba(253,250,245,0.07)', borderWidth: 2, pointRadius: 2, tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 600 },
      plugins: {
        legend: { labels: { color: '#E8C49A', font: { size: 11 }, boxWidth: 12, padding: 12 } },
        tooltip: {
          backgroundColor: '#0D0D0D',
          borderColor: '#5C3317',
          borderWidth: 1,
          titleColor: '#C68642',
          bodyColor: '#E8C49A',
          callbacks: {
            label: ctx => ' ' + ctx.dataset.label + ': ₹' + ctx.parsed.y.toLocaleString('en-IN')
          }
        }
      },
      scales: {
        x: { ticks: { color: '#C68642', font: { size: 10 } }, grid: { color: 'rgba(139,69,19,0.15)' } },
        y: {
          ticks: { color: '#C68642', font: { size: 10 }, callback: v => v >= 1e5 ? '₹' + (v / 1e5).toFixed(0) + 'L' : '₹' + v },
          grid: { color: 'rgba(139,69,19,0.15)' }
        }
      }
    }
  });
}

/* ══════════════ MUSIC / BPM ══════════════ */
let tapTimes = [];
let beatInterval = null;

const tempos = [
  { max: 60, name: 'Larghissimo', range: '< 60' },
  { max: 66, name: 'Largo', range: '40–66' },
  { max: 76, name: 'Larghetto', range: '60–76' },
  { max: 108, name: 'Andante', range: '76–108' },
  { max: 120, name: 'Moderato', range: '108–120' },
  { max: 156, name: 'Allegro', range: '120–156' },
  { max: 176, name: 'Vivace', range: '156–176' },
  { max: 200, name: 'Presto', range: '176–200' },
  { max: 999, name: 'Prestissimo', range: '> 200' }
];

function getTempoInfo(bpm) {
  return tempos.find(t => bpm <= t.max) || tempos[tempos.length - 1];
}

function syncBPM() {
  const v = parseInt(document.getElementById('bpm-slider').value);
  document.getElementById('bpm-disp').textContent = v;
  document.getElementById('bpm-input').value = v;
  updateRangeTrack('bpm-slider');
  const t = getTempoInfo(v);
  document.getElementById('tempo-name').textContent = t.name;
  startBeatAnim(v);
}

function manualBPM() {
  let v = parseInt(document.getElementById('bpm-input').value) || 120;
  v = Math.min(300, Math.max(20, v));
  const sl = document.getElementById('bpm-slider');
  sl.value = Math.min(220, Math.max(40, v));
  document.getElementById('bpm-disp').textContent = v;
  updateRangeTrack('bpm-slider');
  const t = getTempoInfo(v);
  document.getElementById('tempo-name').textContent = t.name;
  startBeatAnim(v);
}

function startBeatAnim(bpm) {
  if (beatInterval) clearInterval(beatInterval);
  const dot = document.getElementById('beatDot');
  beatInterval = setInterval(() => {
    dot.classList.remove('pulse');
    void dot.offsetWidth;
    dot.classList.add('pulse');
  }, 60000 / bpm);
}

function tapBPM() {
  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 8) tapTimes.shift();
  if (tapTimes.length >= 2) {
    const diffs = [];
    for (let i = 1; i < tapTimes.length; i++) diffs.push(tapTimes[i] - tapTimes[i - 1]);
    const avg = diffs.reduce((a, b) => a + b) / diffs.length;
    const bpm = Math.round(60000 / avg);
    const clamped = Math.min(220, Math.max(40, bpm));
    document.getElementById('bpm-slider').value = clamped;
    document.getElementById('bpm-input').value = bpm;
    document.getElementById('bpm-disp').textContent = bpm;
    updateRangeTrack('bpm-slider');
    const t = getTempoInfo(bpm);
    document.getElementById('tempo-name').textContent = t.name + ' (' + bpm + ' BPM)';
    startBeatAnim(bpm);
  }
  // Reset if idle > 2s
  clearTimeout(window._tapReset);
  window._tapReset = setTimeout(() => tapTimes = [], 2500);
}

function calcMusic() {
  const bpm = parseFloat(document.getElementById('bpm-input').value) || 120;
  const timeSig = parseInt(document.getElementById('time-sig').value);
  const beatMs = 60000 / bpm;
  const barMs = beatMs * timeSig;

  document.getElementById('beat-ms').textContent = beatMs.toFixed(1) + ' ms';
  document.getElementById('bar-ms').textContent = (barMs / 1000).toFixed(3) + ' s';
  document.getElementById('beats-min').textContent = Math.round(bpm);
  const t = getTempoInfo(bpm);
  document.getElementById('tempo-range').textContent = t.name;

  const notes = [
    { name: 'Whole note', mult: 4 },
    { name: 'Half note', mult: 2 },
    { name: 'Quarter note', mult: 1 },
    { name: '8th note', mult: 0.5 },
    { name: '16th note', mult: 0.25 },
    { name: '32nd note', mult: 0.125 },
  ];

  const tbody = document.getElementById('music-tbody');
  tbody.innerHTML = '';
  notes.forEach(n => {
    const straight = beatMs * n.mult;
    const dotted = straight * 1.5;
    const triplet = straight * (2 / 3);
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td>\${n.name}</td>
      <td>\${fmtMs(straight)}</td>
      <td>\${fmtMs(dotted)}</td>
      <td>\${fmtMs(triplet)}</td>
    \`;
    tbody.appendChild(tr);
  });
}

function fmtMs(ms) {
  return ms >= 1000 ? (ms / 1000).toFixed(3) + ' s' : Math.round(ms) + ' ms';
}

/* Init */
syncBPM();
calcSIP();
calcMusic();
</script>
</body>
</html>
`;
