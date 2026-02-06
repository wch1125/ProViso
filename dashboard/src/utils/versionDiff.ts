/**
 * Version Diff Utility
 *
 * Browser-safe wrapper around the ProViso versioning engine.
 * Computes change summaries between two ProViso code versions
 * using the real AST differ + classifier.
 */

import { compileToState, diffStates } from '@proviso/hub/versioning/differ.js';
import { classifyChange } from '@proviso/hub/versioning/classifier.js';
import type { ChangeSummary, Change } from '../data/demo-scenarios';

/**
 * Compute a ChangeSummary between two ProViso code strings.
 * Uses the real versioning engine: parse → compile → diff → classify.
 */
export async function computeChangeSummary(
  fromCode: string,
  toCode: string,
  fromVersionNumber: number,
  toVersionNumber: number,
  authorParty?: string,
): Promise<ChangeSummary> {
  // Compile both versions to structured state
  const [fromState, toState] = await Promise.all([
    compileToState(fromCode),
    compileToState(toCode),
  ]);

  // Check for parse errors
  if (fromState.parseError) {
    throw new Error(`Failed to parse "from" version: ${fromState.parseError}`);
  }
  if (toState.parseError) {
    throw new Error(`Failed to parse "to" version: ${toState.parseError}`);
  }

  // Diff the two states
  const diffResult = diffStates(fromState, toState);

  if (!diffResult.success) {
    throw new Error('Diff computation failed');
  }

  // Classify each diff into a Change object
  const changes: Change[] = diffResult.diffs.map(diff => {
    const classified = classifyChange(diff);
    return {
      id: classified.id,
      changeType: classified.changeType,
      elementType: classified.elementType,
      sectionReference: classified.sectionReference,
      elementName: classified.elementName,
      title: classified.title,
      description: classified.description,
      rationale: classified.rationale,
      beforeCode: classified.beforeCode,
      afterCode: classified.afterCode,
      beforeValue: classified.beforeValue,
      afterValue: classified.afterValue,
      impact: classified.impact as Change['impact'],
      impactDescription: classified.impactDescription,
      sourceForm: classified.sourceForm,
      isManualEdit: classified.isManualEdit,
    };
  });

  // Count by type and impact
  let covenantChanges = 0;
  let definitionChanges = 0;
  let basketChanges = 0;
  let otherChanges = 0;
  let borrowerFavorable = 0;
  let lenderFavorable = 0;
  let neutral = 0;

  for (const change of changes) {
    switch (change.elementType) {
      case 'covenant': covenantChanges++; break;
      case 'definition': definitionChanges++; break;
      case 'basket': basketChanges++; break;
      default: otherChanges++; break;
    }
    switch (change.impact) {
      case 'borrower_favorable': borrowerFavorable++; break;
      case 'lender_favorable': lenderFavorable++; break;
      default: neutral++; break;
    }
  }

  return {
    versionFrom: fromVersionNumber,
    versionTo: toVersionNumber,
    authorParty: authorParty ?? 'Unknown',
    createdAt: new Date(),
    totalChanges: changes.length,
    covenantChanges,
    definitionChanges,
    basketChanges,
    otherChanges,
    borrowerFavorable,
    lenderFavorable,
    neutral,
    changes,
  };
}
