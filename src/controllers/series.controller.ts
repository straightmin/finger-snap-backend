// src/controllers/series.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as seriesService from '../services/series.service';
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

/**
 * 새 시리즈를 생성하는 컨트롤러 함수
 * POST /api/series
 */
export const createSeries = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, coverPhotoId, isPublic } = req.body;
    const userId = req.user!.id;

    if (!title) {
        res.status(400).json({ message: getErrorMessage("SERIES.TITLE_REQUIRED", req.lang) });
        return;
    }

    const series = await seriesService.createSeries(userId, title, description, coverPhotoId, isPublic);
    res.status(201).json(series);
});

/**
 * 특정 시리즈의 상세 정보를 조회하는 컨트롤러 함수
 * GET /api/series/:id
 */
export const getSeriesById = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id;

    if (isNaN(seriesId)) {
        res.status(400).json({ message: getErrorMessage("SERIES.INVALID_ID", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId, currentUserId);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    res.status(200).json(series);
});

/**
 * 현재 로그인된 사용자의 모든 시리즈 목록을 조회하는 컨트롤러 함수
 * GET /api/series/me
 */
export const getMySeries = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const series = await seriesService.getUserSeries(userId, userId);
    res.status(200).json(series);
});

/**
 * 시리즈 정보를 수정하는 컨트롤러 함수
 * PUT /api/series/:id
 */
export const updateSeries = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = parseInt(req.params.id, 10);
    const { title, description, coverPhotoId, isPublic } = req.body;
    const userId = req.user!.id;

    if (isNaN(seriesId)) {
        res.status(400).json({ message: getErrorMessage("SERIES.INVALID_ID", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("SERIES.UNAUTHORIZED_UPDATE", req.lang) });
        return;
    }

    const updatedSeries = await seriesService.updateSeries(seriesId, { title, description, coverPhotoId, isPublic });
    res.status(200).json(updatedSeries);
});

/**
 * 시리즈를 삭제하는 컨트롤러 함수
 * DELETE /api/series/:id
 */
export const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    if (isNaN(seriesId)) {
        res.status(400).json({ message: getErrorMessage("SERIES.INVALID_ID", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("SERIES.UNAUTHORIZED_DELETE", req.lang) });
        return;
    }

    await seriesService.deleteSeries(seriesId);
    res.status(204).send();
});

/**
 * 시리즈에 사진을 추가하는 컨트롤러 함수
 * POST /api/series/:seriesId/photos/:photoId
 */
export const addPhotoToSeries = asyncHandler(async (req: Request, res: Response) => {
    const { seriesId, photoId } = req.params;
    const userId = req.user!.id;

    const seriesIdNum = parseInt(seriesId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(seriesIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage("GLOBAL.INVALID_ID", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesIdNum);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("SERIES.UNAUTHORIZED_ADD_PHOTO", req.lang) });
        return;
    }

    const result = await seriesService.addPhotoToSeries(seriesIdNum, photoIdNum);
    res.status(201).json(result);
});

/**
 * 시리즈에서 사진을 제거하는 컨트롤러 함수
 * DELETE /api/series/:seriesId/photos/:photoId
 */
export const removePhotoFromSeries = asyncHandler(async (req: Request, res: Response) => {
    const { seriesId, photoId } = req.params;
    const userId = req.user!.id;

    const seriesIdNum = parseInt(seriesId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(seriesIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage("GLOBAL.INVALID_ID", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesIdNum);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("SERIES.UNAUTHORIZED_REMOVE_PHOTO", req.lang) });
        return;
    }

    try {
        await seriesService.removePhotoFromSeries(seriesIdNum, photoIdNum);
        res.status(204).send();
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(404).json({ message: getErrorMessage("SERIES.PHOTO_NOT_FOUND", req.lang) });
    }
});

/**
 * 시리즈 내 사진들의 순서를 업데이트하는 컨트롤러 함수
 * PUT /api/series/:seriesId/photos/order
 */
export const updateSeriesPhotoOrder = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = parseInt(req.params.seriesId, 10);
    const { photoOrders } = req.body; // photoOrders는 [{ photoId: number, position: number }] 형태
    const userId = req.user!.id;

    if (isNaN(seriesId) || !Array.isArray(photoOrders)) {
        res.status(400).json({ message: getErrorMessage("GLOBAL.INVALID_INPUT", req.lang) });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: getErrorMessage("SERIES.NOT_FOUND", req.lang) });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("SERIES.UNAUTHORIZED_UPDATE", req.lang) });
        return;
    }

    await seriesService.updateSeriesPhotoOrder(seriesId, photoOrders);
    res.status(200).json({ message: getSuccessMessage("SERIES.PHOTO_ORDER_UPDATED", req.lang) });
});
