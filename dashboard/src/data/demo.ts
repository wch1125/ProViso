import type { DashboardData, IndustryData } from '../types';

// v2.1 Industry data for solar project
const industryData: IndustryData = {
  technicalMilestones: [
    {
      name: "MW Installed",
      target: "2026-09-15",
      longstop: "2026-11-15",
      measurement: "MW",
      targetValue: 200,
      currentValue: 145,
      status: "in_progress",
      percentComplete: 72.5,
    },
    {
      name: "Interconnection",
      target: "2026-07-01",
      longstop: "2026-09-01",
      measurement: "MW Connected",
      targetValue: 200,
      currentValue: 80,
      status: "in_progress",
      percentComplete: 40,
    },
    {
      name: "Panel Testing",
      target: "2026-04-15",
      longstop: "2026-05-15",
      measurement: "Panels Tested",
      targetValue: 50000,
      currentValue: 50000,
      status: "achieved",
      percentComplete: 100,
    },
    {
      name: "Inverter Commissioning",
      target: "2026-06-01",
      longstop: "2026-07-01",
      measurement: "Units",
      targetValue: 25,
      currentValue: 18,
      status: "in_progress",
      percentComplete: 72,
    },
    {
      name: "Grid Sync",
      target: "2026-08-01",
      longstop: "2026-09-15",
      measurement: "MW Synced",
      targetValue: 200,
      currentValue: 0,
      status: "pending",
      percentComplete: 0,
    },
  ],
  regulatoryRequirements: [
    {
      name: "CPUC Generation License",
      agency: "California PUC",
      type: "Generation License",
      requiredFor: "Operations",
      status: "approved",
      approvalDate: "2024-11-15",
    },
    {
      name: "Air Quality Permit",
      agency: "California Air Resources Board",
      type: "Air Quality",
      requiredFor: "Construction",
      status: "approved",
      approvalDate: "2024-09-20",
    },
    {
      name: "LGIA",
      agency: "CAISO",
      type: "Interconnection Agreement",
      requiredFor: "Operations",
      status: "submitted",
      dueDate: "2026-03-01",
    },
    {
      name: "Conditional Use Permit",
      agency: "County Planning",
      type: "Land Use",
      requiredFor: "Development",
      status: "approved",
      approvalDate: "2024-06-10",
    },
    {
      name: "NEPA Compliance",
      agency: "BLM",
      type: "Environmental",
      requiredFor: "Construction",
      status: "approved",
      approvalDate: "2024-08-05",
    },
    {
      name: "Stormwater Permit",
      agency: "State Water Board",
      type: "Water Quality",
      requiredFor: "Construction",
      status: "approved",
      approvalDate: "2024-10-12",
    },
    {
      name: "FAA Determination",
      agency: "FAA",
      type: "Aviation",
      requiredFor: "Development",
      status: "approved",
      approvalDate: "2024-05-22",
    },
    {
      name: "Decommissioning Plan",
      agency: "County Planning",
      type: "Land Use",
      requiredFor: "Operations",
      status: "pending",
      dueDate: "2026-06-01",
    },
  ],
  performanceGuarantees: [
    {
      name: "Year 1 Energy Production",
      metric: "Annual Energy Production",
      p50: 420000,
      p75: 395000,
      p90: 370000,
      p99: 345000,
      actual: 405000,
      performanceLevel: "p75",
      meetsGuarantee: true,
      unit: "MWh",
    },
    {
      name: "Availability Guarantee",
      metric: "System Availability",
      p50: 99.0,
      p90: 97.5,
      p99: 95.0,
      actual: 98.2,
      performanceLevel: "p75",
      meetsGuarantee: true,
      unit: "%",
    },
    {
      name: "Performance Ratio",
      metric: "Performance Ratio",
      p50: 85.0,
      p75: 83.0,
      p90: 81.0,
      p99: 78.0,
      actual: 83.5,
      performanceLevel: "p75",
      meetsGuarantee: true,
      unit: "%",
    },
  ],
  degradation: [
    {
      name: "Panel Degradation",
      assetType: "Solar Panels",
      initialCapacity: 100,
      currentYear: 1,
      cumulativeDegradation: 0.5,
      effectiveCapacity: 99.5,
      minimumCapacity: 80,
    },
    {
      name: "Inverter Efficiency",
      assetType: "Inverters",
      initialCapacity: 100,
      currentYear: 1,
      cumulativeDegradation: 0.2,
      effectiveCapacity: 99.8,
      minimumCapacity: 90,
    },
  ],
  seasonalAdjustments: [
    {
      name: "Summer Peak",
      metric: "DSCR",
      currentSeason: "Q3",
      adjustmentFactor: 1.15,
      active: true,
      reason: "Peak solar production",
    },
    {
      name: "Winter Adjustment",
      metric: "Energy Production",
      currentSeason: "Q3",
      adjustmentFactor: 0.70,
      active: false,
      reason: "Lower solar irradiance",
    },
  ],
  taxEquity: {
    structure: {
      name: "Sunrise Tax Equity",
      structureType: "partnership_flip",
      taxInvestor: "Major Bank Tax Equity",
      sponsor: "Renewable Energy Partners",
      taxCreditAllocation: { investor: 99, sponsor: 1 },
      cashAllocation: { investor: 30, sponsor: 70 },
      targetReturn: 8.0,
      currentIRR: 6.2,
      hasFlipped: false,
    },
    credits: [
      {
        name: "Investment Tax Credit",
        creditType: "itc",
        baseRate: 30,
        effectiveRate: 40,
        eligibleBasis: 145000000,
        creditAmount: 58000000,
        adders: [
          { name: "domestic_content", bonus: 10 },
        ],
        vestingPeriod: 5,
        percentVested: 20,
      },
    ],
    depreciation: [
      {
        name: "MACRS 5-Year",
        method: "macrs_5",
        depreciableBasis: 145000000,
        bonusDepreciation: 60,
        currentYear: 1,
        yearlyDepreciation: 29000000,
        cumulativeDepreciation: 29000000,
        remainingBasis: 116000000,
      },
    ],
    flipEvents: [
      {
        name: "Target Return Flip",
        trigger: "target_return",
        targetValue: 8.0,
        currentValue: 6.2,
        projectedFlipDate: "2032-06-30",
        hasTriggered: false,
        preFlipAllocation: { investor: 99, sponsor: 1 },
        postFlipAllocation: { investor: 5, sponsor: 95 },
      },
      {
        name: "Date Certain Flip",
        trigger: "date_certain",
        projectedFlipDate: "2035-12-31",
        hasTriggered: false,
        preFlipAllocation: { investor: 99, sponsor: 1 },
        postFlipAllocation: { investor: 5, sponsor: 95 },
      },
    ],
  },
};

