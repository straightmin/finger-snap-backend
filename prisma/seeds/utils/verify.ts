/**
 * 샘플데이터 검증 유틸리티
 * Phase 3 프론트엔드 연동 준비도 확인
 */

import { PrismaClient } from '@prisma/client'
import { logStep, logSuccess, logError } from './logger.js'

const prisma = new PrismaClient()

interface VerificationResult {
    category: string
    checks: Array<{
        name: string
        passed: boolean
        expected?: number | string
        actual?: number | string
        message?: string
    }>
    passed: boolean
}

async function main() {
    try {
        logStep('🔍 샘플데이터 검증 시작')
        
        const results: VerificationResult[] = []
        
        // 1. 기본 데이터 수량 검증
        results.push(await verifyDataCounts())
        
        // 2. 데이터 품질 검증  
        results.push(await verifyDataQuality())
        
        // 3. 관계형 데이터 검증
        results.push(await verifyRelationships())
        
        // 4. API 연동 준비도 검증
        results.push(await verifyAPIReadiness())
        
        // 결과 출력
        printResults(results)
        
        // 전체 결과 평가
        const allPassed = results.every(result => result.passed)
        
        if (allPassed) {
            logSuccess('🎉 모든 검증 통과! Phase 3 연동 준비 완료')
        } else {
            logError('❌ 일부 검증 실패. 위의 오류를 확인하세요.')
            process.exit(1)
        }
        
    } catch (error) {
        logError('검증 중 오류 발생:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

/**
 * 기본 데이터 수량 검증
 */
async function verifyDataCounts(): Promise<VerificationResult> {
    const result: VerificationResult = {
        category: '📊 기본 데이터 수량',
        checks: [],
        passed: true
    }
    
    try {
        // 사용자 수 확인 (권장: 5명)
        const userCount = await prisma.user.count()
        result.checks.push({
            name: '사용자 수',
            passed: userCount >= 3,
            expected: '3명 이상 (권장: 5명)',
            actual: `${userCount}명`
        })
        
        // 사진 수 확인 (권장: 15-20장)
        const photoCount = await prisma.photo.count()
        result.checks.push({
            name: '사진 수',
            passed: photoCount >= 10,
            expected: '10장 이상 (권장: 15-20장)',
            actual: `${photoCount}장`
        })
        
        // 좋아요 수 확인 (적당한 참여도)
        const likeCount = await prisma.like.count()
        result.checks.push({
            name: '좋아요 수',
            passed: likeCount >= 20,
            expected: '20개 이상',
            actual: `${likeCount}개`
        })
        
        // 댓글 수 확인
        const commentCount = await prisma.comment.count()
        result.checks.push({
            name: '댓글 수',
            passed: commentCount >= 15,
            expected: '15개 이상',
            actual: `${commentCount}개`
        })
        
        // 팔로우 관계 확인
        const followCount = await prisma.follow.count()
        result.checks.push({
            name: '팔로우 관계',
            passed: followCount >= 8,
            expected: '8개 이상',
            actual: `${followCount}개`
        })
        
        // 시리즈 확인
        const seriesCount = await prisma.series.count()
        result.checks.push({
            name: '시리즈 수',
            passed: seriesCount >= 2,
            expected: '2개 이상',
            actual: `${seriesCount}개`
        })
        
        // 알림 확인
        const notificationCount = await prisma.notification.count()
        result.checks.push({
            name: '알림 수',
            passed: notificationCount >= 10,
            expected: '10개 이상',
            actual: `${notificationCount}개`
        })
        
    } catch (error) {
        result.checks.push({
            name: '데이터 수량 조회',
            passed: false,
            message: `오류: ${error}`
        })
    }
    
    result.passed = result.checks.every(check => check.passed)
    return result
}

/**
 * 데이터 품질 검증
 */
async function verifyDataQuality(): Promise<VerificationResult> {
    const result: VerificationResult = {
        category: '🔍 데이터 품질',
        checks: [],
        passed: true
    }
    
    try {
        // 사용자 프로필 완성도 확인
        const usersWithoutProfile = await prisma.user.count({
            where: {
                OR: [
                    { username: { equals: '' } },
                    { bio: null }
                ]
            }
        })
        result.checks.push({
            name: '사용자 프로필 완성도',
            passed: usersWithoutProfile === 0,
            expected: '모든 사용자',
            actual: `${usersWithoutProfile}명 불완전`
        })
        
        // 사진 메타데이터 확인
        const photosWithoutMetadata = await prisma.photo.count({
            where: {
                OR: [
                    { title: { equals: '' } },
                    { imageUrl: { equals: '' } },
                    { thumbnailUrl: { equals: '' } }
                ]
            }
        })
        result.checks.push({
            name: '사진 메타데이터 완성도',
            passed: photosWithoutMetadata === 0,
            expected: '모든 사진',
            actual: `${photosWithoutMetadata}장 불완전`
        })
        
        // 대댓글 관계 확인
        const totalComments = await prisma.comment.count()
        const repliesCount = await prisma.comment.count({
            where: { parentId: { not: null } }
        })
        const replyRatio = totalComments > 0 ? (repliesCount / totalComments) : 0
        
        result.checks.push({
            name: '대댓글 비율',
            passed: replyRatio >= 0.2 && replyRatio <= 0.5,
            expected: '20-50%',
            actual: `${Math.round(replyRatio * 100)}%`
        })
        
        // 팔로우 관계의 다양성 확인
        const mutualFollows = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM follows f1
            JOIN follows f2 ON f1.follower_id = f2.following_id 
            AND f1.following_id = f2.follower_id
        ` as Array<{ count: bigint }>
        
        const mutualCount = Number(mutualFollows[0]?.count || 0) / 2 // 쌍으로 계산되므로 /2
        result.checks.push({
            name: '상호 팔로우 존재',
            passed: mutualCount >= 2,
            expected: '2쌍 이상',
            actual: `${mutualCount}쌍`
        })
        
    } catch (error) {
        result.checks.push({
            name: '데이터 품질 검사',
            passed: false,
            message: `오류: ${error}`
        })
    }
    
    result.passed = result.checks.every(check => check.passed)
    return result
}

/**
 * 관계형 데이터 검증
 */
async function verifyRelationships(): Promise<VerificationResult> {
    const result: VerificationResult = {
        category: '🔗 관계형 데이터',
        checks: [],
        passed: true
    }
    
    try {
        // 좋아요-사진 관계 일관성
        const likesWithInvalidPhoto = await prisma.like.count({
            where: {
                photoId: { not: null },
                photo: null
            }
        })
        result.checks.push({
            name: '좋아요-사진 관계 일관성',
            passed: likesWithInvalidPhoto === 0,
            expected: '0개 오류',
            actual: `${likesWithInvalidPhoto}개 오류`
        })
        
        // 댓글-사진 관계 일관성
        const commentsWithInvalidPhoto = await prisma.comment.count({
            where: {
                photoId: { not: null },
                photo: null
            }
        })
        result.checks.push({
            name: '댓글-사진 관계 일관성',
            passed: commentsWithInvalidPhoto === 0,
            expected: '0개 오류',
            actual: `${commentsWithInvalidPhoto}개 오류`
        })
        
        // 시리즈-사진 관계 확인
        const seriesWithPhotos = await prisma.series.count({
            where: {
                photos: {
                    some: {}
                }
            }
        })
        const totalSeries = await prisma.series.count()
        
        result.checks.push({
            name: '시리즈-사진 연결',
            passed: seriesWithPhotos === totalSeries,
            expected: `${totalSeries}개 시리즈 모두`,
            actual: `${seriesWithPhotos}개 시리즈`
        })
        
        // 알림 다형성 관계 확인
        const notificationsWithValidRelation = await prisma.notification.count({
            where: {
                OR: [
                    { likeId: { not: null } },
                    { commentId: { not: null } },
                    { followId: { not: null } }
                ]
            }
        })
        const totalNotifications = await prisma.notification.count()
        
        result.checks.push({
            name: '알림 관계 연결',
            passed: notificationsWithValidRelation === totalNotifications,
            expected: `${totalNotifications}개 알림 모두`,
            actual: `${notificationsWithValidRelation}개 연결됨`
        })
        
    } catch (error) {
        result.checks.push({
            name: '관계형 데이터 검사',
            passed: false,
            message: `오류: ${error}`
        })
    }
    
    result.passed = result.checks.every(check => check.passed)
    return result
}

/**
 * API 연동 준비도 검증
 */
async function verifyAPIReadiness(): Promise<VerificationResult> {
    const result: VerificationResult = {
        category: '🚀 API 연동 준비도',
        checks: [],
        passed: true
    }
    
    try {
        // 사진 목록 API 데이터 충족성
        const photosForAPI = await prisma.photo.findMany({
            include: {
                author: {
                    select: { id: true, username: true, profileImageUrl: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            take: 10
        })
        
        result.checks.push({
            name: '사진 API 데이터 구조',
            passed: photosForAPI.length >= 10,
            expected: '10장 이상 완전한 데이터',
            actual: `${photosForAPI.length}장`
        })
        
        // 사용자 프로필 API 데이터
        const usersForAPI = await prisma.user.findMany({
            include: {
                _count: {
                    select: { 
                        photos: true, 
                        followers: true, 
                        following: true 
                    }
                }
            }
        })
        
        result.checks.push({
            name: '사용자 API 데이터 구조',
            passed: usersForAPI.length >= 3 && usersForAPI.every(u => u.username),
            expected: '3명 이상 완전한 프로필',
            actual: `${usersForAPI.length}명`
        })
        
        // 알림 API 데이터
        const notificationsForAPI = await prisma.notification.findMany({
            include: {
                actor: {
                    select: { id: true, username: true, profileImageUrl: true }
                },
                photo: {
                    select: { id: true, title: true, thumbnailUrl: true }
                }
            },
            take: 10
        })
        
        result.checks.push({
            name: '알림 API 데이터 구조',
            passed: notificationsForAPI.length >= 5,
            expected: '5개 이상 완전한 데이터',
            actual: `${notificationsForAPI.length}개`
        })
        
        // 다양한 참여도 분산 확인
        const photoEngagement = await prisma.photo.findMany({
            include: {
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        })
        
        const highEngagement = photoEngagement.filter(p => p._count.likes > 100).length
        const lowEngagement = photoEngagement.filter(p => p._count.likes < 10).length
        
        result.checks.push({
            name: '참여도 분산',
            passed: highEngagement >= 2 && lowEngagement >= 2,
            expected: '고참여도 2장+, 저참여도 2장+',
            actual: `고참여도 ${highEngagement}장, 저참여도 ${lowEngagement}장`
        })
        
    } catch (error) {
        result.checks.push({
            name: 'API 준비도 검사',
            passed: false,
            message: `오류: ${error}`
        })
    }
    
    result.passed = result.checks.every(check => check.passed)
    return result
}

/**
 * 검증 결과 출력
 */
function printResults(results: VerificationResult[]) {
    console.log('\n📋 검증 결과 요약:\n')
    
    for (const result of results) {
        const statusEmoji = result.passed ? '✅' : '❌'
        console.log(`${statusEmoji} ${result.category}`)
        
        for (const check of result.checks) {
            const checkEmoji = check.passed ? '  ✓' : '  ✗'
            console.log(`${checkEmoji} ${check.name}`)
            
            if (check.expected && check.actual) {
                console.log(`     예상: ${check.expected}, 실제: ${check.actual}`)
            }
            
            if (check.message) {
                console.log(`     ${check.message}`)
            }
        }
        console.log('')
    }
}

// 직접 실행 시
if (process.argv[1] === new URL(import.meta.url).pathname) {
    main().catch((e) => {
        console.error(e)
        process.exit(1)
    })
}