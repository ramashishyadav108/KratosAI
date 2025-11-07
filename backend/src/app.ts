import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import googleRoutes from './routes/googleRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

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

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running' 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
