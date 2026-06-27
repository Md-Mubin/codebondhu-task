import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/db';
import apiRouter from './routes/index';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect DB (non-blocking)
connectDB()

app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => res.json({ success: true, message: 'ok' }));

// error handler
import { errorHandler } from './middlewares/error.middleware';
app.use(errorHandler);

export default app;
