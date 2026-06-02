/* ============================================================
   HYPOTHESIS TESTING TOOL — main.js
   Global Economics · 11th Grade · Term 3 · C8 & C9
   ============================================================ */

"use strict";

/* ─────────────────────────────────────────────
   MATH UTILITIES
───────────────────────────────────────────── */

/** Standard-normal PDF  φ(z) */
function normalPDF(z) {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard-normal CDF  Φ(z)  using Hart approximation (accurate to ~7 digits).
 */
function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t * (0.319381530 +
      t * (-0.356563782 +
        t * (1.781477937 +
          t * (-1.821255978 +
            t * 1.330274429))));
  const p = 1 - normalPDF(z) * poly;
  return z >= 0 ? p : 1 - p;
}

/** Inverse-normal (quantile) using Beasley-Springer-Moro approximation */
function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [0, -3.969683028665376e1, 2.209460984245205e2,
    -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239];
  const b = [0, -5.447609879822406e1, 1.615858368580409e2,
    -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1,
    -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1,
    2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (pLow <= p && p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q/
           (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  } else if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/
             ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

/** Compute p-value given z and tail direction */
function computePValue(z, direction) {
  if (direction === "left")  return normalCDF(z);
  if (direction === "right") return 1 - normalCDF(z);
  return 2 * (1 - normalCDF(Math.abs(z)));
}

/** Critical value(s) given α and direction */
function criticalValues(alpha, direction) {
  if (direction === "left")  return [normalInv(alpha)];
  if (direction === "right") return [normalInv(1 - alpha)];
  return [normalInv(alpha / 2), normalInv(1 - alpha / 2)];
}

/* ─────────────────────────────────────────────
   CANVAS DRAWING
───────────────────────────────────────────── */

/**
 * Draw the normal curve, shaded p-value region,
 * critical line(s), and z marker on a given canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} z        observed test statistic
 * @param {number} alpha    significance level
 * @param {string} dir      'left' | 'right' | 'two'
 * @param {number} pval     pre-computed p-value
 */
function drawCurve(canvas, z, alpha, dir, pval) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#151820";
  ctx.fillRect(0, 0, W, H);

  const PAD = { left: 30, right: 30, top: 28, bottom: 44 };
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;

  const zMin = -4, zMax = 4;

  // Map z-score → x pixel
  function toX(zv) { return PAD.left + ((zv - zMin) / (zMax - zMin)) * gW; }
  // Map density → y pixel
  function toY(y)  { return PAD.top + gH - y * gH * 2.8; }

  const STEPS = 300;

  // ── Shade p-value region ──
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= STEPS; i++) {
    const zv = zMin + (zMax - zMin) * (i / STEPS);
    let shade = false;
    if (dir === "left"  && zv <= z)        shade = true;
    if (dir === "right" && zv >= z)        shade = true;
    if (dir === "two"   && Math.abs(zv) >= Math.abs(z)) shade = true;
    if (!shade) continue;
    const x = toX(zv);
    const y = toY(normalPDF(zv));
    if (!started) { ctx.moveTo(x, toY(0)); ctx.lineTo(x, y); started = true; }
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(toX(dir === "left" ? z : (dir === "right" ? z : Math.abs(z))), toY(0));
  if (dir === "two") {
    // mirror side
    ctx.moveTo(toX(-Math.abs(z)), toY(0));
    let s2 = false;
    for (let i = 0; i <= STEPS; i++) {
      const zv = zMin + (zMax - zMin) * (i / STEPS);
      if (zv < -Math.abs(z)) {
        const x = toX(zv); const y = toY(normalPDF(zv));
        if (!s2) { ctx.moveTo(x, toY(0)); ctx.lineTo(x, y); s2 = true; }
        else ctx.lineTo(x, y);
      }
    }
    ctx.lineTo(toX(-Math.abs(z)), toY(0));
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(240,90,120,0.38)";
  ctx.fill();

  // ── Normal curve ──
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const zv = zMin + (zMax - zMin) * (i / STEPS);
    const x = toX(zv), y = toY(normalPDF(zv));
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#4af0c0";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // ── Axis ──
  const baseY = toY(0);
  ctx.beginPath();
  ctx.moveTo(PAD.left, baseY);
  ctx.lineTo(W - PAD.right, baseY);
  ctx.strokeStyle = "#2a2f42";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Critical value line(s) ──
  const cvs = criticalValues(alpha, dir);
  cvs.forEach(cv => {
    const cx = toX(cv);
    ctx.beginPath();
    ctx.moveTo(cx, PAD.top);
    ctx.lineTo(cx, baseY);
    ctx.strokeStyle = "rgba(240,192,64,0.9)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f0c040";
    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("z_c=" + cv.toFixed(2), cx, PAD.top - 6);
  });

  // ── z statistic line ──
  const zx = toX(Math.max(zMin + 0.1, Math.min(zMax - 0.1, z)));
  ctx.beginPath();
  ctx.moveTo(zx, PAD.top + 4);
  ctx.lineTo(zx, baseY);
  ctx.strokeStyle = "#f05a78";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f05a78";
  ctx.font = "bold 11px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("z=" + z.toFixed(3), zx, PAD.top + 16);

  // ── Tick marks ──
  [-3,-2,-1,0,1,2,3].forEach(t => {
    const tx = toX(t);
    ctx.beginPath(); ctx.moveTo(tx, baseY); ctx.lineTo(tx, baseY + 4);
    ctx.strokeStyle = "#3a3f52"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#7a839a"; ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(t, tx, baseY + 16);
  });

  // ── p-value label ──
  ctx.fillStyle = "#f05a78";
  ctx.font = "bold 12px 'IBM Plex Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("p=" + pval.toFixed(5), W - PAD.right, H - 8);

  // ── Direction label ──
  ctx.fillStyle = "#7a839a";
  ctx.font = "10px 'IBM Plex Mono', monospace";
  ctx.textAlign = "left";
  const dirLabel = dir === "left" ? "Left-tailed" : dir === "right" ? "Right-tailed" : "Two-tailed";
  ctx.fillText(dirLabel, PAD.left, H - 8);
}

/* ─────────────────────────────────────────────
   DECISION & CONCLUSION TEXT
───────────────────────────────────────────── */

function decisionText(pval, alpha) {
  return pval < alpha
    ? "✕  REJECT H₀  (p < α)"
    : "✓  FAIL TO REJECT H₀  (p ≥ α)";
}

function conclusionText(pval, alpha, dir, mode) {
  const reject = pval < alpha;
  if (mode === "mean") {
    return reject
      ? `There is sufficient statistical evidence at the α = ${alpha} level to conclude that the true population mean differs from the benchmark in the ${dir}-tailed direction.`
      : `There is insufficient statistical evidence at the α = ${alpha} level to conclude that the true population mean differs from the benchmark. The null hypothesis is retained.`;
  } else {
    return reject
      ? `There is sufficient statistical evidence at the α = ${alpha} level to conclude that the true population proportion differs from the benchmark in the ${dir}-tailed direction.`
      : `There is insufficient statistical evidence at the α = ${alpha} level to conclude that the true population proportion differs from the benchmark. The null hypothesis is retained.`;
  }
}

function errorText(pval, alpha) {
  const reject = pval < alpha;
  if (reject) {
    return "Since H₀ is rejected, a Type I Error (false positive) may have occurred — the null hypothesis might actually be true. The probability of this error equals α. A Type II Error is not applicable here since H₀ was rejected.";
  } else {
    return "Since H₀ was not rejected, a Type II Error (false negative) may have occurred — the alternative hypothesis might actually be true. The probability of this error is β (not α). A Type I Error is not applicable here since H₀ was retained.";
  }
}

/* ─────────────────────────────────────────────
   C8 — MANUAL MODE
───────────────────────────────────────────── */

const c8 = {
  mode: "mean",
  direction: "left",
  alpha: 0.05
};

function c8Compute() {
  const dir   = c8.direction;
  const alpha = c8.alpha;
  let z, mode;

  if (c8.mode === "mean") {
    mode = "mean";
    const mu0   = parseFloat(document.getElementById("mu0-input").value)  || 0;
    const xbar  = parseFloat(document.getElementById("xbar-input").value) || 0;
    const sigma = parseFloat(document.getElementById("sigma-input").value)|| 1;
    const n     = parseInt(document.getElementById("n-input-mean").value) || 1;
    z = (xbar - mu0) / (sigma / Math.sqrt(n));
  } else {
    mode = "proportion";
    const p0   = parseFloat(document.getElementById("p0-input").value)   || 0.5;
    const phat = parseFloat(document.getElementById("phat-input").value) || 0.5;
    const n    = parseInt(document.getElementById("n-input-prop").value) || 1;
    const se   = Math.sqrt(p0 * (1 - p0) / n);
    z = se === 0 ? 0 : (phat - p0) / se;
  }

  if (!isFinite(z)) z = 0;
  const pval = computePValue(z, dir);
  const cvs  = criticalValues(alpha, dir);

  drawCurve(document.getElementById("c8-canvas"), z, alpha, dir, pval);

  document.getElementById("c8-z").textContent    = z.toFixed(4);
  document.getElementById("c8-pval").textContent = pval.toFixed(5);
  document.getElementById("c8-crit").textContent = cvs.map(v=>v.toFixed(3)).join(", ");
  document.getElementById("c8-alpha-disp").textContent = alpha.toFixed(2);

  const decEl = document.getElementById("c8-decision");
  decEl.textContent = decisionText(pval, alpha);
  decEl.className = "decision-box " + (pval < alpha ? "reject" : "fail");

  document.getElementById("c8-conclusion").textContent = conclusionText(pval, alpha, dir, mode);
  document.getElementById("c8-error-text").textContent = errorText(pval, alpha);
}

function syncSliderInput(sliderId, inputId, cb) {
  const slider = document.getElementById(sliderId);
  const input  = document.getElementById(inputId);
  slider.addEventListener("input", () => { input.value = slider.value; cb(); });
  input.addEventListener("input", () => { slider.value = input.value; cb(); });
}

function initC8() {
  // Mode toggle
  document.getElementById("c8-mode").addEventListener("click", e => {
    if (!e.target.matches(".mode-btn")) return;
    document.querySelectorAll("#c8-mode .mode-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    c8.mode = e.target.dataset.mode;
    document.getElementById("mean-params").style.display       = c8.mode === "mean" ? "" : "none";
    document.getElementById("proportion-params").style.display = c8.mode === "proportion" ? "" : "none";
    c8Compute();
  });

  // Direction toggle
  document.getElementById("c8-direction").addEventListener("click", e => {
    if (!e.target.matches(".dir-btn")) return;
    document.querySelectorAll("#c8-direction .dir-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    c8.direction = e.target.dataset.dir;
    c8Compute();
  });

  // Alpha
  syncSliderInput("alpha-slider", "alpha-input", () => {
    c8.alpha = parseFloat(document.getElementById("alpha-input").value);
    c8Compute();
  });

  // Mean params
  ["mu0","xbar","sigma"].forEach(id => syncSliderInput(id+"-slider", id+"-input", c8Compute));
  syncSliderInput("n-slider-mean", "n-input-mean", c8Compute);

  // Proportion params
  ["p0","phat"].forEach(id => syncSliderInput(id+"-slider", id+"-input", c8Compute));
  syncSliderInput("n-slider-prop", "n-input-prop", c8Compute);

  c8Compute();
}

/* ─────────────────────────────────────────────
   C9 — CSV MODE
───────────────────────────────────────────── */

let csvData = null;  // array of row objects
let csvHeaders = [];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

function populateSelect(id, options) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";
  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = el.textContent = opt;
    sel.appendChild(el);
  });
}

function getGroups(rows, groupCol) {
  return [...new Set(rows.map(r => r[groupCol]))].filter(Boolean);
}

function isNumericColumn(rows, col) {
  return rows.every(r => r[col] !== "" && !isNaN(parseFloat(r[col])));
}

function isBinaryColumn(rows, col) {
  const vals = [...new Set(rows.map(r => r[col]))];
  return vals.every(v => v === "0" || v === "1");
}

function updateCSVConfig() {
  const groupCol = document.getElementById("group-col-select").value;
  const valueCol = document.getElementById("value-col-select").value;
  if (!csvData || !groupCol || !valueCol) return;

  const groups = getGroups(csvData, groupCol);
  populateSelect("bench-group-select", groups);
  populateSelect("test-group-select",  groups);
  // Default: bench = first, test = second
  if (groups.length >= 2) {
    document.getElementById("bench-group-select").value = groups[0];
    document.getElementById("test-group-select").value  = groups[1];
  }

  const isNum  = isNumericColumn(csvData, valueCol);
  const isBin  = isBinaryColumn(csvData, valueCol);
  const type   = isBin ? "Proportions (binary)" : isNum ? "Means (numeric)" : "Unknown";
  document.getElementById("detected-type").textContent = type;

  // Summary table
  const summary = {};
  groups.forEach(g => {
    const vals = csvData.filter(r => r[groupCol] === g).map(r => parseFloat(r[valueCol]));
    const n = vals.length;
    const mean = vals.reduce((a,b)=>a+b,0)/n;
    const sd   = Math.sqrt(vals.reduce((s,v)=>s+(v-mean)**2,0)/(n-1));
    const successes = vals.filter(v=>v===1).length;
    summary[g] = { n, mean, sd, successes };
  });

  let html = "<table><tr><th>Group</th><th>n</th><th>Mean/Prop</th><th>SD</th></tr>";
  Object.entries(summary).forEach(([g,s]) => {
    const disp = isBin ? (s.successes/s.n).toFixed(3) : s.mean.toFixed(3);
    const sdDisp = isBin ? "—" : s.sd.toFixed(3);
    html += `<tr><td>${g}</td><td>${s.n}</td><td>${disp}</td><td>${sdDisp}</td></tr>`;
  });
  html += "</table>";
  document.getElementById("csv-summary").innerHTML = html;
}

function runCSVTest() {
  if (!csvData) return;
  const groupCol  = document.getElementById("group-col-select").value;
  const valueCol  = document.getElementById("value-col-select").value;
  const benchGrp  = document.getElementById("bench-group-select").value;
  const testGrp   = document.getElementById("test-group-select").value;
  const dir       = document.querySelector("#c9-direction .dir-btn.active").dataset.dir;
  const alpha     = parseFloat(document.getElementById("c9-alpha-input").value);

  const benchVals = csvData.filter(r=>r[groupCol]===benchGrp).map(r=>parseFloat(r[valueCol]));
  const testVals  = csvData.filter(r=>r[groupCol]===testGrp).map(r=>parseFloat(r[valueCol]));

  const nB = benchVals.length, nT = testVals.length;
  const isBin = isBinaryColumn(csvData, valueCol);
  let z, mode;

  if (isBin) {
    mode = "proportion";
    const pB = benchVals.filter(v=>v===1).length / nB;
    const pT = testVals.filter(v=>v===1).length / nT;
    const pooled = (benchVals.filter(v=>v===1).length + testVals.filter(v=>v===1).length) / (nB+nT);
    const se = Math.sqrt(pooled*(1-pooled)*(1/nB+1/nT));
    z = se === 0 ? 0 : (pT - pB) / se;
  } else {
    mode = "mean";
    const meanB = benchVals.reduce((a,b)=>a+b,0)/nB;
    const meanT = testVals.reduce((a,b)=>a+b,0)/nT;
    const varB  = benchVals.reduce((s,v)=>s+(v-meanB)**2,0)/(nB-1);
    const varT  = testVals.reduce((s,v)=>s+(v-meanT)**2,0)/(nT-1);
    const se    = Math.sqrt(varB/nB + varT/nT);
    z = se === 0 ? 0 : (meanT - meanB) / se;
  }

  if (!isFinite(z)) z = 0;
  const pval = computePValue(z, dir);
  const cvs  = criticalValues(alpha, dir);

  drawCurve(document.getElementById("c9-canvas"), z, alpha, dir, pval);

  document.getElementById("c9-z").textContent     = z.toFixed(4);
  document.getElementById("c9-pval").textContent  = pval.toFixed(5);
  document.getElementById("c9-crit").textContent  = cvs.map(v=>v.toFixed(3)).join(", ");
  document.getElementById("c9-alpha-disp").textContent = alpha.toFixed(2);

  const decEl = document.getElementById("c9-decision");
  decEl.textContent = decisionText(pval, alpha);
  decEl.className = "decision-box " + (pval < alpha ? "reject" : "fail");

  document.getElementById("c9-conclusion").textContent = conclusionText(pval, alpha, dir, mode);
}

function initC9() {
  document.getElementById("csv-file-input").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById("upload-label").textContent = "📄  " + file.name;
    const reader = new FileReader();
    reader.onload = ev => {
      const { headers, rows } = parseCSV(ev.target.result);
      if (headers.length < 2) { alert("CSV must have at least 2 columns."); return; }
      csvData    = rows;
      csvHeaders = headers;

      populateSelect("group-col-select",  headers);
      populateSelect("value-col-select",  headers);

      // Auto-detect: pick first non-numeric as group, first numeric as value
      const numCols = headers.filter(h => isNumericColumn(rows, h));
      const catCols = headers.filter(h => !isNumericColumn(rows, h));
      if (catCols.length)  document.getElementById("group-col-select").value = catCols[0];
      if (numCols.length)  document.getElementById("value-col-select").value = numCols[0];

      document.getElementById("csv-config").style.display = "";
      updateCSVConfig();
    };
    reader.readAsText(file);
  });

  document.getElementById("group-col-select").addEventListener("change", updateCSVConfig);
  document.getElementById("value-col-select").addEventListener("change", updateCSVConfig);

  // Direction
  document.getElementById("c9-direction").addEventListener("click", e => {
    if (!e.target.matches(".dir-btn")) return;
    document.querySelectorAll("#c9-direction .dir-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
  });

  // Alpha sync
  const c9AlphaSlider = document.getElementById("c9-alpha-slider");
  const c9AlphaInput  = document.getElementById("c9-alpha-input");
  c9AlphaSlider.addEventListener("input", () => { c9AlphaInput.value = c9AlphaSlider.value; });
  c9AlphaInput.addEventListener("input", () => { c9AlphaSlider.value = c9AlphaInput.value; });

  document.getElementById("run-csv-btn").addEventListener("click", runCSVTest);
}

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "c8") c8Compute(); // re-render canvas on switch
    });
  });
}

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initC8();
  initC9();
});
