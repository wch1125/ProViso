/**
 * TemplatePicker Component
 *
 * A gallery of deal templates that users can browse, preview, and select.
 * Each template card shows the template type, features, and complexity level.
 * Selecting a template opens a configuration panel where users customize
 * parameters and generate a complete .proviso file.
 */

import { useState, useCallback } from 'react';
import {
  Building2,
  Building,
  TrendingUp,
  Zap,
  ChevronRight,
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Shield,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody } from '../Card';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';

// =============================================================================
// TEMPLATE DATA (mirrors backend DealTemplate structure)
// =============================================================================

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  industry: string;
  complexity: 'starter' | 'standard' | 'advanced';
  icon: string;
  features: string[];
  defaultValues: Record<string, unknown>;
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'corporate-revolver',
    name: 'Corporate Revolving Credit Facility',
    description:
      'Standard corporate revolver with maintenance covenants, investment and restricted payment baskets, grower/builder baskets, and events of default.',
    industry: 'Corporate',
    complexity: 'standard',
    icon: 'Building2',
    features: [
      'Leverage & interest coverage covenants',
      'Equity cure rights',
      'Fixed, grower, and builder baskets',
      'Negative covenants with exceptions',
      'Payment, covenant, and cross-default events',
    ],
    defaultValues: {
      borrowerName: 'Acme Corp',
      facilityAmount: 500_000_000,
      maxLeverage: 4.50,
      minInterestCoverage: 2.50,
      hasLiquidityCovenant: true,
      minLiquidity: 15_000_000,
      covenantFrequency: 'QUARTERLY',
      hasCureRight: true,
      cureMaxUses: 3,
      cureMaxAmount: 20_000_000,
      generalInvestmentBasket: 25_000_000,
      restrictedPaymentsBasket: 10_000_000,
      rpBasketAssetPercentage: 5,
      capExBasket: 20_000_000,
      permittedAcquisitionBasket: 75_000_000,
      hasGrowerBasket: true,
      growerPercentage: 15,
      growerFloor: 15_000_000,
      hasBuilderBasket: true,
      builderPercentage: 50,
      builderStarting: 10_000_000,
      builderMaximum: 75_000_000,
      paymentDefaultGracePeriod: 5,
      covenantDefaultGracePeriod: 30,
      crossDefaultThreshold: 10_000_000,
    },
  },
  {
    id: 'term-loan-b',
    name: 'Term Loan B (Covenant-Lite)',
    description:
      'Leveraged finance term loan with incurrence-only covenants. No maintenance tests — covenants only checked on specific actions.',
    industry: 'Leveraged Finance',
    complexity: 'standard',
    icon: 'TrendingUp',
    features: [
      'Incurrence-only covenants (no maintenance)',
      'Leverage & secured leverage ratio tests',
      'Fixed charge coverage for restricted payments',
      'Builder basket (Available Amount)',
      'Change of control event of default',
    ],
    defaultValues: {
      borrowerName: 'Acme Holdings LLC',
      facilityAmount: 750_000_000,
      incurrenceLeverage: 5.00,
      securedLeverageCap: 3.50,
      fixedChargeCoverage: 2.00,
      generalDebtBasket: 100_000_000,
      rpCapacityFixed: 50_000_000,
      rpCapacityPercentage: 15,
      investmentBasket: 150_000_000,
      investmentPercentage: 25,
      hasBuilderBasket: true,
      builderPercentage: 50,
      builderStarting: 0,
      crossDefaultThreshold: 25_000_000,
      changeOfControlTrigger: 'majority',
    },
  },
  {
    id: 'project-finance',
    name: 'Project Finance Facility',
    description:
      'Non-recourse project finance with construction/operations phases, milestones, DSCR/LLCR covenants, reserves, and waterfall distribution.',
    industry: 'Project Finance',
    complexity: 'advanced',
    icon: 'Zap',
    features: [
      'Construction → Operations → Tail phases',
      'Milestone tracking with longstop dates',
      'DSCR & LLCR covenants',
      'Distribution lock-up mechanism',
      'DSRA and MRA reserve accounts',
      'Waterfall cash distribution',
      'Conditions precedent for draws',
    ],
    defaultValues: {
      projectName: 'Greenfield Solar Project',
      facilityAmount: 200_000_000,
      projectType: 'solar',
      constructionEndDate: '2027-06-30',
      constructionLongstop: '2027-12-31',
      tailEndDate: '2045-12-31',
      minDSCR: 1.20,
      lockupDSCR: 1.10,
      defaultDSCR: 1.05,
      hasLLCR: true,
      minLLCR: 1.30,
      milestone1Name: 'FoundationComplete',
      milestone1Target: '2026-06-30',
      milestone1Longstop: '2026-09-30',
      milestone2Name: 'MechanicalCompletion',
      milestone2Target: '2027-03-31',
      milestone2Longstop: '2027-06-30',
      dsraMonths: 6,
      dsraMinimum: 5_000_000,
      hasMRA: true,
      mraTarget: 3_000_000,
      equityDistributionTest: 'dscr_and_reserves',
    },
  },
  {
    id: 'real-estate',
    name: 'Commercial Real Estate Loan',
    description:
      'CRE mortgage loan with LTV, DSCR, debt yield, and tenant concentration covenants. Includes reserves and lease approval thresholds.',
    industry: 'Real Estate',
    complexity: 'standard',
    icon: 'Building',
    features: [
      'LTV, DSCR, and debt yield covenants',
      'Tenant concentration limits',
      'Minimum occupancy requirements',
      'Capital improvement and TI/LC baskets',
      'Replacement and escrow reserve accounts',
      'Major lease approval conditions',
    ],
    defaultValues: {
      propertyName: 'Metro Office Tower LLC',
      loanAmount: 100_000_000,
      propertyType: 'office',
      appraised_value: 150_000_000,
      maxLTV: 65,
      minDSCR: 1.25,
      hasDebtYield: true,
      minDebtYield: 8,
      hasTenantConcentration: true,
      maxTenantConcentration: 30,
      minOccupancy: 80,
      capExBasket: 5_000_000,
      tiLcBasket: 3_000_000,
      replacementReserve: 250_000,
      hasTaxInsuranceEscrow: true,
      majorLeaseThreshold: 2_000_000,
      paymentGracePeriod: 5,
    },
  },
];

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Building,
  TrendingUp,
  Zap,
};

