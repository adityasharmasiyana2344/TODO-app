import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import todoRoutes from './server/routes/todoRoutes';
import { connectDB } from './server/config/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Core Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger for API routes
  app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Mount API endpoints
  app.use('/api', todoRoutes);

  // Health ping
  app.get('/api/ping', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Connect to Database
  await connectDB();

  // Vite integration in Dev vs Static files in Production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware initialized on Express server.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('📦 Serving production static build from dist folder.');
  }

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TaskFlow MERN Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
