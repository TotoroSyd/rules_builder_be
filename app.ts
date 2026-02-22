import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import { authMiddleware } from './middleware/auth';
import { ErrorResHandler } from './utils/responseHandlers';

const app = express();

app.use(express.json());

// ─── Public routes (no auth) ──────────────────────────────────────────────────
app.use('/health', routes);

// ─── Protected routes (require Bearer token) ──────────────────────────────────
app.use('/evaluate', authMiddleware, routes);
app.use('/rules',    authMiddleware, routes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  ErrorResHandler(res, `Route ${req.method} ${req.path} not found`, 404);
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  ErrorResHandler(res, 'Internal server error', 500);
});

export default app;
