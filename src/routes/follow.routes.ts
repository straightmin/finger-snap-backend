import { Router } from 'express';
import {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing
} from '../controllers/follow.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/:id/follow', authenticateToken, followUser);
router.delete('/:id/follow', authenticateToken, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id/follow-status', authenticateToken, isFollowing);

export default router;
