# v2.3 Public Demo Build Plan

**Goal:** Deploy ProViso demo to `proviso-demo.haslun.online`
**Created:** 2026-02-05
**Precedent:** `.claude/precedent/closing-room-demo/` (extracted)

---

## Executive Summary

Transform ProViso from a local development tool to a public demo at `proviso-demo.haslun.online`. The technical foundation is solid (530 tests, working interpreter-in-browser), but needs deployment infrastructure and landing experience.

**Key Deliverables:**
1. Live public URL with Vercel deployment
2. Landing page explaining ProViso's value proposition
3. Polished demo data that tells a compelling story
4. Export functionality so visitors can take something away

---

## Design Philosophy: Premium Legal Tech

**Target Audience:** Sophisticated lenders, borrowers, lawyers, and agents who expect Bloomberg-terminal-level polish meets modern SaaS elegance.

**Visual Language:**
- **Authority** — Navy backgrounds, gold accents convey institutional trust
- **Precision** — Clean typography, exact spacing, no visual noise
- **Intelligence** — Data-dense but never cluttered; information hierarchy is paramount
- **Elegance** — Subtle animations, refined transitions, considered micro-interactions

**Reference Points:**
- Bloomberg Terminal (data density, professional gravitas)
- Carta (modern fintech polish)
- Linear (interaction design, keyboard-first)
- Stripe Dashboard (typography, whitespace mastery)

---

## Precedent Code Analysis

The `closing-room-demo` project provides excellent reusable assets:

### Cannibalize These Components

| Component | Source File | Adapt For |
|-----------|-------------|-----------|
| **Loading Screen** | `landing.html:90-198` | Initial page load animation with brand reveal |
| **Hero Section** | `landing.html:252-304` | Landing page header with gradient + grid pattern |
| **Feature Cards** | `landing.html:306-408` | "What This Does" section on landing |
| **Theme Toggle** | `landing.html:204-237`, `base.html:428-451` | Light/dark mode switcher |
| **CSS Variables** | `base.html:28-127` | Design system (gold, navy, status colors) |
| **Paper Texture** | `base.html:275-284` | Subtle background texture |
| **Navigation** | `base.html:288-493` | Sticky nav with context |
| **Demo Banner** | `base.html:453-470` | "Demo Mode" indicator |
| **Stat Cards** | `deal-room.html:56-115` | Executive summary metrics |
| **Activity Timeline** | `deal-room.html:241-311` | Activity feed styling |

### Design Tokens to Extract

```css
/* From precedent - adapt to Tailwind */
--gold: #B8860B;
--gold-light: #D4A84B;
--gold-muted: rgba(184, 134, 11, 0.12);
--navy: #1a2744;
--navy-light: #2d3f5f;
--navy-dark: #111827;
--font-display: 'EB Garamond', Georgia, serif;
--font-body: 'DM Sans', -apple-system, sans-serif;
```

### Fonts to Add
```html
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Phase 1: Deployment Infrastructure

**Priority:** CRITICAL
**Effort:** 1-2 hours

### 1.1 Create Vercel Configuration

Create `dashboard/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 1.2 Update Vite Config for Production

Ensure `dashboard/vite.config.ts` has proper base path:

```typescript
export default defineConfig({
  base: '/',
  // ... existing config
})
```

### 1.3 Deploy to Vercel

```bash
# Option A: Vercel CLI
cd dashboard
npx vercel --prod

# Option B: Connect GitHub repo to Vercel dashboard
# Settings:
#   Root Directory: dashboard
#   Build Command: npm run build
#   Output Directory: dist
```

### 1.4 Configure Custom Domain

1. In Vercel dashboard: Settings → Domains → Add `proviso-demo.haslun.online`
2. Add DNS records:
   - CNAME: `proviso-demo` → `cname.vercel-dns.com`
   - Or A record if apex domain

### 1.5 Environment Variables (if needed)

Currently none required - interpreter runs client-side.

### Deliverable
- [ ] `proviso-demo.haslun.online` returns dashboard
- [ ] HTTPS working
- [ ] SPA routing works (refresh on any route returns app)

---

## Phase 2: Landing Experience

**Priority:** HIGH
**Effort:** 4-6 hours

### 2.1 Create Landing Page Component

Create `dashboard/src/pages/Landing.tsx`:

```tsx
// Adapt from precedent landing.html
// Key sections:
// 1. Loading screen (animated brand reveal) - from landing.html:90-198
// 2. Hero with gradient background - from landing.html:252-304
// 3. Feature grid (6 cards) - from landing.html:306-408
// 4. Industry selector (Solar/Wind/Corporate)
// 5. "Try Demo" CTA
// 6. Footer with haslun.ai branding
```

