# ProViso Demo — De-Identification Handoff

## Objective
Remove real-world names from the public demo. The demo's fictional deals are currently populated with **real law firms, banks, vendors, and — importantly — real project names**, plus real email domains. Replace them all with the invented equivalents in the tables below so the demo stays realistic but can't be tied to any actual transaction.

## Scope & method (read before editing)
- **Primary files** (where ~95% of these live): `dashboard/src/data/demo-scenarios.ts`, `dashboard/src/data/closing-demo.ts`, `dashboard/src/data/negotiation-demo.ts`, `dashboard/src/data/demo.ts`, `dashboard/src/data/default-financials.ts`, plus a few in `dashboard/src/components/**` and `dashboard/src/pages/**` (noted per row where known).
- **The repo is public** (`github.com/wch1125/ProViso`), so also grep the whole tree — including `examples/*.proviso`, `examples/*.json`, `ontology/`, and any docs — for each old string. These strings live in source history too; this only fixes going forward.
- **Replace longest / most-specific strings first** (e.g. `Simpson Thacher & Bartlett LLP` before `Simpson Thacher`; `Desert Sun Solar Project` before `Desert Sun`) so you don't leave dangling fragments like "…& Bartlett LLP".
- **After replacing, re-grep** for every "Find" value (and the bare surnames like `Wardwell`, `Vestas`, `Leidos`, `Kirkland`) to catch stragglers.
- **Sanity-check the replacements**: these invented names were chosen to avoid known real entities, but do a quick check that none coincidentally match a real firm/company before committing.
- **Then** `npm run build && npm test`, and push through the normal branch → PR flow (recall `main` auto-deploys to proviso.finance).

---

## Table 1 — Law firms (all real → invented)
Replace full forms first, then short forms.

| Find (real) | Replace with |
|---|---|
| `Simpson Thacher & Bartlett LLP` | `Whitfield & Barr LLP` |
| `Simpson Thacher & Bartlett` | `Whitfield & Barr` |
| `Simpson Thacher` | `Whitfield & Barr` |
| `Davis Polk & Wardwell LLP` | `Merrick Callan & Hoyt LLP` |
| `Davis Polk & Wardwell` | `Merrick Callan & Hoyt` |
| `Davis Polk` | `Merrick Callan` |
| `Kirkland & Ellis LLP` | `Ashcroft & Lund LLP` |
| `Kirkland & Ellis` | `Ashcroft & Lund` |
| `Latham & Watkins LLP` | `Carrington & Reese LLP` |
| `Latham & Watkins` | `Carrington & Reese` |
| `Milbank LLP` | `Thornbury LLP` |
| `Milbank` | `Thornbury` |
| `Paul, Weiss LLP` | `Halloran LLP` |
| `Paul, Weiss` | `Halloran` |
| `Paul Weiss` | `Halloran` |
| `Cahill Gordon & Reindel` | `Beckett Hale & Munro` |
| `Cahill Gordon` | `Beckett Hale` |
| `Richards Kibbe & Orbe` | `Sutcliffe Kane & Rowe` |
| `Richards Kibbe` | `Sutcliffe Kane` |

---

## Table 2 — Banks / lenders (real → invented)

| Find (real) | Replace with |
|---|---|
| `JPMorgan Chase` | `Northgate National Bank` |
| `JPMorgan` | `Northgate` |
| `MUFG` | `Keystone Global Bank` |
| `CoBank` | `AgriTrust Cooperative Bank` |

*(“First National Bank,” “Regional Capital/Credit Partners,” “Midwest Credit Fund,” “Tax Equity Fund LP” are fictional — see Table 4 for the ones worth renaming for consistency.)*

---

## Table 3 — Vendors / counterparties / independent engineers (real → invented)

| Find (real) | Replace with |
|---|---|
| `First Solar EPC LLC` | `Vantage Solar EPC LLC` |
| `First Solar` | `Vantage Solar` |
| `NextEra Energy Services` | `Crestline Energy Services` |
| `Vestas Wind Systems` | `Galewind Turbine Systems` |
| `Vestas` | `Galewind` |
| `DNV Energy` | `Sterling Independent Engineers` |
| `DNV` | `Sterling IE` |
| `Leidos Engineering` | `Broadmoor Engineering` |
| `Leidos` | `Broadmoor` |
| `Arizona Public Service` | `Sonora State Power` |
| `Great Plains Electric Cooperative` | `Frontier Electric Cooperative` |

