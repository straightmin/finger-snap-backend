// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.user!.id;
    const profile = await userService.getUserProfile(userId);
    res.status(200).json(profile);
});
