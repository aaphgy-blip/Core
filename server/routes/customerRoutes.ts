import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware.ts';
import { AuthService } from '../services/authService.ts';
import { CustomerService } from '../services/customerService.ts';

const router = Router();

// Require auth for all customer routes
router.use(authMiddleware);

// GET /customer/profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const profile = await AuthService.getProfile(req.user!.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /customer/profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = await AuthService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// GET /customer/addresses
router.get('/addresses', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const addresses = await CustomerService.listAddresses(req.user!.id);
    res.json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
});

// POST /customer/addresses
router.post('/addresses', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.body.street || !req.body.number || !req.body.city) {
      return res.status(400).json({
        success: false,
        error: 'Calle, número y ciudad son requeridos',
      });
    }

    const created = await CustomerService.createAddress(req.user!.id, {
      label: req.body.label || 'Dirección',
      street: req.body.street,
      number: req.body.number,
      colony: req.body.colony || '',
      city: req.body.city,
      state: req.body.state || 'Guanajuato',
      postal_code: req.body.postal_code || '',
      references: req.body.references || '',
      is_default: req.body.is_default,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /customer/addresses/:id
router.put('/addresses/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = await CustomerService.updateAddress(req.user!.id, req.params.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /customer/addresses/:id
router.delete('/addresses/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const deleted = await CustomerService.deleteAddress(req.user!.id, req.params.id);
    res.json({
      success: true,
      message: 'Dirección eliminada correctamente',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
