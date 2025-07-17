// src/routes/collections.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';

import { createCollection, getUserCollections, getCollectionById, updateCollection, deleteCollection, addPhotoToCollection, removePhotoFromCollection } from '../controllers/collection.controller';

const router = Router();

// 새 컬렉션 생성 (POST /api/collections)
router.post('/', authenticateToken, createCollection);

// 내 모든 컬렉션 목록 조회 (GET /api/collections)
router.get('/', authenticateToken, getUserCollections);

// 특정 컬렉션 상세 조회 (GET /api/collections/:id)
router.get('/:id', authenticateToken, getCollectionById);

// 컬렉션 정보 수정 (PUT /api/collections/:id)
router.put('/:id', authenticateToken, updateCollection);

// 컬렉션 삭제 (DELETE /api/collections/:id)
router.delete('/:id', authenticateToken, deleteCollection);

// 컬렉션에 사진 추가 (POST /api/collections/:collectionId/photos/:photoId)
router.post('/:collectionId/photos/:photoId', authenticateToken, addPhotoToCollection);

// 컬렉션에서 사진 제거 (DELETE /api/collections/:collectionId/photos/:photoId)
router.delete('/:collectionId/photos/:photoId', authenticateToken, removePhotoFromCollection);

export default router;