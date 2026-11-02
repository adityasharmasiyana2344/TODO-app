import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { TodoInput } from './components/TodoInput';
import { FilterBar } from './components/FilterBar';
import { TodoCard } from './components/TodoCard';
import { EditTodoModal } from './components/EditTodoModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MongoStatusModal } from './components/MongoStatusModal';
import { ToastContainer } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { todoApi, CreateTodoInput, UpdateTodoInput } from './services/api';
import { Todo, TodoStats, DbStatus, StatusFilter, SortOption, ToastMessage } from './types/todo';
import { Loader2, Database, X } from 'lucide-react';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Loading & Submitting states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingMongo, setIsConnectingMongo] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);

  // Modals state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [showAtlasNotice, setShowAtlasNotice] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch data
  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const [todosRes, statsRes, dbRes] = await Promise.all([
        todoApi.getTodos({
          status: statusFilter,
          search: searchQuery,
          category: selectedCategory,
          priority: selectedPriority,
          sortBy,
        }),
        todoApi.getStats(),
        todoApi.getDbStatus(),
      ]);

      setTodos(todosRes.todos);
      setStats(statsRes);
      setDbStatus(dbRes);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      addToast('error', 'Network Error', err instanceof Error ? err.message : 'Failed to reach backend server');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [statusFilter, searchQuery, selectedCategory, selectedPriority, sortBy, addToast]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Periodic DB health check
  useEffect(() => {
    const interval = setInterval(() => {
      todoApi.getDbStatus().then(setDbStatus).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleAddTodo = async (input: CreateTodoInput) => {
    setIsSubmitting(true);
    try {
      const created = await todoApi.createTodo(input);
      addToast('success', 'Task Created', `"${created.title}" added to your task list.`);
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'Creation Failed', err instanceof Error ? err.message : 'Could not add task');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    setUpdatingTodoId(id);
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: !currentStatus } : t))
    );

    try {
      const updated = await todoApi.toggleComplete(id, !currentStatus);
      addToast(
        'success',
        updated.completed ? 'Task Completed! 🎉' : 'Task Marked as Pending',
        `"${updated.title}" status updated.`
      );
      // Refresh stats
      const newStats = await todoApi.getStats();
      setStats(newStats);
    } catch (err: unknown) {
      // Revert optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: currentStatus } : t))
      );
      addToast('error', 'Update Failed', err instanceof Error ? err.message : 'Could not change status');
    } finally {
      setUpdatingTodoId(null);
    }
  };

  const handleSaveEdit = async (id: string, updates: UpdateTodoInput) => {
    try {
      const updated = await todoApi.updateTodo(id, updates);
      addToast('success', 'Task Updated', `Changes to "${updated.title}" saved successfully.`);
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'Update Failed', err instanceof Error ? err.message : 'Could not save changes');
      throw err;
    }
  };

  const handleConfirmDelete = async (todo: Todo) => {
    try {
      setIsSubmitting(true);
      await todoApi.deleteTodo(todo._id);
      setDeletingTodo(null);
      addToast('info', 'Task Removed', `"${todo.title}" was deleted.`);
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'Deletion Failed', err instanceof Error ? err.message : 'Could not delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAllComplete = async () => {
    const pendingTodos = todos.filter((t) => !t.completed);
    if (pendingTodos.length === 0) return;

    try {
      await Promise.all(pendingTodos.map((t) => todoApi.toggleComplete(t._id, true)));
      addToast('success', 'All Tasks Completed!', `Marked ${pendingTodos.length} tasks as completed.`);
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'Action Incomplete', 'Could not complete all tasks at once.');
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    if (completedTodos.length === 0) return;

    try {
      await Promise.all(completedTodos.map((t) => todoApi.deleteTodo(t._id)));
      addToast('info', 'Completed Tasks Cleared', `Removed ${completedTodos.length} finished tasks.`);
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'Action Incomplete', 'Could not clear completed tasks.');
    }
  };

  const handleConnectMongo = async (uri: string) => {
    setIsConnectingMongo(true);
    try {
      const newStatus = await todoApi.testOrUpdateMongo(uri);
      setDbStatus(newStatus);
      addToast('success', 'MongoDB Connected!', 'Switched database backend to your live MongoDB cluster.');
      await loadData(false);
    } catch (err: unknown) {
      addToast('error', 'MongoDB Connection Failed', err instanceof Error ? err.message : 'Could not connect to MongoDB URI');
      throw err;
    } finally {
      setIsConnectingMongo(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  const counts = {
    all: stats?.total ?? todos.length,
    pending: stats?.pending ?? todos.filter((t) => !t.completed).length,
    completed: stats?.completed ?? todos.filter((t) => t.completed).length,
  };

  const hasSearchOrCategoryFilter = Boolean(
    searchQuery.trim() || selectedCategory !== 'all' || selectedPriority !== 'all'
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Intro banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Task Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Organize, track, and complete your tasks with full MERN persistence.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 self-start sm:self-auto">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Auto-saving changes to database</span>
          </div>
        </div>

        {/* MongoDB Atlas Setup Guidance Banner */}
        {showAtlasNotice && dbStatus && !dbStatus.isConnected && (dbStatus.placeholderDetected || dbStatus.whitelistNotice) && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 sm:mt-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900">
                  {dbStatus.placeholderDetected
                    ? 'MongoDB Atlas: Template placeholder credentials detected'
                    : 'MongoDB Atlas: Network Access IP whitelist required'}
                </p>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  {dbStatus.whitelistNotice || dbStatus.notice || 'Your tasks are currently safely saved to persistent local storage.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Configure Atlas
              </button>
              <button
                onClick={() => setShowAtlasNotice(false)}
                className="p-1.5 text-amber-700 hover:text-amber-950 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Statistics Cards */}
        <StatsDashboard stats={stats} isLoading={isLoading && !stats} />

        {/* Task Input Section */}
        <TodoInput onAddTodo={handleAddTodo} isSubmitting={isSubmitting} />

        {/* Filters and Search Bar */}
        <FilterBar
          status={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={stats?.categories || []}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onMarkAllComplete={handleMarkAllComplete}
          onClearCompleted={handleClearCompleted}
        />

        {/* Task List / Content */}
        {isLoading && todos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Loading tasks from database...</p>
          </div>
        ) : todos.length === 0 ? (
          <EmptyState
            filterStatus={statusFilter}
            hasSearchOrCategoryFilter={hasSearchOrCategoryFilter}
            onClearFilters={handleClearFilters}
            onFocusInput={() => {
              const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (inputEl) inputEl.focus();
            }}
          />
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => setEditingTodo(t)}
                onDelete={(t) => setDeletingTodo(t)}
                isUpdating={updatingTodoId === todo._id}
              />
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            TaskFlow • Full-Stack MERN Todo Application (MongoDB, Express, React 19, Node.js)
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Mongoose Schema & API Docs
            </button>
            <span>•</span>
            <span>REST API Active</span>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <EditTodoModal
        todo={editingTodo}
        isOpen={Boolean(editingTodo)}
        onClose={() => setEditingTodo(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        todo={deletingTodo}
        isOpen={Boolean(deletingTodo)}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isSubmitting}
      />

      {/* Database Connection & Architecture Modal */}
      <MongoStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
        onConnectMongo={handleConnectMongo}
        isConnecting={isConnectingMongo}
      />

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
