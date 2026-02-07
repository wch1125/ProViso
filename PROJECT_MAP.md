# ProViso — Project Map

Quick-reference guide to the repository structure. For detailed documentation, see `docs/GETTING_STARTED.md`.

**Version:** 2.6.0 | **Tests:** 679 | **Live Demo:** [proviso-demo.haslun.online](https://proviso-demo.haslun.online)

---

## Directory Tree

```
ProViso/
├── grammar/                    # PEG grammar definition (THE source of truth for syntax)
│   └── proviso.pegjs           #   The grammar — start here to understand the language
│
├── src/                        # Core TypeScript engine
│   ├── parser.ts               #   Peggy wrapper with TypeScript types
│   ├── interpreter.ts          #   Evaluates AST against financial data (~3,500 lines)
│   ├── types.ts                #   All TypeScript interfaces
│   ├── validator.ts            #   Semantic validation (20 statement types)
│   ├── cli.ts                  #   CLI with 16 commands
│   ├── index.ts                #   Public API exports
│   ├── closing-enums.ts        #   Vocabulary enums for closing workflows
│   ├── ontology.ts             #   Credit agreement ontology system
│   ├── defined-terms.ts        #   Defined terms parsing & analysis
│   └── hub/                    #   Deal Hub modules (v2.0+)
│       ├── api.ts              #     Deal, version, party management
│       ├── store.ts            #     In-memory persistence (StoreInterface for future DB)
│       ├── types.ts            #     Hub data models
│       ├── forms/              #     Form definitions & code generation
│       ├── versioning/         #     Diff engine, change classification, changelog
│       ├── word/               #     Word document generation, drift detection
│       ├── closing/            #     Conditions precedent, documents, signatures
│       └── postclosing/        #     Financial submissions, draw requests, scenarios
│
├── dashboard/                  # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── App.tsx             #   Routes: / → Landing, /deals → Pipeline, /deals/:id/*
│   │   ├── pages/              #   7 page components (Landing, About, DealList, etc.)
│   │   ├── components/         #   80+ components organized by feature
│   │   │   ├── base/           #     Reusable UI primitives (Button, Modal, Badge, etc.)
│   │   │   ├── layout/         #     TopNav, DealPageLayout
│   │   │   ├── landing/        #     Hero, Features, IndustrySelector, Footer
│   │   │   ├── closing/        #     CPChecklist, DocumentTracker, SignatureTracker
│   │   │   ├── postclosing/    #     ComplianceTrendChart, ScenarioSimulator
│   │   │   ├── editors/        #     CovenantEditor, BasketEditor
│   │   │   ├── demo/           #     GuidedDemo terminal, command runner
│   │   │   ├── charts/         #     Sparkline, SparklineCard
│   │   │   ├── diff/           #     DiffViewer (side-by-side code diff)
│   │   │   ├── export/         #     ExportModal (PDF, Word, JSON, .proviso)
│   │   │   ├── industry/       #     PerformanceChart, TaxEquityPanel, etc.
│   │   │   └── templates/      #     TemplatePicker
│   │   ├── context/            #   5 React contexts (ProViso, Deal, Demo, Closing, Theme)
│   │   ├── data/               #   Demo data and default code
│   │   ├── utils/              #   Narrative generators, threshold detection, export
│   │   └── themes/             #   Industry-specific color themes
│   ├── dist/                   #   Production build (deployed to GitHub Pages)
│   └── READ-ME-DASHBOARD.md    #   Dashboard-specific documentation
│
├── tests/                      # Vitest test suite (679 tests across 12 files)
│   ├── proviso.test.ts         #   Core language tests (239 tests)
│   ├── hub.test.ts             #   Deal/version/party tests (45 tests)
│   ├── versioning.test.ts      #   Diff & changelog tests (42 tests)
│   ├── forms.test.ts           #   Form validation tests (36 tests)
│   ├── word.test.ts            #   Document generation tests (53 tests)
│   ├── closing.test.ts         #   CP, documents, signatures (38 tests)
│   ├── postclosing.test.ts     #   Submissions, draws, scenarios (27 tests)
│   ├── e2e.test.ts             #   Full workflow integration (9 tests)
│   ├── templates.test.ts       #   Template rendering tests
│   ├── cp-pipeline.test.ts     #   Live CP pipeline tests
│   ├── auto-diff-and-monitoring.test.ts  # Auto-diff & monitoring tests
│   └── redteam.test.ts         #   Red-team regression tests
│
├── examples/                   # Sample .proviso files and financial data
│   ├── corporate_revolver.proviso     # Standard corporate credit facility
│   ├── project_finance.proviso        # Construction-to-operations project finance
│   ├── solar_utility.proviso          # 200MW utility-scale solar with ITC tax equity
│   ├── wind_onshore.proviso           # 150MW wind farm with PTC
│   ├── data_center.proviso            # 50MW critical infrastructure
│   ├── trailing_definitions.proviso   # Trailing period calculation examples
│   ├── amendment_001.proviso          # Amendment overlay example
│   ├── q3_2024_financials.json        # Single-period financial data
│   ├── multi_period_financials.json   # Multi-period (4 quarters)
│   ├── project_finance_demo.json      # Project finance demo data
│   └── solar_utility_financials.json  # Solar with industry-specific data
│
├── docs/                       # User-facing documentation
│   ├── GETTING_STARTED.md      #   Installation, quick start, syntax reference
│   ├── PRODUCT_OVERVIEW.md     #   What ProViso is and who it's for
│   ├── V2_1_INDUSTRY_CONSTRUCTS.md  # Industry-specific language features
│   └── creditlang_planning.md  #   Original planning document
│
├── ontology/                   # Credit agreement ontology definitions
│   └── credit-agreement-v1.json  # 16 doc templates, 12 CP templates, 4 covenant templates
│
├── .claude/                    # Workflow system (gitignored)
│   ├── commands/               #   Role prompts (scout, builder, tester, reviewer, pm, etc.)
│   ├── context/                #   project-context.md (persistent project knowledge)
│   ├── logs/                   #   Session logs by date and role
│   ├── plans/                  #   Build plans and design docs
│   ├── status/                 #   current-status.md + changelog.md
│   ├── decisions/              #   Architecture Decision Records
│   └── precedent/              #   Reference implementations (closing-room-demo)
│
├── .github/workflows/          # CI/CD
│   └── deploy.yml              #   GitHub Pages deployment
│
├── reference/                  # Reference materials (gitignored)
│   ├── *.pdf                   #   Sample credit agreement PDFs
│   └── ocr_pdf.py              #   OCR utility for scanned documents
│
├── CLAUDE.md                   # AI assistant instructions (canonical project reference)
├── README.md                   # Project README
├── PROJECT_MAP.md              # This file
├── package.json                # Root package (engine + CLI)
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Test configuration
└── eslint.config.js            # ESLint 9 flat config
```

## Key Entry Points

| If you want to... | Start here |
|---|---|
| Understand the syntax | `grammar/proviso.pegjs` |
| See how evaluation works | `src/interpreter.ts` |
| Understand the data model | `src/types.ts` |
| Run the CLI | `npm run dev -- --help` |
| Run the dashboard | `npm run dashboard` |
| Run tests | `npm test` |
| Write a .proviso file | `examples/corporate_revolver.proviso` |
| See a full industry example | `examples/solar_utility.proviso` |
| Understand the dashboard | `dashboard/READ-ME-DASHBOARD.md` |
| See the build plan history | `.claude/plans/` |
| See session work logs | `.claude/logs/` |

## Build Commands

```bash
npm install              # Install dependencies
npm run build            # Build grammar + TypeScript
npm test                 # Run 679 tests
npm run dashboard        # Start dashboard dev server (localhost:3000)
npm run dashboard:build  # Production dashboard build
npm run dev -- status examples/corporate_revolver.proviso -d examples/q3_2024_financials.json
```

## Version History (Summary)

| Version | Milestone |
|---------|-----------|
| v0.1 | Core DSL: DEFINE, COVENANT, BASKET, CONDITION, PROHIBIT, EVENT |
| v0.2 | Grower/builder baskets, amendments, cure rights, semantic validation |
| v0.3 | Multi-period data, trailing calculations, compliance history |
| v1.0 | Project finance: phases, milestones, reserves, waterfall, CP |
| v2.0 | Deal Hub: forms, versioning, Word generation, closing, post-closing |
| v2.1 | Industry constructs: solar, wind, data center, tax equity |
| v2.2 | "Living Deal": monitoring, negotiation, closing, lifecycle |
| v2.3 | Public demo deployment at proviso-demo.haslun.online |
| v2.4 | Design system token migration |
| v2.5 | Demo polish: live CP, auto-diff, compliance history, export, nav |
| v2.6 | Step-down covenants, red-team hardening (3 phases, 23 fixes) |
