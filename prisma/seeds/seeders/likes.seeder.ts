/**
 * 좋아요 데이터 시더
 * 실제 요구사항의 좋아요 분산 패턴을 반영
 * - 인기 사진: 500-2000 좋아요
 * - 보통 사진: 50-500 좋아요  
 * - 새 사진: 0-50 좋아요
 */

import { PrismaClient, User, Photo, Like } from '@prisma/client'
import { logProgress } from '../utils/logger.js'

export async function seedLikes(prisma: PrismaClient, users: User[], photos: Photo[]): Promise<Like[]> {
    const likes: Like[] = []
    let totalLikesToCreate = 0
    
    // 1단계: 각 사진별 좋아요 수 계산 및 총계 산출
    const photoLikePlans = photos.map(photo => {
        const expectedLikes = calculateExpectedLikes(photo.viewCount, photo.createdAt)
        totalLikesToCreate += expectedLikes
        return {
            photo,
            expectedLikes
        }
    })
    
    let currentLikeIndex = 0
    
    // 2단계: 각 사진별로 좋아요 생성
    for (const plan of photoLikePlans) {
        const { photo, expectedLikes } = plan
        const photoLikes: Like[] = []
        
        // 좋아요할 사용자들 선택 (중복 방지)
        const likingUsers = selectLikingUsers(users, expectedLikes, photo.userId)
        
        // 좋아요 생성
        for (const user of likingUsers) {
            currentLikeIndex++
            logProgress(currentLikeIndex, totalLikesToCreate, `${photo.title}에 대한 좋아요`)
            
            // 좋아요 시점을 사진 업로드 이후 랜덤하게 설정
            const likedAt = getRandomDateAfter(photo.createdAt)
            
            const like = await prisma.like.create({
                data: {
                    userId: user.id,
                    photoId: photo.id,
                    createdAt: likedAt
                }
            })
            
            photoLikes.push(like)
            likes.push(like)
        }
    }
    
    return likes
}

/**
 * 사진의 조회수와 업로드 시점을 고려하여 예상 좋아요 수 계산
 */
function calculateExpectedLikes(viewCount: number, uploadDate: Date): number {
    const now = new Date()
    const daysOld = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 좋아요 비율: 조회수의 5-15% (최신 사진일수록 높은 비율)
    const ageMultiplier = Math.max(0.3, 1 - (daysOld / 100)) // 오래될수록 비율 감소
    const baseRatio = 0.05 + (Math.random() * 0.10) // 5-15%
    const adjustedRatio = baseRatio * ageMultiplier
    
    const expectedLikes = Math.floor(viewCount * adjustedRatio)
    
    // 최소 0개, 최대 실제 조회수의 20%로 제한
    return Math.min(expectedLikes, Math.floor(viewCount * 0.2))
}

/**
 * 좋아요할 사용자들 선택 (사진 작성자 제외, 중복 방지)
 */
function selectLikingUsers(users: User[], likesCount: number, photoAuthorId: number): User[] {
    // 사진 작성자를 제외한 사용자들
    const availableUsers = users.filter(user => user.id !== photoAuthorId)
    
    if (likesCount === 0) return []
    
    // 요청된 좋아요 수가 가능한 사용자 수보다 많으면 모든 사용자 선택
    if (likesCount >= availableUsers.length) {
        return availableUsers
    }
    
    // 랜덤하게 사용자 선택 (중복 없이)
    const shuffled = [...availableUsers].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, likesCount)
}

/**
 * 특정 날짜 이후의 랜덤한 날짜 생성
 */
function getRandomDateAfter(afterDate: Date): Date {
    const now = new Date()
    const timeDiff = now.getTime() - afterDate.getTime()
    
    if (timeDiff <= 0) {
        // 업로드 날짜가 현재보다 미래인 경우 (이론상 불가능하지만 안전장치)
        return new Date(afterDate.getTime() + Math.random() * 1000 * 60 * 60) // 1시간 이내
    }
    
    // 업로드 시점과 현재 시점 사이의 랜덤한 시점
    const randomOffset = Math.random() * timeDiff
    return new Date(afterDate.getTime() + randomOffset)
}