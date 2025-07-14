// src/routes/user.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getMyProfile } from '../controllers/user.controller';

const router = Router();

router.get('/me/profile', authenticateToken, getMyProfile);

export default router;
