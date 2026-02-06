// ProViso Grammar v2.0
// PEG grammar for parsing credit agreement DSL

{
  // Helper functions available in semantic actions
  function buildBinaryExpr(head, tail) {
    return tail.reduce((result, element) => ({
      type: 'BinaryExpression',
      operator: element[1],
      left: result,
      right: element[3]
    }), head);
  }

  function optionalList(items) {
    return items ? items : [];
  }
}

// ==================== TOP LEVEL ====================

Program
  = _ statements:Statement* _ {
      return {
        type: 'Program',
        statements: statements
      };
    }

Statement
  = AmendmentStatement
  / PhaseStatement
  / TransitionStatement
  / TechnicalMilestoneStatement
  / MilestoneStatement
  / RegulatoryRequirementStatement
  / PerformanceGuaranteeStatement
  / DegradationScheduleStatement
  / SeasonalAdjustmentStatement
  / TaxEquityStructureStatement
  / TaxCreditStatement
  / DepreciationStatement
  / FlipEventStatement
  / ReserveStatement
  / WaterfallStatement
  / ConditionsPrecedentStatement
  / DefineStatement
  / CovenantStatement
  / BasketStatement
  / ConditionStatement
  / ProhibitStatement
  / EventStatement
  / LoadStatement
  / CommentStatement

// ==================== COMMENTS ====================

CommentStatement
  = "//" text:$[^\n]* _ {
      return {
        type: 'Comment',
        text: text.trim()
      };
    }

// ==================== PHASE & TRANSITION ====================

PhaseStatement
  = "PHASE" __ name:Identifier _ clauses:PhaseClause+ {
      const result = {
        type: 'Phase',
        name: name,
        until: null,
        from: null,
        covenantsSuspended: [],
        covenantsActive: [],
        requiredCovenants: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'until') result.until = clause.event;
        if (clause.type === 'from') result.from = clause.event;
        if (clause.type === 'suspended') result.covenantsSuspended = clause.covenants;
        if (clause.type === 'active') result.covenantsActive = clause.covenants;
        if (clause.type === 'required') result.requiredCovenants = clause.covenants;
      });
      return result;
    }

PhaseClause
  = "UNTIL" __ event:Identifier _ {
      return { type: 'until', event: event };
    }
  / "FROM" __ event:Identifier _ {
      return { type: 'from', event: event };
    }
  / "COVENANTS" __ "SUSPENDED" __ covenants:IdentifierList _ {
      return { type: 'suspended', covenants: covenants };
    }
  / "COVENANTS" __ "ACTIVE" __ covenants:IdentifierList _ {
      return { type: 'active', covenants: covenants };
    }
  / "REQUIRED" __ covenants:IdentifierList _ {
      return { type: 'required', covenants: covenants };
    }

TransitionStatement
  = "TRANSITION" __ name:Identifier _ clauses:TransitionClause+ {
      const result = {
        type: 'Transition',
        name: name,
        when: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'when') result.when = clause.condition;
      });
      return result;
    }

TransitionClause
  = "WHEN" __ cond:TransitionCondition _ {
      return { type: 'when', condition: cond };
    }

TransitionCondition
  = "ALL_OF" _ "(" _ conditions:TransitionConditionList _ ")" {
      return { type: 'AllOf', conditions: conditions };
    }
  / "ANY_OF" _ "(" _ conditions:TransitionConditionList _ ")" {
      return { type: 'AnyOf', conditions: conditions };
    }
  / cond:BooleanExpression {
      return cond;
    }

TransitionConditionList
  = head:Identifier tail:(_ "," _ Identifier)* {
      return [head, ...tail.map(t => t[3])];
    }

// ==================== TECHNICAL MILESTONE ====================

TechnicalMilestoneStatement
  = "TECHNICAL_MILESTONE" __ name:Identifier _ clauses:TechnicalMilestoneClause+ {
      const result = {
        type: 'TechnicalMilestone',
        name: name,
        targetDate: null,
        longstopDate: null,
        measurement: null,
        targetValue: null,
        currentValue: null,
        progressMetric: null,
        triggers: [],
        requires: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'target') result.targetDate = clause.date;
        if (clause.type === 'longstop') result.longstopDate = clause.date;
        if (clause.type === 'measurement') result.measurement = clause.value;
        if (clause.type === 'targetValue') result.targetValue = clause.value;
        if (clause.type === 'currentValue') result.currentValue = clause.value;
        if (clause.type === 'progressMetric') result.progressMetric = clause.expr;
        if (clause.type === 'triggers') result.triggers = clause.events;
        if (clause.type === 'requires') result.requires = clause.condition;
      });
      return result;
    }

TechnicalMilestoneClause
  = "TARGET" __ date:DateLiteral _ {
      return { type: 'target', date: date.value };
    }
  / "LONGSTOP" __ date:DateLiteral _ {
      return { type: 'longstop', date: date.value };
    }
  / "MEASUREMENT" __ value:StringLiteral _ {
      return { type: 'measurement', value: value };
    }
  / "TARGET_VALUE" __ value:Expression _ {
      return { type: 'targetValue', value: value };
    }
  / "CURRENT_VALUE" __ value:Expression _ {
      return { type: 'currentValue', value: value };
    }
  / "PROGRESS_METRIC" __ expr:Expression _ {
      return { type: 'progressMetric', expr: expr };
    }
  / "TRIGGERS" __ events:IdentifierList _ {
      return { type: 'triggers', events: events };
    }
  / "REQUIRES" __ cond:MilestoneRequires _ {
      return { type: 'requires', condition: cond };
    }

// ==================== REGULATORY REQUIREMENT ====================

