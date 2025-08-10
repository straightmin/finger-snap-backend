/**
 * 마스터 시드 스크립트 - epiksode 샘플데이터 생성
 * 
 * Phase 3 프론트엔드 API 연동을 위한 충분하고 다양한 샘플 데이터를 생성합니다.
 * 
 * 실행 순서:
 * 1. Users (패스워드 해싱)
 * 2. Photos (썸네일 자동 생성)
 * 3. Follows (팔로우 관계)
 * 4. Likes (참여도 분산)
 * 5. Comments (대댓글 포함)
 * 6. Series (사진 묶기)
 * 7. Collections (북마크)
 * 8. Notifications (자동 트리거)
 */

import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seeders/users.seeder.js'
import { seedPhotos } from './seeders/photos.seeder.js'
import { seedFollows } from './seeders/follows.seeder.js'
import { seedLikes } from './seeders/likes.seeder.js'
import { seedComments } from './seeders/comments.seeder.js'
import { seedSeries } from './seeders/series.seeder.js'
import { seedCollections } from './seeders/collections.seeder.js'
import { seedNotifications } from './seeders/notifications.seeder.js'
import { logStep, logSuccess, logError } from './utils/logger.js'

const prisma = new PrismaClient()

async function main() {
    try {
        logStep('🚀 epiksode 샘플데이터 생성 시작')
        
        // 기존 데이터 정리 (개발 환경에서만)
        if (process.env.NODE_ENV !== 'production') {
            await cleanupExistingData()
        }
        
        // 1. Users 생성
        logStep('👥 사용자 데이터 생성 중...')
        const users = await seedUsers(prisma)
        logSuccess(`✅ 사용자 ${users.length}명 생성 완료`)
        
        // 2. Photos 생성  
        logStep('📸 사진 데이터 생성 중...')
        const photos = await seedPhotos(prisma, users)
        logSuccess(`✅ 사진 ${photos.length}장 생성 완료`)
        
        // 3. Follow 관계 생성
        logStep('👥 팔로우 관계 생성 중...')
        const follows = await seedFollows(prisma, users)
        logSuccess(`✅ 팔로우 관계 ${follows.length}개 생성 완료`)
        
        // 4. Likes 생성
        logStep('❤️ 좋아요 데이터 생성 중...')
        const likes = await seedLikes(prisma, users, photos)
        logSuccess(`✅ 좋아요 ${likes.length}개 생성 완료`)
        
        // 5. Comments 생성
        logStep('💬 댓글 데이터 생성 중...')
        const comments = await seedComments(prisma, users, photos)
        logSuccess(`✅ 댓글 ${comments.length}개 생성 완료`)
        
        // 6. Series 생성
        logStep('📁 시리즈 데이터 생성 중...')
        const series = await seedSeries(prisma, users, photos)
        logSuccess(`✅ 시리즈 ${series.length}개 생성 완료`)
        
        // 7. Collections 생성
        logStep('🔖 컬렉션 데이터 생성 중...')
        const collections = await seedCollections(prisma, users, photos)
        logSuccess(`✅ 컬렉션 ${collections.length}개 생성 완료`)
        
        // 8. Notifications 생성
        logStep('🔔 알림 데이터 생성 중...')
        const notifications = await seedNotifications(prisma, {
            users, photos, likes, follows, comments
        })
        logSuccess(`✅ 알림 ${notifications.length}개 생성 완료`)
        
        // 결과 요약
        await printSummary()
        
        logSuccess('🎉 샘플데이터 생성 완료!')
        logStep('📋 데이터 검증을 위해 다음 명령어를 실행하세요:')
        logStep('   npm run seed:verify')
        
    } catch (error) {
        logError('❌ 시드 데이터 생성 실패:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function cleanupExistingData() {
    logStep('🧹 기존 데이터 정리 중...')
    
    // 의존성 순서에 따라 역순으로 삭제
    await prisma.notification.deleteMany()
    await prisma.collectionPhoto.deleteMany()
    await prisma.collection.deleteMany()
    await prisma.seriesPhoto.deleteMany()
    await prisma.series.deleteMany()
    await prisma.like.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.follow.deleteMany()
    await prisma.photo.deleteMany()
    await prisma.user.deleteMany()
    
    logSuccess('✅ 기존 데이터 정리 완료')
}

async function printSummary() {
    logStep('📊 생성된 데이터 요약:')
    
    const counts = await Promise.all([
        prisma.user.count(),
        prisma.photo.count(),
        prisma.like.count(),
        prisma.comment.count(),
        prisma.follow.count(),
        prisma.series.count(),
        prisma.collection.count(),
        prisma.notification.count()
    ])
    
    console.log(`
📋 데이터 생성 결과:
├── 👥 사용자: ${counts[0]}명
├── 📸 사진: ${counts[1]}장  
├── ❤️ 좋아요: ${counts[2]}개
├── 💬 댓글: ${counts[3]}개
├── 👥 팔로우: ${counts[4]}개
├── 📁 시리즈: ${counts[5]}개
├── 🔖 컬렉션: ${counts[6]}개
└── 🔔 알림: ${counts[7]}개
    `)
}

// 직접 실행 시 (Windows 경로 호환)
const scriptPath = process.argv[1]
const currentFile = new URL(import.meta.url).pathname
const isDirectExecution = scriptPath === currentFile || 
                         scriptPath === currentFile.slice(1) || // Windows: remove leading slash
                         scriptPath.replace(/\\/g, '/') === currentFile.slice(1)

if (isDirectExecution) {
    main().catch((e) => {
        console.error(e)
        process.exit(1)
    })
}

export { main as seedAll }