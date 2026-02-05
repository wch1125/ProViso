import React, { useState, createContext, useContext } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ defaultTab, children, onChange, className = '' }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabList({ children, className = '', variant = 'default' }: TabListProps) {
  const variantStyles: Record<string, string> = {
    default: 'border-b border-slate-700 gap-1',
    pills: 'bg-slate-800 rounded-lg p-1 gap-1',
    underline: 'border-b border-slate-700 gap-6',
  };

  return (
    <div
      className={`flex ${variantStyles[variant]} ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabTrigger({
  id,
  children,
  disabled = false,
  icon,
  className = '',
  variant = 'default',
}: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  const baseStyles = `
    flex items-center gap-2
    text-sm font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles: Record<string, { active: string; inactive: string }> = {
    default: {
      active: 'px-4 py-2 -mb-px border-b-2 border-accent-500 text-accent-400',
      inactive: 'px-4 py-2 -mb-px border-b-2 border-transparent text-slate-400 hover:text-white hover:border-slate-600',
    },
    pills: {
      active: 'px-4 py-2 rounded-md bg-accent-500 text-white',
      inactive: 'px-4 py-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700',
    },
    underline: {
      active: 'pb-3 -mb-px border-b-2 border-accent-500 text-white',
      inactive: 'pb-3 -mb-px border-b-2 border-transparent text-slate-400 hover:text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={`
        ${baseStyles}
        ${isActive ? styles.active : styles.inactive}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
}

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={className}
    >
      {children}
    </div>
  );
}