RegulatoryRequirementStatement
  = "REGULATORY_REQUIREMENT" __ name:Identifier _ clauses:RegulatoryRequirementClause+ {
      const result = {
        type: 'RegulatoryRequirement',
        name: name,
        agency: null,
        requirementType: null,
        description: null,
        requiredFor: null,
        status: 'pending',
        approvalDate: null,
        satisfies: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'agency') result.agency = clause.value;
        if (clause.type === 'requirementType') result.requirementType = clause.value;
        if (clause.type === 'description') result.description = clause.value;
        if (clause.type === 'requiredFor') result.requiredFor = clause.phase;
        if (clause.type === 'status') result.status = clause.value;
        if (clause.type === 'approvalDate') result.approvalDate = clause.date;
        if (clause.type === 'satisfies') result.satisfies = clause.events;
      });
      return result;
    }

RegulatoryRequirementClause
  = "AGENCY" __ value:StringLiteral _ {
      return { type: 'agency', value: value };
    }
  / "TYPE" __ value:RegulatoryType _ {
      return { type: 'requirementType', value: value };
    }
  / "DESCRIPTION" __ value:StringLiteral _ {
      return { type: 'description', value: value };
    }
  / "REQUIRED_FOR" __ phase:Identifier _ {
      return { type: 'requiredFor', phase: phase };
    }
  / "STATUS" __ status:RegulatoryStatus _ {
      return { type: 'status', value: status };
    }
  / "APPROVAL_DATE" __ date:DateLiteral _ {
      return { type: 'approvalDate', date: date.value };
    }
  / "SATISFIES" __ events:IdentifierList _ {
      return { type: 'satisfies', events: events };
    }

// Accept any identifier as a regulatory type for flexibility
// Common types: environmental, interconnection, land_use, aviation, tribal, water_rights, permit
RegulatoryType
  = id:Identifier { return id; }
  / str:StringLiteral { return str; }

RegulatoryStatus
  = "pending" { return 'pending'; }
  / "submitted" { return 'submitted'; }
  / "approved" { return 'approved'; }
  / "denied" { return 'denied'; }

// ==================== PERFORMANCE GUARANTEE ====================

PerformanceGuaranteeStatement
  = "PERFORMANCE_GUARANTEE" __ name:Identifier _ clauses:PerformanceGuaranteeClause+ {
      const result = {
        type: 'PerformanceGuarantee',
        name: name,
        metric: null,
        p50: null,
        p75: null,
        p90: null,
        p99: null,
        guaranteePeriod: null,
        shortfallRate: null,
        insuranceCoverage: null,
        actualValue: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'metric') result.metric = clause.value;
        if (clause.type === 'p50') result.p50 = clause.value;
        if (clause.type === 'p75') result.p75 = clause.value;
        if (clause.type === 'p90') result.p90 = clause.value;
        if (clause.type === 'p99') result.p99 = clause.value;
        if (clause.type === 'guaranteePeriod') result.guaranteePeriod = clause.value;
        if (clause.type === 'shortfallRate') result.shortfallRate = clause.value;
        if (clause.type === 'insuranceCoverage') result.insuranceCoverage = clause.value;
        if (clause.type === 'actualValue') result.actualValue = clause.value;
      });
      return result;
    }

PerformanceGuaranteeClause
  = "METRIC" __ value:Identifier _ {
      return { type: 'metric', value: value };
    }
  / "P50" __ value:Expression _ {
      return { type: 'p50', value: value };
    }
  / "P75" __ value:Expression _ {
      return { type: 'p75', value: value };
    }
  / "P90" __ value:Expression _ {
      return { type: 'p90', value: value };
    }
  / "P99" __ value:Expression _ {
      return { type: 'p99', value: value };
    }
  / "GUARANTEE_PERIOD" __ value:StringLiteral _ {
      return { type: 'guaranteePeriod', value: value };
    }
  / "SHORTFALL_RATE" __ value:Expression _ {
      return { type: 'shortfallRate', value: value };
    }
  / "INSURANCE_COVERAGE" __ value:Expression _ {
      return { type: 'insuranceCoverage', value: value };
    }
  / "ACTUAL" __ value:Expression _ {
      return { type: 'actualValue', value: value };
    }

// ==================== DEGRADATION SCHEDULE ====================

DegradationScheduleStatement
  = "DEGRADATION_SCHEDULE" __ name:Identifier _ clauses:DegradationScheduleClause+ {
      const result = {
        type: 'DegradationSchedule',
        name: name,
        assetType: null,
        initialCapacity: null,
        year1Degradation: null,
        annualDegradation: null,
        minimumCapacity: null,
        schedule: null,
        affects: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'assetType') result.assetType = clause.value;
        if (clause.type === 'initialCapacity') result.initialCapacity = clause.value;
        if (clause.type === 'year1Degradation') result.year1Degradation = clause.value;
        if (clause.type === 'annualDegradation') result.annualDegradation = clause.value;
        if (clause.type === 'minimumCapacity') result.minimumCapacity = clause.value;
        if (clause.type === 'schedule') result.schedule = clause.value;
        if (clause.type === 'affects') result.affects = clause.metrics;
      });
      return result;
    }

DegradationScheduleClause
  = "ASSET_TYPE" __ value:Identifier _ {
      return { type: 'assetType', value: value };
    }
  / "INITIAL_CAPACITY" __ value:Expression _ {
      return { type: 'initialCapacity', value: value };
    }
  / "YEAR_1_DEGRADATION" __ value:Expression _ {
      return { type: 'year1Degradation', value: value };
    }
  / "ANNUAL_DEGRADATION" __ value:Expression _ {
      return { type: 'annualDegradation', value: value };
    }
  / "MINIMUM_CAPACITY" __ value:Expression _ {
      return { type: 'minimumCapacity', value: value };
    }
  / "SCHEDULE" __ value:DegradationScheduleList _ {
      return { type: 'schedule', value: value };
    }
  / "AFFECTS" __ metrics:IdentifierList _ {
      return { type: 'affects', metrics: metrics };
    }

// Explicit year-by-year degradation schedule
DegradationScheduleList
  = head:DegradationScheduleEntry tail:(_ DegradationScheduleEntry)* {
      return [head, ...tail.map(t => t[1])];
    }

DegradationScheduleEntry
  = "YEAR_" year:Integer ":" _ rate:Expression _ {
      return { year: year, rate: rate };
    }

