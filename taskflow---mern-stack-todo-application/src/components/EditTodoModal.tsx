import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check } from 'lucide-react';
import { Todo, Priority } from '../types/todo';
import { UpdateTodoInput } from '../services/api';

interface EditTodoModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateTodoInput) => Promise<void>;
}

const CATEGORY_PRESETS = ['General', 'Work', 'Personal', 'Development', 'Design', 'Urgent'];

export const EditTodoModal: React.FC<EditTodoModalProps> = ({
  todo,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setCompleted(todo.completed);
      setPriority(todo.priority || 'medium');
      setCategory(todo.category || 'General');
      if (todo.dueDate) {
        try {
          const d = new Date(todo.dueDate);
          setDueDate(d.toISOString().split('T')[0]);
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
      setError(null);
    }
  }, [todo]);

  if (!isOpen || !todo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(todo._id, {
        title: title.trim(),
        description: description.trim(),
        completed,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Task</h3>
            <p className="text-xs text-slate-500">Update task details in MongoDB</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Completion Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => setCompleted(!completed)}
                className={`w-full py-2 px-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  completed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}
              >
                <span>{completed ? 'Marked Completed' : 'Marked Pending'}</span>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    completed ? 'bg-emerald-600 text-white' : 'border border-indigo-400 bg-white'
                  }`}
                >
                  {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold shadow-sm hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
