import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredTodo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate realistic 24-character hexadecimal MongoDB ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return timestamp + randomBytes;
}

const INITIAL_SEED: StoredTodo[] = [
  {
    _id: '65f0a12b4e8c1a2d3e4f5a01',
    title: 'Design high-converting landing page mockups',
    description: 'Create interactive Figma wireframes and design system components for client presentation.',
    completed: false,
    priority: 'high',
    category: 'Design',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: '65f0a12b4e8c1a2d3e4f5a02',
    title: 'Implement MongoDB Mongoose REST API endpoints',
    description: 'Ensure full CRUD endpoints (GET, POST, PUT, DELETE, PATCH) with proper validation and error handling.',
    completed: true,
    priority: 'high',
    category: 'Backend',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: '65f0a12b4e8c1a2d3e4f5a03',
    title: 'Review weekly sprint milestones and team velocity',
    description: 'Sync with frontend engineering and QA team for quarterly release readiness checklist.',
    completed: false,
    priority: 'medium',
    category: 'Management',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: '65f0a12b4e8c1a2d3e4f5a04',
    title: 'Audit application responsiveness and accessibility (a11y)',
    description: 'Verify WCAG 2.1 AA color contrast, keyboard navigation, and mobile touch targets.',
    completed: false,
    priority: 'low',
    category: 'Frontend',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export class LocalTodoStorage {
  private static readData(): StoredTodo[] {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        this.writeData(INITIAL_SEED);
        return INITIAL_SEED;
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_SEED;
    } catch (err) {
      console.error('Error reading todos from disk, initializing seed:', err);
      this.writeData(INITIAL_SEED);
      return INITIAL_SEED;
    }
  }

  private static writeData(todos: StoredTodo[]): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving todos to disk:', err);
    }
  }

  public static getAll(): StoredTodo[] {
    return this.readData();
  }

  public static getById(id: string): StoredTodo | null {
    const todos = this.readData();
    return todos.find((t) => t._id === id) || null;
  }

  public static create(data: {
    title: string;
    description?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    dueDate?: string | null;
  }): StoredTodo {
    const todos = this.readData();
    const now = new Date().toISOString();
    const newTodo: StoredTodo = {
      _id: generateObjectId(),
      title: data.title.trim(),
      description: (data.description || '').trim(),
      completed: Boolean(data.completed),
      priority: data.priority || 'medium',
      category: data.category?.trim() || 'General',
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };
    todos.unshift(newTodo);
    this.writeData(todos);
    return newTodo;
  }

  public static update(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      completed: boolean;
      priority: 'low' | 'medium' | 'high';
      category: string;
      dueDate: string | null;
    }>
  ): StoredTodo | null {
    const todos = this.readData();
    const index = todos.findIndex((t) => t._id === id);
    if (index === -1) return null;

    const existing = todos[index];
    const updatedTodo: StoredTodo = {
      ...existing,
      ...updates,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updatedTodo;
    this.writeData(todos);
    return updatedTodo;
  }

  public static delete(id: string): boolean {
    const todos = this.readData();
    const filtered = todos.filter((t) => t._id !== id);
    if (filtered.length === todos.length) return false;
    this.writeData(filtered);
    return true;
  }

  public static toggleComplete(id: string, completedStatus?: boolean): StoredTodo | null {
    const todos = this.readData();
    const index = todos.findIndex((t) => t._id === id);
    if (index === -1) return null;

    const current = todos[index];
    const newStatus = typeof completedStatus === 'boolean' ? completedStatus : !current.completed;
    
    current.completed = newStatus;
    current.updatedAt = new Date().toISOString();

    todos[index] = current;
    this.writeData(todos);
    return current;
  }
}
