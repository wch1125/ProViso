/**
 * Demo Narratives
 *
 * Content for each step of the guided demo experience.
 * Includes prose equivalents, step narratives, and helpful text.
 */

import type { DemoAct } from '../context/DemoContext';

// =============================================================================
// TYPES
// =============================================================================

export interface StepNarrative {
  title: string;
  content: string;
  hint?: string;
}

export interface ActInfo {
  id: DemoAct;
  title: string;
  subtitle: string;
  icon: 'reveal' | 'power' | 'negotiate' | 'close';
}

// =============================================================================
// ACT INFORMATION
// =============================================================================

export const ACTS: ActInfo[] = [
  {
    id: 1,
    title: 'The Reveal',
    subtitle: 'Legal prose meets executable code',
    icon: 'reveal',
  },
  {
    id: 2,
    title: 'The Power',
    subtitle: 'Run real commands, get instant answers',
    icon: 'power',
  },
  {
    id: 3,
    title: 'Negotiation',
    subtitle: 'Track every change, understand impact',
    icon: 'negotiate',
  },
  {
    id: 4,
    title: 'Single Source',
    subtitle: 'From code to closing checklist',
    icon: 'close',
  },
];

// =============================================================================
// STEP NARRATIVES
// =============================================================================

export const STEP_NARRATIVES: Record<DemoAct, StepNarrative[]> = {
  1: [
    {
      title: 'The Problem',
      content:
        'Credit agreements are 200+ page documents full of definitions, covenants, and conditions. When the CFO asks "Can we make this acquisition?", lawyers spend days finding the answer. What if the agreement itself could answer instantly?',
      hint: 'Click Next to see the transformation',
    },
    {
      title: 'Traditional Language',
      content:
        'Here\'s how a typical covenant reads in legal prose. Dense, reference-heavy, and impossible to compute. Every compliance check requires manual review.',
      hint: 'Compare with the code on the right',
    },
    {
      title: 'ProViso Code',
      content:
        'Same terms. Same legal meaning. But now it\'s executable. The computer can check compliance, calculate headroom, and simulate proposed transactions in milliseconds.',
      hint: 'Click Next to see it in action',
    },
  ],
  2: [
    {
      title: 'Interactive Terminal',
      content:
        'This terminal runs real ProViso commands against the credit agreement. No mock data, no hardcoded responses—the interpreter is executing live in your browser.',
      hint: 'Try clicking a suggested command or type your own',
    },
    {
      title: 'Compliance at a Glance',
      content:
        'The `status` command gives you a complete compliance snapshot. Every covenant, every basket, with headroom calculations done instantly.',
      hint: 'Try running "check" for detailed covenant analysis',
    },
    {
      title: 'Basket Tracking',
      content:
        'Baskets limit what the borrower can do—investments, dividends, acquisitions. ProViso tracks utilization in real-time and shows available capacity.',
      hint: 'Try "query GeneralInvestments 10000000" to check if a $10M investment is permitted',
    },
    {
      title: 'Pro Forma Analysis',
      content:
        'Before any major transaction, you need to know: "Will this breach a covenant?" The `simulate` command shows pro forma impact on every metric.',
      hint: 'Try "simulate SeniorDebt=180000000" to see what happens with $20M more debt',
    },
  ],
  3: [
    {
      title: 'Negotiation Tracking',
      content:
        'Credit agreements go through multiple rounds of negotiation. Each side proposes changes. Tracking who changed what—and understanding the impact—is critical.',
      hint: 'Select versions to compare',
    },
    {
      title: 'Borrower Markup',
      content:
        'The borrower\'s counsel proposed these changes to the lender\'s initial draft. ProViso automatically detects every modification and classifies the impact.',
      hint: 'Green lines are additions, red are removals',
    },
    {
      title: 'Lender Counter',
      content:
        'The lender countered with compromises. Notice how ProViso shows exactly which proposals were accepted, modified, or rejected.',
      hint: 'Click changes to see financial impact',
    },
  ],
  4: [
    {
      title: 'Conditions Precedent',
      content:
        'Before any loan can fund, dozens of conditions must be satisfied: documents executed, opinions delivered, certificates provided. These come directly from the credit agreement.',
      hint: 'See how code becomes a closing checklist',
    },
    {
      title: 'Single Source of Truth',
      content:
        'The ProViso file is the single source of truth. Conditions precedent are extracted from the code, not maintained in a separate spreadsheet that can drift out of sync.',
      hint: 'When the agreement changes, the checklist updates automatically',
    },
  ],
};

// =============================================================================
// LEGAL PROSE EQUIVALENTS
// =============================================================================

