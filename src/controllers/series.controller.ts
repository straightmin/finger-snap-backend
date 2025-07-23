// src/controllers/series.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as seriesService from '../services/series.service';

/**
 * 새 시리즈를 생성하는 컨트롤러 함수
 * POST /api/series
 */
export const createSeries = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, coverPhotoId, isPublic } = req.body;
    const userId = req.user!.id;

    if (!title) {
        res.status(400).json({ message: 'Series title is required' });
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
        res.status(400).json({ message: 'Invalid series ID' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId, currentUserId);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
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
        res.status(400).json({ message: 'Invalid series ID' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: 'You are not authorized to update this series' });
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
        res.status(400).json({ message: 'Invalid series ID' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: 'You are not authorized to delete this series' });
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
        res.status(400).json({ message: 'Invalid ID' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesIdNum);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: 'You are not authorized to add photos to this series' });
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
        res.status(400).json({ message: 'Invalid ID' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesIdNum);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: 'You are not authorized to remove photos from this series' });
        return;
    }

    try {
        await seriesService.removePhotoFromSeries(seriesIdNum, photoIdNum);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: 'Photo not found in the series' });
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
        res.status(400).json({ message: 'Invalid input' });
        return;
    }

    const series = await seriesService.getSeriesById(seriesId);

    if (!series) {
        res.status(404).json({ message: 'Series not found' });
        return;
    }

    if (series.userId !== userId) {
        res.status(403).json({ message: 'You are not authorized to update this series' });
        return;
    }

    await seriesService.updateSeriesPhotoOrder(seriesId, photoOrders);
    res.status(200).json({ message: 'Photo order updated successfully' });
});