// ==================== SEASONAL ADJUSTMENT ====================

SeasonalAdjustmentStatement
  = "SEASONAL_ADJUSTMENT" __ name:Identifier _ clauses:SeasonalAdjustmentClause+ {
      const result = {
        type: 'SeasonalAdjustment',
        name: name,
        metric: null,
        season: [],
        adjustmentFactor: null,
        reason: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'metric') result.metric = clause.value;
        if (clause.type === 'season') result.season = clause.periods;
        if (clause.type === 'adjustmentFactor') result.adjustmentFactor = clause.value;
        if (clause.type === 'reason') result.reason = clause.value;
      });
      return result;
    }

SeasonalAdjustmentClause
  = "METRIC" __ value:Identifier _ {
      return { type: 'metric', value: value };
    }
  / "SEASON" __ periods:SeasonList _ {
      return { type: 'season', periods: periods };
    }
  / "ADJUSTMENT_FACTOR" __ value:Expression _ {
      return { type: 'adjustmentFactor', value: value };
    }
  / "REASON" __ value:StringLiteral _ {
      return { type: 'reason', value: value };
    }

// Season can be quarters (Q1-Q4), months (Jan-Dec, 1-12), or custom identifiers
SeasonList
  = head:SeasonPeriod tail:(_ "," _ SeasonPeriod)* {
      return [head, ...tail.map(t => t[3])];
    }

SeasonPeriod
  = "Q" n:[1-4] { return 'Q' + n; }
  / month:("Jan" / "Feb" / "Mar" / "Apr" / "May" / "Jun" / "Jul" / "Aug" / "Sep" / "Oct" / "Nov" / "Dec") { return month; }
  / id:Identifier { return id; }

// ==================== TAX EQUITY STRUCTURES ====================

TaxEquityStructureStatement
  = "TAX_EQUITY_STRUCTURE" __ name:Identifier _ clauses:TaxEquityStructureClause+ {
      const result = {
        type: 'TaxEquityStructure',
        name: name,
        structureType: null,
        taxInvestor: null,
        sponsor: null,
        taxCreditAllocation: null,
        depreciationAllocation: null,
        cashAllocation: null,
        flipDate: null,
        targetReturn: null,
        buyoutPrice: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'structureType') result.structureType = clause.value;
        if (clause.type === 'taxInvestor') result.taxInvestor = clause.value;
        if (clause.type === 'sponsor') result.sponsor = clause.value;
        if (clause.type === 'taxCreditAllocation') result.taxCreditAllocation = clause.value;
        if (clause.type === 'depreciationAllocation') result.depreciationAllocation = clause.value;
        if (clause.type === 'cashAllocation') result.cashAllocation = clause.value;
        if (clause.type === 'flipDate') result.flipDate = clause.value;
        if (clause.type === 'targetReturn') result.targetReturn = clause.value;
        if (clause.type === 'buyoutPrice') result.buyoutPrice = clause.value;
      });
      return result;
    }

TaxEquityStructureClause
  = "STRUCTURE_TYPE" __ value:TaxEquityType _ {
      return { type: 'structureType', value: value };
    }
  / "TAX_INVESTOR" __ value:StringLiteral _ {
      return { type: 'taxInvestor', value: value };
    }
  / "SPONSOR" __ value:StringLiteral _ {
      return { type: 'sponsor', value: value };
    }
  / "TAX_CREDIT_ALLOCATION" __ value:AllocationSpec _ {
      return { type: 'taxCreditAllocation', value: value };
    }
  / "DEPRECIATION_ALLOCATION" __ value:AllocationSpec _ {
      return { type: 'depreciationAllocation', value: value };
    }
  / "CASH_ALLOCATION" __ value:AllocationSpec _ {
      return { type: 'cashAllocation', value: value };
    }
  / "FLIP_DATE" __ value:DateLiteral _ {
      return { type: 'flipDate', value: value };
    }
  / "TARGET_RETURN" __ value:Expression _ {
      return { type: 'targetReturn', value: value };
    }
  / "BUYOUT_PRICE" __ value:Expression _ {
      return { type: 'buyoutPrice', value: value };
    }

TaxEquityType
  = "partnership_flip" { return 'partnership_flip'; }
  / "sale_leaseback" { return 'sale_leaseback'; }
  / "inverted_lease" { return 'inverted_lease'; }
  / id:Identifier { return id; }

// Allocation spec: investor%/sponsor% (e.g., 99/1 or 5/95)
AllocationSpec
  = investor:Number "/" sponsor:Number {
      return { investor: investor.value, sponsor: sponsor.value };
    }

// ==================== TAX CREDITS ====================

TaxCreditStatement
  = "TAX_CREDIT" __ name:Identifier _ clauses:TaxCreditClause+ {
      const result = {
        type: 'TaxCredit',
        name: name,
        creditType: null,
        rate: null,
        eligibleBasis: null,
        creditAmount: null,
        vestingPeriod: null,
        recaptureRisk: null,
        adders: [],
        satisfies: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'creditType') result.creditType = clause.value;
        if (clause.type === 'rate') result.rate = clause.value;
        if (clause.type === 'eligibleBasis') result.eligibleBasis = clause.value;
        if (clause.type === 'creditAmount') result.creditAmount = clause.value;
        if (clause.type === 'vestingPeriod') result.vestingPeriod = clause.value;
        if (clause.type === 'recaptureRisk') result.recaptureRisk = clause.value;
        if (clause.type === 'adder') result.adders.push(clause.value);
        if (clause.type === 'satisfies') result.satisfies = clause.conditions;
      });
      return result;
    }

