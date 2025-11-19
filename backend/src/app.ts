import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import googleRoutes from './routes/googleRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app: Application = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    path: req.path,
    origin: req.get('origin'),
    userAgent: req.get('user-agent')
  });
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running' 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleRoutes);
app.use('/api/leads', leadRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
