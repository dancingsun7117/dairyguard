# DairyGuard — Live End-to-End System

Milk procurement fraud detection: FastAPI + SQLAlchemy backend (SQLite locally, Postgres in
production), React/Vite frontend, JWT auth with role-scoped access, and three risk-detection
models running on every upload.

## What runs on every upload
Uploading a CSV/XLSX (Collector Portal → "Upload") pushes the file straight through the pipeline
in `backend/services/pipeline.py` and stores the result as the **active dataset**. Every chart and
metric on both portals reads from that active dataset, so re-uploading immediately changes what
both the Collector Portal and Government Portal show (Government Portal also polls every 20s so a
collector's upload shows up there without a manual refresh).

Per upload, the pipeline runs:
1. **Isolation Forest** (scikit-learn) — per-species anomaly detection on volume/fat/pH/temperature z-scores.
2. **XGBoost Stage 2** (`xgboost_stage2/xgboost_stage2.pkl`) — learned fraud-probability classifier, blended into the final risk score.
3. **Louvain community detection** (networkx) — farmer↔collector bipartite graph, flags suspicious clusters.
4. **Chronos-Bolt forecasting** — see note below.

Plus rule-based checks: duplicate transactions, capacity-vs-declared-animals mismatch, adulteration
thresholds (fat/pH out of range), and collector-vs-plant mass-balance variance.

A flexible column adapter (`ALIASES` in `pipeline.py`) maps arbitrary real-world column names
(`Qty (Ltr)`, `dcs_id`, `pashu_aadhar`, etc.) onto the canonical schema, so it isn't tied to one
exact file format.

## ⚠️ One thing you need to know before a live demo: Chronos-Bolt weights
The uploaded `Trained_Chronos/chronos_bolt_dairyguard_finetuned/model.safetensors` in this project
is a **Git LFS pointer file (134 bytes), not the actual ~190 MB model weights** — it looks like the
real weights never got included when this zip was exported from Git. I can't fetch it for you from
this environment (no access to the LFS/Hugging Face host).

I did **not** leave this as a silent failure. The `/api/forecast` endpoint now:
- Tries to load the real Chronos-Bolt model first.
- If that fails (as it will until you replace this file with the real weights), it automatically
  falls back to a transparent **trend + day-of-week-seasonality statistical forecaster** so the
  Supply Forecast tab always returns real numbers instead of a 503 error.
- The API response includes `"model": "chronos-bolt-finetuned"` or `"model": "trend-seasonal-fallback"`
  plus `"chronos_unavailable_reason"` so the UI (and you, in a judge Q&A) always know honestly which
  one actually ran. Don't claim the neural forecaster ran if the field says fallback.

**To restore the real model:** replace `model.safetensors` with the actual file from wherever you
trained it (or re-run `git lfs pull` in the source repo), keeping the same filename/folder.

## Fixed in this pass (also see `git diff` if you version this)
- **No hardcoded data left in either live portal.** Both `CollectorPortalPage.jsx` and
  `GovernmentPortalPage.jsx` used to initialize their charts/tables with 27 hardcoded demo arrays
  (`defaultProcurementHeroData`, `defaultGovTransactions`, etc.) and — critically — **never cleared
  them if a live API call failed**, so a backend hiccup could leave stale demo numbers on screen
  with only a small error toast as the tell. All 27 default arrays are now deleted from the source,
  every panel starts empty, and a failed load explicitly wipes all data back to empty with a clear
  "no live data" banner instead of silently keeping old numbers.
- **Column adapter bug**: the cleaner didn't strip `()`, `%`, `/` etc., so headers like `Qty (Ltr)`
  or `Fat %` silently failed to map and uploads were rejected. Fixed with a proper regex cleaner.
- **Incomplete/invalid file uploads now get a clear, specific rejection message** instead of either
  a generic error or (worse) silently running on garbage data: empty files, missing volume column,
  fewer than 5 rows, and >50% unparseable volume values are all rejected with a message telling the
  uploader exactly what's wrong. Files that are valid but missing optional columns (farmer ID, date,
  fat/pH/temperature, declared animals, plant intake) are still **accepted** but come back with a
  `warnings` list explaining which checks are degraded — shown to the uploader in the UI.
- **Chronos 503 breaking the whole Collector Portal**: `getForecast` was one of several calls in a
  `Promise.all`; a 503 took down the entire live dashboard. Now always returns 200 (see Chronos note
  above).
