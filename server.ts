import app from './app';
import { contacts } from './constants/contacts';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀  Server is running on http://localhost:${PORT}\n`);

  // Auto-run health check on startup
  const contactCount = contacts?.length;
  const status = contactCount > 0 ? '✅ ok' : '⚠️  degraded';
  console.log(`📊 Health Check: ${status} (${contactCount} contacts loaded) at ${new Date().toISOString()}\n`);
});
