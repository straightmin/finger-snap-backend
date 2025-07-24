import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const notifications = await notificationService.getNotifications(userId, page, limit);
    res.status(200).json(notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ message: getErrorMessage("NOTIFICATION.IDS_REQUIRED", req.lang) });
    }

    await notificationService.markAsRead(userId, notificationIds);
    res.status(200).json({ message: getSuccessMessage("NOTIFICATION.MARKED_READ", req.lang) });
});
