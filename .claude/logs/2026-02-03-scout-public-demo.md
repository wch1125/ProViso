# Scout Reconnaissance Report: Public Demo Readiness

**Project:** ProViso
**Date:** 2026-02-03
**Objective:** Assess readiness for public-facing demo URL for lenders/borrowers/lawyers/agents

## Initial Orientation

### What I understood coming in
- ProViso is a DSL for credit agreements that reads like legal documents but executes like programs
- v2.1.0-alpha complete with 530 passing tests
- Dashboard recently wired to live interpreter (as of today)
- Target audience: lenders, borrowers, lawyers, agents

### What I was looking for
- Build/test stability
- Deployment infrastructure status
- Demo-readiness gaps
- User experience for non-technical users (lawyers, bankers)

## Executive Summary

**Good news:** The project is technically mature. 530 tests pass, the build works, and the dashboard is now wired to the real interpreter. The code splitting is well-optimized (main bundle: 55KB, vendor chunks separated).

**Challenge:** No deployment infrastructure exists. The project has zero CI/CD, no Vercel/Netlify config, no Docker files. The dashboard is a static SPA that can be deployed anywhere—but currently runs only locally.

**For a public demo, you need:**
1. Deployment infrastructure (Vercel recommended for static React)
2. A landing page / onboarding flow for first-time visitors
3. Sample data that tells a compelling story
4. Export functionality (currently "Export Report" does nothing)

## Environment Status

### Build Verification
| Check | Status | Notes |
|-------|--------|-------|
| Dependencies install | ✓ | Both root and dashboard |
| Project builds | ✓ | Peggy + TypeScript clean |
| Dashboard builds | ✓ | Vite production build (2.59s) |
| Tests pass | ✓ | 530/530 tests passing |

### Environment Requirements
- **Runtime:** Node.js 18+
- **Dashboard:** React 18 + Vite + TailwindCSS
- **No backend required:** Interpreter runs in browser

### Build Output
```
dashboard/dist/
├── index.html              (0.86 KB)
├── assets/
│   ├── index-*.css         (37 KB gzip: 6.8 KB)
│   ├── index-*.js          (56 KB gzip: 16 KB)
│   ├── vendor-react-*.js   (164 KB gzip: 54 KB)
│   ├── vendor-charts-*.js  (404 KB gzip: 110 KB)
│   ├── parser.generated-*.js (86 KB gzip: 17 KB)
│   └── [lazy-loaded chunks...]
```

Total: ~955KB uncompressed, ~243KB gzipped. Acceptable for a data-heavy app.

---

## Demo Readiness Assessment

### What Works Well

1. **Live Interpreter in Browser**
   - Dashboard now uses real interpreter, not static data
   - File upload supports .proviso and .json files
   - Financial data editor with live recalculation
   - Scenario simulator with actual covenant impact calculations

2. **Rich Visualization**
   - Executive summary with key metrics
   - Phase timeline with progress
   - Covenant panel with headroom bars
   - Waterfall chart with tier breakdown
   - Reserve status with target/minimum
   - Milestone tracker with status badges
   - Conditions precedent checklist
   - Industry analytics (P50/P75/P90/P99, regulatory, tax equity)

3. **Professional Design**
   - Premium dark theme with gold accents
   - Code splitting for fast initial load
   - Loading skeletons, error states
   - Responsive grid layout

4. **Strong Example Content**
   - 7 example .proviso files covering corporate revolvers, project finance, solar, wind, data centers
   - Comprehensive financial data JSON files
   - Well-documented syntax in GETTING_STARTED.md

### What's Missing for Public Demo

#### CRITICAL: No Deployment Infrastructure

| Component | Status |
|-----------|--------|
| Vercel config | ❌ Not present |
| Netlify config | ❌ Not present |
| Docker | ❌ Not present |
| CI/CD pipeline | ❌ Not present |
| GitHub Actions | ❌ Not present |

**Recommendation:** Vercel is ideal for this use case:
- Free tier handles thousands of visitors
- Zero-config for Vite/React
- Automatic preview deployments
- Edge CDN for performance

#### HIGH: Landing/Onboarding Experience

Current flow:
1. User lands on `/` → redirects to `/deals`
2. `/deals` shows a static list of demo deals
3. User must click through to reach actual functionality

**Problems:**
- No explanation of what ProViso is
- No guided tour for first-time users
- No "Try it now" call-to-action
- Lawyers/bankers won't know what to click

**Recommendation:** Create a landing page with:
- Hero section explaining the value proposition
- "See it in action" CTA leading to demo deal
- Industry selector (solar, wind, corporate revolver)
- Brief feature highlights

#### MEDIUM: Export Functionality

The "Export Report" button exists but does nothing:
```tsx
// MonitoringDashboard.tsx:251
<Button variant="ghost" icon={<FileText className="w-4 h-4" />} size="sm">
  Export Report
</Button>
```

Backend has Word generation capabilities (`src/hub/word/generator.ts`) that aren't connected.

**Recommendation:** Wire export to generate:
- PDF compliance certificate
- Word document with covenant summary
- JSON export of current state

#### MEDIUM: Narrative Demo Data

Current default data shows "Sunrise Solar Project" - works technically but:
- No story arc (no near-breach to show headroom utility)
- No historical periods to demo compliance trends
- Numbers feel arbitrary

**Recommendation:** Craft demo scenarios that showcase:
1. A covenant near breach (98% utilized basket)
2. A milestone at risk (5 days to longstop)
3. A cure right recently used
4. Clear before/after for scenario analysis