---

## Table 4 — Deals, entities & projects (real projects → invented)
**These are the priority items** — per Will, the project names below are real. Keep each project's naming *family* consistent (Holdings / Project Co / the project itself).

| Find | Replace with |
|---|---|
| `Desert Sun Solar Project` | `Coyote Mesa Solar Project` |
| `Desert Sun Project Co LLC` | `Coyote Mesa Project Co LLC` |
| `Desert Sun Holdings LLC` | `Coyote Mesa Holdings LLC` |
| `Desert Sun` (any remaining) | `Coyote Mesa` |
| `Prairie Wind Holdings LLC` | `Ridgeline Wind Holdings LLC` |
| `Prairie Wind Farm` | `Ridgeline Wind Farm` |
| `Prairie Energy Partners` | `Ridgeline Energy Partners` |
| `Prairie Wind` / `PrairieWind` (any remaining) | `Ridgeline Wind` / `Ridgeline` |
| `Sunrise Solar Holdings LLC` | `Silverpeak Solar Holdings LLC` |
| `Sunrise Solar Project` | `Silverpeak Solar Project` |
| `Sunrise Tax Equity` | `Silverpeak Tax Equity` |
| `Sunrise Solar` (any remaining) | `Silverpeak Solar` |
| `Apex Industries Inc.` | `Calderon Industries Inc.` |
| `Apex Industries` | `Calderon Industries` |
| `Regional Capital Partners` | `Rampart Capital Partners` |
| `Regional Credit Partners` | `Rampart Credit Partners` |
| `Midwest Credit Fund` | `Anchor Credit Fund` |
| `Tax Equity Fund LP` | `Cardinal Tax Equity Fund LP` |
| `Renewable Energy Partners` | `Evergreen Renewable Partners` |
| `Metro Office Tower LLC` | `Parkside Tower LLC` |

**Leave as-is (already fictional):** `ABC Holdings, Inc.`, `ABC Parent Corp.`, `ABC Acquisition Facility` (Will confirmed ABC is made up); `Acme Corp` / `Acme Holdings LLC` and `Greenfield Solar Project` (obvious template placeholders). Change only if you want naming consistency — not required.

---

