import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as followService from '../services/follow.service';
import { getErrorMessage } from "../utils/messageMapper";

/**
 * 팔로우/언팔로우를 토글합니다.
 * @param req HTTP 요청 객체 (팔로우할 사용자 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 팔로우/언팔로우 결과
 */
export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user?.id;
    const followingId = Number(req.params.id);

    if (!followerId) {
        return res.status(401).json({ message: getErrorMessage("GLOBAL.UNAUTHORIZED", req.lang) });
    }

    const result = await followService.toggleFollow(followerId, followingId, req.lang || 'ko');
    res.status(200).json(result);
});

/**
 * 팔로워 목록을 조회합니다.
 * @param req HTTP 요청 객체 (사용자 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 팔로워 목록
 */
export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const followers = await followService.getFollowers(userId);
    res.status(200).json(followers);
});

/**
 * 팔로잉 목록을 조회합니다.
 * @param req HTTP 요청 객체 (사용자 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 팔로잉 목록
 */
export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const following = await followService.getFollowing(userId);
    res.status(200).json(following);
});

/**
 * 특정 사용자를 팔로우하고 있는지 확인합니다.
 * @param req HTTP 요청 객체 (팔로우 상태를 확인할 사용자 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 팔로우 상태 정보
 */
export const isFollowing = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user?.id;
    const followingId = Number(req.params.id);

    if (!followerId) {
        return res.status(401).json({ message: getErrorMessage("GLOBAL.UNAUTHORIZED", req.lang) });
    }

    const isFollowingStatus = await followService.isFollowing(followerId, followingId);
    res.status(200).json({ isFollowing: isFollowingStatus });
});