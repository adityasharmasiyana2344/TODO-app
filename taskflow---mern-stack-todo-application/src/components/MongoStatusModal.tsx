import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Server,
  Layers,
  Code2,
  Terminal,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DbStatus } from '../types/todo';

interface MongoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DbStatus | null;
  onConnectMongo: (uri: string) => Promise<void>;
  isConnecting: boolean;
}

export const MongoStatusModal: React.FC<MongoStatusModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onConnectMongo,
  isConnecting,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'api'>('status');
  const [customUri, setCustomUri] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isLiveMongo = dbStatus?.isConnected;

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) return;

    try {
      setActionMessage(null);
      await onConnectMongo(customUri.trim());
      setActionMessage({
        type: 'success',
        text: 'MongoDB connected successfully!',
      });
      setCustomUri('');
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Connection failed. Verify URI and IP whitelist.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">MERN Stack Architecture</h3>
              <p className="text-xs text-slate-500">MongoDB, Express.js, React, Node.js</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            Database Status & Config
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Mongoose Schema
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            REST Endpoints
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Connection Status Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                  isLiveMongo
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isLiveMongo ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm sm:text-base">
                      {isLiveMongo ? 'MongoDB Atlas Connected' : 'Persistent Storage Active (Mongoose Ready)'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isLiveMongo
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-indigo-200 text-indigo-900'
                      }`}
                    >
                      {dbStatus?.mode || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    {dbStatus?.modeDescription}
                  </p>
                  <div className="mt-2 text-[11px] font-mono opacity-75">
                    Host: {dbStatus?.host || 'localhost'} • Database: {dbStatus?.databaseName || 'tododb'}
                  </div>
                </div>
              </div>

              {/* Whitelist or Placeholder Guidance Notice */}
              {(dbStatus?.placeholderDetected || dbStatus?.whitelistNotice || dbStatus?.notice) && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>MongoDB Atlas Setup Guide</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {dbStatus.whitelistNotice || dbStatus.notice}
                  </p>
                  <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1 font-sans">
                    <div className="font-semibold text-slate-800">Required steps on MongoDB Atlas:</div>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>
                        <strong>Network Access:</strong> Go to <em>Security → Network Access</em>, click <em>Add IP Address</em>, and select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>.
                      </li>
                      <li>
                        <strong>Database Access:</strong> Ensure your user in <em>Database Access</em> has <strong>readWriteAnyDatabase</strong> or <strong>readWrite</strong> privileges.
                      </li>
                      <li>
                        <strong>Replace Placeholders:</strong> Replace <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">&lt;db_username&gt;</code> and <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">&lt;db_password&gt;</code> with your actual login credentials.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Connect Custom MongoDB Atlas URI */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Connect to MongoDB Atlas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Enter your Atlas database username & password below. Credentials are automatically URL-encoded.
                  </p>
                </div>

                {/* Quick Atlas Credentials Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Atlas Database Username
                    </label>
                    <input
                      type="text"
                      id="atlas-user"
                      placeholder="e.g. admin or dbUser"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Database Password
                    </label>
                    <input
                      type="password"
                      id="atlas-pass"
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                      Cluster: {dbStatus?.suggestedCluster || 'cluster0.fbutxff.mongodb.net'}
                    </span>
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={() => {
                        const userEl = document.getElementById('atlas-user') as HTMLInputElement;
                        const passEl = document.getElementById('atlas-pass') as HTMLInputElement;
                        if (!userEl?.value || !passEl?.value) {
                          setActionMessage({ type: 'error', text: 'Please enter both username and password' });
                          return;
                        }
                        const cluster = dbStatus?.suggestedCluster || 'cluster0.fbutxff.mongodb.net';
                        const encodedUser = encodeURIComponent(userEl.value.trim());
                        const encodedPass = encodeURIComponent(passEl.value.trim());
                        const fullUri = `mongodb+srv://${encodedUser}:${encodedPass}@${cluster}/tododb?retryWrites=true&w=majority`;
                        setCustomUri(fullUri);
                        onConnectMongo(fullUri)
                          .then(() => setActionMessage({ type: 'success', text: 'MongoDB connected successfully!' }))
                          .catch((err) => setActionMessage({ type: 'error', text: err.message || 'Connection failed. Check credentials and Atlas IP whitelist (0.0.0.0/0).' }));
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                      <span>{isConnecting ? 'Connecting...' : 'Connect Atlas'}</span>
                    </button>
                  </div>
                </div>

                {/* Or paste full URI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Or paste full Connection String (URI)</span>
                  </div>
                  <form onSubmit={handleConnectSubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={customUri}
                        onChange={(e) => setCustomUri(e.target.value)}
                        placeholder="mongodb+srv://user:pass@cluster0.abcde.mongodb.net/tododb?retryWrites=true&w=majority"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {actionMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                          actionMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {actionMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{actionMessage.text}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Supports mongodb+srv:// and mongodb://
                      </span>
                      <button
                        type="submit"
                        disabled={isConnecting || !customUri.trim()}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                        <span>{isConnecting ? 'Testing...' : 'Test Full URI'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                The application uses official Mongoose Schema definition with timestamps, trimming, and validation:
              </p>
              <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-slate-200 overflow-x-auto shadow-inner">
                <pre>{`const TodoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      default: 'General'
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // generates createdAt & updatedAt
  }
);`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                All REST API endpoints are fully implemented with Express.js:
              </p>
              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/api/todos', desc: 'Fetch all todos (status, search, category filters)' },
                  { method: 'POST', path: '/api/todos', desc: 'Add a new todo with validation' },
                  { method: 'GET', path: '/api/todos/:id', desc: 'Get specific todo by MongoDB _id' },
                  { method: 'PUT', path: '/api/todos/:id', desc: 'Update existing todo details' },
                  { method: 'PATCH', path: '/api/todos/:id/complete', desc: 'Toggle completion status' },
                  { method: 'DELETE', path: '/api/todos/:id', desc: 'Delete todo permanently' },
                  { method: 'GET', path: '/api/todos/stats', desc: 'Task statistics for dashboard' },
                  { method: 'GET', path: '/api/status', desc: 'Database connection & health check' },
                ].map((ep) => (
                  <div
                    key={ep.path + ep.method}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700'
                            : ep.method === 'PATCH'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-900 font-semibold">{ep.path}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] hidden sm:inline">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
