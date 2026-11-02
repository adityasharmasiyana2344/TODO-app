import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Todo } from '../models/Todo';
import { LocalTodoStorage } from '../storage/fileStore';
import { dbState, connectDB } from '../config/db';

// Helper to determine if we should query Mongoose or Local Storage
function isMongooseActive(): boolean {
  return dbState.isConnected && mongoose.connection.readyState === 1;
}

/**
 * @desc   Fetch all todos with optional status/search/category filtering
 * @route  GET /api/todos
 */
export async function getTodos(req: Request, res: Response): Promise<void> {
  try {
    const { status, search, category, priority, sortBy = 'newest' } = req.query;

    if (isMongooseActive()) {
      const query: Record<string, unknown> = {};

      if (status === 'completed') {
        query.completed = true;
      } else if (status === 'pending') {
        query.completed = false;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }, { category: regex }];
      }

      if (category && typeof category === 'string' && category !== 'all') {
        query.category = category;
      }

      if (priority && typeof priority === 'string' && priority !== 'all') {
        query.priority = priority;
      }

      let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
      if (sortBy === 'oldest') {
        sortOptions = { createdAt: 1 };
      } else if (sortBy === 'title') {
        sortOptions = { title: 1 };
      } else if (sortBy === 'priority') {
        sortOptions = { priority: -1 };
      }

      const todos = await Todo.find(query).sort(sortOptions).lean();

      res.status(200).json({
        success: true,
        count: todos.length,
        source: 'mongodb',
        data: todos,
      });
      return;
    }

    // Fallback: Persistent Embedded Store
    let todos = LocalTodoStorage.getAll();

    if (status === 'completed') {
      todos = todos.filter((t) => t.completed);
    } else if (status === 'pending') {
      todos = todos.filter((t) => !t.completed);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      todos = todos.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (priority && typeof priority === 'string' && priority !== 'all') {
      todos = todos.filter((t) => t.priority === priority);
    }

    if (sortBy === 'oldest') {
      todos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'title') {
      todos.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: newest
      todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.status(200).json({
      success: true,
      count: todos.length,
      source: 'embedded-persistent',
      data: todos,
    });
  } catch (error: unknown) {
    console.error('Error in getTodos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Fetch single todo by ID
 * @route  GET /api/todos/:id
 */
export async function getTodoById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (isMongooseActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID format' });
        return;
      }
      const todo = await Todo.findById(id).lean();
      if (!todo) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: todo });
      return;
    }

    const todo = LocalTodoStorage.getById(id);
    if (!todo) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    res.status(200).json({ success: true, data: todo });
  } catch (error: unknown) {
    console.error('Error in getTodoById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task details',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Create a new todo
 * @route  POST /api/todos
 */
export async function createTodo(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, completed, priority, category, dueDate } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Title is required and cannot be empty.',
      });
      return;
    }

    if (title.trim().length > 120) {
      res.status(400).json({
        success: false,
        message: 'Title cannot exceed 120 characters.',
      });
      return;
    }

    const cleanedDescription = typeof description === 'string' ? description.trim() : '';
    const cleanedPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    const cleanedCategory = typeof category === 'string' && category.trim() ? category.trim() : 'General';
    const cleanedDueDate = dueDate ? new Date(dueDate).toISOString() : null;

    if (isMongooseActive()) {
      const newTodo = await Todo.create({
        title: title.trim(),
        description: cleanedDescription,
        completed: Boolean(completed),
        priority: cleanedPriority,
        category: cleanedCategory,
        dueDate: cleanedDueDate ? new Date(cleanedDueDate) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully in MongoDB',
        data: newTodo,
      });
      return;
    }

    const created = LocalTodoStorage.create({
      title,
      description: cleanedDescription,
      completed: Boolean(completed),
      priority: cleanedPriority as 'low' | 'medium' | 'high',
      category: cleanedCategory,
      dueDate: cleanedDueDate,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully (saved to disk)',
      data: created,
    });
  } catch (error: unknown) {
    console.error('Error in createTodo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Update an existing todo
 * @route  PUT /api/todos/:id
 */
export async function updateTodo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, category, dueDate } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Title cannot be blank.',
        });
        return;
      }
      if (title.trim().length > 120) {
        res.status(400).json({
          success: false,
          message: 'Title cannot exceed 120 characters.',
        });
        return;
      }
    }

    if (isMongooseActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID format' });
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (completed !== undefined) updateData.completed = Boolean(completed);
      if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
        updateData.priority = priority;
      }
      if (category !== undefined) updateData.category = category.trim();
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

      const updated = await Todo.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updated,
      });
      return;
    }

    const updated = LocalTodoStorage.update(id, {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(completed !== undefined && { completed: Boolean(completed) }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category: category.trim() }),
      ...(dueDate !== undefined && { dueDate }),
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated,
    });
  } catch (error: unknown) {
    console.error('Error in updateTodo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Delete a todo
 * @route  DELETE /api/todos/:id
 */
export async function deleteTodo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (isMongooseActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID format' });
        return;
      }

      const deleted = await Todo.findByIdAndDelete(id).lean();
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully from MongoDB',
        data: deleted,
      });
      return;
    }

    const removed = LocalTodoStorage.delete(id);
    if (!removed) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { _id: id },
    });
  } catch (error: unknown) {
    console.error('Error in deleteTodo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Mark a todo as completed or pending
 * @route  PATCH /api/todos/:id/complete
 */
export async function toggleComplete(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (isMongooseActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID format' });
        return;
      }

      const current = await Todo.findById(id);
      if (!current) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      const newStatus = typeof completed === 'boolean' ? completed : !current.completed;
      current.completed = newStatus;
      await current.save();

      res.status(200).json({
        success: true,
        message: newStatus ? 'Task marked as completed' : 'Task marked as pending',
        data: current,
      });
      return;
    }

    const toggled = LocalTodoStorage.toggleComplete(id, completed);
    if (!toggled) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: toggled.completed ? 'Task marked as completed' : 'Task marked as pending',
      data: toggled,
    });
  } catch (error: unknown) {
    console.error('Error in toggleComplete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task completion status',
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

/**
 * @desc   Get comprehensive task statistics for dashboard
 * @route  GET /api/todos/stats
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    let allTodos: Array<{ completed: boolean; priority?: string; category?: string }>;

    if (isMongooseActive()) {
      allTodos = await Todo.find({}, 'completed priority category').lean();
    } else {
      allTodos = LocalTodoStorage.getAll();
    }

    const total = allTodos.length;
    const completed = allTodos.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      high: allTodos.filter((t) => t.priority === 'high').length,
      medium: allTodos.filter((t) => t.priority === 'medium').length,
      low: allTodos.filter((t) => t.priority === 'low').length,
    };

    const categories = Array.from(new Set(allTodos.map((t) => t.category || 'General')));

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        completionRate,
        byPriority,
        categories,
      },
    });
  } catch (error: unknown) {
    console.error('Error in getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
}

/**
 * @desc   Get database connection health and info
 * @route  GET /api/status
 */
export async function getDatabaseStatus(_req: Request, res: Response): Promise<void> {
  const isConn = isMongooseActive();
  let suggestedCluster = '';
  if (dbState.uri) {
    const match = dbState.uri.match(/@([^/?]+)/);
    if (match) suggestedCluster = match[1];
  }

  res.status(200).json({
    success: true,
    data: {
      ...dbState,
      suggestedCluster,
      mongooseReadyState: mongoose.connection.readyState,
      databaseName: mongoose.connection.name || 'tododb',
      modeDescription: isConn
        ? 'Connected to live MongoDB server / Atlas Cluster'
        : 'Running in Persistent Embedded Storage Mode (Auto-backed to JSON file; 100% schema compliant)',
    },
  });
}

/**
 * @desc   Test or switch MongoDB connection dynamically
 * @route  POST /api/config/mongo
 */
export async function configureMongoDB(req: Request, res: Response): Promise<void> {
  try {
    const { uri } = req.body;
    if (!uri || typeof uri !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid MongoDB connection string (URI).',
      });
      return;
    }

    const success = await connectDB(uri.trim());
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Successfully connected to MongoDB!',
        data: dbState,
      });
    } else {
      res.status(400).json({
        success: false,
        message: dbState.error || 'Could not connect to MongoDB with provided URI.',
        data: dbState,
      });
    }
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Failed to configure MongoDB connection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
