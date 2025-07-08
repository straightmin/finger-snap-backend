// src/services/photo.service.ts
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스를 생성합니다.
const prisma = new PrismaClient();

/**
 * 정렬 기준에 따라 사진 목록을 조회하는 서비스 함수
 * @param sortBy 정렬 기준 문자열 ('popular' 또는 그 외)
 * @returns 정렬된 사진 목록
 */
export const getPhotos = async (sortBy: string) => {
    // 'popular' (인기순)으로 정렬하는 경우
    if (sortBy === 'popular') {
        // 1. 'photo' 타입의 '좋아요'를 resourceId(사진 ID)로 그룹화하여 각 사진의 좋아요 수를 계산합니다.
        const popularPhotos = await prisma.like.groupBy({
            by: ['resourceId'],
            where: {
                resourceType: 'photo', // 'photo' 타입의 좋아요만 필터링
            },
            _count: {
                resourceId: true, // resourceId의 개수를 셉니다 (즉, 좋아요 수)
            },
            orderBy: {
                _count: {
                    resourceId: 'desc', // 좋아요 수가 많은 순서대로 내림차순 정렬
                },
            },
        });

        // 2. 인기순으로 정렬된 사진 ID 목록을 추출합니다.
        const photoIds = popularPhotos.map((p) => p.resourceId);

        // 3. 추출된 사진 ID 목록을 사용하여 해당 사진들의 전체 정보를 조회합니다.
        //    (이때, 사진 자체는 최신순으로 보여주는 것이 일반적이므로 createdAt으로 정렬)
        return prisma.photo.findMany({
            where: {
                id: {
                    in: photoIds, // 인기 있는 사진 ID 목록에 포함된 사진만 조회
                },
            },
            orderBy: {
                createdAt: 'desc', // 사진은 최신순으로 정렬
            },
        });
    } else {
        // 'latest' (최신순) 또는 그 외의 경우, 모든 사진을 최신순으로 정렬하여 반환합니다.
        return prisma.photo.findMany({
            orderBy: {
                createdAt: 'desc', // 생성일(createdAt) 기준으로 내림차순 정렬
            },
        });
    }
};

/**
 * 새로운 사진 데이터를 데이터베이스에 생성하는 서비스 함수
 * @param photoData 사진 생성에 필요한 데이터 (title, description, imageUrl, userId)
 * @returns 생성된 사진 객체
 */
export const createPhoto = async (photoData: {
  title?: string;
  description?: string;
  imageUrl: string;
  userId: number;
}) => {
  const { title, description, imageUrl, userId } = photoData;

  return prisma.photo.create({
    data: {
      title: title || 'Untitled',
      description: description || null,
      imageUrl,
      thumbnailUrl: imageUrl, // 우선 원본 이미지 URL을 썸네일로 사용
      userId,
    },
  });
};
