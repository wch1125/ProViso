/**
 * ProViso Hub v2.0 — Template Rendering
 *
 * Simple template engine for generating ProViso code and Word prose.
 * Uses Handlebars-like syntax: {{variable}}, {{#if}}, {{#each}}, etc.
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-base-to-string */
// Note: Template rendering inherently deals with dynamic values from context

import type { TemplateContext, StepDownEntry } from './types.js';

// =============================================================================
// TEMPLATE RENDERER
// =============================================================================

/**
 * Render a template string with the given context.
 *
 * Supports:
 * - {{variable}} - Simple variable substitution
 * - {{#if condition}}...{{/if}} - Conditional blocks
 * - {{#unless condition}}...{{/unless}} - Inverted conditional
 * - {{#each array}}...{{/each}} - Array iteration
 * - {{format.currency amount}} - Helper functions
 */
export function renderTemplate(
  template: string,
  context: TemplateContext
): string {
  let result = template;

  // Process {{#each}} blocks first
  result = processEachBlocks(result, context);

  // Process {{#if}} blocks
  result = processIfBlocks(result, context);

  // Process {{#unless}} blocks
  result = processUnlessBlocks(result, context);

  // Process simple variable substitutions
  result = processVariables(result, context);

  // Clean up extra whitespace
  result = cleanupWhitespace(result);

  return result;
}

// =============================================================================
// BLOCK PROCESSING
// =============================================================================

/**
 * Process {{#each array}}...{{/each}} blocks.
 */
function processEachBlocks(template: string, context: TemplateContext): string {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, arrayName, content) => {
    const array = getValue(arrayName, context);

    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }

    return array
      .map((item, index) => {
        // Create a sub-context with the current item and index
        const itemContext: TemplateContext = {
          ...context,
          values: {
            ...context.values,
            '@index': index,
            '@first': index === 0,
            '@last': index === array.length - 1,
            ...(typeof item === 'object' && item !== null ? item : { '.': item }),
          },
        };

        // Process the content for this item
        let itemContent = content;
        itemContent = processIfBlocks(itemContent, itemContext);
        itemContent = processUnlessBlocks(itemContent, itemContext);
        itemContent = processVariables(itemContent, itemContext);

        return itemContent;
      })
      .join('');
  });
}

/**
 * Process {{#if condition}}...{{/if}} blocks.
 */
function processIfBlocks(template: string, context: TemplateContext): string {
  // Handle {{#if condition}}...{{else}}...{{/if}}
  const ifElseRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  template = template.replace(ifElseRegex, (match, conditionName, ifContent, elseContent) => {
    const condition = getValue(conditionName, context);
    return isTruthy(condition) ? ifContent : elseContent;
  });

  // Handle {{#if condition}}...{{/if}}
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  return template.replace(ifRegex, (match, conditionName, content) => {
    const condition = getValue(conditionName, context);
    return isTruthy(condition) ? content : '';
  });
}

/**
 * Process {{#unless condition}}...{{/unless}} blocks.
 */
function processUnlessBlocks(template: string, context: TemplateContext): string {
  const unlessRegex = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
  return template.replace(unlessRegex, (match, conditionName, content) => {
    const condition = getValue(conditionName, context);
    return !isTruthy(condition) ? content : '';
  });
}

/**
 * Process simple {{variable}} substitutions.
 */
function processVariables(template: string, context: TemplateContext): string {
  // Handle helper functions: {{format.currency amount}}
  const helperRegex = /\{\{(format\.\w+)\s+(\w+)\}\}/g;
  template = template.replace(helperRegex, (match, helperPath, argName) => {
    const value = getValue(argName, context);
    const helper = getHelper(helperPath, context);
    if (typeof helper === 'function') {
      return helper(value);
    }
    return match;
  });

  // Handle simple variables: {{name}}
  const variableRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
  return template.replace(variableRegex, (match, path) => {
    const value = getValue(path, context);
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a value from the context by path (supports dot notation).
 */
function getValue(path: string, context: TemplateContext): unknown {
  // Check in values first
  if (path in context.values) {
    return context.values[path];
  }

  // Handle dot notation
  const parts = path.split('.');
  let current: unknown = context.values;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object' && part in (current)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Get a helper function from context.format.
 */
function getHelper(path: string, context: TemplateContext): unknown {
  if (!path.startsWith('format.')) {
    return undefined;
  }

  const helperName = path.slice(7); // Remove 'format.'
  return context.format[helperName as keyof typeof context.format];
}

/**
 * Determine if a value is truthy for conditionals.
 */
function isTruthy(value: unknown): boolean {
  if (value === false || value === null || value === undefined || value === '') {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  return true;
}

/**
 * Clean up extra whitespace in rendered output.
 */
function cleanupWhitespace(text: string): string {
  // Remove empty lines created by block removal
  const lines = text.split('\n');
  const filtered = lines.filter((line, index) => {
    // Keep lines with content
    if (line.trim()) return true;
    // Keep single blank lines, but not multiple in a row
    const prevLine = index > 0 ? lines[index - 1] : undefined;
    if (prevLine !== undefined && prevLine.trim()) return true;
    return false;
  });
  return filtered.join('\n').trim();
}

// =============================================================================
// DEFAULT FORMAT HELPERS
// =============================================================================

/**
 * Create default format helpers.
 */
export function createFormatHelpers(): TemplateContext['format'] {
  return {
    currency: (amount: number): string => {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0';
      }
      // Format as $XX,XXX,XXX or $XXM for millions
      if (amount >= 1_000_000 && amount % 1_000_000 === 0) {
        return `$${amount / 1_000_000}M`;
      }
      return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    },

    percentage: (value: number): string => {
      if (typeof value !== 'number' || isNaN(value)) {
        return '0%';
      }
      return `${value}%`;
    },

    ratio: (value: number): string => {
      if (typeof value !== 'number' || isNaN(value)) {
        return '0.00x';
      }
      return `${value.toFixed(2)}x`;
    },

    date: (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) {
        return '';
      }
      const iso = d.toISOString().split('T')[0];
      return iso ?? '';
    },
  };
}

// =============================================================================
// TEMPLATE CONTEXT BUILDER
// =============================================================================

/**
 * Create a template context from form values.
 */
export function createTemplateContext(
  values: Record<string, unknown>,
  deal?: { name: string; facilityAmount: number; currency: string }
): TemplateContext {
  return {
    values,
    deal,
    today: new Date(),
    format: createFormatHelpers(),
  };
}

// =============================================================================
// STEP-DOWN SCHEDULE RENDERING
// =============================================================================

/**
 * Render a step-down schedule for covenant templates.
 */
export function renderStepDownSchedule(
  schedule: StepDownEntry[],
  operator: string
): string {
  if (!schedule || schedule.length === 0) {
    return '';
  }

  if (schedule.length === 1) {
    const first = schedule[0];
    return first ? `${operator} ${first.threshold}` : '';
  }

  return schedule
    .map((step, i) => {
      const threshold = `${operator} ${step.threshold}`;
      if (i === schedule.length - 1 || !step.endDate) {
        // Final threshold (no end date)
        return threshold;
      }
      return `${threshold} UNTIL ${step.endDate}`;
    })
    .join(', THEN ');
}