// Demo data based on the Sunrise Solar Project example
export const demoData: DashboardData = {
  project: {
    name: "Sunrise Solar Project",
    facility: "$150M Construction + Term",
    sponsor: "Renewable Energy Partners",
    borrower: "Sunrise Solar Holdings LLC"
  },
  phase: {
    current: "construction",
    constructionStart: "2025-06-01",
    codTarget: "2026-09-15",
    maturity: "2041-09-15"
  },
  financials: {
    net_income: 8_000_000,
    interest_expense: 6_000_000,
    tax_expense: 2_000_000,
    depreciation: 4_000_000,
    amortization: 1_000_000,
    senior_debt: 100_000_000,
    subordinated_debt: 20_000_000,
    senior_interest: 4_000_000,
    senior_principal: 3_000_000,
    total_project_cost: 150_000_000,
    equity_contributed: 55_000_000,
    monthly_debt_service: 5_000_000,
    annual_capex_budget: 16_000_000,
    operating_expenses: 3_200_000,
    distributions: 5_000_000,
    Revenue: 12_500_000,
    total_assets: 180_000_000,
    EBITDA: 21_000_000 // Calculated: net_income + interest + tax + depreciation + amortization
  },
  covenants: [
    {
      name: "TotalLeverage",
      actual: 5.71,
      required: 4.50,
      operator: "<=",
      compliant: false,
      suspended: true // Suspended during construction
    },
    {
      name: "SeniorLeverage",
      actual: 4.76,
      required: 3.00,
      operator: "<=",
      compliant: false,
      suspended: true
    },
    {
      name: "InterestCoverage",
      actual: 3.50,
      required: 2.50,
      operator: ">=",
      compliant: true,
      headroom: 1.00,
      suspended: true
    },
    {
      name: "MinDSCR",
      actual: 3.00,
      required: 1.25,
      operator: ">=",
      compliant: true,
      headroom: 1.75,
      suspended: true
    },
    {
      name: "MinEquityContribution",
      actual: 36.67,
      required: 35.00,
      operator: ">=",
      compliant: true,
      headroom: 1.67
    }
  ],
  milestones: [
    {
      name: "Foundation Complete",
      target: "2025-09-30",
      longstop: "2025-12-31",
      status: "achieved",
      achievedDate: "2025-09-22"
    },
    {
      name: "Steel Erection",
      target: "2025-12-31",
      longstop: "2026-03-31",
      status: "achieved",
      achievedDate: "2026-01-15"
    },
    {
      name: "Roof Complete",
      target: "2026-04-15",
      longstop: "2026-06-15",
      status: "in_progress",
      percentComplete: 65
    },
    {
      name: "MEP Complete",
      target: "2026-07-01",
      longstop: "2026-09-01",
      status: "pending"
    },
    {
      name: "Substantial Completion",
      target: "2026-09-15",
      longstop: "2026-11-15",
      status: "pending"
    }
  ],
  reserves: [
    {
      name: "Debt Service Reserve",
      balance: 24_600_000,
      target: 30_000_000,
      minimum: 15_000_000
    },
    {
      name: "Maintenance Reserve",
      balance: 8_200_000,
      target: 16_000_000,
      minimum: 8_000_000
    }
  ],
  waterfall: {
    revenue: 12_500_000,
    tiers: [
      { name: "Operating Expenses", amount: 3_200_000 },
      { name: "Senior Debt Service", amount: 4_100_000 },
      { name: "DSRA Top-Up", amount: 800_000 },
      { name: "Maintenance Reserve", amount: 500_000 },
      { name: "Available for Distribution", amount: 3_900_000, blocked: true, reason: "DSCR < 1.50x" }
    ]
  },
  baskets: [
    { name: "Capex", capacity: 25_000_000, used: 12_500_000, available: 12_500_000, utilization: 50 },
    { name: "Permitted Investments", capacity: 10_000_000, used: 3_200_000, available: 6_800_000, utilization: 32 },
    { name: "Restricted Payments", capacity: 5_000_000, used: 4_750_000, available: 250_000, utilization: 95 },
  ],
  conditionsPrecedent: [
    {
      name: "Initial Funding",
      section: "4.01",
      conditions: [
        { name: "Executed Credit Agreement", description: "Executed Credit Agreement and all Loan Documents", responsible: "Agent", status: "satisfied" },
        { name: "Legal Opinions", description: "Opinions of Borrower's Counsel and Local Counsel", responsible: "Borrower Counsel", status: "satisfied" },
        { name: "Equity Contribution", description: "Evidence of Initial Equity Contribution", responsible: "Sponsor", status: "satisfied" },
        { name: "Insurance Certificates", description: "Evidence of Required Insurance Coverage", responsible: "Borrower", status: "satisfied" },
        { name: "Environmental Report", description: "Phase I Environmental Site Assessment", responsible: "Borrower", status: "satisfied" }
      ]
    },
    {
      name: "Draw 3",
      section: "4.02(c)",
      conditions: [
        { name: "Lien Search", description: "Updated Lien Search Results", responsible: "Agent", status: "satisfied" },
        { name: "Title Endorsement", description: "Date-Down Title Endorsement", responsible: "Borrower", status: "pending" },
        { name: "Construction Inspection", description: "Construction Inspection Report", responsible: "Engineering Consultant", status: "pending" },
        { name: "Contractor Waiver", description: "Contractor Partial Lien Waiver", responsible: "General Contractor", status: "satisfied" },
        { name: "Budget Reconciliation", description: "Updated Budget and Schedule", responsible: "Borrower", status: "pending" }
      ]
    }
  ],
  // v2.1 Industry data
  industry: industryData,
};
