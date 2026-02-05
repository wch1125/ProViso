# ProViso

**Make Your Credit Agreement Work For You**

---

## The Problem

Credit agreements are dense, complex documents. When your team needs answers, the process is slow and expensive:

| Question | Traditional Approach | Time | Cost |
|----------|---------------------|------|------|
| "Can we make this acquisition?" | Outside counsel memo | 2 weeks | $50,000+ |
| "How much capacity do we have in the RP basket?" | Spreadsheet reconciliation | 2 days | Internal |
| "Are we in compliance this quarter?" | Quarterly scramble | 1 week | $25,000+ |
| "What's the pro forma impact of this financing?" | Model + legal review | 1 week | $30,000+ |

Every quarter, treasury teams manually track baskets in Excel. Every transaction requires a fresh legal analysis. Every covenant test is a fire drill.

---

## The Solution

ProViso turns your credit agreement into a working program. The source file reads like your legal document—but it runs like software.

| Question | ProViso | Time | Cost |
|----------|-----------|------|------|
| "Can we make this acquisition?" | Query the agreement | Instant | Included |
| "How much capacity do we have in the RP basket?" | Check basket status | Instant | Included |
| "Are we in compliance this quarter?" | Run compliance check | Instant | Included |
| "What's the pro forma impact of this financing?" | Simulate transaction | Instant | Included |

---

## What You Get

### Instant Compliance Answers

Upload your quarterly financials. Get immediate answers with full audit trail.

```
╔══════════════════════════════════════════════════════════╗
║                  COMPLIANCE STATUS REPORT                 ║
╚══════════════════════════════════════════════════════════╝

FINANCIAL COVENANTS
────────────────────────────────────────────────────────────
  ✓ Maximum Leverage          3.60x <= 4.50x (headroom: 0.90x)
  ✓ Minimum Interest Coverage 5.45x >= 2.50x (headroom: 2.95x)
  ✓ Minimum Liquidity         $28.4M >= $15.0M

BASKET AVAILABILITY
────────────────────────────────────────────────────────────
  General Investments    ████████████████████ $25.0M available
  Restricted Payments    ████████████████░░░░ $17.0M available
  Permitted Acquisitions ████████████████████ $75.0M available

════════════════════════════════════════════════════════════
OVERALL STATUS: ✓ COMPLIANT
════════════════════════════════════════════════════════════
```

### Automatic Basket Tracking

No more Excel reconciliation. Every utilization is logged with date, amount, and description.

```
BASKET: General Investments
Capacity: $25,000,000

TRANSACTION HISTORY
────────────────────────────────────────────────────────────
  2026-01-15  Tech Co. minority stake      -$5,000,000
  2026-02-28  Green Energy JV              -$8,000,000
  2026-03-10  Capacity release (sale)      +$3,000,000
────────────────────────────────────────────────────────────
  AVAILABLE: $15,000,000
```

### Pro Forma Simulation

Test any transaction before you commit. See exactly how it affects your covenants.

```
PROPOSED: $50M Acquisition of TargetCo

PRO FORMA IMPACT
────────────────────────────────────────────────────────────
                        Current    Pro Forma    Status
  Maximum Leverage      3.60x      4.25x        ✓ COMPLIANT
  Interest Coverage     5.45x      4.80x        ✓ COMPLIANT
  Permitted Acquisitions  $75M available → $25M remaining

RESULT: Transaction is PERMITTED
```

### Amendment Tracking

When your agreement is amended, apply the changes as an overlay. See exactly what changed and when.

```
AMENDMENT HISTORY
────────────────────────────────────────────────────────────
  Amendment 1 (2025-06-15): Covenant Relief
    • Maximum Leverage: 4.50x → 5.00x
    • Added: Additional Investment Basket ($15M)

  Amendment 2 (2025-12-01): Basket Increase
    • General Investments: $25M → $35M
```

---

## For Project Finance

ProViso handles the unique complexity of project finance facilities:

### Phase-Aware Compliance

Construction-phase covenants differ from operations. ProViso tracks where you are and applies the right tests.

```
PROJECT STATUS: Construction Phase
────────────────────────────────────────────────────────────
  Phase: Construction (Month 14 of 24)
  Next Milestone: Mechanical Completion (Target: Jun 30)

  SUSPENDED COVENANTS (during construction):
    • DSCR Minimum
    • Debt/Equity Ratio

  ACTIVE REQUIREMENTS:
    ✓ Equity Contribution: 32% >= 30% required
    ✓ Cost Overrun Reserve: Funded
```

### Milestone Tracking

Monitor construction progress against target and longstop dates.

```
CONSTRUCTION MILESTONES
────────────────────────────────────────────────────────────
  ✓ Financial Close         Dec 15, 2024    ACHIEVED
  ✓ Site Preparation        Mar 31, 2025    ACHIEVED
  ● Equipment Delivery      Jun 30, 2025    IN PROGRESS (45 days)
  ○ Mechanical Completion   Dec 31, 2025    PENDING
  ○ Commercial Operation    Mar 31, 2026    PENDING
```