TaxCreditClause
  = "CREDIT_TYPE" __ value:TaxCreditType _ {
      return { type: 'creditType', value: value };
    }
  / "RATE" __ value:Expression _ {
      return { type: 'rate', value: value };
    }
  / "ELIGIBLE_BASIS" __ value:Expression _ {
      return { type: 'eligibleBasis', value: value };
    }
  / "CREDIT_AMOUNT" __ value:Expression _ {
      return { type: 'creditAmount', value: value };
    }
  / "VESTING_PERIOD" __ value:StringLiteral _ {
      return { type: 'vestingPeriod', value: value };
    }
  / "RECAPTURE_RISK" __ value:StringLiteral _ {
      return { type: 'recaptureRisk', value: value };
    }
  / "ADDER" __ value:TaxCreditAdder _ {
      return { type: 'adder', value: value };
    }
  / "SATISFIES" __ conditions:IdentifierList _ {
      return { type: 'satisfies', conditions: conditions };
    }

TaxCreditType
  = "itc" { return 'itc'; }
  / "ptc" { return 'ptc'; }
  / "45X" { return '45X'; }
  / "45V" { return '45V'; }
  / "45Q" { return '45Q'; }
  / id:Identifier { return id; }

// Tax credit adders (domestic content, energy community, low-income)
TaxCreditAdder
  = name:Identifier _ "+" _ bonus:Expression {
      return { name: name, bonus: bonus };
    }

// ==================== DEPRECIATION ====================

DepreciationStatement
  = "DEPRECIATION_SCHEDULE" __ name:Identifier _ clauses:DepreciationClause+ {
      const result = {
        type: 'Depreciation',
        name: name,
        method: null,
        depreciableBasis: null,
        bonusDepreciation: null,
        schedule: null,
        affects: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'method') result.method = clause.value;
        if (clause.type === 'depreciableBasis') result.depreciableBasis = clause.value;
        if (clause.type === 'bonusDepreciation') result.bonusDepreciation = clause.value;
        if (clause.type === 'schedule') result.schedule = clause.entries;
        if (clause.type === 'affects') result.affects = clause.metrics;
      });
      return result;
    }

DepreciationClause
  = "METHOD" __ value:DepreciationMethod _ {
      return { type: 'method', value: value };
    }
  / "DEPRECIABLE_BASIS" __ value:Expression _ {
      return { type: 'depreciableBasis', value: value };
    }
  / "BONUS_DEPRECIATION" __ value:Expression _ {
      return { type: 'bonusDepreciation', value: value };
    }
  / "SCHEDULE" __ entries:DepreciationYearList _ {
      return { type: 'schedule', entries: entries };
    }
  / "AFFECTS" __ metrics:IdentifierList _ {
      return { type: 'affects', metrics: metrics };
    }

DepreciationMethod
  = "macrs_5yr" { return 'macrs_5yr'; }
  / "macrs_7yr" { return 'macrs_7yr'; }
  / "macrs_15yr" { return 'macrs_15yr'; }
  / "macrs_20yr" { return 'macrs_20yr'; }
  / "straight_line" { return 'straight_line'; }
  / id:Identifier { return id; }

DepreciationYearList
  = head:DepreciationYearEntry tail:(_ DepreciationYearEntry)* {
      return [head, ...tail.map(t => t[1])];
    }

DepreciationYearEntry
  = "YEAR_" year:Integer _ pct:Expression {
      return { year: year, percentage: pct };
    }

// ==================== FLIP EVENT ====================

FlipEventStatement
  = "FLIP_EVENT" __ name:Identifier _ clauses:FlipEventClause+ {
      const result = {
        type: 'FlipEvent',
        name: name,
        trigger: null,
        triggerValue: null,
        preFlipAllocation: null,
        postFlipAllocation: null,
        buyoutOption: null,
        satisfies: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'trigger') {
          result.trigger = clause.triggerType;
          result.triggerValue = clause.value;
        }
        if (clause.type === 'preFlipAllocation') result.preFlipAllocation = clause.value;
        if (clause.type === 'postFlipAllocation') result.postFlipAllocation = clause.value;
        if (clause.type === 'buyoutOption') result.buyoutOption = clause.value;
        if (clause.type === 'satisfies') result.satisfies = clause.conditions;
      });
      return result;
    }

FlipEventClause
  = "TRIGGER" __ triggerType:FlipTriggerType _ value:FlipTriggerValue? _ {
      return { type: 'trigger', triggerType: triggerType, value: value };
    }
  / "PRE_FLIP_ALLOCATION" __ value:AllocationSpec _ {
      return { type: 'preFlipAllocation', value: value };
    }
  / "POST_FLIP_ALLOCATION" __ value:AllocationSpec _ {
      return { type: 'postFlipAllocation', value: value };
    }
  / "BUYOUT_OPTION" __ value:BuyoutOption _ {
      return { type: 'buyoutOption', value: value };
    }
  / "SATISFIES" __ conditions:IdentifierList _ {
      return { type: 'satisfies', conditions: conditions };
    }

FlipTriggerType
  = "target_return" { return 'target_return'; }
  / "date_certain" { return 'date_certain'; }
  / "pf_event" { return 'pf_event'; }
  / id:Identifier { return id; }

FlipTriggerValue
  = expr:Expression { return expr; }
  / date:DateLiteral { return date; }

BuyoutOption
  = "fair_market_value" { return { type: 'fmv' }; }
  / "fixed" _ price:Expression { return { type: 'fixed', price: price }; }
  / "formula" _ "(" _ formula:Expression _ ")" { return { type: 'formula', formula: formula }; }

// ==================== MILESTONE ====================

MilestoneStatement
  = "MILESTONE" __ name:Identifier _ clauses:MilestoneClause+ {
      const result = {
        type: 'Milestone',
        name: name,
        targetDate: null,
        longstopDate: null,
        triggers: [],
        requires: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'target') result.targetDate = clause.date;
        if (clause.type === 'longstop') result.longstopDate = clause.date;
        if (clause.type === 'triggers') result.triggers = clause.events;
        if (clause.type === 'requires') result.requires = clause.condition;
      });
      return result;
    }

MilestoneClause
  = "TARGET" __ date:DateLiteral _ {
      return { type: 'target', date: date.value };
    }
  / "LONGSTOP" __ date:DateLiteral _ {
      return { type: 'longstop', date: date.value };
    }
  / "TRIGGERS" __ events:IdentifierList _ {
      return { type: 'triggers', events: events };
    }
  / "REQUIRES" __ cond:MilestoneRequires _ {
      return { type: 'requires', condition: cond };
    }