### 2.2 Feature Cards Content

| Icon | Title | Description |
|------|-------|-------------|
| `Calculator` | Instant Compliance | Check covenant compliance in milliseconds, not weeks |
| `TrendingUp` | Basket Tracking | Automatic utilization tracking with full audit trail |
| `FileText` | Plain English | Reads like the credit agreement, runs like code |
| `Zap` | Pro Forma Simulation | "What if" analysis for proposed transactions |
| `Shield` | Cure Rights | Built-in mechanics for covenant breaches |
| `Building` | Project Finance | Phases, milestones, waterfalls, reserves |

### 2.3 Industry Selector

Create `dashboard/src/components/landing/IndustrySelector.tsx`:

```tsx
// Three cards:
// 1. Solar (200MW utility-scale, ITC tax equity)
// 2. Wind (150MW onshore, PTC)
// 3. Corporate (Revolver with covenants)

// On click: navigate to /deals/:id/monitor with preloaded data
```

### 2.4 Route Updates

Update `dashboard/src/App.tsx`:

```tsx
// Change root route from redirect to Landing page
<Route path="/" element={<Landing />} />
<Route path="/deals" element={<DealList />} />
// ... rest unchanged
```

### 2.5 Loading Screen

Create `dashboard/src/components/LoadingScreen.tsx`:

```tsx
// Adapt from precedent landing.html:90-198
// - Gold "P" icon with pulse animation
// - "ProViso" brand name with gradient text
// - "Credit Agreements as Code" tagline
// - Progress bar animation
// - Fade out after 1.6s
```

### Deliverable
- [ ] Landing page at `/` explains ProViso value
- [ ] Industry selector loads appropriate demo
- [ ] Loading screen on first visit
- [ ] "Try Demo" CTA leads to monitoring dashboard

---

## Phase 3: Demo Data Polish

**Priority:** MEDIUM
**Effort:** 2-3 hours

### 3.1 Create Narrative Demo Scenarios

Create `dashboard/src/data/demo-scenarios.ts`:

```typescript
export const demoScenarios = {
  solar: {
    name: 'Sunrise Solar Project',
    // Current data but with:
    // - One covenant at 92% of threshold (near breach)
    // - One milestone 5 days from longstop (at risk)
    // - One cure right recently used
    // - 6 quarters of historical data
  },
  wind: {
    name: 'Prairie Wind Farm',
    // Similar tension points
  },
  corporate: {
    name: 'ABC Corporation Revolver',
    // Traditional credit facility
    // - Leverage covenant near trip
    // - Builder basket showing accumulation
  }
};
```

### 3.2 Highlight "Tension" in Demo

For each scenario, include at least:

1. **Near-Breach Covenant** - Show headroom utility
   - Example: Leverage at 4.35x vs 4.5x threshold (97%)

2. **At-Risk Milestone** - Show longstop tracking
   - Example: Grid Synchronization 5 days from longstop

3. **Recently Used Cure** - Show cure mechanics
   - Example: Equity cure of $2M applied Q2 2025

4. **Multi-Period History** - Show trend analysis
   - Example: 6 quarters of improving compliance

### 3.3 Update Default Data

Modify `dashboard/src/data/default-financials.ts` to include tension:

```typescript
// Adjust numbers to create near-breach scenario
// Current: revenue: 45_000_000, ebitda: 12_000_000
// Tension: revenue: 42_000_000, ebitda: 10_500_000
// This pushes leverage closer to threshold
```

### Deliverable
- [ ] Demo data has clear "tension points"
- [ ] At least one metric in yellow/orange zone
- [ ] Historical data shows trend
- [ ] Story is immediately visible on dashboard

---

## Phase 4: Export Functionality

**Priority:** MEDIUM
**Effort:** 3-4 hours

### 4.1 Wire Export Report Button

Update `dashboard/src/pages/monitoring/MonitoringDashboard.tsx`:

```tsx
// Connect "Export Report" button to new export modal
<Button onClick={() => setShowExportModal(true)}>
  Export Report
</Button>
```

### 4.2 Create Export Modal

Create `dashboard/src/components/export/ExportModal.tsx`:

```tsx
// Options:
// 1. Compliance Certificate (PDF) - uses existing Word generator
// 2. Full Report (Word) - comprehensive document
// 3. Raw Data (JSON) - interpreter state
// 4. ProViso Code (.proviso) - current agreement text
```

### 4.3 PDF Generation