### Reserve Account Management

Track funding levels across all reserve accounts.

```
RESERVE ACCOUNTS
────────────────────────────────────────────────────────────
  Debt Service Reserve    ████████████████████ $12.5M / $12.5M (100%)
  Maintenance Reserve     ████████████░░░░░░░░ $3.2M / $5.0M (64%)
  Distribution Reserve    ████████░░░░░░░░░░░░ $2.0M / $5.0M (40%)
```

### Waterfall Execution

See exactly how cash flows through your distribution waterfall.

```
MONTHLY WATERFALL - January 2026
────────────────────────────────────────────────────────────
  Available Cash:                           $8,500,000

  Tier 1: Operating Expenses               -$1,200,000
  Tier 2: Senior Debt Service              -$2,800,000
  Tier 3: DSRA Replenishment               -$500,000
  Tier 4: Maintenance Reserve              -$400,000
  Tier 5: Subordinated Debt                -$1,500,000
  Tier 6: Distributions (if DSCR > 1.25x)  -$2,100,000
                                           ───────────
  Remaining:                                $0
```

---

## The Deal Lifecycle Dashboard

ProViso includes a visual dashboard for managing deals from negotiation through post-closing.

### Negotiation

Track term sheet changes across multiple rounds. See what changed, who proposed it, and whether it favors borrower or lender.

- **Version Timeline**: Visual history of every draft
- **Side-by-Side Comparison**: See exactly what changed between versions
- **Change Classification**: Automatically tagged as borrower-favorable, lender-favorable, or neutral
- **Audit Trail**: Who sent what, when

### Closing

Never miss a condition precedent. Track documents and signatures in real-time.

- **Readiness Meter**: Overall closing progress at a glance
- **CP Checklist**: Status of every condition precedent by category
- **Document Tracker**: Upload status, execution status, signature collection
- **Days to Close**: Countdown with overdue item alerts

### Post-Closing

Ongoing compliance monitoring with early warning indicators.

- **Compliance Trends**: Historical covenant performance charts
- **Financial Submissions**: Quarterly/annual reporting workflow
- **Draw Requests**: Track funding requests through approval pipeline
- **Scenario Simulator**: "What if" analysis for proposed transactions

---

## Who Uses ProViso

### Borrowers

- **Treasury Teams**: Real-time basket tracking, no more Excel
- **M&A Teams**: Instant pro forma analysis for acquisitions
- **CFO Office**: Board-ready compliance reports

### Lenders

- **Credit Officers**: Automated covenant monitoring
- **Workout Groups**: Early warning on deteriorating credits
- **Syndication Desks**: Clear documentation of terms

### Law Firms

- **Finance Practices**: Faster turnaround on covenant queries
- **Transaction Teams**: Living document that updates with amendments
- **Due Diligence**: Instant verification of compliance history

### Financial Advisors

- **Restructuring**: Model cure scenarios instantly
- **M&A Advisory**: Pro forma impact on target's credit facilities
- **Debt Advisory**: Capacity analysis for incremental financing

---

## How It Works

1. **Encode**: Your credit agreement is translated into ProViso format. The result reads like the original document—lawyers can review it directly.

2. **Load Data**: Financial data comes from your accounting system in a simple format.

3. **Query**: Ask questions, run simulations, check compliance. Get instant answers with citations.

4. **Update**: When amendments are executed, apply them as overlays. The system tracks the full history.

---

## Sample ProViso

ProViso reads like your credit agreement:

```
DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation
  EXCLUDING extraordinary_items

DEFINE Leverage AS
  Total Debt / EBITDA

COVENANT Maximum Leverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

BASKET General Investments
  CAPACITY GreaterOf($25,000,000, 10% * EBITDA)
  FLOOR $15,000,000

PROHIBIT Dividends
  EXCEPT WHEN
    | No Default exists
    | AND Leverage <= 3.50
    | AND amount <= AVAILABLE(Restricted Payments)
```

---

## Frequently Asked Questions

**Who writes the ProViso file?**

The initial encoding can be done by counsel, the borrower's team, or a service provider. Once created, updates (amendments, basket utilizations) are straightforward.

**How accurate is it?**

ProViso is a tool, not legal advice. It executes the logic encoded in the file. The encoding should be reviewed by counsel, and edge cases may require human judgment. The system clearly flags areas requiring interpretation.

**What about "material" and other judgment terms?**

Terms requiring human judgment are flagged in the output. ProViso handles the math; you handle the judgment calls.

**Can it integrate with our systems?**

ProViso accepts financial data in JSON format. Most accounting systems can export to this format. API integration is available for automated workflows.

**What about confidentiality?**

ProViso runs locally. Your agreement data and financials never leave your environment.

---

## Get Started

Contact us to see ProViso in action with your facility's terms.

**Haslun Studio**

---

*ProViso is a tool for credit agreement analysis. It does not constitute legal advice. Consult with qualified counsel for legal matters.*