MilestoneRequires
  = "ALL_OF" _ "(" _ conditions:TransitionConditionList _ ")" {
      return { type: 'AllOf', conditions: conditions };
    }
  / "ANY_OF" _ "(" _ conditions:TransitionConditionList _ ")" {
      return { type: 'AnyOf', conditions: conditions };
    }
  / name:Identifier {
      return name;
    }

// ==================== RESERVE ====================

ReserveStatement
  = "RESERVE" __ name:Identifier _ clauses:ReserveClause+ {
      const result = {
        type: 'Reserve',
        name: name,
        target: null,
        minimum: null,
        fundedBy: [],
        releasedTo: null,
        releasedFor: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'target') result.target = clause.value;
        if (clause.type === 'minimum') result.minimum = clause.value;
        if (clause.type === 'fundedBy') result.fundedBy = clause.sources;
        if (clause.type === 'releasedTo') result.releasedTo = clause.destination;
        if (clause.type === 'releasedFor') result.releasedFor = clause.purpose;
      });
      return result;
    }

ReserveClause
  = "TARGET" __ value:Expression _ {
      return { type: 'target', value: value };
    }
  / "MINIMUM" __ value:Expression _ {
      return { type: 'minimum', value: value };
    }
  / "FUNDED_BY" __ sources:IdentifierList _ {
      return { type: 'fundedBy', sources: sources };
    }
  / "RELEASED_TO" __ dest:Identifier _ {
      return { type: 'releasedTo', destination: dest };
    }
  / "RELEASED_FOR" __ purpose:Identifier _ {
      return { type: 'releasedFor', purpose: purpose };
    }

// ==================== WATERFALL ====================

WaterfallStatement
  = "WATERFALL" __ name:Identifier _ freq:WaterfallFrequency? _ tiers:WaterfallTier+ {
      return {
        type: 'Waterfall',
        name: name,
        frequency: freq || 'monthly',
        tiers: tiers
      };
    }

WaterfallFrequency
  = "FREQUENCY" __ f:("monthly" / "quarterly" / "annually") _ {
      return f;
    }

WaterfallTier
  = "TIER" __ priority:Integer __ tierName:StringLiteral _ clauses:WaterfallTierClause+ {
      const result = {
        priority: priority,
        name: tierName,
        payTo: null,
        payAmount: null,
        from: 'REMAINDER',
        until: null,
        shortfall: null,
        condition: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'payTo') result.payTo = clause.account;
        if (clause.type === 'pay') result.payAmount = clause.amount;
        if (clause.type === 'from') result.from = clause.source;
        if (clause.type === 'until') result.until = clause.condition;
        if (clause.type === 'shortfall') result.shortfall = clause.account;
        if (clause.type === 'condition') result.condition = clause.expr;
      });
      return result;
    }

WaterfallTierClause
  = "PAY" __ "TO" __ account:Identifier _ {
      return { type: 'payTo', account: account };
    }
  / "PAY" __ amount:Expression _ {
      return { type: 'pay', amount: amount };
    }
  / "FROM" __ source:("Revenue" / "REMAINDER") _ {
      return { type: 'from', source: source };
    }
  / "UNTIL" __ cond:BooleanExpression _ {
      return { type: 'until', condition: cond };
    }
  / "SHORTFALL" __ "->" __ account:Identifier _ {
      return { type: 'shortfall', account: account };
    }
  / "IF" __ cond:BooleanExpression _ {
      return { type: 'condition', expr: cond };
    }

// ==================== CONDITIONS PRECEDENT ====================

ConditionsPrecedentStatement
  = "CONDITIONS_PRECEDENT" __ name:Identifier _ clauses:CPHeaderClause* _ items:CPItem+ {
      return {
        type: 'ConditionsPrecedent',
        name: name,
        section: clauses.find(c => c.type === 'section')?.value || null,
        conditions: items
      };
    }

CPHeaderClause
  = "SECTION" __ value:StringLiteral _ {
      return { type: 'section', value: value };
    }

CPItem
  = "CP" __ name:Identifier _ clauses:CPItemClause+ {
      const result = {
        name: name,
        description: null,
        responsible: null,
        status: 'pending',
        satisfies: []
      };
      clauses.forEach(clause => {
        if (clause.type === 'description') result.description = clause.value;
        if (clause.type === 'responsible') result.responsible = clause.party;
        if (clause.type === 'status') result.status = clause.value;
        if (clause.type === 'satisfies') result.satisfies = clause.events;
      });
      return result;
    }

CPItemClause
  = "DESCRIPTION" __ value:StringLiteral _ {
      return { type: 'description', value: value };
    }
  / "RESPONSIBLE" __ party:Identifier _ {
      return { type: 'responsible', party: party };
    }
  / "STATUS" __ status:CPStatus _ {
      return { type: 'status', value: status };
    }
  / "SATISFIES" __ events:IdentifierList _ {
      return { type: 'satisfies', events: events };
    }

CPStatus
  = "pending" { return 'pending'; }
  / "satisfied" { return 'satisfied'; }
  / "waived" { return 'waived'; }
  / "not_applicable" { return 'not_applicable'; }

// ==================== DEFINE ====================

DefineStatement
  = "DEFINE" __ name:Identifier __ "AS" _ expr:Expression _ modifiers:DefineModifiers? {
      return {
        type: 'Define',
        name: name,
        expression: expr,
        modifiers: modifiers || {}
      };
    }

DefineModifiers
  = mods:DefineModifier+ {
      return mods.reduce((acc, mod) => ({ ...acc, ...mod }), {});
    }

DefineModifier
  = "EXCLUDING" __ items:IdentifierList _ {
      return { excluding: items };
    }
  / "CAPPED" __ "AT" __ cap:Expression _ {
      return { cap: cap };
    }

// ==================== COVENANT ====================

