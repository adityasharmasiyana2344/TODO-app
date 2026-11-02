import React from 'react';
import { Sparkles, CheckCircle, SearchX, PlusCircle } from 'lucide-react';
import { StatusFilter } from '../types/todo';

interface EmptyStateProps {
  filterStatus: StatusFilter;
  hasSearchOrCategoryFilter: boolean;
  onClearFilters: () => void;
  onFocusInput: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filterStatus,
  hasSearchOrCategoryFilter,
  onClearFilters,
  onFocusInput,
}) => {
  if (hasSearchOrCategoryFilter) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900">No matching tasks found</h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          We couldn't find any tasks matching your current search and filter criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          Reset all filters
        </button>
      </div>
    );
  }

  if (filterStatus === 'completed') {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900">No completed tasks yet</h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Check off tasks from your pending list once you finish them to see your completed streak here!
        </p>
      </div>
    );
  }

  if (filterStatus === 'pending') {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900">All caught up!</h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          You have zero pending tasks on your plate. Enjoy your free time or add a new goal.
        </p>
        <button
          onClick={onFocusInput}
          className="mt-5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create new task</span>
        </button>
      </div>
    );
  }

  // All tasks empty
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-14 text-center max-w-md mx-auto my-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Sparkles className="w-8 h-8 stroke-[1.8]" />
      </div>
      <h4 className="text-lg font-bold text-slate-900">No tasks on your board yet</h4>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
        Start organizing your day by typing your first task in the input box above.
      </p>
      <button
        onClick={onFocusInput}
        className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Add your first task</span>
      </button>
    </div>
  );
};