## Table 5 — People (priority + optional)
**Priority — change no matter what:** `Elizabeth Warren` → `Diane Foster` (real U.S. Senator's name used as a placeholder).

The rest appear fabricated and are lower priority; rename them only for full de-identification, and if you do, update the matching email local-parts in Table 6. Suggested set (all confined to `demo-scenarios.ts` / `closing-demo.ts` / `negotiation-demo.ts`):

| Find | Replace with |  | Find | Replace with |
|---|---|---|---|---|
| `Elizabeth Warren` | `Diane Foster` |  | `Andrew Blake` | `Grant Weller` |
| `William Harris` | `Peter Nolan` |  | `David Kim` | `Aaron Fields` |
| `Robert Kim` | `Neil Barrett` |  | `Mark Stevens` | `Daniel Reyes` |
| `Jennifer Walsh` | `Karen Pruitt` |  | `Rachel Green` | `Nina Alvarez` |
| `Susan Clark` | `Paula Rhodes` |  | `Brian Mitchell` | `Kevin Doyle` |
| `Lisa Yamamoto` | `Grace Okada` |  | `Thomas White` | `Carl Bishop` |
| `Jennifer Chen` | `Monica Ellis` |  | `Michael Rodriguez` | `Steven Cole` |
| `John Smith` | `Alan Pierce` |  | `Amanda Lee` | `Rita Moss` |
| `Robert Martinez` | `Victor Hale` |  | `James Cooper` | `Gregory Dunn` |
| `Katherine Chen` | `Helen Ward` |  | `Patricia Reynolds` | `Laura Quinn` |
| `Richard Clarke` | `Martin Vale` |  | `David Park` | `Owen Fitch` |
| `James Wilson` | `Craig Sutton` |  | `Sarah Johnson` | `Emma Bright` |
| `Sarah Thompson` | `Dana Frost` |  | `Emily Davis` | `Claire Nunez` |
| `Michael Brown` | `Henry Adler` |  | `Henrik Jensen` | `Anders Holt` |
| `Mark Torres` | `Philip Reed` |  | `Patricia Nguyen` | `Grace Tran` |
| `Robert Hall` | `Dean Marsh` |  |  |  |

---

## Table 6 — Email addresses
**Rule:** change the domain of **every** email address to `example.com` (the reserved domain that can never resolve). Do **not** touch `proviso.finance`, `proviso.dev`, or `haslun.online` — those are Will's.

Priority (real firm/bank/vendor domains):

| Find | Replace with |
|---|---|
| `elizabeth.warren@davispolk.com` | `diane.foster@example.com` |
| `ablake@stblaw.com` | `gweller@example.com` |
| `wharris@stblaw.com` | `pnolan@example.com` |
| `associate@simpsonthacher.com` | `associate@example.com` |
| `david.kim@lw.com` | `aaron.fields@example.com` |
| `partner@davispolk.com` | `partner@example.com` |
| `robert.kim@davispolk.com` | `neil.barrett@example.com` |
| `mstevens@kirkland.com` | `dreyes@example.com` |
| `jwalsh@milbank.com` | `kpruitt@example.com` |
| `rgreen@paulweiss.com` | `nalvarez@example.com` |
| `sclark@cahill.com` | `prhodes@example.com` |
| `bmitchell@jpmorgan.com` | `kdoyle@example.com` |
| `lyamamoto@mufg.com` | `gokada@example.com` |
| `twhite@cobank.com` | `cbishop@example.com` |
| `engineer@dnv.com` | `engineer@example.com` |
| `engineer@leidos.com` | `engineer@example.com` |
| `contracts@firstsolar.com` | `contracts@example.com` |

Remaining (already-fictional domains — still switch to `example.com`): `admin@abcholdings.com`, `cfo@abcholdings.com`, `jchen@abcholdings.com`, `mrodriguez@abcholdings.com`, `john.smith@abcholdings.com`, `jchen@company.com`, `rclarke@abcparent.com`, `alee@desertsun.com`, `rmartinez@desertsun.com`, `jcooper@prairiewind.com`, `kchen@taxequityfund.com`, `preynolds@apexind.com`, `dpark@rcp.com`, `jwilson@fnb.com`, `sjohnson@fnb.com`, `sthompson@fnb.com`. (If you applied the Table 5 renames, align these local-parts to the new names; otherwise leaving the local-parts is fine.)

---

## Table 7 — Document filenames (embed project/vendor names)
These are fake filenames in `demo-scenarios.ts` that contain the real project/vendor names; rename their prefixes to match Table 4/3.

| Find (prefix/substring) | Replace with |
|---|---|
| `DesertSun_` (e.g. `DesertSun_Financial_Model.xlsx`) | `CoyoteMesa_` |
| `PrairieWind_` (e.g. `PrairieWind_Credit_Agreement.pdf`, `PrairieWind_IE_Report_DNV.pdf`, `PrairieWind_TSA_Vestas.pdf`) | `Ridgeline_` |
| `_DNV` within filenames | `_SterlingIE` |
| `_Vestas` within filenames | `_Galewind` |
| `ABC_…` filenames | leave (ABC is fictional) |

---

## Table 8 — Optional (Tier B): state agencies / utilities that narrow identification
Only needed if you want to fully sever the link to the real projects' locations. Generic federal bodies (FERC, FAA, NEPA, OFAC) can stay — they appear in every deal of this type. The state-specific ones below, combined with a real utility, could help identify a project:

| Find | Replace with (suggested) |
|---|---|
| `Arizona Corporation Commission` | `Sonora State Utility Commission` |
| `Oklahoma Corporation Commission` | `Midland State Utility Commission` |
| `California Air Resources Board` | `State Air Resources Board` |
| `Arizona Public Service` | `Sonora State Power` *(also in Table 3)* |

---

## Verification checklist (for the Code instance)
1. Applied every row above; replaced longest strings first.
2. Re-grepped the **whole repo** (not just `dashboard/`) for each old value **and** the bare surnames: `Wardwell`, `Bartlett`, `Kirkland`, `Ellis`, `Latham`, `Watkins`, `Milbank`, `Cahill`, `Reindel`, `Vestas`, `Leidos`, `DNV`, `NextEra`, `First Solar`, `Desert Sun`, `Prairie Wind`, `Sunrise Solar`, `JPMorgan`, `MUFG`, `CoBank`, `Elizabeth Warren`. Zero hits expected.
3. Confirmed no email domain other than `proviso.finance` / `proviso.dev` / `haslun.online` remains.
4. Spot-checked that the invented names don't collide with a real entity.
5. `npm run build && npm test` green.
6. Opened a PR (don't push straight to `main`, which auto-deploys).