export const LEGAL_PROSE = {
  maxLeverage: `
Section 7.11(a) Maximum Leverage Ratio.

The Borrower shall not permit the Leverage Ratio, determined as of the last day
of any fiscal quarter, to exceed the ratio set forth below opposite such fiscal
quarter:

  Fiscal Quarter Ending                    Maximum Leverage Ratio
  ---------------------                    ----------------------
  Closing Date through December 31, 2025         5.00 to 1.00
  March 31, 2026 and thereafter                  4.75 to 1.00

For purposes of this Section, "Leverage Ratio" means, as of any date of
determination, the ratio of (a) Total Debt as of such date to (b) Consolidated
EBITDA for the period of four consecutive fiscal quarters ending on or most
recently ended prior to such date.
  `.trim(),

  interestCoverage: `
Section 7.11(b) Minimum Interest Coverage Ratio.

The Borrower shall not permit the Interest Coverage Ratio, determined as of the
last day of any fiscal quarter for the period of four consecutive fiscal quarters
then ended, to be less than 2.25 to 1.00.

"Interest Coverage Ratio" means, as of any date of determination, the ratio of
(a) Consolidated EBITDA for the period of four consecutive fiscal quarters ending
on such date to (b) Interest Expense for such period.
  `.trim(),

  ebitda: `
"Consolidated EBITDA" means, for any period, Consolidated Net Income for such
period plus, without duplication and to the extent deducted in determining such
Consolidated Net Income:

  (a) Interest Expense for such period;
  (b) provision for Federal, state, local and foreign income taxes payable for
      such period;
  (c) total depreciation expense for such period;
  (d) total amortization expense for such period;
  (e) non-cash stock-based compensation expense for such period; provided that
      the aggregate amount added back pursuant to this clause (e) shall not
      exceed $5,000,000 in any fiscal year;

and minus (to the extent included in determining such Consolidated Net Income)
any extraordinary or non-recurring gains.
  `.trim(),

  generalInvestments: `
Section 7.02(f) Investments.

The Borrower shall not, and shall not permit any Subsidiary to, make or maintain
any Investment except:

  (f) other Investments by the Borrower or any Subsidiary in an aggregate amount
      not to exceed at any time outstanding the greater of (x) $30,000,000 and
      (y) 12.5% of Consolidated EBITDA for the most recently ended four fiscal
      quarter period for which financial statements have been delivered;
  `.trim(),

  permittedAcquisitions: `
Section 7.02(g) Acquisitions.

  (g) Permitted Acquisitions in an aggregate consideration amount not to exceed
      $60,000,000, provided that:

      (i) no Default or Event of Default shall have occurred and be continuing
          or would result therefrom;
      (ii) after giving pro forma effect to such Acquisition, the Borrower shall
           be in compliance with the financial covenants set forth in Section 7.11;
      (iii) the Borrower shall have delivered a Pro Forma Compliance Certificate
            to the Administrative Agent not less than five Business Days prior to
            the consummation of such Acquisition.
  `.trim(),
};

// =============================================================================
// CP EXTRACTION DEMO
// =============================================================================

export const DEMO_CPS = [
  {
    id: 'cp-1',
    section: '4.01(a)',
    title: 'Certificate of Incorporation',
    description: 'Certified copy from Secretary of State',
    responsible: 'Borrower',
    status: 'satisfied' as const,
  },
  {
    id: 'cp-2',
    section: '4.01(b)',
    title: 'Bylaws',
    description: 'Certified copy of current bylaws',
    responsible: 'Borrower',
    status: 'satisfied' as const,
  },
  {
    id: 'cp-3',
    section: '4.01(c)',
    title: 'Board Resolutions',
    description: 'Authorizing execution of Loan Documents',
    responsible: 'Borrower',
    status: 'satisfied' as const,
  },
  {
    id: 'cp-4',
    section: '4.01(d)',
    title: 'Good Standing Certificate',
    description: 'From state of incorporation',
    responsible: 'Borrower',
    status: 'pending' as const,
  },
  {
    id: 'cp-5',
    section: '4.01(e)',
    title: 'Credit Agreement',
    description: 'Fully executed by all parties',
    responsible: 'All Parties',
    status: 'pending' as const,
  },
  {
    id: 'cp-6',
    section: '4.01(f)',
    title: 'Security Agreement',
    description: 'Granting security interest in collateral',
    responsible: 'Borrower Counsel',
    status: 'satisfied' as const,
  },
  {
    id: 'cp-7',
    section: '4.01(g)',
    title: 'Legal Opinion',
    description: 'Opinion of borrower counsel',
    responsible: 'Davis Polk',
    status: 'pending' as const,
  },
  {
    id: 'cp-8',
    section: '4.01(h)',
    title: 'Insurance Certificate',
    description: 'Evidencing required coverage',
    responsible: 'Borrower',
    status: 'pending' as const,
  },
];

export const CP_CODE_SAMPLE = `
CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP CertificateOfIncorporation
    DESCRIPTION "Certified copy from Secretary of State"
    RESPONSIBLE Borrower

  CP Bylaws
    DESCRIPTION "Certified copy of current bylaws"
    RESPONSIBLE Borrower

  CP BoardResolutions
    DESCRIPTION "Authorizing execution of Loan Documents"
    RESPONSIBLE Borrower

  CP GoodStandingCertificate
    DESCRIPTION "From state of incorporation"
    RESPONSIBLE Borrower

  CP CreditAgreement
    DESCRIPTION "Fully executed by all parties"
    RESPONSIBLE "All Parties"

  CP SecurityAgreement
    DESCRIPTION "Granting security interest in collateral"
    RESPONSIBLE BorrowerCounsel

  CP LegalOpinion
    DESCRIPTION "Opinion of borrower counsel"
    RESPONSIBLE "Davis Polk"

  CP InsuranceCertificate
    DESCRIPTION "Evidencing required coverage"
    RESPONSIBLE Borrower
`.trim();

// =============================================================================
// VERSION LABELS
// =============================================================================

export const VERSION_LABELS = [
  { label: 'v1 - Lender Initial Draft', short: 'v1' },
  { label: 'v2 - Borrower Markup', short: 'v2' },
  { label: 'v3 - Lender Counter', short: 'v3' },
];

// =============================================================================
// UTILITIES
// =============================================================================

export function getActInfo(act: DemoAct): ActInfo {
  return ACTS.find(a => a.id === act) ?? ACTS[0]!;
}

export function getStepNarrative(act: DemoAct, step: number): StepNarrative {
  const narratives = STEP_NARRATIVES[act];
  return narratives[step - 1] ?? narratives[0]!;
}

export function getTotalSteps(act: DemoAct): number {
  return STEP_NARRATIVES[act].length;
}