Option A: Use browser print-to-PDF
```tsx
const exportPDF = () => {
  window.print(); // Style with @media print
};
```

Option B: Use html2pdf.js
```bash
npm install html2pdf.js
```

### 4.4 Word Generation (Already Exists)

Connect to existing `src/hub/word/generator.ts`:

```typescript
import { wordGenerator } from '@proviso/hub/word/generator';

const exportWord = async () => {
  const doc = wordGenerator.generateDocument(code, financials);
  // Download as .docx or .txt
};
```

### 4.5 JSON Export

```typescript
const exportJSON = () => {
  const data = {
    code: currentCode,
    financials: currentFinancials,
    results: interpreterState,
    exportedAt: new Date().toISOString()
  };
  downloadFile(JSON.stringify(data, null, 2), 'proviso-export.json');
};
```

### Deliverable
- [ ] Export Report button opens modal
- [ ] Can export as PDF/Word/JSON
- [ ] Downloaded file has ProViso branding
- [ ] Works on demo data

---

## Phase 5: Analytics & Feedback (Optional)

**Priority:** LOW
**Effort:** 1-2 hours

### 5.1 Add Plausible Analytics

```html
<!-- In dashboard/index.html -->
<script defer data-domain="proviso-demo.haslun.online" src="https://plausible.io/js/script.js"></script>
```

### 5.2 Add Feedback Link

```tsx
// In footer or header
<a href="mailto:feedback@haslun.ai?subject=ProViso Demo Feedback">
  Send Feedback
</a>
```

### 5.3 Track Key Events

```typescript
// Optional: track demo engagement
plausible('Demo Started', { industry: 'solar' });
plausible('Export Downloaded', { format: 'pdf' });
plausible('Scenario Simulated');
```

### Deliverable
- [ ] Analytics tracking page views
- [ ] Feedback mechanism exists
- [ ] Can see which features get used

---

## Premium UI & Responsive Design Specifications

### Responsive Breakpoints

```typescript
// Tailwind breakpoints (mobile-first)
const breakpoints = {
  sm: '640px',   // Large phones (landscape)
  md: '768px',   // Tablets (portrait)
  lg: '1024px',  // Tablets (landscape), small laptops
  xl: '1280px',  // Laptops, desktops
  '2xl': '1536px' // Large desktops
};
```

### Device-Specific Layouts

#### Mobile (< 640px)
- **Navigation:** Hamburger menu with slide-out drawer
- **Landing Hero:** Stack vertically, reduce font sizes
- **Feature Cards:** Single column, full width
- **Industry Selector:** Vertical stack with touch-friendly 48px tap targets
- **Dashboard:**
  - Single column layout
  - Collapsible panels (accordion pattern)
  - Horizontal scroll for data tables with sticky first column
  - Charts resize to container, simplified legends
- **Typography:** Base 16px, headings scale down 20%

#### Tablet Portrait (768px - 1023px)
- **Navigation:** Full horizontal nav, but condensed
- **Landing Hero:** Two-column where appropriate
- **Feature Cards:** 2-column grid
- **Industry Selector:** 3-column with reduced padding
- **Dashboard:**
  - 2-column grid for stat cards
  - Side panels become bottom sheets or modals
  - Charts at full width
- **Typography:** Base 16px, full heading scale

#### Tablet Landscape / Small Laptop (1024px - 1279px)
- **Navigation:** Full nav with all items visible
- **Landing:** Full desktop layout, slightly reduced padding
- **Dashboard:**
  - Full grid layout
  - Side panels visible
  - All features enabled
- **Typography:** Base 16px (15px acceptable)

#### Desktop (1280px+)
- **Max content width:** 1400px centered
- **Full feature set** with generous whitespace
- **Typography:** Base 15-16px, comfortable reading measure

### Typography Hierarchy

```css
/* Display Font: EB Garamond (headings, numbers, emphasis) */
.font-display {
  font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
  font-feature-settings: 'liga' 1, 'kern' 1;
  letter-spacing: -0.02em;
}

/* Body Font: DM Sans (UI, body text, labels) */
.font-body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'kern' 1;
}

/* Mono Font: For code, numbers in tables */
.font-mono {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-feature-settings: 'tnum' 1; /* Tabular numbers */
}
```

#### Type Scale

