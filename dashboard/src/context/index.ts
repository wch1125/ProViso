export {
  ProVisoProvider,
  useProViso,
  useCovenants,
  useProVisoStatus,
} from './ProVisoContext';

export { ClosingProvider, useClosing, type Toast } from './ClosingContext';

export {
  DemoProvider,
  useDemo,
  useDemoNavigation,
  useDemoTerminal,
  useDemoInterpreter,
  type DemoAct,
  type TerminalEntry,
  type DemoState,
} from './DemoContext';

export {
  DealProvider,
  useDeal,
  useCurrentDealFromParams,
  useActivities,
  type Deal,
  type DealVersion,
  type DealParty,
  type ChangeSummary,
  type Activity,
  type ActivityType,
  type CreateDealInput,
  type DealStatus,
} from './DealContext';

export {
  IndustryThemeProvider,
  useIndustryTheme,
} from './IndustryThemeContext';
