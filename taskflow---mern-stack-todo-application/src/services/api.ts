import { Todo, TodoStats, DbStatus, StatusFilter, SortOption } from '../types/todo';

const API_BASE = '/api';

export interface GetTodosParams {
  status?: StatusFilter;
  search?: string;
  category?: string;
  priority?: string;
  sortBy?: SortOption;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string | null;
}

export const todoApi = {
  async getTodos(params: GetTodosParams = {}): Promise<{ todos: Todo[]; count: number; source: string }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/todos?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }
    return {
      todos: data.data || [],
      count: data.count || 0,
      source: data.source || 'embedded-persistent',
    };
  },

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create task');
    }
    return data.data;
  },

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update task');
    }
    return data.data;
  },

  async deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete task');
    }
  },

  async toggleComplete(id: string, completed?: boolean): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof completed === 'boolean' ? { completed } : {}),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update completion status');
    }
    return data.data;
  },

  async getStats(): Promise<TodoStats> {
    const res = await fetch(`${API_BASE}/todos/stats`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to load task statistics');
    }
    return data.data;
  },

  async getDbStatus(): Promise<DbStatus> {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to retrieve database status');
    }
    return data.data;
  },

  async testOrUpdateMongo(uri: string): Promise<DbStatus> {
    const res = await fetch(`${API_BASE}/config/mongo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to connect to MongoDB');
    }
    return data.data;
  },
};
