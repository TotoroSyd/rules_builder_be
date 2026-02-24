import express, { Request, Response, NextFunction } from 'express';
// import routes from './routes';
import { authMiddleware } from './middleware/auth';
import { ErrorResHandler } from './utils/responseHandlers';
import { ContactsController } from './controllers/contactsController';
import { healthCheck } from './utils/healthCheck';
import { RulesController } from './controllers/rulesController';

const app = express();

app.use(express.json());
// fix CORS preflight issue Error: 404 - Route OPTIONS /evaluate not found - Details: undefined 
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
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
