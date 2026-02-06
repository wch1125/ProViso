/**
 * Demo Context Provider
 *
 * Manages state for the guided demo experience:
 * - Current act and step navigation
 * - Terminal command history
 * - Demo ProViso interpreter instance
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import { parse } from '@proviso/parser.js';
import { ProVisoInterpreter } from '@proviso/interpreter.js';
import type { Program } from '@proviso/types.js';

import { demoVersions } from '../data/negotiation-demo';

// =============================================================================
// TYPES
// =============================================================================

export type DemoAct = 1 | 2 | 3 | 4;

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export interface DemoState {
  // Navigation
  currentAct: DemoAct;
  currentStep: number;
  maxActVisited: DemoAct;

  // Terminal
  terminalHistory: TerminalEntry[];
  commandHistory: string[];
  commandHistoryIndex: number;

  // Interpreter
  interpreter: ProVisoInterpreter | null;
  currentVersionIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAct: (act: DemoAct) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  addTerminalEntry: (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => void;
  clearTerminal: () => void;
  addCommandToHistory: (command: string) => void;
  navigateCommandHistory: (direction: 'up' | 'down') => string;
  resetCommandHistoryIndex: () => void;
  setVersion: (index: number) => Promise<void>;
  getVersionCode: (index: number) => string;
}

const STEPS_PER_ACT: Record<DemoAct, number> = {
  1: 3, // The Reveal: intro, prose view, code view
  2: 4, // The Power: intro, status/check, baskets, simulate
  3: 3, // Negotiation: intro, v1-v2 diff, v2-v3 diff
  4: 2, // Closing: intro, CP extraction
};

// Demo financials for the interpreter
const DEMO_FINANCIALS = {
  // Income statement items
  NetIncome: 45_000_000,
  InterestExpense: 12_000_000,
  TaxExpense: 15_000_000,
  DepreciationAmortization: 8_000_000,
  StockBasedComp: 3_000_000,

  // Balance sheet items
  SeniorDebt: 160_000_000,
  SubordinatedDebt: 25_000_000,

  // Basket utilization
  GeneralInvestments_used: 5_000_000,
  PermittedAcquisitions_used: 15_000_000,
};

// =============================================================================
// CONTEXT
// =============================================================================

const DemoContext = createContext<DemoState | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  // Navigation state
  const [currentAct, setCurrentAct] = useState<DemoAct>(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxActVisited, setMaxActVisited] = useState<DemoAct>(1);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);

  // Interpreter state
  const [interpreter, setInterpreter] = useState<ProVisoInterpreter | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load interpreter on mount
  useEffect(() => {
    loadVersion(0);
  }, []);

  const loadVersion = async (index: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const version = demoVersions[index];
      if (!version) {
        throw new Error(`Version ${index} not found`);
      }

      const result = await parse(version.creditLangCode);

      if (!result.success || !result.ast) {
        throw new Error(result.error?.message ?? 'Parse failed');
      }

      const newInterpreter = new ProVisoInterpreter(result.ast as Program);
      newInterpreter.loadFinancials(DEMO_FINANCIALS);

      setInterpreter(newInterpreter);
      setCurrentVersionIndex(index);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Act navigation
  const setAct = useCallback((act: DemoAct) => {
    setCurrentAct(act);
    setCurrentStep(1);
    if (act > maxActVisited) {
      setMaxActVisited(act);
    }
  }, [maxActVisited]);

  // Step navigation
  const nextStep = useCallback(() => {
    const maxSteps = STEPS_PER_ACT[currentAct];
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentAct < 4) {
      // Move to next act
      const nextAct = (currentAct + 1) as DemoAct;
      setAct(nextAct);
    }
  }, [currentAct, currentStep, setAct]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentAct > 1) {
      // Move to previous act's last step
      const prevAct = (currentAct - 1) as DemoAct;
      setCurrentAct(prevAct);
      setCurrentStep(STEPS_PER_ACT[prevAct]);
    }
  }, [currentAct, currentStep]);

  const goToStep = useCallback((step: number) => {
    const maxSteps = STEPS_PER_ACT[currentAct];
    if (step >= 1 && step <= maxSteps) {
      setCurrentStep(step);
    }
  }, [currentAct]);

  // Terminal management
  const addTerminalEntry = useCallback((entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => {
    const newEntry: TerminalEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setTerminalHistory(prev => [...prev, newEntry]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalHistory([]);
  }, []);

  const addCommandToHistory = useCallback((command: string) => {
    setCommandHistory(prev => [...prev, command]);
    setCommandHistoryIndex(-1);
  }, []);

  const navigateCommandHistory = useCallback((direction: 'up' | 'down'): string => {
    if (commandHistory.length === 0) return '';

    let newIndex: number;
    if (direction === 'up') {
      newIndex = commandHistoryIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, commandHistoryIndex - 1);
    } else {
      newIndex = commandHistoryIndex === -1
        ? -1
        : Math.min(commandHistory.length - 1, commandHistoryIndex + 1);
    }

    setCommandHistoryIndex(newIndex);
    return newIndex === -1 ? '' : (commandHistory[newIndex] ?? '');
  }, [commandHistory, commandHistoryIndex]);

  const resetCommandHistoryIndex = useCallback(() => {
    setCommandHistoryIndex(-1);
  }, []);

  // Version management
  const setVersion = useCallback(async (index: number) => {
    await loadVersion(index);
  }, []);

  const getVersionCode = useCallback((index: number): string => {
    const version = demoVersions[index];
    return version?.creditLangCode ?? '';
  }, []);

  const value: DemoState = {
    currentAct,
    currentStep,
    maxActVisited,
    terminalHistory,
    commandHistory,
    commandHistoryIndex,
    interpreter,
    currentVersionIndex,
    isLoading,
    error,
    setAct,
    nextStep,
    prevStep,
    goToStep,
    addTerminalEntry,
    clearTerminal,
    addCommandToHistory,
    navigateCommandHistory,
    resetCommandHistoryIndex,
    setVersion,
    getVersionCode,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useDemo(): DemoState {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export function useDemoNavigation() {
  const { currentAct, currentStep, setAct, nextStep, prevStep, goToStep, maxActVisited } = useDemo();
  return { currentAct, currentStep, setAct, nextStep, prevStep, goToStep, maxActVisited, stepsPerAct: STEPS_PER_ACT };
}

export function useDemoTerminal() {
  const {
    terminalHistory,
    addTerminalEntry,
    clearTerminal,
    addCommandToHistory,
    navigateCommandHistory,
    resetCommandHistoryIndex,
  } = useDemo();
  return {
    terminalHistory,
    addTerminalEntry,
    clearTerminal,
    addCommandToHistory,
    navigateCommandHistory,
    resetCommandHistoryIndex,
  };
}

export function useDemoInterpreter() {
  const { interpreter, currentVersionIndex, isLoading, error, setVersion, getVersionCode } = useDemo();
  return { interpreter, currentVersionIndex, isLoading, error, setVersion, getVersionCode };
}
