import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀  Monitoring API (TypeScript) running on http://localhost:${PORT}\n`);
  console.log('Endpoints:');
  console.log('  POST   /evaluate       — evaluate an ad-hoc rule');
  console.log('  GET    /rules          — list all saved rules');
  console.log('  POST   /rules          — save a new rule');
  console.log('  DELETE /rules/:id      — delete a saved rule');
  console.log('  GET    /health         — health check\n');
});
