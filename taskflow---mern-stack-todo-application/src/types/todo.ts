export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: Priority;
  category?: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  categories: string[];
}

export interface DbStatus {
  isConnected: boolean;
  mode: 'mongodb' | 'embedded-persistent';
  uri: string;
  host: string;
  error?: string;
  placeholderDetected?: boolean;
  whitelistNotice?: string;
  notice?: string;
  lastChecked: string;
  databaseName?: string;
  suggestedCluster?: string;
  modeDescription?: string;
}

export type StatusFilter = 'all' | 'pending' | 'completed';
export type SortOption = 'newest' | 'oldest' | 'priority' | 'title';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
