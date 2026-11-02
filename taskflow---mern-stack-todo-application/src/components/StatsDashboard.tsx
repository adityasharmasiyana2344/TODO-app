import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Sparkles } from 'lucide-react';
import { TodoStats } from '../types/todo';

interface StatsDashboardProps {
  stats: TodoStats | null;
  isLoading: boolean;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, isLoading }) => {
  const total = stats?.total ?? 0;
  const completed = stats?.completed ?? 0;
  const pending = stats?.pending ?? 0;
  const rate = stats?.completionRate ?? (total > 0 ? Math.round((completed / total) * 100) : 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-7">
      {/* Total Tasks Card */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tasks
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {isLoading ? (
                <span className="inline-block w-8 h-7 bg-slate-200 animate-pulse rounded" />
              ) : (
                total
              )}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-500 font-medium">
          <span className="text-blue-600 font-semibold mr-1">All</span> recorded items in MongoDB
        </div>
      </div>

      {/* Pending Tasks Card */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-900 mt-1">
              {isLoading ? (
                <span className="inline-block w-8 h-7 bg-slate-200 animate-pulse rounded" />
              ) : (
                pending
              )}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-500 font-medium">
          <span className="text-indigo-600 font-semibold mr-1">{pending}</span> awaiting completion
        </div>
      </div>

      {/* Completed Tasks Card */}
      <div className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">
              {isLoading ? (
                <span className="inline-block w-8 h-7 bg-slate-200 animate-pulse rounded" />
              ) : (
                completed
              )}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-500 font-medium">
          <span className="text-purple-600 font-semibold mr-1">{completed}</span> finished tasks
        </div>
      </div>

      {/* Completion Rate / Velocity */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-4 sm:p-5 rounded-2xl shadow-md shadow-indigo-600/20 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Completion Rate
            </p>
            <div className="flex items-baseline space-x-1 mt-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {isLoading ? '...' : `${rate}%`}
              </h3>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5">
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-xs">
            <div
              className="bg-white h-2 rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
