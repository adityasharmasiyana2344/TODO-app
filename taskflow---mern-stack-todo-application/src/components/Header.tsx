import React from 'react';
import { CheckSquare, Database, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { DbStatus } from '../types/todo';

interface HeaderProps {
  dbStatus: DbStatus | null;
  onOpenDbModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dbStatus,
  onOpenDbModal,
  onRefresh,
  isLoading,
}) => {
  const isMongoLive = dbStatus?.isConnected;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/30">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                Task<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Flow</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                MERN Stack
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              MongoDB • Express • React • Node.js
            </p>
          </div>
        </div>

        {/* Database Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh tasks from database"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Database Status Badge */}
          <button
            onClick={onOpenDbModal}
            className={`group inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-xs ${
              isMongoLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Click to view database connection details or connect MongoDB Atlas"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isMongoLive ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isMongoLive ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5 opacity-80" />
            <span className="font-semibold">
              {isMongoLive ? 'MongoDB Atlas Live' : 'Embedded DB (Persistent)'}
            </span>
            <span className="hidden md:inline text-[11px] opacity-60 underline">
              Settings
            </span>
          </button>

          {/* Architecture Quick Link */}
          <button
            onClick={onOpenDbModal}
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Mongoose Schema</span>
          </button>
        </div>
      </div>
    </header>
  );
};
