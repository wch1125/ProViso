# Implementation Plan: v2.0 Phase 1 — Core Infrastructure

## Objective

Build the foundational data layer and base UI components for CreditLang Hub, enabling multi-deal, multi-version management with a premium aesthetic. This phase establishes the persistence layer, API structure, and reusable UI components that all subsequent phases depend on.

### What "Done" Looks Like

- A working Deal/Version/Party data model with TypeScript types
- In-memory persistence layer with CRUD operations
- API layer structure (functions, not HTTP endpoints yet)
- Premium base components (Button, Input, Select, Modal, DataTable)
- Demo data showing negotiation workflow
- 25+ tests covering data models and persistence

---

## Acceptance Criteria

- [ ] Deal, DealVersion, DealParty, Contact interfaces defined
- [ ] Change, ChangeSummary interfaces defined
- [ ] ConditionPrecedent, Document, Signature interfaces defined (v2.0 closing models)
- [ ] In-memory Store class with create/read/update/delete for deals and versions
- [ ] API functions: createDeal, getDeal, listDeals, createVersion, getVersion, listVersions
- [ ] 8+ premium base components (Button, Input, Select, TextArea, Modal, DataTable, Tabs, Badge)
- [ ] Theme extended with gold accent (per spec)
- [ ] Demo deal with 3 versions showing negotiation flow
- [ ] 25+ passing tests

---

## Approach

Phase 1 establishes the data foundation without touching Word integration or AI. We're building:

1. **Data models** in `src/hub/types.ts` — the v2.0 Deal/Version/Change structures from the spec
2. **Persistence layer** in `src/hub/store.ts` — in-memory Map-based store (PostgreSQL can replace later)
3. **API layer** in `src/hub/api.ts` — pure TypeScript functions that operate on the store
4. **Base components** in `dashboard/src/components/base/` — design system primitives
5. **Extended theme** — add gold accent palette to Tailwind config
6. **Demo data** — realistic negotiation scenario for testing

### Key Design Decisions

1. **In-memory store first**: Defers PostgreSQL setup; store interface stays the same
2. **Separate `hub/` directory**: v2.0 code lives alongside v1.0; no disruption to CLI
3. **No HTTP server yet**: API is just functions; Express/Fastify can wrap later
4. **Extend existing dashboard**: Reuse Vite/React/Tailwind setup from v1.0 dashboard

---

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `src/hub/types.ts` | Create | Deal, Version, Party, Change, CP, Document models |
| `src/hub/store.ts` | Create | In-memory persistence with Store class |
| `src/hub/api.ts` | Create | CRUD functions for deals and versions |
| `src/hub/index.ts` | Create | Public exports for hub module |
| `src/index.ts` | Modify | Add hub exports |
| `dashboard/src/components/base/Button.tsx` | Create | Premium button with variants |
| `dashboard/src/components/base/Input.tsx` | Create | Text input with label and error state |
| `dashboard/src/components/base/Select.tsx` | Create | Dropdown select |
| `dashboard/src/components/base/TextArea.tsx` | Create | Multi-line text input |
| `dashboard/src/components/base/Modal.tsx` | Create | Dialog with overlay |
| `dashboard/src/components/base/DataTable.tsx` | Create | Sortable, paginated table |
| `dashboard/src/components/base/Tabs.tsx` | Create | Tab navigation |
| `dashboard/src/components/base/Badge.tsx` | Create | Status badge (extends StatusBadge) |
| `dashboard/src/components/base/index.ts` | Create | Barrel export |
| `dashboard/tailwind.config.js` | Modify | Add gold accent palette |
| `dashboard/src/data/negotiation-demo.ts` | Create | Demo deal with 3 versions |
| `tests/hub.test.ts` | Create | Unit tests for hub module |

---

## Steps

### 1. Data Models (src/hub/types.ts)

Define TypeScript interfaces matching the v2.0 spec:

```
1. [ ] Deal interface (id, name, dealType, status, parties, dates)
2. [ ] DealVersion interface (id, dealId, versionNumber, creditLangCode, status)
3. [ ] DealParty and Contact interfaces
4. [ ] ChangeSummary and Change interfaces
5. [ ] ConditionPrecedent interface (v2.0 closing model)
6. [ ] Document and Signature interfaces
7. [ ] FinancialSubmission and DrawRequest interfaces
```

### 2. Persistence Layer (src/hub/store.ts)

Implement in-memory store:

```
8. [ ] Store class with Map<string, Deal>, Map<string, DealVersion>
9. [ ] generateId() utility for UUIDs
10. [ ] deal CRUD: create, get, list, update, delete
11. [ ] version CRUD: create, get, list (by dealId), update
12. [ ] party CRUD: add, remove, list (by dealId)
```

### 3. API Layer (src/hub/api.ts)

Business logic functions:

```
13. [ ] createDeal(input) → Deal
14. [ ] getDeal(id) → Deal | null
15. [ ] listDeals(filter?) → Deal[]
16. [ ] updateDeal(id, updates) → Deal
17. [ ] createVersion(dealId, input) → DealVersion
18. [ ] getVersion(id) → DealVersion | null
19. [ ] listVersions(dealId) → DealVersion[]
20. [ ] getVersionHistory(dealId) → DealVersion[] (chronological)
```

### 4. Premium Base Components

Build design system primitives:

```
21. [ ] Button — primary, secondary, ghost, danger variants; sizes sm/md/lg
22. [ ] Input — with label, helpText, error, disabled states
23. [ ] Select — with options, placeholder, error states
24. [ ] TextArea — with label, rows, character count
25. [ ] Modal — with title, body, footer; open/close state
26. [ ] DataTable — columns definition, sorting, pagination
27. [ ] Tabs — tab list with panels
28. [ ] Badge — extends StatusBadge with more variants
```

### 5. Theme Extension

```
29. [ ] Add gold accent palette to tailwind.config.js
         gold: { 50: '#fefce8', 100: '#fef9c3', ..., 500: '#D4AF37', 900: '#713f12' }
30. [ ] Add font: Playfair Display for display headings (optional)
```

### 6. Demo Data

```
31. [ ] Create negotiation-demo.ts with:
         - Deal: "ABC Acquisition Facility"
         - Version 1: Lender's Initial Draft (sent)
         - Version 2: Borrower's Markup (received)
         - Version 3: Lender's Counter (draft)
         - Parties: Borrower, Lender, Agent, Davis Polk, Simpson Thacher
```

### 7. Tests

```
32. [ ] Test Deal CRUD operations
33. [ ] Test Version CRUD operations
34. [ ] Test version lineage (parent → child)
35. [ ] Test party management
36. [ ] Test generateId uniqueness
37. [ ] Test store isolation (separate instances)
```

### 8. Integration

```
38. [ ] Export hub module from src/index.ts
39. [ ] Verify build passes
40. [ ] Update current-status.md
```

---

## Risks & Unknowns

| Risk | Mitigation |
|------|------------|
| Store interface may need changes for PostgreSQL | Design interface abstractly; use dependency injection |
| Base components may not cover all v2.0 needs | Build only what Phase 1 needs; extend in later phases |
| Gold accent may clash with existing theme | Test with existing dashboard components first |
| Demo data CreditLang may have syntax issues | Use simple, known-good .crl snippets |

---

## Dependencies

**No new npm dependencies needed for Phase 1.**

The existing stack covers everything:
- TypeScript for types
- Vitest for tests
- React + Tailwind for components
- Lucide for icons

---

## Estimate

- **Scope:** Medium
- **Files:** 18 files (12 new, 6 modified)
- **Tests:** 25+
- **Estimated steps:** 40

---

## Ready to Proceed?

**Yes** — Phase 1 has no external dependencies and builds on the existing v1.0 foundation.

### Before Starting

1. Verify `npm run build` passes
2. Verify `npm test` passes (220 tests)
3. Verify `npm run dashboard:build` passes

### Questions for User

1. **Store interface**: Should I include a `StoreInterface` abstraction for future PostgreSQL swap, or just implement the in-memory version directly?

2. **Component library**: Should base components use `class-variance-authority` (cva) for variant management, or plain Tailwind classnames?

3. **Gold vs current accent**: The spec shows gold (#D4AF37) as the primary accent. The current dashboard uses blue (accent-500: #0ea5e9). Should we:
   - a) Replace blue with gold globally
   - b) Add gold as a secondary accent
   - c) Keep blue for v1.0 dashboard, use gold only in v2.0 components

---

## Handoff Notes

When Phase 1 is complete, Phase 2 (Form System) can begin. The Form System will:
- Import types from `src/hub/types.ts`
- Use base components from `dashboard/src/components/base/`
- Save form outputs to the store via `src/hub/api.ts`

Phase 1 is the foundation—everything else builds on it.
