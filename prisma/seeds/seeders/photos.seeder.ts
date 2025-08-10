/**
 * 사진 데이터 시더
 * 썸네일 자동 생성 및 메타데이터 설정
 */

import { PrismaClient, User, Photo } from '@prisma/client'
import { photosData } from '../data/photos.data.js'
import { logProgress } from '../utils/logger.js'

export async function seedPhotos(prisma: PrismaClient, users: User[]): Promise<Photo[]> {
    const photos: Photo[] = []
    
    for (let i = 0; i < photosData.length; i++) {
        const photoData = photosData[i]
        const user = users[photoData.userIndex]
        
        logProgress(i + 1, photosData.length, `사진 ${photoData.title}`)
        
        // 업로드 날짜 계산
        const uploadDate = new Date()
        uploadDate.setDate(uploadDate.getDate() - photoData.daysAgo)
        
        // 썸네일 URL 생성 (원본 URL에 썸네일 파라미터 추가)
        const thumbnailUrl = generateThumbnailUrl(photoData.imageUrl)
        
        const photo = await prisma.photo.create({
            data: {
                userId: user.id,
                title: photoData.title,
                description: photoData.description,
                imageUrl: photoData.imageUrl,
                thumbnailUrl,
                viewCount: photoData.viewCount,
                isPublic: photoData.isPublic,
                createdAt: uploadDate,
                updatedAt: uploadDate
            }
        })
        
        photos.push(photo)
    }
    
    return photos
}

/**
 * Unsplash URL에서 썸네일 URL 생성
 * 원본: ?w=800&h=1200&fit=crop
 * 썸네일: ?w=300&h=300&fit=crop
 */
function generateThumbnailUrl(imageUrl: string): string {
    // URL에서 기존 파라미터 제거하고 썸네일 파라미터 추가
    const baseUrl = imageUrl.split('?')[0]
    return `${baseUrl}?w=300&h=300&fit=crop`
}