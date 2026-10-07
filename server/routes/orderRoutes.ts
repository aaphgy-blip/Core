import { Router, Response } from 'express';
import { config } from '../config/index.ts';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware.ts';
import { validateCreateOrder } from '../schemas/validation.ts';
import { OrderService } from '../services/orderService.ts';

const router = Router();

// GET /checkout/fees (Public / helper)
router.get('/fees', (req, res) => {
  res.json({
    success: true,
    data: {
      service_fee: config.serviceFeeCents, // in cents (500 = $5.00 MXN)
      default_delivery_fee: config.defaultDeliveryFeeCents,
      minimum_order: 0,
      currency: config.defaultCurrency,
    },
  });
});

// Require auth for creating & viewing orders
router.use(authMiddleware);

// POST /orders
router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // Check header for idempotency key if not in body
    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotency_key;
    if (idempotencyKey) {
      req.body.idempotency_key = idempotencyKey;
    }

    const validation = validateCreateOrder(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const customerId = req.user!.id;
    const result = await OrderService.createOrder(customerId, validation.data);

    // If duplicate detected, return 200 with notice; else 201 Created
    const statusCode = result.isDuplicate ? 200 : 201;
    res.status(statusCode).json({
      success: true,
      data: result.order,
      is_duplicate: result.isDuplicate,
      message: result.isDuplicate ? 'Pedido preexistente devuelto por clave de idempotencia' : 'Pedido creado exitosamente',
    });
  } catch (err) {
    next(err);
  }
});

// GET /orders
router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = req.user!;
    let orders;
    if (user.role === 'restaurant') {
      const rest = await OrderService.listRestaurantOrders(user.id, { id: user.id, role: user.role });
      orders = rest;
    } else {
      orders = await OrderService.listCustomerOrders(user.id);
    }
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = req.user!;
    const order = await OrderService.getOrderById(req.params.id, { id: user.id, role: user.role });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
});

// POST /orders/:id/status
router.post('/:id/status', async (req: AuthenticatedRequest, res: Response, next) => {
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