- **SQLite path crash**: `backend/data/` didn't exist yet on first boot → `unable to open database
  file`. `config.py` now creates it.
- **Postgres compatibility**: `db.py` used SQLite-only syntax (`INTEGER PRIMARY KEY AUTOINCREMENT`,
  `INSERT OR IGNORE`, relying on `cursor.lastrowid`). Rewritten to detect the SQLAlchemy dialect and
  use `SERIAL PRIMARY KEY` / `ON CONFLICT DO NOTHING` / `RETURNING id` on Postgres.
- **CORS was hardcoded to localhost only** — now reads `CORS_ORIGINS` from the environment so you
  can point it at your deployed frontend.
- **OTP simulation was half-built**: the CSS for a full OTP popup existed in
  `CollectionCentreLoginModal.css` but no component ever rendered it — login went straight from ID
  entry to "verified". Rebuilt `AuthPortalModal.jsx` to insert a real (simulated) OTP step between
  identity verification and success, matching the existing visual design. The identity check itself
  still hits the live backend; the OTP step is a UI-only second factor with an on-screen demo code,
  since there's no SMS/email gateway wired up — labelled honestly as simulated in the UI copy.
- Added `psycopg2-binary` + `gunicorn` to `requirements.txt` for Postgres/production.

I ran the full pipeline (upload → Isolation Forest → XGBoost → Louvain clusters → forecast → both
portal dashboards → audit logs → re-upload changing the numbers → 6 different broken/incomplete
file scenarios → cross-session DB persistence check) against synthetic data end-to-end via
FastAPI's TestClient, and did a production `npm run build` of the frontend. All pass clean.

## Direct answers to the questions you asked
- **Is there any hardcoded data left in either portal?** No. Every chart, table, and score in
  `CollectorPortalPage.jsx` and `GovernmentPortalPage.jsx` is now populated only from live API
  responses. If the backend has no active dataset, or a request fails, the panels show empty with
  an explicit banner — never silently-stale demo numbers. (Six other page files exist in
  `src/pages/` — `DashboardPage`, `FarmersPage`, `RiskMapPage`, etc. — but `AppRoutes.jsx` never
  routes to them, so they're unreachable dead code left over from an earlier prototype, not part of
  the live app.)
- **Are all three ML models connected?** Yes — verified end-to-end: Isolation Forest (scikit-learn,
  per-species), XGBoost Stage 2 (`xgboost_stage2/xgboost_stage2.pkl`, blended into the final risk
  score), and Louvain graph community detection (networkx, farmer↔collector clusters). Forecasting
  (Chronos-Bolt) runs when you supply the real model weights, and falls back to a labelled
  statistical forecaster otherwise — see the Chronos section above.
- **Is the data adapter connected?** Yes — `services/pipeline.py`'s `adapt()` runs on every upload,
  maps arbitrary column names onto the canonical schema, and now also validates completeness (see
  above) before the models ever run.
- **Is the database connected?** Yes — SQLAlchemy against SQLite locally / Postgres in production.
  Every upload, transaction row, analysis result, user, and audit log write goes through it; I
  verified rows persist across separate process/session boundaries, not just in memory.
- **Do login pages work correctly?** Yes — tested both roles: correct IDs succeed and issue a
  role-scoped JWT, wrong IDs get a 404, unauthenticated requests get a 401, and a collector token
  can't reach government-only routes (403 on `/api/audit-logs`, confirmed).
- **Are collector ID and government ID in the permanent database?** Yes. `GOV-DEMO-001` is seeded
  into the `users` table on first boot and stays there. Collector IDs get written to `users`
  permanently the first time they appear in an uploaded dataset (or the first time someone logs in
  with an ID present in the active dataset) — confirmed with a fresh process reconnecting to the
  same DB file and successfully logging in with a collector ID created in an earlier session.
- **Is the backend complete?** Yes — `backend/main.py` (routes + auth + JWT), `backend/db.py` (data
  layer), `backend/config.py`, and `backend/services/pipeline.py` (adapter + all models + risk
  scoring) are the whole thing, nothing stubbed out or mocked. It's a working FastAPI app, not a
  skeleton.



## Run locally
```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

- **Government demo ID:** `GOV-DEMO-001`
- **Collector login:** upload a dataset first (as government, or as a collector using an ID you're
  inventing), then log in with any `collector_id` present in that active dataset.
