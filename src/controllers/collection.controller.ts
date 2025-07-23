// src/controllers/collection.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as collectionService from '../services/collection.service';
import { getErrorMessage } from "../utils/messageMapper";

/**
 * 사진을 기본 컬렉션에 추가하거나 제거하는 컨트롤러 함수
 * POST /api/photos/:id/collection
 */
export const toggleCollection = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (isNaN(photoId)) {
        res.status(400).json({ message: getErrorMessage("PHOTO.INVALID_ID", lang) });
        return;
    }

    const result = await collectionService.togglePhotoInDefaultCollection(userId, photoId);
    res.status(200).json(result);
});

/**
 * 사용자의 기본 컬렉션에 있는 사진 목록을 조회하는 컨트롤러 함수
 * GET /api/users/me/collections
 */
export const getMyCollections = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const currentUserId = req.user?.id;
    const photos = await collectionService.getDefaultCollectionPhotos(userId, currentUserId);

    const photosWithLikeCount = photos.map(item => ({
        ...item.photo,
        likesCount: item.photo._count.likes,
    }));

    res.status(200).json(photosWithLikeCount);
});

/**
 * 새로운 컬렉션을 생성하는 컨트롤러 함수
 * POST /api/collections
 */
export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (!title) {
        res.status(400).json({ message: getErrorMessage("COLLECTION.TITLE_REQUIRED", lang) });
        return;
    }

    const collection = await collectionService.createCollection(userId, title, description);
    res.status(201).json(collection);
});

/**
 * 현재 로그인된 사용자의 모든 컬렉션 목록을 조회하는 컨트롤러 함수
 * GET /api/collections
 */
export const getUserCollections = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const collections = await collectionService.getUserCollections(userId);
    res.status(200).json(collections);
});

/**
 * 특정 컬렉션의 상세 정보를 조회하는 컨트롤러 함수
 * GET /api/collections/:id
 */
export const getCollectionById = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (isNaN(collectionId)) {
        res.status(400).json({ message: getErrorMessage("COLLECTION.INVALID_ID", lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionId, currentUserId);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage("COLLECTION.NOT_FOUND", lang) });
        return;
    }

    res.status(200).json(collection);
});

/**
 * 컬렉션 정보를 수정하는 컨트롤러 함수
 * PUT /api/collections/:id
 */
export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = parseInt(req.params.id, 10);
    const { title, description } = req.body;
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (isNaN(collectionId)) {
        res.status(400).json({ message: getErrorMessage("COLLECTION.INVALID_ID", lang) });
        return;
    }

    if (!title) {
        res.status(400).json({ message: getErrorMessage("COLLECTION.TITLE_REQUIRED", lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionId);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage("COLLECTION.NOT_FOUND", lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("COLLECTION.UNAUTHORIZED_UPDATE", lang) });
        return;
    }

    const updatedCollection = await collectionService.updateCollection(collectionId, title, description);
    res.status(200).json(updatedCollection);
});

/**
 * 컬렉션을 삭제하는 컨트롤러 함수
 * DELETE /api/collections/:id
 */
export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (isNaN(collectionId)) {
        res.status(400).json({ message: getErrorMessage("COLLECTION.INVALID_ID", lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionId);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage("COLLECTION.NOT_FOUND", lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("COLLECTION.UNAUTHORIZED_DELETE", lang) });
        return;
    }

    await collectionService.deleteCollection(collectionId);
    res.status(204).send();
});

/**
 * 컬렉션에 사진을 추가하는 컨트롤러 함수
 * POST /api/collections/:collectionId/photos/:photoId
 */
export const addPhotoToCollection = asyncHandler(async (req: Request, res: Response) => {
    const { collectionId, photoId } = req.params;
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    const collectionIdNum = parseInt(collectionId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(collectionIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage("GLOBAL.INVALID_ID", lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionIdNum);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage("COLLECTION.NOT_FOUND", lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("COLLECTION.UNAUTHORIZED_ADD_PHOTO", lang) });
        return;
    }

    const result = await collectionService.addPhotoToCollection(collectionIdNum, photoIdNum);

    if (!result) {
        res.status(409).json({ message: getErrorMessage("COLLECTION.PHOTO_ALREADY_EXISTS", lang) });
        return;
    }

    res.status(201).json(result);
});

/**
 * 컬렉션에서 사진을 제거하는 컨트롤러 함수
 * DELETE /api/collections/:collectionId/photos/:photoId
 */
export const removePhotoFromCollection = asyncHandler(async (req: Request, res: Response) => {
    const { collectionId, photoId } = req.params;
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    const collectionIdNum = parseInt(collectionId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(collectionIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage("GLOBAL.INVALID_ID", lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionIdNum);

    if (!collection) {
        res.status(404).json({ message: 'Collection not found' });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage("COLLECTION.UNAUTHORIZED_REMOVE_PHOTO", lang) });
        return;
    }

    try {
        await collectionService.removePhotoFromCollection(collectionIdNum, photoIdNum);
        res.status(204).send();
    } catch (error) {
        // Prisma의 P2025 코드는 레코드를 찾지 못했을 때 발생합니다.
        res.status(404).json({ message: getErrorMessage("COLLECTION.PHOTO_NOT_FOUND", lang) });
    }
});