| Element | Mobile | Desktop | Font | Weight |
|---------|--------|---------|------|--------|
| Hero H1 | 2.25rem (36px) | 3rem (48px) | Display | 500 |
| Page H1 | 1.75rem (28px) | 2rem (32px) | Display | 500 |
| Section H2 | 1.25rem (20px) | 1.5rem (24px) | Display | 500 |
| Card Title | 1rem (16px) | 1.125rem (18px) | Display | 500 |
| Body | 0.9375rem (15px) | 0.9375rem (15px) | Body | 400 |
| Small/Label | 0.8125rem (13px) | 0.8125rem (13px) | Body | 500 |
| Caption | 0.75rem (12px) | 0.75rem (12px) | Body | 400 |
| Metric Value | 1.5rem (24px) | 2rem (32px) | Display | 500 |

### Color System (Extended)

```javascript
// tailwind.config.js
colors: {
  // Primary: Gold (Lion's Mane)
  gold: {
    50: '#FDF8E8',
    100: '#FAF0D1',
    200: '#F5E1A3',
    300: '#EFD175',
    400: '#E8C147',
    500: '#D4A84B', // Light mode accent
    600: '#B8860B', // Primary gold
    700: '#966D09',
    800: '#745407',
    900: '#523B05',
  },

  // Secondary: Navy (Authority)
  navy: {
    50: '#E8EBF0',
    100: '#C5CCD9',
    200: '#9EABC2',
    300: '#7789AB',
    400: '#506894',
    500: '#2D3F5F', // Light
    600: '#1A2744', // Primary navy
    700: '#141D33',
    800: '#111827', // Dark
    900: '#0A0F17',
  },

  // Semantic Colors
  success: {
    light: 'rgba(22, 163, 74, 0.1)',
    DEFAULT: '#16A34A',
    dark: '#15803D',
  },
  warning: {
    light: 'rgba(202, 138, 4, 0.1)',
    DEFAULT: '#CA8A04',
    dark: '#A16207',
  },
  danger: {
    light: 'rgba(220, 38, 38, 0.1)',
    DEFAULT: '#DC2626',
    dark: '#B91C1C',
  },

  // Surfaces (Dark Theme - Primary)
  surface: {
    0: '#0F0F0F',   // Page background
    1: '#151515',   // Card background
    2: '#1C1C1A',   // Elevated card
    3: '#242422',   // Hover state
    4: '#2C2C2A',   // Active state
  },

  // Text
  text: {
    primary: '#E8E8E4',
    secondary: '#B8B8B2',
    tertiary: '#8A8A82',
    muted: '#5A5A55',
  },

  // Borders
  border: {
    subtle: '#2A2A28',
    DEFAULT: '#3A3A35',
    strong: '#4A4A45',
  },
}
```

### Spacing System

```javascript
// Consistent 4px base unit
spacing: {
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
}
```

### Shadow System

```javascript
boxShadow: {
  // Subtle elevation
  'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
  'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.3)',
  'md': '0 4px 8px rgba(0, 0, 0, 0.35)',
  'lg': '0 8px 16px rgba(0, 0, 0, 0.4)',
  'xl': '0 16px 32px rgba(0, 0, 0, 0.45)',
  '2xl': '0 24px 48px rgba(0, 0, 0, 0.5)',

  // Gold glow (for CTAs, focus states)
  'gold-sm': '0 0 0 2px rgba(184, 134, 11, 0.2)',
  'gold': '0 0 0 4px rgba(184, 134, 11, 0.15), 0 4px 12px rgba(184, 134, 11, 0.2)',
  'gold-lg': '0 0 0 6px rgba(184, 134, 11, 0.1), 0 8px 24px rgba(184, 134, 11, 0.25)',

  // Inset for inputs
  'inner': 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
  'inner-gold': 'inset 0 0 0 1px rgba(184, 134, 11, 0.5)',
}
```

### Animation & Micro-Interactions

#### Timing Functions

```javascript
transitionTimingFunction: {
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',      // General UI
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful emphasis
  'snap': 'cubic-bezier(0.4, 0, 0.6, 1)',        // Quick, decisive
  'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',  // Subtle, elegant
}

transitionDuration: {
  '75': '75ms',    // Instant feedback
  '150': '150ms',  // Fast interactions
  '200': '200ms',  // Standard
  '300': '300ms',  // Deliberate
  '500': '500ms',  // Emphasis
}
```

#### Premium Micro-Interactions

