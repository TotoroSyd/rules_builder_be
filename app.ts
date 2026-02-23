import express, { Request, Response, NextFunction } from 'express';
// import routes from './routes';
import { authMiddleware } from './middeware/auth';
import { ErrorResHandler } from './utils/responseHandlers';
import { ContactsController } from './controllers/contactsController';
import { healthCheck } from './utils/healthCheck';
import { RulesController } from './controllers/rulesControlle';

const app = express();

app.use(express.json());
const contactController = new ContactsController();
const rulesController = new RulesController();

// ─── Public routes (no auth) ──────────────────────────────────────────────────
app.get('/health', healthCheck);

// ─── Protected routes (require Bearer token) ──────────────────────────────────
app.post('/evaluate', authMiddleware, (req: Request, res: Response) => contactController.getContacts(req, res));
app.get('/rules', authMiddleware, (req: Request, res: Response) => rulesController.getRules(req, res));
app.post('/rules', authMiddleware, (req: Request, res: Response) => rulesController.createRule(req, res));
app.delete('/rules', authMiddleware, (req: Request, res: Response) => rulesController.deleteRule(req, res));

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
