import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Routes
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  logger.info(`✓ Server running on port ${PORT}`);
  logger.info(`✓ Environment: ${NODE_ENV}`);
  logger.info(`✓ API: http://localhost:${PORT}/api`);
});

export default app;
