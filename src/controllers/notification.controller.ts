import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getErrorMessage, getSuccessMessage } from '../utils/messageMapper';

/**
 * 사용자의 알림 목록을 조회합니다.
 * @param req HTTP 요청 객체 (page, limit 쿼리 파라미터 포함)
 * @param res HTTP 응답 객체
 * @returns 알림 목록
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const notifications = await notificationService.getNotifications(userId, page, limit);
    res.status(200).json(notifications);
});

/**
 * 알림을 읽음 상태로 표시합니다.
 * @param req HTTP 요청 객체 (notificationIds 배열 포함)
 * @param res HTTP 응답 객체
 * @returns 읽음 표시 성공 메시지
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ message: getErrorMessage('NOTIFICATION.IDS_REQUIRED', req.lang) });
    }

    await notificationService.markAsRead(userId, notificationIds);
    res.status(200).json({ message: getSuccessMessage('NOTIFICATION.MARKED_READ', req.lang) });
});