```css
/* Button hover lift */
.btn-premium {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-gold);
}
.btn-premium:active {
  transform: translateY(0);
}

/* Card hover elevation */
.card-premium {
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}
.card-premium:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-strong);
}

/* Gold accent bar reveal */
.card-accent::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold-600), var(--gold-400));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 300ms ease;
}
.card-accent:hover::before {
  transform: scaleX(1);
}

/* Focus ring (accessibility + elegance) */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--surface-1), 0 0 0 4px var(--gold-600);
}

/* Skeleton loading shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 25%,
    var(--surface-3) 50%,
    var(--surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Number counter animation */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.metric-value {
  animation: countUp 400ms ease-out;
}

/* Staggered list reveal */
.stagger-item {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 300ms ease-out forwards;
}
.stagger-item:nth-child(1) { animation-delay: 50ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 150ms; }
/* ... etc */
```

### Component-Level Polish

#### Buttons

```tsx
// Primary CTA - Gold gradient
<button className="
  bg-gradient-to-r from-gold-600 to-gold-500
  hover:from-gold-500 hover:to-gold-400
  text-white font-semibold
  px-6 py-3 rounded-lg
  shadow-md hover:shadow-gold
  transform hover:-translate-y-0.5
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-surface-1
">
  Try Demo
</button>

// Secondary - Ghost with border
<button className="
  bg-transparent border border-border-DEFAULT
  hover:border-gold-600 hover:bg-gold-600/10
  text-text-secondary hover:text-gold-500
  px-4 py-2 rounded-md
  transition-all duration-150
">
  Learn More
</button>
```

#### Cards

```tsx
// Premium card with accent bar
<div className="
  relative overflow-hidden
  bg-surface-1 border border-border-DEFAULT rounded-xl
  shadow-sm hover:shadow-lg
  transform hover:-translate-y-0.5
  transition-all duration-200
  before:absolute before:top-0 before:inset-x-0 before:h-1
  before:bg-gradient-to-r before:from-gold-600 before:to-gold-400
  before:transform before:scale-x-0 before:origin-left
  before:transition-transform before:duration-300
  hover:before:scale-x-100
">
  {/* Card content */}
</div>
```

#### Data Tables

```tsx
// Premium table styling
<table className="w-full">
  <thead>
    <tr className="border-b border-border-DEFAULT">
      <th className="
        px-4 py-3 text-left
        text-xs font-semibold uppercase tracking-wider
        text-text-tertiary bg-surface-2
      ">
        Column Header
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border-subtle">
    <tr className="
      hover:bg-surface-2 transition-colors duration-100
      group
    ">
      <td className="
        px-4 py-3 text-sm text-text-secondary
        group-hover:text-text-primary
      ">
        Cell content
      </td>
    </tr>
  </tbody>
</table>
```

#### Form Inputs

```tsx
// Premium input field
<input className="
  w-full px-4 py-3
  bg-surface-2 border border-border-DEFAULT rounded-lg
  text-text-primary placeholder-text-muted
  focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600
  hover:border-border-strong
  transition-all duration-150
"/>

// With label and helper text
<div className="space-y-1.5">
  <label className="block text-sm font-medium text-text-secondary">
    Field Label
  </label>
  <input className="..." />
  <p className="text-xs text-text-tertiary">
    Helper text goes here
  </p>
</div>
```

#### Progress Bars

```tsx
// Covenant headroom bar
<div className="relative h-2 bg-surface-3 rounded-full overflow-hidden">
  {/* Background gradient track */}
  <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-success via-warning to-danger" />

  {/* Fill bar */}
  <div
    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />

  {/* Threshold marker */}
  <div
    className="absolute top-0 bottom-0 w-0.5 bg-white/50"
    style={{ left: `${threshold}%` }}
  />
</div>
```

### Landing Page Specific Flourishes

#### Hero Section

```tsx
// Animated gradient background
<section className="
  relative overflow-hidden
  bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800
  min-h-[80vh] flex items-center
">
  {/* Subtle grid pattern overlay */}
  <div className="
    absolute inset-0 opacity-[0.03]
    bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]
    bg-[size:40px_40px]
  " />

  {/* Radial glow behind content */}
  <div className="
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
    w-[800px] h-[800px]
    bg-gold-600/10 rounded-full blur-3xl
  " />

  {/* Content */}
  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
    <h1 className="
      font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white
      tracking-tight leading-tight
    ">
      Credit Agreements as{' '}
      <span className="text-gold-400">Code</span>
    </h1>

    <p className="
      mt-6 text-lg md:text-xl text-white/70
      font-display italic
    ">
      Read like legal documents. Run like programs.
    </p>
  </div>
</section>
```

#### Feature Cards with Icons

