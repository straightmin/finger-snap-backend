import { Router } from 'express';
import {
    toggleFollow,
    getFollowers,
    getFollowing,
} from '../controllers/follow.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/:id/toggle-follow', authenticateToken, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
