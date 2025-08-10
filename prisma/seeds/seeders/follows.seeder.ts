/**
 * 팔로우 관계 시더
 * 상호 팔로우 및 일방향 팔로우 관계 생성
 */

import { PrismaClient, User, Follow } from '@prisma/client'
import { logProgress } from '../utils/logger.js'

export async function seedFollows(prisma: PrismaClient, users: User[]): Promise<Follow[]> {
    const follows: Follow[] = []
    
    // 팔로우 관계 패턴 정의
    const followPatterns = generateFollowPatterns(users)
    
    for (let i = 0; i < followPatterns.length; i++) {
        const pattern = followPatterns[i]
        
        logProgress(i + 1, followPatterns.length, `${pattern.followerName} → ${pattern.followingName}`)
        
        // 팔로우 생성일을 과거 랜덤 날짜로 설정
        const followDate = getRandomDateInPast(60) // 최근 2개월 내
        
        const follow = await prisma.follow.create({
            data: {
                followerId: pattern.followerId,
                followingId: pattern.followingId,
                createdAt: followDate
            }
        })
        
        follows.push(follow)
    }
    
    return follows
}

interface FollowPattern {
    followerId: number
    followingId: number
    followerName: string
    followingName: string
}

/**
 * 실제 사용자 수와 인덱스에 맞춘 팔로우 패턴 생성
 * - 상호 팔로우: 2-3쌍
 * - 일방향 팔로우: 각 사용자별 2-4명
 * - 인기 사용자: 더 많은 팔로워
 */
function generateFollowPatterns(users: User[]): FollowPattern[] {
    const patterns: FollowPattern[] = []
    
    // 사용자 이름 매핑 (로그용)
    const userNames = [
        'nature_kim',   // users[0]
        'city_park',    // users[1] 
        'forest_lee',   // users[2]
        'sea_choi',     // users[3]
        'star_jung'     // users[4]
    ]
    
    // 상호 팔로우 관계
    const mutualFollows = [
        { follower: 0, following: 1 }, // nature_kim ↔ city_park
        { follower: 1, following: 0 },
        
        { follower: 2, following: 3 }, // forest_lee ↔ sea_choi  
        { follower: 3, following: 2 },
        
        { follower: 0, following: 4 }, // nature_kim ↔ star_jung
        { follower: 4, following: 0 }
    ]
    
    // 일방향 팔로우 관계
    const oneWayFollows = [
        // star_jung(4)을 인기 사용자로 설정 - 많은 팔로워
        { follower: 1, following: 4 }, // city_park → star_jung
        { follower: 2, following: 4 }, // forest_lee → star_jung  
        { follower: 3, following: 4 }, // sea_choi → star_jung
        
        // nature_kim(0)도 인기 사용자
        { follower: 2, following: 0 }, // forest_lee → nature_kim
        { follower: 3, following: 0 }, // sea_choi → nature_kim
        
        // 기타 일방향 팔로우
        { follower: 0, following: 2 }, // nature_kim → forest_lee
        { follower: 1, following: 3 }, // city_park → sea_choi
        { follower: 4, following: 2 }, // star_jung → forest_lee
        { follower: 4, following: 3 }  // star_jung → sea_choi
    ]
    
    // 패턴 생성
    const allFollows = mutualFollows.concat(oneWayFollows)
    allFollows.forEach(follow => {
        patterns.push({
            followerId: users[follow.follower].id,
            followingId: users[follow.following].id,
            followerName: userNames[follow.follower],
            followingName: userNames[follow.following]
        })
    })
    
    return patterns
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