```tsx
<div className="
  group relative
  bg-surface-1 border border-border-DEFAULT rounded-xl
  p-6 md:p-8
  hover:border-gold-600/50
  transition-all duration-300
">
  {/* Icon container with gradient background */}
  <div className="
    w-12 h-12 mb-4
    bg-gradient-to-br from-gold-600/20 to-gold-600/5
    border border-gold-600/20
    rounded-lg flex items-center justify-center
    group-hover:scale-110 group-hover:border-gold-600/40
    transition-all duration-300
  ">
    <IconComponent className="w-6 h-6 text-gold-500" />
  </div>

  <h3 className="font-display text-lg font-medium text-text-primary mb-2">
    Feature Title
  </h3>

  <p className="text-sm text-text-tertiary leading-relaxed">
    Feature description that explains the value proposition clearly.
  </p>
</div>
```

#### Industry Selector Cards

```tsx
<button className="
  group relative overflow-hidden
  bg-surface-1 border-2 border-border-DEFAULT rounded-2xl
  p-8 text-left
  hover:border-gold-600
  focus:outline-none focus:ring-2 focus:ring-gold-600 focus:ring-offset-2 focus:ring-offset-surface-0
  transition-all duration-300
">
  {/* Background image with overlay */}
  <div className="
    absolute inset-0 opacity-10 group-hover:opacity-20
    bg-cover bg-center transition-opacity duration-300
  " style={{ backgroundImage: `url(${industryImage})` }} />

  {/* Content */}
  <div className="relative z-10">
    <div className="text-3xl mb-4">{industryEmoji}</div>
    <h3 className="font-display text-xl font-medium text-text-primary mb-2">
      {industryName}
    </h3>
    <p className="text-sm text-text-tertiary mb-4">
      {industryDescription}
    </p>
    <span className="
      inline-flex items-center gap-2
      text-gold-500 font-medium text-sm
      group-hover:gap-3 transition-all duration-200
    ">
      Explore Demo
      <ArrowRight className="w-4 h-4" />
    </span>
  </div>
</button>
```

### Accessibility Requirements

- **Color contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus states:** Visible focus rings on all interactive elements
- **Touch targets:** Minimum 44x44px on mobile
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **Screen readers:** Proper ARIA labels, semantic HTML
- **Keyboard navigation:** Full keyboard accessibility, logical tab order

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Print Styles (for Export)

```css
@media print {
  /* Hide UI chrome */
  nav, .theme-toggle, .export-button { display: none; }

  /* Reset backgrounds for printing */
  body { background: white; color: black; }
  .card { border: 1px solid #ccc; box-shadow: none; }

  /* Ensure charts/data are visible */
  .chart { break-inside: avoid; }

  /* Add ProViso branding to footer */
  body::after {
    content: 'Generated by ProViso | proviso-demo.haslun.online';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 10px;
    color: #666;
  }
}
```

---

## Implementation Order

