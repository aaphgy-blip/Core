import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import restaurantRoutes from './routes/restaurantRoutes.ts';
import customerRoutes from './routes/customerRoutes.ts';
import orderRoutes from './routes/orderRoutes.ts';
import restaurantPortalRoutes from './routes/restaurantPortalRoutes.ts';
import { CatalogService } from './services/restaurantService.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export function createCoreApp() {
  const app = express();

  app.use(cors());
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
