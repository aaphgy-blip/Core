import express from 'express';
import cors from 'cors';
import { config } from './config/index.ts';
import authRoutes from './routes/authRoutes.ts';
import restaurantRoutes from './routes/restaurantRoutes.ts';
import customerRoutes from './routes/customerRoutes.ts';
import orderRoutes from './routes/orderRoutes.ts';
import restaurantPortalRoutes from './routes/restaurantPortalRoutes.ts';
import { CatalogService } from './services/restaurantService.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export function getCorsOptions(overrideOrigin?: string): cors.CorsOptions {
  return {
    origin: (origin, callback) => {
      const activeCorsOrigin = overrideOrigin !== undefined ? overrideOrigin : config.corsOrigin;

      // In development or test without explicit restrictions, allow all
      if (config.nodeEnv !== 'production' && (!activeCorsOrigin || activeCorsOrigin === '*')) {
        return callback(null, true);
      }

      if (activeCorsOrigin === '*') {
        return callback(null, true);
      }

      const allowedOrigins = (activeCorsOrigin || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

      // Non-browser / same-origin requests (origin undefined) are permitted
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy: Origen '${origin}' no permitido por Directaurante Core V2`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key'],
  };
}

export function createCoreApp() {
  const app = express();

  app.use(cors(getCorsOptions()));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Directaurante Core V2',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Global Categories endpoint: /categories
  app.get('/categories', async (req, res, next) => {
    try {
      const categories = await CatalogService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  });

  // Core Modular Routes
  app.use('/auth', authRoutes);
  app.use('/users', authRoutes); // supports PUT /users/me
  app.use('/restaurants', restaurantRoutes);
  app.use('/customer', customerRoutes);
  app.use('/orders', orderRoutes);
  app.use('/checkout', orderRoutes);
  app.use('/restaurant', restaurantPortalRoutes);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

export const coreApiApp = createCoreApp();