```
Phase 1: Deployment (CRITICAL - do first)
    ├── 1.1 Create vercel.json
    ├── 1.2 Update vite.config.ts
    ├── 1.3 Deploy to Vercel
    └── 1.4 Configure DNS

Phase 2: Landing (HIGH - core experience)
    ├── 2.1 Create Landing.tsx
    ├── 2.2 Feature cards content
    ├── 2.3 Industry selector
    ├── 2.4 Route updates
    └── 2.5 Loading screen

Phase 3: Demo Data (MEDIUM - polish)
    ├── 3.1 Create narrative scenarios
    ├── 3.2 Add tension points
    └── 3.3 Update defaults

Phase 4: Export (MEDIUM - takeaway)
    ├── 4.1 Wire export button
    ├── 4.2 Create export modal
    ├── 4.3 PDF generation
    ├── 4.4 Word generation
    └── 4.5 JSON export

Phase 5: Analytics (LOW - optional)
    ├── 5.1 Add Plausible
    ├── 5.2 Feedback link
    └── 5.3 Event tracking
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `dashboard/vercel.json` | Vercel deployment config |
| `dashboard/src/pages/Landing.tsx` | Landing page |
| `dashboard/src/components/landing/LoadingScreen.tsx` | Animated load screen |
| `dashboard/src/components/landing/IndustrySelector.tsx` | Demo selector |
| `dashboard/src/components/landing/FeatureCard.tsx` | Feature card component |
| `dashboard/src/components/landing/Hero.tsx` | Hero section |
| `dashboard/src/components/landing/Footer.tsx` | Branded footer |
| `dashboard/src/components/landing/ThemeToggle.tsx` | Light/dark mode switcher |
| `dashboard/src/components/ui/Skeleton.tsx` | Loading skeleton component |
| `dashboard/src/components/ui/ProgressBar.tsx` | Premium progress bars |
| `dashboard/src/components/layout/MobileNav.tsx` | Mobile hamburger menu |
| `dashboard/src/components/layout/ResponsiveContainer.tsx` | Max-width wrapper |
| `dashboard/src/components/export/ExportModal.tsx` | Export options |
| `dashboard/src/data/demo-scenarios.ts` | Narrative demo data |
| `dashboard/src/hooks/useMediaQuery.ts` | Responsive breakpoint hook |
| `dashboard/src/hooks/useReducedMotion.ts` | Accessibility motion hook |
| `dashboard/src/styles/animations.css` | Reusable animation classes |

## Files to Modify

| File | Changes |
|------|---------|
| `dashboard/src/App.tsx` | Add Landing route, LoadingScreen wrapper |
| `dashboard/index.html` | Add Google Fonts, analytics script |
| `dashboard/tailwind.config.js` | Add EB Garamond font family |
| `dashboard/src/data/default-financials.ts` | Add tension to demo data |
| `dashboard/src/pages/monitoring/MonitoringDashboard.tsx` | Wire export button |

---

## Design System Updates

### Full `dashboard/tailwind.config.js` Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Typography
      fontFamily: {
        display: ['EB Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      // Colors (comprehensive palette)
      colors: {
        gold: {
          50: '#FDF8E8',
          100: '#FAF0D1',
          200: '#F5E1A3',
          300: '#EFD175',
          400: '#E8C147',
          500: '#D4A84B',
          600: '#B8860B', // Primary
          700: '#966D09',
          800: '#745407',
          900: '#523B05',
        },
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#9EABC2',
          300: '#7789AB',
          400: '#506894',
          500: '#2D3F5F',
          600: '#1A2744', // Primary
          700: '#141D33',
          800: '#111827',
          900: '#0A0F17',
        },
        surface: {
          0: '#0F0F0F',
          1: '#151515',
          2: '#1C1C1A',
          3: '#242422',
          4: '#2C2C2A',
        },
      },

      // Spacing (4px base)
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },

      // Border radius
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      // Box shadows
      boxShadow: {
        'gold-sm': '0 0 0 2px rgba(184, 134, 11, 0.2)',
        'gold': '0 0 0 4px rgba(184, 134, 11, 0.15), 0 4px 12px rgba(184, 134, 11, 0.2)',
        'gold-lg': '0 0 0 6px rgba(184, 134, 11, 0.1), 0 8px 24px rgba(184, 134, 11, 0.25)',
        'inner-gold': 'inset 0 0 0 1px rgba(184, 134, 11, 0.5)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.35)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.4)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.45)',
      },

      // Animations
      animation: {
        'icon-pulse': 'iconPulse 2s ease-in-out infinite',
        'brand-reveal': 'brandReveal 0.8s ease-out forwards',
        'loading-progress': 'loadingProgress 1.5s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'countUp 0.4s ease-out',
      },
      keyframes: {
        iconPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(184, 134, 11, 0.4)',
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 12px rgba(184, 134, 11, 0)',
          },
        },
        brandReveal: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        loadingProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // Transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },

      // Typography scale
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '1rem' }],       // 10px
        'display-sm': ['2.25rem', { lineHeight: '1.2' }],  // 36px
        'display-md': ['3rem', { lineHeight: '1.1' }],     // 48px
        'display-lg': ['3.75rem', { lineHeight: '1.1' }],  // 60px
      },

      // Max widths
      maxWidth: {
        'prose': '65ch',
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};
```

### Update `dashboard/index.html`

