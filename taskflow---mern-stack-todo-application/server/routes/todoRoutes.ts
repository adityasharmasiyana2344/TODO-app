import { Router } from 'express';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleComplete,
  getStats,
  getDatabaseStatus,
  configureMongoDB,
} from '../controllers/todoController';

const router = Router();

// Statistics and Health routes
router.get('/todos/stats', getStats);
router.get('/status', getDatabaseStatus);
router.post('/config/mongo', configureMongoDB);

// Main CRUD routes for Todos
router.route('/todos')
  .get(getTodos)
  .post(createTodo);

router.route('/todos/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

// Specific toggle completion route
router.patch('/todos/:id/complete', toggleComplete);

export default router;
