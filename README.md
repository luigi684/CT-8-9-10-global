# Hypothesis Testing Tool — C8 & C9

**Global Economics · Grade 11 · Term 3 · Learning Evidence 4**

## How to Open the Webpage

### Option A — Locally (no internet required)
1. Download or clone this repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. No server required — all logic runs client-side in JavaScript.

### Option B — GitHub Pages (live)
> Replace the placeholder below with your actual GitHub Pages URL after deployment.
```
https://<your-username>.github.io/<your-repo-name>/
```

---

## How to Deploy to GitHub Pages

1. Create a new public repository on GitHub.
2. Upload all files: `index.html`, `style.css`, `main.js`, both `.csv` files.
3. Go to **Settings → Pages → Branch: main → Folder: / (root)** → Save.
4. GitHub will generate a public URL (usually within 1–2 minutes).
5. Paste that URL in the `<a id="gh-pages-link">` anchor inside `index.html`.

---

## Testing C8 — Manual Mode

1. Open the webpage and the **C8 Manual Mode** tab is shown by default.
2. Choose **Mean (μ)** or **Proportion (p)** mode.
3. Select test direction: **Left**, **Two-tailed**, or **Right**.
4. Adjust the sliders or type directly in the input boxes for:
   - Significance level α
   - Benchmark value (μ₀ or p₀)
   - Sample statistic (x̄ or p̂)
   - Standard deviation / standard error (mean mode only)
   - Sample size n
5. The normal curve, shaded p-value region, critical values, z-statistic, and decision update automatically.

---

## Testing C9 — CSV Mode with Provided Example Files

### File 1: `G11_T3_L4_C8C9_example_mean_data.csv`
This file contains two groups (`control` and `treatment`) with a numeric `score` column.

**Steps:**
1. Click the **C9 CSV Mode** tab.
2. Click **Choose CSV file…** and select `G11_T3_L4_C8C9_example_mean_data.csv`.
3. The tool will auto-detect:
   - **Group column:** `group`
   - **Value column:** `score`
   - **Test type:** `Means (numeric)`
4. Select benchmark group (`control`) and test group (`treatment`).
5. Choose test direction (e.g., **Left** to test if treatment < control).
6. Click **Run Hypothesis Test**.
7. The normal curve, z-statistic, p-value, and decision are displayed.

### File 2: `G11_T3_L4_C8C9_example_proportion_data.csv`
This file contains two groups (`control` and `treatment`) with a binary `success` column (0/1).

**Steps:**
1. Click the **C9 CSV Mode** tab.
2. Click **Choose CSV file…** and select `G11_T3_L4_C8C9_example_proportion_data.csv`.
3. The tool will auto-detect:
   - **Group column:** `group`
   - **Value column:** `success`
   - **Test type:** `Proportions (binary)`
4. Select benchmark group (`control`) and test group (`treatment`).
5. Choose test direction (e.g., **Left** to test if treatment proportion < control).
6. Click **Run Hypothesis Test**.
7. The results appear with the same interactive normal curve as C8.

---

## File Structure

```
hypothesis-tool/
├── index.html                              ← Main webpage (C8 + C9)
├── style.css                               ← Stylesheet
├── main.js                                 ← All logic (stats + canvas + UI)
├── G11_T3_L4_C8C9_example_mean_data.csv   ← Mean CSV example
├── G11_T3_L4_C8C9_example_proportion_data.csv ← Proportion CSV example
└── README.md                               ← This file
```

---

## Statistical Methods Used

| Test | Formula |
|------|---------|
| Z for means | z = (x̄ − μ₀) / (σ / √n) |
| Z for two-group means | z = (x̄_T − x̄_B) / √(s²_B/n_B + s²_T/n_T) |
| Z for proportions (C8) | z = (p̂ − p₀) / √(p₀(1−p₀)/n) |
| Z for two-group proportions (C9) | z = (p̂_T − p̂_B) / √(p̂_pool(1−p̂_pool)(1/n_B + 1/n_T)) |

All p-values computed from the standard normal distribution using the Hart approximation.

---

*Built for Academic Purposes · Global Economics · Colegio San Bartolomé La Merced*