CovenantStatement
  = "COVENANT" __ name:Identifier _ clauses:CovenantClause+ {
      const result = {
        type: 'Covenant',
        name: name,
        requires: null,
        tested: null,
        cure: null,
        breach: null,
        stepDown: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'requires') result.requires = clause.condition;
        if (clause.type === 'tested') result.tested = clause.frequency;
        if (clause.type === 'cure') result.cure = clause.mechanism;
        if (clause.type === 'breach') result.breach = clause.consequence;
        if (clause.type === 'stepDown') result.stepDown = clause.schedule;
      });
      return result;
    }

CovenantClause
  = "REQUIRES" __ cond:Condition _ {
      return { type: 'requires', condition: cond };
    }
  / "STEP_DOWN" _ entries:StepDownEntry+ {
      return { type: 'stepDown', schedule: entries };
    }
  / "TESTED" __ freq:Frequency _ {
      return { type: 'tested', frequency: freq };
    }
  / "CURE" __ mech:CureMechanism _ {
      return { type: 'cure', mechanism: mech };
    }
  / "BREACH" _ "->" _ cons:Identifier _ {
      return { type: 'breach', consequence: cons };
    }

StepDownEntry
  = "AFTER" __ date:DateLiteral __ "TO" __ threshold:Expression _ {
      return { afterDate: date.value, threshold: threshold };
    }

Frequency
  = "QUARTERLY" { return 'quarterly'; }
  / "ANNUALLY" { return 'annually'; }
  / "MONTHLY" { return 'monthly'; }

CureMechanism
  = "EquityCure" _ details:CureDetails? {
      return { type: 'EquityCure', details: details || {} };
    }
  / "PaymentCure" _ details:CureDetails? {
      return { type: 'PaymentCure', details: details || {} };
    }

CureDetails
  = "MAX_USES" __ n:Integer __ "OVER" __ period:CurePeriod _ moreDetails:CureDetails? {
      return { maxUses: n, overPeriod: period, ...(moreDetails || {}) };
    }
  / "MAX_AMOUNT" __ amt:Expression _ moreDetails:CureDetails? {
      return { maxAmount: amt, ...(moreDetails || {}) };
    }
  / "CURE_PERIOD" __ dur:Duration _ moreDetails:CureDetails? {
      return { curePeriod: dur, ...(moreDetails || {}) };
    }

CurePeriod
  = "life_of_facility" { return 'life_of_facility'; }
  / "trailing_" n:Integer "_quarters" { return 'trailing_' + n + '_quarters'; }
  / dur:Duration { return dur; }

// ==================== BASKET ====================

BasketStatement
  = "BASKET" __ name:Identifier _ clauses:BasketClause+ {
      const result = {
        type: 'Basket',
        name: name,
        capacity: null,
        plus: [],
        subjectTo: null,
        floor: null,
        buildsFrom: null,
        starting: null,
        maximum: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'capacity') result.capacity = clause.amount;
        if (clause.type === 'plus') result.plus.push(clause.amount);
        if (clause.type === 'subjectTo') result.subjectTo = clause.conditions;
        if (clause.type === 'floor') result.floor = clause.amount;
        if (clause.type === 'buildsFrom') result.buildsFrom = clause.amount;
        if (clause.type === 'starting') result.starting = clause.amount;
        if (clause.type === 'maximum') result.maximum = clause.amount;
      });
      return result;
    }

BasketClause
  = "CAPACITY" __ amt:Expression _ {
      return { type: 'capacity', amount: amt };
    }
  / "PLUS" __ amt:Expression _ {
      return { type: 'plus', amount: amt };
    }
  / "SUBJECT" __ "TO" __ conds:IdentifierList _ {
      return { type: 'subjectTo', conditions: conds };
    }
  / "FLOOR" __ amt:Expression _ {
      return { type: 'floor', amount: amt };
    }
  / "BUILDS_FROM" __ amt:Expression _ {
      return { type: 'buildsFrom', amount: amt };
    }
  / "STARTING" __ amt:Expression _ {
      return { type: 'starting', amount: amt };
    }
  / "MAXIMUM" __ amt:Expression _ {
      return { type: 'maximum', amount: amt };
    }

// ==================== CONDITION ====================

ConditionStatement
  = "CONDITION" __ name:Identifier __ "AS" _ expr:BooleanExpression _ {
      return {
        type: 'Condition',
        name: name,
        expression: expr
      };
    }

// ==================== PROHIBIT ====================

ProhibitStatement
  = "PROHIBIT" __ target:Identifier _ exceptions:ExceptClause* {
      return {
        type: 'Prohibit',
        target: target,
        exceptions: exceptions
      };
    }

ExceptClause
  = "EXCEPT" __ "WHEN" _ conditions:ConditionList _ notwithstanding:NotwithstandingClause? {
      return {
        type: 'ExceptWhen',
        conditions: conditions,
        notwithstanding: notwithstanding
      };
    }
  / "NOTWITHSTANDING" __ ref:Identifier _ {
      return {
        type: 'Notwithstanding',
        reference: ref
      };
    }

NotwithstandingClause
  = "NOTWITHSTANDING" __ ref:Identifier _ {
      return ref;
    }

ConditionList
  = head:ConditionLine tail:(_ "|" __ "AND" __ cond:ConditionLine { return cond; })* {
      return [head, ...tail];
    }

ConditionLine
  = "|"? _ cond:Condition { return cond; }

// ==================== EVENT ====================

EventStatement
  = "EVENT" __ name:Identifier _ clauses:EventClause+ {
      const result = {
        type: 'Event',
        name: name,
        triggers: null,
        gracePeriod: null,
        consequence: null
      };
      clauses.forEach(clause => {
        if (clause.type === 'triggers') result.triggers = clause.condition;
        if (clause.type === 'gracePeriod') result.gracePeriod = clause.duration;
        if (clause.type === 'consequence') result.consequence = clause.effect;
      });
      return result;
    }

