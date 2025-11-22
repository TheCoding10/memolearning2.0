import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { initializeDb } from './db.js';
import subjectsRouter from './api/subjects.js';
import progressRouter from './api/progress.js';
import authRouter from './api/auth.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
await initializeDb();

// API routes
app.use('/api', authRouter);
app.use('/api', subjectsRouter);
app.use('/api', progressRouter);

// Export a function to start the server
export async function startServer(port: string | number) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
