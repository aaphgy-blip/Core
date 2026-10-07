import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware.ts';
import { OrderService } from '../services/orderService.ts';
import { RestaurantRepository } from '../repositories/restaurantRepository.ts';

const router = Router();

router.use(authMiddleware);

// GET /restaurant/orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    let restaurantId = req.query.restaurant_id as string;
    if (!restaurantId && req.user!.role === 'restaurant') {
      const owned = await RestaurantRepository.findByOwnerId(req.user!.id);
      if (owned) {
        restaurantId = owned.id;
      }
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro restaurant_id es requerido para listar pedidos del establecimiento',
      });
    }

    const orders = await OrderService.listRestaurantOrders(restaurantId, {
      id: req.user!.id,
      role: req.user!.role,
    });
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
});

// POST /restaurant/orders/:id/accept
router.post('/orders/:id/accept', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = await OrderService.updateOrderStatus(req.params.id, 'confirmed', {
      id: req.user!.id,
      role: req.user!.role,
      notes: 'Pedido aceptado por el restaurante',
    });
    res.json({
      success: true,
      data: updated,
      message: 'Pedido confirmado exitosamente',
    });
  } catch (err) {
    next(err);
  }
});

// POST /restaurant/orders/:id/reject
router.post('/orders/:id/reject', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reason = req.body.reason || 'Rechazado por el restaurante';
    const updated = await OrderService.updateOrderStatus(req.params.id, 'cancelled', {
      id: req.user!.id,
      role: req.user!.role,
      notes: reason,
    });
    res.json({
      success: true,
      data: updated,
      message: 'Pedido rechazado',
    });
  } catch (err) {
    next(err);
  }
});

// POST /restaurant/orders/:id/status
router.post('/orders/:id/status', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'El campo status es requerido' });
    }

    const updated = await OrderService.updateOrderStatus(req.params.id, status, {
      id: req.user!.id,
      role: req.user!.role,
      notes,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
