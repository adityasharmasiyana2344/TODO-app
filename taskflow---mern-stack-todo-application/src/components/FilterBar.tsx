import React from 'react';
import { Search, X, Filter, ArrowUpDown, CheckCheck, Trash2 } from 'lucide-react';
import { StatusFilter, SortOption } from '../types/todo';

interface FilterBarProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: { all: number; pending: number; completed: number };
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onMarkAllComplete?: () => void;
  onClearCompleted?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  status,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  onMarkAllComplete,
  onClearCompleted,
}) => {
  const filterTabs: Array<{ id: StatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  const allCategories = ['all', ...Array.from(new Set(categories.filter(Boolean)))];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 mb-6 space-y-3.5">
      {/* Top Row: Status Tabs & Quick Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch actions (if tasks exist) */}
        {counts.all > 0 && (
          <div className="flex items-center space-x-2 self-end sm:self-auto text-xs">
            {counts.pending > 0 && onMarkAllComplete && (
              <button
                onClick={onMarkAllComplete}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-medium transition-colors cursor-pointer"
                title="Mark all pending tasks as completed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Complete All</span>
              </button>
            )}

            {counts.completed > 0 && onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                title="Remove completed tasks"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear Done</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row: Search, Category, Priority, and Sort controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
        {/* Search Input (5 cols on md) */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown (3 cols on md) */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {allCategories
              .filter((c) => c !== 'all')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        {/* Priority Filter (2 cols on md) */}
        <div className="sm:col-span-2">
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort selector (2 cols on md) */}
        <div className="sm:col-span-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="title">A - Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