```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="ProViso - Credit Agreements as Code. Instant compliance checking, basket tracking, and pro forma simulation." />

  <!-- Preconnect to font servers -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Fonts with display swap -->
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23B8860B' width='100' height='100' rx='12'/%3E%3Ctext x='50' y='68' text-anchor='middle' fill='%231a2744' font-family='Georgia' font-size='52' font-weight='600'%3EP%3C/text%3E%3C/svg%3E" />

  <title>ProViso | Credit Agreements as Code</title>

  <!-- Theme initialization (prevent flash) -->
  <script>
    (function() {
      const saved = localStorage.getItem('proviso-theme');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>
</head>
<body class="bg-surface-0 text-text-primary antialiased">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] `proviso-demo.haslun.online` loads dashboard
- [ ] All routes work with browser refresh
- [ ] HTTPS certificate valid

### Phase 2 Complete When:
- [ ] Landing page at `/` is visually polished
- [ ] Value proposition clear in 5 seconds
- [ ] Can navigate to demo in 2 clicks
- [ ] Loading screen plays on first visit
- [ ] **Mobile:** Navigation works via hamburger menu
- [ ] **Tablet:** Layout adapts gracefully at 768px
- [ ] **Desktop:** Full experience with generous whitespace

### Phase 3 Complete When:
- [ ] Demo immediately shows interesting data
- [ ] At least one "near breach" scenario visible
- [ ] Historical trend visible in compliance chart

### Phase 4 Complete When:
- [ ] Export button produces downloadable file
- [ ] File is useful standalone (has context)

### Phase 5 Complete When:
- [ ] Can see page view stats
- [ ] Have received at least 1 feedback email

### UI Quality Gate (All Phases)
Before marking any phase complete, verify:

- [ ] **Typography:** EB Garamond loads for headings, DM Sans for body
- [ ] **Colors:** Gold accents (#B8860B) visible on CTAs and highlights
- [ ] **Spacing:** Consistent 4px grid alignment
- [ ] **Animations:** Smooth 150-300ms transitions, no jank
- [ ] **Shadows:** Proper elevation hierarchy (sm → xl)
- [ ] **Focus states:** Visible gold focus rings on all interactive elements
- [ ] **Mobile (375px):** All content accessible, no horizontal scroll
- [ ] **Tablet (768px):** Two-column layouts where appropriate
- [ ] **Desktop (1280px):** Full layout with max-width container
- [ ] **Reduced motion:** Animations respect prefers-reduced-motion
- [ ] **Dark mode:** All colors have appropriate dark variants
- [ ] **Loading states:** Skeleton loaders for async content

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| DNS propagation delay | Deploy to Vercel default domain first, add custom later |
| Bundle too large | Already optimized (243KB gzipped), monitor in Vercel |
| Demo data confusing | Start with simplest scenario (corporate revolver) |
| Mobile layout breaks | Test at 320px, 375px, 768px, 1024px breakpoints before launch |
| Animations feel cheap | Use easing curves, stagger delays, avoid bounce on data elements |
| Dark mode only | Implement light mode toggle for users who prefer it |
| Fonts fail to load | Use font-display: swap, provide system font fallbacks |

---

## Notes for Builder

### Development Priorities

1. **Start with Phase 1** - Get deployment working before polishing UX
2. **Test SPA routing** - Vercel rewrites must work for `/deals/:id/monitor` etc.
3. **Reuse precedent styling** - Don't reinvent, adapt the CSS from closing-room-demo
4. **Keep landing page light** - Code split so it loads fast
5. **Demo should "wow"** - The first 10 seconds matter most

### Premium UI Principles

1. **Every pixel matters** - Alignment, spacing, and visual rhythm should be precise
2. **Motion has meaning** - Animations guide attention, don't distract
3. **Gold is precious** - Use sparingly for emphasis (CTAs, active states, highlights)
4. **Typography tells hierarchy** - EB Garamond for authority, DM Sans for clarity
5. **Dark mode is primary** - Light mode is secondary but should work perfectly
6. **Responsive is not optional** - Test at 320px, 375px, 768px, 1024px, 1440px

### Quality Checklist Before Each PR

- [ ] No horizontal scroll at any breakpoint
- [ ] All buttons have hover and focus states
- [ ] All cards have subtle hover elevation
- [ ] All animations are smooth (60fps)
- [ ] All text is readable (contrast ratio ≥ 4.5:1)
- [ ] All icons are aligned with text baselines
- [ ] All numbers use tabular figures for alignment
- [ ] Loading states exist for all async operations
- [ ] Error states are helpful, not generic

### Mobile-First Approach

Build mobile layout first, then enhance for larger screens:

```tsx
// Example: Card grid
<div className="
  grid gap-4
  grid-cols-1           // Mobile: single column
  sm:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-3        // Desktop: 3 columns
">
```

### Testing Devices

Test on these viewports minimum:
- **iPhone SE:** 375 x 667 (small phone)
- **iPhone 14 Pro:** 393 x 852 (modern phone)
- **iPad Mini:** 768 x 1024 (tablet portrait)
- **iPad Pro:** 1024 x 1366 (tablet landscape)
- **MacBook Air:** 1440 x 900 (laptop)
- **External monitor:** 1920 x 1080 (desktop)

---

## Appendix: Precedent File Locations

```
.claude/precedent/closing-room-demo/
├── src/templates/
│   ├── landing.html      # Hero, features, login form
│   ├── base.html         # Nav, CSS variables, loading screen
│   ├── deal-room.html    # Stats, checklist, activity
│   └── ...
├── static/css/
│   └── style.css         # Basic styles (less useful)
└── data/
    └── *.json            # Sample domain data (less relevant)
```
