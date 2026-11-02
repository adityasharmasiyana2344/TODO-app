import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Calendar, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { CreateTodoInput } from '../services/api';
import { Priority } from '../types/todo';

interface TodoInputProps {
  onAddTodo: (input: CreateTodoInput) => Promise<void>;
  isSubmitting: boolean;
}

const CATEGORY_PRESETS = ['General', 'Work', 'Personal', 'Development', 'Design', 'Urgent'];

export const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      setError(null);
      await onAddTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        completed: false,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('General');
      setDueDate('');
      setIsExpanded(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isExpanded) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-7 transition-all focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100/80">
      <form onSubmit={handleSubmit}>
        {/* Main Title Row */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done? (e.g., Deploy MERN stack app to production)"
              maxLength={120}
              className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200/90 text-slate-900 placeholder-slate-400 font-normal text-sm sm:text-base focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Quick toggle details */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse task options' : 'More options (description, priority, date)'}
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isExpanded
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="hidden sm:inline">Details</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Add Todo Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden xs:inline">Add Task</span>
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Expandable Advanced Options */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Optional Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add more details, requirements, links or steps..."
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            {/* Priority, Category, Due Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                          active
                            ? p === 'high'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : p === 'medium'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-emerald-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Target Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