EventClause
  = "TRIGGERS" __ "WHEN" __ cond:Condition _ {
      return { type: 'triggers', condition: cond };
    }
  / "GRACE_PERIOD" __ dur:Duration _ {
      return { type: 'gracePeriod', duration: dur };
    }
  / "CONSEQUENCE" __ eff:Identifier _ {
      return { type: 'consequence', effect: eff };
    }

// ==================== LOAD ====================

LoadStatement
  = "LOAD" __ source:LoadSource _ {
      return {
        type: 'Load',
        source: source
      };
    }

LoadSource
  = path:StringLiteral { return { type: 'file', path: path }; }
  / obj:ObjectLiteral { return { type: 'inline', data: obj }; }

// ==================== AMENDMENT ====================

AmendmentStatement
  = "AMENDMENT" __ num:Integer _ header:AmendmentHeader? _ directives:AmendmentDirective+ {
      return {
        type: 'Amendment',
        number: num,
        effective: header?.effective || null,
        description: header?.description || null,
        directives: directives
      };
    }

AmendmentHeader
  = effective:EffectiveClause? _ desc:DescriptionClause? {
      return { effective: effective, description: desc };
    }

EffectiveClause
  = "EFFECTIVE" __ date:DateLiteral _ { return date; }

DescriptionClause
  = "DESCRIPTION" __ str:StringLiteral _ { return str; }

AmendmentDirective
  = ReplacesDirective
  / AddsDirective
  / DeletesDirective
  / ModifiesDirective

ReplacesDirective
  = "REPLACES" __ type:StatementType __ name:Identifier __ "WITH" _ stmt:InnerStatement {
      return { directive: 'replace', targetType: type, targetName: name, replacement: stmt };
    }

AddsDirective
  = "ADDS" __ stmt:InnerStatement {
      return { directive: 'add', statement: stmt };
    }

DeletesDirective
  = "DELETES" __ type:StatementType __ name:Identifier _ {
      return { directive: 'delete', targetType: type, targetName: name };
    }

ModifiesDirective
  = "MODIFIES" __ type:StatementType __ name:Identifier _ clauses:ModificationClause+ {
      return { directive: 'modify', targetType: type, targetName: name, modifications: clauses };
    }

// Inner statements used within amendments (no AMENDMENT recursion)
InnerStatement
  = DefineStatement
  / CovenantStatement
  / BasketStatement
  / ConditionStatement
  / ProhibitStatement
  / EventStatement
  / PhaseStatement
  / TransitionStatement

StatementType
  = "COVENANT" { return 'Covenant'; }
  / "BASKET" { return 'Basket'; }
  / "CONDITION" { return 'Condition'; }
  / "DEFINE" { return 'Define'; }
  / "PROHIBIT" { return 'Prohibit'; }
  / "EVENT" { return 'Event'; }
  / "PHASE" { return 'Phase'; }
  / "TRANSITION" { return 'Transition'; }

ModificationClause
  = "CAPACITY" __ amt:Expression _ {
      return { type: 'capacity', value: amt };
    }
  / "FLOOR" __ amt:Expression _ {
      return { type: 'floor', value: amt };
    }
  / "MAXIMUM" __ amt:Expression _ {
      return { type: 'maximum', value: amt };
    }
  / "REQUIRES" __ cond:Condition _ {
      return { type: 'requires', value: cond };
    }
  / "TESTED" __ freq:Frequency _ {
      return { type: 'tested', value: freq };
    }

DateLiteral
  = year:$([0-9][0-9][0-9][0-9]) "-" month:$([0-9][0-9]) "-" day:$([0-9][0-9]) {
      return { type: 'Date', value: year + '-' + month + '-' + day };
    }

// ==================== EXPRESSIONS ====================

Expression
  = AdditiveExpression

AdditiveExpression
  = head:MultiplicativeExpression tail:(_ ("+" / "-") _ MultiplicativeExpression)* {
      return buildBinaryExpr(head, tail);
    }

MultiplicativeExpression
  = head:UnaryExpression tail:(_ ("*" / "/") _ UnaryExpression)* {
      return buildBinaryExpr(head, tail);
    }

UnaryExpression
  = TrailingExpr
  / PrimaryExpression
  / "-" _ expr:PrimaryExpression {
      return { type: 'UnaryExpression', operator: '-', argument: expr };
    }

// Trailing expression for period-based calculations
// Example: TRAILING 4 QUARTERS OF EBITDA
TrailingExpr
  = "TRAILING"i _ count:Integer _ period:TrailingPeriod _ "OF"i _ expr:PrimaryExpression {
      return { type: 'Trailing', count: count, period: period, expression: expr };
    }

TrailingPeriod
  = "QUARTERS"i { return 'quarters'; }
  / "QUARTER"i { return 'quarters'; }
  / "MONTHS"i { return 'months'; }
  / "MONTH"i { return 'months'; }
  / "YEARS"i { return 'years'; }
  / "YEAR"i { return 'years'; }

PrimaryExpression
  = FunctionCall
  / Currency
  / Percentage
  / Ratio
  / Number
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }

FunctionCall
  = name:("AVAILABLE" / "COMPLIANT" / "GreaterOf" / "LesserOf" / "PROFORMA" / "SUM" / "EXISTS" / "NOT") _ "(" _ args:ArgumentList? _ ")" {
      return {
        type: 'FunctionCall',
        name: name,
        arguments: args || []
      };
    }

ArgumentList
  = head:Expression tail:(_ "," _ Expression)* {
      return [head, ...tail.map(t => t[3])];
    }

// ==================== CONDITIONS ====================

Condition
  = BooleanExpression

BooleanExpression
  = head:BooleanTerm tail:(_ ("AND" / "OR") _ BooleanTerm)* {
      return buildBinaryExpr(head, tail);
    }

BooleanTerm
  = ComparisonExpression
  / FunctionCall
  / Identifier
  / "NOT" __ expr:BooleanTerm {
      return { type: 'UnaryExpression', operator: 'NOT', argument: expr };
    }
  / "(" _ expr:BooleanExpression _ ")" { return expr; }

