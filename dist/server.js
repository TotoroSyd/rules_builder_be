"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const contacts_1 = require("./constants/contacts");
const PORT = Number(process.env.PORT) || 3000;
app_1.default.listen(PORT, () => {
    console.log(`\n🚀  Server is running on http://localhost:${PORT}\n`);
    // Auto-run health check on startup
    const contactCount = contacts_1.contacts?.length;
    const status = contactCount > 0 ? '✅ ok' : '⚠️  degraded';
    console.log(`📊 Health Check: ${status} (${contactCount} contacts loaded) at ${new Date().toISOString()}\n`);
});
//# sourceMappingURL=server.js.map