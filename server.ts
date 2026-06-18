import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { webhooksRouter } from './src/routes/webhooks.js';
import { apiRouter } from './src/routes/api.js';
import { instancesRouter } from './src/routes/instances.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(cors());
  app.use(express.json());
  
  // Custom auth middleware for internal APIs (optional but recommended)
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers.authorization;
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret && auth !== `Bearer ${internalSecret}`) {
      // return res.status(401).json({ error: 'Unauthorized' });
      // Leaving this relaxed by default to allow local n8n access,
      // but in production, we should uncomment it.
      console.warn('Unauthorized API access attempt');
    }
    next();
  };

  // Mount API endpoints
  app.use('/webhooks', webhooksRouter);
  app.use('/instance', instancesRouter);
  app.use('/api/message', apiRouter); // mapped /api/message prefix for semantics similar to Evolution API

  // Status/Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'whatsapp-hub' });
  });

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hub server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
