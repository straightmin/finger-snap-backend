/**
 * 시리즈 데이터 시더
 * 기존 사진들을 테마별로 묶어서 시리즈 생성
 * 요구사항: 2-3개 시리즈, 3-6장 per 시리즈
 */

import { PrismaClient, User, Photo, Series } from '@prisma/client'
import { logProgress } from '../utils/logger.js'

interface SeriesPlan {
    title: string
    description: string
    userId: number
    photoIds: number[]
    userIndex: number // users 배열에서의 인덱스 (로그용)
}

export async function seedSeries(
    prisma: PrismaClient, 
    users: User[], 
    photos: Photo[]
): Promise<Series[]> {
    const series: Series[] = []
    
    // 시리즈 계획 생성
    const seriesPlans = generateSeriesPlans(users, photos)
    
    for (let i = 0; i < seriesPlans.length; i++) {
        const plan = seriesPlans[i]
        
        logProgress(i + 1, seriesPlans.length, `시리즈 ${plan.title}`)
        
        // 시리즈 생성일 (가장 오래된 포함 사진의 업로드일 이후)
        const includedPhotos = photos.filter(p => plan.photoIds.includes(p.id))
        const oldestPhotoDate = includedPhotos
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
            .createdAt
        
        const seriesCreatedAt = getRandomDateAfter(oldestPhotoDate)
        
        // 커버 사진 선택 (포함된 사진 중 가장 인기 있는 사진)
        const coverPhoto = includedPhotos
            .sort((a, b) => b.viewCount - a.viewCount)[0]
        
        // 시리즈 생성
        const newSeries = await prisma.series.create({
            data: {
                userId: plan.userId,
                title: plan.title,
                description: plan.description,
                coverPhotoId: coverPhoto.id,
                isPublic: true,
                createdAt: seriesCreatedAt,
                updatedAt: seriesCreatedAt
            }
        })
        
        // SeriesPhoto 관계 생성 (순서 포함)
        for (let j = 0; j < plan.photoIds.length; j++) {
            await prisma.seriesPhoto.create({
                data: {
                    seriesId: newSeries.id,
                    photoId: plan.photoIds[j],
                    position: j,
                    createdAt: seriesCreatedAt
                }
            })
        }
        
        series.push(newSeries)
    }
    
    return series
}

/**
 * 시리즈 계획 생성
 * 각 사용자의 사진들을 테마별로 묶어서 시리즈 구성
 */
function generateSeriesPlans(users: User[], photos: Photo[]): SeriesPlan[] {
    const plans: SeriesPlan[] = []
    
    // 사용자별 사진 그룹핑
    const photosByUser = users.map((user, index) => ({
        user,
        userIndex: index,
        photos: photos.filter(p => p.userId === user.id)
    }))
    
    // nature_kim (index 0) - "지리산 일출 여행" 시리즈
    const natureUser = photosByUser[0]
    if (natureUser.photos.length >= 3) {
        // 조회수가 높은 순으로 4장 선택
        const topPhotos = natureUser.photos
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 4)
        
        plans.push({
            title: "지리산 일출 여행",
            description: "3박 4일 지리산 여행에서 만난 아름다운 일출들. 새벽마다 오르며 담은 소중한 순간들을 여러분과 나누고 싶습니다.",
            userId: natureUser.user.id,
            photoIds: topPhotos.map(p => p.id),
            userIndex: 0
        })
    }
    
    // city_park (index 1) - "서울 야경 컬렉션" 시리즈
    const cityUser = photosByUser[1]
    if (cityUser.photos.length >= 3) {
        // 최근 업로드된 순으로 3장 선택
        const recentPhotos = cityUser.photos
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 3)
        
        plans.push({
            title: "서울 야경 컬렉션",
            description: "밤이 되면 더욱 아름다워지는 서울의 모습들. 네온사인과 불빛이 만들어내는 도시의 낭만을 담았습니다.",
            userId: cityUser.user.id,
            photoIds: recentPhotos.map(p => p.id),
            userIndex: 1
        })
    }
    
    // star_jung (index 4) - "밤하늘 이야기" 시리즈 (인기 사용자이므로 시리즈 추가)
    const starUser = photosByUser[4]
    if (starUser.photos.length >= 3) {
        // 모든 사진 포함 (별과 밤하늘 테마)
        const allPhotos = starUser.photos
            .sort((a, b) => b.viewCount - a.viewCount) // 인기순으로 정렬
        
        plans.push({
            title: "밤하늘 이야기",
            description: "도시의 불빛을 벗어나 만나는 진짜 밤하늘. 별빛과 달빛이 들려주는 우주의 이야기를 사진으로 풀어냅니다.",
            userId: starUser.user.id,
            photoIds: allPhotos.map(p => p.id),
            userIndex: 4
        })
    }
    
    return plans
}

/**
 * 특정 날짜 이후의 랜덤한 날짜 생성
 */
function getRandomDateAfter(afterDate: Date): Date {
    const now = new Date()
    const timeDiff = now.getTime() - afterDate.getTime()
    
    if (timeDiff <= 0) {
        return new Date(afterDate.getTime() + Math.random() * 1000 * 60 * 60 * 24) // 1일 후
    }
    
    // 해당 날짜 이후부터 현재까지 중 랜덤한 시점
    const randomOffset = Math.random() * timeDiff
    return new Date(afterDate.getTime() + randomOffset)
}