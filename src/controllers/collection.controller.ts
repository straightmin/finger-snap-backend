// src/controllers/collection.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as collectionService from '../services/collection.service';
import { getErrorMessage } from '../utils/messageMapper';
import { validateId } from '../utils/validation';
import { sendErrorResponse } from '../utils/response';

/**
 * 사진을 기본 컬렉션에 추가하거나 제거합니다.
 * @param req HTTP 요청 객체 (사진 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 컬렉션 추가/제거 결과
 */
export const toggleCollection = asyncHandler(async (req: Request, res: Response) => {
    const photoId = validateId(req.params.photoId);
    const userId = req.user!.id;

    if (!photoId) {
        return sendErrorResponse(res, 400, 'PHOTO.INVALID_ID', req.lang);
    }

    const result = await collectionService.togglePhotoInDefaultCollection(userId, photoId, req.lang || 'ko');
    res.status(200).json(result);
});

/**
 * 사용자의 기본 컬렉션에 있는 사진 목록을 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 컬렉션에 담긴 사진 목록
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
 * 새로운 컬렉션을 생성합니다.
 * @param req HTTP 요청 객체 (title, description 포함)
 * @param res HTTP 응답 객체
 * @returns 생성된 컬렉션 객체
 */
export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const userId = req.user!.id;

    if (!title) {
        res.status(400).json({ message: getErrorMessage('COLLECTION.TITLE_REQUIRED', req.lang) });
        return;
    }

    const collection = await collectionService.createCollection(userId, title, description);
    res.status(201).json(collection);
});

/**
 * 현재 로그인된 사용자의 모든 컬렉션 목록을 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 사용자의 모든 컬렉션 목록
 */
export const getUserCollections = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const collections = await collectionService.getUserCollections(userId);
    res.status(200).json(collections);
});

/**
 * 특정 컬렉션의 상세 정보를 조회합니다.
 * @param req HTTP 요청 객체 (컬렉션 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 컬렉션 상세 정보
 */
export const getCollectionById = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = validateId(req.params.id);
    const currentUserId = req.user?.id;

    if (!collectionId) {
        return sendErrorResponse(res, 400, 'COLLECTION.INVALID_ID', req.lang);
    }

    const collection = await collectionService.getCollectionDetails(collectionId, currentUserId);

    if (!collection) {
        return sendErrorResponse(res, 404, 'COLLECTION.NOT_FOUND', req.lang);
    }

    res.status(200).json(collection);
});

/**
 * 컬렉션 정보를 수정합니다.
 * @param req HTTP 요청 객체 (컬렉션 ID, title, description 포함)
 * @param res HTTP 응답 객체
 * @returns 수정된 컬렉션 객체
 */
export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = validateId(req.params.id);
    const { title, description } = req.body;
    const userId = req.user!.id;

    if (!collectionId) {
        return sendErrorResponse(res, 400, 'COLLECTION.INVALID_ID', req.lang);
    }

    if (!title) {
        return sendErrorResponse(res, 400, 'COLLECTION.TITLE_REQUIRED', req.lang);
    }

    const collection = await collectionService.getCollectionDetails(collectionId);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage('COLLECTION.NOT_FOUND', req.lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage('COLLECTION.UNAUTHORIZED_UPDATE', req.lang) });
        return;
    }

    const updatedCollection = await collectionService.updateCollection(collectionId, title, description);
    res.status(200).json(updatedCollection);
});

/**
 * 컬렉션을 삭제합니다.
 * @param req HTTP 요청 객체 (컬렉션 ID 포함)
 * @param res HTTP 응답 객체
 */
export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    if (isNaN(collectionId)) {
        res.status(400).json({ message: getErrorMessage('COLLECTION.INVALID_ID', req.lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionId);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage('COLLECTION.NOT_FOUND', req.lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage('COLLECTION.UNAUTHORIZED_DELETE', req.lang) });
        return;
    }

    await collectionService.deleteCollection(collectionId);
    res.status(204).send();
});

/**
 * 컬렉션에 사진을 추가합니다.
 * @param req HTTP 요청 객체 (컬렉션 ID, 사진 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 추가된 사진 정보
 */
export const addPhotoToCollection = asyncHandler(async (req: Request, res: Response) => {
    const { collectionId, photoId } = req.params;
    const userId = req.user!.id;

    const collectionIdNum = parseInt(collectionId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(collectionIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage('GLOBAL.INVALID_ID', req.lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionIdNum);

    if (!collection) {
        res.status(404).json({ message: getErrorMessage('COLLECTION.NOT_FOUND', req.lang) });
        return;
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage('COLLECTION.UNAUTHORIZED_ADD_PHOTO', req.lang) });
        return;
    }

    const result = await collectionService.addPhotoToCollection(collectionIdNum, photoIdNum);

    if (!result) {
        res.status(409).json({ message: getErrorMessage('COLLECTION.PHOTO_ALREADY_EXISTS', req.lang) });
        return;
    }

    res.status(201).json(result);
});

/**
 * 컬렉션에서 사진을 제거합니다.
 * @param req HTTP 요청 객체 (컬렉션 ID, 사진 ID 포함)
 * @param res HTTP 응답 객체
 */
export const removePhotoFromCollection = asyncHandler(async (req: Request, res: Response) => {
    const { collectionId, photoId } = req.params;
    const userId = req.user!.id;

    const collectionIdNum = parseInt(collectionId, 10);
    const photoIdNum = parseInt(photoId, 10);

    if (isNaN(collectionIdNum) || isNaN(photoIdNum)) {
        res.status(400).json({ message: getErrorMessage('GLOBAL.INVALID_ID', req.lang) });
        return;
    }

    const collection = await collectionService.getCollectionDetails(collectionIdNum);

    if (!collection) {
        return sendErrorResponse(res, 404, 'COLLECTION.NOT_FOUND', req.lang);
    }

    if (collection.userId !== userId) {
        res.status(403).json({ message: getErrorMessage('COLLECTION.UNAUTHORIZED_REMOVE_PHOTO', req.lang) });
        return;
    }

    try {
        await collectionService.removePhotoFromCollection(collectionIdNum, photoIdNum);
        res.status(204).send();
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Prisma의 P2025 코드는 레코드를 찾지 못했을 때 발생합니다.
        res.status(404).json({ message: getErrorMessage('COLLECTION.PHOTO_NOT_FOUND', req.lang) });
    }
});