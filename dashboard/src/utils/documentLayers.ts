/**
 * Document Layer Utilities
 *
 * Maps condition categories to weighted document layers for the Closing Dashboard.
 * Provides weighted readiness calculation and priority-based condition triage.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DocumentLayer {
  id: string;
  name: string;
  weight: number;
  color: string;
  categories: string[];
}

export interface LayerStats {
  layer: DocumentLayer;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionPct: number;
}

export type PriorityTier = 'gating' | 'attention' | 'in_progress' | 'completed';

export interface ConditionForPriority {
  id: string;
  status: 'pending' | 'satisfied' | 'waived';
  dueDate: Date | null;
  isOverdue: boolean;
  category: string;
}

// =============================================================================
// DOCUMENT LAYER CONFIGURATION
// =============================================================================

export const DOCUMENT_LAYERS: DocumentLayer[] = [
  {
    id: 'credit_agreement',
    name: 'Credit Agreement',
    weight: 45,
    color: 'bg-gold-500',
    categories: ['credit_agreement', 'legal_opinions'],
  },
  {
    id: 'security',
    name: 'Security Documents',
    weight: 20,
    color: 'bg-info',
    categories: ['security_documents', 'ucc_filings'],
  },
  {
    id: 'corporate',
    name: 'Corporate & Compliance',
    weight: 15,
    color: 'bg-success',
    categories: ['corporate_documents', 'certificates', 'kyc_aml'],
  },
  {
    id: 'ancillary',
    name: 'Ancillary',
    weight: 10,
    color: 'bg-warning',
    categories: ['insurance', 'financial', 'due_diligence', 'real_estate'],
  },
  {
    id: 'post_closing',
    name: 'Post-Closing & Other',
    weight: 10,
    color: 'bg-text-tertiary',
    categories: [
      'post_closing',
      'permits',
      'tax_equity',
      'offtake',
      'construction',
      'accounts',
      'consents',
      'other',
      'technical',
      'project_documents',
    ],
  },
];

/** Lookup map: category → layer */
const categoryToLayerMap = new Map<string, DocumentLayer>();
for (const layer of DOCUMENT_LAYERS) {
  for (const cat of layer.categories) {
    categoryToLayerMap.set(cat, layer);
  }
}

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Get the document layer for a given condition category.
 * Falls back to Post-Closing & Other for unknown categories.
 */
export function getLayerForCategory(category: string): DocumentLayer {
  return categoryToLayerMap.get(category) ?? DOCUMENT_LAYERS[DOCUMENT_LAYERS.length - 1];
}

/**
 * Compute completion stats for each document layer.
 */
export function computeLayerStats(
  conditions: ConditionForPriority[]
): LayerStats[] {
  // Build per-layer accumulators
  const statsMap = new Map<string, { total: number; completed: number; pending: number; overdue: number }>();
  for (const layer of DOCUMENT_LAYERS) {
    statsMap.set(layer.id, { total: 0, completed: 0, pending: 0, overdue: 0 });
  }

  for (const cp of conditions) {
    const layer = getLayerForCategory(cp.category);
    const acc = statsMap.get(layer.id)!;
    acc.total++;
    if (cp.status === 'satisfied' || cp.status === 'waived') {
      acc.completed++;
    } else {
      acc.pending++;
      if (cp.isOverdue) {
        acc.overdue++;
      }
    }
  }

  return DOCUMENT_LAYERS.map((layer) => {
    const acc = statsMap.get(layer.id)!;
    return {
      layer,
      total: acc.total,
      completed: acc.completed,
      pending: acc.pending,
      overdue: acc.overdue,
      completionPct: acc.total > 0 ? Math.round((acc.completed / acc.total) * 100) : 100,
    };
  });
}

/**
 * Compute weighted readiness across all layers (0–100).
 * Each layer contributes its weight × its completion percentage.
 */
export function computeWeightedReadiness(layerStats: LayerStats[]): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const ls of layerStats) {
    weightedSum += ls.layer.weight * ls.completionPct;
    totalWeight += ls.layer.weight;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Classify a single condition into a priority tier.
 *
 * - Gating (red):         pending + overdue
 * - Needs Attention (amber): pending + due within 7 days
 * - In Progress (blue):   pending (not overdue, not imminent)
 * - Completed (green):    satisfied or waived
 */
export function classifyPriority(condition: ConditionForPriority): PriorityTier {
  if (condition.status === 'satisfied' || condition.status === 'waived') {
    return 'completed';
  }

  if (condition.isOverdue) {
    return 'gating';
  }

  if (condition.dueDate) {
    const now = new Date();
    const due = new Date(condition.dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) {
      return 'attention';
    }
  }

  return 'in_progress';
}

/**
 * Group conditions by priority tier, sorted appropriately within each tier.
 */
export function groupByPriority<T extends ConditionForPriority>(
  conditions: T[]
): Record<PriorityTier, T[]> {
  const groups: Record<PriorityTier, T[]> = {
    gating: [],
    attention: [],
    in_progress: [],
    completed: [],
  };

  for (const cp of conditions) {
    const tier = classifyPriority(cp);
    groups[tier].push(cp);
  }

  // Sort gating: most overdue first (earliest due date first)
  groups.gating.sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return aDate - bDate;
  });

  // Sort attention: soonest due first
  groups.attention.sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  // Sort in_progress: soonest due first
  groups.in_progress.sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  return groups;
}

// =============================================================================
// PRIORITY TIER METADATA
// =============================================================================

export const PRIORITY_TIER_CONFIG: Record<
  PriorityTier,
  { label: string; color: string; borderColor: string; badgeVariant: 'danger' | 'warning' | 'info' | 'success' }
> = {
  gating: {
    label: 'Gating Items',
    color: 'text-danger',
    borderColor: 'border-l-danger',
    badgeVariant: 'danger',
  },
  attention: {
    label: 'Needs Attention',
    color: 'text-warning',
    borderColor: 'border-l-warning',
    badgeVariant: 'warning',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-info',
    borderColor: 'border-l-info',
    badgeVariant: 'info',
  },
  completed: {
    label: 'Completed',
    color: 'text-success',
    borderColor: 'border-l-success/50',
    badgeVariant: 'success',
  },
};

/** Layer label lookup for display */
export const LAYER_LABELS: Record<string, string> = {};
for (const layer of DOCUMENT_LAYERS) {
  LAYER_LABELS[layer.id] = layer.name;
}
