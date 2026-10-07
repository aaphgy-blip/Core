import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './server/config/index.ts';
import { createCoreApp } from './server/app.ts';
import { initDb } from './server/db/connection.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDb();

  const app = express();
  const coreApp = createCoreApp();

  // Mount API at /api
  app.use('/api', coreApp);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = config.port || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Directaurante Core V2] Servidor activo en http://0.0.0.0:${port}`);
    console.log(`[Directaurante Core V2] API Base: http://0.0.0.0:${port}/api`);
    console.log(`[Directaurante Core V2] Health Check: http://0.0.0.0:${port}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[Directaurante Core V2] Error fatal al iniciar servidor:', err);
  process.exit(1);
});
