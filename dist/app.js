"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import routes from './routes';
const auth_1 = require("./middeware/auth");
const responseHandlers_1 = require("./utils/responseHandlers");
const contactsController_1 = require("./controllers/contactsController");
const healthCheck_1 = require("./utils/healthCheck");
const rulesControlle_1 = require("./controllers/rulesControlle");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const contactController = new contactsController_1.ContactsController();
const rulesController = new rulesControlle_1.RulesController();
// ─── Public routes (no auth) ──────────────────────────────────────────────────
app.get('/health', healthCheck_1.healthCheck);
// ─── Protected routes (require Bearer token) ──────────────────────────────────
app.post('/evaluate', auth_1.authMiddleware, (req, res) => contactController.getContacts(req, res));
app.get('/rules', auth_1.authMiddleware, (req, res) => rulesController.getRules(req, res));
app.post('/rules', auth_1.authMiddleware, (req, res) => rulesController.createRule(req, res));
app.delete('/rules', auth_1.authMiddleware, (req, res) => rulesController.deleteRule(req, res));
// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    (0, responseHandlers_1.ErrorResHandler)(res, `Route ${req.method} ${req.path} not found`, 404);
});
// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    (0, responseHandlers_1.ErrorResHandler)(res, 'Internal server error', 500);
});
exports.default = app;
//# sourceMappingURL=app.js.map