// Complexity config
const COMPLEXITY_CONFIG: Record<
  string,
  { label: string; variant: 'muted' | 'info' | 'warning' }
> = {
  starter: { label: 'Starter', variant: 'muted' },
  standard: { label: 'Standard', variant: 'info' },
  advanced: { label: 'Advanced', variant: 'warning' },
};

// Industry accent colors
const INDUSTRY_COLORS: Record<string, string> = {
  Corporate: 'from-blue-500/20 to-blue-600/5',
  'Leveraged Finance': 'from-purple-500/20 to-purple-600/5',
  'Project Finance': 'from-amber-500/20 to-amber-600/5',
  'Real Estate': 'from-emerald-500/20 to-emerald-600/5',
};

const INDUSTRY_BORDER: Record<string, string> = {
  Corporate: 'border-blue-500/30',
  'Leveraged Finance': 'border-purple-500/30',
  'Project Finance': 'border-amber-500/30',
  'Real Estate': 'border-emerald-500/30',
};

const INDUSTRY_ICON_COLOR: Record<string, string> = {
  Corporate: 'text-blue-400',
  'Leveraged Finance': 'text-purple-400',
  'Project Finance': 'text-amber-400',
  'Real Estate': 'text-emerald-400',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface TemplatePickerProps {
  onSelectTemplate: (templateId: string, values: Record<string, unknown>) => void;
  onClose?: () => void;
}

export function TemplatePicker({ onSelectTemplate, onClose }: TemplatePickerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = useCallback(
    (template: TemplateInfo) => {
      setSelectedTemplate(template);
      // Generate preview code (simplified — real implementation would call backend)
      generatePreview(template);
    },
    []
  );

  const handleUseTemplate = useCallback(() => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.id, selectedTemplate.defaultValues);
    }
  }, [selectedTemplate, onSelectTemplate]);

  const handleCopyCode = useCallback(async () => {
    if (previewCode) {
      try {
        await navigator.clipboard.writeText(previewCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for non-secure contexts
      }
    }
  }, [previewCode]);

  const generatePreview = (template: TemplateInfo) => {
    // Generate a simplified preview — real implementation would call
    // generateFromTemplate() on the backend
    const lines: string[] = [];
    const v = template.defaultValues;

    switch (template.id) {
      case 'corporate-revolver':
        lines.push(
          `// ${v.borrowerName as string} — Revolving Credit Facility`,
          `// Facility Amount: $${(v.facilityAmount as number).toLocaleString()}`,
          '',
          'DEFINE EBITDA AS',
          '  net_income + interest_expense + tax_expense + depreciation + amortization',
          '  EXCLUDING extraordinary_items',
          '',
          'DEFINE Leverage AS TotalDebt / EBITDA',
          '',
          `COVENANT MaxLeverage`,
          `  REQUIRES Leverage <= ${v.maxLeverage}`,
          `  TESTED ${v.covenantFrequency}`,
          `  CURE EquityCure MAX_USES ${v.cureMaxUses} OVER life_of_facility`,
          '  BREACH -> UnmaturedDefault',
          '',
          `COVENANT MinInterestCoverage`,
          `  REQUIRES InterestCoverage >= ${v.minInterestCoverage}`,
          `  TESTED ${v.covenantFrequency}`,
          '',
          `BASKET GeneralInvestments`,
          `  CAPACITY $${(v.generalInvestmentBasket as number).toLocaleString()}`,
          '',
          `BASKET PermittedAcquisitions`,
          `  CAPACITY $${(v.permittedAcquisitionBasket as number).toLocaleString()}`,
          '  SUBJECT TO NoDefault, ProFormaCompliance',
          '',
          '// ... and 50+ more lines of definitions, baskets,',
          '//     conditions, prohibitions, and events'
        );
        break;

      case 'term-loan-b':
        lines.push(
          `// ${v.borrowerName as string} — Term Loan B (Covenant-Lite)`,
          `// Facility Amount: $${(v.facilityAmount as number).toLocaleString()}`,
          '',
          'DEFINE Leverage AS TotalDebt / EBITDA',
          'DEFINE SecuredLeverage AS SecuredDebt / EBITDA',
          '',
          '// Incurrence-only tests (no maintenance covenants)',
          `CONDITION IncurrenceLeverageTest AS`,
          `  Leverage <= ${v.incurrenceLeverage} AND SecuredLeverage <= ${v.securedLeverageCap}`,
          '',
          `BASKET IncrementalDebt`,
          `  CAPACITY $${(v.facilityAmount as number).toLocaleString()}`,
          '  SUBJECT TO IncurrenceLeverageTest',
          '',
          '// ... and 40+ more lines'
        );
        break;

      case 'project-finance':
        lines.push(
          `// ${v.projectName as string} — Project Finance Facility`,
          `// Facility Amount: $${(v.facilityAmount as number).toLocaleString()}`,
          '',
          'PHASE Construction',
          `  UNTIL "${v.constructionEndDate}"`,
          `  REQUIRED ${v.milestone1Name}, ${v.milestone2Name}`,
          '',
          'PHASE Operations',
          `  FROM "${v.constructionEndDate}"`,
          '  COVENANTS ACTIVE MinDSCR, DistributionLockup, MinLLCR',
          '',
          `MILESTONE ${v.milestone1Name}`,
          `  TARGET "${v.milestone1Target}"`,
          `  LONGSTOP "${v.milestone1Longstop}"`,
          '',
          `COVENANT MinDSCR`,
          `  REQUIRES DSCR >= ${v.minDSCR}`,
          '  TESTED QUARTERLY',
          '',
          'WATERFALL OperatingCashflow',
          '  TIER 1 PAY operating_expenses FROM revenue',
          '  TIER 2 PAY DebtService FROM operating_cashflow',
          '',
          '// ... and 60+ more lines'
        );
        break;

      case 'real-estate':
        lines.push(
          `// ${v.propertyName as string} — Commercial Real Estate Loan`,
          `// Loan Amount: $${(v.loanAmount as number).toLocaleString()}`,
          '',
          'DEFINE NOI AS',
          '  gross_rental_income + other_income - operating_expenses - management_fees',
          '',
          'DEFINE LTV AS outstanding_loan_balance / appraised_value',
          'DEFINE DSCR AS NOI / DebtService',
          '',
          `COVENANT MaxLTV`,
          `  REQUIRES LTV <= ${(v.maxLTV as number) / 100}`,
          '  TESTED QUARTERLY',
          '',
          `COVENANT MinDSCR`,
          `  REQUIRES DSCR >= ${v.minDSCR}`,
          '  TESTED QUARTERLY',
          '',
          `COVENANT MaxTenantConcentration`,
          `  REQUIRES TenantConcentration <= ${(v.maxTenantConcentration as number) / 100}`,
          '',
          '// ... and 40+ more lines'
        );
        break;
    }

    setPreviewCode(lines.join('\n'));
  };

  // If a template is selected, show the detail view
  if (selectedTemplate) {
    const Icon = ICON_MAP[selectedTemplate.icon] || FileCode;
    const complexity = COMPLEXITY_CONFIG[selectedTemplate.complexity];
    const iconColor = INDUSTRY_ICON_COLOR[selectedTemplate.industry] || 'text-gold-400';

    return (
      <div className="space-y-6">
        {/* Back button + header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setPreviewCode(null);
            }}
            className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to templates
          </button>
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Template header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center ${iconColor}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-semibold text-text-primary">
                {selectedTemplate.name}
              </h2>
              <Badge variant={complexity?.variant || 'muted'} size="sm">
                {complexity?.label || selectedTemplate.complexity}
              </Badge>
            </div>
            <p className="text-sm text-text-tertiary mt-1">
              {selectedTemplate.description}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2">
          {selectedTemplate.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>

        {/* Code Preview */}
        {previewCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-secondary">
                Generated Code Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={
                  copied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )
                }
                onClick={handleCopyCode}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="bg-surface-0 border border-border-default rounded-lg overflow-hidden">
              <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-64 overflow-y-auto">
                {previewCode}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-border-default">
          <Button
            onClick={handleUseTemplate}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Use This Template
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyCode}
            icon={<Download className="w-4 h-4" />}
          >
            Download .proviso
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-text-muted">
            All values can be customized after selection
          </span>
        </div>
      </div>
    );
  }

  // Gallery view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
            <FileCode className="w-5 h-5 text-gold-500" />
            Deal Templates
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            Start with a proven structure. Pick a template, customize the parameters, and
            get a complete .proviso file.
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map((template) => {
          const Icon = ICON_MAP[template.icon] || FileCode;
          const complexity = COMPLEXITY_CONFIG[template.complexity];
          const gradientClass =
            INDUSTRY_COLORS[template.industry] || 'from-gold-500/20 to-gold-600/5';
          const borderClass =
            INDUSTRY_BORDER[template.industry] || 'border-gold-500/30';
          const iconColor =
            INDUSTRY_ICON_COLOR[template.industry] || 'text-gold-400';

          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="text-left group"
            >
              <Card
                className={`h-full border ${borderClass} hover:border-gold-500/50 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-gold-500/5`}
              >
                <CardBody>
                  {/* Gradient accent */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}
                  />

                  <div className="relative space-y-3">
                    {/* Icon + badges */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center ${iconColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={complexity?.variant || 'muted'} size="sm">
                          {complexity?.label || template.complexity}
                        </Badge>
                      </div>
                    </div>

                    {/* Title + industry */}
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-gold-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {template.industry}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-tertiary line-clamp-2">
                      {template.description}
                    </p>

                    {/* Key metrics */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Shield className="w-3 h-3" />
                        {template.features.length} features
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <BarChart3 className="w-3 h-3" />
                        {Object.keys(template.defaultValues).length} parameters
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-end text-xs text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Preview & customize
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-text-muted py-2">
        Each template generates a complete .proviso file — typically 80–120 lines of executable
        agreement code
      </div>
    </div>
  );
}

export default TemplatePicker;
