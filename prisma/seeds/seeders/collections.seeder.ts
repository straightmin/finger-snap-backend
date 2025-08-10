/**
 * 컬렉션 데이터 시더
 * 사용자들의 북마크/저장된 사진 컬렉션 생성
 */

import { PrismaClient, User, Photo, Collection } from '@prisma/client'
import { logProgress } from '../utils/logger.js'

interface CollectionPlan {
    title: string
    description: string
    userId: number
    photoIds: number[]
    userIndex: number // 로그용
}

export async function seedCollections(
    prisma: PrismaClient,
    users: User[],
    photos: Photo[]
): Promise<Collection[]> {
    const collections: Collection[] = []
    
    // 컬렉션 계획 생성
    const collectionPlans = generateCollectionPlans(users, photos)
    
    for (let i = 0; i < collectionPlans.length; i++) {
        const plan = collectionPlans[i]
        
        logProgress(i + 1, collectionPlans.length, `컬렉션 ${plan.title}`)
        
        // 컬렉션 생성
        const collection = await prisma.collection.create({
            data: {
                userId: plan.userId,
                title: plan.title,
                description: plan.description,
                createdAt: getRandomDateInPast(30), // 최근 1개월 내 생성
                updatedAt: new Date()
            }
        })
        
        // CollectionPhoto 관계 생성
        for (const photoId of plan.photoIds) {
            await prisma.collectionPhoto.create({
                data: {
                    collectionId: collection.id,
                    photoId: photoId,
                    createdAt: getRandomDateInPast(20) // 최근 20일 내 추가
                }
            })
        }
        
        collections.push(collection)
    }
    
    return collections
}

/**
 * 컬렉션 계획 생성
 * 각 사용자가 관심 있어 할 만한 주제별로 다른 사용자들의 사진을 수집
 */
function generateCollectionPlans(users: User[], photos: Photo[]): CollectionPlan[] {
    const plans: CollectionPlan[] = []
    
    // 사용자별 사진 매핑
    const photosByUser = users.map((user, index) => ({
        user,
        userIndex: index,
        photos: photos.filter(p => p.userId === user.id)
    }))
    
    // nature_kim (0)의 컬렉션: "마음에 드는 풍경들"
    // 다른 사용자들의 자연/풍경 사진들을 수집
    const natureLoverPhotos = photos
        .filter(p => p.userId !== users[0].id) // 본인 사진 제외
        .filter(p => 
            p.title.includes('바다') || 
            p.title.includes('별') ||
            p.title.includes('숲') ||
            p.viewCount > 800 // 인기 사진
        )
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 6) // 상위 6장
    
    if (natureLoverPhotos.length >= 3) {
        plans.push({
            title: "마음에 드는 풍경들",
            description: "여행하면서 보고 싶은 아름다운 풍경들을 모아두는 컬렉션입니다.",
            userId: users[0].id,
            photoIds: natureLoverPhotos.map(p => p.id),
            userIndex: 0
        })
    }
    
    // city_park (1)의 컬렉션: "도시 감성 모음"  
    // 도시/밤/현대적인 느낌의 사진들
    const cityVibesPhotos = photos
        .filter(p => p.userId !== users[1].id)
        .filter(p => 
            p.title.includes('별') || 
            p.title.includes('도시') ||
            p.title.includes('밤') ||
            p.viewCount > 1000
        )
        .sort((a, b) => b.viewCount - a.viewCount)  
        .slice(0, 5)
    
    if (cityVibesPhotos.length >= 3) {
        plans.push({
            title: "도시 감성 모음",
            description: "도시 생활의 감성과 밤의 아름다움을 담은 사진들",
            userId: users[1].id,
            photoIds: cityVibesPhotos.map(p => p.id),
            userIndex: 1
        })
    }
    
    // forest_lee (2)의 컬렉션: "힐링 스팟"
    // 자연스럽고 평화로운 느낌의 사진들
    const healingPhotos = photos
        .filter(p => p.userId !== users[2].id)
        .filter(p => 
            p.title.includes('산') ||
            p.title.includes('바다') ||
            p.title.includes('새벽') ||
            p.description?.includes('평화') ||
            p.description?.includes('힐링') ||
            p.description?.includes('아름다')
        )
        .sort((a, b) => Math.random() - 0.5) // 랜덤 순서
        .slice(0, 4)
    
    if (healingPhotos.length >= 3) {
        plans.push({
            title: "힐링 스팟",
            description: "마음이 편안해지는 장소들을 모은 컬렉션",
            userId: users[2].id,
            photoIds: healingPhotos.map(p => p.id),
            userIndex: 2
        })
    }
    
    // sea_choi (3)의 컬렉션: "인상 깊은 순간들"
    // 조회수가 높은 인기 사진들 위주
    const impressivePhotos = photos
        .filter(p => p.userId !== users[3].id)
        .filter(p => p.viewCount > 500)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 7) // 많이 수집하는 성향
    
    if (impressivePhotos.length >= 3) {
        plans.push({
            title: "인상 깊은 순간들",  
            description: "많은 사람들이 공감한 아름다운 순간들을 저장해둡니다.",
            userId: users[3].id,
            photoIds: impressivePhotos.map(p => p.id),
            userIndex: 3
        })
    }
    
    // star_jung (4)의 컬렉션: "영감의 원천"
    // 다양한 스타일의 창작 영감이 될 만한 사진들
    const inspirationPhotos = photos
        .filter(p => p.userId !== users[4].id)
        .filter(p => 
            p.description?.includes('순간') ||
            p.description?.includes('아름다') ||
            p.description?.includes('감동') ||
            p.viewCount > 400
        )
        .sort((a, b) => Math.random() - 0.5)
        .slice(0, 5)
    
    if (inspirationPhotos.length >= 3) {
        plans.push({
            title: "영감의 원천",
            description: "사진 작업에 영감을 주는 다양한 스타일과 구도들",
            userId: users[4].id,
            photoIds: inspirationPhotos.map(p => p.id),
            userIndex: 4
        })
    }
    
    return plans
}

/**
 * 과거 N일 이내의 랜덤한 날짜 생성
 */
function getRandomDateInPast(maxDaysAgo: number): Date {
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const randomDaysAgo = Math.floor(Math.random() * maxDaysAgo)
    return new Date(now.getTime() - (randomDaysAgo * msPerDay))
}