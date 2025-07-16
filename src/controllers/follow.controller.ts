import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as followService from '../services/follow.service';

/**
 * 팔로우하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 팔로우할 사용자의 ID를 받습니다.
 * @param res Express의 Response 객체. 생성된 팔로우 정보 또는 에러 메시지를 반환합니다.
*/
export const followUser = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user?.id;
    const followingId = Number(req.params.id);

    if (!followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const follow = await followService.followUser(followerId, followingId);
    res.status(201).json(follow);
});

/**
 * 언팔로우하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 언팔로우할 사용자의 ID를 받습니다.
 * @param res Express의 Response 객체. 성공 메시지 또는 에러 메시지를 반환합니다.
 */
export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user?.id;
    const followingId = Number(req.params.id);

    if (!followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await followService.unfollowUser(followerId, followingId);
    res.status(204).send();
});

/**
 * 팔로워 목록을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사용자의 ID를 받습니다.
 * @param res Express의 Response 객체. 팔로워 목록을 반환합니다.
 */
export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const followers = await followService.getFollowers(userId);
    res.status(200).json(followers);
});

/**
 * 팔로잉 목록을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사용자의 ID를 받습니다.
 * @param res Express의 Response 객체. 팔로잉 목록을 반환합니다.
 */
export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const following = await followService.getFollowing(userId);
    res.status(200).json(following);
});

/**
 * 특정 사용자가 다른 사용자를 팔로우하고 있는지 확인하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 팔로우 상태를 확인할 사용자의 ID를 받습니다.
 * @param res Express의 Response 객체. 팔로우 상태를 반환합니다.
 */
export const isFollowing = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user?.id;
    const followingId = Number(req.params.id);

    if (!followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isFollowingStatus = await followService.isFollowing(followerId, followingId);
    res.status(200).json({ isFollowing: isFollowingStatus });
});