import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware.ts';
import { validateLogin, validateRegister } from '../schemas/validation.ts';
import { AuthService } from '../services/authService.ts';

const router = Router();

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const result = await AuthService.register(validation.data);
    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const result = await AuthService.login(validation.data);
    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const profile = await AuthService.getProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      user: profile,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /auth/profile or PUT /users/me
router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = await AuthService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
});

export default router;