- **OTP step:** the code needed is shown on screen in the demo card — this is a simulated second
  factor, not a real SMS/email.

## Deploying it live — step by step
I can't personally stand up a permanent public URL for you from this sandbox (no hosting account,
no persistent server here) — but the project is configured to deploy in about 10–15 minutes on free
tiers. You'll need a free GitHub account to push this project to (Render/Netlify both deploy from a
Git repo, not a raw zip upload).

**0. Push this project to GitHub.**
```bash
cd project
git init && git add -A && git commit -m "DairyGuard live build"
# create a new empty repo on github.com, then:
git remote add origin https://github.com/<you>/dairyguard.git
git branch -M main && git push -u origin main
```

**1. Create the database — [Neon](https://neon.tech) (free Postgres, easiest) or Supabase.**
- Sign up → New Project → any name/region.
- Copy the connection string it gives you (starts with `postgresql://...`). Keep this tab open.

**2. Deploy the backend — [Render](https://render.com).**
- New → Blueprint → connect your GitHub → select the `dairyguard` repo. Render reads `render.yaml`
  automatically and creates the `dairyguard-backend` web service.
- In the service's Environment tab, set:
  - `DATABASE_URL` → paste the Neon connection string from step 1.
  - `CORS_ORIGINS` → leave a placeholder for now (e.g. `http://localhost:5173`), you'll fix this in
    step 4.
  - `JWT_SECRET` is auto-generated by the blueprint — leave it.
- Deploy. Watch the build logs; first deploy installs `torch`/`transformers` so it can take 5–10
  minutes. Once live, note the URL Render gives you, e.g. `https://dairyguard-backend.onrender.com`.
- Sanity check: open `https://<your-backend>.onrender.com/health` in a browser — you should see
  `{"status":"ok",...}`.

**3. Deploy the frontend — [Netlify](https://netlify.com).**
- Add new site → Import an existing project → connect GitHub → select the same repo, set the base
  directory to `frontend`. Netlify picks up `netlify.toml` automatically (build command
  `npm run build`, publish dir `dist`).
- Site settings → Environment variables → add `VITE_API_BASE_URL` = your Render backend URL from
  step 2 (no trailing slash).
- Deploy. Note the URL Netlify gives you, e.g. `https://dairyguard.netlify.app`.

**4. Close the loop — fix CORS.**
- Back in Render, edit `CORS_ORIGINS` to your real Netlify URL from step 3 (comma-separate if you
  also want to allow `localhost:5173` for local dev), then trigger a manual redeploy.

**5. Test the live URL.**
- Open your Netlify URL → Government Access → `GOV-DEMO-001` → complete the (simulated) OTP step →
  you're in, currently with an empty "no dataset yet" state (correct — the live Postgres DB starts
  empty).
- Go to Collector Portal, upload a CSV, confirm charts populate. Log back into the Government Portal
  and confirm the same numbers show up there too.

**If something breaks:** Render's and Netlify's build/runtime logs are the first place to look —
paste me the error and I'll debug it with you. The most common first-deploy issues are a missing/
wrong `DATABASE_URL`, or `CORS_ORIGINS` not yet updated to the final Netlify URL.

**Restoring real Chronos-Bolt forecasting after deploy:** upload the real `model.safetensors` into
`Trained_Chronos/chronos_bolt_dairyguard_finetuned/` in your repo, commit, push — Render will
redeploy automatically. Until then the trend-fallback forecaster keeps the tab fully functional.



## Project layout
```
backend/            FastAPI app, SQLAlchemy models, pipeline
  main.py           API routes + auth + JWT
  db.py             SQLite/Postgres-compatible data layer
  config.py         paths, DB_URL, JWT_SECRET (env-overridable)
  services/pipeline.py   column adapter + Isolation Forest + XGBoost + Louvain + risk scoring
frontend/           React + Vite
  src/pages/CollectorPortalPage.jsx   live-wired collector dashboard (upload, charts, forecast)
  src/pages/GovernmentPortalPage.jsx  live-wired oversight dashboard (districts, audit log, mass balance)
  src/components/auth/AuthPortalModal.jsx   ID verify -> simulated OTP -> success
xgboost_stage2/      trained XGBoost model + feature spec
Trained_Chronos/     Chronos-Bolt config (weights need replacing, see note above)
render.yaml          Render backend deploy config
frontend/netlify.toml   Netlify frontend deploy config
```
