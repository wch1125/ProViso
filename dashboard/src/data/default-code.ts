/**
 * Default ProViso code for dashboard initialization.
 * Desert Sun Solar Project - with tension points for compelling demo.
 *
 * Tension:
 * - SubstationComplete milestone: 5 days to longstop (at-risk)
 * - TotalLeverage: ~97% of threshold (near-breach)
 * - InterestCoverage: has cure clause, previously used
 */

export const DEFAULT_PROVISO_CODE = `// Desert Sun Solar Project
// $280M Construction + Term Loan
// ProViso v2.1

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, MinDSCR
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    GridSynchronization,
    FinalInspection
  )

// ==================== MILESTONES ====================

MILESTONE SitePrepComplete
  TARGET 2025-03-15
  LONGSTOP 2025-05-15
  TRIGGERS Draw2Available

MILESTONE PileInstallation
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  REQUIRES SitePrepComplete
  TRIGGERS Draw3Available

MILESTONE TrackerInstallation
  TARGET 2025-09-30
  LONGSTOP 2025-12-31
  REQUIRES PileInstallation

MILESTONE ModuleInstallation
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  REQUIRES TrackerInstallation
  TRIGGERS Draw4Available

MILESTONE InverterCommissioning
  TARGET 2026-02-28
  LONGSTOP 2026-05-31
  REQUIRES ModuleInstallation

// AT-RISK: Only 5 days until longstop!
MILESTONE SubstationComplete
  TARGET 2026-01-31
  LONGSTOP 2026-02-10
  REQUIRES TrackerInstallation
  TRIGGERS SubstationCertification

MILESTONE GridSynchronization
  TARGET 2026-04-15
  LONGSTOP 2026-07-15
  REQUIRES ALL_OF(InverterCommissioning, SubstationComplete)

MILESTONE SubstantialCompletion
  TARGET 2026-04-30
  LONGSTOP 2026-07-31
  REQUIRES ALL_OF(GridSynchronization, FinalInspection)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE SeniorLeverage AS
  SeniorDebt / EBITDA

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at ~4.35x vs 4.50x threshold (97%)
COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT SeniorLeverage
  REQUIRES SeniorLeverage <= 3.50
  TESTED QUARTERLY

// Has cure clause - previously used in Q2 2025
COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility

COVENANT MinDSCR
  REQUIRES DSCR >= 1.25
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.30 * total_project_cost
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE MaintenanceReserve
  TARGET annual_capex_budget
  MINIMUM 0.5 * annual_capex_budget
  FUNDED_BY Waterfall
  RELEASED_FOR PermittedCapEx

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly

  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue

  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve

  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER

  TIER 4 "Maintenance Reserve"
    PAY TO MaintenanceReserve
    UNTIL MaintenanceReserve >= annual_capex_budget
    FROM REMAINDER

  TIER 5 "Distributions"
    IF DSCR >= 1.50
    PAY distributions
    FROM REMAINDER

// ==================== TAX EQUITY ====================

TAX_EQUITY_STRUCTURE SolarPartnership
  STRUCTURE_TYPE partnership_flip
  TAX_INVESTOR "Tax Equity Fund LP"
  SPONSOR "Desert Sun Holdings LLC"
  TAX_CREDIT_ALLOCATION 99% investor, 1% sponsor
  DEPRECIATION_ALLOCATION 99% investor, 1% sponsor
  CASH_ALLOCATION 10% investor, 90% sponsor
  TARGET_RETURN 8.0%
  BUYOUT_PRICE $5_000_000

TAX_CREDIT SolarITC
  CREDIT_TYPE itc
  RATE 30%
  ADDER domestic_content 10%
  ADDER energy_community 10%
  ELIGIBLE_BASIS $240_000_000
  VESTING_PERIOD 5 YEARS
  RECAPTURE_RISK 20% per year

DEPRECIATION_SCHEDULE SolarMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $240_000_000
  BONUS_DEPRECIATION 60%

FLIP_EVENT TargetReturnFlip
  TRIGGER target_return
  TARGET_RETURN 8.0%
  PRE_FLIP_ALLOCATION 99% investor, 1% sponsor
  POST_FLIP_ALLOCATION 5% investor, 95% sponsor
  BUYOUT_OPTION fair_market_value

// ==================== TECHNICAL MILESTONES ====================

TECHNICAL_MILESTONE PileProgress
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  MEASUREMENT "piles driven"
  TARGET_VALUE 45000
  CURRENT_VALUE 38500
  PROGRESS_METRIC 85.6%

TECHNICAL_MILESTONE ModuleProgress
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  MEASUREMENT "MW installed"
  TARGET_VALUE 200
  CURRENT_VALUE 140
  PROGRESS_METRIC 70%

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE AnnualProduction
  METRIC annual_gwh
  P50 520
  P75 495
  P90 470
  P99 440
  GUARANTEE_PERIOD 10 YEARS
  SHORTFALL_RATE $50 per MWh

PERFORMANCE_GUARANTEE AvailabilityGuarantee
  METRIC availability_pct
  P50 99.0
  P75 98.5
  P90 97.5
  P99 96.0
  GUARANTEE_PERIOD 25 YEARS

// ==================== DEGRADATION ====================

DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE "bifacial_mono_perc"
  INITIAL_CAPACITY 200
  YEAR_1_DEGRADATION 2.0%
  ANNUAL_DEGRADATION 0.4%
  MINIMUM_CAPACITY 80%
  AFFECTS annual_gwh

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP ExecutedCreditAgreement
    DESCRIPTION "Executed Credit Agreement and all Loan Documents"
    RESPONSIBLE Agent
    STATUS satisfied

  CP LegalOpinions
    DESCRIPTION "Opinions of Borrower's Counsel and Local Counsel"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP EquityContribution
    DESCRIPTION "Evidence of Initial Equity Contribution"
    RESPONSIBLE Sponsor
    STATUS satisfied
    SATISFIES MinEquityContribution

  CP InsuranceCertificates
    DESCRIPTION "Evidence of Required Insurance Coverage"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TaxEquityDocuments
    DESCRIPTION "Executed Tax Equity Partnership Agreement"
    RESPONSIBLE TaxCounsel
    STATUS satisfied

CONDITIONS_PRECEDENT Draw4
  SECTION "4.02(d)"

  CP Draw4LienSearch
    DESCRIPTION "Updated Lien Search Results"
    RESPONSIBLE Agent
    STATUS pending

  CP Draw4TitleEndorsement
    DESCRIPTION "Date-Down Title Endorsement"
    RESPONSIBLE Borrower
    STATUS pending

  CP Draw4Inspection
    DESCRIPTION "Module Installation Inspection"
    RESPONSIBLE EngineeringConsultant
    STATUS pending

  CP SubstationCert
    DESCRIPTION "Substation Completion Certificate"
    RESPONSIBLE Borrower
    STATUS pending
`;