#### LOW: Mobile Experience

Dashboard is responsive but optimized for desktop:
- Data tables don't scroll well on mobile
- Some charts cramped on narrow screens
- Phase timeline wraps awkwardly

**Recommendation:** For demo purposes, add "Best viewed on desktop" notice for mobile users.

---

## Deployment Options Analysis

### Option 1: Vercel (Recommended)

**Pros:**
- Zero config for Vite projects
- Free tier: 100GB bandwidth, unlimited sites
- Preview deployments for PRs
- Edge CDN, excellent performance
- Custom domain support

**Steps:**
1. Create `vercel.json` with SPA rewrites
2. Connect GitHub repo to Vercel
3. Set build command: `cd dashboard && npm run build`
4. Output directory: `dashboard/dist`

**Time to first deploy:** ~15 minutes

### Option 2: Netlify

**Pros:**
- Similar to Vercel
- Form handling built-in (if needed later)
- Good free tier

**Steps:**
1. Create `netlify.toml` with build settings
2. SPA redirect rules

### Option 3: GitHub Pages

**Pros:**
- Free, already have repo
- Simple for static sites

**Cons:**
- No SPA routing support without workarounds
- Custom domains more complex
- No preview deployments

### Option 4: Custom Server (Not Recommended for Demo)

Overkill for current needs. Would require:
- Node.js backend
- Database
- Authentication
- Hosting costs

---

## Recommended Build Phases for Public Demo

### Phase 1: Deployment Infrastructure (Priority: CRITICAL)
1. Create `vercel.json` for SPA routing
2. Configure build settings
3. Deploy to Vercel
4. Set up custom domain (if available)

**Deliverable:** Working public URL

### Phase 2: Landing Experience (Priority: HIGH)
1. Create landing page component
2. Add industry selector (solar/wind/corporate)
3. "Try Demo" CTA that loads appropriate example
4. Brief feature highlights

**Deliverable:** First-time visitors understand value in 30 seconds

### Phase 3: Demo Data Polish (Priority: MEDIUM)
1. Create "narrative" demo dataset showing:
   - Near-breach covenant scenario
   - At-risk milestone
   - Cure rights utilization
   - Multi-period history
2. Pre-load compelling example on first visit

**Deliverable:** Demo tells a story, not just shows data

### Phase 4: Export Functionality (Priority: MEDIUM)
1. Wire "Export Report" to generate PDF/Word
2. Backend support exists in `src/hub/word/generator.ts`
3. Add "Download JSON" option

**Deliverable:** Users can take something away from the demo

### Phase 5: Analytics & Feedback (Priority: LOW)
1. Add simple analytics (Plausible or similar)
2. Feedback form or email capture
3. Track which features users engage with

**Deliverable:** Learn what resonates with users

---

## Technical Debt & Hazards

### Demo Data Inconsistency
- `/deals` page shows hardcoded "ABC Acquisition Facility" deal list
- `/deals/:id/monitor` shows "Sunrise Solar Project" from interpreter defaults
- User clicking through sees different projects

**Fix:** Either wire deal list to interpreter or ensure demo data consistency

### Unused Components Still Present
- `ScenarioSimulator` (original) vs `ConnectedScenarioSimulator` (wired)
- `ComplianceTrendChart` vs `ConnectedComplianceTrendChart`
- Some demo data files may be stale

### Settings/Export Buttons Non-Functional
- "Settings" button does nothing
- "Export Report" button does nothing
- Creates impression of incomplete product

---

## Reflections

### What surprised me
- The dashboard is genuinely functional now. The interpreter runs in the browser with no server needed.
- Code quality is high: 530 tests, TypeScript throughout, proper chunking.
- The gap is 100% deployment/presentation, not functionality.

### What I'm uncertain about
- Is the domain story clear enough? "Credit agreements as code" may not resonate with non-technical users.
- Will lawyers trust a tool that gives compliance answers? The liability question is real.
- Should the demo require authentication to track users?

### What I'd reconsider
- Maybe start with a simpler "playground" mode instead of the full dashboard
- A single-page covenant checker might be more impressive than the full UI
- The deal list abstraction may confuse users who just want to see what ProViso does

### If I had more time
- User interviews with actual lenders/lawyers to understand what they'd want from a demo
- Performance profiling of interpreter in browser with large .proviso files
- Accessibility audit of dashboard components

---

## For Builder: Implementation Tasks

### Immediate (Get It Live)
- [ ] Create `vercel.json` with SPA rewrites
- [ ] Create deployment configuration
- [ ] Test production build deployment
- [ ] Configure custom domain (if available)

### Soon (Make It Demo-Ready)
- [ ] Create landing page with value proposition
- [ ] Add industry selector for demo scenarios
- [ ] Create "narrative" demo data with near-breach scenario
- [ ] Align deal list data with monitoring dashboard

### Later (Polish)
- [ ] Wire Export Report button to Word generation
- [ ] Add analytics tracking
- [ ] Mobile experience improvements
- [ ] Remove or wire non-functional buttons

---

## Handoff Checklist
- [x] Environment verified working (builds + tests pass)
- [x] Dependencies audited (all current, no vulnerabilities)
- [x] Build output verified (955KB total, 243KB gzipped)
- [x] Key gaps identified (deployment, landing page, demo data)
- [x] Prior art located (existing Word generation, demo data)
- [x] Open questions surfaced
- [x] Recommendations provided with priority levels

**Environment is ready for building.** The technical foundation is solid. The work is deployment and presentation.