ComparisonExpression
  = left:Expression _ op:ComparisonOperator _ right:Expression {
      return {
        type: 'Comparison',
        operator: op,
        left: left,
        right: right
      };
    }

ComparisonOperator
  = "<=" { return '<='; }
  / ">=" { return '>='; }
  / "<" { return '<'; }
  / ">" { return '>'; }
  / "=" { return '='; }
  / "!=" { return '!='; }

// ==================== LITERALS ====================

Currency
  = "$" amount:CurrencyAmount {
      return { type: 'Currency', value: amount };
    }

CurrencyAmount
  = digits:$([0-9_]+) {
      return parseInt(digits.replace(/_/g, ''), 10);
    }

Percentage
  = value:Number "%" {
      return { type: 'Percentage', value: value.value };
    }
  / value:Number "bps" {
      return { type: 'Percentage', value: value.value / 100, unit: 'bps' };
    }

Ratio
  = value:Number "x" {
      return { type: 'Ratio', value: value.value };
    }

Number
  = digits:$([0-9_]+) dec:("." @$[0-9]+)? {
      const numStr = digits.replace(/_/g, '') + (dec ? '.' + dec : '');
      return { type: 'Number', value: parseFloat(numStr) };
    }

Integer
  = digits:$[0-9]+ {
      return parseInt(digits, 10);
    }

Duration
  = amount:Integer __ unit:DurationUnit {
      return { type: 'Duration', amount: amount, unit: unit };
    }

DurationUnit
  = "DAYS" { return 'days'; }
  / "MONTHS" { return 'months'; }
  / "YEARS" { return 'years'; }
  / "DAY" { return 'days'; }
  / "MONTH" { return 'months'; }
  / "YEAR" { return 'years'; }

StringLiteral
  = '"' chars:$[^"]* '"' { return chars; }

ObjectLiteral
  = "{" _ pairs:ObjectPairList? _ "}" {
      const obj = {};
      (pairs || []).forEach(p => { obj[p.key] = p.value; });
      return obj;
    }

ObjectPairList
  = head:ObjectPair tail:(_ "," _ ObjectPair)* {
      return [head, ...tail.map(t => t[3])];
    }

ObjectPair
  = key:Identifier _ ":" _ value:ObjectValue {
      return { key: key, value: value };
    }

ObjectValue
  = cur:Currency { return cur.value; }
  / num:Number { return num.value; }
  / StringLiteral
  / "true" { return true; }
  / "false" { return false; }

// ==================== IDENTIFIERS ====================

Identifier
  = !ReservedWord chars:$([a-zA-Z_][a-zA-Z0-9_]*) { return chars; }

IdentifierList
  = head:Identifier tail:(_ "," _ Identifier)* {
      return [head, ...tail.map(t => t[3])];
    }

ReservedWord
  = ("DEFINE" / "AS" / "COVENANT" / "REQUIRES" / "TESTED" / "QUARTERLY" / "ANNUALLY" / "MONTHLY"
  / "BASKET" / "CAPACITY" / "PLUS" / "SUBJECT" / "TO" / "CONDITION" / "PROHIBIT" / "EXCEPT"
  / "WHEN" / "AND" / "OR" / "NOT" / "EVENT" / "TRIGGERS" / "GRACE_PERIOD" / "CONSEQUENCE"
  / "LOAD" / "NOTWITHSTANDING" / "EXCLUDING" / "CAPPED" / "AT" / "CURE" / "BREACH"
  / "AVAILABLE" / "COMPLIANT" / "GreaterOf" / "LesserOf" / "TRAILING" / "PROFORMA" / "EXISTS"
  / "FLOOR" / "BUILDS_FROM" / "STARTING" / "MAXIMUM" / "MAX_USES" / "MAX_AMOUNT" / "OVER"
  / "CURE_PERIOD" / "EquityCure" / "PaymentCure"
  / "AMENDMENT" / "EFFECTIVE" / "DESCRIPTION" / "REPLACES" / "WITH" / "ADDS" / "DELETES"
  / "MODIFIES" / "QUARTERS" / "QUARTER" / "MONTHS" / "MONTH" / "YEARS" / "YEAR" / "OF"
  / "PHASE" / "TRANSITION" / "UNTIL" / "FROM" / "COVENANTS" / "SUSPENDED" / "ACTIVE"
  / "REQUIRED" / "ALL_OF" / "ANY_OF"
  / "TECHNICAL_MILESTONE" / "MILESTONE" / "TARGET" / "LONGSTOP" / "MEASUREMENT"
  / "TARGET_VALUE" / "CURRENT_VALUE" / "PROGRESS_METRIC"
  / "REGULATORY_REQUIREMENT" / "AGENCY" / "TYPE" / "REQUIRED_FOR" / "APPROVAL_DATE"
  / "PERFORMANCE_GUARANTEE" / "METRIC" / "P50" / "P75" / "P90" / "P99"
  / "GUARANTEE_PERIOD" / "SHORTFALL_RATE" / "INSURANCE_COVERAGE" / "ACTUAL"
  / "DEGRADATION_SCHEDULE" / "ASSET_TYPE" / "INITIAL_CAPACITY" / "YEAR_1_DEGRADATION"
  / "ANNUAL_DEGRADATION" / "MINIMUM_CAPACITY" / "SCHEDULE" / "AFFECTS"
  / "SEASONAL_ADJUSTMENT" / "SEASON" / "ADJUSTMENT_FACTOR" / "REASON"
  / "RESERVE" / "MINIMUM" / "FUNDED_BY" / "RELEASED_TO" / "RELEASED_FOR"
  / "WATERFALL" / "FREQUENCY" / "TIER" / "PAY" / "REMAINDER" / "SHORTFALL" / "IF"
  / "CONDITIONS_PRECEDENT" / "SECTION" / "CP" / "RESPONSIBLE" / "STATUS" / "SATISFIES") !([a-zA-Z0-9_])

// ==================== WHITESPACE ====================

_  = Whitespace*
__ = Whitespace+

Whitespace = [ \t\n\r]
