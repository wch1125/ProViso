/**
 * SearchFilter - Combined search input and filter controls
 *
 * Provides a search bar with optional filter buttons/dropdowns
 * for filtering lists and tables.
 */
import { Search, X, ChevronDown } from 'lucide-react';

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (filterId: string, value: string) => void;
  activeFilters?: Record<string, string>;
  className?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  onFilterChange,
  activeFilters = {},
  className = '',
}: SearchFilterProps) {
  const hasActiveFilters = Object.values(activeFilters).some(v => v && v !== 'all');

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="
            w-full pl-10 pr-10 py-2
            bg-slate-800 border border-slate-700 rounded-lg
            text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent
            transition-all
          "
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <FilterDropdown
              key={filter.id}
              filter={filter}
              value={activeFilters[filter.id] || 'all'}
              onChange={(value) => onFilterChange?.(filter.id, value)}
            />
          ))}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                filters.forEach(f => onFilterChange?.(f.id, 'all'));
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  filter: FilterOption;
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ filter, value, onChange }: FilterDropdownProps) {
  const isActive = value && value !== 'all';

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none
          px-3 py-2 pr-8
          text-sm font-medium rounded-lg
          border transition-all cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-accent-500
          ${isActive
            ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
          }
        `}
      >
        <option value="all">{filter.label}: All</option>
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}

/**
 * QuickFilters - Pill-style quick filter buttons
 */
export interface QuickFilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface QuickFiltersProps {
  options: QuickFilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function QuickFilters({ options, value, onChange, className = '' }: QuickFiltersProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-full
            transition-all
            ${value === option.id
              ? 'bg-accent-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }
          `}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={`ml-1.5 ${value === option.id ? 'text-accent-200' : 'text-slate-600'}`}>
              ({option.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
